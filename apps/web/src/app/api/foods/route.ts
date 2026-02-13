import { NextRequest, NextResponse } from 'next/server';
import { getFoods } from '@/lib/queries';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || undefined;
  const limit = Math.min(Number(searchParams.get('limit') || '50'), 200);

  try {
    const foods = await getFoods(category, limit);
    return NextResponse.json({ foods });
  } catch (error) {
    console.error('Foods API error:', error);
    return NextResponse.json({ foods: [] });
  }
}
