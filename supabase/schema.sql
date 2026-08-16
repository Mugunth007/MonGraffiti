-- SQL Schema & Permissions Fix for MON GRAFFITI
-- Copy and paste this directly into your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- 1. DROP EXISTING TABLES (Clean Reset)
DROP TABLE IF EXISTS public.graffiti_likes CASCADE;
DROP TABLE IF EXISTS public.graffitis CASCADE;

-- 2. CREATE GRAFFITIS TABLE
CREATE TABLE IF NOT EXISTS public.graffitis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT,
  user_name TEXT NOT NULL,
  title TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image_url TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  remix_parent_id UUID REFERENCES public.graffitis(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE GRAFFITI_LIKES TABLE
CREATE TABLE IF NOT EXISTS public.graffiti_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  graffiti_id UUID REFERENCES public.graffitis(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(graffiti_id, user_id)
);

-- 4. GRANT PERMISSIONS TO ANON & AUTHENTICATED ROLES (Fixes 42501 permission denied)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- 5. ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC POLICIES
ALTER TABLE public.graffitis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graffiti_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on graffitis"
  ON public.graffitis FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on graffitis"
  ON public.graffitis FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on graffitis"
  ON public.graffitis FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read on graffiti_likes"
  ON public.graffiti_likes FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on graffiti_likes"
  ON public.graffiti_likes FOR INSERT
  WITH CHECK (true);

-- 6. ENABLE SUPABASE REALTIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.graffitis;
