import { NextRequest, NextResponse } from 'next/server';
import { calculateTotalDeliveredCost } from '@/lib/calculators/total-cost';
import type { AustralianState, FuelType } from '@/lib/types/car';

// Mock car listings for development
const MOCK_LISTINGS = [
  {
    id: '1',
    source: 'carsales',
    sourceId: 'SSE-AD-12345',
    sourceUrl: 'https://www.carsales.com.au/cars/details/1',
    make: 'Mini',
    model: 'Cooper SE',
    variant: 'Electric',
    year: 2023,
    price: 52990,
    odometer: 12500,
    transmission: 'automatic' as const,
    fuelType: 'electric' as const,
    bodyType: 'Hatchback',
    colour: 'British Racing Green',
    sellerState: 'VIC' as AustralianState,
    sellerSuburb: 'Richmond',
    sellerPostcode: '3121',
    sellerType: 'dealer' as const,
    title: '2023 Mini Cooper SE Electric',
    description: 'Excellent condition, low kms, full service history',
    images: ['https://via.placeholder.com/800x600?text=Mini+Cooper+SE+1'],
    features: ['LED Headlights', 'Navigation', 'Heated Seats', 'Parking Sensors'],
    isActive: true,
    scrapedAt: new Date().toISOString(),
  },
  {
    id: '2',
    source: 'carsales',
    sourceId: 'SSE-AD-12346',
    sourceUrl: 'https://www.carsales.com.au/cars/details/2',
    make: 'Mini',
    model: 'Cooper S',
    variant: 'Sport',
    year: 2022,
    price: 42990,
    odometer: 28000,
    transmission: 'automatic' as const,
    fuelType: 'petrol' as const,
    bodyType: 'Hatchback',
    colour: 'Midnight Black',
    sellerState: 'NSW' as AustralianState,
    sellerSuburb: 'Parramatta',
    sellerPostcode: '2150',
    sellerType: 'dealer' as const,
    title: '2022 Mini Cooper S Sport',
    description: 'Sporty and fun to drive',
    images: ['https://via.placeholder.com/800x600?text=Mini+Cooper+S'],
    features: ['Sport Suspension', 'JCW Exhaust', 'Sunroof'],
    isActive: true,
    scrapedAt: new Date().toISOString(),
  },
  {
    id: '3',
    source: 'gumtree',
    sourceId: 'GT-98765',
    sourceUrl: 'https://www.gumtree.com.au/s-ad/3',
    make: 'Mini',
    model: 'Cooper',
    variant: 'Classic',
    year: 2021,
    price: 32500,
    odometer: 45000,
    transmission: 'manual' as const,
    fuelType: 'petrol' as const,
    bodyType: 'Hatchback',
    colour: 'Pepper White',
    sellerState: 'QLD' as AustralianState,
    sellerSuburb: 'Brisbane',
    sellerPostcode: '4000',
    sellerType: 'private' as const,
    title: '2021 Mini Cooper Classic',
    description: 'Private sale, well maintained',
    images: ['https://via.placeholder.com/800x600?text=Mini+Cooper+Classic'],
    features: ['Bluetooth', 'Apple CarPlay'],
    isActive: true,
    scrapedAt: new Date().toISOString(),
  },
  {
    id: '4',
    source: 'carsales',
    sourceId: 'SSE-AD-12347',
    sourceUrl: 'https://www.carsales.com.au/cars/details/4',
    make: 'Tesla',
    model: 'Model 3',
    variant: 'Long Range',
    year: 2023,
    price: 55990,
    odometer: 15000,
    transmission: 'automatic' as const,
    fuelType: 'electric' as const,
    bodyType: 'Sedan',
    colour: 'Pearl White',
    sellerState: 'NSW' as AustralianState,
    sellerSuburb: 'Sydney',
    sellerPostcode: '2000',
    sellerType: 'dealer' as const,
    title: '2023 Tesla Model 3 Long Range',
    description: 'Full self-driving capability, pristine condition',
    images: ['https://via.placeholder.com/800x600?text=Tesla+Model+3'],
    features: ['Autopilot', 'Premium Interior', 'Glass Roof'],
    isActive: true,
    scrapedAt: new Date().toISOString(),
  },
  {
    id: '5',
    source: 'carsales',
    sourceId: 'SSE-AD-12348',
    sourceUrl: 'https://www.carsales.com.au/cars/details/5',
    make: 'BMW',
    model: 'i4',
    variant: 'eDrive40',
    year: 2023,
    price: 78990,
    odometer: 8000,
    transmission: 'automatic' as const,
    fuelType: 'electric' as const,
    bodyType: 'Sedan',
    colour: 'Brooklyn Grey',
    sellerState: 'VIC' as AustralianState,
    sellerSuburb: 'Melbourne',
    sellerPostcode: '3000',
    sellerType: 'dealer' as const,
    title: '2023 BMW i4 eDrive40',
    description: 'Luxury electric sedan with BMW quality',
    images: ['https://via.placeholder.com/800x600?text=BMW+i4'],
    features: ['M Sport Package', 'Harman Kardon Sound', 'Heads Up Display'],
    isActive: true,
    scrapedAt: new Date().toISOString(),
  },
  {
    id: '6',
    source: 'gumtree',
    sourceId: 'GT-98766',
    sourceUrl: 'https://www.gumtree.com.au/s-ad/6',
    make: 'Hyundai',
    model: 'Ioniq 5',
    variant: 'Dynamiq',
    year: 2022,
    price: 58000,
    odometer: 22000,
    transmission: 'automatic' as const,
    fuelType: 'electric' as const,
    bodyType: 'SUV',
    colour: 'Atlas White',
    sellerState: 'SA' as AustralianState,
    sellerSuburb: 'Adelaide',
    sellerPostcode: '5000',
    sellerType: 'private' as const,
    title: '2022 Hyundai Ioniq 5 Dynamiq',
    description: 'Award-winning EV, excellent range',
    images: ['https://via.placeholder.com/800x600?text=Hyundai+Ioniq+5'],
    features: ['V2L Capability', 'Relaxation Seats', '800V Architecture'],
    isActive: true,
    scrapedAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const query = searchParams.get('query')?.toLowerCase() || '';
    const deliveryState = (searchParams.get('deliveryState') || 'NSW') as AustralianState;
    const deliveryPostcode = searchParams.get('deliveryPostcode') || '2000';
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
    const minYear = searchParams.get('minYear') ? parseInt(searchParams.get('minYear')!) : undefined;
    const maxYear = searchParams.get('maxYear') ? parseInt(searchParams.get('maxYear')!) : undefined;
    const fuelType = searchParams.get('fuelType') || undefined;
    const transmission = searchParams.get('transmission') || undefined;
    const sellerState = searchParams.get('sellerState') as AustralianState | undefined;
    const sortBy = searchParams.get('sortBy') || 'totalPrice';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Filter listings
    let filtered = MOCK_LISTINGS.filter(listing => {
      // Text search
      if (query) {
        const searchText = `${listing.make} ${listing.model} ${listing.variant || ''} ${listing.title}`.toLowerCase();
        if (!searchText.includes(query)) return false;
      }

      // Price filter (on vehicle price)
      if (minPrice && listing.price < minPrice) return false;
      if (maxPrice && listing.price > maxPrice) return false;

      // Year filter
      if (minYear && listing.year < minYear) return false;
      if (maxYear && listing.year > maxYear) return false;

      // Fuel type filter
      if (fuelType && listing.fuelType !== fuelType) return false;

      // Transmission filter
      if (transmission && listing.transmission !== transmission) return false;

      // Seller state filter
      if (sellerState && listing.sellerState !== sellerState) return false;

      return true;
    });

    // Calculate costs for each listing
    const listingsWithCosts = filtered.map(listing => {
      const result = calculateTotalDeliveredCost({
        vehiclePrice: listing.price,
        sellerState: listing.sellerState,
        deliveryState,
        deliveryPostcode,
        fuelType: listing.fuelType as FuelType,
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
      listings: paginatedResults,
      pagination: {
        page,
        limit,
        totalResults,
        totalPages,
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
      { error: 'Failed to search cars' },
      { status: 500 }
    );
  }
}
