
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Event {
  id: string;
  owner: string;
  kind: string;
  ref_id?: string;
  payload?: any;
  created_at: string;
}

export const useEvents = (limit: number = 10) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['events', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('owner', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user,
  });
};
