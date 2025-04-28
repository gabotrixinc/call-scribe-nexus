
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";

interface LiveTranscriptionProps {
  callId: string;
  isActive: boolean;
}

type TranscriptEntry = {
  id: string;
  text: string;
  timestamp: Date;
  speaker: 'user' | 'agent';
};

const LiveTranscription: React.FC<LiveTranscriptionProps> = ({ callId, isActive }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [transcript]);
  
  useEffect(() => {
    if (isActive && !isConnected && !isConnecting) {
      connectWebSocket();
    }
    
    if (!isActive && isConnected) {
      disconnectWebSocket();
    }
    
    return () => {
      disconnectWebSocket();
    };
  }, [isActive, isConnected]);
  
  // Check call status periodically
  useEffect(() => {
    if (isActive && callId && callId !== 'test-call-id') {
      const intervalId = setInterval(() => {
        checkCallStatus(callId);
      }, 5000);
      
      return () => clearInterval(intervalId);
    }
  }, [isActive, callId]);
  
  const checkCallStatus = async (callId: string) => {
    try {
      // Get Twilio call SID from database
      const { data: callData, error: callError } = await supabase
        .from('calls')
        .select('twilio_call_sid, status')
        .eq('id', callId)
        .single();
      
      if (callError || !callData) {
        console.error('Error retrieving call data:', callError);
        return;
      }
      
      // If call is already marked as completed in our database, disconnect
      if (callData.status === 'completed') {
        if (isConnected) {
          disconnectWebSocket();
        }
        return;
      }
      
      const twilioCallSid = callData.twilio_call_sid;
      if (!twilioCallSid) return;
      
      // Check call status with Twilio API
      const { data } = await supabase.functions.invoke('make-call', {
        body: { 
          action: 'check-call-status', 
          callSid: twilioCallSid 
        }
      });
      
      // If call is no longer active with Twilio but still active in our database, update it
      if (data?.success && (data?.status === 'completed' || data?.status === 'failed' || 
          data?.status === 'busy' || data?.status === 'no-answer' || data?.status === 'canceled')) {
        
        console.log(`Call ${callId} has ended on Twilio side, updating database...`);
        
        // Update call status in database
        await supabase
          .from('calls')
          .update({
            status: 'completed',
            end_time: new Date().toISOString(),
            duration: data?.duration || 0
          })
          .eq('id', callId);
        
        // Disconnect WebSocket
        if (isConnected) {
          disconnectWebSocket();
        }
        
        // Notify user that call has ended
        toast({
          title: "Llamada finalizada",
          description: "La llamada ha terminado desde el otro lado.",
        });
      }
    } catch (error) {
      console.error('Error checking call status:', error);
    }
  };
  
  const connectWebSocket = async () => {
    try {
      setIsConnecting(true);
      setErrorMessage(null);
      
      const { data } = await supabase.functions.invoke('transcribe-audio', {
        body: { action: 'get-connection-info', callId }
      });
      
      if (!data?.websocketUrl) {
        throw new Error('No se pudo obtener la URL para la transcripción');
      }
      
      const socket = new WebSocket(data.websocketUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        
        socket.send(JSON.stringify({
          type: 'init',
          callId: callId
        }));
      };
      
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'init-ack') {
          setIsConnected(true);
          setIsConnecting(false);
        }
        else if (message.type === 'transcription') {
          // Get timestamp if provided, or use current time
          const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
          
          setTranscript(prev => [...prev, {
            id: `user-${Date.now()}`,
            text: message.text,
            timestamp: timestamp,
            speaker: 'user'
          }]);
          
          // Simulate agent response 2 seconds later
          setTimeout(() => {
            // Generate agent response based on the transcription
            const agentResponses: Record<string, string> = {
              'ayuda': 'Con gusto le ayudo. ¿Podría proporcionarme más detalles sobre su consulta?',
              'cuenta': 'Verificaré los datos de su cuenta inmediatamente. ¿Podría proporcionarme su número de cuenta o identificación?',
              'factura': 'Entiendo. Revisaré los detalles de su factura. ¿Podría confirmar el mes o período de facturación?',
              'gracias': 'Es un placer ayudarle. ¿Puedo asistirle con algo más?',
              'problema': 'Lamento los inconvenientes. Vamos a analizar el problema para ofrecerle una solución adecuada.'
            };
            
            // Find keywords in the transcription
            let agentResponse = 'Entiendo su consulta. ¿Podría proporcionarme más información para ayudarle mejor?';
            
            const normalizedText = message.text.toLowerCase();
            
            Object.keys(agentResponses).forEach(keyword => {
              if (normalizedText.includes(keyword)) {
                agentResponse = agentResponses[keyword];
              }
            });
            
            setTranscript(prev => [...prev, {
              id: `agent-${Date.now()}`,
              text: agentResponse,
              timestamp: new Date(),
              speaker: 'agent'
            }]);
          }, 2000);
        }
        else if (message.type === 'error') {
          setErrorMessage(message.error);
          setIsConnecting(false);
        }
      };
      
      socket.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code} ${event.reason}`);
        setIsConnected(false);
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setErrorMessage('Error en la conexión de WebSocket');
        setIsConnected(false);
        setIsConnecting(false);
      };
    } catch (error) {
      console.error('Error connecting to transcription service:', error);
      setErrorMessage(`No se pudo conectar al servicio de transcripción: ${error.message}`);
      setIsConnecting(false);
    }
  };
  
  const disconnectWebSocket = () => {
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        // Notify server that call is ending
        socketRef.current.send(JSON.stringify({
          type: 'call-ended',
          callId: callId
        }));
      }
      
      // Close after a brief delay to ensure message is sent
      setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
        setIsConnected(false);
      }, 500);
    } else {
      setIsConnected(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          {isConnected ? (
            <Mic className="h-4 w-4 text-green-500 animate-pulse" />
          ) : (
            <MicOff className="h-4 w-4 text-muted-foreground" />
          )}
          <span>Transcripción en vivo</span>
          
          <Badge variant={isConnected ? "secondary" : "outline"} className={cn(
            "ml-2",
            isConnected && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          )}>
            {isConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </CardTitle>
        
        {isConnecting && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Conectando...
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        {errorMessage ? (
          <div className="p-4 text-sm text-destructive">{errorMessage}</div>
        ) : transcript.length === 0 && !isConnecting ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground p-4">
            {isActive ? 
              "Esperando transcripción..." : 
              "La transcripción comenzará cuando la llamada esté activa"
            }
          </div>
        ) : (
          <ScrollArea className="h-[calc(100%-1rem)]" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              {transcript.map((entry) => (
                <div 
                  key={entry.id}
                  className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[80%] rounded-lg p-3
                    ${entry.speaker === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-foreground'}
                  `}>
                    <div className="text-xs mb-1 opacity-80">
                      {entry.speaker === 'user' ? 'Cliente' : 'Agente'}
                      <span className="ml-1 text-[10px]">
                        {entry.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="text-sm">{entry.text}</div>
                  </div>
                </div>
              ))}
              
              {isConnecting && (
                <div className="flex justify-center my-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveTranscription;
