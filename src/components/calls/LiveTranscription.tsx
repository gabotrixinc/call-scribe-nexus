import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/integrations/supabase/client';

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
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsConnected(true);
      
      setTranscript([
        {
          id: '1',
          text: "Hola, gracias por llamar a nuestro centro de atención.",
          timestamp: new Date(),
          speaker: 'agent'
        }
      ]);
      
      simulateTranscriptions();
    } catch (error) {
      console.error('Error connecting to transcription service:', error);
      setErrorMessage(`No se pudo conectar al servicio de transcripción: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  };
  
  const simulateTranscriptions = () => {
    const userPhrases = [
      "Hola, necesito ayuda con mi factura.",
      "Mi número de cuenta es 12345.",
      "No entiendo por qué me están cobrando este cargo.",
      "¿Podrían revisarlo por favor?",
      "Gracias por la información."
    ];
    
    const agentPhrases = [
      "Con gusto le ayudo. ¿Podría proporcionarme su número de cuenta?",
      "Déjeme revisar esa información para usted.",
      "Entiendo su preocupación, estoy verificando los detalles.",
      "Encontré el problema. Parece haber un cargo duplicado.",
      "He procesado el reembolso. Debería reflejarse en 3-5 días hábiles."
    ];
    
    let counter = 0;
    
    const interval = setInterval(() => {
      if (counter >= 5 || !isActive) {
        clearInterval(interval);
        return;
      }
      
      setTranscript(prev => [
        ...prev, 
        {
          id: `user-${Date.now()}`,
          text: userPhrases[counter],
          timestamp: new Date(),
          speaker: 'user'
        }
      ]);
      
      setTimeout(() => {
        if (!isActive) return;
        
        setTranscript(prev => [
          ...prev, 
          {
            id: `agent-${Date.now()}`,
            text: agentPhrases[counter],
            timestamp: new Date(),
            speaker: 'agent'
          }
        ]);
      }, 2000);
      
      counter++;
    }, 5000);
    
    return () => clearInterval(interval);
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
