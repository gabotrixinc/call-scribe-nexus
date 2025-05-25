import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Hook para implementar transcripción en tiempo real con Gemini
export const useRealTimeTranscription = (callId?: string) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionItems, setTranscriptionItems] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const processingIntervalRef = useRef<number | null>(null);
  
  // Función para iniciar la transcripción en tiempo real
  const startTranscription = async (stream?: MediaStream) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      if (!callId) {
        throw new Error('ID de llamada no disponible');
      }
      
      // Usar el stream proporcionado o solicitar uno nuevo
      if (!stream && !audioStreamRef.current) {
        audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      } else if (stream) {
        audioStreamRef.current = stream;
      }
      
      if (!audioStreamRef.current) {
        throw new Error('No se pudo acceder al micrófono');
      }
      
      // Configurar el MediaRecorder para capturar audio
      const options = { mimeType: 'audio/webm' };
      mediaRecorderRef.current = new MediaRecorder(audioStreamRef.current, options);
      
      // Limpiar chunks anteriores
      audioChunksRef.current = [];
      
      // Configurar evento para recolectar datos de audio
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Iniciar grabación
      mediaRecorderRef.current.start(1000); // Capturar en intervalos de 1 segundo
      setIsTranscribing(true);
      
      // Configurar intervalo para procesar audio y obtener transcripción
      processingIntervalRef.current = window.setInterval(async () => {
        if (audioChunksRef.current.length > 0) {
          await processAudioForTranscription();
        }
      }, 3000); // Procesar cada 3 segundos
      
      setIsProcessing(false);
      return true;
    } catch (error) {
      console.error('Error al iniciar transcripción:', error);
      setError(error.message || 'Error al iniciar transcripción');
      setIsProcessing(false);
      setIsTranscribing(false);
      
      toast({
        title: 'Error de transcripción',
        description: error.message || 'No se pudo iniciar la transcripción en tiempo real',
        variant: 'destructive',
      });
      
      return false;
    }
  };
  
  // Función para procesar audio y obtener transcripción
  const processAudioForTranscription = async () => {
    try {
      if (audioChunksRef.current.length === 0) return;
      
      // Crear blob de audio con los chunks acumulados
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Limpiar chunks procesados
      audioChunksRef.current = [];
      
      // Convertir blob a base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result?.toString().split(',')[1];
          
          if (!base64Audio) {
            console.error('Error al convertir audio a base64');
            return;
          }
          
          // Enviar audio a la función edge para transcripción con Gemini
          const { data, error } = await supabase.functions.invoke('transcribe-audio', {
            body: {
              audio_base64: base64Audio,
              call_id: callId
            }
          });
          
          if (error) {
            console.error('Error en transcripción:', error);
            return;
          }
          
          if (data?.transcript) {
            // Añadir nueva transcripción a la lista
            const newTranscriptionItem = {
              id: crypto.randomUUID(),
              call_id: callId,
              text: data.transcript,
              timestamp: new Date().toISOString(),
              source: 'human'
            };
            
            setTranscriptionItems(prev => [...prev, newTranscriptionItem]);
            
            // Actualizar transcripción en la base de datos
            await updateCallTranscript(newTranscriptionItem);
          }
        } catch (processingError) {
          console.error('Error al procesar audio para transcripción:', processingError);
        }
      };
    } catch (error) {
      console.error('Error en procesamiento de audio:', error);
    }
  };
  
  // Función para actualizar la transcripción en la base de datos
  const updateCallTranscript = async (newItem: any) => {
    try {
      // Primero obtener la transcripción actual
      const { data, error } = await supabase
        .from('calls')
        .select('transcript')
        .eq('id', callId)
        .single();
      
      if (error) {
        console.error('Error al obtener transcripción:', error);
        return;
      }
      
      // Parsear transcripción existente o crear nueva
      let transcript = [];
      if (data?.transcript) {
        try {
          transcript = JSON.parse(data.transcript);
        } catch (parseError) {
          console.error('Error al parsear transcripción:', parseError);
          transcript = [];
        }
      }
      
      // Añadir nuevo item
      transcript.push(newItem);
      
      // Actualizar en la base de datos
      await supabase
        .from('calls')
        .update({
          transcript: JSON.stringify(transcript)
        })
        .eq('id', callId);
    } catch (error) {
      console.error('Error al actualizar transcripción:', error);
    }
  };
  
  // Función para detener la transcripción
  const stopTranscription = () => {
    try {
      // Detener MediaRecorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      // Limpiar intervalo de procesamiento
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
        processingIntervalRef.current = null;
      }
      
      // Procesar cualquier audio restante
      if (audioChunksRef.current.length > 0) {
        processAudioForTranscription();
      }
      
      setIsTranscribing(false);
      return true;
    } catch (error) {
      console.error('Error al detener transcripción:', error);
      setError(error.message || 'Error al detener transcripción');
      setIsTranscribing(false);
      return false;
    }
  };
  
  // Cargar transcripciones existentes si se proporciona un ID de llamada
  useEffect(() => {
    if (callId) {
      const loadTranscriptions = async () => {
        try {
          const { data, error } = await supabase
            .from('calls')
            .select('transcript')
            .eq('id', callId)
            .single();
          
          if (error) throw error;
          
          if (data?.transcript) {
            try {
              const parsedTranscript = JSON.parse(data.transcript);
              setTranscriptionItems(parsedTranscript);
            } catch (parseError) {
              console.error('Error al parsear transcripción:', parseError);
              setTranscriptionItems([]);
            }
          }
        } catch (loadError) {
          console.error('Error al cargar transcripciones:', loadError);
          setError('No se pudieron cargar las transcripciones');
        }
      };
      
      loadTranscriptions();
    }
    
    // Limpiar recursos al desmontar
    return () => {
      stopTranscription();
    };
  }, [callId]);
  
  return {
    isTranscribing,
    transcriptionItems,
    isProcessing,
    error,
    startTranscription,
    stopTranscription
  };
};
