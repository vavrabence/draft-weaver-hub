
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface Draft {
  id: string;
  title: string;
  caption?: string;
  hashtags?: string;
  media_path: string;
  media_type: 'image' | 'video';
  target_instagram?: boolean;
  target_tiktok?: boolean;
  status: 'draft' | 'editing' | 'caption_ready' | 'scheduled' | 'posted' | 'failed';
  desired_publish_at?: string;
  owner: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface CreateDraftInput {
  title: string;
  media_path: string;
  media_type: 'image' | 'video';
  caption?: string;
  hashtags?: string;
  target_instagram?: boolean;
  target_tiktok?: boolean;
  desired_publish_at?: string;
  status?: 'draft' | 'editing' | 'caption_ready' | 'scheduled' | 'posted' | 'failed';
  metadata?: any;
}

export const useDraft = (id: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['draft', id, user?.id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .eq('id', id)
        .eq('owner', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Draft | null;
    },
    enabled: !!user && !!id,
  });
};

export const useDrafts = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: drafts, isLoading } = useQuery({
    queryKey: ['drafts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .eq('owner', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Draft[];
    },
    enabled: !!user,
  });

  const createDraftMutation = useMutation({
    mutationFn: async (input: CreateDraftInput) => {
      if (!user) throw new Error('User not authenticated');

      const draftData = {
        ...input,
        owner: user.id,
        status: input.status || 'draft' as const,
      };

      const { data, error } = await supabase
        .from('drafts')
        .insert(draftData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts', user?.id] });
      toast.success('Draft created successfully!');
    },
    onError: (error) => {
      console.error('Error creating draft:', error);
      toast.error('Failed to create draft');
    },
  });

  const updateDraftMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Draft> }) => {
      const { data, error } = await supabase
        .from('drafts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts', user?.id] });
      toast.success('Draft updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating draft:', error);
      toast.error('Failed to update draft');
    },
  });

  const deleteDraftMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('drafts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts', user?.id] });
      toast.success('Draft deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
    },
  });

  return {
    drafts,
    isLoading,
    createDraft: createDraftMutation.mutateAsync,
    updateDraft: updateDraftMutation.mutateAsync,
    deleteDraft: deleteDraftMutation.mutateAsync,
  };
};
