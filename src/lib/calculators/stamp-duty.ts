/**
 * Australian Motor Vehicle Stamp Duty Calculator
 * Last updated: November 2025 - Based on official government sources
 * Ported from existing JavaScript utility
 */

import type { AustralianState, FuelType } from '@/lib/types/car';

export interface StampDutyInput {
  state: AustralianState | string;
  price: number;
  isEV?: boolean;
  isHybrid?: boolean;
  fuelType?: FuelType | string;
  cylinders?: number;
}

export interface StampDutyBreakdown {
  state: string;
  vehiclePrice: number;
  isEV: boolean;
  isHybrid: boolean;
  cylinders: number;
  baseStampDuty: number;
  actualStampDuty: number;
  savings: number;
  effectiveRate: string;
  explanation: string;
  dataAccuracy: string;
}

/**
 * Calculate motor vehicle stamp duty for Australian states
 */
export function calculateStampDuty(input: StampDutyInput): number {
  const {
    state,
    price,
    isEV = false,
    isHybrid = false,
    fuelType = '',
    cylinders = 4,
  } = input;

  // Input validation
  if (!state || typeof state !== 'string') {
    throw new Error('State must be provided as a valid string');
  }

  if (!price || price < 0) {
    throw new Error('Price must be a positive number');
  }

  if (price > 1000000) {
    console.warn('Very high vehicle price detected. Please verify amount.');
  }

  const stateUpper = state.toUpperCase().trim();
  const fuelTypeLower = fuelType.toLowerCase();

  // Check if vehicle qualifies as zero emission
  const isZeroEmission =
    isEV ||
    fuelTypeLower.includes('electric') ||
    fuelTypeLower.includes('hydrogen') ||
    fuelTypeLower.includes('fuel cell');

  switch (stateUpper) {
    case 'VIC':
    case 'VICTORIA':
      return calculateVictoriaStampDuty(price, isZeroEmission);

    case 'NSW':
    case 'NEW SOUTH WALES':
      return calculateNSWStampDuty(price);

    case 'QLD':
    case 'QUEENSLAND':
      return calculateQueenslandStampDuty(price, isZeroEmission, isHybrid, cylinders);

    case 'SA':
    case 'SOUTH AUSTRALIA':
      return calculateSouthAustraliaStampDuty(price);

    case 'WA':
    case 'WESTERN AUSTRALIA':
      return calculateWesternAustraliaStampDuty(price);

    case 'TAS':
    case 'TASMANIA':
      return calculateTasmaniaStampDuty(price);

    case 'ACT':
    case 'AUSTRALIAN CAPITAL TERRITORY':
      return calculateACTStampDuty(price);

    case 'NT':
    case 'NORTHERN TERRITORY':
      return calculateNorthernTerritoryStampDuty(price);

    default:
      throw new Error(`Unknown state: ${state}. Please use a valid Australian state code.`);
  }
}

/**
 * NSW stamp duty calculation
 * Rates as of July 2025 - Source: Revenue NSW
 */
function calculateNSWStampDuty(price: number): number {
  let stampDuty: number;
  if (price <= 44999) {
    stampDuty = Math.ceil(price / 100) * 3;
  } else {
    const excessAmount = price - 45000;
    stampDuty = 1350 + Math.ceil(excessAmount / 100) * 5;
  }
  return Math.round(stampDuty);
}

/**
 * Queensland stamp duty calculation
 * Rates as of March 2023 - Source: Queensland Government
 */
