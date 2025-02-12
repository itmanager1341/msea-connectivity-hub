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

    const processedSummary = {
      updated: 0,
      deactivated: 0
    };

    // Process contacts
    for (const memberId of memberIds) {
      console.log(`Processing member ID: ${memberId}`);
      
      // First get the existing profile to ensure we don't lose data if the member is inactive
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('record_id', memberId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error(`Error fetching existing profile for ${memberId}:`, fetchError);
        throw fetchError;
      }

      // Check if contact is in active list and get their properties
      const url = `https://api.hubapi.com/crm/v3/lists/4959/contacts?properties=firstname,lastname,email,company,jobtitle,phone,industry,state,city,bio,linkedin,headshot,membership&idProperty=hs_object_id`;
      console.log('Fetching member data URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error fetching list data: ${await response.text()}`);
      }

      const listData = await response.json();
      const memberData = listData.results.find(contact => contact.id === memberId);
      const isActive = !!memberData;
      
      if (isActive) {
        const profile = {
          record_id: memberId,
          "First Name": memberData.properties.firstname || existingProfile?.["First Name"] || '',
          "Last Name": memberData.properties.lastname || existingProfile?.["Last Name"] || '',
          "Full Name": `${memberData.properties.firstname || ''} ${memberData.properties.lastname || ''}`.trim() || existingProfile?.["Full Name"] || '',
          "Company Name": memberData.properties.company || existingProfile?.["Company Name"] || '',
          "Job Title": memberData.properties.jobtitle || existingProfile?.["Job Title"] || '',
          "Phone Number": memberData.properties.phone || existingProfile?.["Phone Number"] || '',
          "Industry": memberData.properties.industry || existingProfile?.["Industry"] || '',
          "State/Region": memberData.properties.state || existingProfile?.["State/Region"] || '',
          "City": memberData.properties.city || existingProfile?.["City"] || '',
          "Email": memberData.properties.email || existingProfile?.["Email"] || '',
          "Bio": memberData.properties.bio || existingProfile?.["Bio"] || '',
          "LinkedIn": memberData.properties.linkedin || existingProfile?.["LinkedIn"] || '',
          "Headshot": memberData.properties.headshot || existingProfile?.["Headshot"] || '',
          "Email Domain": existingProfile?.["Email Domain"] || null,
          "Membership": memberData.properties.membership || existingProfile?.["Membership"] || '',
          "active": true
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

        processedSummary.updated++;
        console.log(`Successfully updated active member ${memberId}`);
      } else {
        // Member not in list - only update the active status
        if (existingProfile) {
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
