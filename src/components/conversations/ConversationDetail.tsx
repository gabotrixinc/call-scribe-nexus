
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, UserCircle2, Bot, Copy, Flag, Share2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ConversationDetailProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
}

interface Message {
  id: string;
  sender: 'agent' | 'customer';
  text: string;
  timestamp: string;
}

const ConversationDetail: React.FC<ConversationDetailProps> = ({ open, onClose, conversationId }) => {
  const [activeTab, setActiveTab] = useState("transcript");
  const { toast } = useToast();
  
  const { data: conversation, isLoading } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      try {
        const { data: call, error } = await supabase
          .from('calls')
          .select('*')
          .eq('id', conversationId)
          .single();
        
        if (error) throw error;
        
        return {
          ...call,
          messages: generateMockMessages() // En una implementación real, obtendrías los mensajes de la API
        };
      } catch (error) {
        console.error('Error fetching conversation:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la conversación',
          variant: 'destructive'
        });
        return null;
      }
    },
    enabled: open && !!conversationId
  });
  
  const handleCopyTranscript = () => {
    if (conversation?.transcript) {
      navigator.clipboard.writeText(conversation.transcript);
      toast({
        title: "Copiado",
        description: "La transcripción ha sido copiada al portapapeles"
      });
    } else {
      toast({
        title: "Error",
        description: "No hay transcripción disponible para copiar",
        variant: "destructive"
      });
    }
  };
  
  const handleFlagConversation = () => {
    toast({
      title: "Conversación marcada",
      description: "Esta conversación ha sido marcada para revisión"
    });
  };
  
  const handleShareConversation = () => {
    toast({
      title: "Compartir",
      description: "Funcionalidad de compartir no implementada"
    });
  };
  
  const handleDownloadRecording = () => {
    if (conversation?.recording_url) {
      window.open(conversation.recording_url, '_blank');
    } else {
      toast({
        title: "Error",
        description: "No hay grabación disponible para descargar",
        variant: "destructive"
      });
    }
  };
  
  // Función para generar mensajes de ejemplo
  const generateMockMessages = (): Message[] => {
    return [
      {
        id: '1',
        sender: 'agent',
        text: 'Hola, soy el asistente virtual de atención al cliente. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date(Date.now() - 500000).toISOString()
      },
      {
        id: '2',
        sender: 'customer',
        text: 'Hola, tengo una consulta sobre mi factura del mes pasado',
        timestamp: new Date(Date.now() - 490000).toISOString()
      },
      {
        id: '3',
        sender: 'agent',
        text: 'Por supuesto, estaré encantado de ayudarle con su consulta sobre la factura. ¿Podría proporcionarme su número de cliente o el número de factura para poder verificar la información?',
        timestamp: new Date(Date.now() - 480000).toISOString()
      },
      {
        id: '4',
        sender: 'customer',
        text: 'Mi número de cliente es ABC12345',
        timestamp: new Date(Date.now() - 470000).toISOString()
      },
      {
        id: '5',
        sender: 'agent',
        text: 'Gracias por proporcionarme su número de cliente. Estoy verificando su factura del mes pasado. ¿Podría especificar cuál es su consulta en particular sobre esta factura?',
        timestamp: new Date(Date.now() - 460000).toISOString()
      },
      {
        id: '6',
        sender: 'customer',
        text: 'Creo que me han cobrado un servicio que no he utilizado',
        timestamp: new Date(Date.now() - 450000).toISOString()
      }
    ];
  };
  
  if (isLoading) {
    return null; // O un indicador de carga
  }
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col h-full">
        <DialogHeader className="border-b pb-2">
          <DialogTitle className="text-lg">
            Detalles de la conversación
          </DialogTitle>
        </DialogHeader>
        
        {conversation && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b">
              <div>
                <p className="text-sm font-medium">Llamante</p>
                <p className="text-sm text-muted-foreground">{conversation.caller_name || conversation.caller_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Fecha y Hora</p>
                <p className="text-sm text-muted-foreground">{new Date(conversation.start_time).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Duración</p>
                <p className="text-sm text-muted-foreground">
                  {conversation.duration ? `${Math.floor(conversation.duration / 60)}:${(conversation.duration % 60).toString().padStart(2, '0')}` : '--'}
                </p>
              </div>
            </div>
            
            <Tabs defaultValue="transcript" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="transcript">Transcripción</TabsTrigger>
                <TabsTrigger value="summary">Resumen</TabsTrigger>
                <TabsTrigger value="analytics">Análisis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transcript" className="flex-1 flex flex-col data-[state=active]:flex-1">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {conversation.messages?.map((message: Message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.sender === 'agent' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === 'agent' 
                              ? 'bg-muted text-muted-foreground' 
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {message.sender === 'agent' ? (
                              <Bot className="h-4 w-4" />
                            ) : (
                              <UserCircle2 className="h-4 w-4" />
                            )}
                            <span className="text-xs font-medium">
                              {message.sender === 'agent' ? 'Agente' : 'Cliente'}
                            </span>
                            <span className="text-xs">
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="summary" className="flex-1 data-[state=active]:flex-1">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Resumen de la conversación</h4>
                    <p className="text-sm text-muted-foreground">
                      El cliente consultó sobre un cargo incorrecto en su factura del mes pasado. 
                      Se verificó su cuenta y se identificó un cargo por un servicio no utilizado. 
                      Se acordó procesar un reembolso que se verá reflejado en la próxima factura.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Temas principales</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">Facturación</Badge>
                      <Badge variant="outline">Reembolsos</Badge>
                      <Badge variant="outline">Servicios no utilizados</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Acciones tomadas</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      <li>Verificación de cuenta de cliente</li>
                      <li>Identificación de cargo incorrecto</li>
                      <li>Procesamiento de reembolso</li>
                      <li>Actualización de preferencias de facturación</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="flex-1 data-[state=active]:flex-1">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-accent/50 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-1">Sentimiento</p>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <p className="text-xl font-bold">Positivo</p>
                      </div>
                    </div>
                    
                    <div className="bg-accent/50 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-1">Satisfacción</p>
                      <p className="text-xl font-bold">92%</p>
                    </div>
                    
                    <div className="bg-accent/50 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-1">Tiempo de respuesta</p>
                      <p className="text-xl font-bold">1.2s</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Emociones detectadas</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Confusión</span>
                        <div className="w-2/3 bg-muted rounded-full h-2 ml-4">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Frustración</span>
                        <div className="w-2/3 bg-muted rounded-full h-2 ml-4">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Satisfacción</span>
                        <div className="w-2/3 bg-muted rounded-full h-2 ml-4">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Intención del cliente</h4>
                    <p className="text-sm text-muted-foreground">
                      Resolución de problema de facturación
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="border-t pt-4 mt-4">
              <div className="flex justify-between w-full">
                <div>
                  <Button variant="outline" size="sm" onClick={handleFlagConversation}>
                    <Flag className="h-4 w-4 mr-1" />
                    Marcar
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyTranscript}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={handleShareConversation}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Compartir
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={handleDownloadRecording}>
                    <Download className="h-4 w-4 mr-1" />
                    Descargar
                  </Button>
                  
                  <DialogClose asChild>
                    <Button variant="default" size="sm" onClick={onClose}>
                      Cerrar
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConversationDetail;
