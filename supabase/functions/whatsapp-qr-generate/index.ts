
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
    console.log('Generando código QR para WhatsApp Web');
    
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
    
    // Call the external WhatsApp Web service
    const response = await fetch(`${whatsappServiceUrl}/api/whatsapp-web`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('WHATSAPP_SERVICE_API_KEY') || ''}`
      },
      body: JSON.stringify({ action: 'get-qr' })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from WhatsApp service:', errorText);
      throw new Error(`WhatsApp service responded with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('QR Code generado correctamente');
    
    // Store connection attempt in database
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase
      .from('whatsapp_config')
      .upsert({
        id: 'default',
        updated_at: new Date().toISOString(),
        web_connected: false
      }, { onConflict: 'id' });
    
    return new Response(JSON.stringify({
      qr: data.qr,
      expiration: data.expiration || (Date.now() + 60000) // Default 60 second expiration
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error en la generación del código QR:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
