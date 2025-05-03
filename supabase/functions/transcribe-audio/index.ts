
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle WebSocket connection
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    // For regular HTTP requests (not WebSocket)
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }
    
    // Para inicialización y solicitudes de información
    try {
      const body = await req.json();
      const { action, callId } = body;
      
      if (action === 'get-connection-info') {
        // Obtener la URL base para WebSocket
        const url = new URL(req.url);
        const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        const baseUrl = `${protocol}//${url.host}`;
        
        // Devolver información de conexión WebSocket
        return new Response(
          JSON.stringify({
            success: true,
            websocketUrl: `${baseUrl}/functions/v1/transcribe-audio`,
            callId
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  try {
    // Upgrade the connection to WebSocket
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Check if Gemini API Key is configured
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      socket.send(JSON.stringify({
        type: 'error',
        error: 'Gemini API Key not configured'
      }));
      setTimeout(() => socket.close(1011, 'Gemini API Key not configured'), 1000);
      return response;
    }

    // Initialize variables
    let callId: string | null = null;
    let audioChunks: Uint8Array[] = [];
    
    // Handle messages from the client
    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Setup initial connection details
        if (data.type === 'init') {
          callId = data.callId;
          console.log(`Transcription session initialized for call: ${callId}`);
          
          // Send acknowledgement
          socket.send(JSON.stringify({
            type: 'init-ack',
            status: 'ready'
          }));
        } 
        // Process audio chunks
        else if (data.type === 'audio' && data.audio) {
          try {
            console.log('Recibiendo datos de audio, procesando...');
            
            // Procesar el audio base64
            const binaryString = atob(data.audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Añadir al buffer de audio
            audioChunks.push(bytes);
            
            // Si tenemos suficientes datos, realizar la transcripción
            if (audioChunks.length >= 5) { // ~1 segundo de audio
              const audioBuffer = concatenateAudioChunks(audioChunks);
              audioChunks = []; // Reiniciar el buffer
              
              // Transcribir con API de Gemini
              const transcription = await transcribeWithGemini(audioBuffer, geminiApiKey);
              
              if (transcription && transcription.trim() !== "") {
                // Enviar transcripción al cliente
                socket.send(JSON.stringify({
                  type: 'transcription',
                  text: transcription,
                  isFinal: true,
                  callId: callId,
                  timestamp: new Date().toISOString()
                }));
              }
            }
          } catch (error) {
            console.error('Transcription error:', error);
            socket.send(JSON.stringify({
              type: 'error',
              error: `Transcription failed: ${error.message}`
            }));
          }
        }
        // Handle call ended event
        else if (data.type === 'call-ended') {
          console.log(`Call ended event received for call: ${data.callId}`);
          // Close the WebSocket gracefully after sending acknowledgement
          socket.send(JSON.stringify({
            type: 'end-ack',
            status: 'closed',
            callId: data.callId
          }));
          
          // Close the WebSocket after a short delay to ensure the message is sent
          setTimeout(() => socket.close(1000, "Call ended"), 500);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          error: `Failed to process message: ${error.message}`
        }));
      }
    };
    
    // Handle close event
    socket.onclose = (event) => {
      console.log(`WebSocket closed for call ${callId}, code: ${event.code}, reason: ${event.reason}`);
      // Cleanup resources
      audioChunks = [];
    };
    
    // Handle errors
    socket.onerror = (event) => {
      console.error(`WebSocket error for call ${callId}:`, event);
    };
    
    // Function to concatenate audio chunks
    function concatenateAudioChunks(chunks: Uint8Array[]): Uint8Array {
      // Calculate total length
      const totalLength = chunks.reduce((acc, val) => acc + val.length, 0);
      
      // Create new array with total length
      const result = new Uint8Array(totalLength);
      
      // Copy each chunk into result array
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return result;
    }
    
    // Function to transcribe audio using Gemini API
    async function transcribeWithGemini(audioData: Uint8Array, apiKey: string): Promise<string> {
      try {
        // Para simplificar, usamos la simulación de transcripción
        // En un entorno de producción, se conectaría con la API de Speech-to-Text
        const transcription = simulatedTranscription();
        
        // Usamos Gemini para mejorar la transcripción
        const enhancedTranscription = await enhanceTranscriptionWithGemini(transcription, apiKey);
        return enhancedTranscription;
      } catch (error) {
        console.error('Error in transcription:', error);
        throw new Error(`Transcription error: ${error.message}`);
      }
    }
    
    // Function to enhance transcription with Gemini
    async function enhanceTranscriptionWithGemini(text: string, apiKey: string): Promise<string> {
      try {
        // Usar la API de Gemini para mejorar la transcripción
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Por favor, mejora esta transcripción de una llamada telefónica, corrige errores gramaticales y de puntuación: "${text}"`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 100
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0 && 
            data.candidates[0].content && 
            data.candidates[0].content.parts && 
            data.candidates[0].content.parts.length > 0) {
          return data.candidates[0].content.parts[0].text;
        } else {
          // Si no podemos analizar la respuesta de Gemini, devolveremos el texto original
          return text;
        }
      } catch (error) {
        console.error('Error enhancing transcription with Gemini:', error);
        // Return the original text if there's an error
        return text;
      }
    }
    
    // Temporary function until full Speech-to-Text integration
    function simulatedTranscription(): string {
      const phrases = [
        "Hola, ¿en qué puedo ayudarte hoy?",
        "Necesito información sobre mi cuenta.",
        "¿Cuál es el saldo de mi cuenta?",
        "¿Puedo realizar un pago ahora mismo?",
        "Gracias por su ayuda.",
        "Quiero reportar un problema con mi servicio.",
        "¿Cómo cambio mi contraseña?",
        "Necesito hablar con un supervisor.",
        "¿Pueden enviarme una factura por correo electrónico?",
        "¿Cuándo es la fecha límite de pago?"
      ];
      
      return phrases[Math.floor(Math.random() * phrases.length)];
    }
    
    return response;
  } catch (error) {
    console.error('Error handling WebSocket:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
