
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Search, 
  ChevronRight,
  Calendar,
  CalendarIcon,
  Loader2
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import ConversationDetail from '@/components/conversations/ConversationDetail';

interface Conversation {
  id: string;
  caller_number: string;
  caller_name: string | null;
  date: string;
  time: string;
  duration: string | number;
  agent: string;
  agentType: "ai" | "human";
  sentiment: "positive" | "negative" | "neutral" | null;
  summary: string;
}

const ConversationsPage: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      // Simulamos la obtención de datos de conversaciones
      const { data: callsData, error } = await supabase
        .from('calls')
        .select(`
          id,
          caller_number,
          caller_name,
          start_time,
          end_time,
          duration,
          sentiment_score,
          ai_agent_id,
          human_agent_id
        `)
        .eq('status', 'completed')
        .order('start_time', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      // Convertimos los datos a formato de conversación
      return callsData.map(call => {
        const startTime = new Date(call.start_time);
        return {
          id: call.id,
          caller_number: call.caller_number,
          caller_name: call.caller_name || 'Desconocido',
          date: startTime.toISOString().split('T')[0],
          time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: call.duration ? `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}` : '--',
          agent: call.ai_agent_id ? 'AI Asistente' : 'Agente Humano',
          agentType: call.ai_agent_id ? 'ai' : 'human',
          sentiment: getSentimentFromScore(call.sentiment_score),
          summary: "El cliente realizó consultas sobre su cuenta y los servicios disponibles. Se le proporcionó información y opciones."
        };
      }) as Conversation[];
    }
  });
  
  const handleViewConversation = (id: string) => {
    setSelectedConversation(id);
  };
  
  const getSentimentFromScore = (score: number | null): "positive" | "negative" | "neutral" | null => {
    if (score === null) return null;
    if (score >= 0.6) return "positive";
    if (score <= 0.4) return "negative";
    return "neutral";
  };
  
  const getSentimentColor = (sentiment?: Conversation["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500";
      case "negative":
        return "bg-red-500";
      case "neutral":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conversaciones</h1>
          <p className="text-muted-foreground">Revisa conversaciones pasadas y analiza el rendimiento.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar conversaciones..."
              className="pl-8 w-full"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Tipo de Agente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ai">IA</SelectItem>
                <SelectItem value="human">Humanos</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Sentimiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="positive">Positivo</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negativo</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full md:w-auto pl-3 text-left font-normal"
                >
                  {date ? format(date, "dd/MM/yyyy") : "Seleccionar fecha"}
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="flagged">Marcadas</TabsTrigger>
            <TabsTrigger value="unresolved">Sin resolver</TabsTrigger>
            <TabsTrigger value="insights">Estadísticas</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>Conversaciones Recientes</span>
                </CardTitle>
                <CardDescription>Registros de llamadas para revisión y análisis</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Cargando conversaciones...</span>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b transition-colors hover:bg-muted/50">
                          <th className="h-12 px-4 text-left align-middle font-medium">Fecha/Hora</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Llamante</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Duración</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Agente</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Sentimiento</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Resumen</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conversations && conversations.map((conv) => (
                          <tr key={conv.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">
                              <div className="flex flex-col">
                                <span>{conv.date}</span>
                                <span className="text-muted-foreground text-xs">{conv.time}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle font-medium">{conv.caller_name || conv.caller_number}</td>
                            <td className="p-4 align-middle">{conv.duration}</td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <Badge variant={conv.agentType === "ai" ? "secondary" : "default"}>
                                  {conv.agentType === "ai" ? "IA" : "Humano"}
                                </Badge>
                                <span>{conv.agent}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              {conv.sentiment ? (
                                <div className="flex items-center gap-2">
                                  <div className={`h-2 w-2 rounded-full ${getSentimentColor(conv.sentiment)}`}></div>
                                  <span className="capitalize">
                                    {conv.sentiment === "positive" ? "Positivo" : 
                                     conv.sentiment === "negative" ? "Negativo" : "Neutral"}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">--</span>
                              )}
                            </td>
                            <td className="p-4 align-middle max-w-xs">
                              <p className="truncate text-muted-foreground">{conv.summary}</p>
                            </td>
                            <td className="p-4 align-middle">
                              <Button size="sm" variant="ghost" onClick={() => handleViewConversation(conv.id)}>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {(!conversations || conversations.length === 0) && (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-muted-foreground">
                              No se encontraron conversaciones
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="flagged" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversaciones marcadas</CardTitle>
                <CardDescription>Conversaciones que requieren atención especial</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No se encontraron conversaciones marcadas.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="unresolved" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Problemas sin resolver</CardTitle>
                <CardDescription>Conversaciones que necesitan seguimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No se encontraron problemas sin resolver.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="insights" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de conversaciones</CardTitle>
                <CardDescription>Análisis y patrones de tus conversaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">La función de estadísticas está actualmente en desarrollo.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {selectedConversation && (
        <ConversationDetail
          open={!!selectedConversation}
          onClose={() => setSelectedConversation(null)}
          conversationId={selectedConversation}
        />
      )}
    </Layout>
  );
};

export default ConversationsPage;
