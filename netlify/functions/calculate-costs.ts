import type { Handler, HandlerEvent } from '@netlify/functions';

// Import calculators - these would normally be shared code
// For Netlify Functions, we inline the logic or use a shared package

interface TransportCost {
  cost: number;
  type: string;
  distance: number;
  estimatedDays: { min: number; max: number };
}

interface CostBreakdown {
  vehiclePrice: number;
  transport: TransportCost;
  stampDuty: { amount: number; state: string; effectiveRate: string };
  registration: { amount: number; state: string; period: string; includesCTP: boolean };
  roadworthy: { required: boolean; cost: number; reason?: string };
  totalDelivered: number;
}

// Transport routes base data
const TRANSPORT_ROUTES: Record<string, { base: number; perKm: number; daysMin: number; daysMax: number }> = {
  'ACT-NSW': { base: 200, perKm: 0.55, daysMin: 1, daysMax: 2 },
  'NSW-VIC': { base: 400, perKm: 0.45, daysMin: 2, daysMax: 4 },
  'NSW-QLD': { base: 500, perKm: 0.42, daysMin: 3, daysMax: 5 },
  'NSW-SA': { base: 650, perKm: 0.45, daysMin: 4, daysMax: 6 },
  'NSW-WA': { base: 1000, perKm: 0.35, daysMin: 7, daysMax: 10 },
  'NSW-TAS': { base: 850, perKm: 0.45, daysMin: 4, daysMax: 6 },
  'VIC-QLD': { base: 600, perKm: 0.40, daysMin: 4, daysMax: 6 },
  'VIC-SA': { base: 400, perKm: 0.48, daysMin: 2, daysMax: 4 },
  'VIC-WA': { base: 1100, perKm: 0.35, daysMin: 7, daysMax: 10 },
  'VIC-TAS': { base: 700, perKm: 0.50, daysMin: 3, daysMax: 5 },
  'QLD-SA': { base: 900, perKm: 0.38, daysMin: 5, daysMax: 8 },
  'QLD-WA': { base: 1200, perKm: 0.32, daysMin: 8, daysMax: 12 },
  'SA-WA': { base: 900, perKm: 0.38, daysMin: 4, daysMax: 7 },
};

const STATE_DISTANCES: Record<string, number> = {
  'ACT-NSW': 280,
  'NSW-VIC': 880,
  'NSW-QLD': 920,
  'NSW-SA': 1400,
  'NSW-WA': 4100,
  'NSW-TAS': 1050,
  'VIC-QLD': 1700,
  'VIC-SA': 730,
  'VIC-WA': 3400,
  'VIC-TAS': 450,
  'QLD-SA': 2000,
  'QLD-WA': 4400,
  'SA-WA': 2700,
};

function getRouteKey(state1: string, state2: string): string {
  return [state1, state2].sort().join('-');
}

function calculateTransport(fromState: string, toState: string): TransportCost {
  if (fromState === toState) {
    return {
      cost: 0,
      type: 'pickup',
      distance: 0,
      estimatedDays: { min: 0, max: 1 },
    };
  }

  const routeKey = getRouteKey(fromState, toState);
  const route = TRANSPORT_ROUTES[routeKey] || { base: 800, perKm: 0.40, daysMin: 5, daysMax: 10 };
  const distance = STATE_DISTANCES[routeKey] || 1500;

  let cost = route.base;
  if (distance <= 1000) {
    cost += distance * route.perKm;
  } else {
    cost += 1000 * route.perKm;
    cost += (distance - 1000) * (route.perKm * 0.7);
  }

  return {
    cost: Math.round(cost),
    type: 'interstate',
    distance,
    estimatedDays: { min: route.daysMin, max: route.daysMax },
  };
}

function calculateStampDuty(state: string, price: number, isEV: boolean = false): number {
  switch (state) {
    case 'NSW':
      if (price <= 44999) return Math.ceil(price / 100) * 3;
      return 1350 + Math.ceil((price - 45000) / 100) * 5;

    case 'VIC':
      if (isEV) return Math.ceil(price / 200) * 8.4;
      if (price <= 80567) return Math.ceil(price / 200) * 8.4;
      if (price <= 100000) {
        return Math.ceil(80567 / 200) * 8.4 + Math.ceil((price - 80567) / 200) * 10.4;
      }
      return Math.round(price * 0.055);

    case 'QLD':
      if (price <= 100000) return Math.round(price * 0.03);
      return 3000 + Math.round((price - 100000) * 0.05);

    case 'SA':
      if (price <= 3000) return Math.round(price * 0.01);
      return 60 + Math.ceil((price - 3000) / 100) * 4;

    case 'WA':
      if (price <= 25000) return Math.round(price * 0.0275);
      if (price <= 50000) return Math.round(price * 0.05);
      return Math.round(price * 0.065);

    case 'TAS':
      if (price <= 34999) return Math.ceil(price / 100) * 3;
      return Math.ceil(price / 100) * 4;

    case 'ACT':
      if (price <= 80000) return Math.round(price * 0.025);
      return 2000 + Math.round((price - 80000) * 0.08);

    case 'NT':
      return Math.round(price * 0.03);

    default:
      return Math.round(price * 0.04);
  }
}

function calculateRegistration(state: string): number {
  const rates: Record<string, number> = {
    NSW: 850,
    VIC: 906,
    QLD: 838,
    SA: 675,
    WA: 886,
    TAS: 626,
    ACT: 1000,
    NT: 790,
  };
  return rates[state] || 850;
}

const ROADWORTHY_COSTS: Record<string, number> = {
  NSW: 150,
  VIC: 180,
  QLD: 120,
  SA: 130,
  WA: 200,
  TAS: 140,
  ACT: 160,
  NT: 100,
};

const handler: Handler = async (event: HandlerEvent) => {
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
    const body = event.httpMethod === 'POST'
      ? JSON.parse(event.body || '{}')
      : event.queryStringParameters || {};

    const {
      vehiclePrice,
      sellerState,
      deliveryState,
      fuelType,
      cylinders = 4,
    } = body;

    if (!vehiclePrice || !sellerState || !deliveryState) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'MISSING_PARAMS',
            message: 'vehiclePrice, sellerState, and deliveryState are required',
          },
        }),
      };
    }

    const price = parseFloat(vehiclePrice);
    const isEV = fuelType === 'electric';
    const needsRoadworthy = sellerState !== deliveryState;

    // Calculate all costs
    const transport = calculateTransport(sellerState, deliveryState);
    const stampDutyAmount = calculateStampDuty(deliveryState, price, isEV);
    const registrationAmount = calculateRegistration(deliveryState);
    const roadworthyCost = needsRoadworthy ? (ROADWORTHY_COSTS[deliveryState] || 150) : 0;

    const totalDelivered = price + transport.cost + stampDutyAmount + registrationAmount + roadworthyCost;

    const breakdown: CostBreakdown = {
      vehiclePrice: price,
      transport,
      stampDuty: {
        amount: stampDutyAmount,
        state: deliveryState,
        effectiveRate: ((stampDutyAmount / price) * 100).toFixed(2) + '%',
      },
      registration: {
        amount: registrationAmount,
        state: deliveryState,
        period: '12 months',
        includesCTP: true,
      },
      roadworthy: {
        required: needsRoadworthy,
        cost: roadworthyCost,
        reason: needsRoadworthy ? 'Interstate transfer requires inspection' : undefined,
      },
      totalDelivered,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: breakdown,
      }),
    };
  } catch (error) {
    console.error('Calculate costs error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'CALCULATION_ERROR',
          message: 'Failed to calculate costs',
        },
      }),
    };
  }
};

export { handler };
