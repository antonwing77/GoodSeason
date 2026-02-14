import { describe, it, expect } from 'vitest';
import { selectOrigins, getOriginWaterRisk } from '../domain/origins';
import type { Origin, WaterRisk } from '../types';

const makeOrigin = (foodId: string, dest: string, origin: string, probability: number): Origin => ({
  id: `${foodId}-${dest}-${origin}`,
  food_id: foodId,
  destination_region_code: dest,
  origin_region_code: origin,
  probability,
  rationale: 'test',
  source_id: 'un_comtrade',
});

describe('selectOrigins', () => {
  const origins: Origin[] = [
    makeOrigin('banana', 'US', 'GT', 0.30),
    makeOrigin('banana', 'US', 'EC', 0.22),
    makeOrigin('banana', 'US', 'CR', 0.18),
    makeOrigin('banana', 'GB', 'CO', 0.28),
    makeOrigin('banana', 'GB', 'CR', 0.22),
  ];

  it('returns exact destination match sorted by probability', () => {
    const result = selectOrigins(origins, 'banana', 'US');
    expect(result).not.toBeNull();
    expect(result!.origins).toHaveLength(3);
    expect(result!.origins[0].origin_region_code).toBe('GT');
    expect(result!.origins[1].origin_region_code).toBe('EC');
  });

  it('returns null when no data exists', () => {
    const result = selectOrigins(origins, 'banana', 'JP');
    expect(result).toBeNull();
  });

  it('falls back to country code from admin region', () => {
    const result = selectOrigins(origins, 'banana', 'US-CA');
    expect(result).not.toBeNull();
    expect(result!.origins).toHaveLength(3);
    expect(result!.explanation).toContain('US-level');
  });

  it('returns null for food with no origin data at all', () => {
    const result = selectOrigins(origins, 'carrot', 'US');
    expect(result).toBeNull();
  });
});

describe('getOriginWaterRisk', () => {
  const waterRisks: WaterRisk[] = [
    { id: '1', region_code: 'IN', indicator_name: 'baseline_water_stress', score: 3.9, bucket: 'high', source_id: 'wri' },
    { id: '2', region_code: 'BR', indicator_name: 'baseline_water_stress', score: 1.2, bucket: 'low_medium', source_id: 'wri' },
  ];

  it('returns water risk for matching region', () => {
    const result = getOriginWaterRisk('IN', waterRisks);
    expect(result).not.toBeNull();
    expect(result!.bucket).toBe('high');
  });

  it('returns null for unknown region', () => {
    const result = getOriginWaterRisk('XX', waterRisks);
    expect(result).toBeNull();
  });
});
