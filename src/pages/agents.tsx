import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useElevenLabsService } from '@/hooks/useElevenLabsService';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Trash2, Edit, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function AgentsPage() {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isNewAgentDialogOpen, setIsNewAgentDialogOpen] = useState(false);
  const [isEditAgentDialogOpen, setIsEditAgentDialogOpen] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
  
  // Formulario para nuevo agente
  const [newAgentForm, setNewAgentForm] = useState({
    name: '',
    description: '',
    voice_id: '',
    system_prompt: '',
    knowledge_base_id: '',
    llm_model: 'gpt-3.5-turbo',
    initial_message: 'Hola, ¿en qué puedo ayudarte?',
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 800,
    tools: []
  });
  
  const {
    getApiKey,
    saveApiKey,
    isSavingApiKey,
    voices,
    isLoadingVoices,
    agents,
    isLoadingAgents,
    knowledgeBases,
    isLoadingKnowledgeBases,
    localAgents,
    isLoadingLocalAgents,
    createAgent,
    isCreatingAgent,
    updateAgent,
    isUpdatingAgent,
    deleteAgent,
    isDeletingAgent
  } = useElevenLabsService();
  
  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      saveApiKey(apiKeyInput.trim());
      setIsApiKeyDialogOpen(false);
    }
  };
  
  const handleCreateAgent = () => {
    createAgent({
      name: newAgentForm.name,
      description: newAgentForm.description,
      voice_id: newAgentForm.voice_id,
      system_prompt: newAgentForm.system_prompt,
      knowledge_base_id: newAgentForm.knowledge_base_id || undefined,
      llm_model: newAgentForm.llm_model,
      initial_message: newAgentForm.initial_message,
      temperature: newAgentForm.temperature,
      top_p: newAgentForm.top_p,
      max_tokens: newAgentForm.max_tokens,
      tools: newAgentForm.tools
    });
    setIsNewAgentDialogOpen(false);
    resetNewAgentForm();
  };
  
  const handleUpdateAgent = () => {
    if (!currentAgentId) return;
    
    const agentToUpdate = agents.find(a => a.agent_id === currentAgentId);
    if (!agentToUpdate) return;
    
    updateAgent({
      ...agentToUpdate,
      name: newAgentForm.name,
      description: newAgentForm.description,
      voice_id: newAgentForm.voice_id,
      system_prompt: newAgentForm.system_prompt,
      knowledge_base_id: newAgentForm.knowledge_base_id || undefined,
      llm_model: newAgentForm.llm_model,
      initial_message: newAgentForm.initial_message,
      temperature: newAgentForm.temperature,
      top_p: newAgentForm.top_p,
      max_tokens: newAgentForm.max_tokens,
      tools: newAgentForm.tools
    });
    setIsEditAgentDialogOpen(false);
  };
  
  const handleDeleteAgent = (agentId: string) => {
    if (confirm('¿Está seguro de que desea eliminar este agente?')) {
      deleteAgent(agentId);
    }
  };
  
  const handleEditAgent = (agentId: string) => {
    const agentToEdit = agents.find(a => a.agent_id === agentId);
    if (!agentToEdit) return;
    
    setNewAgentForm({
      name: agentToEdit.name,
      description: agentToEdit.description || '',
      voice_id: agentToEdit.voice_id,
      system_prompt: agentToEdit.system_prompt || '',
      knowledge_base_id: agentToEdit.knowledge_base_id || '',
      llm_model: agentToEdit.llm_model || 'gpt-3.5-turbo',
      initial_message: agentToEdit.initial_message || 'Hola, ¿en qué puedo ayudarte?',
      temperature: agentToEdit.temperature || 0.7,
      top_p: agentToEdit.top_p || 0.95,
      max_tokens: agentToEdit.max_tokens || 800,
      tools: agentToEdit.tools || []
    });
    
    setCurrentAgentId(agentId);
    setIsEditAgentDialogOpen(true);
  };
  
  const resetNewAgentForm = () => {
    setNewAgentForm({
      name: '',
      description: '',
      voice_id: '',
      system_prompt: '',
      knowledge_base_id: '',
      llm_model: 'gpt-3.5-turbo',
      initial_message: 'Hola, ¿en qué puedo ayudarte?',
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 800,
      tools: []
    });
  };
  
  const hasApiKey = !!getApiKey();
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Agentes</h1>
          <p className="text-muted-foreground">Gestiona tus agentes humanos y de IA para llamadas y mensajería.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsApiKeyDialogOpen(true)}
          >
            <Key className="mr-2 h-4 w-4" />
            {hasApiKey ? 'Cambiar API Key' : 'Configurar API Key'}
          </Button>
          <Button 
            onClick={() => setIsNewAgentDialogOpen(true)}
            disabled={!hasApiKey}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Agente
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="ai">
        <TabsList className="mb-4">
          <TabsTrigger value="ai">Agentes IA</TabsTrigger>
          <TabsTrigger value="human">Agentes Humanos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai">
          {!hasApiKey ? (
            <Card>
              <CardHeader>
                <CardTitle>Configuración requerida</CardTitle>
                <CardDescription>
                  Para utilizar agentes de IA, primero debes configurar tu API Key de ElevenLabs.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => setIsApiKeyDialogOpen(true)}>
                  Configurar API Key
                </Button>
              </CardFooter>
            </Card>
          ) : isLoadingAgents ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : agents.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No hay agentes de IA</CardTitle>
                <CardDescription>
                  No se encontraron agentes de IA. Crea uno nuevo para comenzar.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => setIsNewAgentDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Agente
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map(agent => (
                <Card key={agent.agent_id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{agent.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditAgent(agent.agent_id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteAgent(agent.agent_id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{agent.description || 'Sin descripción'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Voz:</span>
                        <span className="text-sm">
                          {voices.find(v => v.voice_id === agent.voice_id)?.name || agent.voice_id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Modelo:</span>
                        <span className="text-sm">{agent.llm_model || 'Predeterminado'}</span>
                      </div>
                      {agent.knowledge_base_id && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Base de conocimiento:</span>
                          <span className="text-sm">
                            {knowledgeBases.find(kb => kb.knowledge_base_id === agent.knowledge_base_id)?.name || 'Personalizada'}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Herramientas:</span>
                        <span className="text-sm">{agent.tools?.length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" className="w-full">
                      Usar en llamada
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="human">
          <Card>
            <CardHeader>
              <CardTitle>Agentes Humanos</CardTitle>
              <CardDescription>
                Gestiona los agentes humanos que atenderán llamadas y mensajes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Funcionalidad para agentes humanos en desarrollo.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo para configurar API Key */}
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar API Key de ElevenLabs</DialogTitle>
            <DialogDescription>
              Ingresa tu API Key de ElevenLabs para habilitar la funcionalidad de agentes de IA conversacionales.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Ingresa tu API Key de ElevenLabs"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Puedes obtener tu API Key en la sección de perfil de tu cuenta de ElevenLabs.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveApiKey} disabled={!apiKeyInput.trim() || isSavingApiKey}>
              {isSavingApiKey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para crear nuevo agente */}
      <Dialog open={isNewAgentDialogOpen} onOpenChange={setIsNewAgentDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Agente</DialogTitle>
            <DialogDescription>
              Configura un nuevo agente de IA conversacional para tu contact center.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Agente *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Asistente de Ventas"
                  value={newAgentForm.name}
                  onChange={(e) => setNewAgentForm({...newAgentForm, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe la función de este agente"
                  value={newAgentForm.description}
                  onChange={(e) => setNewAgentForm({...newAgentForm, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="voice">Voz *</Label>
                <Select 
                  value={newAgentForm.voice_id} 
                  onValueChange={(value) => setNewAgentForm({...newAgentForm, voice_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una voz" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingVoices ? (
                      <div className="flex justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      voices.map(voice => (
                        <SelectItem key={voice.voice_id} value={voice.voice_id}>
                          {voice.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="system_prompt">Instrucciones del Sistema</Label>
                <Textarea
                  id="system_prompt"
                  placeholder="Instrucciones detalladas sobre cómo debe comportarse el agente"
                  value={newAgentForm.system_prompt}
                  onChange={(e) => setNewAgentForm({...newAgentForm, system_prompt: e.target.value})}
                  rows={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="knowledge_base">Base de Conocimiento</Label>
                <Select 
                  value={newAgentForm.knowledge_base_id} 
                  onValueChange={(value) => setNewAgentForm({...newAgentForm, knowledge_base_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una base de conocimiento (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguna</SelectItem>
                    {isLoadingKnowledgeBases ? (
                      <div className="flex justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      knowledgeBases.map(kb => (
                        <SelectItem key={kb.knowledge_base_id} value={kb.knowledge_base_id}>
                          {kb.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="llm_model">Modelo de Lenguaje</Label>
                <Select 
                  value={newAgentForm.llm_model} 
                  onValueChange={(value) => setNewAgentForm({...newAgentForm, llm_model: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="initial_message">Mensaje Inicial</Label>
                <Input
                  id="initial_message"
                  placeholder="Mensaje con el que el agente iniciará la conversación"
                  value={newAgentForm.initial_message}
                  onChange={(e) => setNewAgentForm({...newAgentForm, initial_message: e.target.value})}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configuración Avanzada</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="temperature">Temperatura: {newAgentForm.temperature}</Label>
                    <span className="text-sm text-muted-foreground">(0.0 - 1.0)</span>
                  </div>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[newAgentForm.temperature]}
                    onValueChange={(value) => setNewAgentForm({...newAgentForm, temperature: value[0]})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Controla la aleatoriedad de las respuestas. Valores más bajos son más deterministas.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="top_p">Top P: {newAgentForm.top_p}</Label>
                    <span className="text-sm text-muted-foreground">(0.0 - 1.0)</span>
                  </div>
                  <Slider
                    id="top_p"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[newAgentForm.top_p]}
                    onValueChange={(value) => setNewAgentForm({...newAgentForm, top_p: value[0]})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Controla la diversidad de las respuestas mediante muestreo de núcleo.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="max_tokens">Tokens Máximos: {newAgentForm.max_tokens}</Label>
                    <span className="text-sm text-muted-foreground">(100 - 4000)</span>
                  </div>
                  <Slider
                    id="max_tokens"
                    min={100}
                    max={4000}
                    step={100}
                    value={[newAgentForm.max_tokens]}
                    onValueChange={(value) => setNewAgentForm({...newAgentForm, max_tokens: value[0]})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Limita la longitud máxima de las respuestas generadas.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsNewAgentDialogOpen(false);
              resetNewAgentForm();
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateAgent} 
              disabled={!newAgentForm.name || !newAgentForm.voice_id || isCreatingAgent}
            >
              {isCreatingAgent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Agente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para editar agente */}
      <Dialog open={isEditAgentDialogOpen} onOpenChange={setIsEditAgentDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Editar Agente</DialogTitle>
            <DialogDescription>
              Modifica la configuración del agente de IA conversacional.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre del Agente *</Label>
                <Input
                  id="edit-name"
                  placeholder="Ej: Asistente de Ventas"
                  value={newAgentForm.name}
                  onChange={(e) => setNewAgentForm({...newAgentForm, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Describe la función de este agente"
                  value={newAgentForm.description}
                  onChange={(e) => setNewAgentForm({...newAgentForm, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-voice">Voz *</Label>
                <Select 
                  value={newAgentForm.voice_id} 
                  onValueChange={(value) => setNewAgentForm({...newAgentForm, voice_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una voz" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingVoices ? (
                      <div className="flex justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      voices.map(voice => (
                        <SelectItem key={voice.voice_id} value={voice.voice_id}>
                          {voice.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-system_prompt">Instrucciones del Sistema</Label>
                <Textarea
                  id="edit-system_prompt"
                  placeholder="Instrucciones detalladas sobre cómo debe comportarse el agente"
                  value={newAgentForm.system_prompt}
                  onChange={(e) => setNewAgentForm({...newAgentForm, system_prompt: e.target.value})}
                  rows={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-knowledge_base">Base de Conocimiento</Label>
                <Select 
                  value={newAgentForm.knowledge_base_id} 
                  onValueChange={(value) => setNewAgentForm({...newAgentForm, knowledge_base_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una base de conocimiento (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguna</SelectItem>
                    {isLoadingKnowledgeBases ? (
                      <div className="flex justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      knowledgeBases.map(kb => (
                        <SelectItem key={kb.knowledge_base_id} value={kb.knowledge_base_id}>
                          {kb.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-llm_model">Modelo de Lenguaje</Label>
                <Select 
                  value={newAgentForm.llm_model} 
                  onValueChange={(value) => setNewAgentForm({...newAgentForm, llm_model: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-initial_message">Mensaje Inicial</Label>
                <Input
                  id="edit-initial_message"
                  placeholder="Mensaje con el que el agente iniciará la conversación"
                  value={newAgentForm.initial_message}
                  onChange={(e) => setNewAgentForm({...newAgentForm, initial_message: e.target.value})}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configuración Avanzada</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="edit-temperature">Temperatura: {newAgentForm.temperature}</Label>
                    <span className="text-sm text-muted-foreground">(0.0 - 1.0)</span>
                  </div>
                  <Slider
                    id="edit-temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[newAgentForm.temperature]}
                    onValueChange={(value) => setNewAgentForm({...newAgentForm, temperature: value[0]})}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="edit-top_p">Top P: {newAgentForm.top_p}</Label>
                    <span className="text-sm text-muted-foreground">(0.0 - 1.0)</span>
                  </div>
                  <Slider
                    id="edit-top_p"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[newAgentForm.top_p]}
                    onValueChange={(value) => setNewAgentForm({...newAgentForm, top_p: value[0]})}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="edit-max_tokens">Tokens Máximos: {newAgentForm.max_tokens}</Label>
                    <span className="text-sm text-muted-foreground">(100 - 4000)</span>
                  </div>
                  <Slider
                    id="edit-max_tokens"
                    min={100}
                    max={4000}
                    step={100}
                    value={[newAgentForm.max_tokens]}
                    onValueChange={(value) => setNewAgentForm({...newAgentForm, max_tokens: value[0]})}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditAgentDialogOpen(false);
              resetNewAgentForm();
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateAgent} 
              disabled={!newAgentForm.name || !newAgentForm.voice_id || isUpdatingAgent}
            >
              {isUpdatingAgent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
