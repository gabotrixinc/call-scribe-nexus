
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Call {
  id: string;
  caller_number: string;
  caller_name: string | null;
  status: 'active' | 'queued' | 'completed' | 'abandoned';
  start_time: string;
  end_time: string | null;
  duration: number | null;
  recording_url: string | null;
  transcript: string | null;
  ai_agent_id: string | null;
  human_agent_id: string | null;
  sentiment_score: number | null;
  intent: string | null;
}

export const useCallsService = () => {
  const queryClient = useQueryClient();

  const { data: activeCalls, isLoading: isLoadingActiveCalls } = useQuery({
    queryKey: ['calls', 'active'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase
          .from('calls') as any)
          .select('*')
          .eq('status', 'active');

        if (error) throw error;
        return data as Call[];
      } catch (error) {
        console.error('Error fetching active calls:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las llamadas activas',
          variant: 'destructive'
        });
        return [];
      }
    }
  });

  const { data: callMetrics, isLoading: isLoadingCallMetrics } = useQuery({
    queryKey: ['calls', 'metrics'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase
          .from('quality_metrics') as any)
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching call metrics:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las métricas de llamadas',
          variant: 'destructive'
        });
        return [];
      }
    }
  });

  const { data: completedCalls, isLoading: isLoadingCompletedCalls } = useQuery({
    queryKey: ['calls', 'completed'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase
          .from('calls') as any)
          .select('*')
          .eq('status', 'completed')
          .order('end_time', { ascending: false })
          .limit(50);

        if (error) throw error;
        return data as Call[];
      } catch (error) {
        console.error('Error fetching completed calls:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las llamadas completadas',
          variant: 'destructive'
        });
        return [];
      }
    }
  });

  const startCall = useMutation({
    mutationFn: async (callData: Partial<Call>) => {
      try {
        const { data, error } = await (supabase
          .from('calls') as any)
          .insert([{ ...callData, status: 'active' }])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error starting call:', error);
        toast({
          title: 'Error',
          description: 'No se pudo iniciar la llamada',
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
        const { data, error } = await (supabase
          .from('calls') as any)
          .update({
            status: 'completed',
            end_time: new Date().toISOString(),
            duration: 300 // placeholder duration in seconds
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
        const { data, error } = await (supabase
          .from('calls') as any)
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
    activeCalls,
    isLoadingActiveCalls,
    callMetrics,
    isLoadingCallMetrics,
    completedCalls,
    isLoadingCompletedCalls,
    startCall,
    endCall,
    abandonCall
  };
};
