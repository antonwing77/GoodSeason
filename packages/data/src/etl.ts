/**
 * SeasonScope ETL Pipeline
 *
 * This script orchestrates the data pipeline:
 * 1. Run migrations (create tables if not exist)
 * 2. Seed base data (foods, sources, GHG factors, seasonality, water risk, mappings)
 * 3. Validate data integrity
 * 4. Refresh materialized views
 *
 * Usage: npx tsx src/etl.ts
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import path from 'path';

dotenv.config({ path: '../../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

async function etl() {
  console.log('=== SeasonScope ETL Pipeline ===\n');

  const scriptsDir = path.resolve(__dirname);

  // Step 1: Migrate
  console.log('Step 1: Running migrations...');
  try {
    execSync(`npx tsx ${path.join(scriptsDir, 'migrate.ts')}`, {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
      env: process.env,
    });
    console.log('  Migrations complete.\n');
  } catch (err) {
    console.error('  Migration failed. Aborting ETL.');
    process.exit(1);
  }

  // Step 2: Seed
  console.log('Step 2: Seeding data...');
  try {
    execSync(`npx tsx ${path.join(scriptsDir, 'seed.ts')}`, {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
      env: process.env,
    });
    console.log('  Seeding complete.\n');
  } catch (err) {
    console.error('  Seeding failed. Continuing to validation...');
  }

  // Step 3: Refresh materialized views
  console.log('Step 3: Refreshing materialized views...');
  const client = await pool.connect();
  try {
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_recommendations');
    console.log('  Materialized views refreshed.\n');
  } catch (err) {
    // First refresh can't be concurrent if it has never been populated
    try {
      await client.query('REFRESH MATERIALIZED VIEW monthly_recommendations');
      console.log('  Materialized views refreshed (non-concurrent).\n');
    } catch (err2) {
      console.error('  Could not refresh materialized views:', err2);
    }
  } finally {
    client.release();
  }

  // Step 4: Validate
  console.log('Step 4: Running validation...');
  try {
    execSync(`npx tsx ${path.join(scriptsDir, 'validate.ts')}`, {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
      env: process.env,
    });
  } catch (err) {
    console.error('  Validation reported issues (see above).');
  }

  console.log('\n=== ETL Pipeline Complete ===');
  await pool.end();
}

etl();
