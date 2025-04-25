
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Agent {
  id: string;
  name: string;
  type: 'ai' | 'human';
  status: 'available' | 'busy' | 'offline';
  specialization: string | null;
  voice_id: string | null;
  prompt_template: string | null;
}

export const useAgentsService = () => {
  const queryClient = useQueryClient();

  const { data: agents, isLoading: isLoadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name') as any;

      if (error) throw error;
      return data as Agent[];
    }
  });

  const updateAgentStatus = useMutation({
    mutationFn: async ({ agentId, status }: { agentId: string; status: Agent['status'] }) => {
      const { data, error } = await supabase
        .from('agents')
        .update({ status } as any)
        .eq('id', agentId)
        .select()
        .single() as any;

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  });

  return {
    agents,
    isLoadingAgents,
    updateAgentStatus
  };
};
