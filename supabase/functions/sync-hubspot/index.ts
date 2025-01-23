import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      throw new Error('HUBSPOT_API_KEY is not set')
    }

    // Fetch HubSpot report data with timeout
    console.log('Fetching HubSpot report data...')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000) // 25 second timeout

    try {
      const hubspotResponse = await fetch(
        'https://api.hubapi.com/reports/v3/reports/4959/results',
        {
          headers: {
            'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        }
      )

      if (!hubspotResponse.ok) {
        throw new Error(`HubSpot API error: ${hubspotResponse.statusText}`)
      }

      const hubspotData = await hubspotResponse.json()
      clearTimeout(timeout)

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Get existing profiles
      const { data: existingProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')

      if (fetchError) {
        throw new Error(`Failed to fetch existing profiles: ${fetchError.message}`)
      }

      const existingProfilesMap = new Map(
        existingProfiles?.map(profile => [profile['Record ID'], profile]) || []
      )

      const updates = []
      const inserts = []
      let updatedCount = 0
      let insertedCount = 0

      // Process HubSpot data
      for (const record of hubspotData.results) {
        const profileData = {
          'Record ID': record.id,
          'First Name': record.firstName,
          'Last Name': record.lastName,
          'Full Name': `${record.firstName} ${record.lastName}`.trim(),
          'Company Name': record.company,
          'Membership': record.membership,
          'Email': record.email,
          'Job Title': record.jobTitle,
          'Profession - FSI': record.profession,
          'Phone Number': record.phone,
          'Industry': record.industry,
          'State/Region': record.state,
          'City': record.city,
          'Email Domain': record.email ? record.email.split('@')[1] : null,
          'Bio': record.bio,
          'LinkedIn': record.linkedin,
          'active': true
        }

        if (existingProfilesMap.has(record.id)) {
          updates.push(profileData)
          updatedCount++
        } else {
          inserts.push(profileData)
          insertedCount++
        }
      }

      // Mark non-existing records as inactive
      const hubspotIds = new Set(hubspotData.results.map(r => r.id))
      const inactiveUpdates = existingProfiles
        ?.filter(profile => !hubspotIds.has(profile['Record ID']))
        .map(profile => ({
          'Record ID': profile['Record ID'],
          'active': false
        })) || []

      // Perform database operations in smaller batches
      const batchSize = 50
      const batchOperations = []

      // Process updates in batches
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize)
        batchOperations.push(
          supabase
            .from('profiles')
            .upsert(batch)
        )
      }

      // Process inserts in batches
      for (let i = 0; i < inserts.length; i += batchSize) {
        const batch = inserts.slice(i, i + batchSize)
        batchOperations.push(
          supabase
            .from('profiles')
            .insert(batch)
        )
      }

      // Process inactive updates in batches
      for (let i = 0; i < inactiveUpdates.length; i += batchSize) {
        const batch = inactiveUpdates.slice(i, i + batchSize)
        batchOperations.push(
          supabase
            .from('profiles')
            .upsert(batch)
        )
      }

      // Execute all batches
      const results = await Promise.all(batchOperations)

      // Check for errors
      const errors = results.filter(result => result.error)
      if (errors.length > 0) {
        throw new Error(`Database operation errors: ${JSON.stringify(errors)}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          summary: {
            updated: updatedCount,
            inserted: insertedCount,
            deactivated: inactiveUpdates.length
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )

    } finally {
      clearTimeout(timeout)
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