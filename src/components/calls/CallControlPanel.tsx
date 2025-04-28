
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

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const elapsed = Math.floor((now - start) / 1000);
      setDuration(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEndCall = async () => {
    setIsEnding(true);
    try {
      await endCall.mutateAsync(callId);
    } catch (error) {
      console.error('Error al finalizar la llamada:', error);
    } finally {
      setIsEnding(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Aquí se implementaría la lógica real de silenciar la llamada
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    // Aquí se implementaría la lógica real de pausar la llamada
  };

  return (
    <Card className="border-green-500 shadow-md flex flex-col h-[400px]">
      <CardHeader className="bg-green-50 dark:bg-green-900/20 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-500">
              <Phone className="h-5 w-5 animate-pulse text-green-700 dark:text-green-500" />
              <span>Llamada en curso</span>
            </CardTitle>
            <CardDescription>
              {callerName ? `${callerName} - ${phoneNumber}` : phoneNumber}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
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
              >
                {isMuted ? <MicOff /> : <Volume2 />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className={isPaused ? "bg-amber-100 text-amber-500" : ""}
                onClick={togglePause}
              >
                {isPaused ? <Play /> : <Pause />}
              </Button>
              
              <Button
                variant="destructive"
                size="icon"
                onClick={handleEndCall}
                disabled={isEnding}
              >
                <CircleStop />
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>ID de llamada: {callId.substring(0, 8)}...</p>
              <p>Inicio: {new Date(startTime).toLocaleTimeString()}</p>
              <p>Estado: <span className="text-green-600 dark:text-green-400">Activa</span></p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center pt-0">
            <Button 
              variant="destructive"
              className="w-full"
              onClick={handleEndCall}
              disabled={isEnding}
            >
              Finalizar llamada
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="transcript" className="flex-grow m-0 p-0">
          <LiveTranscription callId={callId} isActive={activeTab === "transcript"} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CallControlPanel;
