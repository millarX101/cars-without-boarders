/**
 * Australian Registration & CTP Calculator
 * FY25/26 data - All amounts in AUD (GST-inclusive where applicable)
 * Ported from existing JavaScript utility
 */

import type { AustralianState } from '@/lib/types/car';

const round2 = (n: number): number => Math.round(n * 100) / 100;

export interface RegoInput {
  state: AustralianState | string;
  term?: number; // months (3, 6, or 12)
  privateUse?: boolean;
  ev?: boolean;
  vicZone?: 'metro' | 'outer_metro' | 'rural';
  tareKg?: number;
  cylinders?: number;
  saRegion?: 'metro' | 'country';
  gvmLt3t?: boolean;
}

export interface RegoBreakdown {
  state: string;
  term: number;
  includes: string[];
  excludes: string[];
  components: Record<string, number>;
  total: number;
  notes?: string[];
}

/**
 * Calculate registration costs for Australian states
 */
export function calculateRego(input: RegoInput | string): RegoBreakdown | number {
  // Backward compatibility: if called with just a state string, return legacy format
  if (typeof input === 'string') {
    return calculateRegoLegacy(input);
  }

  return calculateRegoEnhanced(input);
}

/**
 * Legacy calculation for backward compatibility
 */
function calculateRegoLegacy(state: string): number {
  const legacyRates: Record<string, number> = {
    VIC: 906.6,
    NSW: 950,
    QLD: 900,
    SA: 800,
    WA: 950,
    TAS: 750,
    ACT: 1000,
    NT: 790,
  };

  return legacyRates[state.toUpperCase()] || 900;
}

/**
 * Enhanced registration calculation with detailed breakdown
 */
