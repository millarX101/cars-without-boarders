/**
 * Unified Car Search
 * Aggregates results from multiple sources:
 * - CarsGuide
 * - AutoTrader
 * - Dealer websites
 * - Mock data (fallback)
 */

import type { CarListing, AustralianState, FuelType } from '@/lib/types/car';
import { searchCarsGuide } from './carsguide';
import { searchAutoTrader } from './autotrader';
import { searchDealersByMake, getAvailableMakes, searchAllDealers } from './dealers';

export interface UnifiedSearchParams {
  query?: string;
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: FuelType;
  transmission?: 'automatic' | 'manual';
  sellerState?: AustralianState;
  page?: number;
  limit?: number;
  sources?: ('carsguide' | 'autotrader' | 'dealers' | 'mock')[];
}

export interface UnifiedSearchResult {
  listings: CarListing[];
  sources: {
    carsguide: number;
    autotrader: number;
    dealers: number;
    mock: number;
  };
  totalFound: number;
  page: number;
  totalPages: number;
}

// Mock listings for when scrapers fail or as supplement
const MOCK_LISTINGS: CarListing[] = [
  {
    id: 'mock-1',
    source: 'mock',
    sourceId: 'MOCK-001',
    sourceUrl: '#',
    make: 'Honda',
    model: 'Civic',
    variant: 'VTi-S',
    year: 2022,
    price: 32990,
    odometer: 25000,
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Sedan',
    sellerState: 'NSW',
    sellerSuburb: 'Parramatta',
    sellerPostcode: '2150',
    sellerType: 'dealer',
    title: '2022 Honda Civic VTi-S',
    description: 'Low km, full service history',
    images: ['https://via.placeholder.com/800x600?text=Honda+Civic'],
    features: ['Apple CarPlay', 'Reversing Camera', 'Lane Keep Assist'],
    isActive: true,
    scrapedAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    source: 'mock',
    sourceId: 'MOCK-002',
    sourceUrl: '#',
    make: 'Toyota',
    model: 'Corolla',
    variant: 'Ascent Sport',
    year: 2023,
    price: 29990,
    odometer: 15000,
    transmission: 'automatic',
    fuelType: 'hybrid',
    bodyType: 'Hatchback',
    sellerState: 'VIC',
    sellerSuburb: 'Richmond',
    sellerPostcode: '3121',
    sellerType: 'dealer',
    title: '2023 Toyota Corolla Ascent Sport Hybrid',
    description: 'Hybrid efficiency, Toyota reliability',
    images: ['https://via.placeholder.com/800x600?text=Toyota+Corolla'],
    features: ['Hybrid', 'Safety Sense', 'Touchscreen'],
    isActive: true,
    scrapedAt: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    source: 'mock',
    sourceId: 'MOCK-003',
    sourceUrl: '#',
    make: 'Mazda',
    model: 'CX-5',
    variant: 'Touring',
    year: 2021,
    price: 38500,
    odometer: 45000,
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'SUV',
    sellerState: 'QLD',
    sellerSuburb: 'Toowong',
    sellerPostcode: '4066',
    sellerType: 'dealer',
    title: '2021 Mazda CX-5 Touring',
    description: 'Popular SUV with premium features',
    images: ['https://via.placeholder.com/800x600?text=Mazda+CX-5'],
    features: ['Bose Sound', 'Sunroof', 'Leather Seats'],
    isActive: true,
    scrapedAt: new Date().toISOString(),
  },
  {
    id: 'mock-4',
    source: 'mock',
    sourceId: 'MOCK-004',
    sourceUrl: '#',
    make: 'Hyundai',
    model: 'Tucson',
    variant: 'Elite',
    year: 2022,
    price: 42990,
    odometer: 22000,
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'SUV',
    sellerState: 'SA',
    sellerSuburb: 'Adelaide',
    sellerPostcode: '5000',
    sellerType: 'dealer',
    title: '2022 Hyundai Tucson Elite',
    description: 'Modern design, feature packed',
    images: ['https://via.placeholder.com/800x600?text=Hyundai+Tucson'],
    features: ['Panoramic Roof', 'Digital Cluster', 'Wireless Charging'],
    isActive: true,
    scrapedAt: new Date().toISOString(),
  },
  {
    id: 'mock-5',
    source: 'mock',
    sourceId: 'MOCK-005',
    sourceUrl: '#',
    make: 'Tesla',
    model: 'Model 3',
    variant: 'Long Range',
    year: 2023,
    price: 54990,
    odometer: 12000,
    transmission: 'automatic',
    fuelType: 'electric',
    bodyType: 'Sedan',
    sellerState: 'NSW',
    sellerSuburb: 'Sydney',
    sellerPostcode: '2000',
    sellerType: 'dealer',
    title: '2023 Tesla Model 3 Long Range',
    description: 'EV with excellent range',
    images: ['https://via.placeholder.com/800x600?text=Tesla+Model+3'],
    features: ['Autopilot', 'Premium Interior', 'Supercharger Access'],
    isActive: true,
    scrapedAt: new Date().toISOString(),
  },
  {
    id: 'mock-6',
    source: 'mock',
    sourceId: 'MOCK-006',
    sourceUrl: '#',
    make: 'BMW',
    model: '320i',
    variant: 'M Sport',
    year: 2022,
    price: 62990,
    odometer: 18000,
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'Sedan',
    sellerState: 'VIC',
    sellerSuburb: 'Melbourne',
    sellerPostcode: '3000',
    sellerType: 'dealer',
    title: '2022 BMW 320i M Sport',
    description: 'Luxury sports sedan',
    images: ['https://via.placeholder.com/800x600?text=BMW+320i'],
    features: ['M Sport Package', 'Live Cockpit', 'Driving Assistant'],
    isActive: true,
    scrapedAt: new Date().toISOString(),
  },
  {
    id: 'mock-7',
    source: 'mock',
    sourceId: 'MOCK-007',
    sourceUrl: '#',
    make: 'Kia',
    model: 'Sportage',
    variant: 'GT-Line',
    year: 2023,
    price: 48990,
    odometer: 8000,
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'SUV',
    sellerState: 'WA',
    sellerSuburb: 'Perth',
    sellerPostcode: '6000',
    sellerType: 'dealer',
    title: '2023 Kia Sportage GT-Line',
    description: 'New generation, fully loaded',
    images: ['https://via.placeholder.com/800x600?text=Kia+Sportage'],
    features: ['Dual Curved Display', 'Remote Parking', 'Head-Up Display'],
    isActive: true,
    scrapedAt: new Date().toISOString(),
  },
  {
    id: 'mock-8',
    source: 'mock',
    sourceId: 'MOCK-008',
    sourceUrl: '#',
    make: 'Ford',
    model: 'Ranger',
    variant: 'XLT',
    year: 2022,
    price: 55990,
    odometer: 35000,
    transmission: 'automatic',
    fuelType: 'diesel',
    bodyType: 'Ute',
    sellerState: 'QLD',
    sellerSuburb: 'Brisbane',
    sellerPostcode: '4000',
    sellerType: 'private',
    title: '2022 Ford Ranger XLT',
    description: 'Work ready, well maintained',
    images: ['https://via.placeholder.com/800x600?text=Ford+Ranger'],
    features: ['Tow Package', 'SYNC 4', 'Trailer Sway Control'],
    isActive: true,
    scrapedAt: new Date().toISOString(),
  },
];

