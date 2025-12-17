/**
 * Australian Vehicle Transport Cost Calculator
 * Fetches from Supabase transport_routes table with hardcoded fallback
 */

import type { AustralianState } from '@/lib/types/car';

export interface TransportInput {
  fromState: AustralianState;
  toState: AustralianState;
  fromPostcode?: string;
  toPostcode?: string;
}

export interface TransportResult {
  cost: number;
  type: 'pickup' | 'intra-state' | 'interstate';
  distance: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  notes?: string;
}

export interface TransportRoute {
  from_state: string;
  to_state: string;
  base_price: number;
  per_km_rate: number;
  estimated_days_min: number;
  estimated_days_max: number;
  notes: string | null;
}

// Fallback transport costs (depot-to-depot, real carrier quotes + 10% margin, Dec 2024)
// Used if database fetch fails
const FALLBACK_TRANSPORT_COSTS: Record<string, Record<string, number>> = {
  'NSW': { 'NSW': 0, 'VIC': 770, 'QLD': 880, 'SA': 1100, 'WA': 2200, 'TAS': 1320, 'ACT': 330, 'NT': 2420 },
  'VIC': { 'NSW': 770, 'VIC': 0, 'QLD': 1210, 'SA': 770, 'WA': 2420, 'TAS': 880, 'ACT': 880, 'NT': 2640 },
  'QLD': { 'NSW': 880, 'VIC': 1210, 'QLD': 0, 'SA': 1540, 'WA': 2860, 'TAS': 1650, 'ACT': 990, 'NT': 1980 },
  'SA': { 'NSW': 1100, 'VIC': 770, 'QLD': 1540, 'SA': 0, 'WA': 1650, 'TAS': 1210, 'ACT': 1210, 'NT': 1980 },
  'WA': { 'NSW': 2200, 'VIC': 2420, 'QLD': 2860, 'SA': 1650, 'WA': 0, 'TAS': 2860, 'ACT': 2310, 'NT': 2200 },
  'TAS': { 'NSW': 1320, 'VIC': 880, 'QLD': 1650, 'SA': 1210, 'WA': 2860, 'TAS': 0, 'ACT': 1430, 'NT': 2750 },
  'ACT': { 'NSW': 330, 'VIC': 880, 'QLD': 990, 'SA': 1210, 'WA': 2310, 'TAS': 1430, 'ACT': 0, 'NT': 2530 },
  'NT': { 'NSW': 2420, 'VIC': 2640, 'QLD': 1980, 'SA': 1980, 'WA': 2200, 'TAS': 2750, 'ACT': 2530, 'NT': 0 },
};

