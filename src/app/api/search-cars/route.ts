import { NextRequest, NextResponse } from 'next/server';
import { calculateTotalDeliveredCost } from '@/lib/calculators/total-cost';
import { unifiedSearch } from '@/lib/scrapers/unified';
import type { AustralianState, FuelType } from '@/lib/types/car';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 second timeout for scraping

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const query = searchParams.get('query') || '';
    const deliveryState = (searchParams.get('deliveryState') || 'NSW') as AustralianState;
    const deliveryPostcode = searchParams.get('deliveryPostcode') || '2000';
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
    const minYear = searchParams.get('minYear') ? parseInt(searchParams.get('minYear')!) : undefined;
    const maxYear = searchParams.get('maxYear') ? parseInt(searchParams.get('maxYear')!) : undefined;
    const fuelType = searchParams.get('fuelType') as FuelType | undefined;
    const transmission = searchParams.get('transmission') as 'automatic' | 'manual' | undefined;
    const sellerState = searchParams.get('sellerState') as AustralianState | undefined;
    const sortBy = searchParams.get('sortBy') || 'totalPrice';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Use unified search to get listings from multiple sources
    const searchResult = await unifiedSearch({
      query,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      fuelType,
      transmission,
      sellerState,
      page: 1, // Get all results first, then paginate after cost calculation
      limit: 100, // Get more results for better filtering
      sources: ['dealers', 'carsguide', 'autotrader', 'mock'],
    });

    // Calculate costs for each listing
    const listingsWithCosts = searchResult.listings.map(listing => {
      const result = calculateTotalDeliveredCost({
        vehiclePrice: listing.price,
        sellerState: listing.sellerState,
        deliveryState,
        deliveryPostcode,
        fuelType: listing.fuelType,
      });

      return {
        ...listing,
        costs: {
          vehiclePrice: listing.price,
          transport: result.breakdown.transport.cost,
          stampDuty: result.breakdown.stampDuty.amount,
          registration: result.breakdown.registration.amount,
          roadworthy: result.breakdown.roadworthy.cost,
          totalDelivered: result.totalDelivered,
        },
      };
    });

    // Sort
    listingsWithCosts.sort((a, b) => {
      let aValue: number, bValue: number;

      switch (sortBy) {
        case 'totalPrice':
          aValue = a.costs.totalDelivered;
          bValue = b.costs.totalDelivered;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        case 'odometer':
          aValue = a.odometer || 0;
          bValue = b.odometer || 0;
          break;
        default:
          aValue = a.costs.totalDelivered;
          bValue = b.costs.totalDelivered;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // Pagination
    const totalResults = listingsWithCosts.length;
    const totalPages = Math.ceil(totalResults / limit);
    const startIndex = (page - 1) * limit;
    const paginatedResults = listingsWithCosts.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: {
        listings: paginatedResults,
        pagination: {
          page,
          pageSize: limit,
          total: totalResults,
          totalPages,
        },
        sources: searchResult.sources,
        aggregations: {
          priceRange: {
            min: Math.min(...listingsWithCosts.map(l => l.price)),
            max: Math.max(...listingsWithCosts.map(l => l.price)),
          },
          yearRange: {
            min: Math.min(...listingsWithCosts.map(l => l.year)),
            max: Math.max(...listingsWithCosts.map(l => l.year)),
          },
          stateCount: listingsWithCosts.reduce((acc, l) => {
            acc[l.sellerState] = (acc[l.sellerState] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        },
      },
      filters: {
        query,
        deliveryState,
        deliveryPostcode,
        minPrice,
        maxPrice,
        minYear,
        maxYear,
        fuelType,
        transmission,
        sellerState,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search cars',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
