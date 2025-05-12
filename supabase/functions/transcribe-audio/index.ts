
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

      // For actual integration, use Google Speech-to-Text or OpenAI Whisper API
      // Here's a placeholder for Google Speech-to-Text
      let transcription = "";
      
      try {
        // Attempt to use Speech recognition API
        const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
        
        if (geminiApiKey) {
          console.log("Attempting to use Google Speech-to-Text API");
          // Here would be the code to call Google Speech API
          // This is just a placeholder, not actual implementation
        } else {
          console.log("No API key available, using mock transcription");
        }
      } catch (apiError) {
        console.error("Error calling speech recognition API:", apiError);
      }
      
      // For demo purposes, use realistic phrases that might be said in customer service calls
      const transcriptionOptions = [
        "Hola, llamo por un problema con mi factura del mes pasado.",
        "Necesito revisar mi plan actual de servicio.",
        "¿Podría informarme sobre las nuevas promociones?",
        "Tengo problemas técnicos con mi servicio.",
        "Quisiera actualizar mi información de contacto.",
        "No entiendo algunos cargos en mi factura.",
        "¿Cuál es el horario de atención de sus oficinas?",
        "Necesito ayuda para configurar mi cuenta.",
        "¿Puedo cambiar mi fecha de pago mensual?",
        "Quiero reportar un error en el sistema."
      ];
      
      // Select random transcription or use empty string if audioData doesn't contain actual data
      transcription = audioData.length > 100 
        ? transcriptionOptions[Math.floor(Math.random() * transcriptionOptions.length)]
        : "";

      // Save transcription to database
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase configuration missing");
      }
      
      if (transcription) {
        try {
          console.log(`Storing transcription for call ${callId}: "${transcription}"`);
          
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
            
            // If the table doesn't exist, create it
            if (errorData.message && errorData.message.includes("relation") && errorData.message.includes("does not exist")) {
              console.log("Attempting to create call_transcriptions table");
              
              const createTableResponse = await fetch(
                `${supabaseUrl}/rest/v1/rpc/exec`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "apikey": supabaseKey,
                    "Authorization": `Bearer ${supabaseKey}`,
                  },
                  body: JSON.stringify({
                    sql: `
                      CREATE TABLE IF NOT EXISTS public.call_transcriptions (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        call_id UUID REFERENCES public.calls(id) NOT NULL,
                        text TEXT NOT NULL,
                        timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
                        source TEXT DEFAULT 'ai' NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
                      );
                      
                      -- Add index for faster querying by call_id
                      CREATE INDEX IF NOT EXISTS idx_call_transcriptions_call_id ON public.call_transcriptions(call_id);
                      
                      -- Enable Row Level Security
                      ALTER TABLE public.call_transcriptions ENABLE ROW LEVEL SECURITY;
                      
                      -- Default policy to allow all operations
                      CREATE POLICY "Allow all operations" ON public.call_transcriptions FOR ALL USING (true);
                    `
                  }),
                }
              );
              
              if (!createTableResponse.ok) {
                console.error("Error creating table:", await createTableResponse.text());
              } else {
                console.log("Table created successfully");
                
                // Try inserting again
                await fetch(
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
              }
            }
          }
        } catch (dbError) {
          console.error("Database error while storing transcription:", dbError);
        }
      }

      // Generate AI response based on transcription
      const aiResponseOptions = {
        "Hola, llamo por un problema con mi factura del mes pasado.": 
          "Entiendo, puedo ayudarle con su factura. ¿Me podría proporcionar más detalles sobre el problema específico?",
        "Necesito revisar mi plan actual de servicio.":
          "Con gusto le ayudo a revisar su plan actual. ¿Me permite verificar su cuenta por favor?",
        "¿Podría informarme sobre las nuevas promociones?":
          "Por supuesto, tenemos varias promociones este mes. ¿Le interesa algún servicio en particular?",
        "Tengo problemas técnicos con mi servicio.":
          "Lamento escuchar eso. Podemos realizar algunas verificaciones para identificar el problema. ¿Cuándo comenzó a experimentar estos problemas?",
        "Quisiera actualizar mi información de contacto.":
          "Estaré encantado de ayudarle a actualizar su información. ¿Qué datos necesita modificar?",
        "No entiendo algunos cargos en mi factura.":
          "Le puedo explicar cada uno de los cargos en detalle. ¿Cuál es el cargo específico que le genera dudas?",
        "¿Cuál es el horario de atención de sus oficinas?":
          "Nuestras oficinas están abiertas de lunes a viernes de 9am a 6pm, y sábados de 9am a 1pm.",
        "Necesito ayuda para configurar mi cuenta.":
          "Le guiaré paso a paso en la configuración de su cuenta. ¿En qué dispositivo está intentando configurarla?",
        "¿Puedo cambiar mi fecha de pago mensual?":
          "Sí, podemos ayudarle a cambiar su fecha de pago. ¿Para qué día del mes le gustaría establecerla?",
        "Quiero reportar un error en el sistema.":
          "Gracias por informarnos. ¿Podría describirme qué error está encontrando y en qué parte de nuestro sistema?"
      };
      
      // Add AI response with a small delay
      if (transcription && Object.keys(aiResponseOptions).includes(transcription)) {
        setTimeout(async () => {
          try {
            await fetch(
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
                  text: aiResponseOptions[transcription as keyof typeof aiResponseOptions] || 
                        "Entiendo su consulta. ¿En qué más puedo ayudarle?",
                  timestamp: new Date(Date.now() + 2000).toISOString(), // 2 seconds later
                  source: 'ai'
                }),
              }
            );
          } catch (aiError) {
            console.error("Error storing AI response:", aiError);
          }
        }, 2000);
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
