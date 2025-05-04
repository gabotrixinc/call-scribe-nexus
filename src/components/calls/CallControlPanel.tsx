
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
import { useAudio } from '@/hooks/useAudio';
import { Badge } from '@/components/ui/badge';
import LiveTranscription from './LiveTranscription';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import AudioNotification from './AudioNotification';

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
  const { 
    enableMicrophone, 
    stopMicrophone, 
    isMicrophoneEnabled,
    isProcessing 
  } = useAudio();
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
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
          setIsRinging(false);
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

  // Start the duration timer
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

  // Start ringtone when component mounts
  useEffect(() => {
    if (isCallActive) {
      setIsRinging(true);
    }
    
    return () => {
      setIsRinging(false);
    };
  }, [isCallActive]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEndCall = async () => {
    setIsEnding(true);
    try {
      // First, terminate the call in Twilio via the API
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
      
      // Then update the state in the database
      await endCall.mutateAsync(callId);
      
      setIsCallActive(false);
      setIsRinging(false);
      
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

  const toggleMute = async () => {
    if (isMuted) {
      // Unmute - enable microphone
      const success = await enableMicrophone();
      if (success) {
        setIsMuted(false);
        toast({
          title: "Micrófono activado",
          description: "Ahora puedes ser escuchado",
        });
      }
    } else {
      // Mute - stop microphone
      stopMicrophone();
      setIsMuted(true);
      toast({
        title: "Micrófono desactivado",
        description: "Has silenciado el micrófono",
      });
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    setIsRinging(!isPaused);
    
    toast({
      title: isPaused ? "Llamada reanudada" : "Llamada en pausa",
      description: isPaused ? "La música de espera se ha detenido" : "Se ha activado la música de espera",
    });
  };

  const getCallStatusClass = () => {
    if (!isCallActive) return "border-red-500 dark:border-red-700";
    if (isPaused) return "border-amber-500 dark:border-amber-700";
    return "border-green-500 dark:border-green-700";
  };

  return (
    <>
      <AudioNotification 
        audioSrc="/audio/ringtone.mp3" 
        play={isRinging} 
        loop={true} 
      />
      
      <Card className={`shadow-md flex flex-col h-[400px] border-2 ${getCallStatusClass()}`}>
        <CardHeader className={`${isCallActive ? (isPaused ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20') : 'bg-red-50 dark:bg-red-900/20'} pb-2`}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <Phone className={`h-5 w-5 ${isCallActive ? 'animate-pulse' : ''} ${isCallActive ? (isPaused ? 'text-amber-700 dark:text-amber-500' : 'text-green-700 dark:text-green-500') : 'text-red-700 dark:text-red-500'}`} />
                <span>{isCallActive ? (isPaused ? 'Llamada en pausa' : 'Llamada en curso') : 'Llamada finalizada'}</span>
              </CardTitle>
              <CardDescription>
                {callerName ? `${callerName} - ${phoneNumber}` : phoneNumber}
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={`${isCallActive ? (isPaused ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300') : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}
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
                  disabled={!isCallActive || isProcessing}
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
                <p>Estado: <span className={`${isCallActive ? (isPaused ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400') : 'text-red-600 dark:text-red-400'} font-medium`}>
                  {isCallActive ? (isPaused ? 'Pausada' : 'Activa') : 'Finalizada'}
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
    </>
  );
};

export default CallControlPanel;
