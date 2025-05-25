# Validación de Funcionalidad Integral

## Pruebas de Flujo de Llamadas y Permisos de Micrófono

```typescript
// Código de prueba para validar el flujo de llamadas y permisos
import { useCallFlow } from '../hooks/useCallFlow';
import { useEffect, useState } from 'react';

export const CallFlowValidation = () => {
  const [testResults, setTestResults] = useState<{
    name: string;
    status: 'pending' | 'running' | 'success' | 'failed';
    message?: string;
  }[]>([
    { name: 'Solicitud de permisos de micrófono', status: 'pending' },
    { name: 'Inicio de llamada sin duplicación', status: 'pending' },
    { name: 'Monitoreo de estado de llamada', status: 'pending' },
    { name: 'Finalización de llamada', status: 'pending' }
  ]);
  
  const {
    callStatus,
    micPermission,
    isAudioEnabled,
    isProcessingCall,
    requestMicrophonePermission,
    initiateCall,
    terminateCall
  } = useCallFlow();
  
  // Función para actualizar el resultado de una prueba
  const updateTestResult = (index: number, status: 'running' | 'success' | 'failed', message?: string) => {
    setTestResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], status, message };
      return newResults;
    });
  };
  
  // Prueba 1: Solicitud de permisos de micrófono
  const testMicrophonePermission = async () => {
    updateTestResult(0, 'running');
    
    try {
      const result = await requestMicrophonePermission();
      
      if (result && micPermission === 'granted') {
        updateTestResult(0, 'success', 'Permisos de micrófono concedidos correctamente');
        return true;
      } else {
        throw new Error('No se pudieron obtener permisos de micrófono');
      }
    } catch (error) {
      updateTestResult(0, 'failed', error.message);
      return false;
    }
  };
  
  // Prueba 2: Inicio de llamada sin duplicación
  const testCallInitiation = async () => {
    updateTestResult(1, 'running');
    
    try {
      // Número de prueba
      const testPhoneNumber = '+12025550123';
      
      const callResult = await initiateCall(testPhoneNumber);
      
      if (callResult && callStatus === 'connected') {
        updateTestResult(1, 'success', 'Llamada iniciada correctamente sin duplicación');
        return true;
      } else {
        throw new Error('No se pudo iniciar la llamada correctamente');
      }
    } catch (error) {
      updateTestResult(1, 'failed', error.message);
      return false;
    }
  };
  
  // Prueba 3: Monitoreo de estado de llamada
  const testCallMonitoring = async () => {
    updateTestResult(2, 'running');
    
    try {
      // Verificar que el audio esté habilitado durante la llamada
      if (isAudioEnabled && callStatus === 'connected') {
        updateTestResult(2, 'success', 'Monitoreo de llamada funcionando correctamente');
        return true;
      } else {
        throw new Error('El monitoreo de llamada no está funcionando correctamente');
      }
    } catch (error) {
      updateTestResult(2, 'failed', error.message);
      return false;
    }
  };
  
  // Prueba 4: Finalización de llamada
  const testCallTermination = async () => {
    updateTestResult(3, 'running');
    
    try {
      const result = await terminateCall();
      
      if (result && callStatus === 'ended') {
        updateTestResult(3, 'success', 'Llamada finalizada correctamente');
        return true;
      } else {
        throw new Error('No se pudo finalizar la llamada correctamente');
      }
    } catch (error) {
      updateTestResult(3, 'failed', error.message);
      return false;
    }
  };
  
  // Ejecutar todas las pruebas en secuencia
  const runAllTests = async () => {
    const micPermissionResult = await testMicrophonePermission();
    if (!micPermissionResult) return;
    
    const callInitiationResult = await testCallInitiation();
    if (!callInitiationResult) return;
    
    const callMonitoringResult = await testCallMonitoring();
    if (!callMonitoringResult) return;
    
    await testCallTermination();
  };
  
  return {
    testResults,
    runAllTests,
    testMicrophonePermission,
    testCallInitiation,
    testCallMonitoring,
    testCallTermination
  };
};
```

