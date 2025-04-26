import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/components/ui/use-toast';
import { Settings, Key, MessageSquare, Phone, Loader2 } from 'lucide-react';
import { useSettingsService, WebhookUrls } from '@/hooks/useSettingsService';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

const SettingsPage: React.FC = () => {
  const { settings, isLoadingSettings, updateSettings, testApiConnection } = useSettingsService();
  const { toast } = useToast();
  
  const generalForm = useForm<{
    company_name: string;
    timezone: string;
    default_language: string;
    analytics_enabled: boolean;
    notifications_enabled: boolean;
  }>();

  const apiForm = useForm<{
    gemini_api_key: string;
    tts_api_key: string;
    google_project_id: string;
    verify_connection: boolean;
  }>();

  const voiceForm = useForm<{
    default_voice: string;
    speaking_rate: number;
    pitch: number;
    default_greeting: string;
  }>();

  const webhookForm = useForm<{
    call_start_url: string;
    call_end_url: string;
    escalation_url: string;
    webhook_secret: string;
  }>();

  // Cargar los datos en los formularios cuando estén disponibles
  useEffect(() => {
    if (settings) {
      generalForm.reset({
        company_name: settings.company_name || '',
        timezone: settings.timezone || '',
        default_language: settings.default_language || '',
        analytics_enabled: settings.analytics_enabled ?? true,
        notifications_enabled: settings.notifications_enabled ?? true,
      });

      apiForm.reset({
        gemini_api_key: settings.gemini_api_key || '',
        tts_api_key: settings.tts_api_key || '',
        google_project_id: settings.google_project_id || '',
        verify_connection: true,
      });

      voiceForm.reset({
        default_voice: settings.default_voice || '',
        speaking_rate: settings.speaking_rate || 1.0,
        pitch: settings.pitch || 0,
        default_greeting: settings.default_greeting || '',
      });

      const webhookUrls = (settings.webhook_urls as WebhookUrls) || {};
      
      webhookForm.reset({
        call_start_url: webhookUrls.call_start || '',
        call_end_url: webhookUrls.call_end || '',
        escalation_url: webhookUrls.escalation || '',
        webhook_secret: settings.webhook_secret || '',
      });
    }
  }, [settings, generalForm, apiForm, voiceForm, webhookForm]);
  
  const handleSaveGeneral = async (data: any) => {
    try {
      await updateSettings.mutateAsync({
        company_name: data.company_name,
        timezone: data.timezone,
        default_language: data.default_language,
        analytics_enabled: data.analytics_enabled,
        notifications_enabled: data.notifications_enabled,
      });
    } catch (error) {
      console.error('Error saving general settings:', error);
    }
  };
  
  const handleSaveAPI = async (data: any) => {
    try {
      if (data.verify_connection) {
        const success = await testApiConnection();
        if (!success) return;
      }
      
      await updateSettings.mutateAsync({
        gemini_api_key: data.gemini_api_key,
        tts_api_key: data.tts_api_key,
        google_project_id: data.google_project_id,
      });
    } catch (error) {
      console.error('Error saving API settings:', error);
    }
  };
  
  const handleTestConnection = async () => {
    await testApiConnection();
  };
  
  const handleSaveVoice = async (data: any) => {
    try {
      await updateSettings.mutateAsync({
        default_voice: data.default_voice,
        speaking_rate: parseFloat(data.speaking_rate),
        pitch: parseInt(data.pitch, 10),
        default_greeting: data.default_greeting,
      });
    } catch (error) {
      console.error('Error saving voice settings:', error);
    }
  };

  const handleSaveWebhooks = async (data: any) => {
    try {
      const webhookUrls: WebhookUrls = {
        call_start: data.call_start_url,
        call_end: data.call_end_url,
        escalation: data.escalation_url,
      };
      
      await updateSettings.mutateAsync({
        webhook_urls: webhookUrls,
        webhook_secret: data.webhook_secret,
      });
      
      toast({
        title: "Webhooks guardados",
        description: "La configuración de webhooks ha sido actualizada",
      });
    } catch (error) {
      console.error('Error saving webhook settings:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de webhooks",
        variant: "destructive",
      });
    }
  };

  if (isLoadingSettings) {
    return (
      <Layout>
        <div className="flex justify-center items-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando configuración...</span>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">Configure su plataforma de centro de contacto.</p>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="api">Integración API</TabsTrigger>
            <TabsTrigger value="voice">Configuración de Voz</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-4 space-y-4">
            <Card>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(handleSaveGeneral)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      <span>Configuración General</span>
                    </CardTitle>
                    <CardDescription>Configuración básica para su centro de contacto</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={generalForm.control}
                      name="company_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la empresa</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={generalForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zona horaria</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={generalForm.control}
                      name="default_language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idioma predeterminado</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={generalForm.control}
                      name="analytics_enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Habilitar análisis y grabación de llamadas</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={generalForm.control}
                      name="notifications_enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Habilitar notificaciones por correo electrónico</FormLabel>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Guardar cambios</Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
          
          <TabsContent value="api" className="mt-4 space-y-4">
            <Card>
              <Form {...apiForm}>
                <form onSubmit={apiForm.handleSubmit(handleSaveAPI)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" />
                      <span>Configuración API</span>
                    </CardTitle>
                    <CardDescription>Configurar claves API para servicios de Google Cloud</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={apiForm.control}
                      name="gemini_api_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clave API de Google Gemini</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Ingrese su clave API de Gemini" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={apiForm.control}
                      name="tts_api_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clave API de Google TTS</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Ingrese su clave API de TTS" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={apiForm.control}
                      name="google_project_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID del Proyecto de Google Cloud</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ingrese su ID del Proyecto" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={apiForm.control}
                      name="verify_connection"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Verificar conexiones API al guardar</FormLabel>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" type="button" onClick={handleTestConnection}>Probar conexión</Button>
                    <Button type="submit">Guardar claves API</Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
          
          <TabsContent value="voice" className="mt-4 space-y-4">
            <Card>
              <Form {...voiceForm}>
                <form onSubmit={voiceForm.handleSubmit(handleSaveVoice)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <span>Configuración de Voz</span>
                    </CardTitle>
                    <CardDescription>Configurar ajustes de síntesis de voz</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={voiceForm.control}
                      name="default_voice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Voz predeterminada</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            ID de voz de Google TTS (ej. es-ES-Neural2-A)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={voiceForm.control}
                      name="speaking_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Velocidad de habla</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0.5" 
                              max="2.0" 
                              step="0.1" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Entre 0.5 (lento) y 2.0 (rápido)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={voiceForm.control}
                      name="pitch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tono de voz</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="-10" 
                              max="10" 
                              step="1" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Entre -10 (bajo) y 10 (alto)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={voiceForm.control}
                      name="default_greeting"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Saludo predeterminado</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={3} 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Guardar configuración de voz</Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
          
          <TabsContent value="webhooks" className="mt-4 space-y-4">
            <Card>
              <Form {...webhookForm}>
                <form onSubmit={webhookForm.handleSubmit(handleSaveWebhooks)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      <span>Webhooks</span>
                    </CardTitle>
                    <CardDescription>Configurar webhooks para integraciones externas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={webhookForm.control}
                      name="call_start_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook de inicio de llamada</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://su-dominio.com/webhooks/call-start" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={webhookForm.control}
                      name="call_end_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook de fin de llamada</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://su-dominio.com/webhooks/call-end" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={webhookForm.control}
                      name="escalation_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook de escalación</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://su-dominio.com/webhooks/escalate" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={webhookForm.control}
                      name="webhook_secret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secreto de Webhook</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Ingrese su secreto de webhook" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Se usará para firmar las solicitudes de webhook
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Guardar configuración de webhooks</Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
