
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Handle GET requests for webhook verification
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      
      const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
      
      console.log(`Received verification request: mode=${mode}, token=${token}, challenge=${challenge}`);
      
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verified successfully');
        return new Response(challenge, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      }
      
      return new Response('Verification failed', {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    // Handle POST requests with incoming messages
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Received webhook:', JSON.stringify(body, null, 2));

      // Connect to Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Process WhatsApp messages
      if (body.object === 'whatsapp_business_account') {
        if (body.entry && body.entry.length > 0 && 
            body.entry[0].changes && body.entry[0].changes.length > 0) {
          
          const change = body.entry[0].changes[0];
          
          if (change.value && change.value.messages && change.value.messages.length > 0) {
            for (const message of change.value.messages) {
              // Store the message in the database
              const { data: conversationData, error: conversationError } = await supabase
                .from('whatsapp_conversations')
                .select('id')
                .eq('wa_phone_number', message.from)
                .maybeSingle();
              
              let conversationId;
              if (conversationError) {
                console.error('Error retrieving conversation:', conversationError);
              }
              
              if (!conversationData) {
                // Create a new conversation
                const { data: newConversation, error: createError } = await supabase
                  .from('whatsapp_conversations')
                  .insert({
                    wa_phone_number: message.from,
                    status: 'active',
                    last_message_time: new Date().toISOString(),
                    ai_agent_id: null
                  })
                  .select()
                  .single();
                
                if (createError) {
                  console.error('Error creating conversation:', createError);
                  throw createError;
                }
                
                conversationId = newConversation.id;
              } else {
                conversationId = conversationData.id;
                
                // Update conversation last message time
                await supabase
                  .from('whatsapp_conversations')
                  .update({ 
                    last_message_time: new Date().toISOString(),
                    status: 'active'
                  })
                  .eq('id', conversationId);
              }
              
              // Store message
              const { error: messageError } = await supabase
                .from('whatsapp_messages')
                .insert({
                  conversation_id: conversationId,
                  direction: 'inbound',
                  wa_message_id: message.id,
                  content: message.type === 'text' ? message.text.body : null,
                  media_type: message.type !== 'text' ? message.type : null,
                  media_url: message.type !== 'text' ? JSON.stringify(message) : null,
                  timestamp: new Date().toISOString()
                });
              
              if (messageError) {
                console.error('Error storing message:', messageError);
                throw messageError;
              }
              
              // Process with AI if not assigned to an agent
              const shouldProcessWithAI = true; // We'll update this logic later
              
              if (shouldProcessWithAI && message.type === 'text') {
                // Call the AI processing function
                const aiResponse = await processMessageWithAI(message.text.body, conversationId, supabase);
                
                if (aiResponse) {
                  // Send AI response back through WhatsApp API
                  await sendWhatsAppMessage(message.from, aiResponse);
                  
                  // Store AI response
                  const { error: responseError } = await supabase
                    .from('whatsapp_messages')
                    .insert({
                      conversation_id: conversationId,
                      direction: 'outbound',
                      content: aiResponse,
                      timestamp: new Date().toISOString(),
                      ai_generated: true
                    });
                  
                  if (responseError) {
                    console.error('Error storing AI response:', responseError);
                  }
                }
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

/**
 * Process a message with Gemini AI
 */
async function processMessageWithAI(message: string, conversationId: string, supabase: any) {
  try {
    // Get recent conversation context
    const { data: recentMessages } = await supabase
      .from('whatsapp_messages')
      .select('content, direction, timestamp')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: false })
      .limit(5);
    
    // Build conversation context
    const conversationContext = recentMessages
      ? recentMessages
          .reverse()
          .map(msg => `${msg.direction === 'inbound' ? 'Customer' : 'Agent'}: ${msg.content}`)
          .join('\n')
      : '';
    
    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('Gemini API key not found');
      return null;
    }
    
    // Get company settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'default')
      .single();
    
    const companyName = settings?.company_name || 'Nuestra Empresa';
    
    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Eres un asistente virtual para ${companyName}. Estás hablando con un cliente por WhatsApp.
                
Recuerda:
- Sé cortés y profesional
- Mantén las respuestas concisas (menos de 150 palabras) ya que es WhatsApp
- No menciones que eres una inteligencia artificial
- No menciones que estás usando WhatsApp
- Firma como "${companyName}" al final de tus mensajes

CONTEXTO DE LA CONVERSACIÓN:
${conversationContext}

Cliente: ${message}

Tu respuesta:`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });
    
    const responseData = await response.json();
    
    if (responseData.candidates && responseData.candidates.length > 0) {
      const aiText = responseData.candidates[0].content.parts[0].text;
      return aiText.trim();
    }
    
    return null;
  } catch (error) {
    console.error('Error processing with AI:', error);
    return null;
  }
}

/**
 * Send a message through WhatsApp Business API
 */
async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    
    if (!whatsappToken || !phoneNumberId) {
      console.error('WhatsApp configuration missing');
      return false;
    }
    
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      })
    });
    
    const responseData = await response.json();
    console.log('WhatsApp API response:', responseData);
    
    return responseData.messages && responseData.messages.length > 0;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}
