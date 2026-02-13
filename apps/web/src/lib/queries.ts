import { cachedQuery, query } from './db';
import type {
  Food, GhgFactor, Seasonality, Source, WaterRisk,
  FoodCardData, SearchResult, QualityScore, WaterRiskBucket,
} from '@seasonscope/shared';
import { selectBestFactor, isHeatedGreenhouseLikely } from '@seasonscope/shared';

// ── Food Queries ────────────────────────────────────────────────

export async function getFoods(category?: string, limit: number = 50): Promise<Food[]> {
  const key = `foods:${category ?? 'all'}:${limit}`;
  const sql = category
    ? 'SELECT * FROM foods WHERE category = $1 ORDER BY canonical_name LIMIT $2'
    : 'SELECT * FROM foods ORDER BY canonical_name LIMIT $1';
  const params = category ? [category, limit] : [limit];
  return cachedQuery<Food>(key, sql, params, 300_000);
}

export async function getFoodById(id: string): Promise<Food | null> {
  const rows = await cachedQuery<Food>(`food:${id}`, 'SELECT * FROM foods WHERE id = $1', [id], 300_000);
  return rows[0] ?? null;
}

export async function searchFoods(term: string, limit: number = 10): Promise<SearchResult[]> {
  // Use trigram similarity for fuzzy matching + synonyms
  const sql = `
    SELECT DISTINCT f.id AS food_id, f.canonical_name, f.category,
      GREATEST(
        similarity(f.canonical_name, $1),
        COALESCE((
          SELECT MAX(similarity(s, $1))
          FROM unnest(f.synonyms) AS s
        ), 0),
        COALESCE(
          (SELECT similarity(m.raw_name, $1)
           FROM mappings m WHERE m.food_id = f.id
           ORDER BY similarity(m.raw_name, $1) DESC LIMIT 1),
          0
        )
      ) AS match_score
    FROM foods f
    WHERE f.canonical_name % $1
       OR EXISTS (SELECT 1 FROM unnest(f.synonyms) s WHERE s % $1)
       OR EXISTS (SELECT 1 FROM mappings m WHERE m.food_id = f.id AND m.raw_name % $1)
    ORDER BY match_score DESC
    LIMIT $2
  `;
  return query<SearchResult>(sql, [term, limit]);
}

// ── GHG Factor Queries ──────────────────────────────────────────

export async function getGhgFactors(foodId: string): Promise<GhgFactor[]> {
  return cachedQuery<GhgFactor>(
    `ghg:${foodId}`,
    'SELECT * FROM ghg_factors WHERE food_id = $1',
    [foodId],
    300_000
  );
}

export async function getBestGhgFactor(foodId: string, regionCode: string) {
  const factors = await getGhgFactors(foodId);
  return selectBestFactor(factors, regionCode);
}

// ── Seasonality Queries ─────────────────────────────────────────

export async function getSeasonality(
  foodId: string,
  regionCode: string
): Promise<Seasonality[]> {
  return cachedQuery<Seasonality>(
    `season:${foodId}:${regionCode}`,
    'SELECT * FROM seasonality WHERE food_id = $1 AND region_code = $2 ORDER BY month',
    [foodId, regionCode],
    300_000
  );
}

export async function getSeasonalityForMonth(
  regionCode: string,
  month: number,
  minProbability: number = 0.3
): Promise<(Seasonality & { canonical_name: string; category: string })[]> {
  const sql = `
    SELECT s.*, f.canonical_name, f.category
    FROM seasonality s
    JOIN foods f ON f.id = s.food_id
    WHERE s.region_code = $1 AND s.month = $2 AND s.in_season_probability >= $3
    ORDER BY s.in_season_probability DESC
  `;
  return cachedQuery(
    `seasonal:${regionCode}:${month}:${minProbability}`,
    sql,
    [regionCode, month, minProbability],
    300_000
  );
}

// ── Water Risk Queries ──────────────────────────────────────────

