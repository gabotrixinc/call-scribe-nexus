
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, User, Bot, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversationsListProps {
  conversations: any[];
  isLoading: boolean;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  isLoading,
  selectedConversationId,
  onSelectConversation,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredConversations = conversations.filter(
    (conv) => 
      conv.wa_phone_number.includes(searchTerm) || 
      (conv.contact_name && conv.contact_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatPhone = (phone: string) => {
    // Format phone number for display
    if (!phone) return '';
    if (phone.startsWith('+')) {
      return phone;
    }
    return `+${phone}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar conversación..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-grow">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[160px]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones activas'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 hover:bg-accent cursor-pointer flex items-center ${
                  selectedConversationId === conversation.id ? 'bg-accent' : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="relative mr-3">
                  {conversation.contact_photo_url ? (
                    <img
                      src={conversation.contact_photo_url}
                      alt={conversation.contact_name || 'Contact'}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-background rounded-full ${getStatusColor(
                      conversation.status
                    )}`}
                  />
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">
                      {conversation.contact_name || formatPhone(conversation.wa_phone_number)}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 flex items-center">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatDistanceToNow(new Date(conversation.last_message_time), {
                        addSuffix: true,
                        locale: es
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-muted-foreground truncate">
                      {!conversation.contact_name && (
                        <span>{formatPhone(conversation.wa_phone_number)}</span>
                      )}
                    </div>
                    
                    <div className="flex space-x-1.5 items-center">
                      {conversation.unread_count > 0 && (
                        <Badge variant="default" className="h-5 w-5 flex items-center justify-center rounded-full p-0">
                          {conversation.unread_count}
                        </Badge>
                      )}
                      
                      {conversation.ai_agent_id && (
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ConversationsList;
