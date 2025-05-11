
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    company_name: '',
    default_language: 'es',
    timezone: 'UTC',
    analytics_enabled: true,
    notifications_enabled: true,
    default_voice: 'es-ES-Neural2-A',
    default_greeting: 'Hola, ¿en qué puedo ayudarte hoy?'
  });
  const { toast } = useToast();

  // Cargar configuraciones al iniciar
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'default')
          .single();

        if (error) throw error;
        
        if (data) {
          setSettings({
            company_name: data.company_name || '',
            default_language: data.default_language || 'es',
            timezone: data.timezone || 'UTC',
            analytics_enabled: data.analytics_enabled !== undefined ? data.analytics_enabled : true,
            notifications_enabled: data.notifications_enabled !== undefined ? data.notifications_enabled : true,
            default_voice: data.default_voice || 'es-ES-Neural2-A',
            default_greeting: data.default_greeting || 'Hola, ¿en qué puedo ayudarte hoy?'
          });
        }
      } catch (error) {
        console.error('Error al cargar configuraciones:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las configuraciones',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  // Guardar configuraciones
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          company_name: settings.company_name,
          default_language: settings.default_language,
          timezone: settings.timezone,
          analytics_enabled: settings.analytics_enabled,
          notifications_enabled: settings.notifications_enabled,
          default_voice: settings.default_voice,
          default_greeting: settings.default_greeting,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'default');

      if (error) throw error;

      toast({
        title: 'Configuraciones guardadas',
        description: 'Los cambios han sido guardados correctamente'
      });
    } catch (error) {
      console.error('Error al guardar configuraciones:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
            <p className="text-muted-foreground">Administra la configuración de tu plataforma.</p>
          </div>
          <Button 
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
        
        <Tabs 
          defaultValue="general" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="voice">Voz</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración general</CardTitle>
                <CardDescription>
                  Configura las opciones básicas de tu centro de contacto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Nombre de la empresa</Label>
                    <Input 
                      id="company_name" 
                      value={settings.company_name}
                      onChange={(e) => handleChange('company_name', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="default_language">Idioma predeterminado</Label>
                    <Select 
                      value={settings.default_language}
                      onValueChange={(value) => handleChange('default_language', value)}
                    >
                      <SelectTrigger id="default_language">
                        <SelectValue placeholder="Selecciona un idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">Inglés</SelectItem>
                        <SelectItem value="fr">Francés</SelectItem>
                        <SelectItem value="pt">Portugués</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Zona horaria</Label>
                    <Select 
                      value={settings.timezone}
                      onValueChange={(value) => handleChange('timezone', value)}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Selecciona una zona horaria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/Mexico_City">Ciudad de México</SelectItem>
                        <SelectItem value="America/Bogota">Bogotá</SelectItem>
                        <SelectItem value="America/Santiago">Santiago</SelectItem>
                        <SelectItem value="Europe/Madrid">Madrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="block mb-2">Analíticas</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.analytics_enabled}
                        onCheckedChange={(checked) => handleChange('analytics_enabled', checked)}
                      />
                      <Label>Activar analíticas de uso</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="voice" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de voz</CardTitle>
                <CardDescription>
                  Configura las opciones de voz para tus agentes de IA.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default_voice">Voz predeterminada</Label>
                    <Select 
                      value={settings.default_voice}
                      onValueChange={(value) => handleChange('default_voice', value)}
                    >
                      <SelectTrigger id="default_voice">
                        <SelectValue placeholder="Selecciona una voz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es-ES-Neural2-A">Lucía (Mujer)</SelectItem>
                        <SelectItem value="es-ES-Neural2-B">Carlos (Hombre)</SelectItem>
                        <SelectItem value="es-ES-Neural2-C">Ana (Mujer)</SelectItem>
                        <SelectItem value="es-ES-Neural2-D">Miguel (Hombre)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="default_greeting">Saludo predeterminado</Label>
                    <Input 
                      id="default_greeting" 
                      value={settings.default_greeting}
                      onChange={(e) => handleChange('default_greeting', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de notificaciones</CardTitle>
                <CardDescription>
                  Configura cómo y cuándo recibir notificaciones.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.notifications_enabled}
                      onCheckedChange={(checked) => handleChange('notifications_enabled', checked)}
                    />
                    <Label>Activar notificaciones</Label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Notificaciones por correo</Label>
                      <div className="rounded-md border p-4 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch defaultChecked id="email-calls" />
                          <Label htmlFor="email-calls">Llamadas perdidas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch defaultChecked id="email-messages" />
                          <Label htmlFor="email-messages">Mensajes sin leer</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="email-reports" />
                          <Label htmlFor="email-reports">Reportes semanales</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integraciones</CardTitle>
                <CardDescription>
                  Configura las integraciones con servicios externos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 7.25c0-.47-.33-.84-.8-.84-4.18 0-8.4 3.25-8.4 8.44 0 4.24 2.94 6.09 8.4 6.09.47 0 .8-.38.8-.84m0-12.85V2.51a.4.4 0 0 0-.4-.4H2.4a.4.4 0 0 0-.4.4v16.97c0 .23.18.4.4.4h19.2c.22 0 .4-.17.4-.4V7.25"/></svg>
                      <div>
                        <p className="font-medium">WhatsApp Business API</p>
                        <p className="text-sm text-muted-foreground">Integración con la API de WhatsApp Business</p>
                      </div>
                    </div>
                    <Button variant="outline">Configurar</Button>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      <div>
                        <p className="font-medium">Twilio</p>
                        <p className="text-sm text-muted-foreground">Integración para llamadas telefónicas</p>
                      </div>
                    </div>
                    <Button variant="outline">Configurar</Button>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M3.67 10A6 6 0 0 1 12 5.67M19 10a6 6 0 0 0-5.67-6"></path><path d="M10 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4"></path><path d="M12 12v7"></path><path d="M10 17l2 2 2-2"></path></svg>
                      <div>
                        <p className="font-medium">Webhook</p>
                        <p className="text-sm text-muted-foreground">Configura webhooks para eventos</p>
                      </div>
                    </div>
                    <Button variant="outline">Configurar</Button>
                  </div>
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
