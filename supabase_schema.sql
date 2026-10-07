-- ========================================================
-- HOWFAST SUPABASE DATABASE & REALTIME SETUP SCRIPT
-- Paste this into your Supabase Dashboard -> SQL Editor -> Run
-- ========================================================

-- 1. Create scores table for the Global Leaderboard
CREATE TABLE IF NOT EXISTS public.scores (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username TEXT NOT NULL,
  wpm INTEGER NOT NULL,
  raw_wpm INTEGER NOT NULL,
  accuracy FLOAT NOT NULL,
  mode TEXT NOT NULL,
  duration_seconds FLOAT NOT NULL,
  device_type TEXT DEFAULT 'mobile',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create messages table for Community Chat
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username TEXT NOT NULL,
  text TEXT NOT NULL,
  wpm INTEGER DEFAULT 0,
  badge TEXT DEFAULT 'Texter',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) with Public Read & Insert
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read scores" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Public insert scores" ON public.scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete scores" ON public.scores FOR DELETE USING (true);

CREATE POLICY "Public read messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Public insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete messages" ON public.messages FOR DELETE USING (true);

-- 4. Enable Supabase Realtime (WebSockets) for instant multi-user sync!
ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 5. Seed initial friendly welcome messages and scores
INSERT INTO public.messages (username, text, wpm, badge)
VALUES 
  ('⚡ TurboThumb', 'Welcome to Howfast! Anyone broken 80+ WPM on mobile yet?', 92, 'Alien Thumbs'),
  ('🎵 LyricLover', 'The musical lyrics mode is so addictive!', 74, 'Speed Demon'),
  ('🐢 SteadyTyper', 'Practicing my mobile accuracy every day.', 45, 'Rabbit');

INSERT INTO public.scores (username, wpm, raw_wpm, accuracy, mode, duration_seconds, device_type)
VALUES
  ('⚡ TurboThumb', 92, 96, 98.4, '30s', 30.0, 'iPhone 15'),
  ('🔥 NeonFingers', 84, 88, 97.2, '30s', 30.0, 'Pixel 8'),
  ('🛸 CyberTypist', 79, 82, 99.0, 'story', 28.5, 'Galaxy S24');
