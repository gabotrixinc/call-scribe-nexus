
import { useActiveCalls } from './calls/useActiveCalls';
import { useCompletedCalls } from './calls/useCompletedCalls';
import { useCallMutations } from './calls/useCallMutations';
import { useCallMetrics } from './calls/useCallMetrics';
import { Call } from '@/types/calls';
import { TranscriptionItem } from '@/types/transcription';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export type { Call, CallStatus } from '@/types/calls';

export const useCallsService = () => {
  const { data: activeCalls, isLoading: isLoadingActiveCalls } = useActiveCalls();
  const { data: completedCalls, isLoading: isLoadingCompletedCalls } = useCompletedCalls();
  const { data: callMetrics, isLoading: isLoadingCallMetrics } = useCallMetrics();
  const { startCall, endCall, abandonCall } = useCallMutations();
  const { toast } = useToast();

  // Setup listener for incoming calls
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
            toast({
              title: "Llamada entrante",
              description: `Número: ${newCall.caller_number || 'Desconocido'}`,
              variant: "default",
              // Use a function that returns JSX instead of direct JSX
              action: function ToastAction() {
                return {
                  // Using createElement to avoid JSX in .ts file
                  type: 'a',
                  props: {
                    href: `/calls?callId=${newCall.id}`,
                    className: "bg-primary text-primary-foreground hover:bg-primary/90 h-8 rounded-md px-3 inline-flex items-center justify-center",
                    children: "Atender"
                  }
                };
              },
              duration: 10000,
            });
            
            // Play sound alert for incoming call
            try {
              const audio = new Audio('/sounds/incoming-call.mp3');
              audio.play();
            } catch (error) {
              console.error("Error playing sound:", error);
            }
          }
        }
      )
      .subscribe();

    return () => {
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
