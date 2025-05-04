
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Settings2, Brain, User } from "lucide-react";
import AgentPromptConfig from '@/components/agents/AgentPromptConfig';

const AgentsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('ia');
  const [openPromptConfig, setOpenPromptConfig] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  
  const mockAgents = [
    { id: 'agent-1', name: 'Asistente General', type: 'ai', status: 'active', specialization: 'General', promptConfigured: true },
    { id: 'agent-2', name: 'Soporte Técnico', type: 'ai', status: 'active', specialization: 'Soporte', promptConfigured: false },
    { id: 'agent-3', name: 'Ventas', type: 'ai', status: 'active', specialization: 'Ventas', promptConfigured: false },
    { id: 'agent-4', name: 'Ana García', type: 'human', status: 'active', specialization: 'Atención al Cliente', promptConfigured: false },
  ];
  
  const handleConfigPrompt = (agentId: string) => {
    setSelectedAgentId(agentId);
    setOpenPromptConfig(true);
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agentes</h1>
            <p className="text-muted-foreground">Gestiona tus agentes humanos y de IA para llamadas y mensajería.</p>
          </div>
          
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Añadir Agente
          </Button>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ia">Agentes IA</TabsTrigger>
            <TabsTrigger value="humanos">Agentes Humanos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ia" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agentes de Inteligencia Artificial</CardTitle>
                <CardDescription>Configuración de agentes automatizados para atención al cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Especialización</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Configuración</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAgents.filter(a => a.type === 'ai').map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Brain className="h-4 w-4 text-primary mr-2" />
                            {agent.name}
                          </div>
                        </TableCell>
                        <TableCell>{agent.specialization}</TableCell>
                        <TableCell>
                          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                            {agent.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={agent.promptConfigured ? 'default' : 'outline'}>
                            {agent.promptConfigured ? 'Configurado' : 'No configurado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleConfigPrompt(agent.id)}>
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Voces</CardTitle>
                <CardDescription>Personaliza las voces que utilizan tus agentes de IA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">Español</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="justify-start">
                          <span>Lucía</span>
                          <Badge variant="secondary" className="ml-auto">Mujer</Badge>
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <span>Carlos</span>
                          <Badge variant="secondary" className="ml-auto">Hombre</Badge>
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <span>Ana</span>
                          <Badge variant="secondary" className="ml-auto">Mujer</Badge>
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <span>Miguel</span>
                          <Badge variant="secondary" className="ml-auto">Hombre</Badge>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">Inglés</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="justify-start">
                          <span>Sarah</span>
                          <Badge variant="secondary" className="ml-auto">Mujer</Badge>
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <span>John</span>
                          <Badge variant="secondary" className="ml-auto">Hombre</Badge>
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <span>Emma</span>
                          <Badge variant="secondary" className="ml-auto">Mujer</Badge>
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <span>David</span>
                          <Badge variant="secondary" className="ml-auto">Hombre</Badge>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="humanos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agentes Humanos</CardTitle>
                <CardDescription>Gestiona los agentes humanos que atienden llamadas</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Llamadas Atendidas</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAgents.filter(a => a.type === 'human').map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-primary mr-2" />
                            {agent.name}
                          </div>
                        </TableCell>
                        <TableCell>{agent.specialization}</TableCell>
                        <TableCell>
                          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                            {agent.status === 'active' ? 'Disponible' : 'No disponible'}
                          </Badge>
                        </TableCell>
                        <TableCell>142</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <AgentPromptConfig
        open={openPromptConfig}
        onClose={() => setOpenPromptConfig(false)}
        agentId={selectedAgentId}
      />
    </Layout>
  );
};

export default AgentsPage;
