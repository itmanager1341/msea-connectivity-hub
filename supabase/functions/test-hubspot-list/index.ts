
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HUBSPOT_API_KEY = Deno.env.get('HUBSPOT_API_KEY');
    if (!HUBSPOT_API_KEY) {
      throw new Error('HUBSPOT_API_KEY is not set');
    }

    const url = new URL(req.url);
    const listId = url.searchParams.get('listId');

    if (!listId) {
      throw new Error('List ID is required');
    }

    console.log(`Testing HubSpot list connection for list ID: ${listId}`);

    // Using the v3 Lists API endpoint
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/lists/${listId}`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Log the full response for debugging
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      throw new Error(`Invalid list ID: ${responseText}`);
    }

    let listData;
    try {
      listData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('Invalid response from HubSpot API');
    }

    console.log('List details:', listData);

    // Extract the filters to understand what properties are being used
    const filters = listData.filters;
    console.log('List filters:', filters);

    // Map the properties used in the list to our Supabase columns
    const fieldMappings: Record<string, string> = {};
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

    // We can get the properties directly from the list's configuration
    // This ensures we're only mapping fields that are actually used in the list
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
