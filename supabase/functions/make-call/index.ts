
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
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { phoneNumber, agentId, testMode = false } = body;
    console.log(`Request received: phoneNumber=${phoneNumber}, agentId=${agentId}, testMode=${testMode}`);

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
    const appUrl = Deno.env.get('APP_URL') || 'https://your-app-url.com'

    // Verificación detallada y registros de las credenciales
    console.log('Verificando credenciales de Twilio:')
    
    if (!accountSid) {
      console.error('TWILIO_ACCOUNT_SID no está configurado')
      throw new Error('Credenciales de Twilio no configuradas: Falta ACCOUNT_SID')
    } else {
      console.log(`TWILIO_ACCOUNT_SID: ${accountSid.substring(0, 5)}...${accountSid.substring(accountSid.length - 5)} (configurado)`)
    }
    
    if (!authToken) {
      console.error('TWILIO_AUTH_TOKEN no está configurado')
      throw new Error('Credenciales de Twilio no configuradas: Falta AUTH_TOKEN')
    } else {
      console.log(`TWILIO_AUTH_TOKEN: ${authToken.substring(0, 3)}...${authToken.substring(authToken.length - 3)} (configurado)`)
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
        JSON.stringify({ 
          success: true, 
          callSid: `TEST_SID_${Date.now()}`,
          message: 'Modo de prueba: Simulación de llamada exitosa'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generar TwiML personalizado para la llamada bidireccional
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-ES">Bienvenido a nuestro centro de atención. Su llamada está siendo conectada.</Say>
  <Connect>
    <Stream url="wss://${appUrl}/stream-audio">
      <Parameter name="callId" value="{{CALL_SID}}"/>
      <Parameter name="agentId" value="${agentId || 'no-agent'}"/>
    </Stream>
  </Connect>
  <Dial callerId="${twilioPhone}">
    <Client>agent-${agentId || 'default'}</Client>
  </Dial>
</Response>`;

    // Crear un endpoint temporal para servir el TwiML
    const twimlUrl = `https://${appUrl}/twilio-response?callId=${Date.now()}`;
    console.log(`Usando TwiML URL simulada: ${twimlUrl}`);
    console.log(`TwiML que se usaría: ${twimlResponse}`);
    
    // Intento directo con la API REST de Twilio en lugar de usar el SDK
    try {
      console.log('Intentando llamada directamente con la API REST de Twilio');
      
      // URL de la API de Twilio para crear llamadas
      const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
      
      // Para este ejemplo, usaremos una URL de TwiML estática, pero en una implementación
      // real, deberías tener un endpoint que genere TwiML dinámicamente según cada llamada
      const twimlUrl = 'http://demo.twilio.com/docs/voice.xml';
      console.log(`Usando TwiML URL: ${twimlUrl}`);
      
      // Credenciales en formato base64 para autenticación básica
      const credentials = btoa(`${accountSid}:${authToken}`);
      
      // Parámetros de la llamada en formato de formulario
      const formData = new URLSearchParams();
      formData.append('To', phoneNumber);
      formData.append('From', twilioPhone);
      formData.append('Url', twimlUrl);
      
      // Realizar la solicitud a la API de Twilio
      const response = await fetch(twilioApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      // Procesar la respuesta
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Error de la API de Twilio:', responseData);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Error de Twilio: ${responseData.message || 'Error desconocido'}`,
            code: responseData.code,
            status: response.status,
            details: responseData
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      console.log('Respuesta exitosa de Twilio:', responseData);
      
      return new Response(
        JSON.stringify({
          success: true,
          callSid: responseData.sid,
          message: 'Llamada iniciada exitosamente',
          details: responseData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (directApiError) {
      console.error('Error al llamar directamente a la API de Twilio:', directApiError);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `Error al llamar a la API de Twilio: ${directApiError.message}`,
          details: directApiError
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
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
