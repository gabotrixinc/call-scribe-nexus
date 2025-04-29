
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Bot, Loader2, Save, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIPromptConfig {
  id: string;
  name: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  language: string;
  is_default: boolean;
}

const AIConfigPanel = () => {
  const [promptConfigs, setPromptConfigs] = useState<AIPromptConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<AIPromptConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPromptConfigs = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('ai_prompt_configs')
          .select('*')
          .order('name');

        if (error) throw error;
        
        if (data && data.length > 0) {
          setPromptConfigs(data);
          // Select default or first config
          const defaultConfig = data.find(config => config.is_default) || data[0];
          setSelectedConfig(defaultConfig);
        } else {
          // Create a default config if none exists
          const defaultConfig: Omit<AIPromptConfig, 'id'> = {
            name: 'Configuración Predeterminada',
            system_prompt: `Eres un asistente virtual para nuestra empresa. Estás hablando con un cliente por WhatsApp.
            
Recuerda:
- Sé cortés y profesional
- Mantén las respuestas concisas (menos de 150 palabras) ya que es WhatsApp
- No menciones que eres una inteligencia artificial
- Ayuda al cliente lo mejor que puedas con sus consultas
- Si no puedes resolver un problema, ofrece transferir al cliente a un agente humano
- Firma como "Soporte" al final de tus mensajes`,
            temperature: 0.7,
            max_tokens: 1024,
            language: 'es',
            is_default: true
          };
          
          const { data: newConfig, error: createError } = await supabase
            .from('ai_prompt_configs')
            .insert(defaultConfig)
            .select()
            .single();
            
          if (createError) throw createError;
          
          setPromptConfigs([newConfig]);
          setSelectedConfig(newConfig);
        }
        
        // Load Gemini API key from settings
        const { data: settings } = await supabase
          .from('settings')
          .select('gemini_api_key')
          .eq('id', 'default')
          .single();
          
        if (settings?.gemini_api_key) {
          setGeminiApiKey('••••••••••••••••••••••••');
          setIsKeyValid(true);
        }
      } catch (error) {
        console.error('Error loading AI configurations:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las configuraciones de IA',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromptConfigs();
  }, [toast]);

  const handleSelectConfig = (id: string) => {
    const config = promptConfigs.find(c => c.id === id);
    if (config) {
      setSelectedConfig(config);
    }
  };

  const handleCreateNewConfig = async () => {
    const newConfig: Omit<AIPromptConfig, 'id'> = {
      name: `Nueva Configuración ${promptConfigs.length + 1}`,
      system_prompt: '',
      temperature: 0.7,
      max_tokens: 1024,
      language: 'es',
      is_default: false
    };
    
    try {
      const { data, error } = await supabase
        .from('ai_prompt_configs')
        .insert(newConfig)
        .select()
        .single();
        
      if (error) throw error;
      
      setPromptConfigs([...promptConfigs, data]);
      setSelectedConfig(data);
      
      toast({
        title: 'Configuración creada',
        description: 'Se ha creado una nueva configuración de IA',
      });
    } catch (error) {
      console.error('Error creating new configuration:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la configuración',
        variant: 'destructive',
      });
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedConfig) return;
    
    try {
      setIsSaving(true);
      
      // If this config is being set as default, unset default on all others
      if (selectedConfig.is_default) {
        await supabase
          .from('ai_prompt_configs')
          .update({ is_default: false })
          .neq('id', selectedConfig.id);
      }
      
      // Update the selected config
      const { error } = await supabase
        .from('ai_prompt_configs')
        .update({
          name: selectedConfig.name,
          system_prompt: selectedConfig.system_prompt,
          temperature: selectedConfig.temperature,
          max_tokens: selectedConfig.max_tokens,
          language: selectedConfig.language,
          is_default: selectedConfig.is_default,
        })
        .eq('id', selectedConfig.id);
      
      if (error) throw error;
      
      // Update local state
      setPromptConfigs(
        promptConfigs.map(config =>
          config.id === selectedConfig.id ? selectedConfig : { ...config, is_default: config.is_default && !selectedConfig.is_default }
        )
      );
      
      toast({
        title: 'Configuración guardada',
        description: 'La configuración de IA ha sido actualizada correctamente',
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestAPIKey = async () => {
    try {
      setIsTestingAPI(true);
      setIsKeyValid(null);
      
      // Simple test request to Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${geminiApiKey}`);
      const data = await response.json();
      
      if (response.ok) {
        setIsKeyValid(true);
        toast({
          title: 'Conexión exitosa',
          description: 'La clave API de Gemini es válida',
        });
        
        // Save the API key to settings
        await supabase
          .from('settings')
          .update({ gemini_api_key: geminiApiKey })
          .eq('id', 'default');
      } else {
        setIsKeyValid(false);
        toast({
          title: 'Error de conexión',
          description: `Error: ${data.error?.message || 'Clave API inválida'}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setIsKeyValid(false);
      toast({
        title: 'Error',
        description: 'No se pudo verificar la clave API',
        variant: 'destructive',
      });
    } finally {
      setIsTestingAPI(false);
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
    <Tabs defaultValue="prompt" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="prompt">Configuración de Prompts</TabsTrigger>
        <TabsTrigger value="api">Configuración API</TabsTrigger>
        <TabsTrigger value="behavior">Comportamiento</TabsTrigger>
      </TabsList>
      
      <TabsContent value="prompt" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Configuraciones de Prompt</h3>
          <Button variant="outline" size="sm" onClick={handleCreateNewConfig}>
            <Plus className="h-4 w-4 mr-2" /> Nueva configuración
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-4">
            <div className="border rounded-md p-3">
              {promptConfigs.map((config) => (
                <div
                  key={config.id}
                  className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${
                    selectedConfig?.id === config.id
                      ? 'bg-accent'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleSelectConfig(config.id)}
                >
                  <div className="flex items-center">
                    <Bot className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm font-medium">{config.name}</span>
                  </div>
                  {config.is_default && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Predeterminado
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {selectedConfig && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{selectedConfig.name}</CardTitle>
                <CardDescription>
                  Edite los parámetros de esta configuración de IA para mensajería
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="config-name">Nombre de la configuración</Label>
                  <Input
                    id="config-name"
                    value={selectedConfig.name}
                    onChange={(e) =>
                      setSelectedConfig({
                        ...selectedConfig,
                        name: e.target.value,
                      })
                    }
                    placeholder="Ejemplo: Asistente de Ventas"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="system-prompt">Prompt del sistema</Label>
                  <Textarea
                    id="system-prompt"
                    value={selectedConfig.system_prompt}
                    onChange={(e) =>
                      setSelectedConfig({
                        ...selectedConfig,
                        system_prompt: e.target.value,
                      })
                    }
                    placeholder="Instrucciones para el comportamiento del asistente..."
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Estas instrucciones guían el comportamiento del asistente IA en todas las conversaciones.
                  </p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Temperatura</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[selectedConfig.temperature]}
                        min={0}
                        max={1}
                        step={0.1}
                        onValueChange={([value]) =>
                          setSelectedConfig({
                            ...selectedConfig,
                            temperature: value,
                          })
                        }
                      />
                      <span className="w-12 text-right">{selectedConfig.temperature}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Controla la aleatoriedad. Valores más bajos son más predecibles.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Máximo de tokens</Label>
                    <Input
                      type="number"
                      value={selectedConfig.max_tokens}
                      onChange={(e) =>
                        setSelectedConfig({
                          ...selectedConfig,
                          max_tokens: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Limita la longitud de las respuestas generadas.
                    </p>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Idioma</Label>
                    <Select
                      value={selectedConfig.language}
                      onValueChange={(value) =>
                        setSelectedConfig({
                          ...selectedConfig,
                          language: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">Inglés</SelectItem>
                        <SelectItem value="pt">Portugués</SelectItem>
                        <SelectItem value="fr">Francés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 flex items-center">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="default-config"
                        checked={selectedConfig.is_default}
                        onCheckedChange={(checked) =>
                          setSelectedConfig({
                            ...selectedConfig,
                            is_default: checked,
                          })
                        }
                      />
                      <Label htmlFor="default-config">Configuración predeterminada</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveConfig} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar configuración
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="api">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de API Gemini</CardTitle>
            <CardDescription>
              Conecte con Google Gemini para habilitar la IA conversacional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Clave API de Gemini</Label>
              <div className="flex space-x-2">
                <Input
                  id="api-key"
                  type="text"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-grow"
                />
                <Button 
                  onClick={handleTestAPIKey} 
                  disabled={!geminiApiKey || isTestingAPI}
                >
                  {isTestingAPI ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Probar conexión
                </Button>
              </div>
              {isKeyValid !== null && (
                <p className={`text-sm ${isKeyValid ? 'text-green-500' : 'text-red-500'}`}>
                  {isKeyValid
                    ? 'Conexión exitosa a la API de Gemini'
                    : 'La conexión falló. Verifique su clave API'}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Puede obtener su clave API de Gemini en la consola de Google AI.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="behavior">
        <Card>
          <CardHeader>
            <CardTitle>Comportamiento de IA</CardTitle>
            <CardDescription>
              Configure cómo la IA interactuará con los clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="auto-respond" defaultChecked />
              <Label htmlFor="auto-respond">Responder automáticamente a mensajes entrantes</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="human-escalation" defaultChecked />
              <Label htmlFor="human-escalation">Permitir escalación a agentes humanos</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="context-awareness" defaultChecked />
              <Label htmlFor="context-awareness">Mantener contexto de toda la conversación</Label>
            </div>
            
            <div className="space-y-2">
              <Label>Tiempo máximo de inactividad antes de cerrar conversación</Label>
              <Select defaultValue="60">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                  <SelectItem value="240">4 horas</SelectItem>
                  <SelectItem value="480">8 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Guardar comportamiento
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AIConfigPanel;
