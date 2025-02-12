
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface HubSpotContact {
  id: string;
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

    // Process contacts
    for (const memberId of memberIds) {
      console.log(`Processing member ID: ${memberId}`);
      
      // Check if contact is in active list and get their properties in one call
      const url = `https://api.hubapi.com/crm/v3/lists/4959/memberships/${memberId}?properties=firstname,lastname,email,company,jobtitle,phone,industry,state,city,bio,linkedin,headshot,membership`;
      console.log('Fetching member data URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      // If 404, the contact is not in the list (inactive)
      const isActive = response.status !== 404;
      let contactData;

      if (isActive) {
        if (!response.ok) {
          throw new Error(`HubSpot API error fetching member data: ${await response.text()}`);
        }
        contactData = await response.json();
        console.log(`Retrieved member data for ${memberId}:`, contactData);
      } else {
        console.log(`Member ${memberId} is not in the active list`);
      }

      const profile = {
        record_id: memberId,
        "First Name": contactData?.properties?.firstname || '',
        "Last Name": contactData?.properties?.lastname || '',
        "Full Name": `${contactData?.properties?.firstname || ''} ${contactData?.properties?.lastname || ''}`.trim(),
        "Company Name": contactData?.properties?.company || '',
        "Job Title": contactData?.properties?.jobtitle || '',
        "Phone Number": contactData?.properties?.phone || '',
        "Industry": contactData?.properties?.industry || '',
        "State/Region": contactData?.properties?.state || '',
        "City": contactData?.properties?.city || '',
        "Email": contactData?.properties?.email || '',
        "Bio": contactData?.properties?.bio || '',
        "LinkedIn": contactData?.properties?.linkedin || '',
        "Headshot": contactData?.properties?.headshot || '',
        "Email Domain": null,
        "Membership": contactData?.properties?.membership || '',
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
