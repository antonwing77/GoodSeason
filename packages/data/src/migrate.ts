import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

const MIGRATION_SQL = `
-- ============================================================
-- SeasonScope Database Schema
-- ============================================================

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy text search

-- ── Sources (cited data provenance) ─────────────────────────

CREATE TABLE IF NOT EXISTS sources (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  publisher     TEXT NOT NULL,
  url           TEXT NOT NULL,
  published_date DATE,
  accessed_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  license       TEXT NOT NULL DEFAULT 'Unknown',
  notes         TEXT NOT NULL DEFAULT ''
);

-- ── Foods ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS foods (
  id                 TEXT PRIMARY KEY,
  canonical_name     TEXT NOT NULL UNIQUE,
  category           TEXT NOT NULL CHECK (category IN (
    'produce', 'meat', 'dairy', 'grains', 'legumes', 'oils_sweeteners'
  )),
  synonyms           TEXT[] NOT NULL DEFAULT '{}',
  typical_serving_g  REAL NOT NULL DEFAULT 100,
  edible_portion_pct REAL NOT NULL DEFAULT 1.0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_foods_name_trgm
  ON foods USING gin (canonical_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_foods_category
  ON foods (category);

-- ── GHG Factors ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ghg_factors (
  id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  food_id       TEXT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  region_code   TEXT NOT NULL DEFAULT 'GLOBAL',
  system_code   TEXT NOT NULL DEFAULT 'unknown',
  value_min     REAL NOT NULL,
  value_mid     REAL NOT NULL,
  value_max     REAL NOT NULL,
  unit          TEXT NOT NULL DEFAULT 'kg CO2e / kg food',
  year          INT NOT NULL DEFAULT 2018,
  source_id     TEXT NOT NULL REFERENCES sources(id),
  quality_score TEXT NOT NULL DEFAULT 'medium' CHECK (quality_score IN ('high', 'medium', 'low')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_range CHECK (value_min <= value_mid AND value_mid <= value_max)
);

CREATE INDEX IF NOT EXISTS idx_ghg_food_region
  ON ghg_factors (food_id, region_code);

-- ── Seasonality ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS seasonality (
  id                    TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  food_id               TEXT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  region_code           TEXT NOT NULL,
  month                 INT NOT NULL CHECK (month >= 1 AND month <= 12),
  in_season_probability REAL NOT NULL CHECK (in_season_probability >= 0 AND in_season_probability <= 1),
  confidence            REAL NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  source_id             TEXT NOT NULL REFERENCES sources(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (food_id, region_code, month)
);

CREATE INDEX IF NOT EXISTS idx_seasonality_region_month
  ON seasonality (region_code, month);

-- ── Origins (trade flow probabilities) ──────────────────────

CREATE TABLE IF NOT EXISTS origins (
  id                       TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  food_id                  TEXT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  destination_region_code  TEXT NOT NULL,
  origin_region_code       TEXT NOT NULL,
  probability              REAL NOT NULL CHECK (probability >= 0 AND probability <= 1),
  rationale                TEXT NOT NULL DEFAULT '',
  source_id                TEXT NOT NULL REFERENCES sources(id),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Water Risk ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS water_risk (
  id              TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  region_code     TEXT NOT NULL,
  indicator_name  TEXT NOT NULL DEFAULT 'baseline_water_stress',
  score           REAL NOT NULL,
  bucket          TEXT NOT NULL CHECK (bucket IN (
    'low', 'low_medium', 'medium_high', 'high', 'extremely_high'
  )),
  source_id       TEXT NOT NULL REFERENCES sources(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (region_code, indicator_name)
);

-- ── Mappings (user search -> canonical food) ────────────────

CREATE TABLE IF NOT EXISTS mappings (
  id                 TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  raw_name           TEXT NOT NULL,
  food_id            TEXT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  mapping_confidence REAL NOT NULL DEFAULT 1.0,
  mapping_notes      TEXT NOT NULL DEFAULT '',

  UNIQUE (raw_name)
);

CREATE INDEX IF NOT EXISTS idx_mappings_raw_name_trgm
  ON mappings USING gin (raw_name gin_trgm_ops);

-- ── Materialized view for recommendations ───────────────────

CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_recommendations AS
SELECT
  s.region_code,
  s.month,
  f.id AS food_id,
  f.canonical_name,
  f.category,
  s.in_season_probability,
  s.confidence AS season_confidence,
  g.value_mid AS co2e_mid,
  g.value_min AS co2e_min,
  g.value_max AS co2e_max,
  g.quality_score,
  g.source_id AS ghg_source_id,
  s.source_id AS season_source_id
FROM seasonality s
JOIN foods f ON f.id = s.food_id
LEFT JOIN LATERAL (
  SELECT * FROM ghg_factors gf
  WHERE gf.food_id = f.id
  ORDER BY
    CASE
      WHEN gf.region_code = s.region_code THEN 1
      WHEN gf.region_code = 'GLOBAL' THEN 3
      ELSE 2
    END
  LIMIT 1
) g ON TRUE
WHERE s.in_season_probability >= 0.3;

CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_rec_region_month_food
  ON monthly_recommendations (region_code, month, food_id);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running SeasonScope database migration...');
    await client.query(MIGRATION_SQL);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