function calculateRegoEnhanced(input: RegoInput): RegoBreakdown {
  const {
    state,
    term = 12,
    privateUse = true,
    ev = false,
    vicZone,
    tareKg,
    cylinders,
    saRegion,
    gvmLt3t,
  } = input;

  const monthly = term / 12;
  const stateUpper = state.toUpperCase();

  switch (stateUpper) {
    case 'VIC': {
      const zone = vicZone || 'metro';
      const zoneTotals: Record<string, number> = {
        metro: 906.6,
        outer_metro: 848.4,
        rural: 780.1,
      };
      const base = zoneTotals[zone];
      if (!base) throw new Error('VIC zone required: metro | outer_metro | rural');
      const total = round2(base * monthly);
      return {
        state: 'VIC',
        term,
        includes: ['VicRoads registration', 'TAC charge'],
        excludes: ['number plates (new issues)', 'duty', 'inspection', 'admin misc'],
        components: { rego_plus_TAC: total },
        total,
        notes: ['Passenger vehicle schedule. Use TAC postcode zoning for precision if desired.'],
      };
    }

    case 'NSW': {
      const ctpCost = 475;

      if (!tareKg) {
        const regoFee = 82;
        const mvt = 240;
        const components = {
          rego_fee: round2(regoFee * monthly),
          motor_vehicle_tax: round2(mvt * monthly),
          ctp_green_slip: round2(ctpCost * monthly),
        };
        const total = round2(components.rego_fee + components.motor_vehicle_tax + components.ctp_green_slip);
        return {
          state: 'NSW',
          term,
          includes: ['registration fee', 'motor vehicle tax', 'CTP Green Slip'],
          excludes: ['plate fee (new issues)', 'inspection', 'duty'],
          components,
          total,
          notes: ['Estimated using average tare weight. Provide tareKg for precise calculation.'],
        };
      }

      const regoFee = 82;
      const bands: [number, number, number][] = [
        [254, 73, 73],
        [764, 133, 133],
        [975, 240, 240],
        [1154, 268, 268],
        [1504, 312, 312],
        [2504, 469, 469],
        [2794, 766, 766],
        [4500, 852, 852],
      ];
      const band = bands.find(([max]) => tareKg <= max);
      if (!band) throw new Error('NSW tare out of light-vehicle range');
      const mvt = privateUse ? band[1] : band[2];
      const components = {
        rego_fee: round2(regoFee * monthly),
        motor_vehicle_tax: round2(mvt * monthly),
        ctp_green_slip: round2(ctpCost * monthly),
      };
      const total = round2(components.rego_fee + components.motor_vehicle_tax + components.ctp_green_slip);
      return {
        state: 'NSW',
        term,
        includes: ['registration fee', 'motor vehicle tax', 'CTP Green Slip'],
        excludes: ['plate fee (new issues)', 'inspection', 'duty'],
        components,
        total,
      };
    }

    case 'QLD': {
      const ctpCost = 400;

      if (!cylinders) {
        const regoPlusTraffic = round2(437.9 * monthly);
        const ctpProrated = round2(ctpCost * monthly);
        const components = {
          rego_plus_traffic: regoPlusTraffic,
          ctp: ctpProrated,
        };
        const total = round2(regoPlusTraffic + ctpProrated);
        return {
          state: 'QLD',
          term,
          includes: ['registration fee', 'traffic improvement fee', 'CTP'],
          excludes: ['plate (new issues)', 'duty', 'inspection'],
          components,
          total,
          notes: ['Estimated for 4-cylinder vehicle. Provide cylinders for precise calculation.'],
        };
      }

      const c = cylinders;
      const map =
        c <= 3 ? 358.25 : c === 4 ? 437.9 : c <= 6 ? 655.35 : c <= 8 ? 891.8 : 1034.7;
      const regoPlusTraffic = round2(map * monthly);
      const ctpProrated = round2(ctpCost * monthly);
      const components = {
        rego_plus_traffic: regoPlusTraffic,
        ctp: ctpProrated,
      };
      const total = round2(regoPlusTraffic + ctpProrated);
      return {
        state: 'QLD',
        term,
        includes: ['registration fee', 'traffic improvement fee', 'CTP'],
        excludes: ['plate (new issues)', 'duty', 'inspection'],
        components,
        total,
      };
    }

    case 'SA': {
      if (!cylinders && !ev) {
        const total = round2(675 * monthly);
        return {
          state: 'SA',
          term,
          includes: ['registration', 'CTP estimate', 'LSS/ESL where applicable'],
          excludes: ['duty', 'inspection'],
          components: { rego_package: total },
          total,
          notes: [
            'Estimated for 4-cylinder metro vehicle. Provide cylinders or ev=true for precise calculation.',
          ],
        };
      }

      const region = saRegion || 'metro';
      let annual = 0;

      if (ev || (cylinders && cylinders <= 4)) {
        annual = region === 'metro' ? 675 : 575;
      } else if (cylinders && cylinders <= 6) {
        annual = region === 'metro' ? 840 : 735;
      } else {
        annual = region === 'metro' ? 980 : 870;
      }

      const total = round2(annual * monthly);
      return {
        state: 'SA',
        term,
        includes: ['registration', 'CTP estimate', 'LSS/ESL where applicable'],
        excludes: ['duty', 'inspection'],
        components: { rego_package: total },
        total,
        notes: ['Tables are rounded guide; SA calculator yields exact insurer MAI.'],
      };
    }

    case 'WA': {
      const miiCost = 450;

      if (!tareKg) {
        const defaultTareKg = 1500;
        const per100 = 28.64;
        const rounded100 = Math.ceil(defaultTareKg / 100) * 100;
        const licence = per100 * (rounded100 / 100);
        const flatFee12m = 6.6;
        const licenceProrated = round2(licence * monthly);
        const flatProrated = round2(flatFee12m * monthly);
        const miiProrated = round2(miiCost * monthly);
        const components = {
          licence_fee: licenceProrated,
          prescribed_flat_fee: flatProrated,
          motor_injury_insurance: miiProrated,
        };
        const total = round2(
          components.licence_fee + components.prescribed_flat_fee + components.motor_injury_insurance
        );
        return {
          state: 'WA',
          term,
          includes: ['licence fee', 'prescribed flat fee', 'Motor Injury Insurance (MII)'],
          excludes: ['plates', 'duty', 'inspection'],
          components,
          total,
          notes: ['Estimated for 1500kg vehicle. Provide tareKg for precise calculation.'],
        };
      }

      const per100 = 28.64;
      const rounded100 = Math.ceil(tareKg / 100) * 100;
      const licence = per100 * (rounded100 / 100);
      const flatFee12m = 6.6;
      const licenceProrated = round2(licence * monthly);
      const flatProrated = round2(flatFee12m * monthly);
      const miiProrated = round2(miiCost * monthly);
      const components = {
        licence_fee: licenceProrated,
        prescribed_flat_fee: flatProrated,
        motor_injury_insurance: miiProrated,
      };
      const total = round2(
        components.licence_fee + components.prescribed_flat_fee + components.motor_injury_insurance
      );
      return {
        state: 'WA',
        term,
        includes: ['licence fee', 'prescribed flat fee', 'Motor Injury Insurance (MII)'],
        excludes: ['plates', 'duty', 'inspection'],
        components,
        total,
      };
    }

    case 'TAS': {
      const lt3 = gvmLt3t !== false;
      let annual = 0;

      if (!cylinders && !ev) {
        annual = 625.66;
      } else if (lt3) {
        if (ev) annual = 625.66;
        else if (!cylinders || cylinders <= 3) annual = 601.66;
        else if (cylinders === 4) annual = 625.66;
        else if (cylinders <= 6) annual = 667.66;
        else if (cylinders <= 8) annual = 744.66;
        else annual = 779.66;
      } else {
        if (!cylinders || cylinders <= 4) annual = 779.66;
        else if (cylinders <= 6) annual = 830.66;
        else if (cylinders <= 8) annual = 885.66;
        else annual = 938.66;
      }

      const total = round2(annual * monthly);
      return {
        state: 'TAS',
        term,
        includes: ['registration', 'MAIB premium', 'levies'],
        excludes: ['duty', 'inspection', 'plates (new issues)'],
        components: { rego_package: total },
        total,
        notes:
          cylinders || ev
            ? []
            : ['Estimated for 4-cylinder <3t vehicle. Provide cylinders or ev=true for precise calculation.'],
      };
    }

    case 'ACT': {
      const maiCost = 500;
      const estimatedRego = 500;

      const regoProrated = round2(estimatedRego * monthly);
      const maiProrated = round2(maiCost * monthly);
      const components = {
        estimated_rego: regoProrated,
        motor_accident_insurance: maiProrated,
      };
      const total = round2(regoProrated + maiProrated);

      return {
        state: 'ACT',
        term,
        includes: ['estimated registration', 'Motor Accident Insurance (MAI)'],
        excludes: ['plates', 'duty', 'inspection'],
        components,
        total,
        notes: [
          'ACT uses emissions-based fees by CO2 band, weight, and use. Precise calculation requires ACT calculator.',
        ],
      };
    }

    case 'NT': {
      return {
        state: 'NT',
        term,
        includes: ['registration', 'CTPI (Compulsory Third Party Insurance)'],
        excludes: ['plates', 'duty', 'inspection'],
        components: { estimated_rego: round2(790 * monthly) },
        total: round2(790 * monthly),
        notes: ['NT bundles CTPI in rego. Use MVR schedule by vehicle class to compute accurately.'],
      };
    }

    default:
      throw new Error(`Unsupported state: ${state}`);
  }
}

export const STATES: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'];
export const TERMS = [3, 6, 12];

/**
 * Helper function to create input object for enhanced calculation
 */
export function createRegoInput(params: Partial<RegoInput> & { state: string }): RegoInput {
  return {
    term: 12,
    privateUse: true,
    ev: false,
    vicZone: 'metro',
    saRegion: 'metro',
    gvmLt3t: true,
    ...params,
  };
}

/**
 * Compare registration costs across all states
 */
export function compareRegoAcrossStates(
  ev = false,
  cylinders = 4
): Array<{
  state: string;
  annual: number;
  monthly: number;
}> {
  return STATES.map((state) => {
    const result = calculateRego({
      state,
      term: 12,
      ev,
      cylinders,
    });

    const total = typeof result === 'number' ? result : result.total;

    return {
      state,
      annual: Math.round(total),
      monthly: Math.round(total / 12),
    };
  }).sort((a, b) => a.annual - b.annual);
}