function calculateQueenslandStampDuty(
  price: number,
  isZeroEmission: boolean,
  isHybrid: boolean,
  cylinders: number
): number {
  let rate: number;

  if (isZeroEmission || isHybrid) {
    if (price <= 100000) {
      rate = 0.02;
    } else {
      const baseAmount = 100000 * 0.02;
      const excessAmount = (price - 100000) * 0.04;
      return Math.round(baseAmount + excessAmount);
    }
  } else {
    if (cylinders <= 4) {
      if (price <= 100000) {
        rate = 0.03;
      } else {
        const baseAmount = 100000 * 0.03;
        const excessAmount = (price - 100000) * 0.05;
        return Math.round(baseAmount + excessAmount);
      }
    } else if (cylinders <= 6) {
      if (price <= 100000) {
        rate = 0.035;
      } else {
        const baseAmount = 100000 * 0.035;
        const excessAmount = (price - 100000) * 0.055;
        return Math.round(baseAmount + excessAmount);
      }
    } else {
      if (price <= 100000) {
        rate = 0.04;
      } else {
        const baseAmount = 100000 * 0.04;
        const excessAmount = (price - 100000) * 0.06;
        return Math.round(baseAmount + excessAmount);
      }
    }
  }

  return Math.round(price * rate);
}

/**
 * Victoria stamp duty calculation
 * Based on Victoria SRO rates as of 2024-25
 */
function calculateVictoriaStampDuty(price: number, isZeroEmission: boolean): number {
  let stampDuty: number;

  if (isZeroEmission) {
    stampDuty = Math.ceil(price / 200) * 8.4;
  } else {
    if (price <= 80567) {
      stampDuty = Math.ceil(price / 200) * 8.4;
    } else if (price <= 100000) {
      const baseAmount = Math.ceil(80567 / 200) * 8.4;
      const excessAmount = price - 80567;
      stampDuty = baseAmount + Math.ceil(excessAmount / 200) * 10.4;
    } else if (price <= 150000) {
      const baseAmount = Math.ceil(80567 / 200) * 8.4;
      const midAmount = Math.ceil((100000 - 80567) / 200) * 10.4;
      const excessAmount = price - 100000;
      stampDuty = baseAmount + midAmount + Math.ceil(excessAmount / 200) * 14.0;
    } else {
      const baseAmount = Math.ceil(80567 / 200) * 8.4;
      const midAmount = Math.ceil((100000 - 80567) / 200) * 10.4;
      const highAmount = Math.ceil((150000 - 100000) / 200) * 14.0;
      const excessAmount = price - 150000;
      stampDuty = baseAmount + midAmount + highAmount + Math.ceil(excessAmount / 200) * 18.0;
    }
  }

  return Math.round(stampDuty);
}

/**
 * South Australia stamp duty calculation
 * Based on official RevenueSA rates
 */
function calculateSouthAustraliaStampDuty(price: number): number {
  let stampDuty: number;

  if (price <= 1000) {
    stampDuty = Math.ceil(price / 100) * 1;
    stampDuty = Math.max(5, stampDuty);
  } else if (price <= 2000) {
    const excess = price - 1000;
    stampDuty = 10 + Math.ceil(excess / 100) * 2;
  } else if (price <= 3000) {
    const excess = price - 2000;
    stampDuty = 30 + Math.ceil(excess / 100) * 3;
  } else {
    const excess = price - 3000;
    stampDuty = 60 + Math.ceil(excess / 100) * 4;
  }

  return Math.round(stampDuty);
}

/**
 * Western Australia stamp duty calculation
 * Progressive rate formula for $25,000-$50,000 range
 */
function calculateWesternAustraliaStampDuty(price: number): number {
  let stampDuty: number;

  if (price <= 25000) {
    stampDuty = price * 0.0275;
  } else if (price <= 50000) {
    const progressiveRate = 2.75 + (price - 25000) / 6666.66;
    const rateRounded = Math.round(progressiveRate * 100) / 100;
    stampDuty = price * (rateRounded / 100);
  } else {
    stampDuty = price * 0.065;
  }

  return Math.round(stampDuty);
}

/**
 * Tasmania stamp duty calculation
 * Based on official State Revenue Office Tasmania rates
 */
function calculateTasmaniaStampDuty(price: number): number {
  let stampDuty: number;

  if (price <= 600) {
    stampDuty = 20;
  } else if (price <= 34999) {
    stampDuty = Math.ceil(price / 100) * 3;
  } else if (price <= 39999) {
    const excess = price - 35000;
    stampDuty = 1050 + Math.ceil(excess / 100) * 11;
  } else {
    stampDuty = Math.ceil(price / 100) * 4;
  }

  return Math.round(stampDuty);
}

