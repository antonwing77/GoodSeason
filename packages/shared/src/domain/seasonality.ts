import type { Seasonality, FoodCardData } from '../types';
import { estimateClimateZone } from './location';

/**
 * Determines if heated-greenhouse production is likely for a given food/region/month.
 *
 * Heuristic: If a warm-season crop (tomato, pepper, cucumber, etc.) is being
 * produced in a cold-climate region during winter months, greenhouse heating
 * is likely required. This is flagged as a badge with citation to
 * Theurl et al. 2014 / Hospido et al. 2009 on greenhouse vs imported produce.
 */

const WARM_SEASON_CROPS = new Set([
  'tomato', 'pepper', 'bell_pepper', 'cucumber', 'zucchini',
  'eggplant', 'strawberry', 'green_bean', 'lettuce', 'basil',
  'melon', 'watermelon',
]);

// Köppen climate zones where winter heating is likely needed
const COLD_WINTER_ZONES = new Set([
  'Dfa', 'Dfb', 'Dfc', 'Dfd', // Continental (humid, severe winter)
  'Dwa', 'Dwb', 'Dwc', 'Dwd', // Continental (dry winter)
  'Dsa', 'Dsb', 'Dsc',         // Continental (dry summer)
  'ET', 'EF',                   // Polar
]);

// Northern hemisphere winter months
const WINTER_MONTHS_NH = new Set([11, 12, 1, 2, 3]);
// Southern hemisphere winter months
const WINTER_MONTHS_SH = new Set([5, 6, 7, 8, 9]);

export function isHeatedGreenhouseLikely(
  foodName: string,
  climateZone: string,
  month: number,
  latitude: number
): boolean {
  const normalizedName = foodName.toLowerCase().replace(/\s+/g, '_');

  if (!WARM_SEASON_CROPS.has(normalizedName)) return false;
  if (!COLD_WINTER_ZONES.has(climateZone)) return false;

  const winterMonths = latitude >= 0 ? WINTER_MONTHS_NH : WINTER_MONTHS_SH;
  return winterMonths.has(month);
}

/**
 * Compute "best months" for a food in a region based on seasonality records.
 * Returns sorted array of months (1–12) where in_season_probability > threshold.
 */
export function getBestMonths(
  seasonalityRecords: Seasonality[],
  threshold: number = 0.5
): number[] {
  return seasonalityRecords
    .filter((s) => s.in_season_probability >= threshold)
    .sort((a, b) => b.in_season_probability - a.in_season_probability)
    .map((s) => s.month);
}

/**
 * Rank foods for "best this month" recommendations.
 *
 * Scoring:
 *   - In-season probability (weight: 0.5)
 *   - Lower CO2e within category (weight: 0.35)
 *   - Water-risk penalty (weight: 0.15, soft)
 */
export function rankForMonth(items: FoodCardData[]): FoodCardData[] {
  if (items.length === 0) return [];

  // Normalize CO2e values for scoring
  const maxCo2e = Math.max(...items.map((i) => i.ghg.value_mid));
  const minCo2e = Math.min(...items.map((i) => i.ghg.value_mid));
  const co2eRange = maxCo2e - minCo2e || 1;

  const scored = items.map((item) => {
    const seasonScore = item.seasonality?.in_season_probability ?? 0;
    const co2eScore = 1 - (item.ghg.value_mid - minCo2e) / co2eRange;
    const waterPenalty = item.water_risk?.bucket === 'high' || item.water_risk?.bucket === 'extremely_high'
      ? 0.3
      : item.water_risk?.bucket === 'medium_high'
        ? 0.15
        : 0;

    const score = seasonScore * 0.5 + co2eScore * 0.35 - waterPenalty * 0.15;
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.item);
}

/**
 * Get month name from number (1–12).
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[(month - 1) % 12];
}

const US_REGION_FALLBACKS: Record<string, string> = {
  AL: 'US-SE', AR: 'US-SE', FL: 'US-SE', GA: 'US-SE', KY: 'US-SE', LA: 'US-SE',
  MS: 'US-SE', NC: 'US-SE', SC: 'US-SE', TN: 'US-SE', VA: 'US-SE', WV: 'US-SE',
  CA: 'US-W', OR: 'US-W', WA: 'US-W', NV: 'US-W', AZ: 'US-W', UT: 'US-W', CO: 'US-W',
  NY: 'US-NE', MA: 'US-NE', VT: 'US-NE', NH: 'US-NE', ME: 'US-NE', RI: 'US-NE', CT: 'US-NE', NJ: 'US-NE', PA: 'US-NE',
  IL: 'US-MW', IN: 'US-MW', IA: 'US-MW', KS: 'US-MW', MI: 'US-MW', MN: 'US-MW', MO: 'US-MW', NE: 'US-MW', ND: 'US-MW', OH: 'US-MW', SD: 'US-MW', WI: 'US-MW',
  TX: 'US-SW', NM: 'US-SW', OK: 'US-SW',
};

interface SeasonalitySelection {
  record: Seasonality | null;
  fallback_note?: string;
}

export function selectSeasonalityRecord(
  records: Seasonality[],
  regionCode: string,
  month: number,
  lat?: number,
  lon?: number
): SeasonalitySelection {
  const map = new Map(records.map((r) => [`${r.region_code}:${r.month}`, r]));
  const normalizedRegion = regionCode.toUpperCase();
  const countryCode = normalizedRegion.split('-')[0];

  const exact = map.get(`${normalizedRegion}:${month}`);
  if (exact) return { record: exact };

  if (normalizedRegion.startsWith('US-')) {
    const state = normalizedRegion.replace('US-', '');
    const fallbackRegion = US_REGION_FALLBACKS[state];
    if (fallbackRegion) {
      const usRegional = map.get(`${fallbackRegion}:${month}`);
      if (usRegional) {
        return {
          record: usRegional,
          fallback_note: `Using ${fallbackRegion.replace('US-', '')} US region fallback (state-level calendar unavailable).`,
        };
      }
    }
  }

  const country = map.get(`${countryCode}:${month}`);
  if (country) {
    return {
      record: country,
      fallback_note: `Using ${countryCode} country-level seasonality fallback.`,
    };
  }

  if (typeof lat === 'number' && typeof lon === 'number') {
    const climate = estimateClimateZone(lat, lon);
    const climateRecord = map.get(`CLIMATE:${climate}:${month}`);
    if (climateRecord) {
      return {
        record: climateRecord,
        fallback_note: `Using climate-zone fallback (${climate}) for this location.`,
      };
    }
  }

  const global = map.get(`GLOBAL:${month}`) ?? null;
  return {
    record: global,
    fallback_note: global ? 'Using global seasonality baseline.' : 'No seasonality data with citation for this month/location.',
  };
}
