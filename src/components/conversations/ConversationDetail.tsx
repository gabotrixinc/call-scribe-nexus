
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Phone, User, MessageSquare, Download, ExternalLink } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Call } from '@/hooks/useCallsService';

interface Message {
  id: number;
  role: 'agent' | 'customer';
  content: string;
  timestamp: string;
}

interface ConversationDetailProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
}

const ConversationDetail: React.FC<ConversationDetailProps> = ({
  open,
  onClose,
  conversationId
}) => {
  const [conversation, setConversation] = useState<Call | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConversationData = async () => {
      try {
        setLoading(true);
        
        // Fetch call data
        const { data: callData, error: callError } = await supabase
          .from('calls')
          .select('*')
          .eq('id', conversationId)
          .single();

        if (callError) throw callError;
        setConversation(callData as Call);
        
        // Simulate fetching messages for this conversation
        // In a real app, you would get these from the database
        setTimeout(() => {
          const fakeMessages: Message[] = [
            {
              id: 1,
              role: 'agent',
              content: 'Hola, gracias por comunicarse con nuestro centro de atención. ¿En qué puedo ayudarle hoy?',
              timestamp: '2023-04-25T10:23:12Z'
            },
            {
              id: 2,
              role: 'customer',
              content: 'Hola, necesito información sobre mi última factura. No entiendo algunos cargos.',
              timestamp: '2023-04-25T10:23:45Z'
            },
            {
              id: 3,
              role: 'agent',
              content: 'Con gusto le ayudo. ¿Podría proporcionarme su número de cliente o la dirección de correo electrónico asociada con su cuenta?',
              timestamp: '2023-04-25T10:24:10Z'
            },
            {
              id: 4,
              role: 'customer',
              content: 'Mi número de cliente es AC-45789.',
              timestamp: '2023-04-25T10:24:30Z'
            },
            {
              id: 5,
              role: 'agent',
              content: 'Gracias. Estoy revisando su factura del mes de abril. Veo que hay un cargo de $29.99 por servicio premium y otro de $15 por cargo administrativo. ¿Estos son los cargos que no comprende?',
              timestamp: '2023-04-25T10:25:15Z'
            },
            {
              id: 6,
              role: 'customer',
              content: 'Sí, exactamente. ¿Qué es ese cargo administrativo? Nunca lo había visto antes.',
              timestamp: '2023-04-25T10:25:45Z'
            },
            {
              id: 7,
              role: 'agent',
              content: 'El cargo administrativo es nuevo y se implementó este mes debido a cambios en nuestra estructura de costos. Fue comunicado en el boletín de marzo. Sin embargo, como muestra de buena voluntad, puedo aplicar un crédito en su próxima factura por ese monto. ¿Le gustaría que lo hiciera?',
              timestamp: '2023-04-25T10:26:30Z'
            },
            {
              id: 8,
              role: 'customer',
              content: 'Sí, me parecería justo. No recibí ningún boletín sobre ese cambio.',
              timestamp: '2023-04-25T10:27:00Z'
            }
          ];
          setMessages(fakeMessages);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching conversation data:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar los datos de la conversación',
          variant: 'destructive'
        });
        onClose();
      }
    };
    
    if (open && conversationId) {
      fetchConversationData();
    }
  }, [open, conversationId, toast, onClose]);

  const getSentimentColor = (score: number | null) => {
    if (!score) return "bg-gray-500";
    if (score >= 0.6) return "bg-green-500";
    if (score <= 0.4) return "bg-red-500";
    return "bg-blue-500";
  };
  
  const getSentimentText = (score: number | null) => {
    if (!score) return "Sin datos";
    if (score >= 0.6) return "Positivo";
    if (score <= 0.4) return "Negativo";
    return "Neutral";
  };
  
  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalles de la conversación</DialogTitle>
          <DialogDescription>
            {conversation ? `${conversation.caller_name || conversation.caller_number} - ${new Date(conversation.start_time).toLocaleString()}` : 'Cargando...'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          <Tabs defaultValue="conversation" className="flex-1 flex flex-col">
            <TabsList>
              <TabsTrigger value="conversation">Conversación</TabsTrigger>
              <TabsTrigger value="analytics">Análisis</TabsTrigger>
              <TabsTrigger value="summary">Resumen</TabsTrigger>
            </TabsList>
            
            <TabsContent value="conversation" className="flex-1 flex flex-col overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <p>Cargando conversación...</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.role === 'agent' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div 
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.role === 'agent' 
                                ? 'bg-secondary/20 rounded-tl-none' 
                                : 'bg-primary text-primary-foreground rounded-tr-none'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <Avatar className="h-6 w-6">
                                {message.role === 'agent' 
                                  ? <User className="h-4 w-4" /> 
                                  : <Phone className="h-4 w-4" />
                                }
                              </Avatar>
                              <span className="text-xs font-medium">
                                {message.role === 'agent' ? 'Agente' : 'Cliente'}
                              </span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="p-4 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-accent p-4 rounded-lg">
                    <p className="text-sm font-medium">Duración</p>
                    <p className="text-2xl font-bold">{conversation?.duration ? `${Math.floor(conversation.duration / 60)}:${(conversation.duration % 60).toString().padStart(2, '0')}` : '--'}</p>
                  </div>
                  <div className="bg-accent p-4 rounded-lg">
                    <p className="text-sm font-medium">Sentimiento</p>
                    <div className="flex items-center mt-1">
                      <div className={`w-3 h-3 rounded-full mr-2 ${getSentimentColor(conversation?.sentiment_score || null)}`}></div>
                      <p className="text-lg font-bold">{getSentimentText(conversation?.sentiment_score || null)}</p>
                    </div>
                  </div>
                  <div className="bg-accent p-4 rounded-lg">
                    <p className="text-sm font-medium">Palabras por minuto</p>
                    <p className="text-2xl font-bold">142</p>
                  </div>
                  <div className="bg-accent p-4 rounded-lg">
                    <p className="text-sm font-medium">Tiempo de respuesta</p>
                    <p className="text-2xl font-bold">1.2s</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Intención detectada</h3>
                  <Badge variant="outline" className="text-sm py-1">
                    {conversation?.intent || 'No detectada'}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Palabras clave</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">factura</Badge>
                    <Badge variant="secondary">cargo administrativo</Badge>
                    <Badge variant="secondary">crédito</Badge>
                    <Badge variant="secondary">boletín</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="summary">
              <div className="p-4 space-y-6">
                <div className="bg-accent p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Resumen de la conversación</h3>
                  <p className="text-sm">
                    El cliente llamó para preguntar sobre cargos en su factura de abril, específicamente un cargo administrativo de $15 que no había visto antes. Se le explicó que este cargo es nuevo y se implementó este mes, y que fue comunicado en el boletín de marzo. Como el cliente mencionó no haber recibido el boletín, se le ofreció un crédito de $15 en su próxima factura, lo cual aceptó.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Acciones realizadas</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Verificación de la cuenta del cliente</li>
                    <li>Revisión de la factura de abril</li>
                    <li>Explicación del cargo administrativo</li>
                    <li>Aplicación de un crédito de $15 para la próxima factura</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Seguimiento requerido</h3>
                  <p className="text-sm">Enviar confirmación por correo electrónico del crédito aplicado.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="p-4 border-t flex justify-between">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                <span>Descargar</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <ExternalLink className="h-4 w-4" />
                <span>Exportar</span>
              </Button>
            </div>
            <Button variant="default" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationDetail;
