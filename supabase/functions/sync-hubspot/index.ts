import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    console.log('Starting HubSpot sync process...')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)

    try {
      console.log('Fetching MSEA contacts list from HubSpot...')
      const hubspotResponse = await fetch(
        'https://api.hubapi.com/contactslistseg/v1/lists/3190/contacts/all',
        {
          headers: {
            'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        }
      )

      if (!hubspotResponse.ok) {
        const errorText = await hubspotResponse.text()
        console.error('HubSpot API error response:', errorText)
        throw new Error(`HubSpot API error: ${hubspotResponse.statusText}. Details: ${errorText}`)
      }

      const rawResponse = await hubspotResponse.text()
      console.log('Raw HubSpot API response:', rawResponse)
      
      const hubspotData = JSON.parse(rawResponse)
      console.log('Number of contacts received:', hubspotData.contacts?.length || 0)
      
      if (hubspotData.contacts && hubspotData.contacts.length > 0) {
        console.log('Sample contact data:', JSON.stringify(hubspotData.contacts[0], null, 2))
      }

      clearTimeout(timeout)

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const { data: existingProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')

      if (fetchError) {
        throw new Error(`Failed to fetch existing profiles: ${fetchError.message}`)
      }

      console.log('Number of existing profiles:', existingProfiles?.length || 0)

      const existingProfilesMap = new Map(
        existingProfiles?.map(profile => [profile['Record ID'], profile]) || []
      )

      const updates = []
      const inserts = []
      let updatedCount = 0
      let insertedCount = 0

      for (const contact of (hubspotData.contacts || [])) {
        console.log('Processing contact:', contact.vid)
        const properties = contact.properties
        
        // Handle membership field
        let currentMembership = properties.membership?.value || ''
        
        // Ensure MSEA membership is properly recorded while preserving other memberships
        if (!currentMembership.includes('MSEA')) {
          // If they're in this list but don't have MSEA explicitly listed, add it
          currentMembership = currentMembership ? `${currentMembership}; MSEA` : 'MSEA'
        }

        const profileData = {
          'Record ID': parseInt(contact.vid),
          'First Name': properties.firstname?.value,
          'Last Name': properties.lastname?.value,
          'Full Name': `${properties.firstname?.value || ''} ${properties.lastname?.value || ''}`.trim(),
          'Company Name': properties.company?.value,
          'Membership': currentMembership,
          'Email': properties.email?.value,
          'Job Title': properties.jobtitle?.value,
          'Phone Number': properties.phone?.value,
          'Industry': properties.industry?.value,
          'State/Region': properties.state?.value,
          'City': properties.city?.value,
          'Email Domain': properties.email?.value ? properties.email.value.split('@')[1] : null,
          'Bio': properties.bio?.value,
          'LinkedIn': properties.linkedin?.value,
          'active': true  // All contacts in this list are active MSEA members
        }

        if (existingProfilesMap.has(parseInt(contact.vid))) {
          updates.push(profileData)
          updatedCount++
        } else {
          inserts.push(profileData)
          insertedCount++
        }
      }

      console.log(`Updates prepared: ${updates.length}, Inserts prepared: ${inserts.length}`)

      if (hubspotData.contacts && hubspotData.contacts.length > 0) {
        const hubspotIds = new Set((hubspotData.contacts || []).map(c => parseInt(c.vid)))
        
        // Mark profiles as inactive only if they're not in the MSEA members list
        const inactiveUpdates = existingProfiles
          ?.filter(profile => !hubspotIds.has(profile['Record ID']))
          .map(profile => ({
            'Record ID': profile['Record ID'],
            'active': false
          })) || []

        console.log(`Processing ${updates.length} updates, ${inserts.length} inserts, and ${inactiveUpdates.length} inactive updates`)

        const batchSize = 50
        const batchOperations = []

        for (let i = 0; i < updates.length; i += batchSize) {
          const batch = updates.slice(i, i + batchSize)
          batchOperations.push(
            supabase
              .from('profiles')
              .upsert(batch)
          )
        }

        for (let i = 0; i < inserts.length; i += batchSize) {
          const batch = inserts.slice(i, i + batchSize)
          batchOperations.push(
            supabase
              .from('profiles')
              .insert(batch)
          )
        }

        for (let i = 0; i < inactiveUpdates.length; i += batchSize) {
          const batch = inactiveUpdates.slice(i, i + batchSize)
          batchOperations.push(
            supabase
              .from('profiles')
              .upsert(batch)
          )
        }

        const results = await Promise.all(batchOperations)

        const errors = results.filter(result => result.error)
        if (errors.length > 0) {
          console.error('Database operation errors:', errors)
          throw new Error(`Database operation errors: ${JSON.stringify(errors)}`)
        }
      } else {
        console.log('No contacts received from HubSpot, skipping database updates')
      }

      console.log('Sync completed successfully')
      return new Response(
        JSON.stringify({
          success: true,
          summary: {
            updated: updatedCount,
            inserted: insertedCount,
            deactivated: hubspotData.contacts?.length > 0 ? existingProfiles?.length - (updatedCount + insertedCount) : 0
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )

    } catch (error) {
      clearTimeout(timeout)
      throw error
    }

  } catch (error) {
    console.error('Error in sync-hubspot function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})