import { Pool } from 'pg';

// Singleton pool for the web app
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

// Helper for server components / API routes
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows as T[];
}

// Cache layer: in-memory with TTL for common queries
const cache = new Map<string, { data: unknown; expiry: number }>();

export async function cachedQuery<T = Record<string, unknown>>(
  key: string,
  text: string,
  params?: unknown[],
  ttlMs: number = 60_000 // 1 minute default
): Promise<T[]> {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T[];
  }

  const data = await query<T>(text, params);
  cache.set(key, { data, expiry: Date.now() + ttlMs });

  // Prune old entries periodically
  if (cache.size > 500) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (v.expiry < now) cache.delete(k);
    }
  }

  return data;
}
