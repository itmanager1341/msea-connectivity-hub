
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface HubSpotContact {
  vid: number;
  properties: Record<string, any>;
  identities: any[];
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

    // Function to fetch contacts from HubSpot
    const fetchHubspotContacts = async (specificIds?: number[]) => {
      const propertyParams = [
        'firstname', 'lastname', 'email', 'company', 
        'phone', 'jobtitle', 'industry', 'state', 
        'city', 'bio', 'linkedin', 'headshot',
        'membership'
      ].map(prop => `property=${prop}`).join('&');

      let url = `https://api.hubapi.com/contactslistseg/v1/lists/3190/contacts/all?${propertyParams}`
      
      // If specific IDs provided, add vid filter
      if (specificIds && specificIds.length > 0) {
        url += `&vid=${specificIds[0]}`
      }

      console.log('Fetching from HubSpot URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${await response.text()}`);
      }

      const data = await response.json();
      console.log('HubSpot response:', data);
      return data.contacts || [];
    }

    // Fetch contacts from HubSpot
    const hubspotContacts = await fetchHubspotContacts(memberIds);
    console.log(`Retrieved ${hubspotContacts.length} contacts from HubSpot`);

    // Process contacts and update Supabase
    for (const contact of hubspotContacts) {
      const vid = parseInt(contact.vid);
      const props = contact.properties;
      
      console.log(`Processing contact ${vid}:`, props);

      const profile = {
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
        "Email Domain": null,
        "Membership": props.membership?.value || '',
        "active": true  // Always true since contact is from active list
      };

      console.log(`Upserting profile for ${vid}:`, profile);

      const { error } = await supabase
        .from('profiles')
        .upsert(profile, {
          onConflict: 'record_id'
        });

      if (error) {
        console.error(`Error upserting profile ${vid}:`, error);
        throw error;
      }

      console.log(`Successfully processed contact ${vid}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          processed: hubspotContacts.length
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
