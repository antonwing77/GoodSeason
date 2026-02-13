'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Badge, getCo2eBadgeVariant, getWaterRiskBadgeVariant, CitationsPanel, Skeleton } from '@seasonscope/ui';
import type { FoodCardData } from '@seasonscope/shared';
import { Scale, ArrowRight, BarChart3, Droplets, Search, Lightbulb, AlertTriangle } from 'lucide-react';

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="container-page py-16 text-center text-stone-400">Loading...</div>}>
      <ComparePageContent />
    </Suspense>
  );
}

function ComparePageContent() {
  const searchParams = useSearchParams();
  const initialA = searchParams.get('a') || '';
  const initialB = searchParams.get('b') || '';

  const [foodA, setFoodA] = useState<FoodCardData | null>(null);
  const [foodB, setFoodB] = useState<FoodCardData | null>(null);
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [resultsA, setResultsA] = useState<{ food_id: string; canonical_name: string }[]>([]);
  const [resultsB, setResultsB] = useState<{ food_id: string; canonical_name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFood = async (id: string): Promise<FoodCardData | null> => {
    const location = localStorage.getItem('seasonscope_location') || 'US';
    const month = new Date().getMonth() + 1;
    try {
      const res = await fetch(`/api/foods/${id}?region=${location}&month=${month}`);
      const data = await res.json();
      return data.card || null;
    } catch {
      return null;
    }
  };

  const searchFoods = async (term: string, setter: (r: any[]) => void) => {
    if (!term.trim()) { setter([]); return; }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=6`);
      const data = await res.json();
      setter(data.results || []);
    } catch {
      setter([]);
    }
  };

  useEffect(() => {
    if (initialA) fetchFood(initialA).then(setFoodA);
    if (initialB) fetchFood(initialB).then(setFoodB);
  }, [initialA, initialB]);

  const selectFood = async (id: string, side: 'a' | 'b') => {
    setLoading(true);
    const food = await fetchFood(id);
    if (side === 'a') {
      setFoodA(food);
      setSearchA('');
      setResultsA([]);
    } else {
      setFoodB(food);
      setSearchB('');
      setResultsB([]);
    }
    setLoading(false);
  };

  const winner = foodA && foodB
    ? foodA.ghg.value_mid <= foodB.ghg.value_mid ? 'a' : 'b'
    : null;

  const renderFoodColumn = (
    food: FoodCardData | null,
    side: 'a' | 'b',
    search: string,
    setSearch: (s: string) => void,
    results: any[],
    setResults: (r: any[]) => void
  ) => (
    <div className="flex-1 min-w-0">
      {/* Search */}
      <div className="relative mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              searchFoods(e.target.value, setResults);
            }}
            placeholder="Search a food..."
            className="w-full h-10 pl-9 pr-4 bg-stone-100/80 border border-stone-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300"
          />
        </div>
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-stone-200 shadow-lg z-50 overflow-hidden">
            {results.map((r: any) => (
              <button
                key={r.food_id}
                onClick={() => selectFood(r.food_id, side)}
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-stone-50 capitalize"
              >
                {r.canonical_name.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {food ? (
        <div className={`rounded-2xl bg-white border-2 shadow-sm p-5 transition-colors ${
          winner === side ? 'border-emerald-300 bg-emerald-50/30' : 'border-stone-200'
        }`}>
          <h3 className="text-lg font-semibold text-stone-900 capitalize mb-3">
            {food.food.canonical_name.replace(/_/g, ' ')}
          </h3>

          <div className="space-y-3">
            {/* CO2e */}
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-stone-400" />
              <span className="text-2xl font-bold text-stone-900">
                {food.ghg.value_mid.toFixed(1)}
              </span>
              <span className="text-xs text-stone-500">{food.ghg.unit}</span>
            </div>
            <p className="text-xs text-stone-400">
              Range: {food.ghg.value_min.toFixed(1)} – {food.ghg.value_max.toFixed(1)}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={getCo2eBadgeVariant(food.ghg.value_mid)} />
              {food.seasonality && food.seasonality.in_season_probability >= 0.5 && (
                <Badge variant="in_season" />
              )}
              {food.water_risk && (
                <Badge variant={getWaterRiskBadgeVariant(food.water_risk.bucket)} />
              )}
              {food.heated_greenhouse_likely && (
                <Badge variant="greenhouse" />
              )}
              <Badge variant={`quality_${food.ghg.quality_score}` as any} />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 p-8 text-center">
          <Scale size={24} className="mx-auto text-stone-300 mb-2" />
          <p className="text-sm text-stone-400">Search and select a food</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-page py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
            Compare Foods
          </h1>
          <p className="text-stone-500 text-sm mb-8 max-w-xl">
            Compare the environmental impact of two food options side by side.
            See which option has a lower carbon footprint under stated assumptions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {renderFoodColumn(foodA, 'a', searchA, setSearchA, resultsA, setResultsA)}

            <div className="flex-shrink-0 flex items-center justify-center sm:mt-20">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                <ArrowRight size={16} className="text-stone-400 rotate-90 sm:rotate-0" />
              </div>
            </div>

            {renderFoodColumn(foodB, 'b', searchB, setSearchB, resultsB, setResultsB)}
          </div>

          {/* Comparison result */}
          {foodA && foodB && (
            <div className="mt-8 space-y-4 animate-slide-up">
              {/* Winner summary */}
              <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-stone-50 border border-emerald-100 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-emerald-600" />
                  <h3 className="font-semibold text-stone-900">Comparison Result</h3>
                </div>
                <p className="text-sm text-stone-600">
                  <span className="font-medium capitalize">
                    {(winner === 'a' ? foodA : foodB).food.canonical_name.replace(/_/g, ' ')}
                  </span>{' '}
                  has a lower estimated carbon footprint at{' '}
                  <span className="font-medium">
                    {(winner === 'a' ? foodA : foodB).ghg.value_mid.toFixed(1)} kg CO₂e/kg
                  </span>{' '}
                  vs{' '}
                  <span className="font-medium">
                    {(winner === 'a' ? foodB : foodA).ghg.value_mid.toFixed(1)} kg CO₂e/kg
                  </span>.
                </p>

                {/* Caveats */}
                <div className="mt-4 flex items-start gap-2 text-xs text-stone-500">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
                  <p>
                    This comparison uses global average data and may not reflect your specific
                    sourcing. Values capture production emissions; actual impact depends on
                    transport, storage, waste, and production system. See assumptions below.
                  </p>
                </div>
              </div>

              {/* Why section */}
              <div className="rounded-2xl bg-white border border-stone-200/60 shadow-sm p-6 text-sm text-stone-600 space-y-3">
                <h3 className="font-semibold text-stone-900">Why?</h3>

                <div>
                  <h4 className="font-medium text-stone-700">Production</h4>
                  <p>
                    Production (farming, feed, fertilizer, land use) typically accounts for the
                    majority of food emissions. For {foodA.food.canonical_name.replace(/_/g, ' ')}: ~{foodA.ghg.value_mid.toFixed(1)} kg CO₂e/kg;
                    for {foodB.food.canonical_name.replace(/_/g, ' ')}: ~{foodB.ghg.value_mid.toFixed(1)} kg CO₂e/kg.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-stone-700">Transport</h4>
                  <p>
                    Transport is generally a minor fraction of total emissions (&lt;10%), except
                    for air-freighted produce. Both items would have similar transport profiles
                    if sourced from comparable regions.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-stone-700">Seasonality</h4>
                  <p>
                    {foodA.seasonality?.in_season_probability
                      ? `${foodA.food.canonical_name.replace(/_/g, ' ')} is ${foodA.seasonality.in_season_probability >= 0.5 ? 'currently in season' : 'not currently in peak season'}.`
                      : `Seasonality data not available for ${foodA.food.canonical_name.replace(/_/g, ' ')}.`
                    }{' '}
                    {foodB.seasonality?.in_season_probability
                      ? `${foodB.food.canonical_name.replace(/_/g, ' ')} is ${foodB.seasonality.in_season_probability >= 0.5 ? 'currently in season' : 'not currently in peak season'}.`
                      : `Seasonality data not available for ${foodB.food.canonical_name.replace(/_/g, ' ')}.`
                    }
                  </p>
                </div>

                {/* Water risk warning */}
                {(foodA.water_risk?.bucket === 'high' || foodA.water_risk?.bucket === 'extremely_high' ||
                  foodB.water_risk?.bucket === 'high' || foodB.water_risk?.bucket === 'extremely_high') && (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 flex items-start gap-2">
                    <Droplets size={14} className="flex-shrink-0 mt-0.5 text-amber-600" />
                    <p className="text-xs text-amber-700">
                      One or both items may be sourced from water-stressed regions. This is a risk
                      indicator, not a moral verdict. Water stress depends on the specific origin
                      and irrigation practices.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
