
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Call } from '@/types/calls';

export const useCompletedCalls = () => {
  return useQuery({
    queryKey: ['calls', 'completed'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('calls')
          .select('*')
          .eq('status', 'completed')
          .order('end_time', { ascending: false })
          .limit(50);

        if (error) throw error;
        return data as Call[];
      } catch (error) {
        console.error('Error fetching completed calls:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las llamadas completadas',
          variant: 'destructive'
        });
        return [];
      }
    }
  });
};
