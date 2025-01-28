import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const HUBSPOT_API_KEY = Deno.env.get('HUBSPOT_API_KEY')
    if (!HUBSPOT_API_KEY) {
      throw new Error('HUBSPOT_API_KEY is required')
    }

    console.log('Fetching companies from HubSpot...')

    // First get the companies list
    const listResponse = await fetch(
      `https://api.hubapi.com/contacts/v1/lists/4981/contacts/all`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!listResponse.ok) {
      throw new Error(`HubSpot List API error: ${listResponse.statusText}`)
    }

    const listData = await listResponse.json()
    console.log(`Found ${listData.contacts?.length || 0} contacts in the list`)

    // Get associated companies for these contacts
    const companies = new Set()
    const companyDetails = []

    for (const contact of (listData.contacts || [])) {
      const associatedCompanyId = contact.properties?.associatedcompanyid?.value
      
      if (associatedCompanyId && !companies.has(associatedCompanyId)) {
        companies.add(associatedCompanyId)
        
        console.log(`Fetching details for company ID: ${associatedCompanyId}`)
        
        // Fetch detailed company information
        const companyResponse = await fetch(
          `https://api.hubapi.com/companies/v2/companies/${associatedCompanyId}`,
          {
            headers: {
              'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (companyResponse.ok) {
          const companyData = await companyResponse.json()
          console.log('Company data:', {
            name: companyData.properties?.name?.value,
            logo: companyData.properties?.logo?.value,
            domain: companyData.properties?.domain?.value,
            city: companyData.properties?.city?.value,
            state: companyData.properties?.state?.value
          })
          companyDetails.push(companyData)
        } else {
          console.error(`Failed to fetch company ${associatedCompanyId}:`, await companyResponse.text())
        }
      }
    }

    console.log(`Successfully fetched details for ${companyDetails.length} companies`)

    return new Response(
      JSON.stringify({
        success: true,
        data: companyDetails
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})