/**
 * Australian Vehicle Transport Cost Calculator
 * Based on industry averages for car transport (2025)
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

// Base rates per interstate route (bidirectional - use sorted key)
const BASE_ROUTES: Record<
  string,
  { base: number; perKm: number; daysMin: number; daysMax: number }
> = {
  'ACT-NSW': { base: 200, perKm: 0.55, daysMin: 1, daysMax: 2 },
  'ACT-NT': { base: 1200, perKm: 0.38, daysMin: 6, daysMax: 9 },
  'ACT-QLD': { base: 600, perKm: 0.44, daysMin: 3, daysMax: 5 },
  'ACT-SA': { base: 700, perKm: 0.46, daysMin: 4, daysMax: 6 },
  'ACT-TAS': { base: 900, perKm: 0.44, daysMin: 4, daysMax: 6 },
  'ACT-VIC': { base: 450, perKm: 0.48, daysMin: 2, daysMax: 4 },
  'ACT-WA': { base: 1100, perKm: 0.36, daysMin: 7, daysMax: 10 },
  'NSW-NT': { base: 1200, perKm: 0.38, daysMin: 6, daysMax: 9 },
  'NSW-QLD': { base: 500, perKm: 0.42, daysMin: 3, daysMax: 5 },
  'NSW-SA': { base: 650, perKm: 0.45, daysMin: 4, daysMax: 6 },
  'NSW-TAS': { base: 850, perKm: 0.45, daysMin: 4, daysMax: 6 },
  'NSW-VIC': { base: 400, perKm: 0.45, daysMin: 2, daysMax: 4 },
  'NSW-WA': { base: 1000, perKm: 0.35, daysMin: 7, daysMax: 10 },
  'NT-QLD': { base: 1100, perKm: 0.38, daysMin: 5, daysMax: 8 },
  'NT-SA': { base: 1000, perKm: 0.4, daysMin: 5, daysMax: 8 },
  'NT-TAS': { base: 1400, perKm: 0.35, daysMin: 8, daysMax: 12 },
  'NT-VIC': { base: 1300, perKm: 0.36, daysMin: 7, daysMax: 10 },
  'NT-WA': { base: 1100, perKm: 0.36, daysMin: 5, daysMax: 8 },
  'QLD-SA': { base: 900, perKm: 0.38, daysMin: 5, daysMax: 8 },
  'QLD-TAS': { base: 1000, perKm: 0.42, daysMin: 5, daysMax: 8 },
  'QLD-VIC': { base: 600, perKm: 0.4, daysMin: 4, daysMax: 6 },
  'QLD-WA': { base: 1200, perKm: 0.32, daysMin: 8, daysMax: 12 },
  'SA-TAS': { base: 800, perKm: 0.46, daysMin: 4, daysMax: 6 },
  'SA-VIC': { base: 400, perKm: 0.48, daysMin: 2, daysMax: 4 },
  'SA-WA': { base: 900, perKm: 0.38, daysMin: 4, daysMax: 7 },
  'TAS-VIC': { base: 700, perKm: 0.5, daysMin: 3, daysMax: 5 },
  'TAS-WA': { base: 1300, perKm: 0.34, daysMin: 8, daysMax: 12 },
  'VIC-WA': { base: 1100, perKm: 0.35, daysMin: 7, daysMax: 10 },
};

// Approximate distances between state capitals (km)
const STATE_CAPITAL_DISTANCES: Record<string, number> = {
  'ACT-NSW': 280,
  'ACT-NT': 3900,
  'ACT-QLD': 1200,
  'ACT-SA': 1200,
  'ACT-TAS': 850,
  'ACT-VIC': 660,
  'ACT-WA': 3900,
  'NSW-NT': 4000,
  'NSW-QLD': 920,
  'NSW-SA': 1400,
  'NSW-TAS': 1050,
  'NSW-VIC': 880,
  'NSW-WA': 4100,
  'NT-QLD': 2800,
  'NT-SA': 3000,
  'NT-TAS': 4200,
  'NT-VIC': 3750,
  'NT-WA': 4000,
  'QLD-SA': 2000,
  'QLD-TAS': 2100,
  'QLD-VIC': 1700,
  'QLD-WA': 4400,
  'SA-TAS': 1100,
  'SA-VIC': 730,
  'SA-WA': 2700,
  'TAS-VIC': 450,
  'TAS-WA': 3500,
  'VIC-WA': 3400,
};

// Intra-state average distances (from regional areas to capital)
const INTRA_STATE_AVG_DISTANCE: Record<string, number> = {
  NSW: 350,
  VIC: 250,
  QLD: 500,
  SA: 350,
  WA: 600,
  TAS: 200,
  ACT: 50,
  NT: 400,
};

/**
 * Get route key (sorted alphabetically for bidirectional lookup)
 */
function getRouteKey(state1: string, state2: string): string {
  return [state1, state2].sort().join('-');
}

/**
 * Calculate transport cost between two locations
 */
export function calculateTransport(input: TransportInput): TransportResult {
  const { fromState, toState } = input;

  // Same state = intra-state or local pickup
  if (fromState === toState) {
    return calculateIntraStateTransport(fromState);
  }

  return calculateInterStateTransport(fromState, toState);
}

/**
 * Calculate intra-state transport cost
 */
function calculateIntraStateTransport(state: AustralianState): TransportResult {
  const avgDistance = INTRA_STATE_AVG_DISTANCE[state] || 300;

  // For very short distances, assume local pickup is possible
  if (avgDistance < 100) {
    return {
      cost: 0,
      type: 'pickup',
      distance: avgDistance,
      estimatedDays: { min: 0, max: 1 },
      notes: 'Local pickup - no transport cost',
    };
  }

  // Intra-state transport rate
  const cost = Math.round(150 + avgDistance * 0.55);

  return {
    cost,
    type: 'intra-state',
    distance: avgDistance,
    estimatedDays: { min: 1, max: 3 },
    notes: `Estimated ${state} intra-state transport`,
  };
}

/**
 * Calculate interstate transport cost
 */
function calculateInterStateTransport(
  fromState: AustralianState,
  toState: AustralianState
): TransportResult {
  const routeKey = getRouteKey(fromState, toState);

  // Get route data or use default
  const route = BASE_ROUTES[routeKey] || {
    base: 800,
    perKm: 0.4,
    daysMin: 5,
    daysMax: 10,
  };

  // Get distance
  const distance = STATE_CAPITAL_DISTANCES[routeKey] || 1500;

  // Calculate cost: base + (distance * per_km) with diminishing returns over 1000km
  let cost = route.base;
  if (distance <= 1000) {
    cost += distance * route.perKm;
  } else {
    cost += 1000 * route.perKm;
    cost += (distance - 1000) * (route.perKm * 0.7); // 30% discount over 1000km
  }

  return {
    cost: Math.round(cost),
    type: 'interstate',
    distance,
    estimatedDays: {
      min: route.daysMin,
      max: route.daysMax,
    },
    notes: `${fromState} to ${toState} open carrier transport`,
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
