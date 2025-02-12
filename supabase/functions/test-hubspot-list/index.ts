
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

    // Define our standard field mappings
    const mappings = {
      "First Name": "First Name",
      "Last Name": "Last Name",
      "Full Name": "Full Name",
      "Email": "Email",
      "Company Name": "Company Name",
      "Job Title": "Job Title",
      "Phone Number": "Phone Number",
      "Industry": "Industry",
      "State/Region": "State/Region",
      "City": "City",
      "Bio": "Bio",
      "LinkedIn": "LinkedIn",
      "Headshot": "Headshot",
      "Membership": "Membership"
    };

    // Return the mappings and success status
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
