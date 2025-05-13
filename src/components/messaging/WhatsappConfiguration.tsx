
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Info, Check, Loader2, X, ClipboardCopy, ExternalLink, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import WhatsappQRScanner from './WhatsappQRScanner';

const WhatsappConfiguration = () => {
  const [config, setConfig] = useState({
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: '',
    verifyToken: '',
    displayName: '',
    businessDescription: '',
    webhookUrl: '',
    webConnected: false,
  });
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'verified' | 'failed'>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMetaConnecting, setIsMetaConnecting] = useState(false);
  const { toast } = useToast();

  // Generate the webhook URL for the user to copy
  const webhookUrl = `${window.location.origin}/functions/whatsapp-webhook`;

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('whatsapp_config')
          .select('*')
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setConfig({
            phoneNumberId: data.phone_number_id || '',
            businessAccountId: data.business_account_id || '',
            accessToken: data.access_token || '',
            verifyToken: data.verify_token || '',
            displayName: data.display_name || '',
            businessDescription: data.business_description || '',
            webhookUrl: data.webhook_url || webhookUrl,
            webConnected: data.web_connected || false,
          });

          setVerificationStatus(data.verified ? 'verified' : 'none');
        }
      } catch (error) {
        console.error('Error loading WhatsApp configuration:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la configuración de WhatsApp',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [toast, webhookUrl]);

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true);
      
      // Save to Supabase
      const { error } = await supabase.from('whatsapp_config').upsert(
        {
          id: 'default', // Use a default ID for the single configuration row
          phone_number_id: config.phoneNumberId,
          business_account_id: config.businessAccountId,
          access_token: config.accessToken,
          verify_token: config.verifyToken,
          display_name: config.displayName,
          business_description: config.businessDescription,
          webhook_url: webhookUrl,
          verified: verificationStatus === 'verified',
          web_connected: config.webConnected,
        },
        { onConflict: 'id' }
      );

      if (error) throw error;
      
      toast({
        title: 'Configuración guardada',
        description: 'La configuración de WhatsApp ha sido actualizada correctamente.',
      });
    } catch (error) {
      console.error('Error saving WhatsApp configuration:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración de WhatsApp',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyWebhook = async () => {
    try {
      setVerificationStatus('pending');
      
      // Placeholder for webhook verification logic
      // In a real implementation, you might want to test the webhook setup
      
      toast({
        title: 'Verificación enviada',
        description: 'Por favor, configure el webhook en su cuenta de WhatsApp Business y vuelva a verificar.',
      });
      
      // For demo purposes, simulate verification success after a delay
      setTimeout(() => {
        setVerificationStatus('verified');
      }, 3000);
    } catch (error) {
      console.error('Error verifying webhook:', error);
      setVerificationStatus('failed');
      toast({
        title: 'Error',
        description: 'No se pudo verificar el webhook de WhatsApp',
        variant: 'destructive',
      });
    }
  };

  const handleConnectWithMeta = () => {
    try {
      setIsMetaConnecting(true);
      
      // Redirect URL to Meta Business Manager OAuth flow
      // This is a placeholder. In a real implementation, you would redirect to the Meta OAuth URL
      const metaAppId = '123456789012345'; // Replace with your Meta App ID
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/meta-callback`);
      const scope = encodeURIComponent('whatsapp_business_management,whatsapp_business_messaging');
      
      // For demo purposes, just show a toast
      toast({
        title: 'Conexión con Meta',
        description: 'En una implementación real, esta acción te redirigiría a la página de autenticación de Meta Business.',
      });
      
      // In a real implementation, you'd redirect to:
      // window.location.href = `https://www.facebook.com/v16.0/dialog/oauth?client_id=${metaAppId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
      
      // Simulate connection process
      setTimeout(() => {
        setIsMetaConnecting(false);
        toast({
          title: 'Demo: Conexión simulada',
          description: 'La conexión simulada con Meta se ha completado con éxito.',
        });
      }, 2000);
    } catch (error) {
      console.error('Error connecting with Meta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar la conexión con Meta',
        variant: 'destructive',
      });
      setIsMetaConnecting(false);
    }
  };

  const getStatusElement = () => {
    switch (verificationStatus) {
      case 'pending':
        return (
          <div className="flex items-center text-yellow-500">
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
            <span>Verificando...</span>
          </div>
        );
      case 'verified':
        return (
          <div className="flex items-center text-green-500">
            <Check className="h-4 w-4 mr-2" />
            <span>Verificado</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center text-red-500">
            <X className="h-4 w-4 mr-2" />
            <span>Falló la verificación</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-muted-foreground">
            <Info className="h-4 w-4 mr-2" />
            <span>No verificado</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="qr" className="space-y-4">
      <TabsList className="grid grid-cols-3 w-full md:w-auto">
        <TabsTrigger value="qr">WhatsApp Web (QR)</TabsTrigger>
        <TabsTrigger value="meta">Conexión con Meta</TabsTrigger>
        <TabsTrigger value="manual">Configuración Manual</TabsTrigger>
      </TabsList>

      <TabsContent value="qr">
        <WhatsappQRScanner />
      </TabsContent>

      <TabsContent value="meta">
        <Card>
          <CardHeader>
            <CardTitle>Conexión con Meta Business</CardTitle>
            <CardDescription>
              Conecte directamente con Meta Business Manager para configurar WhatsApp Business API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md bg-primary/10 p-4">
              <div className="flex flex-col space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Conexión directa con Meta Business</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure WhatsApp Business API directamente a través de su cuenta de Meta Business.
                    Este proceso automatiza la autorización y configuración.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Requisitos:</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Tener una cuenta de Meta Business Manager</li>
                    <li>Tener acceso de administrador a una cuenta de WhatsApp Business</li>
                    <li>Tener un número de teléfono verificado para WhatsApp Business</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleConnectWithMeta}
                  disabled={isMetaConnecting}
                  className="self-start"
                >
                  {isMetaConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Conectar con Meta Business
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>

                <Alert className="mt-4">
                  <AlertDescription>
                    <p className="text-sm">
                      Será redirigido a Meta para autorizar el acceso a su cuenta de WhatsApp Business.
                      Después de la autorización, será redirigido de vuelta a esta aplicación.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <div className="rounded-md bg-accent p-4">
              <h3 className="text-sm font-medium mb-2">Ventajas de la conexión directa con Meta</h3>
              <ul className="grid gap-2 md:grid-cols-2">
                <li className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Configuración automática de webhooks</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Gestión simplificada de tokens</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Obtención automática de IDs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Renovación automática de tokens</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Documentación</h3>
              <p className="text-sm text-muted-foreground">
                Para más información sobre la integración de WhatsApp Business API con Meta Business Manager,
                consulte la <a href="https://developers.facebook.com/docs/whatsapp/business-management-api" target="_blank" rel="noreferrer" className="text-primary hover:underline">documentación oficial de Meta</a>.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manual">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de WhatsApp Business API</CardTitle>
              <CardDescription>
                Configure su conexión a WhatsApp Business API para enviar y recibir mensajes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone-number-id">ID de Número de Teléfono</Label>
                <Input
                  id="phone-number-id"
                  placeholder="123456789012345"
                  value={config.phoneNumberId}
                  onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  El ID único de su número de teléfono en WhatsApp Business API.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="business-account-id">ID de Cuenta de Negocios</Label>
                <Input
                  id="business-account-id"
                  placeholder="123456789012345"
                  value={config.businessAccountId}
                  onChange={(e) => setConfig({ ...config, businessAccountId: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="access-token">Token de Acceso</Label>
                <Input
                  id="access-token"
                  type="password"
                  placeholder="A1B2C3D4E5..."
                  value={config.accessToken}
                  onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Token de larga duración para su aplicación de WhatsApp.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="verify-token">Token de Verificación</Label>
                <Input
                  id="verify-token"
                  placeholder="token_secreto_personalizado"
                  value={config.verifyToken}
                  onChange={(e) => setConfig({ ...config, verifyToken: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Token personalizado para verificar los webhooks entrantes.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveConfig} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Guardar configuración
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Perfil de Empresa y Webhook</CardTitle>
              <CardDescription>
                Configure la información de su empresa y la URL del webhook.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Nombre para mostrar</Label>
                <Input
                  id="display-name"
                  placeholder="Mi Empresa"
                  value={config.displayName}
                  onChange={(e) => setConfig({ ...config, displayName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="business-description">Descripción de la empresa</Label>
                <Textarea
                  id="business-description"
                  placeholder="Somos una empresa dedicada a..."
                  value={config.businessDescription}
                  onChange={(e) => setConfig({ ...config, businessDescription: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="border p-4 rounded-md bg-accent">
                <div className="flex justify-between items-center mb-2">
                  <Label className="font-medium">URL del Webhook</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      navigator.clipboard.writeText(webhookUrl);
                      toast({
                        title: 'URL copiada',
                        description: 'La URL del webhook ha sido copiada al portapapeles.',
                      });
                    }}
                  >
                    <ClipboardCopy className="h-4 w-4 mr-2" /> Copiar
                  </Button>
                </div>
                <p className="text-sm font-mono break-all mb-2">{webhookUrl}</p>
                <div className="flex justify-between items-center mt-4">
                  <div>{getStatusElement()}</div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8"
                    onClick={handleVerifyWebhook}
                    disabled={verificationStatus === 'pending'}
                  >
                    {verificationStatus === 'pending' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Verificar Webhook
                  </Button>
                </div>
              </div>
              
              <Alert className="mt-4">
                <AlertDescription>
                  <p className="text-sm">
                    Después de configurar, debe registrar esta URL en la configuración de su aplicación
                    de WhatsApp Business en el Meta Developer Portal.
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default WhatsappConfiguration;
