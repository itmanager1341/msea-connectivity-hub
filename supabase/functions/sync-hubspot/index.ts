
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

    // Function to check if contact is in active list
    const checkActiveList = async (contactId: number): Promise<boolean> => {
      const url = `https://api.hubapi.com/contactslistseg/v1/lists/3190/has-contacts?vids=${contactId}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error checking active list: ${await response.text()}`);
      }

      const data = await response.json();
      console.log(`Active list check for ${contactId}:`, data);
      return data?.hasContacts || false;
    }

    // Function to fetch a single contact from HubSpot
    const fetchHubspotContact = async (contactId: number) => {
      const properties = [
        'firstname', 'lastname', 'email', 'company', 
        'phone', 'jobtitle', 'industry', 'state', 
        'city', 'bio', 'linkedin', 'headshot',
        'membership'
      ];

      const url = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?properties=${properties.join(',')}`;
      console.log('Fetching contact from HubSpot URL:', url);
      
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

    // Process single contact
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
        "First Name": contact.properties.firstname || '',
        "Last Name": contact.properties.lastname || '',
        "Full Name": `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
        "Company Name": contact.properties.company || '',
        "Job Title": contact.properties.jobtitle || '',
        "Phone Number": contact.properties.phone || '',
        "Industry": contact.properties.industry || '',
        "State/Region": contact.properties.state || '',
        "City": contact.properties.city || '',
        "Email": contact.properties.email || '',
        "Bio": contact.properties.bio || '',
        "LinkedIn": contact.properties.linkedin || '',
        "Headshot": contact.properties.headshot || '',
        "Email Domain": null,
        "Membership": contact.properties.membership || '',
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
