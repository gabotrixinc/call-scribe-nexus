
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, agentId } = await req.json()

    if (!phoneNumber) {
      throw new Error('Número de teléfono requerido')
    }

    // Verificar si las credenciales están configuradas
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER')

    // Verificación más detallada de las credenciales
    if (!accountSid) {
      console.error('TWILIO_ACCOUNT_SID no está configurado')
      throw new Error('Credenciales de Twilio no configuradas: Falta ACCOUNT_SID')
    }
    if (!authToken) {
      console.error('TWILIO_AUTH_TOKEN no está configurado')
      throw new Error('Credenciales de Twilio no configuradas: Falta AUTH_TOKEN')
    }
    if (!twilioPhone) {
      console.error('TWILIO_PHONE_NUMBER no está configurado')
      throw new Error('Número de teléfono de Twilio no configurado')
    }

    console.log(`Realizando llamada a: ${phoneNumber} desde: ${twilioPhone}`)
    
    // Importar Twilio directamente para evitar el problema con las exportaciones nombradas
    const twilioModule = await import('npm:twilio@4.21.0')
    const twilio = twilioModule.default
    
    const client = twilio(accountSid, authToken)

    // Modo de prueba para verificar la conexión sin hacer una llamada real
    const testMode = false // Cambiar a false para hacer llamadas reales

    let callSid = null
    if (testMode) {
      // Simulación para pruebas
      console.log('Modo de prueba: Simulando llamada exitosa')
      callSid = `TEST_SID_${Date.now()}`
    } else {
      // Realizar la llamada real
      const call = await client.calls.create({
        url: 'http://demo.twilio.com/docs/voice.xml', // URL para instrucciones TwiML
        to: phoneNumber,
        from: twilioPhone,
      })
      callSid = call.sid
      console.log(`Llamada iniciada con SID: ${call.sid}`)
    }

    return new Response(
      JSON.stringify({ success: true, callSid: callSid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error al realizar llamada:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