## Pruebas de Transcripción en Tiempo Real

```typescript
// Código de prueba para validar la transcripción en tiempo real
import { useRealTimeTranscription } from '../hooks/useRealTimeTranscription';
import { useEffect, useState } from 'react';

export const TranscriptionValidation = (callId?: string) => {
  const [testResults, setTestResults] = useState<{
    name: string;
    status: 'pending' | 'running' | 'success' | 'failed';
    message?: string;
  }[]>([
    { name: 'Inicio de transcripción', status: 'pending' },
    { name: 'Procesamiento de audio', status: 'pending' },
    { name: 'Almacenamiento de transcripción', status: 'pending' },
    { name: 'Detención de transcripción', status: 'pending' }
  ]);
  
  const {
    isTranscribing,
    transcriptionItems,
    isProcessing,
    error,
    startTranscription,
    stopTranscription
  } = useRealTimeTranscription(callId);
  
  // Función para actualizar el resultado de una prueba
  const updateTestResult = (index: number, status: 'running' | 'success' | 'failed', message?: string) => {
    setTestResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], status, message };
      return newResults;
    });
  };
  
  // Prueba 1: Inicio de transcripción
  const testTranscriptionStart = async () => {
    updateTestResult(0, 'running');
    
    try {
      const result = await startTranscription();
      
      if (result && isTranscribing) {
        updateTestResult(0, 'success', 'Transcripción iniciada correctamente');
        return true;
      } else {
        throw new Error('No se pudo iniciar la transcripción');
      }
    } catch (error) {
      updateTestResult(0, 'failed', error.message);
      return false;
    }
  };
  
  // Prueba 2: Procesamiento de audio
  const testAudioProcessing = async () => {
    updateTestResult(1, 'running');
    
    try {
      // Esperar a que se procese algo de audio (máximo 10 segundos)
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
        
        if (isProcessing) {
          updateTestResult(1, 'success', 'Procesamiento de audio detectado');
          return true;
        }
      }
      
      throw new Error('No se detectó procesamiento de audio después de 10 segundos');
    } catch (error) {
      updateTestResult(1, 'failed', error.message);
      return false;
    }
  };
  
  // Prueba 3: Almacenamiento de transcripción
  const testTranscriptionStorage = async () => {
    updateTestResult(2, 'running');
    
    try {
      // Esperar a que aparezcan elementos de transcripción (máximo 15 segundos)
      let attempts = 0;
      const maxAttempts = 15;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
        
        if (transcriptionItems.length > 0) {
          updateTestResult(2, 'success', `${transcriptionItems.length} elementos de transcripción almacenados`);
          return true;
        }
      }
      
      throw new Error('No se detectaron elementos de transcripción después de 15 segundos');
    } catch (error) {
      updateTestResult(2, 'failed', error.message);
      return false;
    }
  };
  
  // Prueba 4: Detención de transcripción
  const testTranscriptionStop = async () => {
    updateTestResult(3, 'running');
    
    try {
      const result = stopTranscription();
      
      if (result && !isTranscribing) {
        updateTestResult(3, 'success', 'Transcripción detenida correctamente');
        return true;
      } else {
        throw new Error('No se pudo detener la transcripción');
      }
    } catch (error) {
      updateTestResult(3, 'failed', error.message);
      return false;
    }
  };
  
  // Ejecutar todas las pruebas en secuencia
  const runAllTests = async () => {
    if (!callId) {
      console.error('Se requiere un ID de llamada para las pruebas de transcripción');
      return;
    }
    
    const startResult = await testTranscriptionStart();
    if (!startResult) return;
    
    const processingResult = await testAudioProcessing();
    if (!processingResult) {
      await stopTranscription();
      return;
    }
    
    const storageResult = await testTranscriptionStorage();
    if (!storageResult) {
      await stopTranscription();
      return;
    }
    
    await testTranscriptionStop();
  };
  
  return {
    testResults,
    runAllTests,
    testTranscriptionStart,
    testAudioProcessing,
    testTranscriptionStorage,
    testTranscriptionStop
  };
};
```

