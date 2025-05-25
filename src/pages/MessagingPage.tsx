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
import { Badge } from '@/components/ui/badge';

const MessagingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('conversations');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [webConnected, setWebConnected] = useState<boolean>(false);
  
  const { data: conversations, isLoading, error, refetch } = useQuery({
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

  // Fetching WhatsApp connection status
  const { data: whatsappConfig } = useQuery({
    queryKey: ['whatsapp-config'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('whatsapp_config')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching WhatsApp config:', error);
          return { web_connected: false };
        }
        
        // If no config exists, return default state
        return data || { web_connected: false };
      } catch (error) {
        console.error('Error in WhatsApp config query:', error);
        return { web_connected: false };
      }
    },
    initialData: { web_connected: false }
  });
  
  // Update local state when config changes
  useEffect(() => {
    if (whatsappConfig) {
      setWebConnected(whatsappConfig.web_connected === true);
    }
  }, [whatsappConfig]);

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

  // Set up real-time subscription to WhatsApp config changes
  useEffect(() => {
    const channel = supabase
      .channel('whatsapp-config-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_config',
        },
        () => {
          // Refetch the WhatsApp config when it changes
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mensajería</h1>
            <p className="text-muted-foreground">Gestiona tus conversaciones y plantillas de mensajería.</p>
          </div>
          <div>
            {webConnected && (
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-500">
                WhatsApp Web Conectado
              </Badge>
            )}
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