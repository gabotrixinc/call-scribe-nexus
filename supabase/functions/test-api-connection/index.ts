
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { service, settings } = await req.json()
    
    if (service === 'twilio') {
      // Get Twilio credentials from environment or request
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
      
      if (!accountSid || !authToken) {
        throw new Error('Twilio credentials not configured')
      }
      
      // Create Basic Auth header
      const credentials = btoa(`${accountSid}:${authToken}`)
      
      // Test Twilio API by fetching account info
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Twilio API error: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Twilio connection successful',
          accountName: data.friendly_name,
          status: data.status
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    } else {
      throw new Error(`Unsupported service: ${service}`)
    }
  } catch (error) {
    console.error(`API connection test error:`, error)
    
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
