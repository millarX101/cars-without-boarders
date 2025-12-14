import type { Handler, HandlerEvent } from '@netlify/functions';

// Mock data for development - in production this queries Supabase
const MOCK_LISTINGS = [
  {
    id: '1',
    source: 'carsales',
    sourceId: 'SSE-AD-12345',
    sourceUrl: 'https://www.carsales.com.au/cars/details/SSE-AD-12345',
    make: 'Mini',
    model: 'Cooper SE',
    variant: 'Electric',
    year: 2023,
    price: 52990,
    odometer: 12500,
    transmission: 'automatic',
    fuelType: 'electric',
    bodyType: 'hatch',
    sellerState: 'VIC',
    sellerSuburb: 'Richmond',
    sellerType: 'dealer',
    title: '2023 Mini Cooper SE Electric',
    images: ['https://via.placeholder.com/400x300?text=Mini+Cooper+SE'],
    features: ['Apple CarPlay', 'Heated Seats', 'Parking Sensors'],
    isActive: true,
  },
  {
    id: '2',
    source: 'carsales',
    sourceId: 'SSE-AD-12346',
    sourceUrl: 'https://www.carsales.com.au/cars/details/SSE-AD-12346',
    make: 'Mini',
    model: 'Cooper S',
    variant: 'JCW',
    year: 2022,
    price: 45990,
    odometer: 28000,
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'hatch',
    sellerState: 'NSW',
    sellerSuburb: 'Parramatta',
    sellerType: 'dealer',
    title: '2022 Mini Cooper S JCW',
    images: ['https://via.placeholder.com/400x300?text=Mini+Cooper+S'],
    features: ['Sport Mode', 'Sunroof', 'Navigation'],
    isActive: true,
  },
  {
    id: '3',
    source: 'gumtree',
    sourceId: 'gt-98765',
    sourceUrl: 'https://www.gumtree.com.au/s-ad/98765',
    make: 'Mini',
    model: 'Cooper',
    variant: 'Classic',
    year: 2021,
    price: 32000,
    odometer: 45000,
    transmission: 'manual',
    fuelType: 'petrol',
    bodyType: 'hatch',
    sellerState: 'QLD',
    sellerSuburb: 'Brisbane',
    sellerType: 'private',
    title: '2021 Mini Cooper Classic Manual',
    images: ['https://via.placeholder.com/400x300?text=Mini+Cooper'],
    features: ['Bluetooth', 'Air Con', 'Alloy Wheels'],
    isActive: true,
  },
  {
    id: '4',
    source: 'carsales',
    sourceId: 'SSE-AD-12347',
    sourceUrl: 'https://www.carsales.com.au/cars/details/SSE-AD-12347',
    make: 'Tesla',
    model: 'Model 3',
    variant: 'Standard Range Plus',
    year: 2023,
    price: 55990,
    odometer: 15000,
    transmission: 'automatic',
    fuelType: 'electric',
    bodyType: 'sedan',
    sellerState: 'WA',
    sellerSuburb: 'Perth',
    sellerType: 'dealer',
    title: '2023 Tesla Model 3 Standard Range Plus',
    images: ['https://via.placeholder.com/400x300?text=Tesla+Model+3'],
    features: ['Autopilot', 'Premium Audio', 'Glass Roof'],
    isActive: true,
  },
];

// Simple transport cost calculation
function calculateTransportCost(fromState: string, toState: string): number {
  if (fromState === toState) return 0;

  const routes: Record<string, number> = {
    'NSW-VIC': 450, 'VIC-NSW': 450,
    'NSW-QLD': 550, 'QLD-NSW': 550,
    'NSW-SA': 700, 'SA-NSW': 700,
    'NSW-WA': 1200, 'WA-NSW': 1200,
    'VIC-QLD': 650, 'QLD-VIC': 650,
    'VIC-SA': 450, 'SA-VIC': 450,
    'VIC-WA': 1300, 'WA-VIC': 1300,
    'QLD-SA': 950, 'SA-QLD': 950,
    'QLD-WA': 1400, 'WA-QLD': 1400,
    'SA-WA': 950, 'WA-SA': 950,
  };

  const key = `${fromState}-${toState}`;
  return routes[key] || 800;
}