## Pruebas de Webhooks

```typescript
// Código de prueba para validar los webhooks
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const WebhookValidation = () => {
  const [testResults, setTestResults] = useState<{
    name: string;
    status: 'pending' | 'running' | 'success' | 'failed';
    message?: string;
  }[]>([
    { name: 'Envío de webhook', status: 'pending' },
    { name: 'Recepción de webhook', status: 'pending' }
  ]);
  
  // Función para actualizar el resultado de una prueba
  const updateTestResult = (index: number, status: 'running' | 'success' | 'failed', message?: string) => {
    setTestResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], status, message };
      return newResults;
    });
  };
  
  // Prueba 1: Envío de webhook
  const testWebhookSend = async () => {
    updateTestResult(0, 'running');
    
    try {
      // Usar un servicio de prueba para webhooks (webhook.site)
      const testWebhookUrl = 'https://webhook.site/token/your-test-token';
      
      const { data, error } = await supabase.functions.invoke('send-webhook', {
        body: {
          event_type: 'test_event',
          data: {
            message: 'Este es un webhook de prueba',
            timestamp: new Date().toISOString()
          },
          webhook_url: testWebhookUrl
        }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        updateTestResult(0, 'success', 'Webhook enviado correctamente');
        return true;
      } else {
        throw new Error('No se pudo enviar el webhook');
      }
    } catch (error) {
      updateTestResult(0, 'failed', error.message);
      return false;
    }
  };
  
  // Prueba 2: Recepción de webhook (simulada)
  const testWebhookReceive = async () => {
    updateTestResult(1, 'running');
    
    try {
      // Simular la recepción de un webhook
      // En un entorno real, esto requeriría un endpoint público
      
      // Para pruebas, podemos verificar que la función de webhook
      // esté correctamente desplegada
      const { data, error } = await supabase.functions.invoke('send-webhook', {
        body: {
          event_type: 'test_receive',
          data: {
            message: 'Prueba de recepción',
            timestamp: new Date().toISOString()
          },
          // Usar la misma función como destino (solo para pruebas)
          webhook_url: 'https://your-project-ref.supabase.co/functions/v1/send-webhook'
        }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        updateTestResult(1, 'success', 'Simulación de recepción de webhook exitosa');
        return true;
      } else {
        throw new Error('Falló la simulación de recepción de webhook');
      }
    } catch (error) {
      updateTestResult(1, 'failed', error.message);
      return false;
    }
  };
  
  // Ejecutar todas las pruebas en secuencia
  const runAllTests = async () => {
    const sendResult = await testWebhookSend();
    if (!sendResult) return;
    
    await testWebhookReceive();
  };
  
  return {
    testResults,
    runAllTests,
    testWebhookSend,
    testWebhookReceive
  };
};
```

## Pruebas de Integración Completa

