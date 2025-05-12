
import { useActiveCalls } from './calls/useActiveCalls';
import { useCompletedCalls } from './calls/useCompletedCalls';
import { useCallMutations } from './calls/useCallMutations';
import { useCallMetrics } from './calls/useCallMetrics';
import { Call } from '@/types/calls';
import { TranscriptionItem } from '@/types/transcription';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export type { Call, CallStatus } from '@/types/calls';

export const useCallsService = () => {
  const { data: activeCalls, isLoading: isLoadingActiveCalls } = useActiveCalls();
  const { data: completedCalls, isLoading: isLoadingCompletedCalls } = useCompletedCalls();
  const { data: callMetrics, isLoading: isLoadingCallMetrics } = useCallMetrics();
  const { startCall, endCall, abandonCall } = useCallMutations();
  const { toast } = useToast();

  // Setup listener for incoming calls - enhanced to work across all pages
  useEffect(() => {
    // Subscribe to new calls
    const channel = supabase
      .channel('incoming-calls')
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'calls',
          filter: "status=eq.active" 
        },
        (payload) => {
          const newCall = payload.new as Call;
          
          // Show notification for incoming call
          if (newCall && newCall.status === 'active') {
            // Check for audio compatibility
            const playIncomingCallSound = () => {
              try {
                const audio = new Audio();
                audio.src = '/sounds/incoming-call.mp3';
                audio.volume = 1.0;
                audio.loop = true;
                
                // Store audio element in window to control it later
                (window as any).incomingCallAudio = audio;
                
                audio.play().catch(err => {
                  console.error("Error playing incoming call sound:", err);
                  // Try alternate sound file
                  audio.src = '/audio/ringtone.mp3';
                  audio.play().catch(secondErr => {
                    console.error("Error playing alternate sound:", secondErr);
                  });
                });
                
                // Auto-stop after 30 seconds if not answered
                setTimeout(() => {
                  if ((window as any).incomingCallAudio) {
                    (window as any).incomingCallAudio.pause();
                    (window as any).incomingCallAudio = null;
                  }
                }, 30000);
              } catch (error) {
                console.error("Error setting up audio:", error);
              }
            };
            
            playIncomingCallSound();
            
            // Show visible, persistent notification for incoming call
            toast({
              title: "Llamada entrante",
              description: `Número: ${newCall.caller_number || 'Desconocido'}`,
              variant: "destructive", // Use destructive for higher visibility
              action: (
                <Button
                  asChild
                  variant="default"
                  className="px-3"
                  onClick={() => {
                    // Stop the ringtone when answering
                    if ((window as any).incomingCallAudio) {
                      (window as any).incomingCallAudio.pause();
                      (window as any).incomingCallAudio = null;
                    }
                  }}
                >
                  <a href={`/calls?callId=${newCall.id}`}>Atender</a>
                </Button>
              ),
              duration: 30000, // Extended duration for incoming call notification
            });
          }
        }
      )
      .subscribe();

    return () => {
      // Clean up on unmount
      if ((window as any).incomingCallAudio) {
        (window as any).incomingCallAudio.pause();
        (window as any).incomingCallAudio = null;
      }
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return {
    activeCalls,
    isLoadingActiveCalls,
    completedCalls,
    isLoadingCompletedCalls,
    callMetrics: callMetrics || [],
    isLoadingCallMetrics,
    startCall,
    endCall,
    abandonCall
  };
};
