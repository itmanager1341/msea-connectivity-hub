
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface HubSpotMembership {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    company?: string;
    jobtitle?: string;
    phone?: string;
    industry?: string;
    state?: string;
    city?: string;
    bio?: string;
    linkedin?: string;
    headshot?: string;
    membership?: string;
  };
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

interface HubSpotContact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    company?: string;
    jobtitle?: string;
    phone?: string;
    industry?: string;
    state?: string;
    city?: string;
    bio?: string;
    linkedin?: string;
    headshot?: string;
    membership?: string;
  };
}

interface HubSpotListResponse {
  total: number;
  results: HubSpotContact[];
  paging?: {
    next?: {
      after: string;
    };
  };
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
    console.log(`Starting HubSpot sync process for members:`, memberIds)
    console.log(`Sync direction: ${direction}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch the active HubSpot list ID from settings
    console.log('Fetching HubSpot settings...')
    const { data: hubspotSettings, error: settingsError } = await supabase
      .from('hubspot_settings')
      .select('active_list_id')
      .single()

    if (settingsError) {
      console.error('Error fetching HubSpot settings:', settingsError)
      throw new Error('Failed to retrieve HubSpot list configuration. Please configure HubSpot settings first.')
    }

    if (!hubspotSettings?.active_list_id) {
      throw new Error('No active HubSpot list ID configured. Please set a list ID in the settings.')
    }

    const activeListId = hubspotSettings.active_list_id
    console.log(`Using HubSpot list ID: ${activeListId}`)

    const processedSummary = {
      updated: 0,
      inserted: 0,
      deactivated: 0
    };

    // Handle sync from HubSpot to Supabase (the default direction)
    if (direction === 'from_hubspot') {
      // Fetch the entire HubSpot list data once
      console.log(`Fetching HubSpot list data from list ID: ${activeListId}...`);
      const url = `https://api.hubapi.com/crm/v3/lists/${activeListId}/contacts?properties=firstname,lastname,email,company,jobtitle,phone,industry,state,city,bio,linkedin,headshot,membership&idProperty=hs_object_id&limit=100`;
      let allHubSpotContacts: HubSpotContact[] = [];
      let hasMore = true;
      let after: string | undefined = undefined;

      while (hasMore) {
        const paginatedUrl = after ? `${url}&after=${after}` : url;
        const response = await fetch(paginatedUrl, {
          headers: {
            'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HubSpot API error (${response.status}): ${errorText}`);
          throw new Error(`HubSpot API error fetching list data: ${response.status} ${errorText}`);
        }

        const listData: HubSpotListResponse = await response.json();
        allHubSpotContacts = [...allHubSpotContacts, ...listData.results];
        hasMore = !!listData.paging?.next?.after;
        after = listData.paging?.next?.after;
        
        console.log(`Fetched ${listData.results.length} contacts. Total so far: ${allHubSpotContacts.length}`);
      }

      console.log(`Total HubSpot contacts fetched: ${allHubSpotContacts.length}`);

      // If specific member IDs were provided, filter the HubSpot contacts
      const contactsToProcess = memberIds 
        ? allHubSpotContacts.filter(contact => memberIds.includes(parseInt(contact.id)))
        : allHubSpotContacts;
      
      console.log(`Processing ${contactsToProcess.length} contacts from HubSpot...`);

      // Get all existing profile IDs for checking which ones should be deactivated
      const { data: existingProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('record_id, active');

      if (profilesError) {
        console.error('Error fetching existing profiles:', profilesError);
        throw profilesError;
      }

      // Create a map of existing profiles for quick lookup
      const existingProfileMap = new Map();
      existingProfiles?.forEach(profile => {
        existingProfileMap.set(profile.record_id, profile.active);
      });

      // Create sets for tracking which records are processed and active
      const processedIds = new Set();

      // Process each contact from HubSpot
      for (const contact of contactsToProcess) {
        const recordId = parseInt(contact.id);
        processedIds.add(recordId);
        
        console.log(`Processing HubSpot contact ID: ${recordId}`);
        
        // First get any existing profile data
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('record_id', recordId)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error(`Error fetching existing profile for ${recordId}:`, fetchError);
          throw fetchError;
        }

        // Prepare the profile object with data from HubSpot
        const profile = {
          record_id: recordId,
          "First Name": contact.properties.firstname || existingProfile?.["First Name"] || '',
          "Last Name": contact.properties.lastname || existingProfile?.["Last Name"] || '',
          "Full Name": `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim() || existingProfile?.["Full Name"] || '',
          "Company Name": contact.properties.company || existingProfile?.["Company Name"] || '',
          "Job Title": contact.properties.jobtitle || existingProfile?.["Job Title"] || '',
          "Phone Number": contact.properties.phone || existingProfile?.["Phone Number"] || '',
          "Industry": contact.properties.industry || existingProfile?.["Industry"] || '',
          "State/Region": contact.properties.state || existingProfile?.["State/Region"] || '',
          "City": contact.properties.city || existingProfile?.["City"] || '',
          "Email": contact.properties.email || existingProfile?.["Email"] || '',
          "Bio": contact.properties.bio || existingProfile?.["Bio"] || '',
          "LinkedIn": contact.properties.linkedin || existingProfile?.["LinkedIn"] || '',
          "Headshot": contact.properties.headshot || existingProfile?.["Headshot"] || '',
          "Email Domain": existingProfile?.["Email Domain"] || (contact.properties.email ? contact.properties.email.split('@')[1] : null),
          "Membership": contact.properties.membership || existingProfile?.["Membership"] || '',
          "active": true
        };

        console.log(`Upserting profile for ${recordId}`);

        // Validate that we have a valid numeric ID before upserting
        if (isNaN(profile.record_id)) {
          console.error(`Invalid record_id for member ${recordId}: HubSpot ID could not be converted to number`);
          continue;
        }

        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(profile, {
            onConflict: 'record_id'
          });

        if (upsertError) {
          console.error(`Error upserting profile ${recordId}:`, upsertError);
          throw upsertError;
        }

        if (existingProfile) {
          processedSummary.updated++;
          console.log(`Successfully updated member ${recordId}`);
        } else {
          processedSummary.inserted++;
          console.log(`Successfully inserted new member ${recordId}`);
        }
      }

      // If we're syncing all members, set non-processed IDs to inactive
      if (!memberIds) {
        console.log('Processing inactive members (members not in HubSpot list)...');
        
        for (const [recordId, isActive] of existingProfileMap.entries()) {
          if (!processedIds.has(recordId) && isActive) {
            console.log(`Setting member ${recordId} to inactive as they are not in the HubSpot list`);
            
            const { error } = await supabase
              .from('profiles')
              .update({ active: false })
              .eq('record_id', recordId);

            if (error) {
              console.error(`Error updating active status for ${recordId}:`, error);
              throw error;
            }

            processedSummary.deactivated++;
            console.log(`Successfully marked member ${recordId} as inactive`);
          }
        }
      } else {
        // For specific member IDs that weren't found in HubSpot, mark them inactive
        for (const memberId of memberIds) {
          if (!processedIds.has(memberId) && existingProfileMap.get(memberId)) {
            console.log(`Setting member ${memberId} to inactive as they were not found in HubSpot`);
            
            const { error } = await supabase
              .from('profiles')
              .update({ active: false })
              .eq('record_id', memberId);

            if (error) {
              console.error(`Error updating active status for ${memberId}:`, error);
              throw error;
            }

            processedSummary.deactivated++;
            console.log(`Successfully marked member ${memberId} as inactive`);
          }
        }
      }
    } else if (direction === 'to_hubspot') {
      console.log('Syncing from Supabase to HubSpot is not fully implemented yet');
      // Future implementation for two-way sync
    }

    // Update the last sync timestamp
    await supabase
      .from('sync_preferences')
      .upsert({
        id: 1, 
        last_sync_timestamp: new Date().toISOString()
      }, { onConflict: 'id' });

    return new Response(
      JSON.stringify({
        success: true,
        summary: processedSummary
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in sync-hubspot function:', error);
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
});
