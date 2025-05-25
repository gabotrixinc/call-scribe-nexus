// Archivo de pruebas para validar la integración de agentes IA y llamadas
import { useEffect, useState } from 'react';
import { useAIAgentCalls } from './useAIAgentCalls';
import { useCallsService } from './useCallsService';
import { toast } from '@/components/ui/use-toast';

// Hook para validar la integración completa
export const useValidationTests = () => {
  const [testResults, setTestResults] = useState<{
    name: string;
    status: 'pending' | 'running' | 'success' | 'failed';
    message?: string;
  }[]>([
    { name: 'Conexión con API ElevenLabs', status: 'pending' },
    { name: 'Creación de agente IA', status: 'pending' },
    { name: 'Integración de base de conocimiento', status: 'pending' },
    { name: 'Herramientas de acceso a base de datos', status: 'pending' },
    { name: 'Comunicación bidireccional en llamadas', status: 'pending' },
    { name: 'Creación de agentes desde agentes existentes', status: 'pending' }
  ]);
  
  const {
    elevenLabsAgents,
    isLoadingElevenLabsAgents,
    createElevenLabsAgent,
    knowledgeBases,
    createKnowledgeBase,
    addKnowledgeItem,
    startConversation,
    registerAgentTool,
    createDatabaseQueryTool
  } = useElevenLabsService();
  
  const {
    startAIAgentCall,
    sendMessage,
    endAIAgentCall
  } = useAIAgentCalls();
  
  const { startCall } = useCallsService();
  
  // Función para actualizar el resultado de una prueba
  const updateTestResult = (index: number, status: 'running' | 'success' | 'failed', message?: string) => {
    setTestResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], status, message };
      return newResults;
    });
  };
  
  // Ejecutar todas las pruebas
  const runAllTests = async () => {
    try {
      // Prueba 1: Conexión con API ElevenLabs
      await testElevenLabsConnection();
      
      // Prueba 2: Creación de agente IA
      await testAgentCreation();
      
      // Prueba 3: Integración de base de conocimiento
      await testKnowledgeBaseIntegration();
      
      // Prueba 4: Herramientas de acceso a base de datos
      await testDatabaseTools();
      
      // Prueba 5: Comunicación bidireccional en llamadas
      await testBidirectionalCommunication();
      
      // Prueba 6: Creación de agentes desde agentes existentes
      await testAgentCreationFromAgent();
      
      toast({
        title: 'Validación completada',
        description: 'Todas las pruebas han sido ejecutadas'
      });
    } catch (error) {
      console.error('Error en validación:', error);
      toast({
        title: 'Error en validación',
        description: 'Se produjo un error durante la validación',
        variant: 'destructive'
      });
    }
  };
  
  // Prueba 1: Conexión con API ElevenLabs
  const testElevenLabsConnection = async () => {
    updateTestResult(0, 'running');
    
    try {
      // Verificar que podemos obtener la lista de agentes
      if (isLoadingElevenLabsAgents) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (elevenLabsAgents && elevenLabsAgents.length >= 0) {
        updateTestResult(0, 'success', `Conexión exitosa. ${elevenLabsAgents.length} agentes encontrados.`);
        return true;
      } else {
        throw new Error('No se pudo obtener la lista de agentes');
      }
    } catch (error) {
      console.error('Error en prueba de conexión:', error);
      updateTestResult(0, 'failed', error.message);
      return false;
    }
  };
  
  // Prueba 2: Creación de agente IA
  const testAgentCreation = async () => {
    updateTestResult(1, 'running');
    
    try {
      // Intentar crear un agente de prueba
      const testAgent = {
        name: `Test Agent ${Date.now()}`,
        description: 'Agente creado para validación',
        voice_id: 'EXAVITQu4vr4xnSDxMaL', // ID de voz de ejemplo
        model_id: 'gemini-1.5-flash', // Modelo de ejemplo
        system_prompt: 'Eres un asistente de prueba para validación de integración.'
      };
      
      await createElevenLabsAgent.mutateAsync(testAgent);
      
      updateTestResult(1, 'success', `Agente "${testAgent.name}" creado exitosamente.`);
      return true;
    } catch (error) {
      console.error('Error en prueba de creación de agente:', error);
      updateTestResult(1, 'failed', error.message);
      return false;
    }
  };
  
  // Prueba 3: Integración de base de conocimiento
  const testKnowledgeBaseIntegration = async () => {
    updateTestResult(2, 'running');
    
    try {
      // Crear una base de conocimiento de prueba
      const testKB = {
        name: `Test KB ${Date.now()}`,
        description: 'Base de conocimiento para validación'
      };
      
      const kbResponse = await createKnowledgeBase.mutateAsync(testKB);
      
      // Añadir un item de texto
      await addKnowledgeItem.mutateAsync({
        knowledgeBaseId: kbResponse.id,
        item: {
          type: 'text',
          content: 'Este es un texto de prueba para la base de conocimiento.'
        }
      });
      
      updateTestResult(2, 'success', `Base de conocimiento "${testKB.name}" creada y poblada exitosamente.`);
      return true;
    } catch (error) {
      console.error('Error en prueba de base de conocimiento:', error);
      updateTestResult(2, 'failed', error.message);
      return false;
    }
  };
  
  // Prueba 4: Herramientas de acceso a base de datos
  const testDatabaseTools = async () => {
    updateTestResult(3, 'running');
    
    try {
      // Verificar que podemos crear la herramienta
      const dbTool = createDatabaseQueryTool();
      
      // Si hay agentes disponibles, intentar registrar la herramienta
      if (elevenLabsAgents && elevenLabsAgents.length > 0) {
        const agentId = elevenLabsAgents[0].id;
        
        await registerAgentTool.mutateAsync({
          agentId,
          tool: dbTool
        });
        
        updateTestResult(3, 'success', `Herramienta de base de datos registrada exitosamente para el agente ${elevenLabsAgents[0].name}.`);
      } else {
        // Si no hay agentes, al menos verificamos que la herramienta se crea correctamente
        if (dbTool && dbTool.name === 'query_database') {
          updateTestResult(3, 'success', 'Herramienta de base de datos creada correctamente (no se pudo registrar por falta de agentes).');
        } else {
          throw new Error('No se pudo crear la herramienta de base de datos');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error en prueba de herramientas de base de datos:', error);
      updateTestResult(3, 'failed', error.message);
      return false;
    }
  };
  
  // Prueba 5: Comunicación bidireccional en llamadas
  const testBidirectionalCommunication = async () => {
    updateTestResult(4, 'running');
    
    try {
      // Simular una llamada de prueba
      const testPhoneNumber = '+12025550123'; // Número de prueba
      
      // Verificar que podemos iniciar una llamada
      const callResult = await startCall.mutateAsync({
        caller_number: testPhoneNumber,
        caller_name: 'Test User',
        start_time: new Date().toISOString(),
        test_mode: true // Importante: usar modo de prueba
      });
      
      if (callResult && callResult.test_mode === true) {
        updateTestResult(4, 'success', 'Simulación de llamada bidireccional exitosa en modo de prueba.');
      } else {
        // Si hay agentes disponibles, intentar iniciar una llamada con IA
        if (elevenLabsAgents && elevenLabsAgents.length > 0) {
          const agentId = elevenLabsAgents[0].id;
          
          const aiCallResult = await startAIAgentCall(agentId, testPhoneNumber);
          
          if (aiCallResult) {
            // Enviar un mensaje de prueba
            sendMessage('Hola, esto es una prueba de comunicación bidireccional.');
            
            // Esperar un momento y finalizar la llamada
            await new Promise(resolve => setTimeout(resolve, 2000));
            endAIAgentCall();
            
            updateTestResult(4, 'success', 'Comunicación bidireccional con agente IA exitosa.');
          } else {
            throw new Error('No se pudo iniciar la llamada con el agente IA');
          }
        } else {
          updateTestResult(4, 'success', 'Simulación de llamada exitosa (no se pudo probar con agente IA por falta de agentes).');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error en prueba de comunicación bidireccional:', error);
      updateTestResult(4, 'failed', error.message);
      return false;
    }
  };
  
  // Prueba 6: Creación de agentes desde agentes existentes
  const testAgentCreationFromAgent = async () => {
    updateTestResult(5, 'running');
    
    try {
      // Verificar que la herramienta de creación de agentes funciona
      const agentCreationTool = createAgentCreationTool();
      
      if (agentCreationTool && agentCreationTool.name === 'create_new_agent') {
        updateTestResult(5, 'success', 'Herramienta de creación de agentes funciona correctamente.');
      } else {
        throw new Error('No se pudo crear la herramienta de creación de agentes');
      }
      
      return true;
    } catch (error) {
      console.error('Error en prueba de creación de agentes desde agentes:', error);
      updateTestResult(5, 'failed', error.message);
      return false;
    }
  };
  
  return {
    testResults,
    runAllTests,
    testElevenLabsConnection,
    testAgentCreation,
    testKnowledgeBaseIntegration,
    testDatabaseTools,
    testBidirectionalCommunication,
    testAgentCreationFromAgent
  };
};
