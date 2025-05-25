import { useEffect, useState } from 'react';
import { useElevenLabsService } from './useElevenLabsService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Hook para integrar agentes de IA en llamadas
export const useAIAgentCalls = (callId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [wsConnection, setWsConnection] = useState<any>(null);
  
  const {
    elevenLabsAgents,
    isLoadingElevenLabsAgents,
    startConversation,
    getWebSocketConnection,
    registerAgentTool,
    createDatabaseQueryTool,
    createAgentCreationTool
  } = useElevenLabsService();

  // Iniciar una llamada con un agente de IA
  const startAIAgentCall = async (agentId: string, phoneNumber: string) => {
    try {
      setIsProcessing(true);
      
      // 1. Registrar herramientas para el agente si no están ya registradas
      await registerAgentTool.mutateAsync({
        agentId,
        tool: createDatabaseQueryTool()
      });
      
      await registerAgentTool.mutateAsync({
        agentId,
        tool: createAgentCreationTool()
      });
      
      // 2. Iniciar conversación con el agente
      const conversationResponse = await startConversation.mutateAsync({
        agentId,
        metadata: {
          caller_number: phoneNumber,
          call_id: callId,
          source: 'contact_center'
        }
      });
      
      setConversationId(conversationResponse.id);
      
      // 3. Establecer conexión WebSocket
      const connection = getWebSocketConnection(agentId, handleWebSocketMessage);
      setWsConnection(connection);
      
      // 4. Enviar contexto inicial
      connection.sendContextualUpdate(`Llamada iniciada con el número ${phoneNumber}. El agente debe presentarse y atender al cliente.`);
      
      setIsConnected(true);
      setIsProcessing(false);
      
      return true;
    } catch (error) {
      console.error('Error al iniciar llamada con agente IA:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar la llamada con el agente de IA',
        variant: 'destructive'
      });
      setIsProcessing(false);
      return false;
    }
  };
  
  // Manejar mensajes recibidos por WebSocket
  const handleWebSocketMessage = (data: any) => {
    console.log('Mensaje WebSocket recibido:', data);
    
    // Procesar diferentes tipos de mensajes
    if (data.type === 'agent_response') {
      // Respuesta de texto del agente
      addMessage({
        role: 'assistant',
        content: data.agent_response_event.text,
        timestamp: new Date().toISOString()
      });
      
      // Guardar en la base de datos si hay un callId
      if (callId) {
        saveMessageToDatabase({
          call_id: callId,
          text: data.agent_response_event.text,
          source: 'ai',
          timestamp: new Date().toISOString()
        });
      }
    } else if (data.type === 'audio') {
      // Audio generado por el agente (TTS)
      // Aquí se podría reproducir el audio o enviarlo a Twilio
      console.log('Audio recibido del agente');
    } else if (data.type === 'client_tool_call') {
      // El agente quiere ejecutar una herramienta
      handleToolCall(data.client_tool_call);
    }
  };
  
  // Manejar llamadas a herramientas
  const handleToolCall = async (toolCall: any) => {
    try {
      console.log('Llamada a herramienta:', toolCall);
      
      const { tool_name, tool_call_id, parameters } = toolCall;
      
      let result;
      
      // Ejecutar la herramienta según su nombre
      if (tool_name === 'query_database') {
        // Consultar base de datos
        const { table, filters, limit } = parameters;
        
        let query = supabase.from(table).select('*');
        
        // Aplicar filtros
        if (filters) {
          for (const [column, value] of Object.entries(filters)) {
            query = query.eq(column, value);
          }
        }
        
        // Aplicar límite
        if (limit) {
          query = query.limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        result = { success: true, data };
      } else if (tool_name === 'create_new_agent') {
        // Crear nuevo agente
        const { name, description, voice_id, model_id, system_prompt } = parameters;
        
        // Llamar a la API de ElevenLabs para crear el agente
        const response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY || ''
          },
          body: JSON.stringify({
            name,
            description,
            voice_id,
            model_id,
            system_prompt
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Error al crear agente');
        }
        
        const data = await response.json();
        
        // Registrar en base de datos local
        await supabase.from('agents').insert([{
          name,
          description,
          type: 'ai',
          status: 'available',
          elevenlabs_id: data.id,
          voice_id,
          model_id
        }]);
        
        result = { success: true, agent_id: data.id };
      } else {
        result = { success: false, error: `Herramienta desconocida: ${tool_name}` };
      }
      
      // Enviar resultado de la herramienta al agente
      if (wsConnection) {
        wsConnection.sendToolResult(tool_call_id, result);
      }
    } catch (error) {
      console.error('Error al ejecutar herramienta:', error);
      
      // Enviar error al agente
      if (wsConnection && toolCall.tool_call_id) {
        wsConnection.sendToolResult(toolCall.tool_call_id, {
          success: false,
          error: error.message
        });
      }
    }
  };
  
  // Enviar mensaje de texto al agente
  const sendMessage = (text: string) => {
    if (!wsConnection || !isConnected) {
      toast({
        title: 'Error',
        description: 'No hay conexión con el agente de IA',
        variant: 'destructive'
      });
      return;
    }
    
    // Añadir mensaje a la lista local
    addMessage({
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    });
    
    // Guardar en la base de datos si hay un callId
    if (callId) {
      saveMessageToDatabase({
        call_id: callId,
        text,
        source: 'human',
        timestamp: new Date().toISOString()
      });
    }
    
    // Enviar al WebSocket
    wsConnection.sendText(text);
  };
  
  // Enviar audio al agente
  const sendAudio = (audioBase64: string) => {
    if (!wsConnection || !isConnected) {
      toast({
        title: 'Error',
        description: 'No hay conexión con el agente de IA',
        variant: 'destructive'
      });
      return;
    }
    
    wsConnection.sendAudio(audioBase64);
  };
  
  // Finalizar la llamada con el agente
  const endAIAgentCall = () => {
    if (wsConnection) {
      wsConnection.close();
      setWsConnection(null);
    }
    
    setIsConnected(false);
    setConversationId(null);
    
    // Actualizar estado de la llamada en la base de datos
    if (callId) {
      supabase
        .from('calls')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', callId)
        .then(({ error }) => {
          if (error) {
            console.error('Error al actualizar estado de llamada:', error);
          }
        });
    }
  };
  
  // Añadir mensaje a la lista local
  const addMessage = (message: any) => {
    setMessages((prev) => [...prev, message]);
  };
  
  // Guardar mensaje en la base de datos
  const saveMessageToDatabase = async (message: {
    call_id: string;
    text: string;
    source: 'human' | 'ai';
    timestamp: string;
  }) => {
    try {
      // Primero obtener el transcript actual
      const { data: callData, error: fetchError } = await supabase
        .from('calls')
        .select('transcript')
        .eq('id', message.call_id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Parsear el transcript existente o crear uno nuevo
      let transcript = [];
      if (callData?.transcript) {
        try {
          transcript = JSON.parse(callData.transcript);
        } catch (e) {
          console.error('Error al parsear transcript:', e);
          transcript = [];
        }
      }
      
      // Añadir el nuevo mensaje
      transcript.push({
        id: crypto.randomUUID(),
        call_id: message.call_id,
        text: message.text,
        timestamp: message.timestamp,
        source: message.source
      });
      
      // Actualizar en la base de datos
      const { error: updateError } = await supabase
        .from('calls')
        .update({
          transcript: JSON.stringify(transcript)
        })
        .eq('id', message.call_id);
      
      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error al guardar mensaje en la base de datos:', error);
    }
  };
  
  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);
  
  return {
    isConnected,
    isProcessing,
    conversationId,
    messages,
    elevenLabsAgents,
    isLoadingElevenLabsAgents,
    startAIAgentCall,
    sendMessage,
    sendAudio,
    endAIAgentCall
  };
};