export async function getWaterRisk(regionCode: string): Promise<WaterRisk | null> {
  const rows = await cachedQuery<WaterRisk>(
    `water:${regionCode}`,
    'SELECT * FROM water_risk WHERE region_code = $1 LIMIT 1',
    [regionCode],
    600_000
  );
  return rows[0] ?? null;
}

// ── Source Queries ───────────────────────────────────────────────

export async function getSources(ids: string[]): Promise<Source[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  return cachedQuery<Source>(
    `sources:${ids.sort().join(',')}`,
    `SELECT * FROM sources WHERE id IN (${placeholders})`,
    ids,
    600_000
  );
}

export async function getAllSources(): Promise<Source[]> {
  return cachedQuery<Source>('sources:all', 'SELECT * FROM sources ORDER BY title', [], 600_000);
}

// ── Composite Queries ───────────────────────────────────────────

export async function buildFoodCardData(
  food: Food,
  regionCode: string,
  month: number,
  climateZone: string = '',
  latitude: number = 0
): Promise<FoodCardData> {
  const [factorResult, seasonality, waterRisk] = await Promise.all([
    getBestGhgFactor(food.id, regionCode),
    getSeasonality(food.id, regionCode),
    getWaterRisk(regionCode),
  ]);

  const monthSeason = seasonality.find((s) => s.month === month) ?? null;

  const ghg = factorResult
    ? {
        value_min: factorResult.factor.value_min,
        value_mid: factorResult.factor.value_mid,
        value_max: factorResult.factor.value_max,
        unit: factorResult.factor.unit,
        quality_score: factorResult.quality,
        source_ids: [factorResult.factor.source_id],
      }
    : {
        value_min: 0,
        value_mid: 0,
        value_max: 0,
        unit: 'kg CO2e / kg food',
        quality_score: 'low' as QualityScore,
        source_ids: [],
      };

  return {
    food,
    ghg,
    seasonality: monthSeason
      ? {
          in_season_probability: monthSeason.in_season_probability,
          confidence: monthSeason.confidence,
          source_id: monthSeason.source_id,
        }
      : null,
    water_risk: waterRisk
      ? {
          bucket: waterRisk.bucket as WaterRiskBucket,
          origin_region: waterRisk.region_code,
        }
      : null,
    heated_greenhouse_likely: isHeatedGreenhouseLikely(
      food.canonical_name,
      climateZone,
      month,
      latitude
    ),
  };
}

export async function getMonthlyRecommendations(
  regionCode: string,
  month: number,
  climateZone: string = '',
  latitude: number = 0,
  limit: number = 20
) {
  const foods = await getFoods(undefined, 200);
  const cards = await Promise.all(
    foods.map((f) => buildFoodCardData(f, regionCode, month, climateZone, latitude))
  );

  // In-season
  const inSeason = cards
    .filter((c) => c.seasonality && c.seasonality.in_season_probability >= 0.5)
    .sort((a, b) => (b.seasonality?.in_season_probability ?? 0) - (a.seasonality?.in_season_probability ?? 0))
    .slice(0, limit);

  // Lowest CO2e
  const lowestCo2e = [...cards]
    .filter((c) => c.ghg.value_mid > 0)
    .sort((a, b) => a.ghg.value_mid - b.ghg.value_mid)
    .slice(0, limit);

  // Protein choices (meat + dairy + legumes)
  const proteinChoices = cards
    .filter((c) =>
      c.food.category === 'meat' ||
      c.food.category === 'dairy' ||
      c.food.category === 'legumes'
    )
    .sort((a, b) => a.ghg.value_mid - b.ghg.value_mid)
    .slice(0, limit);

  // Staples (grains + legumes + some produce)
  const staples = cards
    .filter((c) =>
      c.food.category === 'grains' || c.food.category === 'legumes'
    )
    .sort((a, b) => a.ghg.value_mid - b.ghg.value_mid)
    .slice(0, limit);

  return { inSeason, lowestCo2e, proteinChoices, staples };
}
