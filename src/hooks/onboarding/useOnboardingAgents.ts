
import { useState } from 'react';
import { useAgentsService } from '@/hooks/useAgentsService';
import { AgentConfig } from '@/types/onboarding';
import { toast } from '@/components/ui/use-toast';

export const useOnboardingAgents = () => {
  const [isCreatingAgents, setIsCreatingAgents] = useState(false);
  const [createdAgents, setCreatedAgents] = useState<AgentConfig[]>([]);
  const { createAgent } = useAgentsService();

  const createAgentsFromConfig = async (agentConfigs: AgentConfig[]) => {
    if (!agentConfigs || agentConfigs.length === 0) {
      return [];
    }

    setIsCreatingAgents(true);
    const createdAgentsArray: AgentConfig[] = [];

    try {
      // Create each agent sequentially to avoid race conditions
      for (const config of agentConfigs) {
        try {
          // Make sure the status is one of the allowed values in database schema
          // Convert "online" to "available" if needed
          let status = config.status;
          
          // Make sure the status is one of the allowed values or default to 'available'
          if (!['available', 'busy', 'offline', 'online'].includes(status)) {
            status = 'available';
          }
          
          const result = await createAgent.mutateAsync({
            name: config.name,
            type: config.type,
            status: status,
            specialization: config.specialization,
            prompt_template: config.prompt_template,
            voice_id: config.voice_id
          });
          
          console.log(`Agent created: ${result.name}`);
          createdAgentsArray.push({
            ...config,
            // Make sure the created agent has the status that was actually saved
            status: result.status as 'available' | 'busy' | 'offline' | 'online'
          });
        } catch (error) {
          console.error(`Error creating agent: ${config.name}`, error);
          toast({
            title: 'Error al crear agente',
            description: `No se pudo crear el agente "${config.name}"`,
            variant: 'destructive'
          });
        }
      }
      
      setCreatedAgents(createdAgentsArray);
      
      if (createdAgentsArray.length > 0) {
        toast({
          title: 'Agentes creados',
          description: `Se han creado ${createdAgentsArray.length} agentes correctamente`
        });
      }
      
      return createdAgentsArray;
    } catch (error) {
      console.error('Error creating agents:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron crear todos los agentes',
        variant: 'destructive'
      });
      return createdAgentsArray;
    } finally {
      setIsCreatingAgents(false);
    }
  };

  return {
    createAgentsFromConfig,
    isCreatingAgents,
    createdAgents
  };
};
