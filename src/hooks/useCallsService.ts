
import { useActiveCalls } from './calls/useActiveCalls';
import { useCompletedCalls } from './calls/useCompletedCalls';
import { useCallMutations } from './calls/useCallMutations';
import { useCallMetrics } from './calls/useCallMetrics';
import { Call } from '@/types/calls';
import { TranscriptionItem } from '@/types/transcription';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ToastActionElement } from "@/components/ui/toast";
import { createElement } from 'react';
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
            // Play sound alert for incoming call immediately
            try {
              const audio = new Audio('/sounds/incoming-call.mp3');
              audio.volume = 1.0;
              audio.loop = true;
              
              // Store audio element in window to control it later
              (window as any).incomingCallAudio = audio;
              
              // Auto-stop after 30 seconds if not answered
              setTimeout(() => {
                if ((window as any).incomingCallAudio) {
                  (window as any).incomingCallAudio.pause();
                  (window as any).incomingCallAudio = null;
                }
              }, 30000);
              
              audio.play().catch(err => console.error("Error playing sound:", err));
            } catch (error) {
              console.error("Error playing sound:", error);
            }
            
            // Show persistent notification for incoming call
            toast({
              title: "Llamada entrante",
              description: `Número: ${newCall.caller_number || 'Desconocido'}`,
              variant: "destructive", // Use destructive for higher visibility
              // Use the Button component from shadcn/ui which is compatible with ToastActionElement
              action: createElement(Button, {
                asChild: true,
                variant: "default",
                className: "px-3",
                onClick: () => {
                  // Stop the ringtone when answering
                  if ((window as any).incomingCallAudio) {
                    (window as any).incomingCallAudio.pause();
                    (window as any).incomingCallAudio = null;
                  }
                },
                children: createElement('a', {
                  href: `/calls?callId=${newCall.id}`,
                  children: "Atender"
                })
              }) as ToastActionElement,
              duration: 30000, // Extended duration
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
