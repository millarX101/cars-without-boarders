'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/search/search-bar';
import { CarCard } from '@/components/cars/car-card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, X, Car } from 'lucide-react';
import Link from 'next/link';

interface Listing {
  id: string;
  source: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  odometer?: number;
  transmission?: string;
  fuelType?: string;
  sellerState: string;
  sellerSuburb?: string;
  sellerType?: string;
  title: string;
  images: string[];
  costs: {
    vehiclePrice: number;
    transport: { cost: number; type: string };
    stampDuty: { amount: number };
    registration: { amount: number };
    roadworthy: { cost: number };
    totalDelivered: number;
  };
}

interface SearchResponse {
  success: boolean;
  data: {
    listings: Listing[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
    aggregations: {
      priceRange: { min: number; max: number };
      yearRange: { min: number; max: number };
      stateCount: Record<string, number>;
    };
  };
}

const SORT_OPTIONS = [
  { value: 'totalPrice-asc', label: 'Total Price: Low to High' },
  { value: 'totalPrice-desc', label: 'Total Price: High to Low' },
  { value: 'price-asc', label: 'Listed Price: Low to High' },
  { value: 'price-desc', label: 'Listed Price: High to Low' },
  { value: 'year-desc', label: 'Year: Newest First' },
  { value: 'year-asc', label: 'Year: Oldest First' },
  { value: 'odometer-asc', label: 'Odometer: Low to High' },
];

const FUEL_TYPES = [
  { value: '', label: 'All Fuel Types' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plug-in-hybrid', label: 'Plug-in Hybrid' },
];

const STATES = [
  { value: '', label: 'All States' },
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'ACT' },
  { value: 'NT', label: 'Northern Territory' },
];

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-xl border bg-white p-4">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <Skeleton className="mt-4 h-6 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="mt-4 h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [showFilters, setShowFilters] = useState(false);

  // Search state
  const query = searchParams.get('q') || '';
  const deliveryState = searchParams.get('deliveryState') || 'NSW';
  const postcode = searchParams.get('postcode') || '2000';

  // Filter state
  const [sortBy, setSortBy] = useState('totalPrice-asc');
  const [fuelType, setFuelType] = useState('');
  const [sellerState, setSellerState] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Active filters for display
  const activeFilters = [
    fuelType && { key: 'fuelType', label: `Fuel: ${fuelType}`, clear: () => setFuelType('') },
    sellerState && { key: 'sellerState', label: `From: ${sellerState}`, clear: () => setSellerState('') },
    minPrice && { key: 'minPrice', label: `Min: $${minPrice}`, clear: () => setMinPrice('') },
    maxPrice && { key: 'maxPrice', label: `Max: $${maxPrice}`, clear: () => setMaxPrice('') },
  ].filter(Boolean);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      try {
        const [sortField, sortOrder] = sortBy.split('-');

        const params = new URLSearchParams({
          query,
          deliveryState,
          deliveryPostcode: postcode,
          sortBy: sortField,
          sortOrder,
          ...(fuelType && { fuelType }),
          ...(sellerState && { sellerState }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
        });

        // Use mock API for development
        const response = await fetch(`/api/search-cars?${params}`);
        const data: SearchResponse = await response.json();

        if (data.success) {
          setListings(data.data.listings);
          setPagination({
            total: data.data.pagination.total,
            page: data.data.pagination.page,
            totalPages: data.data.pagination.totalPages,
          });
        }
      } catch (error) {
        console.error('Search error:', error);
        // Use mock data as fallback
        setListings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [query, deliveryState, postcode, sortBy, fuelType, sellerState, minPrice, maxPrice]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <SearchBar
            variant="compact"
            defaultQuery={query}
            defaultState={deliveryState}
            defaultPostcode={postcode}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Results Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {query ? `Results for "${query}"` : 'All Cars'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {loading ? 'Searching...' : `${pagination.total} cars found • Delivering to ${deliveryState} ${postcode}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="sm:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>

            {/* Sort */}
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={SORT_OPTIONS}
              className="w-48"
            />
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {activeFilters.map((filter) => filter && (
              <Badge key={filter.key} variant="secondary" className="gap-1 pr-1">
                {filter.label}
                <button
                  onClick={filter.clear}
                  className="ml-1 rounded-full p-0.5 hover:bg-gray-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <button
              onClick={() => {
                setFuelType('');
                setSellerState('');
                setMinPrice('');
                setMaxPrice('');
              }}
              className="text-sm text-fuchsia-700 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} w-full sm:block sm:w-64 shrink-0`}>
            <div className="rounded-xl border bg-white p-4">
              <h2 className="font-semibold text-gray-900">Filters</h2>

              <div className="mt-4 space-y-4">
                {/* Fuel Type */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Fuel Type
                  </label>
                  <Select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    options={FUEL_TYPES}
                  />
                </div>

                {/* Seller State */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Car Location
                  </label>
                  <Select
                    value={sellerState}
                    onChange={(e) => setSellerState(e.target.value)}
                    options={STATES}
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Close */}
              <Button
                className="mt-4 w-full sm:hidden"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            {loading ? (
              <LoadingSkeleton />
            ) : listings.length === 0 ? (
              <div className="rounded-xl border bg-white p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-900">No cars found</h3>
                <p className="mt-2 text-gray-500">
                  Try adjusting your search or filters to find more results.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {listings.map((listing) => (
                    <CarCard
                      key={listing.id}
                      listing={listing}
                      deliveryState={deliveryState}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button variant="outline" disabled={pagination.page === 1}>
                      Previous
                    </Button>
                    <span className="px-4 text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button variant="outline" disabled={pagination.page === pagination.totalPages}>
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Advertise Your Car Free Section */}
            <div className="mt-12 rounded-xl border-2 border-dashed border-fuchsia-300 bg-fuchsia-50 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fuchsia-100 text-fuchsia-700">
                <Car className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">
                Selling your car?
              </h3>
              <p className="mx-auto mt-2 max-w-md text-gray-600">
                List your car for free on landedX. Upload photos, add your location,
                and reach buyers across Australia who can see exactly what it will cost delivered to their door.
              </p>
              <Button className="mt-6 bg-fuchsia-700 hover:bg-fuchsia-800" asChild>
                <Link href="/list-your-car">
                  List Your Car Free
                </Link>
              </Button>
              <p className="mt-3 text-xs text-gray-500">
                No fees • No hidden charges • Reach all of Australia
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchPageFallback() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <LoadingSkeleton />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}
