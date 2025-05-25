// Nuevo endpoint para generar TwiML para llamadas
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
    // Obtener parámetros de la URL
    const url = new URL(req.url);
    const to = url.searchParams.get('to');
    const from = url.searchParams.get('from');
    const callerId = url.searchParams.get('callerId');
    
    console.log(`Generando TwiML para llamada: De=${from || 'No especificado'}, A=${to || 'No especificado'}, CallerId=${callerId || 'No especificado'}`);
    
    if (!to && !from) {
      throw new Error('Se requiere al menos un número de teléfono (to o from)');
    }
    
    // Generar TwiML simplificado para evitar duplicación de llamadas
    let twimlResponse;
    
    if (to) {
      // TwiML para llamadas salientes - Simplificado para evitar duplicación
      twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${callerId || from}" timeout="60">
    <Number>${to}</Number>
  </Dial>
</Response>`;
    } else {
      // TwiML para llamadas entrantes
      twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-ES">Bienvenido a nuestro centro de contacto. Conectando con un agente ahora.</Say>
  <Dial timeout="30">
    <Client>support-queue</Client>
  </Dial>
  <Say language="es-ES">Lo sentimos, no hay agentes disponibles en este momento. Por favor intente nuevamente más tarde.</Say>
</Response>`;
    }
    
    console.log(`TwiML generado: ${twimlResponse}`);
    
    // Devolver TwiML como respuesta directa (no como JSON)
    return new Response(twimlResponse, { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/xml' 
      } 
    });
  } catch (error) {
    console.error('Error al generar TwiML:', error);
    
    // Devolver error en formato XML para Twilio
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-ES">Lo sentimos, ha ocurrido un error: ${error.message}</Say>
</Response>`;
    
    return new Response(errorTwiml, { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/xml' 
      } 
    });
  }
});
