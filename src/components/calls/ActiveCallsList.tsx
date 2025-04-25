
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhoneCall, MessageSquare, User, Play, SkipForward, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCallsService, Call } from '@/hooks/useCallsService';

const ActiveCallsList: React.FC = () => {
  const { activeCalls, isLoadingActiveCalls, endCall, abandonCall } = useCallsService();
  const { toast } = useToast();
  const [listeningTo, setListeningTo] = useState<string | null>(null);
  
  const handleListenIn = (callId: string) => {
    setListeningTo(callId);
    toast({
      title: "Monitoreo de llamada",
      description: `Escuchando la llamada ${callId}`,
    });
    
    // Simulamos un tiempo de escucha
    setTimeout(() => {
      setListeningTo(null);
    }, 5000);
  };
  
  const handleTakeOver = async (callId: string) => {
    toast({
      title: "Transferencia de llamada",
      description: `Tomando control de la llamada ${callId}`,
    });
    
    // Simular finalización de la llamada actual para transferir
    try {
      await endCall.mutateAsync(callId);
    } catch (error) {
      console.error("Error al transferir la llamada:", error);
    }
  };
  
  const getStatusColor = (status: Call["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "queued":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };
  
  const getSentimentColor = (sentiment?: number | null) => {
    if (sentiment === null || sentiment === undefined) return "bg-gray-500";
    if (sentiment >= 0.6) return "bg-green-500";
    if (sentiment <= 0.4) return "bg-red-500";
    return "bg-blue-500";
  };
  
  const getSentimentText = (sentiment?: number | null) => {
    if (sentiment === null || sentiment === undefined) return "--";
    if (sentiment >= 0.6) return "Positivo";
    if (sentiment <= 0.4) return "Negativo";
    return "Neutral";
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diffSeconds = Math.floor((now - start) / 1000);
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-primary" />
            <span>Llamadas Activas</span>
          </div>
        </CardTitle>
        <Badge variant="outline" className="ml-auto">
          {isLoadingActiveCalls ? "Cargando..." : `${activeCalls?.length || 0} activas`}
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoadingActiveCalls ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando llamadas...</span>
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Estado</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Llamante</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Inicio</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Duración</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Agente</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Sentimiento</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {activeCalls && activeCalls.length > 0 ? (
                  activeCalls.map((call) => (
                    <tr key={call.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(call.status)}`}></div>
                          <span className="capitalize">
                            {call.status === "active" ? "Activa" : 
                            call.status === "queued" ? "En espera" : call.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle font-medium">{call.caller_name || call.caller_number}</td>
                      <td className="p-4 align-middle">
                        {new Date(call.start_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 align-middle">{formatDuration(call.start_time)}</td>
                      <td className="p-4 align-middle">
                        <Badge variant={call.ai_agent_id ? "secondary" : "default"}>
                          {call.ai_agent_id ? "IA" : "Humano"}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        {call.sentiment_score !== null ? (
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${getSentimentColor(call.sentiment_score)}`}></div>
                            <span className="capitalize">{getSentimentText(call.sentiment_score)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleListenIn(call.id)}
                            disabled={listeningTo === call.id}
                          >
                            {listeningTo === call.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Escuchando...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Escuchar
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => handleTakeOver(call.id)}
                          >
                            <SkipForward className="h-4 w-4 mr-1" />
                            Intervenir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No hay llamadas activas en este momento
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveCallsList;
