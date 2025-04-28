
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
    
    const { phoneNumber, agentId, testMode = false, action } = body;
    
    // Handle different actions
    if (action === 'check-call-status') {
      const { callSid } = body;
      if (!callSid) {
        throw new Error('Call SID is required for status check');
      }
      
      return await checkCallStatus(callSid);
    }
    
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
  <Dial callerId="${twilioPhone}" timeout="30" record="record-from-answer">
    <Client>agent-${agentId || 'default'}</Client>
  </Dial>
  <Pause length="1"/>
  <Say language="es-ES">No hay agentes disponibles en este momento. La llamada se finalizará.</Say>
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
      
      // Para este ejemplo, usaremos un TwiML más avanzado que incluya control de música y eventos de fin de llamada
      const twimlUrl = 'http://demo.twilio.com/docs/voice.xml';
      const statusCallbackUrl = `https://${appUrl}/functions/call-status-callback`;
      console.log(`Usando TwiML URL: ${twimlUrl}`);
      console.log(`Status callback URL: ${statusCallbackUrl}`);
      
      // Credenciales en formato base64 para autenticación básica
      const credentials = btoa(`${accountSid}:${authToken}`);
      
      // Parámetros de la llamada en formato de formulario
      const formData = new URLSearchParams();
      formData.append('To', phoneNumber);
      formData.append('From', twilioPhone);
      formData.append('Url', twimlUrl);
      formData.append('StatusCallback', statusCallbackUrl);
      formData.append('StatusCallbackEvent', 'initiated ringing answered completed');
      formData.append('StatusCallbackMethod', 'POST');
      formData.append('MachineDetection', 'Enable');
      formData.append('AsyncAmd', 'true');
      formData.append('AsyncAmdStatusCallback', statusCallbackUrl);
      
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
  
  // Función para verificar el estado de una llamada en Twilio
  async function checkCallStatus(callSid: string) {
    try {
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      
      if (!accountSid || !authToken) {
        throw new Error('Credenciales de Twilio no configuradas');
      }
      
      const credentials = btoa(`${accountSid}:${authToken}`);
      const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${callSid}.json`;
      
      const response = await fetch(twilioApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        }
      });
      
      const callData = await response.json();
      
      if (!response.ok) {
        throw new Error(`Error al obtener estado de llamada: ${callData.message || 'Error desconocido'}`);
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          status: callData.status,
          duration: callData.duration,
          direction: callData.direction,
          answered_by: callData.answered_by,
          date_created: callData.date_created,
          date_updated: callData.date_updated,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error al verificar estado de llamada:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }
})
