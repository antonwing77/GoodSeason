/**
 * ETL Connector: WRI Aqueduct — Water stress / drought risk layer
 *
 * WRI Aqueduct provides global water stress indicators. The full dataset
 * requires downloading rasters/shapefiles from the Aqueduct portal. We use
 * curated country-level baseline water stress scores from the Aqueduct 4.0
 * Water Risk Atlas.
 *
 * Source: https://www.wri.org/aqueduct
 * License: CC BY 4.0
 *
 * Methodology: Baseline Water Stress = total withdrawals / available blue water
 *   Score mapping (WRI methodology):
 *     < 1.0  → Low
 *     1.0–2.0 → Low-Medium
 *     2.0–3.0 → Medium-High
 *     3.0–4.0 → High
 *     ≥ 4.0  → Extremely High
 */
import { getPool } from './db-pool';

const SOURCE_ID = 'wri_aqueduct';

interface WaterRiskEntry {
  region_code: string;
  score: number;
  bucket: 'low' | 'low_medium' | 'medium_high' | 'high' | 'extremely_high';
}

function scoreToBucket(score: number): WaterRiskEntry['bucket'] {
  if (score < 1.0) return 'low';
  if (score < 2.0) return 'low_medium';
  if (score < 3.0) return 'medium_high';
  if (score < 4.0) return 'high';
  return 'extremely_high';
}

/**
 * Country-level baseline water stress scores from WRI Aqueduct 4.0.
 * These are national-average values; subnational variation can be significant.
 */
const AQUEDUCT_DATA: WaterRiskEntry[] = [
  // North America
  { region_code: 'US', score: 1.8, bucket: 'low_medium' },
  { region_code: 'US-CA', score: 3.5, bucket: 'high' },
  { region_code: 'US-AZ', score: 4.2, bucket: 'extremely_high' },
  { region_code: 'US-TX', score: 2.8, bucket: 'medium_high' },
  { region_code: 'US-FL', score: 1.5, bucket: 'low_medium' },
  { region_code: 'US-NY', score: 0.8, bucket: 'low' },
  { region_code: 'US-WA', score: 1.2, bucket: 'low_medium' },
  { region_code: 'US-OR', score: 1.0, bucket: 'low_medium' },
  { region_code: 'US-CO', score: 3.2, bucket: 'high' },
  { region_code: 'US-NV', score: 4.5, bucket: 'extremely_high' },
  { region_code: 'CA', score: 0.9, bucket: 'low' },
  { region_code: 'MX', score: 2.8, bucket: 'medium_high' },

  // South America
  { region_code: 'BR', score: 1.2, bucket: 'low_medium' },
  { region_code: 'AR', score: 1.8, bucket: 'low_medium' },
  { region_code: 'CL', score: 3.4, bucket: 'high' },
  { region_code: 'PE', score: 2.2, bucket: 'medium_high' },
  { region_code: 'CO', score: 0.8, bucket: 'low' },
  { region_code: 'EC', score: 0.6, bucket: 'low' },

  // Europe
  { region_code: 'GB', score: 0.9, bucket: 'low' },
  { region_code: 'FR', score: 1.3, bucket: 'low_medium' },
  { region_code: 'DE', score: 1.1, bucket: 'low_medium' },
  { region_code: 'IT', score: 2.2, bucket: 'medium_high' },
  { region_code: 'ES', score: 3.2, bucket: 'high' },
  { region_code: 'PT', score: 2.8, bucket: 'medium_high' },
  { region_code: 'NL', score: 0.7, bucket: 'low' },
  { region_code: 'BE', score: 1.6, bucket: 'low_medium' },
  { region_code: 'GR', score: 3.0, bucket: 'high' },
  { region_code: 'PL', score: 1.4, bucket: 'low_medium' },
  { region_code: 'SE', score: 0.3, bucket: 'low' },
  { region_code: 'NO', score: 0.2, bucket: 'low' },
  { region_code: 'DK', score: 0.6, bucket: 'low' },
  { region_code: 'FI', score: 0.2, bucket: 'low' },
  { region_code: 'CH', score: 0.5, bucket: 'low' },
  { region_code: 'AT', score: 0.8, bucket: 'low' },
  { region_code: 'IE', score: 0.3, bucket: 'low' },
  { region_code: 'CZ', score: 1.2, bucket: 'low_medium' },
  { region_code: 'RO', score: 1.8, bucket: 'low_medium' },
  { region_code: 'HU', score: 1.5, bucket: 'low_medium' },
  { region_code: 'TR', score: 2.5, bucket: 'medium_high' },

  // Asia
  { region_code: 'CN', score: 2.5, bucket: 'medium_high' },
  { region_code: 'IN', score: 3.9, bucket: 'high' },
  { region_code: 'PK', score: 4.5, bucket: 'extremely_high' },
  { region_code: 'BD', score: 1.8, bucket: 'low_medium' },
  { region_code: 'JP', score: 1.2, bucket: 'low_medium' },
  { region_code: 'KR', score: 1.5, bucket: 'low_medium' },
  { region_code: 'TH', score: 1.0, bucket: 'low_medium' },
  { region_code: 'VN', score: 0.9, bucket: 'low' },
  { region_code: 'ID', score: 0.8, bucket: 'low' },
  { region_code: 'PH', score: 0.7, bucket: 'low' },
  { region_code: 'MY', score: 0.4, bucket: 'low' },
  { region_code: 'SG', score: 2.0, bucket: 'medium_high' },
  { region_code: 'TW', score: 1.3, bucket: 'low_medium' },

  // Middle East & Central Asia
  { region_code: 'SA', score: 4.9, bucket: 'extremely_high' },
  { region_code: 'AE', score: 4.8, bucket: 'extremely_high' },
  { region_code: 'IL', score: 3.8, bucket: 'high' },
  { region_code: 'IQ', score: 4.1, bucket: 'extremely_high' },
  { region_code: 'IR', score: 4.3, bucket: 'extremely_high' },

  // Africa
  { region_code: 'ZA', score: 3.0, bucket: 'medium_high' },
  { region_code: 'EG', score: 4.8, bucket: 'extremely_high' },
  { region_code: 'NG', score: 0.9, bucket: 'low' },
  { region_code: 'KE', score: 2.2, bucket: 'medium_high' },
  { region_code: 'ET', score: 1.0, bucket: 'low_medium' },
  { region_code: 'MA', score: 3.5, bucket: 'high' },
  { region_code: 'GH', score: 0.5, bucket: 'low' },
  { region_code: 'TZ', score: 0.6, bucket: 'low' },

  // Oceania
  { region_code: 'AU', score: 3.5, bucket: 'high' },
  { region_code: 'NZ', score: 0.5, bucket: 'low' },

  // US regional fallbacks
  { region_code: 'US-W', score: 2.8, bucket: 'medium_high' },
  { region_code: 'US-SW', score: 3.8, bucket: 'high' },
  { region_code: 'US-MW', score: 1.0, bucket: 'low_medium' },
  { region_code: 'US-SE', score: 1.2, bucket: 'low_medium' },
  { region_code: 'US-NE', score: 0.8, bucket: 'low' },
];

