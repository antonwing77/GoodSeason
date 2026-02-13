'use client';

import React from 'react';
import Link from 'next/link';
import { Droplets, Thermometer, BarChart3 } from 'lucide-react';
import { Badge, getCo2eBadgeVariant, getWaterRiskBadgeVariant } from '@seasonscope/ui';
import type { FoodCardData } from '@seasonscope/shared';

interface FoodCardProps {
  data: FoodCardData;
  showCategory?: boolean;
}

export function FoodCard({ data, showCategory = true }: FoodCardProps) {
  const { food, ghg, seasonality, water_risk, heated_greenhouse_likely } = data;
  const displayName = food.canonical_name.replace(/_/g, ' ');

  const co2eDisplay =
    ghg.value_mid > 0
      ? `${ghg.value_mid.toFixed(1)} kg CO₂e/kg`
      : 'No data';

  const co2eRange =
    ghg.value_min > 0 && ghg.value_max > 0
      ? `${ghg.value_min.toFixed(1)}–${ghg.value_max.toFixed(1)}`
      : null;

  return (
    <Link href={`/food/${food.id}`}>
      <div className="group rounded-2xl bg-white border border-stone-200/60 shadow-sm p-5 transition-all duration-200 hover:shadow-md hover:border-stone-300/80 hover:-translate-y-0.5 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-stone-900 capitalize group-hover:text-emerald-700 transition-colors">
              {displayName}
            </h3>
            {showCategory && (
              <p className="text-xs text-stone-400 capitalize mt-0.5">
                {food.category.replace(/_/g, ' ')}
              </p>
            )}
          </div>
          {seasonality && seasonality.in_season_probability >= 0.5 && (
            <Badge variant="in_season" />
          )}
          {seasonality &&
            seasonality.in_season_probability > 0 &&
            seasonality.in_season_probability < 0.5 && (
              <Badge variant="off_season" label="Partly in Season" />
            )}
        </div>

        {/* CO2e */}
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={14} className="text-stone-400" />
          <span className="text-sm font-medium text-stone-700">{co2eDisplay}</span>
          {ghg.value_mid > 0 && (
            <Badge variant={getCo2eBadgeVariant(ghg.value_mid)} />
          )}
        </div>

        {co2eRange && (
          <p className="text-xs text-stone-400 ml-5 mb-2">
            Range: {co2eRange} kg CO₂e/kg
          </p>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge
            variant={`quality_${ghg.quality_score}` as any}
          />

          {water_risk && (
            <Badge
              variant={getWaterRiskBadgeVariant(water_risk.bucket)}
              label={`Water Risk: ${water_risk.bucket.replace(/_/g, ' ')}`}
            />
          )}

          {heated_greenhouse_likely && (
            <Badge variant="greenhouse" />
          )}
        </div>
      </div>
    </Link>
  );
}
