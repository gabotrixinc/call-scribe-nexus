
import { useActiveCalls } from './calls/useActiveCalls';
import { useCompletedCalls } from './calls/useCompletedCalls';
import { useCallMutations } from './calls/useCallMutations';
import { useCallMetrics } from './calls/useCallMetrics';
import { Call } from '@/types/calls';

export type { Call, CallStatus } from '@/types/calls';

export const useCallsService = () => {
  const { data: activeCalls, isLoading: isLoadingActiveCalls } = useActiveCalls();
  const { data: completedCalls, isLoading: isLoadingCompletedCalls } = useCompletedCalls();
  const { data: callMetrics, isLoading: isLoadingCallMetrics } = useCallMetrics();
  const { startCall, endCall, abandonCall } = useCallMutations();

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
