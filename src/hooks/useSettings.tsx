
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Settings {
  owner: string;
  low_content_alert: boolean;
  low_content_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface Integrations {
  owner: string;
  instagram_connected: boolean;
  tiktok_connected: boolean;
  openai_configured: boolean;
  video_edit_provider: string | null;
  created_at: string;
  updated_at: string;
}

export const useSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;
      return data as Settings;
    }
  });

  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .single();

      if (error) throw error;
      return data as Integrations;
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      const { data, error } = await supabase
        .from('settings')
        .update(updates)
        .eq('owner', settings?.owner)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  });

  return {
    settings,
    integrations,
    isLoading: settingsLoading || integrationsLoading,
    updateSettings: updateSettingsMutation.mutateAsync
  };
};
