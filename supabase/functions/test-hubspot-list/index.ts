
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

    // First, get all contact properties using HubSpot v3 API
    const propertiesResponse = await fetch(
      'https://api.hubapi.com/crm/v3/properties/contacts',
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!propertiesResponse.ok) {
      throw new Error(`Failed to fetch HubSpot properties: ${await propertiesResponse.text()}`);
    }

    const propertiesData = await propertiesResponse.json();
    const properties = propertiesData.results;
    
    // Then verify the list exists
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
      throw new Error(`Invalid list ID: ${await listResponse.text()}`);
    }

    // Map HubSpot properties to our Supabase columns
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

    // Create mappings between HubSpot properties and our database columns
    properties.forEach((prop: { name: string, label: string }) => {
      const matchingColumn = supabaseColumns.find(col => 
        col.toLowerCase().replace(/[^a-z0-9]/g, '') === 
        prop.label.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      if (matchingColumn) {
        fieldMappings[matchingColumn] = prop.name;
      }
    });

    console.log('Successfully mapped HubSpot properties to database columns:', fieldMappings);

    return new Response(
      JSON.stringify({
        success: true,
        listId: parseInt(listId),
        properties: fieldMappings,
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
