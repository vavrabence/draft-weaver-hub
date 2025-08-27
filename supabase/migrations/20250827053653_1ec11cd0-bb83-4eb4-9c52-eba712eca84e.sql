
-- Add style_profile column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS style_profile JSONB DEFAULT NULL;

-- Add render_path to drafts metadata for video editing workflow
-- (metadata column already exists as JSONB, so we'll use that)

-- Update scheduled_posts table to ensure it has all needed columns
-- (the table already exists with the right structure)

-- Add indexes for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_drafts_status ON public.drafts(status);
CREATE INDEX IF NOT EXISTS idx_drafts_owner_status ON public.drafts(owner, status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON public.scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_for ON public.scheduled_posts(scheduled_for);

-- Add a function to help with ownership validation
CREATE OR REPLACE FUNCTION public.get_draft_owner(draft_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT owner FROM public.drafts WHERE id = draft_id);
END;
$$;

-- Add a function to help with scheduled post ownership validation
CREATE OR REPLACE FUNCTION public.get_scheduled_post_owner(scheduled_post_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT d.owner 
    FROM public.scheduled_posts sp
    JOIN public.drafts d ON sp.draft_id = d.id
    WHERE sp.id = scheduled_post_id
  );
END;
$$;
