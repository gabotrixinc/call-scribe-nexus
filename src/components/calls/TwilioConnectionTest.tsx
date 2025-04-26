
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TwilioConnectionTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Utilizar la misma función de llamada pero en modo de prueba
      const { data, error } = await supabase.functions.invoke('make-call', {
        body: { 
          phoneNumber: "+123456789",
          agentId: null,
          testMode: true
        }
      });
      
      if (error || !data.success) {
        throw new Error(data?.error || 'Error al probar la conexión de Twilio');
      }
      
      setTestResult({
        success: true,
        message: 'Conexión a Twilio establecida correctamente. Las credenciales son válidas.'
      });
    } catch (error: any) {
      console.error('Error testing Twilio:', error);
      setTestResult({
        success: false,
        message: `Error de conexión: ${error.message || 'Faltan credenciales o son inválidas'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Conexión de Twilio</h3>
        <Button 
          variant="outline" 
          onClick={testConnection} 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            "Verificar conexión"
          )}
        </Button>
      </div>
      
      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"}>
          {testResult.success ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{testResult.success ? 'Conexión exitosa' : 'Error de conexión'}</AlertTitle>
          <AlertDescription>
            {testResult.message}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="text-sm text-muted-foreground">
        <p>Para hacer llamadas, asegúrese de tener configurados los siguientes secretos en Supabase:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>TWILIO_ACCOUNT_SID</li>
          <li>TWILIO_AUTH_TOKEN</li>
          <li>TWILIO_PHONE_NUMBER</li>
        </ul>
      </div>
    </div>
  );
};

export default TwilioConnectionTest;
