
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

    // Verificación detallada y registros de las credenciales
    console.log('Verificando credenciales de Twilio:')
    
    if (!accountSid) {
      console.error('TWILIO_ACCOUNT_SID no está configurado')
      throw new Error('Credenciales de Twilio no configuradas: Falta ACCOUNT_SID')
    } else {
      console.log('TWILIO_ACCOUNT_SID: Configurado correctamente')
    }
    
    if (!authToken) {
      console.error('TWILIO_AUTH_TOKEN no está configurado')
      throw new Error('Credenciales de Twilio no configuradas: Falta AUTH_TOKEN')
    } else {
      console.log('TWILIO_AUTH_TOKEN: Configurado correctamente')
    }
    
    if (!twilioPhone) {
      console.error('TWILIO_PHONE_NUMBER no está configurado')
      throw new Error('Número de teléfono de Twilio no configurado')
    } else {
      console.log(`TWILIO_PHONE_NUMBER: ${twilioPhone} (configurado correctamente)`)
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
    
    // Importar Twilio directamente
    try {
      const twilioModule = await import('npm:twilio@4.21.0')
      const twilio = twilioModule.default
      
      console.log('Módulo Twilio importado correctamente')
      
      try {
        const client = twilio(accountSid, authToken)
        console.log('Cliente Twilio creado correctamente')
        
        try {
          // Usar URL TwiML estática de Twilio para pruebas
          const twimlUrl = 'http://demo.twilio.com/docs/voice.xml'
          console.log(`Usando TwiML URL: ${twimlUrl}`)
          
          // Intentar realizar la llamada real
          console.log('Iniciando llamada con Twilio...')
          const call = await client.calls.create({
            url: twimlUrl,
            to: phoneNumber,
            from: twilioPhone,
          })
          
          console.log(`¡Llamada iniciada con éxito! SID: ${call.sid}`)
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              callSid: call.sid,
              message: 'Llamada iniciada exitosamente'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (callError) {
          console.error('Error al crear la llamada con Twilio:', callError)
          
          // Extraer detalles específicos del error de Twilio
          const errorDetails = {
            code: callError.code || 'Desconocido',
            message: callError.message || 'Error desconocido',
            status: callError.status || 'Desconocido',
            moreInfo: callError.moreInfo || null
          }
          
          console.error('Detalles del error de Twilio:', JSON.stringify(errorDetails, null, 2))
          
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
      } catch (clientError) {
        console.error('Error al crear el cliente Twilio:', clientError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Error al crear el cliente Twilio: ${clientError.message}`
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    } catch (importError) {
      console.error('Error al importar el módulo Twilio:', importError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error al importar Twilio: ${importError.message}`
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error)
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
