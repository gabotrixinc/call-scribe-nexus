
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AgentsList from '@/components/agents/AgentsList';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Settings, Plus, Sliders, ScrollText, Mic } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const AgentsPage: React.FC = () => {
  const { toast } = useToast();
  
  // Estados para los diálogos
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const [capacityOpen, setCapacityOpen] = useState(false);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  
  // Estados para configuraciones
  const [aiCapacity, setAiCapacity] = useState(15);
  const [humanCapacity, setHumanCapacity] = useState(8);
  const [concurrentCalls, setConcurrentCalls] = useState(50);
  
  // Estados para nuevo agente
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentType, setNewAgentType] = useState('ai');
  
  const handleCreateAgent = () => {
    setCreateAgentOpen(true);
  };
  
  const handleAdjustCapacity = () => {
    setCapacityOpen(true);
  };
  
  const handlePromptsLibrary = () => {
    setPromptsOpen(true);
  };
  
  const handleVoiceSettings = () => {
    setVoiceOpen(true);
  };
  
  const saveNewAgent = () => {
    if (!newAgentName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del agente es obligatorio",
        variant: "destructive"
      });
      return;
    }
    
    // Aquí iría la lógica para crear un nuevo agente
    toast({
      title: "Agente creado",
      description: `Se ha creado el agente ${newAgentName} (${newAgentType === 'ai' ? 'IA' : 'Humano'})`,
    });
    
    setNewAgentName('');
    setNewAgentType('ai');
    setCreateAgentOpen(false);
  };
  
  const saveCapacitySettings = () => {
    toast({
      title: "Configuración guardada",
      description: "Se han actualizado los límites de capacidad",
    });
    setCapacityOpen(false);
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Management</h1>
          <p className="text-muted-foreground">Configure your AI and human agents for optimal performance.</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Agent Capacity</span>
              </CardTitle>
              <CardDescription>Current usage and availability of call agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">AI Agents</div>
                    <div className="text-sm text-muted-foreground">10/{aiCapacity} active</div>
                  </div>
                  <Progress value={Math.round(10/aiCapacity*100)} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Human Agents</div>
                    <div className="text-sm text-muted-foreground">4/{humanCapacity} active</div>
                  </div>
                  <Progress value={Math.round(4/humanCapacity*100)} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Concurrent Calls</div>
                    <div className="text-sm text-muted-foreground">26/{concurrentCalls} active</div>
                  </div>
                  <Progress value={Math.round(26/concurrentCalls*100)} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <span>Resource Management</span>
              </CardTitle>
              <CardDescription>Adjust capacity and configure global settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={handleCreateAgent}>
                    <Plus className="h-4 w-4 mr-1" /> New Agent
                  </Button>
                  <Button variant="outline" onClick={handleAdjustCapacity}>
                    <Sliders className="h-4 w-4 mr-1" /> Adjust Capacity
                  </Button>
                  <Button variant="outline" onClick={handlePromptsLibrary}>
                    <ScrollText className="h-4 w-4 mr-1" /> Prompts Library
                  </Button>
                  <Button variant="outline" onClick={handleVoiceSettings}>
                    <Mic className="h-4 w-4 mr-1" /> Voice Settings
                  </Button>
                </div>
                <div className="text-sm">
                  <div className="bg-accent p-4 rounded-md">
                    <p className="text-sm font-medium">System Status</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></div>
                      <span className="text-muted-foreground">All systems operational</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></div>
                      <span className="text-muted-foreground">API latency: 124ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <AgentsList />
      </div>

      {/* Diálogo para crear nuevo agente */}
      <Dialog open={createAgentOpen} onOpenChange={setCreateAgentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nuevo agente</DialogTitle>
            <DialogDescription>
              Complete los datos para crear un nuevo agente de atención
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Nombre del agente</Label>
              <Input 
                id="agent-name" 
                placeholder="Ej. Soporte Técnico" 
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de agente</Label>
              <div className="flex gap-4">
                <Button 
                  variant={newAgentType === 'ai' ? "default" : "outline"}
                  onClick={() => setNewAgentType('ai')}
                  className="flex-1"
                >
                  IA
                </Button>
                <Button 
                  variant={newAgentType === 'human' ? "default" : "outline"}
                  onClick={() => setNewAgentType('human')}
                  className="flex-1"
                >
                  Humano
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateAgentOpen(false)}>Cancelar</Button>
            <Button onClick={saveNewAgent}>Crear agente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para ajustar capacidad */}
      <Dialog open={capacityOpen} onOpenChange={setCapacityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar capacidad</DialogTitle>
            <DialogDescription>
              Configure los límites de capacidad para su centro de contacto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Agentes IA disponibles</Label>
                <span className="text-sm text-muted-foreground">{aiCapacity}</span>
              </div>
              <Slider 
                value={[aiCapacity]} 
                min={5} 
                max={50} 
                step={1}
                onValueChange={(value) => setAiCapacity(value[0])}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Agentes humanos disponibles</Label>
                <span className="text-sm text-muted-foreground">{humanCapacity}</span>
              </div>
              <Slider 
                value={[humanCapacity]} 
                min={1} 
                max={20} 
                step={1}
                onValueChange={(value) => setHumanCapacity(value[0])}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Llamadas concurrentes</Label>
                <span className="text-sm text-muted-foreground">{concurrentCalls}</span>
              </div>
              <Slider 
                value={[concurrentCalls]} 
                min={10} 
                max={100} 
                step={5}
                onValueChange={(value) => setConcurrentCalls(value[0])}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCapacityOpen(false)}>Cancelar</Button>
            <Button onClick={saveCapacitySettings}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para biblioteca de prompts */}
      <Dialog open={promptsOpen} onOpenChange={setPromptsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Biblioteca de prompts</DialogTitle>
            <DialogDescription>
              Gestione los prompts para sus agentes IA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Esta función estará disponible próximamente. Podrá crear y gestionar prompts personalizados para sus agentes IA.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromptsOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para configuración de voz */}
      <Dialog open={voiceOpen} onOpenChange={setVoiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración de voz</DialogTitle>
            <DialogDescription>
              Personalice las opciones de voz para sus agentes IA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Esta función estará disponible próximamente. Podrá configurar voces personalizadas, velocidad de habla y otros parámetros.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoiceOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AgentsPage;
