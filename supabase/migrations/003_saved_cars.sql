-- Saved Cars table
-- Allows users to save marketplace listings they're interested in

CREATE TABLE IF NOT EXISTS public.saved_cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  delivery_state TEXT NOT NULL CHECK (delivery_state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT')),
  total_delivered DECIMAL(10, 2), -- Cached total delivered cost at time of save
  notes TEXT, -- User's personal notes
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, listing_id)
);

-- Enable RLS
ALTER TABLE public.saved_cars ENABLE ROW LEVEL SECURITY;

-- Users can only see their own saved cars
CREATE POLICY "Users can view own saved cars" ON public.saved_cars
  FOR SELECT USING (auth.uid() = user_id);

-- Users can save cars
CREATE POLICY "Users can save cars" ON public.saved_cars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their saved cars
CREATE POLICY "Users can delete own saved cars" ON public.saved_cars
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_cars_user_id ON public.saved_cars(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_cars_listing_id ON public.saved_cars(listing_id);

-- ============================================
-- SAVED SEARCHES (for email alerts)
-- ============================================

CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL, -- Search criteria (make, model, price range, etc.)
  delivery_state TEXT NOT NULL CHECK (delivery_state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT')),
  delivery_postcode TEXT,
  email_alerts BOOLEAN DEFAULT false,
  last_results_count INTEGER DEFAULT 0,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- Users can only see their own saved searches
CREATE POLICY "Users can view own saved searches" ON public.saved_searches
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create saved searches
CREATE POLICY "Users can create saved searches" ON public.saved_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their saved searches
CREATE POLICY "Users can update own saved searches" ON public.saved_searches
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their saved searches
CREATE POLICY "Users can delete own saved searches" ON public.saved_searches
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);
