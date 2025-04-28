
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle WebSocket connection
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response(
      JSON.stringify({ error: "Expected WebSocket connection" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Upgrade the connection to WebSocket
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Parse URL query parameters
    const url = new URL(req.url);
    const callId = url.searchParams.get('callId');
    const agentId = url.searchParams.get('agentId');
    
    console.log(`Nueva conexión WebSocket para callId: ${callId}, agentId: ${agentId}`);
    
    // Initialize variables
    let callActive = true;
    
    // Handle messages from the client (audio stream from Twilio)
    socket.onmessage = async (event) => {
      try {
        // In a real implementation, you'd:
        // 1. Process audio chunks from Twilio
        // 2. Send to a transcription service
        // 3. Store in database or dispatch to other services
        
        // For now, just log receipt
        console.log(`Recibido chunk de audio para callId: ${callId}`);
      } catch (error) {
        console.error('Error processing audio:', error);
      }
    };
    
    // Handle close event
    socket.onclose = (event) => {
      console.log(`WebSocket cerrado para callId ${callId}, code: ${event.code}, reason: ${event.reason}`);
      callActive = false;
    };
    
    // Handle errors
    socket.onerror = (event) => {
      console.error(`WebSocket error para callId ${callId}:`, event);
      callActive = false;
    };
    
    // Send welcome message
    socket.send(JSON.stringify({
      event: 'connected',
      message: `Conexión establecida para callId: ${callId}`
    }));
    
    return response;
  } catch (error) {
    console.error('Error handling WebSocket:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
