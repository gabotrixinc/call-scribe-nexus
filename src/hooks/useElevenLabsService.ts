import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Tipos para la API de ElevenLabs
export interface ElevenLabsAgent {
  agent_id: string;
  name: string;
  description?: string;
  voice_id: string;
  system_prompt?: string;
  knowledge_base_id?: string;
  tools?: ElevenLabsAgentTool[];
  llm_model?: string;
  initial_message?: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

export interface ElevenLabsAgentTool {
  name: string;
  description: string;
  input_schema: Record<string, any>;
  authentication?: Record<string, any>;
  api_endpoint?: string;
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  preview_url?: string;
}

export interface ElevenLabsKnowledgeBase {
  knowledge_base_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Hook para gestionar la integración con ElevenLabs
export const useElevenLabsService = () => {
  const queryClient = useQueryClient();

  // Función para obtener la API key de ElevenLabs del almacenamiento local
  const getApiKey = () => {
    return localStorage.getItem('elevenlabs_api_key') || '';
  };

  // Función para guardar la API key de ElevenLabs en el almacenamiento local
  const saveApiKey = (apiKey: string) => {
    localStorage.setItem('elevenlabs_api_key', apiKey);
    return apiKey;
  };

  // Función para verificar si la API key es válida
  const verifyApiKey = async (apiKey: string) => {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error('API key inválida');
      }

      const data = await response.json();
      return { valid: true, data };
    } catch (error) {
      console.error('Error al verificar API key:', error);
      return { valid: false, error };
    }
  };

