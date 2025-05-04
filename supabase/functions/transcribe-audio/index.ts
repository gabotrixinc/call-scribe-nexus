
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

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
      if (!geminiApiKey) {
        throw new Error("Gemini API key is not configured");
      }

      // Process audio with Google Speech-to-Text or other service
      const transcription = "Transcripción simulada para demostración";

      // Store transcription in database
      const { data, error } = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/rest/v1/call_transcriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            call_id: callId,
            text: transcription,
            timestamp: new Date().toISOString(),
          }),
        }
      ).then((res) => res.json());

      if (error) throw error;

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
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
