-- landedX - Initial Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES (extends Supabase Auth)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  postcode TEXT,
  state TEXT CHECK (state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT')),
  suburb TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- CAR LISTINGS (Scraped Data)
-- ============================================

CREATE TABLE IF NOT EXISTS public.car_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Source tracking
  source TEXT NOT NULL CHECK (source IN ('carsales', 'gumtree')),
  source_id TEXT NOT NULL,
  source_url TEXT NOT NULL,

  -- Vehicle details
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  year INTEGER NOT NULL,
  price DECIMAL(12, 2) NOT NULL,

  -- Vehicle specs
  odometer INTEGER,
  transmission TEXT CHECK (transmission IN ('automatic', 'manual', 'cvt', 'dct', 'other')),
  fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid', 'plug-in-hybrid', 'lpg', 'other')),
  body_type TEXT,
  drive_type TEXT,
  colour TEXT,
  engine_size DECIMAL(3, 1),
  cylinders INTEGER,

  -- Location
  seller_state TEXT NOT NULL CHECK (seller_state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT')),
  seller_postcode TEXT,
  seller_suburb TEXT,

  -- Seller info
  seller_type TEXT CHECK (seller_type IN ('dealer', 'private')),
  seller_name TEXT,

  -- Listing content
  title TEXT NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',

  -- Scrape tracking
  first_scraped_at TIMESTAMPTZ DEFAULT NOW(),
  last_scraped_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  scrape_count INTEGER DEFAULT 1,

  -- Full-text search
  search_vector TSVECTOR,

  -- Constraints
  UNIQUE(source, source_id)
);

-- Indexes for car_listings
CREATE INDEX IF NOT EXISTS idx_listings_search ON public.car_listings USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_listings_make_model ON public.car_listings(make, model);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.car_listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_year ON public.car_listings(year);
CREATE INDEX IF NOT EXISTS idx_listings_state ON public.car_listings(seller_state);
CREATE INDEX IF NOT EXISTS idx_listings_fuel ON public.car_listings(fuel_type);
CREATE INDEX IF NOT EXISTS idx_listings_active ON public.car_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_source ON public.car_listings(source);
CREATE INDEX IF NOT EXISTS idx_listings_last_scraped ON public.car_listings(last_scraped_at);

-- Update search vector trigger
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.make, '') || ' ' ||
    COALESCE(NEW.model, '') || ' ' ||
    COALESCE(NEW.variant, '') || ' ' ||
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.body_type, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_search_vector
  BEFORE INSERT OR UPDATE ON public.car_listings
  FOR EACH ROW EXECUTE FUNCTION update_listing_search_vector();

-- Public read access to listings
ALTER TABLE public.car_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active listings" ON public.car_listings
  FOR SELECT USING (is_active = true);

-- ============================================
-- SAVED SEARCHES
-- ============================================

CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  delivery_postcode TEXT NOT NULL,
  delivery_state TEXT NOT NULL CHECK (delivery_state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT')),
  email_alerts BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own searches" ON public.saved_searches
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON public.saved_searches(user_id);

-- ============================================
-- SAVED CARS (Favourites)
-- ============================================

CREATE TABLE IF NOT EXISTS public.saved_cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.car_listings(id) ON DELETE CASCADE,

  -- Snapshot of calculated costs at save time
  delivery_postcode TEXT NOT NULL,
  delivery_state TEXT NOT NULL CHECK (delivery_state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT')),
  calculated_costs JSONB NOT NULL,
  total_delivered_price DECIMAL(12, 2) NOT NULL,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, listing_id, delivery_postcode)
);

ALTER TABLE public.saved_cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved cars" ON public.saved_cars
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_cars_user ON public.saved_cars(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_cars_listing ON public.saved_cars(listing_id);

-- ============================================
-- TRANSPORT ROUTES
-- ============================================

CREATE TABLE IF NOT EXISTS public.transport_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_state TEXT NOT NULL CHECK (from_state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT')),
  to_state TEXT NOT NULL CHECK (to_state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT')),
  base_price DECIMAL(8, 2) NOT NULL,
  per_km_rate DECIMAL(6, 4) NOT NULL,
  estimated_days_min INTEGER NOT NULL,
  estimated_days_max INTEGER NOT NULL,
  notes TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(from_state, to_state)
);

-- Public read access to routes
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read transport routes" ON public.transport_routes
  FOR SELECT USING (true);

-- ============================================
-- AUSTRALIAN POSTCODES (Reference Data)
-- ============================================

CREATE TABLE IF NOT EXISTS public.postcodes (
  postcode TEXT PRIMARY KEY,
  suburb TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT')),
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6)
);

CREATE INDEX IF NOT EXISTS idx_postcodes_state ON public.postcodes(state);
CREATE INDEX IF NOT EXISTS idx_postcodes_suburb ON public.postcodes(suburb);

-- Public read access to postcodes
ALTER TABLE public.postcodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read postcodes" ON public.postcodes
  FOR SELECT USING (true);

-- ============================================
-- SCRAPER JOB TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS public.scrape_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('full', 'incremental', 'specific')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  search_query TEXT,
  listings_found INTEGER DEFAULT 0,
  listings_new INTEGER DEFAULT 0,
  listings_updated INTEGER DEFAULT 0,
  listings_removed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scrape_jobs_status ON public.scrape_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_created ON public.scrape_jobs(created_at);

-- ============================================
-- TRANSPORT LEADS (V2 Monetisation)
-- ============================================

CREATE TABLE IF NOT EXISTS public.transport_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES public.car_listings(id),

  -- Contact details
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Transport details
  pickup_state TEXT NOT NULL,
  pickup_postcode TEXT NOT NULL,
  delivery_state TEXT NOT NULL,
  delivery_postcode TEXT NOT NULL,

  -- Vehicle info snapshot
  vehicle_details JSONB NOT NULL,
  estimated_cost DECIMAL(10, 2) NOT NULL,

  -- Lead tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'booked', 'completed', 'cancelled')),
  partner_assigned TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.transport_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.transport_leads(created_at);
