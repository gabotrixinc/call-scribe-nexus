
import React from 'react';
import Layout from '@/components/Layout';
import AgentsList from '@/components/agents/AgentsList';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AgentsPage: React.FC = () => {
  const { toast } = useToast();
  
  const handleCreateAgent = () => {
    toast({
      title: "Create Agent",
      description: "Opening agent creation wizard",
    });
  };
  
  const handleAdjustCapacity = () => {
    toast({
      title: "Capacity Settings",
      description: "Adjusting AI capacity settings",
    });
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
                    <div className="text-sm text-muted-foreground">10/15 active</div>
                  </div>
                  <Progress value={66} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Human Agents</div>
                    <div className="text-sm text-muted-foreground">4/8 active</div>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Concurrent Calls</div>
                    <div className="text-sm text-muted-foreground">26/50 active</div>
                  </div>
                  <Progress value={52} className="h-2" />
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
                    <span className="mr-1">+</span> New Agent
                  </Button>
                  <Button variant="outline" onClick={handleAdjustCapacity}>
                    Adjust Capacity
                  </Button>
                  <Button variant="outline">
                    Prompts Library
                  </Button>
                  <Button variant="outline">
                    Voice Settings
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
    </Layout>
  );
};

export default AgentsPage;
