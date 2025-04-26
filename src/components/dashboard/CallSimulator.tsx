
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Mic, Phone } from 'lucide-react';
import { useCallsService } from '@/hooks/useCallsService';
import { useAgentsService } from '@/hooks/useAgentsService';
import { useSettingsService } from '@/hooks/useSettingsService';

const CallSimulator: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<{ role: 'user' | 'ai'; message: string }[]>([]);
  const { toast } = useToast();

  const { startCall } = useCallsService();
  const { agents } = useAgentsService();
  const { settings } = useSettingsService();

  const handleStartCall = async () => {
    if (isCallActive) {
      setIsCallActive(false);
      setConversation([]);
      toast({
        title: "Llamada Finalizada",
        description: "La llamada ha sido terminada",
      });
      return;
    }
    
    try {
      const availableAgent = agents?.find(a => a.type === 'ai' && a.status === 'available');
      
      if (!availableAgent) {
        toast({
          title: "Error",
          description: "No hay agentes AI disponibles en este momento",
          variant: "destructive"
        });
        return;
      }

      await startCall.mutateAsync({
        caller_number: "+1234567890", // En producción, esto vendría del sistema telefónico
        caller_name: "Demo User",
        ai_agent_id: availableAgent.id,
        start_time: new Date().toISOString(),
      });

      setIsCallActive(true);
      setConversation([
        { 
          role: 'ai', 
          message: settings?.default_greeting || "Hola, gracias por llamar. ¿Cómo puedo ayudarte hoy?" 
        }
      ]);
      
      toast({
        title: "Llamada Iniciada",
        description: "Agente AI listo para asistir",
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la llamada",
        variant: "destructive"
      });
    }
  };

  const handleRecordVoice = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      toast({
        title: "Recording Started",
        description: "Please speak now...",
      });
      
      // Simulate recording completion after 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        toast({
          title: "Recording Complete",
          description: "Processing your audio...",
        });
        
        // Simulate speech-to-text processing
        setTimeout(() => {
          const demoText = "I'm having trouble with my account login.";
          setUserInput(demoText);
          
          toast({
            title: "Audio Processed",
            description: "Your speech has been transcribed",
          });
        }, 1500);
      }, 3000);
    } else {
      toast({
        title: "Recording Stopped",
        description: "Audio recording cancelled",
      });
    }
  };

  const handleSendMessage = () => {
    if (!userInput.trim() || !isCallActive) return;
    
    // Add user message to conversation
    setConversation([...conversation, { role: 'user', message: userInput }]);
    
    // Clear input
    setUserInput('');
    
    // Simulate AI response
    setTimeout(() => {
      let response = "I understand you're having trouble logging in. Let me help you with that. Can you tell me what happens when you try to log in?";
      
      if (userInput.toLowerCase().includes("password")) {
        response = "I can help you reset your password. Would you like me to send a password reset link to your email address?";
      } else if (userInput.toLowerCase().includes("thank")) {
        response = "You're welcome! Is there anything else I can help you with today?";
      }
      
      setConversation(prev => [...prev, { role: 'ai', message: response }]);
    }, 1500);
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <span>Call Simulator</span>
          </div>
        </CardTitle>
        <Button 
          variant={isCallActive ? "destructive" : "default"} 
          size="sm" 
          onClick={handleStartCall}
        >
          {isCallActive ? "End Call" : "Start Demo Call"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md h-[300px] mb-4 p-4 overflow-y-auto bg-muted/30 flex flex-col gap-3">
          {conversation.length === 0 ? (
            <div className="text-center text-muted-foreground h-full flex items-center justify-center">
              {isCallActive ? "Waiting for conversation..." : "Start a call to begin simulation"}
            </div>
          ) : (
            conversation.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`rounded-lg p-3 max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <div className="text-xs font-bold mb-1">
                    {msg.role === 'user' ? 'You' : 'AI Agent'}
                  </div>
                  <div>{msg.message}</div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {isCallActive && (
          <div className="flex gap-2">
            <div className="flex-1">
              <Textarea 
                placeholder="Type your message or click the microphone to speak..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="min-h-[60px]"
                disabled={!isCallActive}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className={`h-[60px] ${isRecording ? 'bg-red-100 text-red-500 animate-pulse' : ''}`}
              onClick={handleRecordVoice}
              disabled={!isCallActive}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button 
              className="h-[60px]" 
              onClick={handleSendMessage}
              disabled={!userInput.trim() || !isCallActive}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CallSimulator;
