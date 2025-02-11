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

        // If we're syncing specific members, just get those
        if (memberIds && memberIds.length > 0) {
          console.log('Syncing specific members:', memberIds);
          for (const memberId of memberIds) {
            const propertyParams = [
              'firstname', 'lastname', 'email', 'company', 
              'phone', 'jobtitle', 'industry', 'state', 
              'city', 'bio', 'linkedin', 'headshot',
              'membership'
            ].map(prop => `property=${prop}`).join('&');
            
            // Changed endpoint and method for fetching single contact
            const hubspotResponse = await fetch(
              `https://api.hubapi.com/contactslistseg/v1/lists/3190/contacts/all?${propertyParams}&count=100&vidOffset=0&property=vid&vid=${memberId}`,
              {
                method: 'GET',
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

            const response = await hubspotResponse.json()
            if (response.contacts && response.contacts.length > 0) {
              allContacts.push(...response.contacts)
            } else {
              console.log(`No contact found for ID ${memberId} in active members list`)
            }
          }
        } else {
          // Fetch all contacts with pagination for full sync
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
        }

        console.log('Total number of contacts received:', allContacts.length)
        clearTimeout(timeout)

        // Get existing profiles from Supabase
        const { data: existingProfiles, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .in('record_id', memberIds || []) // Only fetch relevant profiles

        if (fetchError) {
          throw new Error(`Failed to fetch existing profiles: ${fetchError.message}`)
        }

        console.log('Number of existing profiles:', existingProfiles?.length || 0)

        // Create a map of existing profiles for quick lookup
        const existingProfilesMap = new Map(
          existingProfiles?.map(profile => [profile.record_id, profile]) || []
        )

        const updates: Profile[] = []
        const inserts: Profile[] = []
        let updatedCount = 0
        let insertedCount = 0

        // Process each contact from HubSpot
        for (const contact of allContacts) {
          const vid = parseInt(contact.vid || contact.vid)
          const props = contact.properties

          const profile: Profile = {
            record_id: vid,
            "First Name": props.firstname?.value || '',
            "Last Name": props.lastname?.value || '',
            "Full Name": `${props.firstname?.value || ''} ${props.lastname?.value || ''}`.trim(),
            "Company Name": props.company?.value || '',
            "Job Title": props.jobtitle?.value || '',
            "Phone Number": props.phone?.value || '',
            "Industry": props.industry?.value || '',
            "State/Region": props.state?.value || '',
            "City": props.city?.value || '',
            "Email": props.email?.value || '',
            "Bio": props.bio?.value || '',
            "LinkedIn": props.linkedin?.value || '',
            "Headshot": props.headshot?.value || '',
            "Member Since Date": null,
            "Create Date": null,
            "Email Domain": null,
            "Profession - FSI": null,
            "Membership": props.membership?.value || '',
            active: true // Always set to true since we're only getting active members
          }

          if (existingProfilesMap.has(vid)) {
            updates.push(profile)
            updatedCount++
          } else {
            inserts.push(profile)
            insertedCount++
          }
        }

        // Only check for inactive profiles during a full sync
        let inactiveUpdates: any[] = [];
        if (!memberIds || memberIds.length === 0) {
          // Create a set of current HubSpot contact IDs
          const currentHubspotIds = new Set(allContacts.map(c => parseInt(c.vid)))
          console.log('Full sync - checking for inactive members...');
          
          // Find profiles to mark as inactive (those not in current HubSpot list)
          inactiveUpdates = existingProfiles
            ?.filter(profile => {
              const isNotInHubspot = !currentHubspotIds.has(profile.record_id)
              const isCurrentlyActive = profile.active
              console.log(`Profile ${profile.record_id}: in HubSpot? ${!isNotInHubspot}, active? ${isCurrentlyActive}`)
              return isNotInHubspot && isCurrentlyActive
            })
            .map(profile => ({
              record_id: profile.record_id,
              active: false
            })) || []

          console.log(`Found ${inactiveUpdates.length} profiles to mark as inactive:`, inactiveUpdates)
        }

        // Process database operations in batches
        const batchSize = 50;
        const batchOperations = [];

        // Process updates - using upsert instead of separate update/insert
        const allProfiles = [...updates, ...inserts];
        for (let i = 0; i < allProfiles.length; i += batchSize) {
          const batch = allProfiles.slice(i, i + batchSize);
          console.log(`Processing batch of ${batch.length} profiles...`);
          batchOperations.push(
            supabase
              .from('profiles')
              .upsert(batch, {
                onConflict: 'record_id',
                ignoreDuplicates: false
              })
          );
        }

        // Process inactive updates
        for (let i = 0; i < inactiveUpdates.length; i += batchSize) {
          const batch = inactiveUpdates.slice(i, i + batchSize);
          console.log(`Processing batch of ${batch.length} inactive profiles:`, batch);
          batchOperations.push(
            supabase
              .from('profiles')
              .upsert(batch, {
                onConflict: 'record_id',
                ignoreDuplicates: false
              })
          );
        }

        // Execute all database operations
        const results = await Promise.all(batchOperations);

        // Check for errors
        const errors = results.filter(result => result.error);
        if (errors.length > 0) {
          console.error('Database operation errors:', errors);
          throw new Error(`Database operation errors: ${JSON.stringify(errors)}`);
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
