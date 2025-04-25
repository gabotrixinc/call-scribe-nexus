
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      return data as Call[];
    }
  });

  const { data: callMetrics } = useQuery({
    queryKey: ['calls', 'metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quality_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    }
  });

  const startCall = useMutation({
    mutationFn: async (callData: Partial<Call>) => {
      const { data, error } = await supabase
        .from('calls')
        .insert([{ ...callData, status: 'active' }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
    }
  });

  return {
    activeCalls,
    isLoadingActiveCalls,
    callMetrics,
    startCall
  };
};
