
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QRCodeData {
  qr: string;
  expiration: number;
}

const WhatsappQRScanner: React.FC = () => {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force QR refresh
  const [pollingId, setPollingId] = useState<number | null>(null);
  const { toast } = useToast();
  
  const generateQRCode = async () => {
    try {
      setStatus('loading');
      setErrorMessage(null);
      
      // Call Edge Function to generate a WhatsApp QR code
      const { data, error } = await supabase.functions.invoke('whatsapp-qr-generate', {
        body: {}
      });
      
      if (error) {
        throw new Error(error.message || 'Error generando código QR');
      }
      
      if (!data?.qr) {
        throw new Error('No se pudo obtener el código QR');
      }
      
      setQrData({
        qr: data.qr,
        expiration: data.expiration || (Date.now() + 60000) // Default 60 second expiration
      });
      
      setStatus('idle');
      
      // Start polling for connection status
      startStatusPolling();
    } catch (err) {
      console.error('Error en la generación del código QR:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Error desconocido');
      setStatus('error');
      toast({
        title: 'Error',
        description: 'No se pudo generar el código QR para WhatsApp Web',
        variant: 'destructive',
      });
    }
  };
  
  const startStatusPolling = () => {
    // Clear any existing polling
    if (pollingId) {
      clearInterval(pollingId);
    }
    
    // Poll every 3 seconds
    const id = window.setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('whatsapp-qr-status', {
          body: {}
        });
        
        if (error) throw error;
        
        if (data?.connected === true) {
          // WhatsApp Web connected successfully
          setStatus('connected');
          clearInterval(id);
          setPollingId(null);
          
          toast({
            title: 'Conexión exitosa',
            description: 'WhatsApp Web se ha conectado correctamente',
          });
          
          // Save the connection status to database
          await supabase
            .from('whatsapp_config')
            .upsert({
              id: 'default',
              verified: true,
              updated_at: new Date().toISOString(),
              web_connected: true
            }, { onConflict: 'id' });
        }
      } catch (err) {
        console.error('Error al verificar estado de conexión:', err);
      }
    }, 3000);
    
    setPollingId(id);
  };
  
  // Clean up polling when component unmounts
  useEffect(() => {
    return () => {
      if (pollingId) {
        clearInterval(pollingId);
      }
    };
  }, [pollingId]);
  
  // Check if QR has expired
  useEffect(() => {
    if (qrData && qrData.expiration) {
      const timeoutId = setTimeout(() => {
        setQrData(null);
        toast({
          title: 'Código QR expirado',
          description: 'El código QR ha expirado, genera uno nuevo para continuar',
        });
      }, qrData.expiration - Date.now());
      
      return () => clearTimeout(timeoutId);
    }
  }, [qrData, toast]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    generateQRCode();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conexión con WhatsApp Web</CardTitle>
        <CardDescription>
          Escanea el código QR con tu teléfono para conectar WhatsApp Web
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          {status === 'connected' ? (
            <div className="flex flex-col items-center space-y-4 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg w-full">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center font-medium text-lg">
                WhatsApp Web conectado correctamente
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Ahora puedes usar las funcionalidades de WhatsApp Web en la plataforma
              </p>
            </div>
          ) : (
            <>
              {status === 'loading' ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg w-full max-w-xs aspect-square">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-sm text-center">Generando código QR...</p>
                </div>
              ) : qrData ? (
                <div className="p-4 border-2 border-primary rounded-lg">
                  <img
                    key={refreshKey}
                    src={`data:image/png;base64,${qrData.qr}`}
                    alt="WhatsApp QR Code"
                    className="w-64 h-64"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg w-full max-w-xs aspect-square">
                  <QrCode className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-center">No hay código QR generado</p>
                </div>
              )}

              <div className="flex flex-col space-y-2 w-full max-w-md">
                {status === 'error' && errorMessage && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      {errorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={qrData ? handleRefresh : generateQRCode}
                  disabled={status === 'loading'}
                  className="w-full"
                >
                  {status === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : qrData ? (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  ) : (
                    <QrCode className="h-4 w-4 mr-2" />
                  )}
                  {qrData ? 'Actualizar código QR' : 'Generar código QR'}
                </Button>
              </div>
            </>
          )}
        </div>

        <Alert>
          <AlertDescription>
            <p className="text-sm">Para conectar WhatsApp Web:</p>
            <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
              <li>Genera un código QR usando el botón de arriba</li>
              <li>Abre WhatsApp en tu teléfono</li>
              <li>Toca Menú o Ajustes y selecciona WhatsApp Web</li>
              <li>Escanea el código QR mostrado en esta pantalla</li>
              <li>Mantén tu teléfono conectado a Internet</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default WhatsappQRScanner;
