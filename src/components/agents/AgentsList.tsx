
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users,
  Settings,
  MoreHorizontal,
  User 
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

interface Agent {
  id: string;
  name: string;
  type: "ai" | "human";
  status: "online" | "busy" | "offline";
  activeConversations: number;
  specialty?: string;
  model?: string;
}

const agents: Agent[] = [
  {
    id: "agent-1",
    name: "General Assistant",
    type: "ai",
    status: "online",
    activeConversations: 3,
    specialty: "General Inquiries",
    model: "Gemini Pro"
  },
  {
    id: "agent-2",
    name: "Technical Support",
    type: "ai",
    status: "online",
    activeConversations: 2,
    specialty: "Technical Support",
    model: "Gemini Pro"
  },
  {
    id: "agent-3",
    name: "Sarah Johnson",
    type: "human",
    status: "online",
    activeConversations: 1,
    specialty: "Customer Service"
  },
  {
    id: "agent-4",
    name: "Sales Agent",
    type: "ai",
    status: "offline",
    activeConversations: 0,
    specialty: "Sales",
    model: "Gemini Pro"
  },
  {
    id: "agent-5",
    name: "David Miller",
    type: "human",
    status: "busy",
    activeConversations: 2,
    specialty: "Technical Support"
  }
];

const AgentsList: React.FC = () => {
  const { toast } = useToast();
  
  const handleEditAgent = (agentId: string) => {
    toast({
      title: "Edit Agent",
      description: `Editing agent ${agentId}`,
    });
  };
  
  const handleConfigurePrompt = (agentId: string) => {
    toast({
      title: "Configure Prompts",
      description: `Configuring prompts for agent ${agentId}`,
    });
  };
  
  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
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

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Agents</span>
          </div>
        </CardTitle>
        <Button size="sm" variant="default">
          <span className="mr-1">+</span> New Agent
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">Agent</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Active Calls</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Specialty</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Model</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
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
                      {agent.type === "ai" ? "AI" : "Human"}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`}></div>
                      <span className="capitalize">{agent.status}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">{agent.activeConversations}</td>
                  <td className="p-4 align-middle">{agent.specialty || "--"}</td>
                  <td className="p-4 align-middle">{agent.model || "--"}</td>
                  <td className="p-4 align-middle">
                    <div className="flex space-x-2">
                      {agent.type === "ai" && (
                        <Button size="sm" variant="outline" onClick={() => handleConfigurePrompt(agent.id)}>
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditAgent(agent.id)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Clone</DropdownMenuItem>
                          <DropdownMenuItem>Deactivate</DropdownMenuItem>
                          {agent.status === "offline" && (
                            <DropdownMenuItem>Activate</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete
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
      </CardContent>
    </Card>
  );
};

export default AgentsList;
