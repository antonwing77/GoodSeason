import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q') || '';
  const limit = Math.min(Number(searchParams.get('limit') || '10'), 20);

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Use trigram similarity + prefix matching for search
    const sql = `
      SELECT DISTINCT
        f.id AS food_id,
        f.canonical_name,
        f.category,
        GREATEST(
          similarity(f.canonical_name, $1),
          CASE WHEN f.canonical_name ILIKE $2 THEN 1.0 ELSE 0 END,
          COALESCE((
            SELECT MAX(similarity(s, $1))
            FROM unnest(f.synonyms) AS s
          ), 0)
        ) AS match_score
      FROM foods f
      WHERE
        f.canonical_name ILIKE $2
        OR f.canonical_name % $1
        OR EXISTS (SELECT 1 FROM unnest(f.synonyms) s WHERE s ILIKE $2 OR s % $1)
        OR EXISTS (SELECT 1 FROM mappings m WHERE m.food_id = f.id AND (m.raw_name ILIKE $2 OR m.raw_name % $1))
      ORDER BY match_score DESC
      LIMIT $3
    `;

    const results = await query(sql, [q, `%${q}%`, limit]);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    // Return empty results on DB error (app works without DB during development)
    return NextResponse.json({ results: [] });
  }
}