// Simple stamp duty calculation
function calculateStampDuty(state: string, price: number): number {
  const rates: Record<string, number> = {
    NSW: 0.04,
    VIC: 0.042,
    QLD: 0.03,
    SA: 0.04,
    WA: 0.0275,
    TAS: 0.03,
    ACT: 0.025,
    NT: 0.03,
  };
  return Math.round(price * (rates[state] || 0.04));
}

// Simple rego calculation
function calculateRego(state: string): number {
  const rates: Record<string, number> = {
    NSW: 850,
    VIC: 900,
    QLD: 830,
    SA: 750,
    WA: 880,
    TAS: 700,
    ACT: 950,
    NT: 780,
  };
  return rates[state] || 850;
}

const handler: Handler = async (event: HandlerEvent) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Parse request
    const body = event.httpMethod === 'POST'
      ? JSON.parse(event.body || '{}')
      : Object.fromEntries(new URLSearchParams(event.queryStringParameters as Record<string, string> || {}));

    const {
      query = '',
      make,
      model,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      fuelType,
      sellerState,
      deliveryPostcode = '2000',
      deliveryState = 'NSW',
      sortBy = 'totalPrice',
      sortOrder = 'asc',
      page = 1,
      pageSize = 20,
    } = body;

    // Filter listings
    let filtered = MOCK_LISTINGS.filter(listing => {
      if (query && !listing.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (make && listing.make.toLowerCase() !== make.toLowerCase()) return false;
      if (model && !listing.model.toLowerCase().includes(model.toLowerCase())) return false;
      if (minPrice && listing.price < minPrice) return false;
      if (maxPrice && listing.price > maxPrice) return false;
      if (minYear && listing.year < minYear) return false;
      if (maxYear && listing.year > maxYear) return false;
      if (fuelType && listing.fuelType !== fuelType) return false;
      if (sellerState && listing.sellerState !== sellerState) return false;
      return true;
    });

    // Calculate costs for each listing
    const listingsWithCosts = filtered.map(listing => {
      const transportCost = calculateTransportCost(listing.sellerState, deliveryState);
      const stampDuty = calculateStampDuty(deliveryState, listing.price);
      const registration = calculateRego(deliveryState);
      const roadworthy = listing.sellerState !== deliveryState ? 150 : 0;
      const totalDelivered = listing.price + transportCost + stampDuty + registration + roadworthy;

      return {
        ...listing,
        costs: {
          vehiclePrice: listing.price,
          transport: {
            cost: transportCost,
            type: listing.sellerState === deliveryState ? 'pickup' : 'interstate',
            estimatedDays: { min: 2, max: 5 },
          },
          stampDuty: {
            amount: stampDuty,
            state: deliveryState,
            effectiveRate: ((stampDuty / listing.price) * 100).toFixed(1) + '%',
          },
          registration: {
            amount: registration,
            state: deliveryState,
            period: '12 months',
            includesCTP: true,
          },
          roadworthy: {
            required: listing.sellerState !== deliveryState,
            cost: roadworthy,
          },
          totalDelivered,
        },
      };
    });

    // Sort
    listingsWithCosts.sort((a, b) => {
      let aVal: number, bVal: number;

      switch (sortBy) {
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'totalPrice':
          aVal = a.costs.totalDelivered;
          bVal = b.costs.totalDelivered;
          break;
        case 'year':
          aVal = a.year;
          bVal = b.year;
          break;
        case 'odometer':
          aVal = a.odometer || 0;
          bVal = b.odometer || 0;
          break;
        default:
          aVal = a.costs.totalDelivered;
          bVal = b.costs.totalDelivered;
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // Paginate
    const start = (page - 1) * pageSize;
    const paginatedListings = listingsWithCosts.slice(start, start + pageSize);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          listings: paginatedListings,
          pagination: {
            total: listingsWithCosts.length,
            page,
            pageSize,
            totalPages: Math.ceil(listingsWithCosts.length / pageSize),
          },
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
      }),
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: 'Failed to search listings',
        },
      }),
    };
  }
};

export { handler };
