
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import WhatsappConfiguration from '@/components/messaging/WhatsappConfiguration';
import ConversationsList from '@/components/messaging/ConversationsList';
import ConversationPanel from '@/components/messaging/ConversationPanel';
import TemplateManager from '@/components/messaging/TemplateManager';
import AIConfigPanel from '@/components/messaging/AIConfigPanel';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const MessagingPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('whatsapp_conversations')
          .select('*, agents(*)')
          .order('last_message_time', { ascending: false });

        if (error) throw error;
        setConversations(data || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: 'Error al cargar conversaciones',
          description: 'No se pudieron cargar las conversaciones. Por favor, intenta de nuevo.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();

    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel('whatsapp-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_conversations' },
        (payload) => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_messages' },
        (payload) => {
          if (payload.new && selectedConversation === payload.new.conversation_id) {
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, toast]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Mensajería</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona conversaciones de WhatsApp con asistencia de IA
          </p>
        </div>

        <Tabs defaultValue="conversations" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="conversations">Conversaciones</TabsTrigger>
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
            <TabsTrigger value="ai-config">Configuración IA</TabsTrigger>
            <TabsTrigger value="whatsapp-config">WhatsApp</TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[75vh]">
              <Card className="md:col-span-1 overflow-hidden flex flex-col">
                <CardContent className="p-0 flex-grow overflow-auto">
                  <ConversationsList 
                    conversations={conversations}
                    isLoading={isLoading}
                    selectedConversationId={selectedConversation}
                    onSelectConversation={setSelectedConversation}
                  />
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2 overflow-hidden flex flex-col">
                <CardContent className="p-0 flex-grow overflow-hidden">
                  <ConversationPanel 
                    conversationId={selectedConversation} 
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <TemplateManager />
          </TabsContent>

          <TabsContent value="ai-config">
            <AIConfigPanel />
          </TabsContent>

          <TabsContent value="whatsapp-config">
            <WhatsappConfiguration />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MessagingPage;
