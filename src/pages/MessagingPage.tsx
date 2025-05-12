
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import TemplateManager from '@/components/messaging/TemplateManager';
import WhatsappConfiguration from '@/components/messaging/WhatsappConfiguration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConversationsList from '@/components/messaging/ConversationsList';
import { supabase } from '@/integrations/supabase/client';
import { WhatsappConversation } from '@/types/messaging';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

const MessagingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('conversations');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ['whatsapp-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_conversations')
        .select('*, agents(id, name)')
        .order('last_message_time', { ascending: false });
      
      if (error) throw error;
      return data as WhatsappConversation[];
    }
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error al cargar conversaciones",
        description: "No se pudieron cargar las conversaciones. Intente nuevamente.",
        variant: "destructive"
      });
    }
  }, [error]);
  
  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };
  
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
            <ConversationsList 
              conversations={conversations || []} 
              isLoading={isLoading} 
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
            />
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