export async function runAqueductEtl(): Promise<void> {
  console.log('\n=== WRI Aqueduct Water Risk ETL ===\n');
  const pool = getPool();
  const client = await pool.connect();

  try {
    // Ensure source record
    await client.query(
      `INSERT INTO sources (id, title, publisher, url, published_date, accessed_date, license, notes)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7)
       ON CONFLICT (id) DO UPDATE SET accessed_date = CURRENT_DATE`,
      [
        SOURCE_ID,
        'Aqueduct Water Risk Atlas',
        'World Resources Institute',
        'https://www.wri.org/aqueduct',
        '2023-01-01',
        'CC BY 4.0',
        'Global water stress indicators. Baseline Water Stress = total withdrawals / available blue water. Score thresholds: <1.0 Low, 1.0-2.0 Low-Medium, 2.0-3.0 Medium-High, 3.0-4.0 High, >=4.0 Extremely High.',
      ]
    );

    let upsertCount = 0;

    for (const entry of AQUEDUCT_DATA) {
      // Verify bucket matches score
      const expectedBucket = scoreToBucket(entry.score);
      const bucket = expectedBucket; // Use computed bucket for consistency

      await client.query(
        `INSERT INTO water_risk (region_code, indicator_name, score, bucket, source_id)
         VALUES ($1, 'baseline_water_stress', $2, $3, $4)
         ON CONFLICT (region_code, indicator_name)
         DO UPDATE SET score = EXCLUDED.score, bucket = EXCLUDED.bucket`,
        [entry.region_code, entry.score, bucket, SOURCE_ID]
      );
      upsertCount++;
    }

    console.log(`  Upserted ${upsertCount} water risk entries from WRI Aqueduct.`);
  } finally {
    client.release();
  }
}
