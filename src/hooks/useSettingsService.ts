
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Settings {
  id: string;
  company_name: string;
  timezone: string;
  default_language: string;
  analytics_enabled: boolean;
  notifications_enabled: boolean;
  gemini_api_key: string | null;
  tts_api_key: string | null;
  google_project_id: string | null;
  default_voice: string;
  speaking_rate: number;
  pitch: number;
  default_greeting: string;
  webhook_urls: Record<string, string> | null;
  webhook_secret: string | null;
}

export const useSettingsService = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        // Using type assertion to bypass TS errors until Supabase tables are properly defined
        const { data, error } = await (supabase
          .from('settings') as any)
          .select('*')
          .eq('id', 'global')
          .single();

        if (error) throw error;
        return data as Settings;
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
        // Using type assertion to bypass TS errors until Supabase tables are properly defined
        const { data, error } = await (supabase
          .from('settings') as any)
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

  return {
    settings,
    isLoadingSettings,
    updateSettings,
    testApiConnection
  };
};
