
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface LiveTranscriptionProps {
  callId: string;
  isActive: boolean;
}

interface TranscriptionItem {
  id: string;
  text: string;
  timestamp: string;
  source: 'ai' | 'human';
}

const LiveTranscription: React.FC<LiveTranscriptionProps> = ({ callId, isActive }) => {
  const [transcription, setTranscription] = useState<TranscriptionItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const realtimeChannelRef = useRef<any>(null);

  useEffect(() => {
    if (isActive) {
      // Load existing transcriptions
      fetchTranscriptions();

      // Subscribe to real-time updates for this call
      subscribeToTranscriptions();
    } else {
      // Stop recording if the component becomes inactive
      if (isRecording) {
        stopRecording();
      }

      // Unsubscribe from real-time updates
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    }

    return () => {
      // Cleanup
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [isActive, callId]);

  useEffect(() => {
    // Auto-scroll to the last message
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [transcription]);

  const fetchTranscriptions = async () => {
    try {
      // Check if the table exists first
      const { data, error } = await supabase
        .from('call_transcriptions')
        .select('*')
        .eq('call_id', callId)
        .order('timestamp', { ascending: true });

      if (error) {
        if (error.message.includes('relation "call_transcriptions" does not exist')) {
          console.log('Transcriptions table does not exist yet');
          setTranscription([]);
        } else {
          throw error;
        }
      } else if (data && data.length > 0) {
        setTranscription(data as TranscriptionItem[]);
      } else {
        // No transcriptions found for this call
        setTranscription([]);
      }
    } catch (error) {
      console.error("Error fetching transcriptions:", error);
      
      // Use sample data if there's an error
      setTranscription([
        {
          id: '1',
          text: 'Hola, ¿en qué puedo ayudarle?',
          timestamp: new Date().toISOString(),
          source: 'ai'
        }
      ]);
    }
  };

  const subscribeToTranscriptions = () => {
    try {
      const channel = supabase
        .channel('call-transcriptions')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'call_transcriptions',
            filter: `call_id=eq.${callId}`
          },
          (payload) => {
            const newTranscription = payload.new as TranscriptionItem;
            setTranscription(prev => [...prev, newTranscription]);
          }
        )
        .subscribe();

      realtimeChannelRef.current = channel;
    } catch (error) {
      console.error("Error setting up realtime subscription:", error);
    }
  };

  const startRecording = async () => {
    try {
      setIsProcessing(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Process audio when recording stops
        if (audioChunksRef.current.length > 0) {
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            // Convert blob to base64 for sending to server
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64data = reader.result?.toString().split(',')[1];
              
              if (base64data) {
                try {
                  // Send to edge function for transcription
                  const { data, error } = await supabase.functions.invoke('transcribe-audio', {
                    body: {
                      action: 'transcribe',
                      callId,
                      audioData: base64data
                    }
                  });

                  if (error) throw error;
                  
                  if (data && data.success) {
                    // Transcription is handled by the edge function
                    // and saved to the database, which will trigger
                    // the realtime subscription
                    console.log("Transcription processed:", data.transcription);
                  }
                } catch (transcriptionError) {
                  console.error("Error with transcription:", transcriptionError);
                  
                  // For development/demo: Add a simulated transcription
                  const newItem: TranscriptionItem = {
                    id: Date.now().toString(),
                    text: "Esto es una transcripción simulada mientras se configura el servicio de transcripción.",
                    timestamp: new Date().toISOString(),
                    source: 'human'
                  };
                  
                  setTranscription(prev => [...prev, newItem]);
                }
                
                setIsProcessing(false);
              }
            };
          } catch (error) {
            console.error("Error processing audio:", error);
            setIsProcessing(false);
          }
        }
      };
      
      // Start recording and set interval to capture audio every few seconds
      mediaRecorder.start();
      setIsRecording(true);
      
      // Set an interval to stop and restart the recorder to process chunks
      const intervalId = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          
          setTimeout(() => {
            if (isRecording && mediaRecorderRef.current) {
              mediaRecorderRef.current = new MediaRecorder(stream);
              mediaRecorderRef.current.ondataavailable = mediaRecorder.ondataavailable;
              mediaRecorderRef.current.onstop = mediaRecorder.onstop;
              mediaRecorderRef.current.start();
              audioChunksRef.current = [];
            }
          }, 500);
        }
      }, 5000); // Process audio every 5 seconds
      
      // Store the interval ID to clear it later
      mediaRecorderRef.current.intervalId = intervalId;
      
      setIsProcessing(false);
      
      toast({
        title: "Transcripción iniciada",
        description: "El micrófono está activo y la transcripción ha comenzado"
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono. Verifique los permisos.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Clear the interval if it exists
      if (mediaRecorderRef.current.intervalId) {
        clearInterval(mediaRecorderRef.current.intervalId);
      }
      
      mediaRecorderRef.current.stop();
      
      // Stop all tracks of the stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      setIsRecording(false);
      
      toast({
        title: "Transcripción detenida",
        description: "El micrófono ha sido desactivado"
      });
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (error) {
      return "00:00:00";
    }
  };

  // Add a new transcription entry (for testing or manual entry)
  const addTestEntry = async () => {
    try {
      await supabase
        .from('call_transcriptions')
        .insert({
          call_id: callId,
          text: isRecording ? "¿Podría ayudarme con mi consulta?" : "Por supuesto, estoy aquí para ayudarle. ¿Qué necesita?",
          timestamp: new Date().toISOString(),
          source: isRecording ? 'human' : 'ai'
        });
    } catch (error) {
      console.error("Error adding test transcription:", error);
      
      // Fallback - add locally if DB insertion fails
      const newItem: TranscriptionItem = {
        id: Date.now().toString(),
        text: isRecording ? "¿Podría ayudarme con mi consulta?" : "Por supuesto, estoy aquí para ayudarle. ¿Qué necesita?",
        timestamp: new Date().toISOString(),
        source: isRecording ? 'human' : 'ai'
      };
      
      setTranscription(prev => [...prev, newItem]);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex flex-col pt-6 h-full">
        <div className="flex-grow overflow-y-auto mb-4 h-[260px]" ref={scrollContainerRef}>
          {transcription.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <p>No hay transcripciones disponibles.</p>
              <p className="text-sm">Inicia la grabación para comenzar a transcribir la llamada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transcription.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex flex-col p-3 rounded-lg ${
                    item.source === 'ai' 
                      ? 'bg-secondary/50 ml-6' 
                      : 'bg-muted/60 mr-6'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      {item.source === 'ai' ? 'Agente IA' : 'Cliente'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-3">
          <Button
            variant={isRecording ? "destructive" : "default"}
            className="rounded-full w-14 h-14 p-0"
            disabled={!isActive || isProcessing}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
          
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="outline"
              className="text-xs"
              onClick={addTestEntry}
            >
              Añadir entrada de prueba
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveTranscription;
