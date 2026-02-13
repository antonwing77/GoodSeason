'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Leaf, Menu, X } from 'lucide-react';
import { getMonthName } from '@seasonscope/shared';

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: getMonthName(i + 1),
}));

export function Navbar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<
    { food_id: string; canonical_name: string; category: string }[]
  >([]);
  const [showResults, setShowResults] = useState(false);
  const [location, setLocation] = useState('');
  const [adminRegion, setAdminRegion] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Detect user location on mount
  useEffect(() => {
    // Try to get stored location
    const stored = localStorage.getItem('seasonscope_location_context');
    if (stored) {
      const parsed = JSON.parse(stored);
      setLocation(parsed.country_code ?? 'US');
      setAdminRegion(parsed.admin_region ?? '');
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`
            );
            const data = await res.json();
            const loc = data.countryCode || 'US';
            const admin = data.principalSubdivisionCode?.replace(`${loc}-`, '') || '';
            setLocation(loc);
            setAdminRegion(admin);
            localStorage.setItem('seasonscope_location_context', JSON.stringify({ country_code: loc, admin_region: admin }));
          } catch {
            setLocation('US');
          }
        },
        () => setLocation('US')
      );
    }
  }, []);

  // Search with debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchTerm)}&limit=8`
        );
        const data = await res.json();
        setSearchResults(data.results || []);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      }
    }, 200);

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectFood = (foodId: string) => {
    setShowResults(false);
    setSearchTerm('');
    router.push(`/food/${foodId}`);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone-200/60">
      <div className="container-page">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Leaf size={24} className="text-emerald-600" />
            <span className="text-lg font-bold text-stone-900 hidden sm:block">
              GoodSeason
            </span>
          </Link>

          {/* Search bar */}
          <div ref={searchRef} className="flex-1 max-w-xl relative">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                placeholder="Search foods..."
                className="w-full h-10 pl-10 pr-4 bg-stone-100/80 border border-stone-200/60 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all"
                aria-label="Search foods"
              />
            </div>

            {/* Search results dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-stone-200 shadow-lg overflow-hidden z-50 animate-fade-in">
                {searchResults.map((r) => (
                  <button
                    key={r.food_id}
                    onClick={() => handleSelectFood(r.food_id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-stone-50 transition-colors"
                  >
                    <span className="font-medium text-stone-800 capitalize">
                      {r.canonical_name.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-stone-400 capitalize">
                      {r.category.replace(/_/g, ' ')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location + month selectors (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-100/80 rounded-lg text-sm">
              <MapPin size={14} className="text-stone-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value.toUpperCase());
                  localStorage.setItem('seasonscope_location_context', JSON.stringify({ country_code: e.target.value.toUpperCase(), admin_region: adminRegion }));
                }}
                className="w-12 bg-transparent text-stone-700 font-medium focus:outline-none"
                placeholder="US"
                maxLength={5}
                aria-label="Country code"
              />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-100/80 rounded-lg text-sm">
              <input
                type="text"
                value={adminRegion}
                onChange={(e) => {
                  setAdminRegion(e.target.value.toUpperCase());
                  localStorage.setItem('seasonscope_location_context', JSON.stringify({ country_code: location, admin_region: e.target.value.toUpperCase() }));
                }}
                className="w-16 bg-transparent text-stone-700 font-medium focus:outline-none"
                placeholder="State"
                maxLength={6}
                aria-label="State or admin region"
              />
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-100/80 rounded-lg text-sm">
              <Calendar size={14} className="text-stone-400" />
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-transparent text-stone-700 font-medium focus:outline-none cursor-pointer"
                aria-label="Month"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/browse"
              className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/compare"
              className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Compare
            </Link>
            <Link
              href="/data-sources"
              className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Data
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-100 animate-slide-up">
            <div className="flex gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-100/80 rounded-lg text-sm flex-1">
                <MapPin size={14} className="text-stone-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value.toUpperCase());
                    localStorage.setItem('seasonscope_location_context', JSON.stringify({ country_code: e.target.value.toUpperCase(), admin_region: adminRegion }));
                  }}
                  className="w-full bg-transparent text-stone-700 font-medium focus:outline-none"
                  placeholder="Country code"
                  maxLength={5}
                  aria-label="Country code"
                />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-100/80 rounded-lg text-sm flex-1">
                <input
                  type="text"
                  value={adminRegion}
                  onChange={(e) => {
                    setAdminRegion(e.target.value.toUpperCase());
                    localStorage.setItem('seasonscope_location_context', JSON.stringify({ country_code: location, admin_region: e.target.value.toUpperCase() }));
                  }}
                  className="w-full bg-transparent text-stone-700 font-medium focus:outline-none"
                  placeholder="State"
                  maxLength={6}
                  aria-label="State or admin region"
                />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-100/80 rounded-lg text-sm flex-1">
                <Calendar size={14} className="text-stone-400" />
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full bg-transparent text-stone-700 font-medium focus:outline-none"
                  aria-label="Month"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Link href="/browse" className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Browse Foods
              </Link>
              <Link href="/compare" className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Compare
              </Link>
              <Link href="/data-sources" className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Data Sources
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
