import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyRecommendations } from '@/lib/queries';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get('region') || 'US';
  const month = Number(searchParams.get('month') || new Date().getMonth() + 1);
  const climateZone = searchParams.get('climate_zone') || '';
  const latitude = Number(searchParams.get('latitude') || '40');

  try {
    const recommendations = await getMonthlyRecommendations(
      region,
      month,
      climateZone,
      latitude,
      20
    );

    return NextResponse.json(recommendations, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json({
      inSeason: [],
      lowestCo2e: [],
      proteinChoices: [],
      staples: [],
    });
  }
}
