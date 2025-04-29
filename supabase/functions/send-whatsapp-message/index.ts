
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
    const { phoneNumber, message, templateName, templateParams, conversationId } = await req.json();
    
    // Connect to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get WhatsApp credentials
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    
    if (!whatsappToken || !phoneNumberId) {
      throw new Error('WhatsApp configuration missing');
    }

    // Prepare message payload
    let requestBody;
    
    if (templateName) {
      // Template message
      requestBody = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'es' },
          components: []
        }
      };
      
      // Add components if parameters provided
      if (templateParams && templateParams.length > 0) {
        requestBody.template.components = [
          {
            type: 'body',
            parameters: templateParams.map(param => ({
              type: 'text',
              text: param.toString()
            }))
          }
        ];
      }
    } else {
      // Regular text message
      requestBody = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phoneNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      };
    }
    
    // Send message through WhatsApp API
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    console.log('WhatsApp API response:', responseData);
    
    if (responseData.error) {
      throw new Error(`WhatsApp API error: ${responseData.error.message}`);
    }
    
    // Store the message in the database if it was sent successfully and we have a conversation ID
    if (responseData.messages && responseData.messages.length > 0 && conversationId) {
      const { error: messageError } = await supabase
        .from('whatsapp_messages')
        .insert({
          conversation_id: conversationId,
          direction: 'outbound',
          wa_message_id: responseData.messages[0].id,
          content: message || `Template: ${templateName}`,
          timestamp: new Date().toISOString()
        });
      
      if (messageError) {
        console.error('Error storing message in database:', messageError);
      }
      
      // Update conversation last message time
      await supabase
        .from('whatsapp_conversations')
        .update({ 
          last_message_time: new Date().toISOString() 
        })
        .eq('id', conversationId);
    }
    
    return new Response(JSON.stringify({
      success: true,
      messageId: responseData.messages ? responseData.messages[0].id : null
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
