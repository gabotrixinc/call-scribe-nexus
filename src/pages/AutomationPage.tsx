
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Link, Import, ArrowRight, Phone } from "lucide-react";

const AutomationPage: React.FC = () => {
  const { toast } = useToast();
  const [zapierWebhookUrl, setZapierWebhookUrl] = useState('');
  const [makeWebhookUrl, setMakeWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const handleTriggerZapier = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!zapierWebhookUrl) {
      toast({
        title: "Error",
        description: "Por favor ingresa la URL del webhook de Zapier",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(zapierWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: "ContactCenter Platform",
          action: "contact_sync",
        }),
      });
      
      toast({
        title: "Solicitud Enviada",
        description: "La solicitud fue enviada a Zapier. Por favor verifica el historial de tu Zap para confirmar que se activó.",
      });
    } catch (error) {
      console.error("Error al activar webhook:", error);
      toast({
        title: "Error",
        description: "No se pudo activar el webhook de Zapier. Por favor verifica la URL e intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTriggerMake = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!makeWebhookUrl) {
      toast({
        title: "Error",
        description: "Por favor ingresa la URL del webhook de Make.com",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(makeWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: "ContactCenter Platform",
          action: "contact_sync",
        }),
      });
      
      toast({
        title: "Solicitud Enviada",
        description: "La solicitud fue enviada a Make.com. Por favor verifica el historial de tu escenario para confirmar que se activó.",
      });
    } catch (error) {
      console.error("Error al activar webhook:", error);
      toast({
        title: "Error",
        description: "No se pudo activar el webhook de Make.com. Por favor verifica la URL e intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };
  
  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo CSV para importar",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar que sea un archivo CSV
    if (!csvFile.name.endsWith('.csv')) {
      toast({
        title: "Formato Inválido",
        description: "Por favor sube un archivo con formato CSV",
        variant: "destructive",
      });
      return;
    }
    
    setUploadStatus('Procesando archivo...');
    setIsLoading(true);
    
    // Simular procesamiento del archivo
    setTimeout(() => {
      setUploadStatus('Validando datos...');
      
      setTimeout(() => {
        setUploadStatus('');
        setIsLoading(false);
        setCsvFile(null);
        
        toast({
          title: "Importación Exitosa",
          description: `Se importaron los contactos del archivo ${csvFile.name}`,
        });
        
        // Resetear el input de archivo
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
      }, 1500);
    }, 2000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight neo-gradient">Automatizaciones</h1>
          <p className="text-muted-foreground">Integra tu centro de contacto con otras plataformas y automatiza procesos.</p>
        </div>
        
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="import">Importar Contactos</TabsTrigger>
            <TabsTrigger value="zapier">Integración Zapier</TabsTrigger>
            <TabsTrigger value="make">Integración Make</TabsTrigger>
            <TabsTrigger value="webhook">Webhooks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="import" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  <span>Importar contactos</span>
                </CardTitle>
                <CardDescription>
                  Sube un archivo CSV con tus contactos para importarlos al sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCsvUpload} className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="csv-file">Archivo CSV</Label>
                    <Input 
                      id="csv-file" 
                      type="file" 
                      accept=".csv"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                    {csvFile && <p className="text-xs text-muted-foreground">Archivo seleccionado: {csvFile.name}</p>}
                    {uploadStatus && <p className="text-xs text-primary">{uploadStatus}</p>}
                  </div>
                  <div className="bg-secondary/30 rounded-md p-3">
                    <h4 className="font-medium mb-1">Formato requerido</h4>
                    <p className="text-sm text-muted-foreground">
                      El archivo CSV debe contener las siguientes columnas: 
                      nombre, apellido, email, teléfono
                    </p>
                    <div className="mt-2">
                      <a href="#" className="text-xs text-primary hover:underline">
                        Descargar plantilla CSV
                      </a>
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading || !csvFile}>
                    {isLoading ? 'Procesando...' : 'Importar Contactos'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="zapier" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-primary" />
                  <span>Integración con Zapier</span>
                </CardTitle>
                <CardDescription>
                  Conecta tu centro de contacto con miles de aplicaciones a través de Zapier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-secondary/30 p-4">
                  <h4 className="font-medium mb-1">¿Cómo configurar?</h4>
                  <ol className="list-decimal list-inside text-sm space-y-2">
                    <li>Crea un nuevo Zap en tu cuenta de Zapier</li>
                    <li>Selecciona "Webhook by Zapier" como trigger</li>
                    <li>Copia la URL del webhook generada</li>
                    <li>Pega la URL en el campo debajo y guarda</li>
                    <li>Haz clic en "Probar Conexión" para verificar</li>
                  </ol>
                </div>
                
                <form onSubmit={handleTriggerZapier} className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="zapier-webhook">URL del Webhook de Zapier</Label>
                    <Input 
                      id="zapier-webhook" 
                      placeholder="https://hooks.zapier.com/hooks/catch/123456/abcdef/" 
                      value={zapierWebhookUrl}
                      onChange={(e) => setZapierWebhookUrl(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={isLoading || !zapierWebhookUrl}>
                      Probar Conexión
                    </Button>
                    <Button variant="outline" type="button">
                      Ver Documentación
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-medium text-lg">Integraciones Disponibles</CardTitle>
                <CardDescription>
                  Ejemplos de integraciones populares con Zapier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-md border-border">
                    <h4 className="font-medium">Salesforce</h4>
                    <p className="text-sm text-muted-foreground">Sincroniza contactos con Salesforce CRM</p>
                    <Button variant="link" className="p-0 h-auto mt-2 text-sm">
                      Configurar <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-md border-border">
                    <h4 className="font-medium">HubSpot</h4>
                    <p className="text-sm text-muted-foreground">Crear contactos y deals en HubSpot</p>
                    <Button variant="link" className="p-0 h-auto mt-2 text-sm">
                      Configurar <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-md border-border">
                    <h4 className="font-medium">Google Sheets</h4>
                    <p className="text-sm text-muted-foreground">Exportar datos a hojas de cálculo</p>
                    <Button variant="link" className="p-0 h-auto mt-2 text-sm">
                      Configurar <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="make" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-primary" />
                  <span>Integración con Make.com</span>
                </CardTitle>
                <CardDescription>
                  Conecta tu centro de contacto con Make.com (anteriormente Integromat)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-secondary/30 p-4">
                  <h4 className="font-medium mb-1">¿Cómo configurar?</h4>
                  <ol className="list-decimal list-inside text-sm space-y-2">
                    <li>Crea un nuevo escenario en tu cuenta de Make.com</li>
                    <li>Añade un módulo "Webhook" como trigger</li>
                    <li>Copia la URL del webhook generada</li>
                    <li>Pega la URL en el campo debajo y guarda</li>
                    <li>Haz clic en "Probar Conexión" para verificar</li>
                  </ol>
                </div>
                
                <form onSubmit={handleTriggerMake} className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="make-webhook">URL del Webhook de Make.com</Label>
                    <Input 
                      id="make-webhook" 
                      placeholder="https://hook.make.com/abcdef123456789" 
                      value={makeWebhookUrl}
                      onChange={(e) => setMakeWebhookUrl(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={isLoading || !makeWebhookUrl}>
                      Probar Conexión
                    </Button>
                    <Button variant="outline" type="button">
                      Ver Documentación
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-medium text-lg">Escenarios Populares</CardTitle>
                <CardDescription>
                  Ejemplos de escenarios populares con Make.com
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-md border-border">
                    <h4 className="font-medium">Asignación automática</h4>
                    <p className="text-sm text-muted-foreground">Asigna contactos a agentes basándose en reglas</p>
                    <Button variant="link" className="p-0 h-auto mt-2 text-sm">
                      Configurar <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-md border-border">
                    <h4 className="font-medium">Notificaciones</h4>
                    <p className="text-sm text-muted-foreground">Envía notificaciones a Slack o Teams</p>
                    <Button variant="link" className="p-0 h-auto mt-2 text-sm">
                      Configurar <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-md border-border">
                    <h4 className="font-medium">Seguimiento de leads</h4>
                    <p className="text-sm text-muted-foreground">Actualiza el estatus de leads en tu CRM</p>
                    <Button variant="link" className="p-0 h-auto mt-2 text-sm">
                      Configurar <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="webhook" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Import className="h-5 w-5 text-primary" />
                  <span>Webhooks Personalizados</span>
                </CardTitle>
                <CardDescription>
                  Configura webhooks para enviar y recibir datos de sistemas externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md bg-secondary/30 p-4">
                  <h4 className="font-medium mb-1">Información de Webhooks</h4>
                  <p className="text-sm text-muted-foreground">
                    Los webhooks permiten la comunicación en tiempo real entre tu centro de contacto y sistemas externos.
                    Puedes configurar webhooks de entrada para recibir datos y webhooks de salida para enviar datos cuando ocurran ciertos eventos.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Webhooks de Entrada</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Usa estas URLs para enviar datos a tu centro de contacto desde sistemas externos.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h4 className="font-medium">Crear Contacto</h4>
                        <p className="text-xs text-muted-foreground">POST: /api/v1/webhooks/contacts</p>
                      </div>
                      <Button variant="outline" size="sm">Copiar URL</Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h4 className="font-medium">Crear Llamada</h4>
                        <p className="text-xs text-muted-foreground">POST: /api/v1/webhooks/calls</p>
                      </div>
                      <Button variant="outline" size="sm">Copiar URL</Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h4 className="font-medium">Evento Personalizado</h4>
                        <p className="text-xs text-muted-foreground">POST: /api/v1/webhooks/custom</p>
                      </div>
                      <Button variant="outline" size="sm">Copiar URL</Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Webhooks de Salida</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configura URLs para enviar datos cuando ocurran eventos en tu centro de contacto.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhook-call-start">Al iniciar llamada</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="webhook-call-start" 
                          placeholder="https://tu-servidor.com/webhook" 
                        />
                        <Button variant="outline">Guardar</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="webhook-call-end">Al finalizar llamada</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="webhook-call-end" 
                          placeholder="https://tu-servidor.com/webhook" 
                        />
                        <Button variant="outline">Guardar</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="webhook-contact-created">Al crear contacto</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="webhook-contact-created" 
                          placeholder="https://tu-servidor.com/webhook" 
                        />
                        <Button variant="outline">Guardar</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Guardar Configuración</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AutomationPage;
