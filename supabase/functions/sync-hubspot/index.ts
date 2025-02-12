
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface HubSpotContact {
  vid: number;
  properties: Record<string, any>;
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

    const { memberIds } = await req.json()
    console.log(`Starting HubSpot sync process for members:`, memberIds)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First, let's verify we can access the list itself
    const listCheckUrl = `https://api.hubapi.com/contacts/v1/lists/static/3190`;
    console.log('Verifying list access:', listCheckUrl);
    
    const listResponse = await fetch(listCheckUrl, {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!listResponse.ok) {
      console.error('List access check failed:', await listResponse.text());
      throw new Error(`Unable to access HubSpot list: ${listResponse.statusText}`);
    }

    const listData = await listResponse.json();
    console.log('List details:', listData);

    // Function to check if contact is in active list
    const checkActiveList = async (contactId: number): Promise<boolean> => {
      const url = `https://api.hubapi.com/contacts/v1/lists/static/3190/contacts/vid/${contactId}`;
      console.log('Checking active list URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      // A 404 means the contact is not in the list
      if (response.status === 404) {
        console.log(`Contact ${contactId} not found in list`);
        return false;
      }

      if (!response.ok) {
        throw new Error(`HubSpot API error checking active list: ${await response.text()}`);
      }

      const data = await response.json();
      console.log(`Active list check for ${contactId}:`, data);
      return true;  // If we get here, the contact is in the list
    }

    // Function to fetch a single contact
    const fetchHubspotContact = async (contactId: number) => {
      const url = `https://api.hubapi.com/contacts/v1/contact/vid/${contactId}/profile`;
      console.log('Fetching contact URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error fetching contact: ${await response.text()}`);
      }

      const data = await response.json();
      console.log('HubSpot contact data:', data);
      return data;
    }

    // Process contacts
    for (const memberId of memberIds) {
      console.log(`Processing member ID: ${memberId}`);
      
      // First check if contact is in active list
      const isActive = await checkActiveList(memberId);
      console.log(`Member ${memberId} active status:`, isActive);
      
      // Get contact details
      const contact = await fetchHubspotContact(memberId);
      console.log(`Retrieved contact data for ${memberId}:`, contact);

      const profile = {
        record_id: memberId,
        "First Name": contact.properties.firstname?.value || '',
        "Last Name": contact.properties.lastname?.value || '',
        "Full Name": `${contact.properties.firstname?.value || ''} ${contact.properties.lastname?.value || ''}`.trim(),
        "Company Name": contact.properties.company?.value || '',
        "Job Title": contact.properties.jobtitle?.value || '',
        "Phone Number": contact.properties.phone?.value || '',
        "Industry": contact.properties.industry?.value || '',
        "State/Region": contact.properties.state?.value || '',
        "City": contact.properties.city?.value || '',
        "Email": contact.properties.email?.value || '',
        "Bio": contact.properties.bio?.value || '',
        "LinkedIn": contact.properties.linkedin?.value || '',
        "Headshot": contact.properties.headshot?.value || '',
        "Email Domain": null,
        "Membership": contact.properties.membership?.value || '',
        "active": isActive
      };

      console.log(`Upserting profile for ${memberId}:`, profile);

      const { error } = await supabase
        .from('profiles')
        .upsert(profile, {
          onConflict: 'record_id'
        });

      if (error) {
        console.error(`Error upserting profile ${memberId}:`, error);
        throw error;
      }

      console.log(`Successfully processed contact ${memberId}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          processed: memberIds.length
        }
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