// Fallback estimated days
const FALLBACK_DAYS: Record<string, Record<string, { min: number; max: number }>> = {
  'NSW': { 'NSW': { min: 0, max: 0 }, 'VIC': { min: 2, max: 4 }, 'QLD': { min: 3, max: 5 }, 'SA': { min: 4, max: 6 }, 'WA': { min: 7, max: 10 }, 'TAS': { min: 4, max: 6 }, 'ACT': { min: 1, max: 2 }, 'NT': { min: 6, max: 9 } },
  'VIC': { 'NSW': { min: 2, max: 4 }, 'VIC': { min: 0, max: 0 }, 'QLD': { min: 4, max: 6 }, 'SA': { min: 2, max: 4 }, 'WA': { min: 7, max: 10 }, 'TAS': { min: 3, max: 5 }, 'ACT': { min: 2, max: 4 }, 'NT': { min: 7, max: 10 } },
  'QLD': { 'NSW': { min: 3, max: 5 }, 'VIC': { min: 4, max: 6 }, 'QLD': { min: 0, max: 0 }, 'SA': { min: 5, max: 8 }, 'WA': { min: 8, max: 12 }, 'TAS': { min: 5, max: 8 }, 'ACT': { min: 3, max: 5 }, 'NT': { min: 5, max: 8 } },
  'SA': { 'NSW': { min: 4, max: 6 }, 'VIC': { min: 2, max: 4 }, 'QLD': { min: 5, max: 8 }, 'SA': { min: 0, max: 0 }, 'WA': { min: 4, max: 7 }, 'TAS': { min: 4, max: 6 }, 'ACT': { min: 4, max: 6 }, 'NT': { min: 5, max: 8 } },
  'WA': { 'NSW': { min: 7, max: 10 }, 'VIC': { min: 7, max: 10 }, 'QLD': { min: 8, max: 12 }, 'SA': { min: 4, max: 7 }, 'WA': { min: 0, max: 0 }, 'TAS': { min: 8, max: 12 }, 'ACT': { min: 7, max: 10 }, 'NT': { min: 5, max: 8 } },
  'TAS': { 'NSW': { min: 4, max: 6 }, 'VIC': { min: 3, max: 5 }, 'QLD': { min: 5, max: 8 }, 'SA': { min: 4, max: 6 }, 'WA': { min: 8, max: 12 }, 'TAS': { min: 0, max: 0 }, 'ACT': { min: 4, max: 6 }, 'NT': { min: 8, max: 12 } },
  'ACT': { 'NSW': { min: 1, max: 2 }, 'VIC': { min: 2, max: 4 }, 'QLD': { min: 3, max: 5 }, 'SA': { min: 4, max: 6 }, 'WA': { min: 7, max: 10 }, 'TAS': { min: 4, max: 6 }, 'ACT': { min: 0, max: 0 }, 'NT': { min: 6, max: 9 } },
  'NT': { 'NSW': { min: 6, max: 9 }, 'VIC': { min: 7, max: 10 }, 'QLD': { min: 5, max: 8 }, 'SA': { min: 5, max: 8 }, 'WA': { min: 5, max: 8 }, 'TAS': { min: 8, max: 12 }, 'ACT': { min: 6, max: 9 }, 'NT': { min: 0, max: 0 } },
};

// Approximate distances between state capitals (km)
const STATE_CAPITAL_DISTANCES: Record<string, Record<string, number>> = {
  'NSW': { 'NSW': 0, 'VIC': 880, 'QLD': 920, 'SA': 1400, 'WA': 4100, 'TAS': 1050, 'ACT': 280, 'NT': 4000 },
  'VIC': { 'NSW': 880, 'VIC': 0, 'QLD': 1700, 'SA': 730, 'WA': 3400, 'TAS': 450, 'ACT': 660, 'NT': 3750 },
  'QLD': { 'NSW': 920, 'VIC': 1700, 'QLD': 0, 'SA': 2000, 'WA': 4400, 'TAS': 2100, 'ACT': 1200, 'NT': 2800 },
  'SA': { 'NSW': 1400, 'VIC': 730, 'QLD': 2000, 'SA': 0, 'WA': 2700, 'TAS': 1100, 'ACT': 1200, 'NT': 3000 },
  'WA': { 'NSW': 4100, 'VIC': 3400, 'QLD': 4400, 'SA': 2700, 'WA': 0, 'TAS': 3500, 'ACT': 3900, 'NT': 4000 },
  'TAS': { 'NSW': 1050, 'VIC': 450, 'QLD': 2100, 'SA': 1100, 'WA': 3500, 'TAS': 0, 'ACT': 850, 'NT': 4200 },
  'ACT': { 'NSW': 280, 'VIC': 660, 'QLD': 1200, 'SA': 1200, 'WA': 3900, 'TAS': 850, 'ACT': 0, 'NT': 3900 },
  'NT': { 'NSW': 4000, 'VIC': 3750, 'QLD': 2800, 'SA': 3000, 'WA': 4000, 'TAS': 4200, 'ACT': 3900, 'NT': 0 },
};

// Cache for transport routes from database
let cachedRoutes: Map<string, TransportRoute> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch transport routes from Supabase
 */
export async function fetchTransportRoutes(): Promise<Map<string, TransportRoute>> {
  // Return cached data if still valid
  if (cachedRoutes && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedRoutes;
  }

  try {
    const response = await fetch('/api/transport-routes');
    if (!response.ok) {
      throw new Error('Failed to fetch transport routes');
    }

    const data = await response.json();
    const routes = new Map<string, TransportRoute>();

    for (const route of data.routes || []) {
      const key = `${route.from_state}-${route.to_state}`;
      routes.set(key, route);
    }

    cachedRoutes = routes;
    cacheTimestamp = Date.now();
    return routes;
  } catch (error) {
    console.warn('Failed to fetch transport routes, using fallback:', error);
    return new Map();
  }
}

