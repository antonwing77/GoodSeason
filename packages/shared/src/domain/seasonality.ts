import type { Seasonality, FoodCardData } from '../types';

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
