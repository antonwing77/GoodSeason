import type { GhgFactor, QualityScore } from '../types';

const CONTINENT_MAP: Record<string, string> = {
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
  explanation: string;
}

function isSystemCodeAllowed(factor: GhgFactor, explicitSystemCode?: string): boolean {
  if (factor.system_code === 'unknown' || factor.system_code === 'baseline') return true;
  if (!explicitSystemCode) return false;
  return factor.system_code === explicitSystemCode;
}

function elevateQuality(quality: QualityScore, resolution: ResolutionLevel): QualityScore {
  if (resolution === 'global' && quality === 'high') return 'medium';
  return quality;
}

export function selectBestFactor(
  factors: GhgFactor[],
  userRegionCode: string,
  explicitSystemCode?: string
): FactorSelection | null {
  if (factors.length === 0) return null;

  const normalizedRegion = userRegionCode.toUpperCase();
  const countryCode = normalizedRegion.split('-')[0];

  const validFactors = factors.filter((f) => !!f.source_id && isSystemCodeAllowed(f, explicitSystemCode));
  if (!validFactors.length) return null;

  const regionMatch = validFactors.find((f) => f.region_code.toUpperCase() === normalizedRegion);
  if (regionMatch) {
    return {
      factor: regionMatch,
      resolution: 'region',
      quality: elevateQuality(regionMatch.quality_score, 'region'),
      explanation: `Using ${normalizedRegion}-specific factor backed by source ${regionMatch.source_id}.`,
    };
  }

  const countryMatch = validFactors.find((f) => f.region_code.toUpperCase() === countryCode);
  if (countryMatch) {
    return {
      factor: countryMatch,
      resolution: 'region',
      quality: elevateQuality(countryMatch.quality_score, 'region'),
      explanation: `No admin-region factor found; using ${countryCode}-level factor from ${countryMatch.source_id}.`,
    };
  }

  const continent = CONTINENT_MAP[countryCode];
  if (continent) {
    const continentMatch = validFactors.find((f) => f.region_code.toUpperCase() === continent);
    if (continentMatch) {
      return {
        factor: continentMatch,
        resolution: 'continent',
        quality: elevateQuality(continentMatch.quality_score, 'continent'),
        explanation: `No country-specific factor found; using ${continent} continent average (${continentMatch.source_id}).`,
      };
    }
  }

  const globalMatch = validFactors.find((f) => f.region_code.toUpperCase() === 'GLOBAL');
  if (globalMatch) {
    return {
      factor: globalMatch,
      resolution: 'global',
      quality: elevateQuality(globalMatch.quality_score, 'global'),
      explanation: `Falling back to global baseline from ${globalMatch.source_id}; uncertainty may be higher for your location.`,
    };
  }

  return null;
}

export function getContinentForCountry(countryCode: string): string | null {
  return CONTINENT_MAP[countryCode.toUpperCase()] ?? null;
}
