'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FoodCard } from '@/components/FoodCard';
import { SeasonCalendar } from '@/components/SeasonCalendar';
import { Badge, getCo2eBadgeVariant, getWaterRiskBadgeVariant, CitationsPanel, Skeleton } from '@seasonscope/ui';
import type { FoodCardData } from '@seasonscope/shared';
import { ArrowLeft, BarChart3, Info, Scale, ChevronDown, Lightbulb } from 'lucide-react';

interface FoodDetailData {
  card: FoodCardData;
  seasonality: { month: number; probability: number }[];
  sources: {
    id: string;
    title: string;
    publisher: string;
    url: string;
    published_date: string | null;
    accessed_date: string;
    license: string;
    notes: string;
  }[];
  alternatives: FoodCardData[];
}

export default function FoodDetailPage() {
  const params = useParams();
  const foodId = params.id as string;
  const [data, setData] = useState<FoodDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const location = localStorage.getItem('seasonscope_location') || 'US';
    const month = new Date().getMonth() + 1;

    // Fetch food detail + recommendations for alternatives
    Promise.all([
      fetch(`/api/foods/${foodId}?region=${location}&month=${month}`).then((r) => r.json()),
      fetch(`/api/recommendations?region=${location}&month=${month}`).then((r) => r.json()),
    ])
      .then(([detail, recs]) => {
        const allAlts: FoodCardData[] = [
          ...(recs.lowestCo2e || []),
          ...(recs.inSeason || []),
        ];
        const alternatives = allAlts
          .filter(
            (a: FoodCardData) =>
              a.food.id !== foodId &&
              a.food.category === detail.card?.food?.category
          )
          .slice(0, 4);

        setData({
          card: detail.card,
          seasonality: detail.seasonality || [],
          sources: detail.sources || [],
          alternatives,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [foodId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 container-page py-8">
          <Skeleton variant="text" className="w-32 h-5 mb-6" />
          <Skeleton variant="text" className="w-64 h-8 mb-4" />
          <Skeleton variant="rectangular" className="w-full h-48 mb-6" />
          <Skeleton variant="rectangular" className="w-full h-32 mb-6" />
          <Skeleton variant="rectangular" className="w-full h-40" />
        </main>
        <Footer />
      </>
    );
  }

  if (!data?.card) {
    return (
      <>
        <Navbar />
        <main className="flex-1 container-page py-16 text-center">
          <p className="text-stone-500">Food not found.</p>
          <Link href="/browse" className="text-emerald-600 hover:underline text-sm mt-2 inline-block">
            Browse all foods
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const { card, seasonality, sources, alternatives } = data;
  const displayName = card.food.canonical_name.replace(/_/g, ' ');
  const currentMonth = new Date().getMonth() + 1;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-page py-6 sm:py-8">
          {/* Back link */}
          <Link
            href="/browse"
            className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to browse
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 capitalize">
                {displayName}
              </h1>
              <p className="text-sm text-stone-400 capitalize mt-1">
                {card.food.category.replace(/_/g, ' ')}
                {card.food.typical_serving_g && (
                  <> &middot; Typical serving: {card.food.typical_serving_g}g</>
                )}
              </p>
            </div>
            <Link
              href={`/compare?a=${card.food.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-xl hover:bg-emerald-800 transition-colors shadow-sm"
            >
              <Scale size={14} />
              Compare
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* CO2e card */}
              <div className="rounded-2xl bg-white border border-stone-200/60 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={18} className="text-stone-500" />
                  <h2 className="text-lg font-semibold text-stone-900">
                    Carbon Footprint
                  </h2>
                </div>

                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-3xl font-bold text-stone-900">
                    {card.ghg.value_mid.toFixed(1)}
                  </span>
                  <span className="text-sm text-stone-500">
                    {card.ghg.unit}
                  </span>
                  <Badge variant={getCo2eBadgeVariant(card.ghg.value_mid)} />
                </div>

                <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
                  <span>
                    Range: {card.ghg.value_min.toFixed(1)} – {card.ghg.value_max.toFixed(1)} {card.ghg.unit}
                  </span>
                  <Badge variant={`quality_${card.ghg.quality_score}` as any} />
                </div>

                {card.food.typical_serving_g > 0 && card.ghg.value_mid > 0 && (
                  <p className="text-sm text-stone-400">
                    Per serving ({card.food.typical_serving_g}g):{' '}
                    <span className="font-medium text-stone-600">
                      {((card.ghg.value_mid * card.food.typical_serving_g) / 1000).toFixed(2)} kg CO₂e
                    </span>
                  </p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {card.seasonality && card.seasonality.in_season_probability >= 0.5 && (
                    <Badge variant="in_season" />
                  )}
                  {card.water_risk && (
                    <Badge
                      variant={getWaterRiskBadgeVariant(card.water_risk.bucket)}
                      label={`Water risk: ${card.water_risk.bucket.replace(/_/g, ' ')}`}
                    />
                  )}
                  {card.heated_greenhouse_likely && (
                    <Badge variant="greenhouse" />
                  )}
                </div>
              </div>

              {/* Season calendar */}
              {seasonality.length > 0 && (
                <div className="rounded-2xl bg-white border border-stone-200/60 shadow-sm p-6">
                  <SeasonCalendar
                    data={seasonality}
                    currentMonth={currentMonth}
                  />
                </div>
              )}

              {/* Explanation panel */}
              <div className="rounded-2xl bg-white border border-stone-200/60 shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50/50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-stone-700">
                    <Lightbulb size={16} className="text-amber-500" />
                    Why this recommendation?
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-stone-400 transition-transform duration-200 ${
                      showExplanation ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showExplanation && (
                  <div className="px-6 pb-6 space-y-3 text-sm text-stone-600 border-t border-stone-100 pt-4 animate-slide-up">
                    <div>
                      <h4 className="font-medium text-stone-800 mb-1">Production Emissions</h4>
                      <p>
                        The CO₂e value represents lifecycle greenhouse gas emissions including
                        farming, processing, and packaging. Values are from global meta-analysis
                        (Poore & Nemecek 2018) unless region-specific data is available.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-stone-800 mb-1">Transport</h4>
                      <p>
                        Transport typically contributes a small fraction of total food emissions
                        (&lt;10% for most foods), though this varies. Air-freighted goods
                        (e.g., out-of-season berries) can have significantly higher transport emissions.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-stone-800 mb-1">Seasonality</h4>
                      <p>
                        Seasonality data is based on FAO crop calendars and regional growing patterns.
                        In-season produce is more likely to be locally sourced and less likely to
                        require heated greenhouse production or long-distance air freight.
                      </p>
                    </div>

                    {card.heated_greenhouse_likely && (
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                        <h4 className="font-medium text-amber-800 mb-1">
                          Heated Greenhouse Warning
                        </h4>
                        <p className="text-amber-700 text-xs">
                          In cold-climate regions during winter, growing warm-season crops locally
                          often requires heated greenhouses. Research (Theurl et al. 2014) shows that
                          greenhouse heating can dominate emissions, sometimes exceeding the carbon
                          cost of importing from warmer regions. Consider alternatives or imports
                          from closer warm-climate regions.
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-stone-800 mb-1">Assumptions & Uncertainty</h4>
                      <ul className="list-disc list-inside text-xs text-stone-500 space-y-1">
                        <li>Global averages may not reflect local production conditions</li>
                        <li>Range values ({card.ghg.value_min.toFixed(1)}–{card.ghg.value_max.toFixed(1)}) capture known variability across studies</li>
                        <li>Water-risk badges reflect regional water stress, not crop-specific water use</li>
                        <li>Seasonality probabilities are approximations based on growing region data</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Citations */}
              <CitationsPanel citations={sources} defaultOpen={false} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Lower impact alternatives */}
              {alternatives.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                    <Info size={14} className="text-emerald-600" />
                    Lower-impact alternatives now
                  </h3>
                  <div className="space-y-3">
                    {alternatives.map((alt) => (
                      <FoodCard key={alt.food.id} data={alt} showCategory={false} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
