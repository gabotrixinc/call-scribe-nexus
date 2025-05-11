
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import TemplateManager from '@/components/messaging/TemplateManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
            <div className="flex flex-col items-center justify-center h-[60vh] bg-muted/30 rounded-lg border border-dashed">
              <h3 className="text-2xl font-semibold mb-2">Centro de conversaciones</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                El módulo de conversaciones estará disponible en la próxima actualización.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="templates">
            <TemplateManager />
          </TabsContent>
          
          <TabsContent value="config" className="space-y-4">
            <div className="flex flex-col items-center justify-center h-[60vh] bg-muted/30 rounded-lg border border-dashed">
              <h3 className="text-2xl font-semibold mb-2">Configuración de WhatsApp</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                La configuración de la integración con WhatsApp estará disponible próximamente.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MessagingPage;
