
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { 
  Phone, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Pause,
  Play, 
  CircleStop,
  MessageSquare
} from 'lucide-react';
import { useCallsService } from '@/hooks/useCallsService';
import { Badge } from '@/components/ui/badge';
import LiveTranscription from './LiveTranscription';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface CallControlPanelProps {
  callId: string;
  phoneNumber: string;
  callerName?: string | null;
  startTime: string;
}

const CallControlPanel: React.FC<CallControlPanelProps> = ({
  callId,
  phoneNumber,
  callerName,
  startTime
}) => {
  const { endCall } = useCallsService();
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("controls");
  const [isCallActive, setIsCallActive] = useState(true);
  const { toast } = useToast();

  // Set up interval to check if call is still active
  useEffect(() => {
    const checkCallStatus = async () => {
      if (!callId || callId === 'test-call-id') return;
      
      try {
        const { data, error } = await supabase
          .from('calls')
          .select('status')
          .eq('id', callId)
          .single();
        
        if (error) {
          console.error('Error checking call status:', error);
          return;
        }
        
        if (data.status !== 'active') {
          setIsCallActive(false);
          clearInterval(timer);
        }
      } catch (error) {
        console.error('Error checking call status:', error);
      }
    };
    
    const timer = setInterval(() => {
      checkCallStatus();
    }, 5000);
    
    return () => clearInterval(timer);
  }, [callId]);

  useEffect(() => {
    let timer: number;
    
    if (isCallActive) {
      const start = new Date(startTime).getTime();
      timer = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = Math.floor((now - start) / 1000);
        setDuration(elapsed);
      }, 1000) as unknown as number;
    }

    return () => clearInterval(timer);
  }, [startTime, isCallActive]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEndCall = async () => {
    setIsEnding(true);
    try {
      await endCall.mutateAsync(callId);
      setIsCallActive(false);
      toast({
        title: "Llamada finalizada",
        description: "La llamada se ha terminado correctamente",
      });
    } catch (error) {
      console.error('Error al finalizar la llamada:', error);
      toast({
        title: "Error",
        description: "No se pudo finalizar la llamada",
        variant: "destructive"
      });
    } finally {
      setIsEnding(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Emitir comando para silenciar la llamada mediante API de Twilio
    toast({
      title: isMuted ? "Micrófono activado" : "Micrófono desactivado",
      description: isMuted ? "Ahora puedes ser escuchado" : "Has silenciado el micrófono",
    });
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    // Emitir comando para pausar la llamada mediante API de Twilio
    toast({
      title: isPaused ? "Llamada reanudada" : "Llamada en pausa",
      description: isPaused ? "La música de espera se ha detenido" : "Se ha activado la música de espera",
    });
  };

  return (
    <Card className={`border-${isCallActive ? 'green' : 'red'}-500 shadow-md flex flex-col h-[400px]`}>
      <CardHeader className={`bg-${isCallActive ? 'green' : 'red'}-50 dark:bg-${isCallActive ? 'green' : 'red'}-900/20 pb-2`}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`flex items-center gap-2 text-${isCallActive ? 'green' : 'red'}-700 dark:text-${isCallActive ? 'green' : 'red'}-500`}>
              <Phone className={`h-5 w-5 ${isCallActive ? 'animate-pulse' : ''} text-${isCallActive ? 'green' : 'red'}-700 dark:text-${isCallActive ? 'green' : 'red'}-500`} />
              <span>{isCallActive ? 'Llamada en curso' : 'Llamada finalizada'}</span>
            </CardTitle>
            <CardDescription>
              {callerName ? `${callerName} - ${phoneNumber}` : phoneNumber}
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={`bg-${isCallActive ? 'green' : 'red'}-100 text-${isCallActive ? 'green' : 'red'}-800 dark:bg-${isCallActive ? 'green' : 'red'}-900 dark:text-${isCallActive ? 'green' : 'red'}-300`}
          >
            {formatTime(duration)}
          </Badge>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="mx-4">
          <TabsTrigger value="controls">Controles</TabsTrigger>
          <TabsTrigger value="transcript">
            Transcripción
            <Badge variant="secondary" className="ml-2 bg-primary/10 hover:bg-primary/20">
              Live
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="controls" className="flex-grow flex flex-col m-0 p-0">
          <CardContent className="py-4 flex-grow">
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="icon"
                className={isMuted ? "bg-red-100 text-red-500" : ""}
                onClick={toggleMute}
                disabled={!isCallActive}
              >
                {isMuted ? <MicOff /> : <Volume2 />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className={isPaused ? "bg-amber-100 text-amber-500" : ""}
                onClick={togglePause}
                disabled={!isCallActive}
              >
                {isPaused ? <Play /> : <Pause />}
              </Button>
              
              <Button
                variant="destructive"
                size="icon"
                onClick={handleEndCall}
                disabled={isEnding || !isCallActive}
              >
                <CircleStop />
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>ID de llamada: {callId.substring(0, 8)}...</p>
              <p>Inicio: {new Date(startTime).toLocaleTimeString()}</p>
              <p>Estado: <span className={`text-${isCallActive ? 'green' : 'red'}-600 dark:text-${isCallActive ? 'green' : 'red'}-400`}>
                {isCallActive ? 'Activa' : 'Finalizada'}
              </span></p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center pt-0">
            <Button 
              variant="destructive"
              className="w-full"
              onClick={handleEndCall}
              disabled={isEnding || !isCallActive}
            >
              {isCallActive ? 'Finalizar llamada' : 'Llamada finalizada'}
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="transcript" className="flex-grow m-0 p-0">
          <LiveTranscription callId={callId} isActive={activeTab === "transcript" && isCallActive} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CallControlPanel;
