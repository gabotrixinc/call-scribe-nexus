
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Clipboard, Globe, MessageSquare, PhoneCall, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const IntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('webhooks');
  const [webhookUrl, setWebhookUrl] = useState('https://api.tuempresa.com/webhook/calls');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [zapierKey, setZapierKey] = useState('');
  const { toast } = useToast();

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl).then(() => {
      setCopiedWebhook(true);
      toast({
        title: "URL copiada",
        description: "La URL del webhook ha sido copiada al portapapeles",
      });
      setTimeout(() => setCopiedWebhook(false), 2000);
    });
  };

  const handleSaveZapierKey = () => {
    toast({
      title: "Clave guardada",
      description: "La clave de API de Zapier ha sido guardada correctamente",
    });
  };

  const handleDownloadTemplate = () => {
    // Crear un archivo CSV básico como plantilla
    const csvContent = "nombre,email,telefono,empresa\nEjemplo,ejemplo@email.com,+1234567890,Mi Empresa";
    
    // Crear un blob con el contenido CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Crear un enlace de descarga y hacer clic automáticamente
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_contactos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Plantilla descargada",
      description: "Se ha descargado la plantilla CSV para importar contactos",
    });
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
          <TabsList>
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
                <div className="space-y-2">
                  <Label htmlFor="callWebhook">Webhook para llamadas</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="callWebhook" 
                      value={webhookUrl} 
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://tu-api.com/webhook" 
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleCopyWebhook}
                    >
                      {copiedWebhook ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableWebhook">Activar webhook</Label>
                    <Switch id="enableWebhook" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Guardar configuración</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="zapier" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integración con Zapier</CardTitle>
                <CardDescription>
                  Conecta tu centro de contacto con miles de aplicaciones a través de Zapier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zapierKey">Clave de API de Zapier</Label>
                  <Input 
                    id="zapierKey" 
                    value={zapierKey} 
                    onChange={(e) => setZapierKey(e.target.value)}
                    placeholder="Ingresa tu clave de API de Zapier" 
                  />
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableZapier">Activar integración</Label>
                    <Switch id="enableZapier" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveZapierKey}>Guardar configuración</Button>
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
                    <Button onClick={handleDownloadTemplate}>Descargar</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Plantilla de agentes</h3>
                      <p className="text-sm text-muted-foreground">CSV para importar agentes</p>
                    </div>
                    <Button onClick={handleDownloadTemplate}>Descargar</Button>
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
                      <p className="text-sm text-muted-foreground">Conectado</p>
                    </div>
                    <Button variant="outline">Configurar</Button>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">API de WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">No conectado</p>
                    </div>
                    <Button variant="outline">Conectar</Button>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">API de Google</h3>
                      <p className="text-sm text-muted-foreground">No conectado</p>
                    </div>
                    <Button variant="outline">Conectar</Button>
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

export default IntegrationsPage;
