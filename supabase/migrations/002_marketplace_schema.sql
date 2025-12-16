-- landedX Marketplace Schema
-- User-submitted car listings

-- ============================================
-- MARKETPLACE LISTINGS (User Submitted)
-- ============================================

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Owner
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Vehicle details
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  price DECIMAL(12, 2) NOT NULL CHECK (price > 0),

  -- Vehicle specs
  odometer INTEGER CHECK (odometer >= 0),
  transmission TEXT CHECK (transmission IN ('automatic', 'manual', 'cvt', 'dct', 'other')),
  fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid', 'plug-in-hybrid', 'lpg', 'other')),
  body_type TEXT CHECK (body_type IN ('sedan', 'hatchback', 'suv', 'wagon', 'ute', 'van', 'coupe', 'convertible', 'other')),
  drive_type TEXT CHECK (drive_type IN ('fwd', 'rwd', 'awd', '4wd', 'other')),
  colour TEXT,
  engine_size TEXT,
  cylinders INTEGER CHECK (cylinders > 0 AND cylinders <= 16),
  rego_expiry DATE,
  vin TEXT,

  -- Location
  seller_state TEXT NOT NULL CHECK (seller_state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT')),
  seller_postcode TEXT NOT NULL,
  seller_suburb TEXT,

  -- Contact info
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  show_phone BOOLEAN DEFAULT FALSE,

  -- Listing content
  title TEXT NOT NULL,
  description TEXT,

  -- Features/conditions
  features JSONB DEFAULT '[]',
  has_rwc BOOLEAN DEFAULT FALSE,
  has_rego BOOLEAN DEFAULT FALSE,
  is_negotiable BOOLEAN DEFAULT TRUE,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'sold', 'expired', 'removed')),
  views_count INTEGER DEFAULT 0,
  enquiries_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Full-text search
  search_vector TSVECTOR
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_user ON public.marketplace_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_state ON public.marketplace_listings(seller_state);
CREATE INDEX IF NOT EXISTS idx_marketplace_price ON public.marketplace_listings(price);
CREATE INDEX IF NOT EXISTS idx_marketplace_year ON public.marketplace_listings(year);
CREATE INDEX IF NOT EXISTS idx_marketplace_make ON public.marketplace_listings(make);
CREATE INDEX IF NOT EXISTS idx_marketplace_fuel ON public.marketplace_listings(fuel_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_search ON public.marketplace_listings USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_marketplace_created ON public.marketplace_listings(created_at DESC);

-- Update search vector trigger
CREATE OR REPLACE FUNCTION update_marketplace_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.make, '') || ' ' ||
    COALESCE(NEW.model, '') || ' ' ||
    COALESCE(NEW.variant, '') || ' ' ||
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.body_type, '') || ' ' ||
    COALESCE(NEW.colour, '')
  );
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_marketplace_search_vector
  BEFORE INSERT OR UPDATE ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION update_marketplace_search_vector();

-- Row Level Security
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can read active listings
CREATE POLICY "Anyone can read active marketplace listings" ON public.marketplace_listings
  FOR SELECT USING (status = 'active');

-- Users can read their own listings (any status)
CREATE POLICY "Users can read own listings" ON public.marketplace_listings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own listings
CREATE POLICY "Users can create listings" ON public.marketplace_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings" ON public.marketplace_listings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings" ON public.marketplace_listings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- LISTING IMAGES
-- ============================================

CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Storage
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,

  -- Metadata
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,

  -- Order
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_images_listing ON public.listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_images_user ON public.listing_images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_primary ON public.listing_images(listing_id, is_primary);

-- Row Level Security
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view images of active listings
CREATE POLICY "Anyone can view listing images" ON public.listing_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings
      WHERE id = listing_images.listing_id
      AND (status = 'active' OR user_id = auth.uid())
    )
  );

-- Users can insert images for their own listings
CREATE POLICY "Users can add images to own listings" ON public.listing_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own images
CREATE POLICY "Users can update own images" ON public.listing_images
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own images
CREATE POLICY "Users can delete own images" ON public.listing_images
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- LISTING ENQUIRIES
-- ============================================

CREATE TABLE IF NOT EXISTS public.listing_enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,

  -- Enquirer info (can be anonymous)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Message
  message TEXT NOT NULL,

  -- Delivery calculation
  delivery_state TEXT CHECK (delivery_state IN ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT')),
  delivery_postcode TEXT,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  replied_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_listing ON public.listing_enquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_user ON public.listing_enquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON public.listing_enquiries(created_at DESC);

-- Row Level Security
ALTER TABLE public.listing_enquiries ENABLE ROW LEVEL SECURITY;

-- Users can create enquiries
CREATE POLICY "Anyone can create enquiries" ON public.listing_enquiries
  FOR INSERT WITH CHECK (true);

-- Listing owners can read enquiries for their listings
CREATE POLICY "Owners can read listing enquiries" ON public.listing_enquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings
      WHERE id = listing_enquiries.listing_id
      AND user_id = auth.uid()
    )
  );

-- Users can read their own enquiries
CREATE POLICY "Users can read own enquiries" ON public.listing_enquiries
  FOR SELECT USING (auth.uid() = user_id);

-- Listing owners can update enquiry status
CREATE POLICY "Owners can update enquiry status" ON public.listing_enquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings
      WHERE id = listing_enquiries.listing_id
      AND user_id = auth.uid()
    )
  );

-- ============================================
-- INCREMENT VIEW COUNT FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION increment_listing_views(listing_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.marketplace_listings
  SET views_count = views_count + 1
  WHERE id = listing_uuid AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STORAGE BUCKET SETUP (Run in Supabase Dashboard)
-- ============================================
--
-- 1. Create a bucket called 'listing-images'
-- 2. Make it public for reading
-- 3. Set max file size to 5MB
-- 4. Allow only image mime types: image/jpeg, image/png, image/webp
--
-- Storage policies (add via Dashboard > Storage > Policies):
--
-- SELECT: Anyone can view images
--   (bucket_id = 'listing-images')
--
-- INSERT: Authenticated users can upload
--   (bucket_id = 'listing-images' AND auth.role() = 'authenticated')
--
-- DELETE: Users can delete their own images
--   (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1])
