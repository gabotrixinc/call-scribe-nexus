
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
    const { phoneNumber, agentId, testMode = false } = await req.json()

    if (!phoneNumber) {
      throw new Error('Número de teléfono requerido')
    }

    // Validar el formato del número de teléfono (debe comenzar con + y tener al menos 8 dígitos)
    const phoneRegex = /^\+\d{8,15}$/
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error(`Formato de número inválido: ${phoneNumber}. Debe comenzar con + y tener entre 8 y 15 dígitos.`)
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
    
    // Modo de prueba para verificar la conexión sin hacer una llamada real
    if (testMode) {
      // Simulación para pruebas
      console.log('Modo de prueba: Simulando llamada exitosa')
      return new Response(
        JSON.stringify({ success: true, callSid: `TEST_SID_${Date.now()}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Importar Twilio directamente para evitar el problema con las exportaciones nombradas
    const twilioModule = await import('npm:twilio@4.21.0')
    const twilio = twilioModule.default
    
    const client = twilio(accountSid, authToken)

    try {
      // Intentar realizar la llamada real
      const call = await client.calls.create({
        url: 'http://demo.twilio.com/docs/voice.xml', // URL para instrucciones TwiML
        to: phoneNumber,
        from: twilioPhone,
      })
      
      console.log(`Llamada iniciada con SID: ${call.sid}`)
      
      return new Response(
        JSON.stringify({ success: true, callSid: call.sid }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (twilioError) {
      console.error('Error de Twilio:', twilioError)
      
      // Extraer detalles específicos del error de Twilio
      const errorDetails = {
        code: twilioError.code || 'Desconocido',
        message: twilioError.message || 'Error desconocido',
        moreInfo: twilioError.moreInfo || null
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error de Twilio: ${errorDetails.message}`,
          details: errorDetails
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
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
