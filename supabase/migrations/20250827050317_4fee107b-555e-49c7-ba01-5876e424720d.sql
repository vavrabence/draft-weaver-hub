
-- Create profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create drafts table
CREATE TABLE IF NOT EXISTS public.drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_path TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  title TEXT,
  caption TEXT,
  hashtags TEXT,
  target_instagram BOOLEAN DEFAULT TRUE,
  target_tiktok BOOLEAN DEFAULT FALSE,
  desired_publish_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'editing', 'caption_ready', 'scheduled', 'posted', 'failed')),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scheduled_posts table
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES public.drafts(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  external_post_id TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posting', 'posted', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
  owner UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  low_content_alert BOOLEAN DEFAULT TRUE,
  low_content_threshold INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create integrations table
CREATE TABLE IF NOT EXISTS public.integrations (
  owner UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_connected BOOLEAN DEFAULT FALSE,
  tiktok_connected BOOLEAN DEFAULT FALSE,
  openai_configured BOOLEAN DEFAULT FALSE,
  video_edit_provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for drafts
CREATE POLICY "Users can view their own drafts"
  ON public.drafts FOR SELECT
  USING (auth.uid() = owner);

CREATE POLICY "Users can insert their own drafts"
  ON public.drafts FOR INSERT
  WITH CHECK (auth.uid() = owner);

CREATE POLICY "Users can update their own drafts"
  ON public.drafts FOR UPDATE
  USING (auth.uid() = owner);

CREATE POLICY "Users can delete their own drafts"
  ON public.drafts FOR DELETE
  USING (auth.uid() = owner);

-- Create RLS policies for scheduled_posts
CREATE POLICY "Users can view their own scheduled posts"
  ON public.scheduled_posts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.drafts 
    WHERE drafts.id = scheduled_posts.draft_id 
    AND drafts.owner = auth.uid()
  ));

CREATE POLICY "Users can insert their own scheduled posts"
  ON public.scheduled_posts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.drafts 
    WHERE drafts.id = scheduled_posts.draft_id 
    AND drafts.owner = auth.uid()
  ));

CREATE POLICY "Users can update their own scheduled posts"
  ON public.scheduled_posts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.drafts 
    WHERE drafts.id = scheduled_posts.draft_id 
    AND drafts.owner = auth.uid()
  ));

CREATE POLICY "Users can delete their own scheduled posts"
  ON public.scheduled_posts FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.drafts 
    WHERE drafts.id = scheduled_posts.draft_id 
    AND drafts.owner = auth.uid()
  ));

-- Create RLS policies for settings
CREATE POLICY "Users can view their own settings"
  ON public.settings FOR SELECT
  USING (auth.uid() = owner);

CREATE POLICY "Users can insert their own settings"
  ON public.settings FOR INSERT
  WITH CHECK (auth.uid() = owner);

CREATE POLICY "Users can update their own settings"
  ON public.settings FOR UPDATE
  USING (auth.uid() = owner);

-- Create RLS policies for integrations
CREATE POLICY "Users can view their own integrations"
  ON public.integrations FOR SELECT
  USING (auth.uid() = owner);

CREATE POLICY "Users can insert their own integrations"
  ON public.integrations FOR INSERT
  WITH CHECK (auth.uid() = owner);

CREATE POLICY "Users can update their own integrations"
  ON public.integrations FOR UPDATE
  USING (auth.uid() = owner);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('raw_media', 'raw_media', false),
  ('renders', 'renders', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for raw_media bucket
CREATE POLICY "Users can upload their own media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'raw_media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'raw_media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'raw_media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'raw_media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policies for renders bucket
CREATE POLICY "Users can upload their own renders"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'renders' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own renders"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'renders' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own renders"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'renders' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own renders"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'renders' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  
  INSERT INTO public.settings (owner)
  VALUES (NEW.id);
  
  INSERT INTO public.integrations (owner)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at timestamps
CREATE TRIGGER handle_updated_at_drafts
  BEFORE UPDATE ON public.drafts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_settings
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_integrations
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