  // Mutación para guardar y verificar la API key
  const saveApiKeyMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      const verification = await verifyApiKey(apiKey);
      if (!verification.valid) {
        throw new Error('La API key proporcionada no es válida');
      }
      return saveApiKey(apiKey);
    },
    onSuccess: () => {
      toast({
        title: 'API key guardada',
        description: 'La API key de ElevenLabs ha sido guardada correctamente',
        duration: 3000,
      });
      // Invalidar consultas para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['elevenlabs-voices'] });
      queryClient.invalidateQueries({ queryKey: ['elevenlabs-agents'] });
      queryClient.invalidateQueries({ queryKey: ['elevenlabs-knowledge-bases'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo guardar la API key: ${error.message}`,
        variant: 'destructive',
        duration: 5000,
      });
    }
  });

  // Consulta para obtener voces disponibles en ElevenLabs
  const voicesQuery = useQuery({
    queryKey: ['elevenlabs-voices'],
    queryFn: async () => {
      const apiKey = getApiKey();
      if (!apiKey) {
        return [];
      }

      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener voces');
      }

      const data = await response.json();
      return data.voices as ElevenLabsVoice[];
    },
    enabled: !!getApiKey(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Consulta para obtener agentes disponibles en ElevenLabs
  const agentsQuery = useQuery({
    queryKey: ['elevenlabs-agents'],
    queryFn: async () => {
      const apiKey = getApiKey();
      if (!apiKey) {
        return [];
      }

      const response = await fetch('https://api.elevenlabs.io/v1/conversation-agents', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener agentes');
      }

      const data = await response.json();
      return data.agents as ElevenLabsAgent[];
    },
    enabled: !!getApiKey(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Consulta para obtener bases de conocimiento disponibles en ElevenLabs
  const knowledgeBasesQuery = useQuery({
    queryKey: ['elevenlabs-knowledge-bases'],
    queryFn: async () => {
      const apiKey = getApiKey();
      if (!apiKey) {
        return [];
      }

      const response = await fetch('https://api.elevenlabs.io/v1/knowledge-bases', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener bases de conocimiento');
      }

      const data = await response.json();
      return data.knowledge_bases as ElevenLabsKnowledgeBase[];
    },
    enabled: !!getApiKey(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Mutación para crear un nuevo agente en ElevenLabs
  const createAgentMutation = useMutation({
    mutationFn: async (agentData: Omit<ElevenLabsAgent, 'agent_id'>) => {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('API key no configurada');
      }

      const response = await fetch('https://api.elevenlabs.io/v1/conversation-agents', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify(agentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear agente');
      }

      const data = await response.json();
      
      // Guardar el agente en la base de datos local
      await supabase.from('ai_agents').insert({
        name: agentData.name,
        description: agentData.description || '',
        elevenlabs_agent_id: data.agent_id,
        voice_id: agentData.voice_id,
        system_prompt: agentData.system_prompt || '',
        knowledge_base_id: agentData.knowledge_base_id || null,
        llm_model: agentData.llm_model || 'gpt-3.5-turbo',
        configuration: JSON.stringify({
          initial_message: agentData.initial_message,
          temperature: agentData.temperature,
          top_p: agentData.top_p,
          max_tokens: agentData.max_tokens,
          tools: agentData.tools
        })
      });

      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Agente creado',
        description: 'El agente ha sido creado correctamente en ElevenLabs',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['elevenlabs-agents'] });
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo crear el agente: ${error.message}`,
        variant: 'destructive',
        duration: 5000,
      });
    }
  });

  // Mutación para actualizar un agente existente en ElevenLabs
  const updateAgentMutation = useMutation({
    mutationFn: async (agentData: ElevenLabsAgent) => {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('API key no configurada');
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/conversation-agents/${agentData.agent_id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify(agentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar agente');
      }

      const data = await response.json();
      
      // Actualizar el agente en la base de datos local
      await supabase.from('ai_agents')
        .update({
          name: agentData.name,
          description: agentData.description || '',
          voice_id: agentData.voice_id,
          system_prompt: agentData.system_prompt || '',
          knowledge_base_id: agentData.knowledge_base_id || null,
          llm_model: agentData.llm_model || 'gpt-3.5-turbo',
          configuration: JSON.stringify({
            initial_message: agentData.initial_message,
            temperature: agentData.temperature,
            top_p: agentData.top_p,
            max_tokens: agentData.max_tokens,
            tools: agentData.tools
          })
        })
        .eq('elevenlabs_agent_id', agentData.agent_id);

      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Agente actualizado',
        description: 'El agente ha sido actualizado correctamente en ElevenLabs',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['elevenlabs-agents'] });
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo actualizar el agente: ${error.message}`,
        variant: 'destructive',
        duration: 5000,
      });
    }
  });

  // Mutación para eliminar un agente en ElevenLabs
  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('API key no configurada');
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/conversation-agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': apiKey
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al eliminar agente');
      }
      
      // Eliminar el agente de la base de datos local
      await supabase.from('ai_agents')
        .delete()
        .eq('elevenlabs_agent_id', agentId);

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Agente eliminado',
        description: 'El agente ha sido eliminado correctamente de ElevenLabs',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['elevenlabs-agents'] });
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo eliminar el agente: ${error.message}`,
        variant: 'destructive',
        duration: 5000,
      });
    }
  });

  // Consulta para obtener agentes locales
  const localAgentsQuery = useQuery({
    queryKey: ['ai-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Función para iniciar una conversación con un agente
  const startConversation = async (agentId: string) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('API key no configurada');
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/conversation-agents/${agentId}/start-conversation`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al iniciar conversación');
    }

    const data = await response.json();
    return data.conversation_id;
  };

  return {
    // API Key
    getApiKey,
    saveApiKey: saveApiKeyMutation.mutate,
    isSavingApiKey: saveApiKeyMutation.isPending,
    
    // Voces
    voices: voicesQuery.data || [],
    isLoadingVoices: voicesQuery.isLoading,
    voicesError: voicesQuery.error,
    
    // Agentes
    agents: agentsQuery.data || [],
    isLoadingAgents: agentsQuery.isLoading,
    agentsError: agentsQuery.error,
    
    // Bases de conocimiento
    knowledgeBases: knowledgeBasesQuery.data || [],
    isLoadingKnowledgeBases: knowledgeBasesQuery.isLoading,
    knowledgeBasesError: knowledgeBasesQuery.error,
    
    // Agentes locales
    localAgents: localAgentsQuery.data || [],
    isLoadingLocalAgents: localAgentsQuery.isLoading,
    localAgentsError: localAgentsQuery.error,
    
    // Mutaciones
    createAgent: createAgentMutation.mutate,
    isCreatingAgent: createAgentMutation.isPending,
    
    updateAgent: updateAgentMutation.mutate,
    isUpdatingAgent: updateAgentMutation.isPending,
    
    deleteAgent: deleteAgentMutation.mutate,
    isDeletingAgent: deleteAgentMutation.isPending,
    
    // Conversaciones
    startConversation
  };
};
