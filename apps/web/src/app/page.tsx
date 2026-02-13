'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FoodCard } from '@/components/FoodCard';
import { FoodCardSkeleton } from '@seasonscope/ui';
import { getMonthName } from '@seasonscope/shared';
import type { FoodCardData } from '@seasonscope/shared';
import { Leaf, TrendingDown, Drumstick, Wheat, Droplets, MapPin } from 'lucide-react';

type TabId = 'in_season' | 'lowest_co2e' | 'protein' | 'staples';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'in_season', label: 'In Season', icon: <Leaf size={14} /> },
  { id: 'lowest_co2e', label: 'Lowest CO₂e', icon: <TrendingDown size={14} /> },
  { id: 'protein', label: 'Protein Choices', icon: <Drumstick size={14} /> },
  { id: 'staples', label: 'Staples', icon: <Wheat size={14} /> },
];

interface Recommendations {
  inSeason: FoodCardData[];
  lowestCo2e: FoodCardData[];
  proteinChoices: FoodCardData[];
  staples: FoodCardData[];
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>('in_season');
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('US');
  const [adminRegion, setAdminRegion] = useState('');
  const [month] = useState(new Date().getMonth() + 1);
  const [dietFilter, setDietFilter] = useState<'all' | 'vegetarian' | 'vegan'>('all');
  const [avoidHighWater, setAvoidHighWater] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('seasonscope_location_context');
    if (stored) {
      const parsed = JSON.parse(stored);
      setLocation(parsed.country_code || 'US');
      setAdminRegion(parsed.admin_region || '');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const regionCode = location === 'US' && adminRegion ? `US-${adminRegion}` : location;
    fetch(`/api/recommendations?region=${regionCode}&month=${month}`)
      .then((res) => res.json())
      .then((data) => {
        setRecommendations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location, adminRegion, month]);

  const filterItems = (items: FoodCardData[]): FoodCardData[] => {
    let filtered = items;
    if (dietFilter === 'vegetarian') {
      filtered = filtered.filter((i) => i.food.category !== 'meat');
    } else if (dietFilter === 'vegan') {
      filtered = filtered.filter(
        (i) => i.food.category !== 'meat' && i.food.category !== 'dairy'
      );
    }
    if (avoidHighWater) {
      filtered = filtered.filter(
        (i) =>
          !i.water_risk ||
          (i.water_risk.bucket !== 'high' && i.water_risk.bucket !== 'extremely_high')
      );
    }
    return filtered;
  };

  const getActiveItems = (): FoodCardData[] => {
    if (!recommendations) return [];
    const map: Record<TabId, FoodCardData[]> = {
      in_season: recommendations.inSeason,
      lowest_co2e: recommendations.lowestCo2e,
      protein: recommendations.proteinChoices,
      staples: recommendations.staples,
    };
    return filterItems(map[activeTab] || []);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="container-page pt-8 sm:pt-12 pb-6">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-stone-50 border border-emerald-100/60 p-6 sm:p-10">
            <div className="flex items-center gap-2 text-sm text-emerald-700 mb-2">
              <MapPin size={14} />
              <span className="font-medium">{location}{adminRegion ? `-${adminRegion}` : ''}</span>
              <span className="text-emerald-500">&middot;</span>
              <span>{getMonthName(month)}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-stone-900 mb-2 text-balance">
              What&apos;s best to buy this month?
            </h1>
            <p className="text-stone-500 text-sm sm:text-base max-w-2xl">
              Personalized seasonal food guidance based on your location. See what&apos;s in
              season, compare carbon footprints, and make informed choices &mdash; all
              backed by cited data.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="container-page pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-stone-500 font-medium mr-1">Filters:</span>
            {(['all', 'vegetarian', 'vegan'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDietFilter(d)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors capitalize ${
                  dietFilter === d
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                }`}
              >
                {d === 'all' ? 'Omnivore' : d}
              </button>
            ))}
            <button
              onClick={() => setAvoidHighWater(!avoidHighWater)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                avoidHighWater
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
              }`}
            >
              <Droplets size={12} />
              Avoid high water-risk
            </button>
          </div>
        </section>

        {/* Tabs */}
        <section className="container-page pb-2">
          <div className="flex gap-1 bg-stone-100/80 rounded-xl p-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Food Grid */}
        <section className="container-page py-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <FoodCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {getActiveItems().length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getActiveItems().map((item) => (
                    <FoodCard key={item.food.id} data={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Leaf size={40} className="mx-auto text-stone-300 mb-3" />
                  <p className="text-stone-500 text-sm">
                    No items found for this selection. Try adjusting your filters or location.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
