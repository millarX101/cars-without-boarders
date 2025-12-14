export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'ACT' | 'NT';

export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'plug-in-hybrid' | 'lpg' | 'other';

export type Transmission = 'automatic' | 'manual' | 'cvt' | 'dct' | 'other';

export type SellerType = 'dealer' | 'private';

export type ListingSource = 'carsales' | 'gumtree';

export interface CarListing {
  id: string;
  source: ListingSource;
  sourceId: string;
  sourceUrl: string;

  // Vehicle details
  make: string;
  model: string;
  variant?: string;
  year: number;
  price: number;

  // Specs
  odometer?: number;
  transmission?: Transmission;
  fuelType?: FuelType;
  bodyType?: string;
  driveType?: string;
  colour?: string;
  engineSize?: number;
  cylinders?: number;

  // Location
  sellerState: AustralianState;
  sellerPostcode?: string;
  sellerSuburb?: string;

  // Seller
  sellerType?: SellerType;
  sellerName?: string;

  // Content
  title: string;
  description?: string;
  images: string[];
  features: string[];

  // Meta
  firstScrapedAt: string;
  lastScrapedAt: string;
  isActive: boolean;
}

export interface CarListingWithCosts extends CarListing {
  costs: CostBreakdown;
  savings?: {
    vsLocalAverage: number;
    vsLocalBest: number;
  };
}

export interface CostBreakdown {
  vehiclePrice: number;
  transport: TransportCost;
  stampDuty: StampDutyCost;
  registration: RegistrationCost;
  roadworthy: RoadworthyCost;
  totalDelivered: number;
}

export interface TransportCost {
  cost: number;
  distance: number;
  type: 'pickup' | 'intra-state' | 'interstate';
  estimatedDays?: {
    min: number;
    max: number;
  };
}

export interface StampDutyCost {
  amount: number;
  state: AustralianState;
  effectiveRate: string;
  isEVDiscount?: boolean;
}

export interface RegistrationCost {
  amount: number;
  state: AustralianState;
  period: string;
  includesCTP: boolean;
}

export interface RoadworthyCost {
  required: boolean;
  cost: number;
  reason?: string;
}

export interface SearchFilters {
  query?: string;
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: FuelType[];
  transmission?: Transmission;
  sellerState?: AustralianState[];
  sellerType?: SellerType;
  source?: ListingSource;
}

export interface SearchParams extends SearchFilters {
  deliveryPostcode: string;
  deliveryState: AustralianState;
  sortBy?: 'price' | 'totalPrice' | 'year' | 'odometer' | 'distance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  listings: CarListingWithCosts[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  aggregations: {
    priceRange: { min: number; max: number };
    yearRange: { min: number; max: number };
    stateCount: Record<AustralianState, number>;
    fuelTypeCount: Record<FuelType, number>;
  };
}
