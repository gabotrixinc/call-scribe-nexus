
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { CallMetrics } from '@/types/calls';

export const useCallMetrics = () => {
  return useQuery({
    queryKey: ['calls', 'metrics'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('call_metrics')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50);

        if (error) throw error;
        return data as CallMetrics[];
      } catch (error) {
        console.error('Error fetching call metrics:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las métricas de llamadas',
          variant: 'destructive'
        });
        return [];
      }
    }
  });
};
