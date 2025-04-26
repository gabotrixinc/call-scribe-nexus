
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Call } from '@/types/calls';

export const useActiveCalls = () => {
  return useQuery({
    queryKey: ['calls', 'active'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('calls')
          .select('*')
          .eq('status', 'active');

        if (error) throw error;
        return data as Call[];
      } catch (error) {
        console.error('Error fetching active calls:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las llamadas activas',
          variant: 'destructive'
        });
        return [];
      }
    }
  });
};
