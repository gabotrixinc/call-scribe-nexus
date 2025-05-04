
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

  useEffect(() => {
    if (isActive) {
      // Cargar transcripciones existentes al activar el componente
      const fetchTranscriptions = async () => {
        try {
          // Simulamos datos de transcripción ya que la tabla call_transcriptions no existe todavía
          const mockTranscriptions: TranscriptionItem[] = [
            {
              id: '1',
              text: 'Hola, ¿en qué puedo ayudarle?',
              timestamp: new Date().toISOString(),
              source: 'ai'
            },
            {
              id: '2',
              text: 'Necesito información sobre mi factura',
              timestamp: new Date().toISOString(),
              source: 'human'
            }
          ];
          
          setTranscription(mockTranscriptions);
        } catch (error) {
          console.error("Error fetching transcriptions:", error);
        }
      };

      fetchTranscriptions();
    } else {
      // Si el componente se desactiva, detener la grabación
      if (isRecording) {
        stopRecording();
      }
    }

    return () => {
      // Limpiar recursos al desmontar
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isActive, callId]);

  useEffect(() => {
    // Auto-scroll al último mensaje
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [transcription]);

  // Simular la llegada de transcripciones para demo
  useEffect(() => {
    if (!isActive || !isRecording) return;
    
    const interval = setInterval(() => {
      // Simular nuevas transcripciones cada 5 segundos cuando está grabando
      if (isRecording && !isProcessing) {
        const mockTranscriptions = [
          "Hola, gracias por llamar. ¿En qué puedo ayudarle?",
          "Entiendo su problema, vamos a revisarlo.",
          "Permítame consultar esa información en el sistema.",
          "Su caso ha sido registrado con el número #45678.",
          "¿Hay algo más en lo que pueda ayudarle?"
        ];
        
        const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
        
        const newItem: TranscriptionItem = {
          id: Date.now().toString(),
          text: randomText,
          timestamp: new Date().toISOString(),
          source: Math.random() > 0.5 ? 'ai' : 'human'
        };
        
        setTranscription(prev => [...prev, newItem]);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isActive, isRecording, isProcessing]);

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
        // Procesar audio cuando se detiene la grabación
        if (audioChunksRef.current.length > 0) {
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            // Convertir blob a base64 para enviar al servidor
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64data = reader.result?.toString().split(',')[1];
              
              if (base64data) {
                // En un escenario real, enviaríamos el audio para transcripción
                console.log("Audio grabado y listo para transcribir");
                
                // Simular procesamiento
                setTimeout(() => {
                  const newItem: TranscriptionItem = {
                    id: Date.now().toString(),
                    text: "He entendido su consulta. Déjeme verificar esa información.",
                    timestamp: new Date().toISOString(),
                    source: 'human'
                  };
                  
                  setTranscription(prev => [...prev, newItem]);
                  setIsProcessing(false);
                }, 1500);
              }
            };
          } catch (error) {
            console.error("Error processing audio:", error);
            setIsProcessing(false);
          }
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
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
      mediaRecorderRef.current.stop();
      
      // Detener todos los tracks del stream
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

        <div className="flex justify-center">
          <Button
            variant={isRecording ? "destructive" : "default"}
            className="rounded-full w-16 h-16 p-0"
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
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveTranscription;
