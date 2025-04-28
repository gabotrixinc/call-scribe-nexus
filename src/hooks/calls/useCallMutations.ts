
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { CallInsert } from '@/types/calls';

export const useCallMutations = () => {
  const queryClient = useQueryClient();

  const startCall = useMutation({
    mutationFn: async (callData: {
      caller_number: string;
      caller_name?: string | null;
      ai_agent_id?: string | null;
      human_agent_id?: string | null;
      start_time: string;
      test_mode?: boolean;
    }) => {
      try {
        console.log(`Iniciando llamada a: ${callData.caller_number}`);
        
        const testMode = callData.test_mode || false;
        if (testMode) {
          console.log('Modo de prueba activado para llamadas');
        }
        
        const { data: twilioData, error: twilioError } = await supabase.functions.invoke('make-call', {
          body: { 
            phoneNumber: callData.caller_number,
            agentId: callData.ai_agent_id || callData.human_agent_id,
            testMode
          }
        });

        if (twilioError) {
          console.error('Error invocando la función make-call:', twilioError);
          throw new Error(`Error de Twilio: ${twilioError.message || 'Error desconocido'}`);
        }
        
        if (!twilioData?.success) {
          console.error('La función make-call reportó un error:', twilioData?.error || 'Error desconocido');
          throw new Error(twilioData?.error || 'Error al iniciar la llamada');
        }
        
        console.log('Respuesta de Twilio:', twilioData);

        if (testMode) {
          // Return a test object with explicit type that includes test_mode
          return {
            id: 'test-call-id',
            caller_number: callData.caller_number,
            status: 'test',
            test_mode: true as const // Using const assertion to clarify the type
          };
        }

        const newCall: CallInsert = {
          caller_number: callData.caller_number,
          caller_name: callData.caller_name || null,
          status: 'active',
          start_time: callData.start_time,
          ai_agent_id: callData.ai_agent_id || null,
          human_agent_id: callData.human_agent_id || null,
          twilio_call_sid: twilioData?.callSid || null
        };

        const { data, error } = await supabase
          .from('calls')
          .insert(newCall)
          .select()
          .single();

        if (error) {
          console.error('Error al insertar la llamada en la base de datos:', error);
          throw error;
        }
        
        console.log('Llamada registrada en la base de datos:', data);
        return data;
      } catch (error) {
        console.error('Error starting call:', error);
        let errorMessage = 'No se pudo iniciar la llamada';
        
        if (error.message) {
          errorMessage = error.message;
          
          // Mejorar los mensajes de error específicos de Twilio
          if (error.message.includes('21215')) {
            errorMessage = 'Error de Twilio: El número no está autorizado para llamadas internacionales. Debe habilitar permisos geográficos en su cuenta de Twilio: https://www.twilio.com/console/voice/calls/geo-permissions/low-risk';
          } else if (error.message.includes('20003')) {
            errorMessage = 'Error de Twilio: Autenticación fallida. Verifique las credenciales de Twilio.';
          } else if (error.message.includes('21606')) {
            errorMessage = 'Error de Twilio: El número de teléfono de origen no es válido o no está verificado.';
          } else if (error.message.includes('13214')) {
            errorMessage = 'Error de Twilio: Error de configuración TwiML. Verifique la URL de TwiML.';
          } else if (error.message.includes('non-2xx status code')) {
            errorMessage = 'Error de conexión con el servicio. Revise los logs de la Edge Function para más detalles.';
          }
        }
        
        toast({
          title: 'Error al iniciar la llamada',
          description: errorMessage,
          variant: 'destructive'
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      // Type guard to check if the response is from test mode
      if ('test_mode' in data && data.test_mode === true) {
        toast({
          title: 'Prueba exitosa',
          description: 'La conexión con Twilio funciona correctamente'
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['calls'] });
        toast({
          title: 'Llamada iniciada',
          description: 'La llamada se ha iniciado correctamente'
        });
      }
    }
  });

  const endCall = useMutation({
    mutationFn: async (callId: string) => {
      try {
        const { data, error } = await supabase
          .from('calls')
          .update({
            status: 'completed',
            end_time: new Date().toISOString(),
            duration: 300
          })
          .eq('id', callId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error ending call:', error);
        toast({
          title: 'Error',
          description: 'No se pudo finalizar la llamada',
          variant: 'destructive'
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      toast({
        title: 'Llamada finalizada',
        description: 'La llamada ha sido finalizada correctamente'
      });
    }
  });

  const abandonCall = useMutation({
    mutationFn: async (callId: string) => {
      try {
        const { data, error } = await supabase
          .from('calls')
          .update({
            status: 'abandoned',
            end_time: new Date().toISOString()
          })
          .eq('id', callId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error abandoning call:', error);
        toast({
          title: 'Error',
          description: 'No se pudo abandonar la llamada',
          variant: 'destructive'
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      toast({
        title: 'Llamada abandonada',
        description: 'La llamada ha sido marcada como abandonada'
      });
    }
  });

  return {
    startCall,
    endCall,
    abandonCall
  };
};
