
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Twilio } from 'npm:twilio@4.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, agentId } = await req.json()

    if (!phoneNumber) {
      throw new Error('Phone number is required')
    }

    const client = new Twilio(
      Deno.env.get('TWILIO_ACCOUNT_SID'),
      Deno.env.get('TWILIO_AUTH_TOKEN')
    )

    const call = await client.calls.create({
      url: 'http://demo.twilio.com/docs/voice.xml', // URL for TwiML instructions
      to: phoneNumber,
      from: Deno.env.get('TWILIO_PHONE_NUMBER'),
    })

    return new Response(
      JSON.stringify({ success: true, callSid: call.sid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error making call:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
