import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

interface ValidationResult {
  check: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  count?: number;
}

async function validate(): Promise<ValidationResult[]> {
  const client = await pool.connect();
  const results: ValidationResult[] = [];

  try {
    // 1. Check food count
    const foodCount = await client.query('SELECT COUNT(*) as cnt FROM foods');
    const fc = Number(foodCount.rows[0].cnt);
    results.push({
      check: 'food_count',
      status: fc >= 190 ? 'pass' : fc >= 100 ? 'warn' : 'fail',
      message: `Found ${fc} foods (target: 190+)`,
      count: fc,
    });

    // 2. Check all foods have GHG factors
    const foodsWithoutGhg = await client.query(`
      SELECT f.id, f.canonical_name
      FROM foods f
      LEFT JOIN ghg_factors g ON g.food_id = f.id
      WHERE g.id IS NULL
    `);
    results.push({
      check: 'ghg_coverage',
      status: foodsWithoutGhg.rowCount === 0 ? 'pass' : 'warn',
      message: `${foodsWithoutGhg.rowCount} foods missing GHG factors`,
      count: foodsWithoutGhg.rowCount ?? 0,
    });

    // 3. Check GHG factor units
    const badUnits = await client.query(`
      SELECT COUNT(*) as cnt FROM ghg_factors
      WHERE unit != 'kg CO2e / kg food'
    `);
    results.push({
      check: 'ghg_unit_consistency',
      status: Number(badUnits.rows[0].cnt) === 0 ? 'pass' : 'fail',
      message: `${badUnits.rows[0].cnt} factors with non-standard units`,
    });

    // 4. Check GHG range validity
    const badRange = await client.query(`
      SELECT COUNT(*) as cnt FROM ghg_factors
      WHERE value_min > value_mid OR value_mid > value_max
    `);
    results.push({
      check: 'ghg_range_validity',
      status: Number(badRange.rows[0].cnt) === 0 ? 'pass' : 'fail',
      message: `${badRange.rows[0].cnt} factors with invalid ranges (min > mid or mid > max)`,
    });

    // 5. Check for outliers (CO2e > 200 is suspicious)
    const outliers = await client.query(`
      SELECT food_id, value_mid FROM ghg_factors
      WHERE value_mid > 200 OR value_mid < 0
    `);
    results.push({
      check: 'ghg_outlier_detection',
      status: outliers.rowCount === 0 ? 'pass' : 'warn',
      message: `${outliers.rowCount} potential GHG outliers (>200 or <0 kg CO2e/kg)`,
      count: outliers.rowCount ?? 0,
    });

    // 6. Check source citations exist
    const missingSourcesGhg = await client.query(`
      SELECT COUNT(*) as cnt FROM ghg_factors g
      LEFT JOIN sources s ON s.id = g.source_id
      WHERE s.id IS NULL
    `);
    results.push({
      check: 'ghg_citation_integrity',
      status: Number(missingSourcesGhg.rows[0].cnt) === 0 ? 'pass' : 'fail',
      message: `${missingSourcesGhg.rows[0].cnt} GHG factors referencing missing sources`,
    });

    const missingSourcesSeason = await client.query(`
      SELECT COUNT(*) as cnt FROM seasonality se
      LEFT JOIN sources s ON s.id = se.source_id
      WHERE s.id IS NULL
    `);
    results.push({
      check: 'seasonality_citation_integrity',
      status: Number(missingSourcesSeason.rows[0].cnt) === 0 ? 'pass' : 'fail',
      message: `${missingSourcesSeason.rows[0].cnt} seasonality records referencing missing sources`,
    });

    // 7. Check seasonality probabilities in range
    const badProbability = await client.query(`
      SELECT COUNT(*) as cnt FROM seasonality
      WHERE in_season_probability < 0 OR in_season_probability > 1
    `);
    results.push({
      check: 'seasonality_probability_range',
      status: Number(badProbability.rows[0].cnt) === 0 ? 'pass' : 'fail',
      message: `${badProbability.rows[0].cnt} seasonality records with probability outside [0,1]`,
    });

    // 8. Check produce has seasonality data
    const produceWithoutSeason = await client.query(`
      SELECT COUNT(DISTINCT f.id) as cnt
      FROM foods f
      LEFT JOIN seasonality s ON s.food_id = f.id
      WHERE f.category = 'produce' AND s.id IS NULL
    `);
    results.push({
      check: 'produce_seasonality_coverage',
      status: Number(produceWithoutSeason.rows[0].cnt) === 0 ? 'pass' : 'warn',
      message: `${produceWithoutSeason.rows[0].cnt} produce items missing seasonality data`,
    });

    // 9. Check mapping confidence
    const lowConfMappings = await client.query(`
      SELECT COUNT(*) as cnt FROM mappings
      WHERE mapping_confidence < 0.5
    `);
    results.push({
      check: 'mapping_confidence',
      status: Number(lowConfMappings.rows[0].cnt) === 0 ? 'pass' : 'warn',
      message: `${lowConfMappings.rows[0].cnt} mappings with confidence < 0.5`,
    });

    // 10. Category distribution
    const catDist = await client.query(`
      SELECT category, COUNT(*) as cnt FROM foods GROUP BY category ORDER BY category
    `);
    const categories: Record<string, number> = {};
    for (const row of catDist.rows) {
      categories[row.category as string] = Number(row.cnt);
    }
    results.push({
      check: 'category_distribution',
      status: 'pass',
      message: `Distribution: ${Object.entries(categories).map(([k, v]) => `${k}=${v}`).join(', ')}`,
    });

    // 11. Source count
    const sourceCount = await client.query('SELECT COUNT(*) as cnt FROM sources');
    results.push({
      check: 'source_count',
      status: Number(sourceCount.rows[0].cnt) >= 4 ? 'pass' : 'warn',
      message: `${sourceCount.rows[0].cnt} sources in database`,
    });

    // Print results
    console.log('\n=== SeasonScope Data Validation ===\n');
    let failCount = 0;
    for (const r of results) {
      const icon = r.status === 'pass' ? '✓' : r.status === 'warn' ? '⚠' : '✗';
      const color = r.status === 'pass' ? '\x1b[32m' : r.status === 'warn' ? '\x1b[33m' : '\x1b[31m';
      console.log(`${color}${icon}\x1b[0m [${r.check}] ${r.message}`);
      if (r.status === 'fail') failCount++;
    }

    console.log(`\n${results.length} checks completed. ${failCount} failures.\n`);
    if (failCount > 0) process.exit(1);

    return results;
  } finally {
    client.release();
    await pool.end();
  }
}

validate();
