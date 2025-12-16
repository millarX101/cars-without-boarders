import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database, MarketplaceListing, ListingImage } from '@/lib/types/database';

// Create a Supabase client for server-side
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ListingWithImages extends MarketplaceListing {
  listing_images: ListingImage[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query params
    const query = searchParams.get('query') || '';
    const state = searchParams.get('state') || '';
    const fuelType = searchParams.get('fuelType') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const minYear = searchParams.get('minYear') || '';
    const maxYear = searchParams.get('maxYear') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Build query
    let dbQuery = supabase
      .from('marketplace_listings')
      .select('*, listing_images(*)', { count: 'exact' })
      .eq('status', 'active');

    // Full text search
    if (query) {
      dbQuery = dbQuery.textSearch('search_vector', query, {
        type: 'websearch',
        config: 'english',
      });
    }

    // Filters
    if (state) {
      dbQuery = dbQuery.eq('seller_state', state);
    }
    if (fuelType) {
      dbQuery = dbQuery.eq('fuel_type', fuelType);
    }
    if (minPrice) {
      dbQuery = dbQuery.gte('price', parseFloat(minPrice));
    }
    if (maxPrice) {
      dbQuery = dbQuery.lte('price', parseFloat(maxPrice));
    }
    if (minYear) {
      dbQuery = dbQuery.gte('year', parseInt(minYear));
    }
    if (maxYear) {
      dbQuery = dbQuery.lte('year', parseInt(maxYear));
    }

    // Sorting
    const ascending = sortOrder === 'asc';
    dbQuery = dbQuery.order(sortBy as keyof Database['public']['Tables']['marketplace_listings']['Row'], { ascending });

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    dbQuery = dbQuery.range(from, to);

    const { data: listings, error, count } = await dbQuery;

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Transform data for response
    const transformedListings = ((listings || []) as ListingWithImages[]).map((listing) => ({
      id: listing.id,
      source: 'marketplace',
      make: listing.make,
      model: listing.model,
      variant: listing.variant,
      year: listing.year,
      price: listing.price,
      odometer: listing.odometer,
      transmission: listing.transmission,
      fuelType: listing.fuel_type,
      bodyType: listing.body_type,
      sellerState: listing.seller_state,
      sellerSuburb: listing.seller_suburb,
      sellerType: 'private',
      title: listing.title,
      images: listing.listing_images?.map((img) => img.url) || [],
      hasRwc: listing.has_rwc,
      hasRego: listing.has_rego,
      isNegotiable: listing.is_negotiable,
      createdAt: listing.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        listings: transformedListings,
        pagination: {
          total: count || 0,
          page,
          pageSize,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch listings',
      },
      { status: 500 }
    );
  }
}
