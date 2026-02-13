import type { GhgFactor, QualityScore } from '../types';

/**
 * Factor selection logic: picks the best GHG factor for a given food + user region.
 *
 * Priority:
 *   1) Region-specific (user country/admin region)
 *   2) Continent-level
 *   3) Global average
 *
 * Returns the selected factor and the resolution path taken.
 */

const CONTINENT_MAP: Record<string, string> = {
  // Map country codes to continent codes
  US: 'NA', CA: 'NA', MX: 'NA',
  GB: 'EU', FR: 'EU', DE: 'EU', IT: 'EU', ES: 'EU', NL: 'EU', BE: 'EU',
  SE: 'EU', NO: 'EU', DK: 'EU', FI: 'EU', PL: 'EU', PT: 'EU', AT: 'EU',
  CH: 'EU', IE: 'EU', GR: 'EU', CZ: 'EU', RO: 'EU', HU: 'EU',
  CN: 'AS', JP: 'AS', KR: 'AS', IN: 'AS', TH: 'AS', VN: 'AS', ID: 'AS',
  PH: 'AS', MY: 'AS', SG: 'AS', TW: 'AS', BD: 'AS', PK: 'AS',
  BR: 'SA', AR: 'SA', CL: 'SA', CO: 'SA', PE: 'SA',
  AU: 'OC', NZ: 'OC',
  ZA: 'AF', NG: 'AF', KE: 'AF', ET: 'AF', EG: 'AF', MA: 'AF', GH: 'AF',
};

export type ResolutionLevel = 'region' | 'continent' | 'global';

export interface FactorSelection {
  factor: GhgFactor;
  resolution: ResolutionLevel;
  quality: QualityScore;
}

export function selectBestFactor(
  factors: GhgFactor[],
  userRegionCode: string
): FactorSelection | null {
  if (factors.length === 0) return null;

  // 1) Try exact region match
  const regionMatch = factors.find(
    (f) => f.region_code.toUpperCase() === userRegionCode.toUpperCase()
  );
  if (regionMatch) {
    return {
      factor: regionMatch,
      resolution: 'region',
      quality: regionMatch.quality_score,
    };
  }

  // 2) Try continent match
  const continent = CONTINENT_MAP[userRegionCode.toUpperCase()];
  if (continent) {
    const continentMatch = factors.find(
      (f) => f.region_code.toUpperCase() === continent
    );
    if (continentMatch) {
      return {
        factor: continentMatch,
        resolution: 'continent',
        quality: continentMatch.quality_score,
      };
    }
  }

  // 3) Fall back to global average
  const globalMatch = factors.find(
    (f) => f.region_code.toUpperCase() === 'GLOBAL'
  );
  if (globalMatch) {
    return {
      factor: globalMatch,
      resolution: 'global',
      quality: globalMatch.quality_score,
    };
  }

  // Last resort: return first factor
  return {
    factor: factors[0],
    resolution: 'global',
    quality: 'low',
  };
}

export function getContinentForCountry(countryCode: string): string | null {
  return CONTINENT_MAP[countryCode.toUpperCase()] ?? null;
}
