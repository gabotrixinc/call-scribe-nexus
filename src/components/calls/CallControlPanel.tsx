
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
  MessageSquare,
  PhoneOff
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
  const [audioOutput, setAudioOutput] = useState<HTMLAudioElement | null>(null);

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

  // Inicializar reproducción de audio saliente
  useEffect(() => {
    const audio = new Audio('/audio/ringtone.mp3');
    audio.loop = true;
    setAudioOutput(audio);
    
    // Reproducir tono de llamada cuando se inicia la llamada
    if (isCallActive) {
      audio.play().catch(err => console.error("Error reproduciendo audio:", err));
    }
    
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // Detener el tono cuando la llamada no está activa
  useEffect(() => {
    if (!isCallActive && audioOutput) {
      audioOutput.pause();
      audioOutput.currentTime = 0;
    }
  }, [isCallActive, audioOutput]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEndCall = async () => {
    setIsEnding(true);
    try {
      // Primero, terminar la llamada en Twilio a través de la API
      const { data: callData, error: callError } = await supabase
        .from('calls')
        .select('twilio_call_sid')
        .eq('id', callId)
        .single();
        
      if (!callError && callData?.twilio_call_sid) {
        await supabase.functions.invoke('make-call', {
          body: {
            action: 'end-call',
            callSid: callData.twilio_call_sid
          }
        });
      }
      
      // Luego actualizar el estado en la base de datos
      await endCall.mutateAsync(callId);
      
      setIsCallActive(false);
      
      // Detener reproducción de audio
      if (audioOutput) {
        audioOutput.pause();
        audioOutput.currentTime = 0;
      }
      
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
    
    // Si tenemos un audio en reproducción, alternar el silencio
    if (audioOutput) {
      audioOutput.muted = !isMuted;
    }
    
    toast({
      title: isMuted ? "Micrófono activado" : "Micrófono desactivado",
      description: isMuted ? "Ahora puedes ser escuchado" : "Has silenciado el micrófono",
    });
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    
    // Alternar pausa/reproducción del audio
    if (audioOutput) {
      if (!isPaused) {
        audioOutput.pause();
      } else {
        audioOutput.play().catch(err => console.error("Error reproduciendo audio:", err));
      }
    }
    
    toast({
      title: isPaused ? "Llamada reanudada" : "Llamada en pausa",
      description: isPaused ? "La música de espera se ha detenido" : "Se ha activado la música de espera",
    });
  };

  return (
    <Card className={`border-${isCallActive ? 'green' : 'red'}-500 shadow-md flex flex-col h-[400px] border-2 ${isCallActive ? 'border-green-500 dark:border-green-700' : 'border-red-500 dark:border-red-700'}`}>
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
                className={isMuted ? "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400" : ""}
                onClick={toggleMute}
                disabled={!isCallActive}
              >
                {isMuted ? <MicOff /> : <Volume2 />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className={isPaused ? "bg-amber-100 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400" : ""}
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
                <PhoneOff />
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>ID de llamada: {callId.substring(0, 8)}...</p>
              <p>Inicio: {new Date(startTime).toLocaleTimeString()}</p>
              <p>Estado: <span className={`text-${isCallActive ? 'green' : 'red'}-600 dark:text-${isCallActive ? 'green' : 'red'}-400 font-medium`}>
                {isCallActive ? 'Activa' : 'Finalizada'}
              </span></p>
              {isCallActive && (
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-900/50">
                  <p className="text-amber-700 dark:text-amber-400">
                    Recuerde: Para finalizar la llamada correctamente debe usar el botón "Finalizar llamada"
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center pt-0">
            <Button 
              variant="destructive"
              className="w-full"
              onClick={handleEndCall}
              disabled={isEnding || !isCallActive}
            >
              {isCallActive ? (isEnding ? 'Finalizando...' : 'Finalizar llamada') : 'Llamada finalizada'}
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
