/**
 * Shared database pool for ETL connectors.
 * All connectors import from here rather than creating their own pools.
 */
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 5,
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