// Parse query to extract make/model
function parseQuery(query: string): { make?: string; model?: string } {
  if (!query) return {};

  const parts = query.toLowerCase().split(/\s+/);
  const makes = getAvailableMakes().map((m) => m.toLowerCase());

  // Check if first word is a known make
  if (parts.length > 0 && makes.includes(parts[0])) {
    return {
      make: parts[0],
      model: parts.slice(1).join(' ') || undefined,
    };
  }

  // Common make names that might appear
  const commonMakes = [
    'toyota', 'honda', 'mazda', 'hyundai', 'kia', 'ford', 'holden',
    'nissan', 'mitsubishi', 'subaru', 'volkswagen', 'vw', 'bmw',
    'mercedes', 'audi', 'lexus', 'tesla', 'jeep', 'suzuki', 'isuzu'
  ];

  for (const make of commonMakes) {
    if (parts.includes(make)) {
      const makeIndex = parts.indexOf(make);
      return {
        make,
        model: parts.filter((_, i) => i !== makeIndex).join(' ') || undefined,
      };
    }
  }

  return { model: query };
}

// Filter listings based on params
function filterListings(listings: CarListing[], params: UnifiedSearchParams): CarListing[] {
  return listings.filter((listing) => {
    // Price filter
    if (params.minPrice && listing.price < params.minPrice) return false;
    if (params.maxPrice && listing.price > params.maxPrice) return false;

    // Year filter
    if (params.minYear && listing.year < params.minYear) return false;
    if (params.maxYear && listing.year > params.maxYear) return false;

    // Fuel type filter
    if (params.fuelType && listing.fuelType !== params.fuelType) return false;

    // Transmission filter
    if (params.transmission && listing.transmission !== params.transmission) return false;

    // Seller state filter
    if (params.sellerState && listing.sellerState !== params.sellerState) return false;

    // Make filter
    if (params.make && listing.make.toLowerCase() !== params.make.toLowerCase()) return false;

    // Model filter (partial match)
    if (params.model && !listing.model.toLowerCase().includes(params.model.toLowerCase())) {
      return false;
    }

    // Query search (if no specific make/model parsed)
    if (params.query && !params.make && !params.model) {
      const searchText = `${listing.make} ${listing.model} ${listing.variant || ''} ${listing.title}`.toLowerCase();
      const queryLower = params.query.toLowerCase();
      if (!searchText.includes(queryLower)) return false;
    }

    return true;
  });
}

