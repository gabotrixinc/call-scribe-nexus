
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
    }) => {
      try {
        const { data: twilioData, error: twilioError } = await supabase.functions.invoke('make-call', {
          body: { 
            phoneNumber: callData.caller_number,
            agentId: callData.ai_agent_id || callData.human_agent_id
          }
        });

        if (twilioError) throw new Error(`Error de Twilio: ${twilioError}`);
        if (!twilioData?.success) throw new Error(twilioData?.error || 'Error al iniciar la llamada');

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

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error starting call:', error);
        toast({
          title: 'Error al iniciar la llamada',
          description: error.message || 'No se pudo iniciar la llamada',
          variant: 'destructive'
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      toast({
        title: 'Llamada iniciada',
        description: 'La llamada se ha iniciado correctamente'
      });
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
