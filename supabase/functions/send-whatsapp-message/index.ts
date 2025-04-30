
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
    console.log("Recibiendo solicitud para enviar mensaje de WhatsApp");
    const { phoneNumber, message, templateName, templateParams, conversationId } = await req.json();
    
    // Log request data
    console.log("Datos de solicitud:", { 
      phoneNumber, 
      message: message ? "Mensaje presente" : "No hay mensaje", 
      templateName, 
      hasParams: templateParams?.length > 0, 
      conversationId 
    });
    
    // Connect to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get WhatsApp credentials
    let whatsappToken, phoneNumberId;
    
    // First try to get from environment variables
    whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    
    // If not in environment, try to get from the database
    if (!whatsappToken || !phoneNumberId) {
      const { data: config, error } = await supabase
        .from('whatsapp_config')
        .select('access_token, phone_number_id')
        .eq('id', 'default')
        .single();
      
      if (error) {
        console.error("Error al obtener configuración de WhatsApp:", error);
      } else if (config) {
        whatsappToken = config.access_token;
        phoneNumberId = config.phone_number_id;
      }
    }
    
    if (!whatsappToken || !phoneNumberId) {
      throw new Error('WhatsApp configuration missing');
    }

    console.log("Configuración de WhatsApp obtenida correctamente");

    // Prepare message payload
    let requestBody;
    
    if (templateName) {
      console.log(`Preparando mensaje de plantilla: ${templateName}`);
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
        console.log(`Añadiendo ${templateParams.length} parámetros a la plantilla`);
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
      console.log("Preparando mensaje de texto normal");
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
    
    console.log("Cuerpo de solicitud preparado:", JSON.stringify(requestBody, null, 2));
    
    // Send message through WhatsApp API
    try {
      console.log(`Enviando solicitud a API de WhatsApp: https://graph.facebook.com/v17.0/${phoneNumberId}/messages`);
      const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const responseData = await response.json();
      console.log('WhatsApp API response:', JSON.stringify(responseData, null, 2));
      
      if (responseData.error) {
        throw new Error(`WhatsApp API error: ${responseData.error.message}`);
      }
      
      // Store the message in the database if it was sent successfully and we have a conversation ID
      if (responseData.messages && responseData.messages.length > 0 && conversationId) {
        console.log("Guardando mensaje en la base de datos");
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
        } else {
          console.log("Mensaje guardado correctamente");
        }
        
        // Update conversation last message time
        const { error: updateError } = await supabase
          .from('whatsapp_conversations')
          .update({ 
            last_message_time: new Date().toISOString() 
          })
          .eq('id', conversationId);
          
        if (updateError) {
          console.error('Error updating conversation timestamp:', updateError);
        } else {
          console.log("Tiempo de última conversación actualizado");
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        messageId: responseData.messages ? responseData.messages[0].id : null
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (apiError) {
      console.error("Error en la llamada a la API de WhatsApp:", apiError);
      throw apiError;
    }
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
