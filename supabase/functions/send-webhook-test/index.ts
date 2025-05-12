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
    const { url, payload } = await req.json()
    
    if (!url) {
      throw new Error('No URL provided')
    }

    console.log(`Sending test webhook to: ${url}`)
    console.log('Payload:', JSON.stringify(payload))

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    let responseData = null
    let responseText = null

    try {
      responseText = await response.text()
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        // Not JSON, keep as text
        responseData = { text: responseText }
      }
    } catch (e) {
      console.error('Error reading response:', e)
    }

    console.log(`Webhook response status: ${response.status}`)
    console.log('Response data:', responseData || responseText || 'No response data')

    if (response.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          status: response.status,
          statusText: response.statusText,
          data: responseData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          status: response.status,
          statusText: response.statusText,
          error: 'Webhook endpoint returned error status',
          data: responseData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Still return 200 to client but indicate failure in body
        }
      )
    }
  } catch (error) {
    console.error('Error sending test webhook:', error)
    
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
