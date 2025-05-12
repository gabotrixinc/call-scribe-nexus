
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type SettingsRow = Database['public']['Tables']['settings']['Row'];
export type Settings = SettingsRow;

export type WebhookUrls = {
  call_start?: string;
  call_end?: string;
  escalation?: string;
  zapier?: string;
  make?: string;
  [key: string]: string | undefined;
};

export const useSettingsService = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const testWebhook = async (url: string, eventType: string = 'test') => {
    try {
      if (!url) {
        throw new Error('URL de webhook no especificada');
      }
      
      console.log(`Testing webhook: ${url} with event type: ${eventType}`);
      
      // Test payload with more comprehensive data
      const testPayload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        test: true,
        data: {
          id: 'test-id-' + Math.random().toString(36).substring(2, 9),
          type: eventType,
          description: 'Esto es una prueba de webhook',
          caller: {
            name: 'Cliente de Prueba',
            phone: '+1234567890',
            email: 'test@example.com'
          },
          call: {
            duration: 120,
            status: 'completed',
            sentiment: 'positive'
          },
          agent: {
            id: 'agent-test-id',
            name: 'Agente Virtual'
          },
          contact: {
            id: 'contact-test-id',
            name: 'Cliente de Prueba',
            company: 'Empresa de Prueba'
          }
        }
      };
      
      // Send webhook test to Supabase Edge Function to avoid CORS issues
      const { data, error } = await supabase.functions.invoke('send-webhook-test', {
        body: {
          url,
          payload: testPayload
        }
      });
      
      if (error) {
        console.error('Error testing webhook via edge function:', error);
        throw error;
      }

      console.log('Webhook test response:', data);
      
      toast({
        title: 'Webhook probado',
        description: 'Se ha enviado un evento de prueba al webhook'
      });
      
      return true;
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast({
        title: 'Error',
        description: 'No se pudo probar el webhook: ' + (error instanceof Error ? error.message : 'Error desconocido'),
        variant: 'destructive'
      });
      return false;
    }
  };

  const testApiConnection = async () => {
    try {
      // Test the actual API connection
      const { data, error } = await supabase.functions.invoke('test-api-connection', {
        body: { 
          service: 'twilio',
          settings: settings
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Conexión exitosa',
        description: 'Las claves API funcionan correctamente'
      });
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con la API. Verifique las credenciales.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const testTwilioConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('make-call', {
        body: { 
          phoneNumber: '+1234567890',  // Número de prueba
          test: true // Indicar que es una prueba
        }
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        toast({
          title: 'Conexión a Twilio exitosa',
          description: 'La configuración de Twilio es correcta'
        });
        return true;
      } else {
        throw new Error(data?.error || 'Error desconocido en la conexión a Twilio');
      }
    } catch (error) {
      console.error('Twilio test failed:', error);
      toast({
        title: 'Error de conexión a Twilio',
        description: 'No se pudo conectar con Twilio: ' + (error instanceof Error ? error.message : 'Error desconocido'),
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
    testTwilioConnection,
    testWebhook
  };
};
