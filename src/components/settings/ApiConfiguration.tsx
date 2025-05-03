
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useSettingsService } from '@/hooks/useSettingsService';
import { useToast } from '@/components/ui/use-toast';
import { Key, Phone, MessageSquare, Import } from 'lucide-react';

// Define types for webhook URLs
interface WebhookUrls {
  zapier?: string;
  make?: string;
  [key: string]: string | undefined;
}

const ApiConfiguration: React.FC = () => {
  const { settings, isLoadingSettings, updateSettings, testTwilioConnection, testApiConnection } = useSettingsService();
  const { toast } = useToast();
  
  const [apiKeys, setApiKeys] = useState({
    gemini_api_key: '',
    tts_api_key: '',
    google_project_id: '',
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
    zapier_webhook_url: '',
    make_webhook_url: '',
  });
  
  const [verifyConnection, setVerifyConnection] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      // Parse webhook_urls if it exists and is a string
      let webhookUrls: WebhookUrls = {};
      
      if (settings.webhook_urls) {
        if (typeof settings.webhook_urls === 'string') {
          try {
            webhookUrls = JSON.parse(settings.webhook_urls);
          } catch (e) {
            console.error('Error parsing webhook_urls:', e);
            webhookUrls = {};
          }
        } else if (typeof settings.webhook_urls === 'object') {
          webhookUrls = settings.webhook_urls as WebhookUrls;
        }
      }
      
      setApiKeys({
        gemini_api_key: settings.gemini_api_key || '',
        tts_api_key: settings.tts_api_key || '',
        google_project_id: settings.google_project_id || '',
        twilio_account_sid: settings.twilio_account_sid || '',
        twilio_auth_token: settings.twilio_auth_token || '',
        twilio_phone_number: settings.twilio_phone_number || '',
        zapier_webhook_url: webhookUrls.zapier || '',
        make_webhook_url: webhookUrls.make || '',
      });
    }
  }, [settings]);

  const handleSaveGoogleAPI = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (verifyConnection) {
        const success = await testApiConnection();
        if (!success) {
          setIsLoading(false);
          return;
        }
      }
      
      await updateSettings.mutateAsync({
        gemini_api_key: apiKeys.gemini_api_key,
        tts_api_key: apiKeys.tts_api_key,
        google_project_id: apiKeys.google_project_id,
      });
      
      toast({
        title: "Configuración guardada",
        description: "Las claves API de Google se han guardado correctamente",
      });
    } catch (error) {
      console.error('Error al guardar configuración de API:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las claves API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTwilio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (verifyConnection) {
        const success = await testTwilioConnection();
        if (!success) {
          setIsLoading(false);
          return;
        }
      }
      
      await updateSettings.mutateAsync({
        twilio_account_sid: apiKeys.twilio_account_sid,
        twilio_auth_token: apiKeys.twilio_auth_token,
        twilio_phone_number: apiKeys.twilio_phone_number,
      });
      
      toast({
        title: "Configuración guardada",
        description: "Las credenciales de Twilio se han guardado correctamente",
      });
    } catch (error) {
      console.error('Error al guardar configuración de Twilio:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las credenciales de Twilio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWebhooks = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create webhookUrls object
      const webhookUrls: WebhookUrls = {};
      
      // Add current webhook values from settings if they exist
      if (settings?.webhook_urls && typeof settings.webhook_urls === 'object') {
        Object.assign(webhookUrls, settings.webhook_urls);
      }
      
      // Update with new values
      webhookUrls.zapier = apiKeys.zapier_webhook_url;
      webhookUrls.make = apiKeys.make_webhook_url;
      
      await updateSettings.mutateAsync({
        webhook_urls: webhookUrls,
      });
      
      toast({
        title: "Configuración guardada",
        description: "Los webhooks se han guardado correctamente",
      });
    } catch (error) {
      console.error('Error al guardar webhooks:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los webhooks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <span>APIs de Google Cloud</span>
          </CardTitle>
          <CardDescription>Configure las claves API de Gemini y Text-to-Speech</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="google-api-form" onSubmit={handleSaveGoogleAPI} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="gemini-api-key">Clave API de Google Gemini</Label>
              <Input 
                id="gemini-api-key" 
                type="password"
                placeholder="Ingrese su clave API de Gemini"
                value={apiKeys.gemini_api_key}
                onChange={(e) => setApiKeys({...apiKeys, gemini_api_key: e.target.value})}
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="tts-api-key">Clave API de Google TTS</Label>
              <Input 
                id="tts-api-key" 
                type="password"
                placeholder="Ingrese su clave API de TTS"
                value={apiKeys.tts_api_key}
                onChange={(e) => setApiKeys({...apiKeys, tts_api_key: e.target.value})}
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="google-project-id">ID del Proyecto de Google Cloud</Label>
              <Input 
                id="google-project-id" 
                placeholder="Ingrese su ID del Proyecto"
                value={apiKeys.google_project_id}
                onChange={(e) => setApiKeys({...apiKeys, google_project_id: e.target.value})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="verify-connection-google"
                checked={verifyConnection}
                onCheckedChange={setVerifyConnection}
              />
              <Label htmlFor="verify-connection-google">Verificar conexiones API al guardar</Label>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={testApiConnection} disabled={isLoading}>
            Probar conexión
          </Button>
          <Button type="submit" form="google-api-form" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar claves API'}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <span>Configuración de Twilio</span>
          </CardTitle>
          <CardDescription>Configure las credenciales para llamadas y SMS con Twilio</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="twilio-form" onSubmit={handleSaveTwilio} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="account-sid">Twilio Account SID</Label>
              <Input 
                id="account-sid" 
                placeholder="AC1234..."
                value={apiKeys.twilio_account_sid}
                onChange={(e) => setApiKeys({...apiKeys, twilio_account_sid: e.target.value})}
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="auth-token">Twilio Auth Token</Label>
              <Input 
                id="auth-token" 
                type="password"
                placeholder="Tu token de autenticación"
                value={apiKeys.twilio_auth_token}
                onChange={(e) => setApiKeys({...apiKeys, twilio_auth_token: e.target.value})}
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="phone-number">Número de teléfono de Twilio</Label>
              <Input 
                id="phone-number" 
                placeholder="+1234567890"
                value={apiKeys.twilio_phone_number}
                onChange={(e) => setApiKeys({...apiKeys, twilio_phone_number: e.target.value})}
              />
            </div>
          </form>
          
          <div className="mt-4 p-3 bg-secondary/30 rounded-md">
            <h4 className="font-medium mb-1">Configuración de Webhooks</h4>
            <p className="text-sm text-muted-foreground">
              Recuerda configurar los webhooks en tu panel de Twilio para recibir eventos de llamadas:
            </p>
            <ul className="list-disc list-inside text-sm mt-2">
              <li>URL de estado de llamada: <code className="bg-secondary/50 px-1 rounded">{window.location.origin}/api/twilio/status</code></li>
              <li>URL de llamada entrante: <code className="bg-secondary/50 px-1 rounded">{window.location.origin}/api/twilio/incoming</code></li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={testTwilioConnection} disabled={isLoading}>
            Probar conexión
          </Button>
          <Button type="submit" form="twilio-form" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar configuración'}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Import className="h-5 w-5 text-primary" />
            <span>Webhooks de Integración</span>
          </CardTitle>
          <CardDescription>Configure webhooks para integraciones con plataformas externas</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="webhook-form" onSubmit={handleSaveWebhooks} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="zapier-webhook">Webhook de Zapier</Label>
              <Input 
                id="zapier-webhook" 
                placeholder="https://hooks.zapier.com/..."
                value={apiKeys.zapier_webhook_url}
                onChange={(e) => setApiKeys({...apiKeys, zapier_webhook_url: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">Para recibir eventos en tu Zap</p>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="make-webhook">Webhook de Make.com</Label>
              <Input 
                id="make-webhook" 
                placeholder="https://hook.make.com/..."
                value={apiKeys.make_webhook_url}
                onChange={(e) => setApiKeys({...apiKeys, make_webhook_url: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">Para recibir eventos en tus escenarios</p>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="webhook-form" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar webhooks'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiConfiguration;
