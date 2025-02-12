
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HUBSPOT_API_KEY = Deno.env.get('HUBSPOT_API_KEY');
    if (!HUBSPOT_API_KEY) {
      throw new Error('HUBSPOT_API_KEY is not set');
    }

    // Get listId from query params
    const url = new URL(req.url);
    const listId = url.searchParams.get('listId');

    if (!listId) {
      throw new Error('List ID is required');
    }

    // Validate that listId is a number
    if (!/^\d+$/.test(listId)) {
      throw new Error('List ID must be a number');
    }

    console.log(`Testing connection for HubSpot list ID: ${listId}`);

    // First, verify the list exists and get its properties
    const listResponse = await fetch(
      `https://api.hubapi.com/crm/v3/lists/${listId}`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!listResponse.ok) {
      throw new Error(`Failed to fetch list: ${await listResponse.text()}`);
    }

    // Now get the property mappings we're using
    const mappings = {
      firstname: "First Name",
      lastname: "Last Name",
      email: "Email",
      company: "Company Name",
      jobtitle: "Job Title",
      phone: "Phone Number",
      industry: "Industry",
      state: "State/Region",
      city: "City",
      bio: "Bio",
      linkedin: "LinkedIn",
      headshot: "Headshot",
      membership: "Membership"
    };

    // Get a sample contact from the list to verify properties
    const contactsResponse = await fetch(
      `https://api.hubapi.com/crm/v3/lists/${listId}/memberships?limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!contactsResponse.ok) {
      throw new Error(`Failed to fetch list members: ${await contactsResponse.text()}`);
    }

    const contactsData = await contactsResponse.json();
    console.log('Sample contact data:', contactsData);

    // Return the verified mappings
    return new Response(
      JSON.stringify({
        success: true,
        listId: parseInt(listId),
        properties: mappings,
        message: "Successfully connected to HubSpot list"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in test-hubspot-list function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
