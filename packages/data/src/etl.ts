/**
 * GoodSeason ETL Pipeline
 *
 * This script orchestrates the data pipeline:
 * 1. Run migrations (create tables if not exist)
 * 2. Seed base data (foods, sources, GHG factors, seasonality, water risk, mappings)
 * 3. Run dataset connectors (OWID, AGRIBALYSE, FAO, Köppen, Aqueduct, Comtrade)
 * 4. Refresh materialized views
 * 5. Validate data integrity
 *
 * Usage: npx tsx src/etl.ts
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import path from 'path';

dotenv.config({ path: '../../.env' });

async function waitForDatabase(maxRetries: number = 5): Promise<Pool> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  for (let i = 0; i < maxRetries; i++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('  Database connection established.');
      return pool;
    } catch (err) {
      console.log(`  Database not ready (attempt ${i + 1}/${maxRetries}). Retrying in ${2 ** i}s...`);
      await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
    }
  }

  throw new Error('Could not connect to database after retries.');
}

function resolveTsx(): string {
  // Use tsx from node_modules/.bin (available in npm script PATH)
  // Fall back to npx tsx if not in PATH
  try {
    execSync('tsx --version', { stdio: 'ignore' });
    return 'tsx';
  } catch {
    return 'npx tsx';
  }
}

async function etl() {
  console.log('=== GoodSeason ETL Pipeline ===\n');

  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set. Cannot run ETL.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const pool = await waitForDatabase();

  const scriptsDir = path.resolve(__dirname);
  const cwd = path.resolve(__dirname, '..');
  const tsxCmd = resolveTsx();

  console.log(`  Using: ${tsxCmd}\n`);

  // Step 1: Migrate
  console.log('Step 1: Running migrations...');
  try {
    execSync(`${tsxCmd} ${path.join(scriptsDir, 'migrate.ts')}`, {
      stdio: 'inherit',
      cwd,
      env: process.env,
    });
    console.log('  Migrations complete.\n');
  } catch (err) {
    console.error('  Migration failed. Aborting ETL.', err);
    process.exit(1);
  }

  // Step 2: Seed
  console.log('Step 2: Seeding data...');
  try {
    execSync(`${tsxCmd} ${path.join(scriptsDir, 'seed.ts')}`, {
      stdio: 'inherit',
      cwd,
      env: process.env,
    });
    console.log('  Seeding complete.\n');
  } catch (err) {
    console.error('  Seeding failed. Continuing to connectors...', err);
  }

  // Step 3: Run dataset connectors
  console.log('Step 3: Running dataset connectors...');
  try {
    execSync(`${tsxCmd} ${path.join(scriptsDir, 'connectors/index.ts')}`, {
      stdio: 'inherit',
      cwd,
      env: process.env,
    });
    console.log('  Connectors complete.\n');
  } catch (err) {
    console.error('  Some connectors failed (see above). Continuing...');
  }

  // Step 4: Refresh materialized views
  console.log('Step 4: Refreshing materialized views...');
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

  // Step 5: Validate
  console.log('Step 5: Running validation...');
  try {
    execSync(`${tsxCmd} ${path.join(scriptsDir, 'validate.ts')}`, {
      stdio: 'inherit',
      cwd,
      env: process.env,
    });
  } catch (err) {
    console.error('  Validation reported issues (see above).');
  }

  console.log('\n=== ETL Pipeline Complete ===');
  await pool.end();
}

etl();
