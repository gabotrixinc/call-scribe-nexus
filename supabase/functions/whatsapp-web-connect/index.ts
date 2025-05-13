
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Proxy the request to the WhatsApp Web service
    const whatsappServiceUrl = Deno.env.get('WHATSAPP_SERVICE_URL');
    
    if (!whatsappServiceUrl) {
      throw new Error('WhatsApp service URL not configured');
    }
    
    const { action, data } = await req.json();
    console.log(`Recibiendo solicitud para acción: ${action}`);
    
    // Forward the request to the external WhatsApp Web service
    const response = await fetch(`${whatsappServiceUrl}/api/whatsapp-web`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('WHATSAPP_SERVICE_API_KEY') || ''}`
      },
      body: JSON.stringify({ action, data })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from WhatsApp service:', errorText);
      throw new Error(`WhatsApp service responded with status: ${response.status} - ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log('Respuesta del servicio de WhatsApp:', JSON.stringify(responseData, null, 2));
    
    // If we have QR code or connection status, update our database
    if (action === 'get-qr' && responseData.qr) {
      try {
        await supabase
          .from('whatsapp_config')
          .upsert({
            id: 'default',
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
      } catch (error) {
        console.error('Error updating QR in database:', error);
      }
    } else if (action === 'check-status' && responseData.connected === true) {
      try {
        await supabase
          .from('whatsapp_config')
          .upsert({
            id: 'default',
            web_connected: true,
            verified: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
      } catch (error) {
        console.error('Error updating connection status in database:', error);
      }
    }
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error en la función de WhatsApp Web:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
