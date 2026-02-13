import { describe, it, expect } from 'vitest';
import {
  isHeatedGreenhouseLikely,
  getBestMonths,
  rankForMonth,
  getMonthName,
  selectSeasonalityRecord,
} from '../domain/seasonality';
import type { Seasonality, FoodCardData } from '../types';

describe('isHeatedGreenhouseLikely', () => {
  it('returns true for tomato in cold climate during winter', () => {
    expect(isHeatedGreenhouseLikely('tomato', 'Dfb', 1, 52)).toBe(true);
    expect(isHeatedGreenhouseLikely('tomato', 'Dfb', 12, 52)).toBe(true);
  });

  it('returns false for tomato in summer', () => {
    expect(isHeatedGreenhouseLikely('tomato', 'Dfb', 7, 52)).toBe(false);
  });

  it('returns false for non-warm-season crops', () => {
    expect(isHeatedGreenhouseLikely('cabbage', 'Dfb', 1, 52)).toBe(false);
    expect(isHeatedGreenhouseLikely('carrot', 'Dfb', 1, 52)).toBe(false);
  });

  it('returns false for warm climate zones', () => {
    expect(isHeatedGreenhouseLikely('tomato', 'Csa', 1, 37)).toBe(false);
    expect(isHeatedGreenhouseLikely('tomato', 'Af', 1, 5)).toBe(false);
  });

  it('handles southern hemisphere winter months', () => {
    expect(isHeatedGreenhouseLikely('tomato', 'Dfc', 7, -45)).toBe(true);
    expect(isHeatedGreenhouseLikely('tomato', 'Dfc', 1, -45)).toBe(false);
  });

  it('handles pepper and cucumber as warm-season crops', () => {
    expect(isHeatedGreenhouseLikely('pepper', 'Dfb', 2, 50)).toBe(true);
    expect(isHeatedGreenhouseLikely('cucumber', 'Dfb', 2, 50)).toBe(true);
  });
});

describe('getBestMonths', () => {
  const makeSeasonality = (month: number, prob: number): Seasonality => ({
    id: `s-${month}`,
    food_id: 'tomato',
    region_code: 'US',
    month,
    in_season_probability: prob,
    confidence: 0.8,
    source_id: 'fao',
  });

  it('returns months above threshold sorted by probability', () => {
    const records = [
      makeSeasonality(6, 0.8),
      makeSeasonality(7, 0.95),
      makeSeasonality(8, 0.9),
      makeSeasonality(12, 0.1),
    ];
    const best = getBestMonths(records, 0.5);
    expect(best).toEqual([7, 8, 6]);
  });

  it('returns empty array when no months above threshold', () => {
    const records = [
      makeSeasonality(1, 0.1),
      makeSeasonality(2, 0.2),
    ];
    expect(getBestMonths(records, 0.5)).toEqual([]);
  });

  it('uses default threshold of 0.5', () => {
    const records = [
      makeSeasonality(6, 0.6),
      makeSeasonality(1, 0.3),
    ];
    expect(getBestMonths(records)).toEqual([6]);
  });
});

describe('rankForMonth', () => {
  const makeCard = (
    id: string,
    co2e: number,
    seasonProb: number | null
  ): FoodCardData => ({
    food: {
      id,
      canonical_name: id,
      category: 'produce',
      synonyms: [],
      typical_serving_g: 100,
      edible_portion_pct: 1,
    },
    ghg: {
      value_min: co2e * 0.5,
      value_mid: co2e,
      value_max: co2e * 2,
      unit: 'kg CO2e / kg food',
      quality_score: 'medium',
      resolution: 'global',
      selection_explanation: 'test',
      source_ids: ['s1'],
    },
    seasonality: seasonProb !== null
      ? { in_season_probability: seasonProb, confidence: 0.8, source_id: 'fao' }
      : null,
    water_risk: null,
    heated_greenhouse_likely: false,
  });

  it('prioritizes in-season items', () => {
    const items = [
      makeCard('off_season_low_co2', 0.3, 0.1),
      makeCard('in_season_higher_co2', 1.0, 0.9),
    ];
    const ranked = rankForMonth(items);
    expect(ranked[0].food.id).toBe('in_season_higher_co2');
  });

  it('returns empty array for empty input', () => {
    expect(rankForMonth([])).toEqual([]);
  });

  it('considers CO2e as secondary factor', () => {
    const items = [
      makeCard('same_season_high_co2', 10.0, 0.9),
      makeCard('same_season_low_co2', 0.5, 0.9),
    ];
    const ranked = rankForMonth(items);
    expect(ranked[0].food.id).toBe('same_season_low_co2');
  });
});

describe('getMonthName', () => {
  it('returns correct month names', () => {
    expect(getMonthName(1)).toBe('January');
    expect(getMonthName(6)).toBe('June');
    expect(getMonthName(12)).toBe('December');
  });
});

describe('selectSeasonalityRecord', () => {
  const records: Seasonality[] = [
    { id: '1', food_id: 'tomato', region_code: 'US-SE', month: 1, in_season_probability: 0.5, confidence: 0.8, source_id: 's' },
    { id: '2', food_id: 'tomato', region_code: 'US', month: 1, in_season_probability: 0.4, confidence: 0.8, source_id: 's' },
    { id: '3', food_id: 'tomato', region_code: 'CLIMATE:Dfb', month: 1, in_season_probability: 0.3, confidence: 0.6, source_id: 's' },
  ];

  it('uses US state fallback note when state record missing', () => {
    const selected = selectSeasonalityRecord(records, 'US-FL', 1);
    expect(selected.record?.region_code).toBe('US-SE');
    expect(selected.fallback_note).toContain('US region fallback');
  });
});
