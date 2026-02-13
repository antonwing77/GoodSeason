// ── Core Domain Types ──────────────────────────────────────────────

export type FoodCategory =
  | 'produce'
  | 'meat'
  | 'dairy'
  | 'grains'
  | 'legumes'
  | 'oils_sweeteners';

export interface Food {
  id: string;
  canonical_name: string;
  category: FoodCategory;
  synonyms: string[];
  typical_serving_g: number;
  edible_portion_pct: number;
}

export type QualityScore = 'high' | 'medium' | 'low';

export interface GhgFactor {
  id: string;
  food_id: string;
  region_code: string; // ISO 3166-1 alpha-2 or 'GLOBAL'
  system_code: string; // 'open_field' | 'heated_greenhouse' | 'unknown' | etc.
  value_min: number;
  value_mid: number;
  value_max: number;
  unit: string; // 'kg CO2e / kg food'
  year: number;
  source_id: string;
  quality_score: QualityScore;
}

export interface Seasonality {
  id: string;
  food_id: string;
  region_code: string;
  month: number; // 1–12
  in_season_probability: number; // 0–1
  confidence: number; // 0–1
  source_id: string;
}

export interface Origin {
  id: string;
  food_id: string;
  destination_region_code: string;
  origin_region_code: string;
  probability: number; // 0–1
  rationale: string;
  source_id: string;
}

export type WaterRiskBucket = 'low' | 'low_medium' | 'medium_high' | 'high' | 'extremely_high';

export interface WaterRisk {
  id: string;
  region_code: string;
  indicator_name: string;
  score: number;
  bucket: WaterRiskBucket;
  source_id: string;
}

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  published_date: string | null;
  accessed_date: string;
  license: string;
  notes: string;
}

export interface FoodMapping {
  id: string;
  raw_name: string;
  food_id: string;
  mapping_confidence: number; // 0–1
  mapping_notes: string;
}

// ── UI / API Response Types ────────────────────────────────────────

export interface FoodCardData {
  food: Food;
  ghg: {
    value_min: number;
    value_mid: number;
    value_max: number;
    unit: string;
    quality_score: QualityScore;
    source_ids: string[];
  };
  seasonality: {
    in_season_probability: number;
    confidence: number;
    source_id: string;
  } | null;
  water_risk: {
    bucket: WaterRiskBucket;
    origin_region: string;
  } | null;
  heated_greenhouse_likely: boolean;
}

export interface CompareData {
  option_a: FoodCardData;
  option_b: FoodCardData;
  explanation: {
    production_co2e_a: number;
    production_co2e_b: number;
    transport_note: string;
    season_note: string;
    recommendation: string;
    assumptions: string[];
    sources: Source[];
  };
}

export interface MonthlyRecommendation {
  month: number;
  region_code: string;
  in_season: FoodCardData[];
  lowest_co2e: FoodCardData[];
  protein_choices: FoodCardData[];
  staples: FoodCardData[];
}

export interface LocationContext {
  country_code: string;
  admin_region: string;
  climate_zone: string;
  latitude: number;
  longitude: number;
}

export interface SearchResult {
  food_id: string;
  canonical_name: string;
  category: FoodCategory;
  match_score: number;
}

// ── Filter / Query Types ───────────────────────────────────────────

export type DietFilter = 'omnivore' | 'vegetarian' | 'vegan';

export interface BrowseFilters {
  category?: FoodCategory;
  diet?: DietFilter;
  avoid_high_water_risk?: boolean;
  local_first?: boolean;
  month?: number;
  region_code?: string;
}
