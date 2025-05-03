
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
import { Settings, Key, MessageSquare, Phone, Import } from 'lucide-react';
import { useSettingsService, WebhookUrls } from '@/hooks/useSettingsService';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import ApiConfiguration from '@/components/settings/ApiConfiguration';

const SettingsPage: React.FC = () => {
  const { settings, isLoadingSettings, updateSettings } = useSettingsService();
  const { toast } = useToast();
  
  const generalForm = useForm<{
    company_name: string;
    timezone: string;
    default_language: string;
    analytics_enabled: boolean;
    notifications_enabled: boolean;
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
  }, [settings, generalForm, voiceForm, webhookForm]);
  
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
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2">Cargando configuración...</span>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight neo-gradient">Configuración</h1>
          <p className="text-muted-foreground">Configure su plataforma de centro de contacto.</p>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="api">APIs Unificadas</TabsTrigger>
            <TabsTrigger value="voice">Voz</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="integrations">Integraciones</TabsTrigger>
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
            <ApiConfiguration />
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
          
          <TabsContent value="integrations" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Import className="h-5 w-5 text-primary" />
                  <span>Integraciones Externas</span>
                </CardTitle>
                <CardDescription>Gestione la conexión con plataformas de terceros</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Zapier</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Conecte su centro de contacto con miles de aplicaciones a través de Zapier.
                    </p>
                    <Button variant="outline" size="sm">
                      Configurar Integración
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Make.com</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Automatice flujos de trabajo con Make.com (antes Integromat).
                    </p>
                    <Button variant="outline" size="sm">
                      Configurar Integración
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Salesforce</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sincronice contactos y casos con su instancia de Salesforce.
                    </p>
                    <Button variant="outline" size="sm">
                      Configurar Integración
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">HubSpot</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sincronice contactos y seguimiento de leads con HubSpot.
                    </p>
                    <Button variant="outline" size="sm">
                      Configurar Integración
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-center mt-4">
                  <Button variant="outline">
                    Ver más integraciones disponibles
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
