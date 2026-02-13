import { describe, it, expect } from 'vitest';
import { estimateClimateZone, buildLocationContext, getCurrentMonth } from '../domain/location';

describe('estimateClimateZone', () => {
  it('returns polar for high latitudes', () => {
    expect(estimateClimateZone(70, 25)).toBe('EF');
  });

  it('returns boreal for subarctic latitudes', () => {
    expect(estimateClimateZone(60, -100)).toBe('Dfc');
  });

  it('returns continental for mid latitudes', () => {
    expect(estimateClimateZone(50, -90)).toBe('Dfb');
  });

  it('returns Mediterranean for southern Europe', () => {
    expect(estimateClimateZone(38, 15)).toBe('Csa');
  });

  it('returns humid subtropical for subtropics', () => {
    expect(estimateClimateZone(30, -85)).toBe('Cfa');
  });

  it('returns tropical savanna for low latitudes', () => {
    expect(estimateClimateZone(15, 30)).toBe('Aw');
  });

  it('returns tropical rainforest for equatorial', () => {
    expect(estimateClimateZone(2, 20)).toBe('Af');
  });

  it('handles southern hemisphere', () => {
    const zone = estimateClimateZone(-35, 150);
    expect(['Cfb', 'Csa', 'Cfa']).toContain(zone);
  });
});

describe('buildLocationContext', () => {
  it('builds correct context', () => {
    const ctx = buildLocationContext(40.7, -74.0, 'us', 'New York');
    expect(ctx.country_code).toBe('US');
    expect(ctx.admin_region).toBe('New York');
    expect(ctx.latitude).toBe(40.7);
    expect(ctx.longitude).toBe(-74.0);
    expect(ctx.climate_zone).toBeTruthy();
  });

  it('uppercases country code', () => {
    const ctx = buildLocationContext(0, 0, 'gb');
    expect(ctx.country_code).toBe('GB');
  });
});

describe('getCurrentMonth', () => {
  it('returns a number between 1 and 12', () => {
    const month = getCurrentMonth();
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
  });
});
