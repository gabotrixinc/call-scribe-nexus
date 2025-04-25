
import React from 'react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/components/ui/use-toast';
import { Settings, Key, MessageSquare, Phone } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  
  const handleSaveGeneral = () => {
    toast({
      title: "Settings Saved",
      description: "Your general settings have been updated",
    });
  };
  
  const handleSaveAPI = () => {
    toast({
      title: "API Settings Saved",
      description: "Your API configuration has been updated",
    });
  };
  
  const handleTestConnection = () => {
    toast({
      title: "Connection Test",
      description: "API connection successful!",
    });
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your contact center platform.</p>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="api">API Integration</TabsTrigger>
            <TabsTrigger value="voice">Voice Settings</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <span>General Settings</span>
                </CardTitle>
                <CardDescription>Basic configuration for your contact center</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" defaultValue="Acme Corporation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue="America/New_York" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Input id="language" defaultValue="English (US)" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="analytics" defaultChecked />
                  <Label htmlFor="analytics">Enable analytics and call recording</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="notifications" defaultChecked />
                  <Label htmlFor="notifications">Enable email notifications</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveGeneral}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="api" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  <span>API Configuration</span>
                </CardTitle>
                <CardDescription>Configure API keys for Google Cloud services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gemini-key">Google Gemini API Key</Label>
                  <Input id="gemini-key" type="password" placeholder="Enter your Gemini API key" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tts-key">Google TTS API Key</Label>
                  <Input id="tts-key" type="password" placeholder="Enter your TTS API key" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-id">Google Cloud Project ID</Label>
                  <Input id="project-id" placeholder="Enter your Project ID" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="api-test" defaultChecked />
                  <Label htmlFor="api-test">Verify API connections on save</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleTestConnection}>Test Connection</Button>
                <Button onClick={handleSaveAPI}>Save API Keys</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="voice" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>Voice Settings</span>
                </CardTitle>
                <CardDescription>Configure speech synthesis settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-voice">Default Voice</Label>
                  <Input id="default-voice" defaultValue="en-US-Standard-F" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speaking-rate">Speaking Rate</Label>
                  <Input id="speaking-rate" type="number" defaultValue="1.0" min="0.5" max="2.0" step="0.1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pitch">Voice Pitch</Label>
                  <Input id="pitch" type="number" defaultValue="0" min="-10" max="10" step="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="greeting">Default Greeting</Label>
                  <Textarea 
                    id="greeting" 
                    defaultValue="Hello, thank you for calling. How can I assist you today?" 
                    rows={3} 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Voice Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="webhooks" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>Webhooks</span>
                </CardTitle>
                <CardDescription>Configure webhooks for external integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="call-start-url">Call Start Webhook</Label>
                  <Input id="call-start-url" placeholder="https://your-domain.com/webhooks/call-start" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="call-end-url">Call End Webhook</Label>
                  <Input id="call-end-url" placeholder="https://your-domain.com/webhooks/call-end" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="escalation-url">Escalation Webhook</Label>
                  <Input id="escalation-url" placeholder="https://your-domain.com/webhooks/escalate" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Webhook Secret</Label>
                  <Input id="webhook-secret" type="password" placeholder="Enter your webhook secret" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Webhook Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
