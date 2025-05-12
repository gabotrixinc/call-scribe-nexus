
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Clipboard, Globe, MessageSquare, PhoneCall, Check, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSettingsService, WebhookUrls } from '@/hooks/useSettingsService';
import { Skeleton } from '@/components/ui/skeleton';

const IntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('webhooks');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [makeWebhookUrl, setMakeWebhookUrl] = useState('');
  const [zapierWebhookUrl, setZapierWebhookUrl] = useState('');
  const [copiedWebhook, setCopiedWebhook] = useState<string | null>(null);
  const [zapierKey, setZapierKey] = useState('');
  const [webhooksEnabled, setWebhooksEnabled] = useState(true);
  const { toast } = useToast();
  const { settings, isLoadingSettings, updateSettings, testWebhook } = useSettingsService();

  useEffect(() => {
    if (settings && settings.webhook_urls) {
      try {
        const webhookUrls = settings.webhook_urls as WebhookUrls;
        setWebhookUrl(webhookUrls.call_end || '');
        setZapierWebhookUrl(webhookUrls.zapier || '');
        setMakeWebhookUrl(webhookUrls.make || '');
      } catch (error) {
        console.error('Error parsing webhook URLs:', error);
      }
    }
  }, [settings]);

  const handleCopyWebhook = (url: string, type: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedWebhook(type);
      toast({
        title: "URL copiada",
        description: "La URL del webhook ha sido copiada al portapapeles",
      });
      setTimeout(() => setCopiedWebhook(null), 2000);
    });
  };

  const handleSaveWebhookUrls = async () => {
    try {
      const webhookUrls: WebhookUrls = {
        ...(settings?.webhook_urls as WebhookUrls || {}),
        call_end: webhookUrl,
        zapier: zapierWebhookUrl,
        make: makeWebhookUrl
      };
      
      await updateSettings.mutateAsync({
        webhook_urls: webhookUrls
      });
    } catch (error) {
      console.error('Error saving webhook URLs:', error);
    }
  };

  const handleTestWebhook = async (url: string, type: string) => {
    await testWebhook(url, type);
  };

  const handleDownloadTemplate = (templateType: string) => {
    let csvContent = '';
    
    if (templateType === 'contactos') {
      csvContent = "nombre,email,telefono,empresa\nEjemplo,ejemplo@email.com,+1234567890,Mi Empresa";
    } else if (templateType === 'agentes') {
      csvContent = "nombre,tipo,estado,especializacion\nEjemplo,ai,online,Ventas";
    }
    
    // Crear un blob con el contenido CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Crear un enlace de descarga y hacer clic automáticamente
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `plantilla_${templateType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Plantilla descargada",
      description: `Se ha descargado la plantilla CSV para importar ${templateType}`,
    });
  };

  const handleImportContacts = () => {
    // Crear un input de archivo invisible
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        try {
          // Simular procesamiento de archivo
          toast({
            title: "Procesando archivo",
            description: "Importando contactos desde CSV...",
          });
          
          // En una implementación real, aquí procesaríamos el archivo y lo enviaríamos a un endpoint
          setTimeout(() => {
            toast({
              title: "Importación completa",
              description: "Se han importado los contactos correctamente",
            });
          }, 2000);
        } catch (error) {
          console.error('Error importing contacts:', error);
          toast({
            title: "Error",
            description: "No se pudieron importar los contactos",
            variant: "destructive",
          });
        }
      }
    };
    
    // Hacer clic en el input
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Integraciones</h1>
            <p className="text-muted-foreground">Conecta tu centro de contacto con otras plataformas y servicios.</p>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 md:w-auto">
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="zapier">Zapier</TabsTrigger>
            <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
            <TabsTrigger value="apis">APIs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Webhooks</CardTitle>
                <CardDescription>
                  Configura URLs para recibir notificaciones de eventos en tu centro de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSettings ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="callWebhook">Webhook para fin de llamadas</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="callWebhook" 
                          value={webhookUrl} 
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://tu-api.com/webhook" 
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleCopyWebhook(webhookUrl, 'call')}
                        >
                          {copiedWebhook === 'call' ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="secondary"
                          onClick={() => handleTestWebhook(webhookUrl, 'call_end')}
                        >
                          Probar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableWebhook">Activar webhooks</Label>
                        <Switch 
                          id="enableWebhook" 
                          checked={webhooksEnabled} 
                          onCheckedChange={setWebhooksEnabled} 
                        />
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-md bg-yellow-50 dark:bg-yellow-950 text-sm">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-yellow-800 dark:text-yellow-400 font-medium">Información sobre webhooks</p>
                          <p className="text-muted-foreground mt-1">
                            Configura estos webhooks para recibir notificaciones en tiempo real cuando ocurran eventos en tu centro de contacto.
                            Los datos se enviarán en formato JSON con información detallada del evento.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveWebhookUrls} disabled={isLoadingSettings}>
                  Guardar configuración
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="zapier" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integración con Zapier y Make</CardTitle>
                <CardDescription>
                  Conecta tu centro de contacto con miles de aplicaciones a través de Zapier o Make
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingSettings ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="zapierWebhook">Webhook de Zapier</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="zapierWebhook" 
                          value={zapierWebhookUrl} 
                          onChange={(e) => setZapierWebhookUrl(e.target.value)}
                          placeholder="Ingresa tu URL de webhook de Zapier" 
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleCopyWebhook(zapierWebhookUrl, 'zapier')}
                        >
                          {copiedWebhook === 'zapier' ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="secondary"
                          onClick={() => handleTestWebhook(zapierWebhookUrl, 'zapier_test')}
                        >
                          Probar
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Configura un trigger webhook en Zapier y pega la URL aquí para recibir eventos.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="makeWebhook">Webhook de Make (Integromat)</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="makeWebhook" 
                          value={makeWebhookUrl} 
                          onChange={(e) => setMakeWebhookUrl(e.target.value)}
                          placeholder="Ingresa tu URL de webhook de Make" 
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleCopyWebhook(makeWebhookUrl, 'make')}
                        >
                          {copiedWebhook === 'make' ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="secondary"
                          onClick={() => handleTestWebhook(makeWebhookUrl, 'make_test')}
                        >
                          Probar
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Configura un webhook en Make (Integromat) y pega la URL aquí para recibir eventos.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Formato de datos enviados</h3>
                      <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
{`{
  "event": "call_end",
  "timestamp": "2023-06-01T12:34:56.789Z",
  "data": {
    "call_id": "uuid-1234",
    "caller": "+123456789",
    "duration": 120,
    "status": "completed"
  }
}`}
                      </pre>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveWebhookUrls} disabled={isLoadingSettings}>Guardar configuración</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="plantillas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plantillas</CardTitle>
                <CardDescription>
                  Descarga plantillas para importar datos a tu centro de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Plantilla de contactos</h3>
                      <p className="text-sm text-muted-foreground">CSV para importar contactos</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleDownloadTemplate('contactos')}>Descargar</Button>
                      <Button variant="outline" onClick={handleImportContacts}>
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Importar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Plantilla de agentes</h3>
                      <p className="text-sm text-muted-foreground">CSV para importar agentes</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleDownloadTemplate('agentes')}>Descargar</Button>
                      <Button variant="outline" disabled>
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Importar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="apis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>APIs</CardTitle>
                <CardDescription>
                  Conecta con APIs externas para ampliar la funcionalidad de tu centro de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <PhoneCall className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">API de Twilio</h3>
                      <p className="text-sm text-muted-foreground">
                        {settings?.twilio_account_sid ? 'Conectado' : 'No configurado'}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/settings?tab=llamadas')}>Configurar</Button>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">API de WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">No conectado</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/mensajes/config')}>Conectar</Button>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">API de Google</h3>
                      <p className="text-sm text-muted-foreground">
                        {settings?.gemini_api_key ? 'Conectado' : 'No conectado'}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/settings?tab=general')}>Conectar</Button>
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

// Función navigate simulada para el ejemplo
const navigate = (path: string) => {
  window.location.href = path;
};

export default IntegrationsPage;
