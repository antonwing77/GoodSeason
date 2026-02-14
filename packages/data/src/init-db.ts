/**
 * Lightweight database initialization for startup.
 *
 * 1. Runs migrations (CREATE TABLE IF NOT EXISTS – fast & idempotent).
 * 2. Checks if the foods table is populated.
 * 3. If empty, runs the full seed so the app has data on first boot.
 *
 * This avoids re-seeding on every restart (which would be slow) while
 * guaranteeing the database is populated even if the build-phase ETL
 * failed (e.g. database not ready on first Render deploy).
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import path from 'path';

dotenv.config({ path: '../../.env' });

async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.error('[init-db] ERROR: DATABASE_URL is not set.');
    process.exit(1);
  }

  const scriptsDir = path.resolve(__dirname);
  const cwd = path.resolve(__dirname, '..');

  // Step 1: Run migrations (idempotent)
  console.log('[init-db] Running migrations...');
  try {
    execSync(`tsx ${path.join(scriptsDir, 'migrate.ts')}`, {
      stdio: 'inherit',
      cwd,
      env: process.env,
    });
  } catch (err) {
    console.error('[init-db] Migration failed:', err);
    process.exit(1);
  }

  // Step 2: Check if data exists
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  let needsSeed = false;
  try {
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM foods');
    const count = result.rows[0].count;
    console.log(`[init-db] Found ${count} foods in database.`);
    needsSeed = count === 0;
  } catch {
    // Table might not exist yet (migration might have failed silently)
    console.log('[init-db] Could not query foods table. Will attempt seed.');
    needsSeed = true;
  }
  await pool.end();

  // Step 3: Seed if empty
  if (needsSeed) {
    console.log('[init-db] Database is empty. Running seed...');
    try {
      execSync(`tsx ${path.join(scriptsDir, 'seed.ts')}`, {
        stdio: 'inherit',
        cwd,
        env: process.env,
      });
      console.log('[init-db] Seed complete.');
    } catch (err) {
      console.error('[init-db] Seed failed:', err);
      // Don't exit – the web app can still start and show a graceful empty state
    }
  } else {
    console.log('[init-db] Database already populated. Skipping seed.');
  }

  console.log('[init-db] Done.');
}

initDb();
