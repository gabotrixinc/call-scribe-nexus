
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
      try {
        const { data, error } = await (supabase
          .from('agents') as any)
          .select('*')
          .order('name');

        if (error) throw error;
        return data as Agent[];
      } catch (error) {
        console.error('Error fetching agents:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los agentes',
          variant: 'destructive'
        });
        return [];
      }
    }
  });

  const updateAgentStatus = useMutation({
    mutationFn: async ({ agentId, status }: { agentId: string; status: Agent['status'] }) => {
      try {
        const { data, error } = await (supabase
          .from('agents') as any)
          .update({ status })
          .eq('id', agentId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating agent status:', error);
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el estado del agente',
          variant: 'destructive'
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast({
        title: 'Estado actualizado',
        description: 'El estado del agente ha sido actualizado correctamente'
      });
    }
  });

  const createAgent = useMutation({
    mutationFn: async (newAgent: Omit<Agent, 'id'>) => {
      try {
        const { data, error } = await (supabase
          .from('agents') as any)
          .insert([newAgent])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating agent:', error);
        toast({
          title: 'Error',
          description: 'No se pudo crear el agente',
          variant: 'destructive'
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast({
        title: 'Agente creado',
        description: 'El agente ha sido creado correctamente'
      });
    }
  });

  const deleteAgent = useMutation({
    mutationFn: async (agentId: string) => {
      try {
        const { error } = await (supabase
          .from('agents') as any)
          .delete()
          .eq('id', agentId);

        if (error) throw error;
        return agentId;
      } catch (error) {
        console.error('Error deleting agent:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el agente',
          variant: 'destructive'
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast({
        title: 'Agente eliminado',
        description: 'El agente ha sido eliminado correctamente'
      });
    }
  });

  return {
    agents,
    isLoadingAgents,
    updateAgentStatus,
    createAgent,
    deleteAgent
  };
};
