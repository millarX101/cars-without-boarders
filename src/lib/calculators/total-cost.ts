/**
 * Total Delivered Cost Calculator
 * Combines transport, stamp duty, registration, and roadworthy costs
 */

import type { AustralianState, FuelType, CostBreakdown } from '@/lib/types/car';
import { calculateStampDuty } from './stamp-duty';
import { calculateRego, createRegoInput, type RegoBreakdown } from './registration';
import { calculateTransport } from './transport';

export interface TotalCostInput {
  vehiclePrice: number;
  sellerState: AustralianState;
  sellerPostcode?: string;
  deliveryState: AustralianState;
  deliveryPostcode?: string;
  fuelType?: FuelType;
  cylinders?: number;
  isNewCar?: boolean;
}

export interface TotalCostResult {
  vehiclePrice: number;
  breakdown: CostBreakdown;
  totalDelivered: number;
  comparison?: {
    localAveragePrice?: number;
    savingsVsLocal?: number;
  };
}

// Interstate inspection/roadworthy costs by destination state
const INTERSTATE_INSPECTION_COSTS: Record<string, { name: string; cost: number }> = {
  NSW: { name: 'Blue Slip', cost: 150 },
  VIC: { name: 'RWC + VicRoads Check', cost: 180 },
  QLD: { name: 'Safety Certificate', cost: 120 },
  SA: { name: 'Vehicle Identity Check', cost: 130 },
  WA: { name: 'Vehicle Examination', cost: 200 },
  TAS: { name: 'Vehicle Inspection', cost: 140 },
  ACT: { name: 'Vehicle Inspection', cost: 160 },
  NT: { name: 'Roadworthy Certificate', cost: 100 },
};

/**
 * Calculate total delivered cost for a vehicle
 */
export function calculateTotalDeliveredCost(input: TotalCostInput): TotalCostResult {
  const {
    vehiclePrice,
    sellerState,
    deliveryState,
    fuelType,
    cylinders = 4,
  } = input;

  // 1. Transport Cost
  const transportResult = calculateTransport({
    fromState: sellerState,
    toState: deliveryState,
  });

  // 2. Stamp Duty (buyer's state)
  const isEV = fuelType === 'electric';
  const isHybrid = fuelType === 'hybrid' || fuelType === 'plug-in-hybrid';

  const stampDutyAmount = calculateStampDuty({
    state: deliveryState,
    price: vehiclePrice,
    isEV,
    isHybrid,
    fuelType,
    cylinders,
  });

  // 3. Registration + CTP (buyer's state)
  const regoInput = createRegoInput({
    state: deliveryState,
    term: 12,
    privateUse: true,
    ev: isEV,
    cylinders,
  });

  const regoResult = calculateRego(regoInput);
  const registrationAmount =
    typeof regoResult === 'number' ? regoResult : (regoResult as RegoBreakdown).total;

  // 4. Roadworthy/Inspection (if interstate)
  const needsRoadworthy = sellerState !== deliveryState;
  const roadworthyInfo = INTERSTATE_INSPECTION_COSTS[deliveryState] || {
    name: 'Inspection',
    cost: 150,
  };
  const roadworthyCost = needsRoadworthy ? roadworthyInfo.cost : 0;

  // 5. Calculate total
  const totalDelivered =
    vehiclePrice +
    transportResult.cost +
    stampDutyAmount +
    registrationAmount +
    roadworthyCost;

  // Build breakdown
  const breakdown: CostBreakdown = {
    vehiclePrice,
    transport: {
      cost: transportResult.cost,
      distance: transportResult.distance,
      type: transportResult.type,
      estimatedDays: transportResult.estimatedDays,
    },
    stampDuty: {
      amount: stampDutyAmount,
      state: deliveryState,
      effectiveRate: ((stampDutyAmount / vehiclePrice) * 100).toFixed(2) + '%',
      isEVDiscount: isEV,
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
      reason: needsRoadworthy
        ? `Interstate transfer requires ${roadworthyInfo.name}`
        : undefined,
    },
    totalDelivered,
  };

  return {
    vehiclePrice,
    breakdown,
    totalDelivered,
  };
}

/**
 * Calculate and compare costs for a car to multiple delivery locations
 */
export function compareDeliveryCosts(
  vehiclePrice: number,
  sellerState: AustralianState,
  fuelType?: FuelType,
  cylinders?: number
): Array<{
  deliveryState: AustralianState;
  totalDelivered: number;
  breakdown: {
    transport: number;
    stampDuty: number;
    registration: number;
    roadworthy: number;
  };
}> {
  const states: AustralianState[] = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'];

  return states
    .map((deliveryState) => {
      const result = calculateTotalDeliveredCost({
        vehiclePrice,
        sellerState,
        deliveryState,
        fuelType,
        cylinders,
      });

      return {
        deliveryState,
        totalDelivered: result.totalDelivered,
        breakdown: {
          transport: result.breakdown.transport.cost,
          stampDuty: result.breakdown.stampDuty.amount,
          registration: result.breakdown.registration.amount,
          roadworthy: result.breakdown.roadworthy.cost,
        },
      };
    })
    .sort((a, b) => a.totalDelivered - b.totalDelivered);
}

/**
 * Quick estimate of additional costs on top of vehicle price
 */
export function estimateAdditionalCosts(
  vehiclePrice: number,
  sellerState: AustralianState,
  deliveryState: AustralianState
): {
  additionalCosts: number;
  percentage: string;
} {
  const result = calculateTotalDeliveredCost({
    vehiclePrice,
    sellerState,
    deliveryState,
  });

  const additionalCosts = result.totalDelivered - vehiclePrice;
  const percentage = ((additionalCosts / vehiclePrice) * 100).toFixed(1) + '%';

  return {
    additionalCosts,
    percentage,
  };
}

/**
 * Determine if buying from interstate is worth it
 */
export function analyzeInterstatePurchase(
  localPrice: number,
  localState: AustralianState,
  interstatePrice: number,
  interstateState: AustralianState,
  fuelType?: FuelType,
  cylinders?: number
): {
  worthIt: boolean;
  localTotalCost: number;
  interstateTotalCost: number;
  savings: number;
  savingsPercentage: string;
  recommendation: string;
} {
  // Calculate local purchase cost
  const localResult = calculateTotalDeliveredCost({
    vehiclePrice: localPrice,
    sellerState: localState,
    deliveryState: localState,
    fuelType,
    cylinders,
  });

  // Calculate interstate purchase cost
  const interstateResult = calculateTotalDeliveredCost({
    vehiclePrice: interstatePrice,
    sellerState: interstateState,
    deliveryState: localState,
    fuelType,
    cylinders,
  });

  const savings = localResult.totalDelivered - interstateResult.totalDelivered;
  const savingsPercentage = ((savings / localResult.totalDelivered) * 100).toFixed(1) + '%';
  const worthIt = savings > 500; // Minimum $500 savings to be worthwhile

  let recommendation: string;
  if (savings > 2000) {
    recommendation = `Strong buy from ${interstateState} - save ${savingsPercentage}`;
  } else if (savings > 500) {
    recommendation = `Consider buying from ${interstateState} - save ${savingsPercentage}`;
  } else if (savings > 0) {
    recommendation = `Marginal savings - factor in convenience of local purchase`;
  } else {
    recommendation = `Buy locally in ${localState} - interstate is ${savingsPercentage} more expensive`;
  }

  return {
    worthIt,
    localTotalCost: localResult.totalDelivered,
    interstateTotalCost: interstateResult.totalDelivered,
    savings,
    savingsPercentage,
    recommendation,
  };
}
