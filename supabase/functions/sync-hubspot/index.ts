import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface HubSpotContact {
  vid: number;
  properties: Record<string, any>;
  identities: any[];
}

interface HubSpotResponse {
  contacts: HubSpotContact[];
  'has-more': boolean;
  'vid-offset': number;
}

interface SyncResult {
  id: number;
  success: boolean;
}

interface Profile {
  record_id: number;
  'First Name'?: string;
  'Last Name'?: string;
  'Full Name': string;
  'Company Name'?: string;
  'Membership'?: string;
  'Email': string;
  'Job Title'?: string;
  'Phone Number'?: string;
  'Industry'?: string;
  'State/Region'?: string;
  'City'?: string;
  'Email Domain'?: string | null;
  'Bio'?: string;
  'LinkedIn'?: string;
  'Headshot'?: string;
  'active': boolean;
}

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (direction === 'to_hubspot') {
      try {
        // 1. First verify these records exist in our active list
        const propertyParams = [
          'firstname', 'lastname', 'email', 'company', 
          'phone', 'jobtitle', 'industry', 'state', 
          'city', 'bio', 'linkedin'
        ].map(prop => `property=${prop}`).join('&');

        // Get the active members list first
        const hubspotResponse = await fetch(
          `https://api.hubapi.com/contactslistseg/v1/lists/3190/contacts/all?${propertyParams}`,
          {
            headers: {
              'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
              'Content-Type': 'application/json',
            }
          }
        );

        if (!hubspotResponse.ok) {
          throw new Error(`Failed to fetch active members: ${await hubspotResponse.text()}`);
        }

        const hubspotData = await hubspotResponse.json();
        const activeVids = new Set(hubspotData.contacts.map(c => parseInt(c.vid)));

        // 2. Get profiles to update from Supabase
        const { data: profiles, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .in('record_id', memberIds)
          .filter('record_id', 'in', `(${Array.from(activeVids).join(',')})`);

        if (fetchError) throw fetchError;
        if (!profiles?.length) {
          throw new Error('No active profiles found to update');
        }

        const results = [];
        
        // 3. Update only active members
        for (const profile of profiles) {
          try {
            const properties = [
              { property: 'firstname', value: profile['First Name'] },
              { property: 'lastname', value: profile['Last Name'] },
              { property: 'company', value: profile['Company Name'] },
              { property: 'phone', value: profile['Phone Number'] },
              { property: 'jobtitle', value: profile['Job Title'] },
              { property: 'industry', value: profile['Industry'] },
              { property: 'state', value: profile['State/Region'] },
              { property: 'city', value: profile['City'] },
              { property: 'bio', value: profile['Bio'] },
              { property: 'linkedin', value: profile['LinkedIn'] }
            ];

            const response = await fetch(
              `https://api.hubapi.com/contacts/v1/contact/vid/${profile.record_id}/profile`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ properties })
              }
            );

            if (!response.ok) {
              throw new Error(`HubSpot update failed: ${await response.text()}`);
            }

            results.push({ id: profile.record_id, success: true });
            console.log(`Successfully updated HubSpot contact VID ${profile.record_id}`);
          } catch (error) {
            console.error(`Failed to update HubSpot contact VID ${profile.record_id}:`, error);
            results.push({ id: profile.record_id, success: false });
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            summary: {
              updated: results.filter(r => r.success).length,
              failed: results.filter(r => !r.success).length
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Sync error:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        );
      }
    } else {
      // Sync from HubSpot to Supabase
      console.log('Starting sync from HubSpot to Supabase...');

      // Set up timeout for the HubSpot API request
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 25000)

      try {
        const allContacts: HubSpotContact[] = [];
        let hasMore = true;
        let offset = 0;
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
            'linkedin',
            'headshot'
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

        const updates: Profile[] = [];
        const inserts: Profile[] = [];
        let updatedCount = 0;
        let insertedCount = 0;

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
          const profileData: Profile = {
            record_id: parseInt(contact.vid),
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
            'Headshot': properties.headshot?.value,
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
