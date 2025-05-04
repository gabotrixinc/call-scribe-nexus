
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, callId, audioData } = await req.json();

    // Connection info action for frontend to get a secure WebSocket URL
    if (action === "get-connection-info") {
      const protocol = req.url.startsWith("https") ? "wss" : "ws";
      const host = req.headers.get("host") || "localhost:54321";
      
      // Use secure websocket protocol (wss) for HTTPS
      const websocketUrl = `${protocol}://${host}/transcribe-ws`;
      
      return new Response(
        JSON.stringify({
          websocketUrl,
          success: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Process audio for transcription
    if (action === "transcribe") {
      if (!audioData) {
        throw new Error("No audio data provided");
      }

      const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
      
      // Simulamos la transcripción para la demo
      // En un caso real, utilizaríamos el API de transcripción como Whisper o Gemini
      const transcriptionTexts = [
        "Hola, estoy llamando para consultar sobre mi factura",
        "Necesito ayuda con un pago que realicé",
        "¿Podrían revisar mi cuenta por favor?",
        "Tengo una duda sobre mi servicio",
        "Quiero actualizar mi información personal"
      ];
      
      const transcription = transcriptionTexts[Math.floor(Math.random() * transcriptionTexts.length)];

      // Guardamos la transcripción en la base de datos
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase configuration missing");
      }
      
      // Intentamos insertar la transcripción en la base de datos
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/call_transcriptions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              call_id: callId,
              text: transcription,
              timestamp: new Date().toISOString(),
              source: 'human'
            }),
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error storing transcription:", errorData);
        }
      } catch (dbError) {
        console.error("Database error while storing transcription:", dbError);
      }

      return new Response(
        JSON.stringify({
          transcription,
          success: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
