
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
      .eq('status', 'available')
      .eq('type', 'ai')
      .limit(1);
    
    if (agentsError) {
      console.error('Error fetching available agents:', agentsError);
    }
    
    const assignedAgentId = availableAgents && availableAgents.length > 0 
      ? availableAgents[0].id 
      : null;
      
    console.log(`Selected agent for call: ${assignedAgentId}`);
    
    // Check if the call already exists
    const { data: existingCall } = await supabase
      .from('calls')
      .select('id')
      .eq('twilio_call_sid', CallSid)
      .maybeSingle();
      
    if (existingCall) {
      console.log(`Call with SID ${CallSid} already exists, updating status`);
      await supabase
        .from('calls')
        .update({
          status: 'active',
          ai_agent_id: assignedAgentId || existingCall.ai_agent_id
        })
        .eq('id', existingCall.id);
        
      // Generate TwiML response for Twilio for existing call
      return generateTwiMLResponse(To, assignedAgentId, corsHeaders);
    }
      
    // Create call record for new call
    const { data: callData, error: callError } = await supabase
      .from('calls')
      .insert([
        {
          twilio_call_sid: CallSid,
          status: 'active',
          caller_number: From,
          caller_name: await lookupCallerName(From, supabase),
          ai_agent_id: assignedAgentId,
          start_time: new Date().toISOString(),
          transcript: JSON.stringify([{
            id: crypto.randomUUID(),
            call_id: 'pending', // Will be updated after insert
            text: 'Hola, ¿en qué puedo ayudarle?',
            timestamp: new Date().toISOString(),
            source: 'ai'
          }])
        }
      ])
      .select()
      .single();
    
    if (callError) {
      console.error('Error creating call record:', callError);
      throw callError;
    } else {
      console.log('Created call record:', callData);
      
      // Update transcript with the correct call_id
      if (callData && callData.transcript) {
        try {
          const transcript = JSON.parse(callData.transcript);
          transcript[0].call_id = callData.id;
          
          await supabase
            .from('calls')
            .update({
              transcript: JSON.stringify(transcript)
            })
            .eq('id', callData.id);
        } catch (error) {
          console.error('Error updating transcript with call ID:', error);
        }
      }
    }
    
    // Broadcast realtime notification about new call
    const channel = supabase.channel('public:calls');
    await channel.publish({
      type: 'broadcast',
      event: 'new-call',
      payload: {
        callId: callData?.id,
        callSid: CallSid,
        callerNumber: From,
        timestamp: new Date().toISOString(),
        agentId: assignedAgentId
      }
    });
    
    // Generate TwiML response for Twilio
    return generateTwiMLResponse(To, assignedAgentId, corsHeaders);
    
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

// Helper function to generate TwiML response
function generateTwiMLResponse(toNumber: string, agentId: string | null, corsHeaders: any) {
  // Modified TwiML to disable hold music - using <Play> tag removed
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-ES">Bienvenido a nuestro centro de contacto. Conectando con un agente.</Say>
  ${agentId 
    ? `<Dial timeout="30" record="record-from-answer" callerId="${toNumber}">
         <Client>agent-${agentId}</Client>
       </Dial>`
    : `<Say language="es-ES">Todos nuestros agentes están ocupados. Por favor intente más tarde.</Say>`
  }
  <Say language="es-ES">Gracias por contactar con nuestro centro. Adiós.</Say>
  <Hangup/>
</Response>`;
  
  console.log('Generated TwiML response:', twimlResponse);
  
  return new Response(twimlResponse, { 
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'text/xml' 
    } 
  });
}

// Helper function to look up caller name from contacts
async function lookupCallerName(phoneNumber: string, supabase: any): Promise<string | null> {
  try {
    // Normalize phone number for comparison
    const normalizedPhone = phoneNumber.replace(/\D/g, '').replace(/^00/, '+');
    
    // Look up in contacts
    const { data, error } = await supabase
      .from('contacts')
      .select('name')
      .or(`phone.ilike.%${normalizedPhone}%,phone.ilike.%${normalizedPhone.substring(normalizedPhone.length - 9)}%`)
      .maybeSingle();
      
    if (error) {
      console.error('Error looking up contact:', error);
      return null;
    }
    
    return data?.name || null;
  } catch (error) {
    console.error('Error in lookupCallerName:', error);
    return null;
  }
}
