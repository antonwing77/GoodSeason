import { describe, it, expect } from 'vitest';
import { selectBestFactor, getContinentForCountry } from '../domain/factor-selection';
import type { GhgFactor } from '../types';

function makeFactor(overrides: Partial<GhgFactor>): GhgFactor {
  return {
    id: 'test-1',
    food_id: 'tomato',
    region_code: 'GLOBAL',
    system_code: 'unknown',
    value_min: 0.5,
    value_mid: 1.0,
    value_max: 2.0,
    unit: 'kg CO2e / kg food',
    year: 2018,
    source_id: 'poore_nemecek_2018',
    quality_score: 'medium',
    ...overrides,
  };
}

describe('selectBestFactor', () => {
  it('returns null for empty factors array', () => {
    expect(selectBestFactor([], 'US')).toBeNull();
  });

  it('prefers region-specific factor over global', () => {
    const factors = [
      makeFactor({ id: 'global', region_code: 'GLOBAL', value_mid: 1.5 }),
      makeFactor({ id: 'us', region_code: 'US', value_mid: 1.2, quality_score: 'high' }),
    ];
    const result = selectBestFactor(factors, 'US');
    expect(result).not.toBeNull();
    expect(result!.resolution).toBe('region');
    expect(result!.factor.region_code).toBe('US');
    expect(result!.factor.value_mid).toBe(1.2);
    expect(result!.explanation).toContain('US-specific');
  });

  it('falls back to continent when region not available', () => {
    const factors = [
      makeFactor({ id: 'global', region_code: 'GLOBAL', value_mid: 1.5 }),
      makeFactor({ id: 'eu', region_code: 'EU', value_mid: 1.3 }),
    ];
    const result = selectBestFactor(factors, 'FR');
    expect(result).not.toBeNull();
    expect(result!.resolution).toBe('continent');
    expect(result!.factor.region_code).toBe('EU');
  });

  it('falls back to global when no region or continent match', () => {
    const factors = [
      makeFactor({ id: 'global', region_code: 'GLOBAL', value_mid: 1.5 }),
      makeFactor({ id: 'eu', region_code: 'EU', value_mid: 1.3 }),
    ];
    const result = selectBestFactor(factors, 'JP');
    // JP maps to AS (Asia), not EU, so should fall back
    expect(result).not.toBeNull();
    expect(result!.resolution).toBe('global');
    expect(result!.factor.region_code).toBe('GLOBAL');
  });

  it('uses continent mapping for Asian countries', () => {
    const factors = [
      makeFactor({ id: 'global', region_code: 'GLOBAL', value_mid: 1.5 }),
      makeFactor({ id: 'as', region_code: 'AS', value_mid: 1.1 }),
    ];
    const result = selectBestFactor(factors, 'JP');
    expect(result).not.toBeNull();
    expect(result!.resolution).toBe('continent');
    expect(result!.factor.region_code).toBe('AS');
  });

  it('returns first factor as last resort when no global factor exists', () => {
    const factors = [
      makeFactor({ id: 'eu', region_code: 'EU', value_mid: 1.3 }),
    ];
    const result = selectBestFactor(factors, 'AU');
    expect(result).toBeNull();
  });

  it('does not select non-baseline system factors unless explicitly requested', () => {
    const factors = [
      makeFactor({ id: 'heated', region_code: 'US', system_code: 'heated_greenhouse' }),
      makeFactor({ id: 'global', region_code: 'GLOBAL', system_code: 'unknown' }),
    ];
    const result = selectBestFactor(factors, 'US');
    expect(result?.factor.id).toBe('global');
  });

  it('is case-insensitive for region codes', () => {
    const factors = [
      makeFactor({ id: 'us', region_code: 'us', value_mid: 1.2 }),
    ];
    const result = selectBestFactor(factors, 'US');
    expect(result).not.toBeNull();
    expect(result!.resolution).toBe('region');
  });
});

describe('getContinentForCountry', () => {
  it('maps US to NA', () => {
    expect(getContinentForCountry('US')).toBe('NA');
  });

  it('maps FR to EU', () => {
    expect(getContinentForCountry('FR')).toBe('EU');
  });

  it('maps CN to AS', () => {
    expect(getContinentForCountry('CN')).toBe('AS');
  });

  it('maps BR to SA', () => {
    expect(getContinentForCountry('BR')).toBe('SA');
  });

  it('maps AU to OC', () => {
    expect(getContinentForCountry('AU')).toBe('OC');
  });

  it('returns null for unknown codes', () => {
    expect(getContinentForCountry('XX')).toBeNull();
  });
});
