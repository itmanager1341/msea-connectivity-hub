
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

    console.log('Using HubSpot API Key (first 5 chars):', HUBSPOT_API_KEY.substring(0, 5));

    const url = new URL(req.url);
    const listId = url.searchParams.get('listId');

    if (!listId) {
      throw new Error('List ID is required');
    }

    console.log(`Testing HubSpot list connection for list ID: ${listId}`);

    // First, let's verify the API key works by testing the auth
    const authTestResponse = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts',
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Auth test response status:', authTestResponse.status);
    if (!authTestResponse.ok) {
      const authErrorText = await authTestResponse.text();
      console.error('Auth test failed:', authErrorText);
      throw new Error('HubSpot authentication failed. Please verify your API key.');
    }

    // Now test the actual list endpoint
    const listResponse = await fetch(
      `https://api.hubapi.com/crm/v3/lists/${listId}`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('List response status:', listResponse.status);
    
    if (!listResponse.ok) {
      if (listResponse.status === 404) {
        throw new Error(`List ID ${listId} not found in HubSpot`);
      }
      const errorText = await listResponse.text();
      console.error('List test failed:', errorText);
      throw new Error(`HubSpot API error: ${errorText}`);
    }

    const listData = await listResponse.json();
    console.log('List details:', listData);

    // Extract the filters to understand what properties are being used
    const filters = listData.filters;
    console.log('List filters:', filters);

    // Map the properties used in the list to our Supabase columns
    const fieldMappings = {};
    const supabaseColumns = [
      "First Name",
      "Last Name",
      "Full Name",
      "Email",
      "Company Name",
      "Job Title",
      "Phone Number",
      "Industry",
      "State/Region",
      "City",
      "Bio",
      "LinkedIn",
      "Headshot",
      "Membership"
    ];

    if (filters && Array.isArray(filters)) {
      filters.forEach(filter => {
        if (filter.propertyName) {
          const matchingColumn = supabaseColumns.find(col => 
            col.toLowerCase().replace(/[^a-z0-9]/g, '') === 
            filter.propertyName.toLowerCase().replace(/[^a-z0-9]/g, '')
          );
          if (matchingColumn) {
            fieldMappings[matchingColumn] = filter.propertyName;
          }
        }
      });
    }

    console.log('Successfully mapped list properties to database columns:', fieldMappings);

    return new Response(
      JSON.stringify({
        success: true,
        listId: parseInt(listId),
        properties: fieldMappings,
        listName: listData.name,
        message: "Successfully connected to HubSpot list and mapped fields"
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
