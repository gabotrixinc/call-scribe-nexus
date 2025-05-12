
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import TemplateManager from '@/components/messaging/TemplateManager';
import WhatsappConfiguration from '@/components/messaging/WhatsappConfiguration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConversationsList from '@/components/messaging/ConversationsList';

const MessagingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('conversations');
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mensajería</h1>
            <p className="text-muted-foreground">Gestiona tus conversaciones y plantillas de mensajería.</p>
          </div>
        </div>
        
        <Tabs 
          defaultValue="conversations" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="conversations">Conversaciones</TabsTrigger>
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
          </TabsList>
          
          <TabsContent value="conversations" className="space-y-4">
            <ConversationsList />
          </TabsContent>
          
          <TabsContent value="templates">
            <TemplateManager />
          </TabsContent>
          
          <TabsContent value="config" className="space-y-4">
            <WhatsappConfiguration />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MessagingPage;
