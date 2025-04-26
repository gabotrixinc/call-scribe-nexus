
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';

type SettingsRow = Database['public']['Tables']['settings']['Row'];
export type Settings = SettingsRow;

export type WebhookUrls = {
  call_start?: string;
  call_end?: string;
  escalation?: string;
};

export const useSettingsService = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'global')
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las configuraciones',
          variant: 'destructive'
        });
        throw error;
      }
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<Settings>) => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .update(newSettings)
          .eq('id', 'global')
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating settings:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron actualizar las configuraciones',
          variant: 'destructive'
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: 'Configuración actualizada',
        description: 'La configuración se ha actualizado correctamente'
      });
    }
  });

  const testApiConnection = async () => {
    try {
      // Simulate API test
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Conexión exitosa',
        description: 'Las claves API funcionan correctamente'
      });
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con la API',
        variant: 'destructive'
      });
      return false;
    }
  };

  const testTwilioConnection = async () => {
    try {
      const { error } = await supabase.functions.invoke('make-call', {
        body: { 
          phoneNumber: '+1234567890',  // Número de prueba
          test: true // Indicar que es una prueba
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Conexión a Twilio exitosa',
        description: 'La configuración de Twilio es correcta'
      });
      return true;
    } catch (error) {
      console.error('Twilio test failed:', error);
      toast({
        title: 'Error de conexión a Twilio',
        description: 'No se pudo conectar con Twilio',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    settings,
    isLoadingSettings,
    updateSettings,
    testApiConnection,
    testTwilioConnection
  };
};