// Main unified search function
export async function unifiedSearch(params: UnifiedSearchParams): Promise<UnifiedSearchResult> {
  const allListings: CarListing[] = [];
  const sourceCounts = {
    carsguide: 0,
    autotrader: 0,
    dealers: 0,
    mock: 0,
  };

  // Parse query for make/model
  const { make, model } = params.query ? parseQuery(params.query) : {};
  const searchMake = params.make || make;
  const searchModel = params.model || model;

  const sources = params.sources || ['carsguide', 'autotrader', 'dealers', 'mock'];

  // Run scrapers in parallel
  const scraperPromises: Promise<CarListing[]>[] = [];

  if (sources.includes('carsguide')) {
    scraperPromises.push(
      searchCarsGuide({
        make: searchMake,
        model: searchModel,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        minYear: params.minYear,
        maxYear: params.maxYear,
        state: params.sellerState,
      }).catch((err) => {
        console.error('CarsGuide error:', err);
        return [];
      })
    );
  }

  if (sources.includes('autotrader')) {
    scraperPromises.push(
      searchAutoTrader({
        make: searchMake,
        model: searchModel,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        minYear: params.minYear,
        maxYear: params.maxYear,
        state: params.sellerState,
      }).catch((err) => {
        console.error('AutoTrader error:', err);
        return [];
      })
    );
  }

  if (sources.includes('dealers') && searchMake) {
    scraperPromises.push(
      searchDealersByMake(searchMake, {
        state: params.sellerState,
        maxDealers: 5,
      }).catch((err) => {
        console.error('Dealers error:', err);
        return [];
      })
    );
  } else if (sources.includes('dealers')) {
    scraperPromises.push(
      searchAllDealers({
        state: params.sellerState,
        maxDealers: 10,
      }).catch((err) => {
        console.error('Dealers error:', err);
        return [];
      })
    );
  }

  // Wait for all scrapers
  const results = await Promise.allSettled(scraperPromises);

  let scraperIndex = 0;
  if (sources.includes('carsguide')) {
    const result = results[scraperIndex++];
    if (result.status === 'fulfilled') {
      const listings = result.value;
      allListings.push(...listings);
      sourceCounts.carsguide = listings.length;
    }
  }

  if (sources.includes('autotrader')) {
    const result = results[scraperIndex++];
    if (result.status === 'fulfilled') {
      const listings = result.value;
      allListings.push(...listings);
      sourceCounts.autotrader = listings.length;
    }
  }

  if (sources.includes('dealers')) {
    const result = results[scraperIndex++];
    if (result.status === 'fulfilled') {
      const listings = result.value;
      allListings.push(...listings);
      sourceCounts.dealers = listings.length;
    }
  }

  // Add mock data if enabled or if no results from scrapers
  if (sources.includes('mock') || allListings.length === 0) {
    const filteredMock = filterListings(MOCK_LISTINGS, {
      ...params,
      make: searchMake,
      model: searchModel,
    });
    allListings.push(...filteredMock);
    sourceCounts.mock = filteredMock.length;
  }

  // Filter all results
  const filtered = filterListings(allListings, {
    ...params,
    make: searchMake,
    model: searchModel,
  });

  // Remove duplicates (same source + sourceId)
  const seen = new Set<string>();
  const unique = filtered.filter((listing) => {
    const key = `${listing.source}-${listing.sourceId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Pagination
  const page = params.page || 1;
  const limit = params.limit || 12;
  const totalFound = unique.length;
  const totalPages = Math.ceil(totalFound / limit);
  const startIndex = (page - 1) * limit;
  const paginatedResults = unique.slice(startIndex, startIndex + limit);

  return {
    listings: paginatedResults,
    sources: sourceCounts,
    totalFound,
    page,
    totalPages,
  };
}
