import { NextRequest, NextResponse } from 'next/server';
import { getFoodById, buildFoodCardData, getSeasonality, getSources, getGhgFactors } from '@/lib/queries';
import { estimateClimateZone } from '@seasonscope/shared';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const foodId = params.id;
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get('region') || 'US';
  const month = Number(searchParams.get('month') || new Date().getMonth() + 1);
  const latitude = Number(searchParams.get('latitude') || '40');
  const longitude = Number(searchParams.get('longitude') || '-100');
  const climateZone = searchParams.get('climate_zone') || estimateClimateZone(latitude, longitude);

  try {
    const food = await getFoodById(foodId);
    if (!food) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    }

    const [card, seasonalityRecords, ghgFactors] = await Promise.all([
      buildFoodCardData(food, region, month, climateZone, latitude),
      getSeasonality(foodId, region),
      getGhgFactors(foodId),
    ]);

    // Collect all source IDs
    const sourceIds = new Set<string>();
    card.ghg.source_ids.forEach((s) => sourceIds.add(s));
    if (card.seasonality?.source_id) sourceIds.add(card.seasonality.source_id);
    ghgFactors.forEach((f) => sourceIds.add(f.source_id));
    seasonalityRecords.forEach((s) => sourceIds.add(s.source_id));

    const sources = await getSources([...sourceIds]);

    const seasonality = seasonalityRecords.map((s) => ({
      month: s.month,
      probability: s.in_season_probability,
    }));

    return NextResponse.json(
      { card, seasonality, sources },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Food detail error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