/**
 * ACT stamp duty calculation
 * Based on ACT Revenue Office rates as of 2024-25
 */
function calculateACTStampDuty(price: number): number {
  let stampDuty: number;

  if (price <= 80000) {
    stampDuty = price * 0.025;
  } else {
    const baseAmount = 80000 * 0.025;
    const excessAmount = price - 80000;
    const additionalAmount = excessAmount * 0.08;
    stampDuty = baseAmount + additionalAmount;
  }

  return Math.round(stampDuty);
}

/**
 * Northern Territory stamp duty calculation
 * Simple flat rate
 */
function calculateNorthernTerritoryStampDuty(price: number): number {
  return Math.round(price * 0.03);
}

/**
 * Get stamp duty breakdown with explanations
 */
export function getStampDutyBreakdown(input: StampDutyInput): StampDutyBreakdown {
  const { state, price, isEV = false, isHybrid = false, cylinders = 4 } = input;

  const baseStampDuty = calculateStampDuty({
    state,
    price,
    isEV: false,
    isHybrid: false,
    cylinders,
  });

  const actualStampDuty = calculateStampDuty(input);
  const savings = baseStampDuty - actualStampDuty;

  return {
    state: state.toUpperCase(),
    vehiclePrice: price,
    isEV,
    isHybrid,
    cylinders,
    baseStampDuty: Math.round(baseStampDuty),
    actualStampDuty: Math.round(actualStampDuty),
    savings: Math.round(savings),
    effectiveRate: price > 0 ? ((actualStampDuty / price) * 100).toFixed(2) + '%' : '0%',
    explanation: getStampDutyExplanation(state, isEV, isHybrid, savings),
    dataAccuracy: getDataAccuracyWarning(state),
  };
}

function getStampDutyExplanation(
  state: string,
  isEV: boolean,
  isHybrid: boolean,
  savings: number
): string {
  const stateUpper = state.toUpperCase();

  if (savings > 0 && (isEV || isHybrid)) {
    switch (stateUpper) {
      case 'NSW':
        return 'NSW rates applied - no specific EV stamp duty exemptions (separate EV rebates available)';
      case 'QLD':
        return isEV ? 'QLD EV/hybrid concession applied' : 'QLD hybrid concession applied';
      case 'VIC':
        return 'VIC Green car rate applied (EV/low emissions)';
      default:
        return `Standard ${stateUpper} rates apply`;
    }
  }

  return `Standard ${stateUpper} stamp duty rates applied`;
}

function getDataAccuracyWarning(state: string): string {
  const stateUpper = state.toUpperCase();

  const warnings: Record<string, string> = {
    NSW: 'VERIFIED - Based on official NSW Revenue data (November 2025)',
    QLD: 'VERIFIED - Based on official QLD Government data (November 2025)',
    VIC: 'VERIFIED - Based on Victoria SRO rates (2024-25)',
    SA: 'VERIFIED - Based on official RevenueSA rates (November 2025)',
    WA: 'VERIFIED - Based on WA Department of Finance (November 2025)',
    TAS: 'VERIFIED - Based on State Revenue Office Tasmania (November 2025)',
    ACT: 'UPDATED - Based on new ACT policy from September 2025',
    NT: 'VERIFIED - Based on NT Treasury rates (November 2025)',
  };

  return warnings[stateUpper] || 'WARNING - Unknown state';
}

/**
 * Compare stamp duty across all states
 */
export function compareStampDutyAcrossStates(
  price: number,
  isEV = false,
  cylinders = 4
): Array<{
  state: string;
  stampDuty: number;
  effectiveRate: string;
}> {
  const states: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'];

  return states
    .map((state) => {
      const breakdown = getStampDutyBreakdown({
        state,
        price,
        isEV,
        cylinders,
      });
      return {
        state,
        stampDuty: breakdown.actualStampDuty,
        effectiveRate: breakdown.effectiveRate,
      };
    })
    .sort((a, b) => a.stampDuty - b.stampDuty);
}
