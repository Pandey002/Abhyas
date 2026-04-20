-- Abhyas (Flashcard Engine) Supabase Schema

-- 1. Decks Table
CREATE TABLE IF NOT EXISTS public.decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  card_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 2. Flashcards Table
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  type TEXT DEFAULT 'concept',
  tags TEXT[],
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review_date DATE DEFAULT CURRENT_DATE,
  last_review_date DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 3. Row Level Security (RLS)
-- For initial testing, we enable RLS but allow all actions. 
-- You should refine these policies when adding Auth.

ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on decks" ON public.decks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on decks" ON public.decks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on decks" ON public.decks FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on flashcards" ON public.flashcards FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on flashcards" ON public.flashcards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on flashcards" ON public.flashcards FOR UPDATE USING (true);
