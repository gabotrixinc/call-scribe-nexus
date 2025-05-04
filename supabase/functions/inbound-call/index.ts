
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'

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
    // Connect to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse incoming request body
    const url = new URL(req.url);
    const contentType = req.headers.get('content-type') || '';

    let incomingData = {};
    
    // Handle different content types as Twilio may send both form data and JSON
    if (contentType.includes('application/json')) {
      incomingData = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        incomingData[key] = value;
      }
    } else {
      // Try to parse as form data if content type is not explicitly set
      try {
        const formData = await req.formData();
        for (const [key, value] of formData.entries()) {
          incomingData[key] = value;
        }
      } catch (error) {
        console.error('Failed to parse request body as form data:', error);
      }
    }
    
    console.log('Incoming call data:', incomingData);
    
    const {
      CallSid,
      From,
      To,
      CallStatus,
      Direction
    } = incomingData;
    
    // Find available agent to handle the call
    const { data: availableAgents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name')
      .eq('status', 'active')
      .eq('type', 'ai')
      .limit(1);
    
    if (agentsError) {
      console.error('Error fetching available agents:', agentsError);
    }
    
    const assignedAgentId = availableAgents && availableAgents.length > 0 
      ? availableAgents[0].id 
      : null;
      
    console.log(`Selected agent for call: ${assignedAgentId}`);
    
    // Create call record
    const { data: callData, error: callError } = await supabase
      .from('calls')
      .insert([
        {
          twilio_call_sid: CallSid,
          status: 'active',
          caller_number: From,
          caller_name: null,
          ai_agent_id: assignedAgentId,
          start_time: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (callError) {
      console.error('Error creating call record:', callError);
    } else {
      console.log('Created call record:', callData);
    }
    
    // Notify clients about new call via realtime
    try {
      const channel = supabase.channel('new-call-notification');
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({
            type: 'broadcast',
            event: 'new-call',
            payload: {
              callId: callData?.id,
              callSid: CallSid,
              callerNumber: From,
              timestamp: new Date().toISOString(),
              agentId: assignedAgentId
            },
          });
        }
      });
    } catch (broadcastError) {
      console.error('Error broadcasting new call:', broadcastError);
    }
    
    // Generate TwiML response for Twilio
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-ES">Bienvenido a nuestro centro de contacto. Su llamada está siendo procesada.</Say>
  <Pause length="1"/>
  ${assignedAgentId 
    ? `<Say language="es-ES">Conectando con un agente disponible...</Say>
       <Dial timeout="30" record="record-from-answer" callerId="${To}">
         <Client>agent-${assignedAgentId}</Client>
       </Dial>`
    : `<Say language="es-ES">Todos nuestros agentes están ocupados. Por favor intente más tarde.</Say>`
  }
  <Say language="es-ES">Gracias por contactar con nuestro centro. Adiós.</Say>
  <Hangup/>
</Response>`;
    
    console.log('Generated TwiML response');
    
    return new Response(twimlResponse, { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/xml' 
      } 
    });
    
  } catch (error) {
    console.error('Error processing inbound call:', error);
    
    // Return a simple TwiML response in case of error
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-ES">Lo sentimos, ha ocurrido un error procesando su llamada. Por favor intente nuevamente.</Say>
  <Hangup/>
</Response>`;
    
    return new Response(errorTwiml, { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/xml' 
      } 
    });
  }
});
