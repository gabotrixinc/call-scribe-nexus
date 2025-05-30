
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
    console.log('Verificando estado de conexión de WhatsApp Web');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    // Proxy the request to the WhatsApp Web service
    const whatsappServiceUrl = Deno.env.get('WHATSAPP_SERVICE_URL');
    
    if (!whatsappServiceUrl) {
      throw new Error('WhatsApp service URL not configured');
    }
    
    // Call the external WhatsApp Web service to check connection status
    const response = await fetch(`${whatsappServiceUrl}/api/whatsapp-web`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('WHATSAPP_SERVICE_API_KEY') || ''}`
      },
      body: JSON.stringify({ action: 'check-status' })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from WhatsApp service:', errorText);
      throw new Error(`WhatsApp service responded with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Estado de conexión obtenido:', data);
    
    // Update database with connection status
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (data.connected === true) {
      await supabase
        .from('whatsapp_config')
        .upsert({
          id: 'default',
          web_connected: true,
          verified: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    }
    
    return new Response(JSON.stringify({
      connected: data.connected,
      phoneNumber: data.phoneNumber,
      qrExpired: data.qrExpired
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error verificando estado de WhatsApp Web:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
