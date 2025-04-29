
import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Send, Paperclip, Bot, User, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ConversationPanelProps {
  conversationId: string | null;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  ai_generated?: boolean;
  media_url?: string | null;
  media_type?: string | null;
}

const ConversationPanel: React.FC<ConversationPanelProps> = ({ conversationId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch conversation details and messages when conversationId changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setConversation(null);
      return;
    }

    const fetchConversation = async () => {
      try {
        setIsLoading(true);
        
        // Get conversation details
        const { data: conversationData, error: conversationError } = await supabase
          .from('whatsapp_conversations')
          .select('*, agents(*)')
          .eq('id', conversationId)
          .single();

        if (conversationError) throw conversationError;
        setConversation(conversationData);
        
        // Get messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('whatsapp_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('timestamp');
        
        if (messagesError) throw messagesError;
        setMessages(messagesData || []);

        // Mark messages as read if needed
        if (conversationData.unread_count > 0) {
          await supabase
            .from('whatsapp_conversations')
            .update({ unread_count: 0 })
            .eq('id', conversationId);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la conversación',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whatsapp_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, toast]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversationId || !conversation) return;
    
    try {
      setIsSending(true);
      
      const response = await fetch('/functions/send-whatsapp-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: conversation.wa_phone_number,
          message: newMessage,
          conversationId: conversationId,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'No se pudo enviar el mensaje');
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo enviar el mensaje',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <div>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Selecciona una conversación</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Selecciona una conversación de la lista para ver los mensajes.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {conversation && (
        <div className="border-b p-4 flex items-center">
          <div className="relative mr-3">
            {conversation.contact_photo_url ? (
              <Avatar>
                <AvatarImage src={conversation.contact_photo_url} alt={conversation.contact_name || 'Contact'} />
                <AvatarFallback>{(conversation.contact_name || 'U')[0]}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar>
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="flex-grow">
            <div className="font-medium">
              {conversation.contact_name || conversation.wa_phone_number}
            </div>
            <div className="text-xs text-muted-foreground flex gap-2 items-center">
              {!conversation.contact_name && conversation.wa_phone_number}
              {conversation.ai_agent_id && (
                <div className="flex items-center gap-1">
                  <Bot className="h-3 w-3 text-primary" />
                  <span>IA asignada: {conversation.agents?.name || 'Agente IA'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4 min-h-full">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8 opacity-70">
              <p>No hay mensajes en esta conversación.</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOutbound = message.direction === 'outbound';
              const isFirstMessageOfDay =
                index === 0 ||
                new Date(message.timestamp).toDateString() !==
                  new Date(messages[index - 1].timestamp).toDateString();

              return (
                <React.Fragment key={message.id}>
                  {isFirstMessageOfDay && (
                    <div className="flex justify-center my-6">
                      <div className="bg-muted px-3 py-1 rounded-md text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex ${
                      isOutbound ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        isOutbound
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent'
                      }`}
                    >
                      {message.content}
                      <div
                        className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                          isOutbound ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {message.ai_generated && <Bot className="h-3 w-3" />}
                        {formatDistanceToNow(new Date(message.timestamp), {
                          addSuffix: false,
                          locale: es,
                        })}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            disabled={isSending}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="flex-grow"
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending} className="shrink-0">
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
};

// Import at the top of the file
const MessageSquare = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

export default ConversationPanel;
