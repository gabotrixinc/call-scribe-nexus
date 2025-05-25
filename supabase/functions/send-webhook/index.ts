// Implementación de webhooks para envío y recepción de datos
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
    const body = await req.json();
    const { event_type, data, webhook_url, webhook_secret } = body;
    
    if (!event_type) {
      throw new Error('Se requiere tipo de evento');
    }
    
    if (!data) {
      throw new Error('Se requieren datos para el webhook');
    }
    
    if (!webhook_url) {
      throw new Error('Se requiere URL del webhook');
    }
    
    console.log(`Procesando webhook: ${event_type}, destino: ${webhook_url}`);
    
    // Preparar payload para el webhook
    const payload = {
      event_type,
      timestamp: new Date().toISOString(),
      data
    };
    
    // Añadir firma si se proporciona un secreto
    let headers = {
      'Content-Type': 'application/json'
    };
    
    if (webhook_secret) {
      // Crear firma HMAC para verificación
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhook_secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(JSON.stringify(payload))
      );
      
      // Convertir firma a string hexadecimal
      const signatureHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      headers['X-Webhook-Signature'] = signatureHex;
    }
    
    // Enviar datos al webhook
    const webhookResponse = await fetch(webhook_url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      throw new Error(`Error al enviar webhook: ${webhookResponse.status} - ${errorText}`);
    }
    
    const responseData = await webhookResponse.text();
    
    console.log(`Webhook enviado exitosamente: ${event_type}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        event_type,
        webhook_url,
        response: responseData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error al procesar webhook:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error al procesar webhook'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
