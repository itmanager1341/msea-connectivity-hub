/// <reference lib="deno.ns" />

// Import required dependencies for serving HTTP requests and Supabase client
// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers to allow cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const HUBSPOT_API_KEY = Deno.env.get('HUBSPOT_API_KEY')
    if (!HUBSPOT_API_KEY) {
      throw new Error('HUBSPOT_API_KEY is not set')
    }

    const { memberIds, direction = 'from_hubspot' } = await req.json()
    console.log(`Starting HubSpot sync process... Direction: ${direction}, Member IDs:`, memberIds)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (direction === 'to_hubspot') {
      // Sync from Supabase to HubSpot
      console.log('Fetching profiles from Supabase...');
      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .in('Record ID', memberIds);

      if (fetchError) {
        console.error('Error fetching profiles:', fetchError);
        throw fetchError;
      }

      console.log('Profiles fetched:', profiles);

      if (!profiles || profiles.length === 0) {
        throw new Error('No profiles found to update in HubSpot');
      }

      interface SyncResult {
        id: number;
        success: boolean;
      }
      const results: SyncResult[] = [];
      
      for (const profile of profiles) {
        console.log(`Updating HubSpot contact for Record ID: ${profile['Record ID']}`);
        
        // Update contact in HubSpot using list-based API
        const response = await fetch(
          `https://api.hubapi.com/contacts/v1/contact/vid/${profile['Record ID']}/profile`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              properties: [
                { property: 'firstname', value: profile['First Name'] },
                { property: 'lastname', value: profile['Last Name'] },
                { property: 'company', value: profile['Company Name'] },
                { property: 'phone', value: profile['Phone Number'] },
                { property: 'linkedin', value: profile['LinkedIn'] }
              ]
            })
          }
        );

        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          // If response isn't JSON, get the text
          responseData = await response.text();
        }
        
        console.log(`HubSpot API response for ${profile['Record ID']}:`, responseData);

        if (!response.ok) {
          // Don't throw error, just log it and continue with other updates
          console.error(`Failed to update HubSpot contact ${profile['Record ID']}: ${JSON.stringify(responseData)}`);
          continue;
        }

        // Verify the contact is still in the MSEA list
        const listResponse = await fetch(
          `https://api.hubapi.com/contacts/v1/lists/3190/contacts/all?count=1&vidOffset=${profile['Record ID']}`,
          {
            headers: {
              'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
              'Content-Type': 'application/json',
            }
          }
        );

        const listData = await listResponse.json();
        if (!listData.contacts?.some(c => c.vid === profile['Record ID'])) {
          console.warn(`Contact ${profile['Record ID']} is not in the MSEA list anymore`);
          continue;
        }

        results.push({ id: profile['Record ID'], success: true });
      }

      console.log('Successfully updated all contacts in HubSpot');

      return new Response(
        JSON.stringify({
          success: true,
          summary: {
            updated: results.length,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Sync from HubSpot to Supabase
      console.log('Starting sync from HubSpot to Supabase...');

      // Set up timeout for the HubSpot API request
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 25000)

      try {
        const allContacts = []
        let hasMore = true
        let offset = 0
        const count = 100 // Increased page size for efficiency

        // Fetch all contacts with pagination
        while (hasMore) {
          console.log(`Fetching contacts page with offset ${offset}...`)
          const propertyParams = [
            'firstname',
            'lastname',
            'email',
            'company',
            'phone',
            'jobtitle',
            'membership',
            'industry',
            'state',
            'city',
            'bio',
            'linkedin'
          ].map(prop => `property=${prop}`).join('&');
          
          const hubspotResponse = await fetch(
            `https://api.hubapi.com/contactslistseg/v1/lists/3190/contacts/all?${propertyParams}&count=${count}&vidOffset=${offset}`,
            {
              headers: {
                'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal
            }
          )

          if (!hubspotResponse.ok) {
            const errorText = await hubspotResponse.text()
            console.error('HubSpot API error response:', errorText)
            throw new Error(`HubSpot API error: ${hubspotResponse.statusText}. Details: ${errorText}`)
          }

          const hubspotData = await hubspotResponse.json()
          allContacts.push(...(hubspotData.contacts || []))
          
          // Check if there are more contacts to fetch
          hasMore = hubspotData['has-more']
          offset = hubspotData['vid-offset']

          console.log(`Received ${hubspotData.contacts?.length || 0} contacts in this page`)
          
          if (!hasMore) {
            console.log('No more contacts to fetch')
            break
          }
        }

        console.log('Total number of contacts received:', allContacts.length)

        clearTimeout(timeout)

        // Get existing profiles from Supabase
        const { data: existingProfiles, error: fetchError } = await supabase
          .from('profiles')
          .select('*')

        if (fetchError) {
          throw new Error(`Failed to fetch existing profiles: ${fetchError.message}`)
        }

        console.log('Number of existing profiles:', existingProfiles?.length || 0)

        // Create a map of existing profiles for quick lookup
        const existingProfilesMap = new Map(
          existingProfiles?.map(profile => [profile['Record ID'], profile]) || []
        )

        const updates = []
        const inserts = []
        let updatedCount = 0
        let insertedCount = 0

        // Create a set of current HubSpot contact IDs
        const currentHubspotIds = new Set(allContacts.map(c => parseInt(c.vid)))

        // Process all contacts from HubSpot
        for (const contact of allContacts) {
          const properties = contact.properties
          
          // Get primary email
          const primaryEmail = contact['identity-profiles']?.[0]?.identities?.find(
            (identity: any) => identity.type === 'EMAIL' && identity['is-primary']
          )?.value || properties.email?.value

          // Prepare profile data
          const profileData = {
            'Record ID': parseInt(contact.vid),
            'First Name': properties.firstname?.value,
            'Last Name': properties.lastname?.value,
            'Full Name': `${properties.firstname?.value || ''} ${properties.lastname?.value || ''}`.trim(),
            'Company Name': properties.company?.value,
            'Membership': properties.membership?.value,
            'Email': primaryEmail,
            'Job Title': properties.jobtitle?.value,
            'Phone Number': properties.phone?.value,
            'Industry': properties.industry?.value,
            'State/Region': properties.state?.value,
            'City': properties.city?.value,
            'Email Domain': primaryEmail ? primaryEmail.split('@')[1] : null,
            'Bio': properties.bio?.value,
            'LinkedIn': properties.linkedin?.value,
            'active': true  // All contacts in MSEA list are active
          }

          // Update or insert based on whether the profile exists
          if (existingProfilesMap.has(parseInt(contact.vid))) {
            updates.push(profileData)
            updatedCount++
          } else {
            inserts.push(profileData)
            insertedCount++
          }
        }

        // Find profiles to mark as inactive (those not in current HubSpot list)
        const inactiveUpdates = existingProfiles
          ?.filter(profile => !currentHubspotIds.has(profile['Record ID']) && profile.active)
          .map(profile => ({
            'Record ID': profile['Record ID'],
            'active': false
          })) || []

        console.log(`Processing ${updates.length} updates, ${inserts.length} inserts, and ${inactiveUpdates.length} inactive updates`)

        // Process database operations in batches
        const batchSize = 50
        const batchOperations = []

        // Process updates
        for (let i = 0; i < updates.length; i += batchSize) {
          const batch = updates.slice(i, i + batchSize)
          batchOperations.push(
            supabase
              .from('profiles')
              .upsert(batch)
          )
        }

        // Process inserts
        for (let i = 0; i < inserts.length; i += batchSize) {
          const batch = inserts.slice(i, i + batchSize)
          batchOperations.push(
            supabase
              .from('profiles')
              .insert(batch)
          )
        }

        // Process inactive updates
        for (let i = 0; i < inactiveUpdates.length; i += batchSize) {
          const batch = inactiveUpdates.slice(i, i + batchSize)
          batchOperations.push(
            supabase
              .from('profiles')
              .upsert(batch)
          )
        }

        // Execute all database operations
        const results = await Promise.all(batchOperations)

        // Check for errors
        const errors = results.filter(result => result.error)
        if (errors.length > 0) {
          console.error('Database operation errors:', errors)
          throw new Error(`Database operation errors: ${JSON.stringify(errors)}`)
        }

        console.log('Sync completed successfully')
        return new Response(
          JSON.stringify({
            success: true,
            summary: {
              updated: updatedCount,
              inserted: insertedCount,
              deactivated: inactiveUpdates.length
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )

      } catch (error) {
        clearTimeout(timeout)
        throw error
      }
    }

  } catch (error) {
    console.error('Error in sync-hubspot function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
