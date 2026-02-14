/**
 * Shared HTTP client with caching, retry, and rate-limit handling for ETL connectors.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

const CACHE_DIR = path.resolve(__dirname, '../../.etl-cache');

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function cacheKey(url: string): string {
  return url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 200);
}

function getCachePath(url: string): string {
  return path.join(CACHE_DIR, cacheKey(url));
}

/**
 * Check if a cached response exists and is fresh (default: 24 hours).
 */
function getCachedResponse(url: string, maxAgeMs: number = 86400000): string | null {
  const cachePath = getCachePath(url);
  if (!fs.existsSync(cachePath)) return null;
  const stat = fs.statSync(cachePath);
  if (Date.now() - stat.mtimeMs > maxAgeMs) return null;
  return fs.readFileSync(cachePath, 'utf-8');
}

function setCachedResponse(url: string, data: string): void {
  ensureCacheDir();
  fs.writeFileSync(getCachePath(url), data, 'utf-8');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a URL with retry logic, rate-limit handling, and local file caching.
 */
export async function fetchWithRetry(
  url: string,
  options: {
    maxRetries?: number;
    cacheMaxAgeMs?: number;
    headers?: Record<string, string>;
    skipCache?: boolean;
  } = {}
): Promise<string> {
  const { maxRetries = 3, cacheMaxAgeMs = 86400000, headers = {}, skipCache = false } = options;

  if (!skipCache) {
    const cached = getCachedResponse(url, cacheMaxAgeMs);
    if (cached) {
      console.log(`  [cache hit] ${url.slice(0, 80)}...`);
      return cached;
    }
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await doFetch(url, headers);
      if (!skipCache) {
        setCachedResponse(url, data);
      }
      return data;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (attempt < maxRetries) {
        const backoff = Math.pow(2, attempt + 1) * 1000;
        console.warn(`  [retry ${attempt + 1}/${maxRetries}] ${errMsg} — waiting ${backoff}ms`);
        await sleep(backoff);
      } else {
        throw new Error(`Failed to fetch ${url} after ${maxRetries + 1} attempts: ${errMsg}`);
      }
    }
  }
  throw new Error('Unreachable');
}

function doFetch(url: string, headers: Record<string, string>): Promise<string> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers, timeout: 30000 }, (res) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        doFetch(res.headers.location, headers).then(resolve).catch(reject);
        return;
      }

      // Rate limited - signal for retry
      if (res.statusCode === 429) {
        reject(new Error(`Rate limited (429) on ${url}`));
        return;
      }

      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode} on ${url}`));
        return;
      }

      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

/**
 * Parse CSV text into array of objects (simple parser for well-formed CSVs).
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? '';
    });
    return obj;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}
