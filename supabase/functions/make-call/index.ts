
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
    
    const { phoneNumber, agentId, testMode = false, action, direction = 'outbound', callSid } = body;
    
    // Handle different actions
    if (action === 'check-call-status') {
      if (!callSid) {
        throw new Error('Call SID is required for status check');
      }
      
      return await checkCallStatus(callSid);
    } else if (action === 'end-call') {
      if (!callSid) {
        throw new Error('Call SID is required to end call');
      }
      
      return await endCall(callSid);
    }
    
    console.log(`Request received: phoneNumber=${phoneNumber}, agentId=${agentId}, testMode=${testMode}, direction=${direction}`);

    if (!phoneNumber && direction === 'outbound') {
      throw new Error('Número de teléfono requerido para llamadas salientes')
    }

    // Validar el formato del número de teléfono para llamadas salientes
    if (direction === 'outbound') {
      const phoneRegex = /^\+\d{8,15}$/
      if (!phoneRegex.test(phoneNumber)) {
        throw new Error(`Formato de número inválido: ${phoneNumber}. Debe comenzar con + y tener entre 8 y 15 dígitos.`)
      }
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
    
    if (!twilioPhone && direction === 'outbound') {
      console.error('TWILIO_PHONE_NUMBER no está configurado')
      throw new Error('Número de teléfono de Twilio no configurado para llamadas salientes')
    } else if (direction === 'outbound') {
      console.log(`TWILIO_PHONE_NUMBER: ${twilioPhone} (configurado correctamente)`)
    }

    if (direction === 'outbound') {
      console.log(`Realizando llamada a: ${phoneNumber} desde: ${twilioPhone}`)
    } else {
      console.log(`Manejando llamada entrante para agente: ${agentId || 'no asignado'}`)
    }
    
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

    // Manejo diferenciado para llamadas entrantes y salientes
    if (direction === 'incoming') {
      // Para llamadas entrantes, generamos TwiML para redirigir la llamada al agente apropiado
      return await handleIncomingCall(body, appUrl, accountSid, authToken, corsHeaders);
    } else {
      // Para llamadas salientes, iniciamos una llamada desde Twilio
      return await makeOutboundCall(
        phoneNumber, 
        twilioPhone, 
        agentId, 
        appUrl, 
        accountSid, 
        authToken, 
        corsHeaders
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
});

// Función para manejar llamadas entrantes
async function handleIncomingCall(data, appUrl, accountSid, authToken, corsHeaders) {
  try {
    const { callSid, from, to, agentId } = data;
    
    console.log(`Procesando llamada entrante: De=${from}, A=${to}, CallSid=${callSid}`);
    
    // Generar TwiML para la llamada entrante - utilizando una respuesta simple sin música de espera
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-ES">Bienvenido a nuestro centro de contacto. Conectando con un agente ahora.</Say>
  <Dial callerId="${to}">
    ${agentId ? `<Client>agent-${agentId}</Client>` : '<Client>support-queue</Client>'}
  </Dial>
  <Say language="es-ES">Lo sentimos, no hay agentes disponibles en este momento. Por favor intente nuevamente más tarde.</Say>
</Response>`;

    console.log(`TwiML para llamada entrante generado: ${twimlResponse}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        callSid: callSid || `INCOMING_${Date.now()}`,
        message: 'Llamada entrante procesada',
        twiml: twimlResponse
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error al procesar llamada entrante:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Error al procesar llamada entrante: ${error.message}`
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// Función para realizar llamadas salientes
async function makeOutboundCall(phoneNumber, twilioPhone, agentId, appUrl, accountSid, authToken, corsHeaders) {
  // TwiML mejorado para llamadas salientes que conecta directamente la llamada sin música de espera
  // y utiliza <Dial> directamente para permitir comunicación bidireccional
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-ES">Conectando su llamada ahora.</Say>
  <Dial>
    <Number>${phoneNumber}</Number>
  </Dial>
</Response>`;

  // URL para callback de estado
  const statusCallbackUrl = `https://${appUrl}/functions/call-status-callback`;
  
  console.log(`Estado de la llamada URL: ${statusCallbackUrl}`);
  
  // Credenciales en formato base64 para autenticación básica
  const credentials = btoa(`${accountSid}:${authToken}`);
  
  // Parámetros de la llamada en formato de formulario
  const formData = new URLSearchParams();
  formData.append('To', phoneNumber);
  formData.append('From', twilioPhone);
  formData.append('Twiml', twimlResponse); // Uso directo del TwiML en lugar de URL
  formData.append('StatusCallback', statusCallbackUrl);
  formData.append('StatusCallbackEvent', 'initiated ringing answered completed');
  formData.append('StatusCallbackMethod', 'POST');
  // Habilitamos expresamente el audio bidireccional
  formData.append('Record', 'true');
  
  // Realizar la solicitud a la API de Twilio
  try {
    const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
    
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
}

// Función para verificar el estado de una llamada en Twilio
async function checkCallStatus(callSid) {
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

// Función para finalizar una llamada en Twilio
async function endCall(callSid) {
  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    
    if (!accountSid || !authToken) {
      throw new Error('Credenciales de Twilio no configuradas');
    }
    
    console.log(`Finalizando llamada con SID: ${callSid}`);
    
    const credentials = btoa(`${accountSid}:${authToken}`);
    const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${callSid}.json`;
    
    const formData = new URLSearchParams();
    formData.append('Status', 'completed');
    
    const response = await fetch(twilioApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Error al finalizar llamada en Twilio:', responseData);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Error al finalizar llamada: ${responseData.message || 'Error desconocido'}`,
          details: responseData
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('Llamada finalizada exitosamente en Twilio:', responseData);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Llamada finalizada exitosamente',
        details: responseData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error al finalizar llamada:', error);
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