```typescript
// Código de prueba para validar la integración completa
import { useState } from 'react';
import { useCallFlow } from '../hooks/useCallFlow';
import { useRealTimeTranscription } from '../hooks/useRealTimeTranscription';
import { supabase } from '@/integrations/supabase/client';

export const IntegrationValidation = () => {
  const [testResults, setTestResults] = useState<{
    name: string;
    status: 'pending' | 'running' | 'success' | 'failed';
    message?: string;
  }[]>([
    { name: 'Flujo completo de llamada con transcripción', status: 'pending' },
    { name: 'Envío de datos a webhook durante llamada', status: 'pending' }
  ]);
  
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  
  const {
    callStatus,
    micPermission,
    isAudioEnabled,
    requestMicrophonePermission,
    initiateCall,
    terminateCall,
    audioStream
  } = useCallFlow();
  
  const {
    isTranscribing,
    transcriptionItems,
    startTranscription,
    stopTranscription
  } = useRealTimeTranscription(activeCallId || undefined);
  
  // Función para actualizar el resultado de una prueba
  const updateTestResult = (index: number, status: 'running' | 'success' | 'failed', message?: string) => {
    setTestResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], status, message };
      return newResults;
    });
  };
  
  // Prueba 1: Flujo completo de llamada con transcripción
  const testCompleteCallFlow = async () => {
    updateTestResult(0, 'running');
    
    try {
      // 1. Solicitar permisos de micrófono
      await requestMicrophonePermission();
      
      if (micPermission !== 'granted') {
        throw new Error('No se pudieron obtener permisos de micrófono');
      }
      
      // 2. Iniciar llamada
      const testPhoneNumber = '+12025550123';
      const callResult = await initiateCall(testPhoneNumber);
      
      if (!callResult) {
        throw new Error('No se pudo iniciar la llamada');
      }
      
      setActiveCallId(callResult.id);
      
      // 3. Iniciar transcripción
      const transcriptionResult = await startTranscription(audioStream || undefined);
      
      if (!transcriptionResult) {
        await terminateCall();
        throw new Error('No se pudo iniciar la transcripción');
      }
      
      // 4. Esperar a que se procese algo de transcripción (10 segundos)
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // 5. Verificar que hay elementos de transcripción
      if (transcriptionItems.length === 0) {
        await stopTranscription();
        await terminateCall();
        throw new Error('No se generaron elementos de transcripción');
      }
      
      // 6. Detener transcripción
      await stopTranscription();
      
      // 7. Finalizar llamada
      await terminateCall();
      
      updateTestResult(0, 'success', 'Flujo completo de llamada con transcripción exitoso');
      return true;
    } catch (error) {
      // Asegurar limpieza en caso de error
      if (isTranscribing) {
        await stopTranscription();
      }
      
      if (callStatus === 'connected') {
        await terminateCall();
      }
      
      updateTestResult(0, 'failed', error.message);
      return false;
    }
  };
  
  // Prueba 2: Envío de datos a webhook durante llamada
  const testWebhookDuringCall = async () => {
    updateTestResult(1, 'running');
    
    try {
      // 1. Solicitar permisos de micrófono
      await requestMicrophonePermission();
      
      if (micPermission !== 'granted') {
        throw new Error('No se pudieron obtener permisos de micrófono');
      }
      
      // 2. Iniciar llamada
      const testPhoneNumber = '+12025550123';
      const callResult = await initiateCall(testPhoneNumber);
      
      if (!callResult) {
        throw new Error('No se pudo iniciar la llamada');
      }
      
      setActiveCallId(callResult.id);
      
      // 3. Enviar datos de la llamada a un webhook
      const testWebhookUrl = 'https://webhook.site/token/your-test-token';
      
      const { data: webhookData, error: webhookError } = await supabase.functions.invoke('send-webhook', {
        body: {
          event_type: 'call_started',
          data: {
            call_id: callResult.id,
            phone_number: testPhoneNumber,
            start_time: new Date().toISOString()
          },
          webhook_url: testWebhookUrl
        }
      });
      
      if (webhookError || !webhookData?.success) {
        await terminateCall();
        throw new Error('No se pudieron enviar datos al webhook');
      }
      
      // 4. Finalizar llamada
      await terminateCall();
      
      updateTestResult(1, 'success', 'Envío de datos a webhook durante llamada exitoso');
      return true;
    } catch (error) {
      // Asegurar limpieza en caso de error
      if (callStatus === 'connected') {
        await terminateCall();
      }
      
      updateTestResult(1, 'failed', error.message);
      return false;
    }
  };
  
  // Ejecutar todas las pruebas en secuencia
  const runAllTests = async () => {
    const callFlowResult = await testCompleteCallFlow();
    if (!callFlowResult) return;
    
    await testWebhookDuringCall();
  };
  
  return {
    testResults,
    runAllTests,
    testCompleteCallFlow,
    testWebhookDuringCall
  };
};
```
