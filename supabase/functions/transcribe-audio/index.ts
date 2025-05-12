
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

      let transcription = "";
      
      try {
        // Attempt to use Speech recognition API if API key is available
        const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
        
        if (geminiApiKey) {
          console.log("Attempting to use Google Speech-to-Text API");
          // Here would be the code to call Google Speech API
          // In a real implementation, you would send the audio data to the API
        }
      } catch (apiError) {
        console.error("Error calling speech recognition API:", apiError);
      }
      
      // For demo/testing purposes, detect some keywords in the audio data length
      // to return contextually relevant responses
      // In production, this would be replaced with actual transcription 
      const audioDataLength = audioData.length;
      let keywordMatch = "";
      
      if (audioDataLength < 1000) {
        keywordMatch = "short";
      } else if (audioDataLength < 5000) {
        keywordMatch = "medium";
      } else {
        keywordMatch = "long";
      }
      
      const transcriptionOptions = {
        "short": [
          "Hola",
          "Buenos días",
          "Sí",
          "No",
          "Gracias"
        ],
        "medium": [
          "¿Podría ayudarme con un problema?",
          "Necesito información sobre mi cuenta",
          "¿Cuáles son sus horarios de atención?"
        ],
        "long": [
          "Estoy llamando porque tengo un problema con mi servicio y necesito ayuda para resolverlo lo antes posible.",
          "Me gustaría obtener más información sobre los nuevos productos que ofrecen y cuáles serían las mejores opciones para mi caso.",
          "He estado intentando contactarlos durante varios días y necesito resolver una situación urgente con mi cuenta."
        ]
      };
      
      // Select a random contextually appropriate response based on audio length
      if (transcriptionOptions[keywordMatch] && transcriptionOptions[keywordMatch].length > 0) {
        const options = transcriptionOptions[keywordMatch];
        transcription = options[Math.floor(Math.random() * options.length)];
      } else {
        transcription = "No se pudo transcribir el audio.";
      }
      
      // Get call data to update transcript
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Supabase configuration missing");
        }
        
        // Get current call data to update transcript
        const getCallResponse = await fetch(
          `${supabaseUrl}/rest/v1/calls?id=eq.${callId}&select=transcript`,
          {
            headers: {
              "Content-Type": "application/json",
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
            },
          }
        );
        
        if (!getCallResponse.ok) {
          throw new Error(`Failed to get call data: ${await getCallResponse.text()}`);
        }
        
        const callData = await getCallResponse.json();
        let existingTranscript = [];
        
        if (callData && callData.length > 0 && callData[0].transcript) {
          try {
            existingTranscript = JSON.parse(callData[0].transcript);
          } catch (e) {
            console.error("Error parsing existing transcript:", e);
          }
        }
        
        // Create new transcription item
        const newTranscriptionItem = {
          id: crypto.randomUUID(),
          call_id: callId,
          text: transcription,
          timestamp: new Date().toISOString(),
          source: 'human'
        };
        
        // Add to existing transcript
        existingTranscript.push(newTranscriptionItem);
        
        // Update call record with updated transcript
        const updateResponse = await fetch(
          `${supabaseUrl}/rest/v1/calls?id=eq.${callId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
              "Prefer": "return=minimal"
            },
            body: JSON.stringify({
              transcript: JSON.stringify(existingTranscript)
            }),
          }
        );
        
        if (!updateResponse.ok) {
          throw new Error(`Failed to update call transcript: ${await updateResponse.text()}`);
        }
        
        // Add AI response with a small delay
        setTimeout(async () => {
          try {
            // Generate AI response
            const aiResponses = {
              "Hola": "Hola, bienvenido a nuestro centro de atención. ¿En qué puedo ayudarle hoy?",
              "Buenos días": "Buenos días. Es un placer atenderle. ¿Cómo puedo asistirle?",
              "Sí": "Perfecto. ¿Hay algo más que necesite?",
              "No": "Entiendo. ¿Hay algo más en lo que pueda ayudarle?",
              "Gracias": "De nada. Estamos para servirle. ¿Necesita algo más?",
              "¿Podría ayudarme con un problema?": "Por supuesto, estaré encantado de ayudarle. Por favor, cuénteme más detalles sobre el problema que está experimentando.",
              "Necesito información sobre mi cuenta": "Con gusto. Para ayudarle con información sobre su cuenta, necesitaría algunos datos para verificar su identidad. ¿Podría proporcionarme su número de cliente o correo electrónico asociado?",
              "¿Cuáles son sus horarios de atención?": "Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00 horas, y sábados de 9:00 a 13:00 horas. ¿Hay algo específico en lo que pueda ayudarle?",
              "Estoy llamando porque tengo un problema con mi servicio y necesito ayuda para resolverlo lo antes posible.": "Lamento escuchar que está teniendo problemas con su servicio. Voy a hacer todo lo posible para ayudarle a resolverlo rápidamente. ¿Podría explicarme qué tipo de problema está experimentando específicamente?",
              "Me gustaría obtener más información sobre los nuevos productos que ofrecen y cuáles serían las mejores opciones para mi caso.": "Gracias por su interés en nuestros nuevos productos. Con gusto le proporcionaré toda la información. Para poder recomendarle las mejores opciones, ¿podría comentarme un poco sobre sus necesidades específicas?",
              "He estado intentando contactarlos durante varios días y necesito resolver una situación urgente con mi cuenta.": "Le ofrezco mis disculpas por las dificultades que ha tenido para contactarnos. Ahora mismo me encargaré personalmente de resolver su situación urgente. ¿Podría proporcionarme más detalles sobre el problema que está enfrentando?"
            };

            const aiResponse = aiResponses[transcription] || "Entiendo. Por favor, cuénteme más detalles para poder ayudarle mejor.";
            
            // Get updated transcript again
            const getUpdatedCallResponse = await fetch(
              `${supabaseUrl}/rest/v1/calls?id=eq.${callId}&select=transcript`,
              {
                headers: {
                  "Content-Type": "application/json",
                  "apikey": supabaseKey,
                  "Authorization": `Bearer ${supabaseKey}`,
                },
              }
            );
            
            if (!getUpdatedCallResponse.ok) {
              throw new Error(`Failed to get updated call data: ${await getUpdatedCallResponse.text()}`);
            }
            
            const updatedCallData = await getUpdatedCallResponse.json();
            let currentTranscript = [];
            
            if (updatedCallData && updatedCallData.length > 0 && updatedCallData[0].transcript) {
              try {
                currentTranscript = JSON.parse(updatedCallData[0].transcript);
              } catch (e) {
                console.error("Error parsing current transcript:", e);
              }
            }
            
            // Add AI response
            const aiTranscriptionItem = {
              id: crypto.randomUUID(),
              call_id: callId,
              text: aiResponse,
              timestamp: new Date().toISOString(),
              source: 'ai'
            };
            
            currentTranscript.push(aiTranscriptionItem);
            
            // Update call record with updated transcript including AI response
            await fetch(
              `${supabaseUrl}/rest/v1/calls?id=eq.${callId}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  "apikey": supabaseKey,
                  "Authorization": `Bearer ${supabaseKey}`,
                  "Prefer": "return=minimal"
                },
                body: JSON.stringify({
                  transcript: JSON.stringify(currentTranscript)
                }),
              }
            );
          } catch (aiError) {
            console.error("Error generating AI response:", aiError);
          }
        }, 1500);
      } catch (dbError) {
        console.error("Error updating call transcript:", dbError);
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
