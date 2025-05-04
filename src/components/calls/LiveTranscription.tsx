
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isStartingAudio, setIsStartingAudio] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  
  // Auto-scroll to bottom when transcript updates
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [transcript]);
  
  // Connect/disconnect based on active status
  useEffect(() => {
    if (isActive && !isConnected && !isConnecting) {
      connectToTranscriptionService();
    }
    
    if (!isActive && (isConnected || isConnecting)) {
      disconnectFromTranscriptionService();
    }
    
    return () => {
      disconnectFromTranscriptionService();
      stopAudioCapture();
    };
  }, [isActive]);
  
  // Check call status periodically
  useEffect(() => {
    if (!isActive || !callId || callId === 'test-call-id') {
      return;
    }
    
    const intervalId = setInterval(() => {
      checkCallStatus(callId);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [isActive, callId]);
  
  const checkCallStatus = async (callId: string) => {
    try {
      const { data: callData, error: callError } = await supabase
        .from('calls')
        .select('status, twilio_call_sid')
        .eq('id', callId)
        .single();
      
      if (callError || !callData) {
        console.error('Error retrieving call data:', callError);
        return;
      }
      
      if (callData.status !== 'active') {
        disconnectFromTranscriptionService();
        return;
      }
    } catch (error) {
      console.error('Error checking call status:', error);
    }
  };

  // Connect to the transcription service
  const connectToTranscriptionService = async () => {
    try {
      setIsConnecting(true);
      setErrorMessage(null);

      // Get WebSocket URL from edge function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { action: 'get-connection-info', callId }
      });

      if (error) {
        throw error;
      }

      if (!data?.websocketUrl) {
        throw new Error('No se pudo obtener la URL para la transcripción');
      }

      console.log("Connecting to WebSocket at:", data.websocketUrl);

      // Create WebSocket connection
      const socket = new WebSocket(data.websocketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setIsConnecting(false);
        
        // Send init message
        socket.send(JSON.stringify({
          type: 'init',
          callId: callId
        }));
        
        toast({
          title: "Transcripción conectada",
          description: "La transcripción en tiempo real está activa"
        });
        
        // Add demo transcription entries
        addDemoTranscriptions();
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'transcription' && message.text) {
            const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
            
            setTranscript(prev => [...prev, {
              id: `transcript-${Date.now()}-${Math.random()}`,
              text: message.text,
              timestamp,
              speaker: message.speaker || 'user'
            }]);
          }
        } catch (e) {
          console.error('Error processing WebSocket message:', e);
        }
      };

      socket.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        setIsConnected(false);
        
        if (event.code !== 1000) { // 1000 is normal closure
          setErrorMessage('La conexión con el servicio de transcripción se ha cerrado inesperadamente');
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setErrorMessage('Error en la conexión con el servicio de transcripción');
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Error connecting to transcription service:', error);
      setErrorMessage(`No se pudo conectar al servicio de transcripción: ${error.message}`);
      setIsConnected(false);
      setIsConnecting(false);
    }
  };

  const disconnectFromTranscriptionService = () => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      socketRef.current.close();
      console.log('WebSocket connection closed by client');
    }
    
    socketRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
    stopAudioCapture();
  };

  const startAudioCapture = async () => {
    try {
      setIsStartingAudio(true);
      
      if (!isConnected) {
        throw new Error('No hay conexión con el servicio de transcripción');
      }
      
      // Request permission to access microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      // Create AudioContext
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Create source node from microphone
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create processor node
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      // Connect nodes
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      // Process audio chunks
      processor.onaudioprocess = (e) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && isConnected) {
          // Convert audio data to format suitable for sending
          const inputData = e.inputBuffer.getChannelData(0);
          const audioBlob = new Blob([inputData], { type: 'audio/raw' });
          
          // Send audio to WebSocket
          socketRef.current.send(JSON.stringify({
            type: 'audio',
            audio: URL.createObjectURL(audioBlob),
            callId: callId
          }));
        }
      };
      
      setAudioEnabled(true);
      toast({
        title: "Micrófono activado",
        description: "Tu voz está siendo transcrita en tiempo real"
      });
      
    } catch (error) {
      console.error('Error starting audio capture:', error);
      setErrorMessage(`Error al iniciar la captura de audio: ${error.message}`);
      toast({
        title: "Error",
        description: `No se pudo activar el micrófono: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsStartingAudio(false);
    }
  };

  const stopAudioCapture = () => {
    // Stop all audio tracks
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    
    setAudioEnabled(false);
  };

  const toggleAudio = () => {
    if (audioEnabled) {
      stopAudioCapture();
      toast({
        title: "Micrófono desactivado",
        description: "Transcripción de voz pausada"
      });
    } else {
      startAudioCapture();
    }
  };
  
  // Add demo transcription entries for testing
  const addDemoTranscriptions = () => {
    // Add demo entries with delay to simulate real-time transcription
    const demoEntries = [
      {
        text: "Buenas tardes, llamo por el problema con mi cuenta.",
        speaker: 'user' as const
      },
      {
        text: "Entiendo, voy a ayudarte con ese problema. ¿Puedes confirmarme tu nombre y el número de cuenta por favor?",
        speaker: 'agent' as const
      },
      {
        text: "Mi nombre es Juan Pérez y mi número de cuenta es 123-456-789.",
        speaker: 'user' as const
      }
    ];
    
    demoEntries.forEach((entry, index) => {
      setTimeout(() => {
        setTranscript(prev => [...prev, {
          id: `demo-${Date.now()}-${index}`,
          text: entry.text,
          timestamp: new Date(),
          speaker: entry.speaker
        }]);
      }, 2000 * (index + 1));
    });
  };

  if (!isActive) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Selecciona la pestaña de transcripción para activarla</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Status bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">Transcripción en vivo</h3>
          <div className="flex items-center mt-1">
            <Badge
              variant={isConnected ? "outline" : "secondary"}
              className={cn(
                "mr-2",
                isConnected ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : ""
              )}
            >
              {isConnected ? "Conectado" : "Desconectado"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Call ID: {callId.substring(0, 8)}...
            </span>
          </div>
        </div>
        <Button
          onClick={toggleAudio}
          variant={audioEnabled ? "destructive" : "default"}
          disabled={!isConnected || isStartingAudio}
        >
          {isStartingAudio ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Iniciando...
            </>
          ) : audioEnabled ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Desactivar micrófono
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Activar micrófono
            </>
          )}
        </Button>
      </div>

      {/* Error message */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Transcript area */}
      {isConnecting ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Conectando al servicio de transcripción...</p>
          </div>
        </div>
      ) : (
        <div ref={scrollAreaRef} className="flex-1">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4 pb-4">
              {transcript.length === 0 ? (
                <div className="h-full flex items-center justify-center p-8 bg-muted/40 rounded-lg">
                  <p className="text-muted-foreground text-center">
                    {isConnected 
                      ? "No hay transcripciones disponibles. Activa el micrófono o espera a que se detecte audio."
                      : "Conecta al servicio de transcripción para comenzar."}
                  </p>
                </div>
              ) : (
                transcript.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "p-3 rounded-lg max-w-[85%]",
                      entry.speaker === 'agent' 
                        ? "bg-primary text-primary-foreground ml-auto" 
                        : "bg-secondary"
                    )}
                  >
                    <p>{entry.text}</p>
                    <div className="text-xs mt-1 text-right opacity-70">
                      {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default LiveTranscription;
