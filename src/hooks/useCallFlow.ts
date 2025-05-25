// Implementación de gestión de permisos de micrófono y flujo de llamadas
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Hook para gestionar el flujo de llamadas y permisos de micrófono
export const useCallFlow = (callId?: string) => {
  const [callStatus, setCallStatus] = useState<'idle' | 'requesting_permissions' | 'connecting' | 'connected' | 'ended'>('idle');
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isProcessingCall, setIsProcessingCall] = useState(false);
  const [callDetails, setCallDetails] = useState<any>(null);
  
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const callIntervalRef = useRef<number | null>(null);
  
  // Función para solicitar permisos de micrófono de manera explícita
  const requestMicrophonePermission = async () => {
    try {
      setCallStatus('requesting_permissions');
      console.log('Solicitando permisos de micrófono explícitamente...');
      
      // Solicitar permisos de micrófono con opciones específicas para llamadas
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Guardar la referencia al stream para uso posterior
      audioStreamRef.current = stream;
      
      // Crear contexto de audio para procesamiento
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      console.log('Permisos de micrófono concedidos correctamente');
      setMicPermission('granted');
      
      // Mostrar notificación de éxito
      toast({
        title: 'Permisos de micrófono concedidos',
        description: 'El micrófono está listo para la llamada.',
        duration: 3000,
      });
      
      return true;
    } catch (error) {
      console.error('Error al solicitar permisos de micrófono:', error);
      setMicPermission('denied');
      setCallStatus('idle');
      
      // Mostrar notificación de error con instrucciones
      toast({
        title: 'Permisos de micrófono denegados',
        description: 'Se requieren permisos de micrófono para realizar llamadas. Por favor, habilite el micrófono en la configuración de su navegador y vuelva a intentarlo.',
        variant: 'destructive',
        duration: 10000,
      });
      
      return false;
    }
  };

  // Función para iniciar una llamada con verificación de permisos
  const initiateCall = async (phoneNumber: string, agentId?: string) => {
    try {
      setIsProcessingCall(true);
      
      // 1. Verificar permisos de micrófono primero
      if (micPermission !== 'granted') {
        const permissionGranted = await requestMicrophonePermission();
        if (!permissionGranted) {
          setIsProcessingCall(false);
          return null;
        }
      }
      
      // 2. Iniciar la llamada solo si tenemos permisos
      setCallStatus('connecting');
      
      // Mostrar notificación de conexión
      toast({
        title: 'Conectando llamada',
        description: `Estableciendo conexión con ${phoneNumber}...`,
        duration: 5000,
      });
      
      // 3. Invocar la función edge con el nuevo parámetro para prevenir duplicación
      const { data: twilioData, error: twilioError } = await supabase.functions.invoke('make-call', {
        body: { 
          phoneNumber: phoneNumber,
          agentId: agentId,
          direction: 'outbound',
          preventDuplicateCall: true // Parámetro clave para evitar duplicación
        }
      });

      if (twilioError || !twilioData?.success) {
        throw new Error(twilioError?.message || twilioData?.error || 'Error al iniciar la llamada');
      }
      
      // 4. Registrar la llamada en la base de datos
      const { data: callRecord, error: dbError } = await supabase
        .from('calls')
        .insert({
          caller_number: phoneNumber,
          caller_name: null,
          status: 'active',
          start_time: new Date().toISOString(),
          ai_agent_id: agentId || null,
          human_agent_id: null,
          twilio_call_sid: twilioData?.callSid || null,
          transcript: JSON.stringify([{
            id: crypto.randomUUID(),
            call_id: 'pending',
            text: 'Llamada iniciada. Conectando...',
            timestamp: new Date().toISOString(),
            source: 'system'
          }])
        })
        .select()
        .single();
      
      if (dbError) {
        throw dbError;
      }
      
      // 5. Configurar monitoreo de estado de la llamada
      setupCallStatusMonitoring(twilioData.callSid, callRecord.id);
      
      // 6. Habilitar audio para la llamada
      setIsAudioEnabled(true);
      setCallStatus('connected');
      setCallDetails(callRecord);
      
      // Notificar conexión exitosa
      toast({
        title: 'Llamada conectada',
        description: `Conectado con ${phoneNumber}`,
        duration: 3000,
      });
      
      setIsProcessingCall(false);
      return callRecord;
    } catch (error) {
      console.error('Error al iniciar llamada:', error);
      setCallStatus('idle');
      setIsProcessingCall(false);
      
      // Notificar error
      toast({
        title: 'Error al iniciar la llamada',
        description: error.message || 'No se pudo establecer la llamada',
        variant: 'destructive',
        duration: 5000,
      });
      
      return null;
    }
  };

  // Función para monitorear el estado de la llamada en Twilio
  const setupCallStatusMonitoring = (callSid: string, localCallId: string) => {
    // Limpiar cualquier intervalo existente
    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current);
    }
    
    // Configurar intervalo para verificar estado cada 3 segundos
    callIntervalRef.current = window.setInterval(async () => {
      try {
        const { data: statusData, error: statusError } = await supabase.functions.invoke('make-call', {
          body: {
            action: 'check-call-status',
            callSid
          }
        });
        
        if (statusError) {
          console.error('Error al verificar estado de llamada:', statusError);
          return;
        }
        
        console.log('Estado actual de la llamada:', statusData?.status);
        
        // Si la llamada ha terminado, actualizar estado
        if (statusData?.status === 'completed' || 
            statusData?.status === 'failed' || 
            statusData?.status === 'busy' || 
            statusData?.status === 'no-answer' ||
            statusData?.status === 'canceled') {
          
          clearInterval(callIntervalRef.current!);
          callIntervalRef.current = null;
          
          // Actualizar estado local
          setCallStatus('ended');
          setIsAudioEnabled(false);
          
          // Actualizar en base de datos
          await supabase
            .from('calls')
            .update({
              status: 'completed',
              end_time: new Date().toISOString()
            })
            .eq('id', localCallId);
          
          // Liberar recursos de audio
          cleanupAudioResources();
          
          // Notificar finalización
          toast({
            title: 'Llamada finalizada',
            description: `La llamada ha terminado (${statusData?.status})`,
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error en monitoreo de llamada:', error);
      }
    }, 3000);
  };

  // Función para finalizar una llamada
  const terminateCall = async () => {
    try {
      if (!callId && !callDetails?.id) {
        throw new Error('ID de llamada no disponible');
      }
      
      setIsProcessingCall(true);
      
      // Obtener el SID de Twilio para finalizar la llamada
      const { data: callData } = await supabase
        .from('calls')
        .select('twilio_call_sid')
        .eq('id', callId || callDetails?.id)
        .single();
        
      if (callData?.twilio_call_sid) {
        // Finalizar la llamada en Twilio
        await supabase.functions.invoke('make-call', {
          body: {
            action: 'end-call',
            callSid: callData.twilio_call_sid
          }
        });
      }
      
      // Actualizar el estado de la llamada en la base de datos
      await supabase
        .from('calls')
        .update({
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('id', callId || callDetails?.id);
      
      // Actualizar estado local
      setCallStatus('ended');
      setIsAudioEnabled(false);
      
      // Limpiar intervalo de monitoreo
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current);
        callIntervalRef.current = null;
      }
      
      // Liberar recursos de audio
      cleanupAudioResources();
      
      // Notificar finalización
      toast({
        title: 'Llamada finalizada',
        description: 'La llamada ha sido finalizada correctamente',
        duration: 3000,
      });
      
      setIsProcessingCall(false);
      return true;
    } catch (error) {
      console.error('Error al finalizar llamada:', error);
      setIsProcessingCall(false);
      
      // Notificar error
      toast({
        title: 'Error al finalizar la llamada',
        description: error.message || 'No se pudo finalizar la llamada',
        variant: 'destructive',
        duration: 5000,
      });
      
      return false;
    }
  };

  // Función para limpiar recursos de audio
  const cleanupAudioResources = () => {
    // Detener y liberar stream de audio
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Pista de audio detenida: ${track.kind}`);
      });
      audioStreamRef.current = null;
    }
    
    // Cerrar contexto de audio
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(err => console.error('Error al cerrar contexto de audio:', err));
      audioContextRef.current = null;
    }
    
    console.log('Recursos de audio liberados correctamente');
  };

  // Cargar detalles de la llamada si se proporciona un ID
  useEffect(() => {
    if (callId) {
      const fetchCallDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('calls')
            .select('*')
            .eq('id', callId)
            .single();
          
          if (error) throw error;
          
          setCallDetails(data);
          
          // Establecer estado según datos de la llamada
          if (data.status === 'active') {
            setCallStatus('connected');
            
            // Solicitar permisos de micrófono si la llamada está activa
            if (micPermission === 'pending') {
              requestMicrophonePermission();
            }
            
            // Configurar monitoreo si hay un SID de Twilio
            if (data.twilio_call_sid) {
              setupCallStatusMonitoring(data.twilio_call_sid, data.id);
            }
          } else {
            setCallStatus('ended');
          }
        } catch (error) {
          console.error('Error al cargar detalles de la llamada:', error);
          
          toast({
            title: 'Error',
            description: 'No se pudieron cargar los detalles de la llamada',
            variant: 'destructive',
            duration: 5000,
          });
        }
      };
      
      fetchCallDetails();
    }
    
    // Limpiar recursos al desmontar
    return () => {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current);
        callIntervalRef.current = null;
      }
      
      cleanupAudioResources();
    };
  }, [callId]);

  return {
    callStatus,
    micPermission,
    isAudioEnabled,
    isProcessingCall,
    callDetails,
    requestMicrophonePermission,
    initiateCall,
    terminateCall,
    audioStream: audioStreamRef.current,
    audioContext: audioContextRef.current
  };
};
