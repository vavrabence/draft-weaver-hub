
-- Create events table for observability
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  kind TEXT NOT NULL, -- 'style.built','caption.request','caption.ready','edit.request','edit.ready','schedule.created','posted'
  ref_id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Users can view their own events" 
  ON public.events 
  FOR SELECT 
  USING (auth.uid() = owner);

CREATE POLICY "Users can insert their own events" 
  ON public.events 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_events_owner_created ON public.events(owner, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_kind ON public.events(kind);
