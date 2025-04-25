
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'global')
        .single();

      if (error) throw error;
      return data as Settings;
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<Settings>) => {
      const { data, error } = await supabase
        .from('settings')
        .update(newSettings)
        .eq('id', 'global')
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });

  return {
    settings,
    isLoadingSettings,
    updateSettings
  };
};
