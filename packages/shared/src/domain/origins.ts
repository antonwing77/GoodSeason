/**
 * Origins algorithm: select likely origin data for a food in a destination region.
 *
 * Uses Comtrade-derived origin distributions. If no data is available,
 * returns null (not displayed) rather than invented data.
 */
import type { Origin, WaterRisk, WaterRiskBucket } from '../types';

export interface OriginSelection {
  origins: Origin[];
  quality: 'high' | 'medium' | 'low';
  explanation: string;
}

/**
 * Select origin entries for a food item, optionally joining water risk data.
 * Strict rule: if no cited origins exist, return null.
 */
export function selectOrigins(
  allOrigins: Origin[],
  foodId: string,
  destinationRegionCode: string
): OriginSelection | null {
  const regionCode = destinationRegionCode.toUpperCase();
  const countryCode = regionCode.split('-')[0];

  // Exact destination match
  const exactMatch = allOrigins.filter(
    (o) => o.food_id === foodId && o.destination_region_code.toUpperCase() === regionCode
  );
  if (exactMatch.length > 0) {
    return {
      origins: exactMatch.sort((a, b) => b.probability - a.probability),
      quality: 'medium',
      explanation: `Origin data available for ${regionCode} imports of this food.`,
    };
  }

  // Country fallback
  if (regionCode !== countryCode) {
    const countryMatch = allOrigins.filter(
      (o) => o.food_id === foodId && o.destination_region_code.toUpperCase() === countryCode
    );
    if (countryMatch.length > 0) {
      return {
        origins: countryMatch.sort((a, b) => b.probability - a.probability),
        quality: 'medium',
        explanation: `Using ${countryCode}-level origin data (state-level not available).`,
      };
    }
  }

  // No data — do not invent
  return null;
}

/**
 * Join an origin's region code to water risk data to create water-risk badges.
 */
export function getOriginWaterRisk(
  originRegionCode: string,
  waterRiskData: WaterRisk[]
): { bucket: WaterRiskBucket; score: number } | null {
  const match = waterRiskData.find(
    (w) => w.region_code.toUpperCase() === originRegionCode.toUpperCase()
  );
  if (!match) return null;
  return { bucket: match.bucket, score: match.score };
}
