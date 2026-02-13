'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FoodCard } from '@/components/FoodCard';
import { FoodCardSkeleton } from '@seasonscope/ui';
import type { FoodCardData, FoodCategory } from '@seasonscope/shared';
import { Apple, Beef, Milk, Wheat, Bean, Droplet } from 'lucide-react';

const CATEGORIES: { id: FoodCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all' as any, label: 'All', icon: null },
  { id: 'produce', label: 'Produce', icon: <Apple size={14} /> },
  { id: 'meat', label: 'Meat', icon: <Beef size={14} /> },
  { id: 'dairy', label: 'Dairy & Eggs', icon: <Milk size={14} /> },
  { id: 'grains', label: 'Grains', icon: <Wheat size={14} /> },
  { id: 'legumes', label: 'Legumes', icon: <Bean size={14} /> },
  { id: 'oils_sweeteners', label: 'Oils & Sweeteners', icon: <Droplet size={14} /> },
];

export default function BrowsePage() {
  const [category, setCategory] = useState<string>('all');
  const [foods, setFoods] = useState<FoodCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const location = localStorage.getItem('seasonscope_location') || 'US';
    const month = new Date().getMonth() + 1;
    const catParam = category !== 'all' ? `&category=${category}` : '';

    fetch(`/api/recommendations?region=${location}&month=${month}${catParam}&limit=200`)
      .then((res) => res.json())
      .then((data) => {
        // Combine all items, dedupe by food id
        const all: FoodCardData[] = [
          ...(data.inSeason || []),
          ...(data.lowestCo2e || []),
          ...(data.proteinChoices || []),
          ...(data.staples || []),
        ];
        const seen = new Set<string>();
        const deduped = all.filter((item) => {
          if (seen.has(item.food.id)) return false;
          seen.add(item.food.id);
          // Filter by category if needed
          if (category !== 'all' && item.food.category !== category) return false;
          return true;
        });
        setFoods(deduped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="container-page pt-8 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
            Browse Foods
          </h1>
          <p className="text-stone-500 text-sm max-w-xl">
            Explore our database of foods with carbon footprint data, seasonality
            information, and water-stress risk indicators.
          </p>
        </section>

        {/* Category tabs */}
        <section className="container-page pb-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 ${
                  category === cat.id
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Grid */}
        <section className="container-page pb-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <FoodCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <p className="text-xs text-stone-400 mb-4">
                {foods.length} items found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {foods.map((item) => (
                  <FoodCard key={item.food.id} data={item} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
