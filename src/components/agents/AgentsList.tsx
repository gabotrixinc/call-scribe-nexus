
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users,
  Settings,
  MoreHorizontal,
  User,
  Loader2 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useAgentsService } from '@/hooks/useAgentsService';
import AgentForm from './AgentForm';
import AgentPromptConfig from './AgentPromptConfig';

const AgentsList: React.FC = () => {
  const { agents, isLoadingAgents, updateAgentStatus, deleteAgent } = useAgentsService();
  const { toast } = useToast();
  const [showNewAgentForm, setShowNewAgentForm] = useState(false);
  const [showConfigPrompt, setShowConfigPrompt] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  useEffect(() => {
    console.log("Agents loaded from database:", agents);
  }, [agents]);
  
  const handleEditAgent = (agentId: string) => {
    toast({
      title: "Editar Agente",
      description: `Editando agente ${agentId}`,
    });
    // Esta funcionalidad vendría en una versión futura
  };
  
  const handleConfigurePrompt = (agentId: string) => {
    setSelectedAgent(agentId);
    setShowConfigPrompt(true);
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este agente?")) {
      await deleteAgent.mutateAsync(agentId);
    }
  };

  const handleStatusChange = async (agentId: string, newStatus: 'available' | 'busy' | 'offline' | 'online') => {
    await updateAgentStatus.mutateAsync({ agentId, status: newStatus });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
      case "online":
        return "Disponible";
      case "busy":
        return "Ocupado";
      case "offline":
        return "Desconectado";
      default:
        return status;
    }
  };

  if (isLoadingAgents) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando agentes...</span>
      </div>
    );
  }

  return (
    <>
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Agentes</span>
            </div>
          </CardTitle>
          <Button size="sm" variant="default" onClick={() => setShowNewAgentForm(true)}>
            <span className="mr-1">+</span> Nuevo Agente
          </Button>
        </CardHeader>
        <CardContent>
          {agents && agents.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Agente</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Tipo</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Estado</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Llamadas Activas</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Especialidad</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Voz</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">
                        <div className="flex items-center gap-2">
                          {agent.type === "ai" ? (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                              AI
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary/10">
                              <User className="h-4 w-4 text-secondary" />
                            </div>
                          )}
                          {agent.name}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant={agent.type === "ai" ? "secondary" : "default"}>
                          {agent.type === "ai" ? "AI" : "Humano"}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-auto p-0 font-normal">
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`}></div>
                                <span className="capitalize">
                                  {getStatusText(agent.status)}
                                </span>
                              </div>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(agent.id, "available")}>
                              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                              Disponible
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(agent.id, "busy")}>
                              <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                              Ocupado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(agent.id, "offline")}>
                              <div className="h-2 w-2 rounded-full bg-gray-500 mr-2"></div>
                              Desconectado
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="p-4 align-middle">0</td>
                      <td className="p-4 align-middle">{agent.specialization || "--"}</td>
                      <td className="p-4 align-middle">{agent.voice_id || "--"}</td>
                      <td className="p-4 align-middle">
                        <div className="flex space-x-2">
                          {agent.type === "ai" && (
                            <Button size="sm" variant="outline" onClick={() => handleConfigurePrompt(agent.id)}>
                              <Settings className="h-4 w-4 mr-1" />
                              Configurar
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditAgent(agent.id)}>Editar</DropdownMenuItem>
                              <DropdownMenuItem>Clonar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(agent.id, agent.status === "offline" ? "available" : "offline")}>
                                {agent.status === "offline" ? "Activar" : "Desactivar"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteAgent(agent.id)}
                              >
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay agentes configurados</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                Los agentes te permiten automatizar conversaciones y atender a tus clientes de forma eficiente.
              </p>
              <Button onClick={() => setShowNewAgentForm(true)}>
                Crear primer agente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario para crear un nuevo agente */}
      <AgentForm 
        open={showNewAgentForm} 
        onClose={() => setShowNewAgentForm(false)} 
      />
      
      {/* Configuración de prompt para agente AI */}
      {showConfigPrompt && selectedAgent && (
        <AgentPromptConfig 
          open={showConfigPrompt} 
          onClose={() => setShowConfigPrompt(false)}
          agentId={selectedAgent}
        />
      )}
    </>
  );
};

export default AgentsList;
