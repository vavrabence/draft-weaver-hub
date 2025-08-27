
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Draft {
  id: string;
  owner: string;
  title: string | null;
  caption: string | null;
  hashtags: string | null;
  media_type: 'image' | 'video';
  media_path: string;
  target_instagram: boolean;
  target_tiktok: boolean;
  desired_publish_at: string | null;
  status: 'draft' | 'editing' | 'caption_ready' | 'scheduled' | 'posted' | 'failed';
  created_at: string;
  updated_at: string;
  metadata: any;
}

export interface CreateDraftInput {
  media_path: string;
  media_type: 'image' | 'video';
  title?: string;
  caption?: string;
  hashtags?: string;
  target_instagram?: boolean;
  target_tiktok?: boolean;
  desired_publish_at?: string;
  status?: 'draft' | 'editing' | 'caption_ready' | 'scheduled' | 'posted' | 'failed';
  metadata?: any;
}

export const useDrafts = () => {
  const queryClient = useQueryClient();

  const { data: drafts = [], isLoading, error } = useQuery({
    queryKey: ['drafts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Draft[];
    }
  });

  const createDraftMutation = useMutation({
    mutationFn: async (draft: CreateDraftInput) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('drafts')
        .insert({
          ...draft,
          owner: user.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      toast.success('Draft created successfully!');
    },
    onError: (error) => {
      console.error('Error creating draft:', error);
      toast.error('Failed to create draft');
    }
  });

  const updateDraftMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Draft> & { id: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      toast.success('Draft updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating draft:', error);
      toast.error('Failed to update draft');
    }
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
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      toast.success('Draft deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
    }
  });

  return {
    drafts,
    isLoading,
    error,
    createDraft: createDraftMutation.mutateAsync,
    updateDraft: updateDraftMutation.mutateAsync,
    deleteDraft: deleteDraftMutation.mutateAsync
  };
};

export const useDraft = (id: string) => {
  return useQuery({
    queryKey: ['draft', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Draft;
    },
    enabled: !!id
  });
};
