
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useCallsService } from '@/hooks/useCallsService';

const TwilioConnectionTest = () => {
  const { startCall } = useCallsService();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Usar un número de teléfono ficticio para la prueba
      await startCall.mutateAsync({
        caller_number: '+13335557777',
        start_time: new Date().toISOString(),
        test_mode: true // Activar modo de prueba
      });

      setTestResult({
        success: true,
        message: 'Conexión con Twilio verificada correctamente.'
      });
    } catch (error) {
      console.error('Error en prueba de conexión:', error);
      setTestResult({
        success: false,
        message: `Error de conexión: ${error.message || 'Error desconocido'}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Verificar conexión con Twilio</h3>
        <Button 
          onClick={handleTestConnection}
          disabled={testing}
        >
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'Probar conexión'
          )}
        </Button>
      </div>

      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"}>
          {testResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{testResult.success ? 'Éxito' : 'Error'}</AlertTitle>
          <AlertDescription>
            {testResult.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
        <h4 className="font-medium mb-2">Requisitos para que funcionen las llamadas:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Cuenta de Twilio activa con fondos suficientes</li>
          <li>Account SID y Auth Token configurados en Supabase Edge Functions</li>
          <li>Número de teléfono de Twilio comprado y configurado</li>
          <li className="font-medium text-amber-600 dark:text-amber-400">Permisos geográficos habilitados para los países a los que deseas llamar</li>
          <li className="font-medium text-amber-600 dark:text-amber-400">Para llamadas fuera de EE. UU., verificar que tu cuenta tenga permisos internacionales habilitados</li>
        </ul>
        
        <div className="mt-3">
          <a 
            href="https://www.twilio.com/console/voice/calls/geo-permissions/low-risk" 
            target="_blank"
            rel="noopener noreferrer" 
            className="flex items-center text-primary hover:underline"
          >
            Configurar permisos geográficos en Twilio <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TwilioConnectionTest;