/**
 * Get transport cost for a route (synchronous, uses fallback)
 */
export function getTransportCost(
  fromState: AustralianState,
  toState: AustralianState
): number {
  return FALLBACK_TRANSPORT_COSTS[fromState]?.[toState] ?? 0;
}

/**
 * Get transport cost for a route (async, fetches from database)
 */
export async function getTransportCostAsync(
  fromState: AustralianState,
  toState: AustralianState
): Promise<{ cost: number; daysMin: number; daysMax: number; notes: string | null }> {
  const routes = await fetchTransportRoutes();
  const key = `${fromState}-${toState}`;
  const route = routes.get(key);

  if (route) {
    return {
      cost: Number(route.base_price),
      daysMin: route.estimated_days_min,
      daysMax: route.estimated_days_max,
      notes: route.notes,
    };
  }

  // Fallback to hardcoded values
  const cost = FALLBACK_TRANSPORT_COSTS[fromState]?.[toState] ?? 0;
  const days = FALLBACK_DAYS[fromState]?.[toState] ?? { min: 5, max: 10 };

  return {
    cost,
    daysMin: days.min,
    daysMax: days.max,
    notes: null,
  };
}

/**
 * Get all transport costs as a matrix (for bulk operations)
 */
export function getTransportCostMatrix(): Record<string, Record<string, number>> {
  return FALLBACK_TRANSPORT_COSTS;
}

/**
 * Calculate transport cost between two locations
 */
export function calculateTransport(input: TransportInput): TransportResult {
  const { fromState, toState } = input;

  // Same state = no transport
  if (fromState === toState) {
    return {
      cost: 0,
      type: 'pickup',
      distance: 0,
      estimatedDays: { min: 0, max: 0 },
      notes: 'Same state - no transport needed',
    };
  }

  const cost = getTransportCost(fromState, toState);
  const distance = STATE_CAPITAL_DISTANCES[fromState]?.[toState] ?? 1500;
  const days = FALLBACK_DAYS[fromState]?.[toState] ?? { min: 5, max: 10 };

  const includesFerry = fromState === 'TAS' || toState === 'TAS';

  return {
    cost,
    type: 'interstate',
    distance,
    estimatedDays: days,
    notes: includesFerry
      ? `${fromState} to ${toState} (includes ferry)`
      : `${fromState} to ${toState} depot-to-depot`,
  };
}

/**
 * Get transport cost estimate with full breakdown
 */
export function getTransportBreakdown(
  fromState: AustralianState,
  toState: AustralianState
): {
  result: TransportResult;
  route: string;
  includesFerry: boolean;
  premium: boolean;
} {
  const result = calculateTransport({ fromState, toState });
  const route = `${fromState} → ${toState}`;

  // Check if route includes ferry (Tasmania)
  const includesFerry = fromState === 'TAS' || toState === 'TAS';

  // Check if route is premium (very long distance)
  const premium = result.distance > 3000;

  return {
    result,
    route,
    includesFerry,
    premium,
  };
}

/**
 * Compare transport costs from one state to all others
 */
export function compareTransportFromState(
  fromState: AustralianState
): Array<{
  toState: AustralianState;
  cost: number;
  distance: number;
  days: string;
}> {
  const allStates: AustralianState[] = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'];

  return allStates
    .filter((s) => s !== fromState)
    .map((toState) => {
      const result = calculateTransport({ fromState, toState });
      return {
        toState,
        cost: result.cost,
        distance: result.distance,
        days: `${result.estimatedDays.min}-${result.estimatedDays.max} days`,
      };
    })
    .sort((a, b) => a.cost - b.cost);
}

/**
 * Estimate if transport is worth it based on price difference
 */
export function isTransportWorthIt(
  localPrice: number,
  remotePrice: number,
  transportCost: number,
  additionalCosts: number = 0
): {
  worthIt: boolean;
  savings: number;
  breakEven: number;
} {
  const totalRemoteCost = remotePrice + transportCost + additionalCosts;
  const savings = localPrice - totalRemoteCost;

  return {
    worthIt: savings > 0,
    savings,
    breakEven: localPrice - remotePrice - additionalCosts, // Max transport cost to break even
  };
}
