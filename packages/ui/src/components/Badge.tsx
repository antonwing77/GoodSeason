import React from 'react';
import { clsx } from 'clsx';

export type BadgeVariant =
  | 'in_season'
  | 'off_season'
  | 'co2e_low'
  | 'co2e_medium'
  | 'co2e_high'
  | 'quality_high'
  | 'quality_medium'
  | 'quality_low'
  | 'water_risk_low'
  | 'water_risk_medium'
  | 'water_risk_high'
  | 'greenhouse';

const variantClasses: Record<BadgeVariant, string> = {
  in_season:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  off_season:        'bg-stone-100 text-stone-500 border-stone-200',
  co2e_low:          'bg-emerald-50 text-emerald-700 border-emerald-200',
  co2e_medium:       'bg-amber-50 text-amber-700 border-amber-200',
  co2e_high:         'bg-red-50 text-red-600 border-red-200',
  quality_high:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  quality_medium:    'bg-amber-50 text-amber-700 border-amber-200',
  quality_low:       'bg-stone-100 text-stone-500 border-stone-200',
  water_risk_low:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  water_risk_medium: 'bg-amber-50 text-amber-700 border-amber-200',
  water_risk_high:   'bg-orange-50 text-orange-700 border-orange-200',
  greenhouse:        'bg-amber-50 text-amber-700 border-amber-200',
};

const variantLabels: Record<BadgeVariant, string> = {
  in_season:         'In Season',
  off_season:        'Off Season',
  co2e_low:          'Low CO₂e',
  co2e_medium:       'Medium CO₂e',
  co2e_high:         'High CO₂e',
  quality_high:      'High Quality Data',
  quality_medium:    'Medium Quality Data',
  quality_low:       'Low Quality Data',
  water_risk_low:    'Low Water Risk',
  water_risk_medium: 'Medium Water Risk',
  water_risk_high:   'High Water Risk',
  greenhouse:        'Heated Greenhouse Likely',
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

export function Badge({ variant, label, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label={label ?? variantLabels[variant]}
    >
      {label ?? variantLabels[variant]}
    </span>
  );
}

// Utility to determine CO2e badge variant from value
export function getCo2eBadgeVariant(co2eMid: number): BadgeVariant {
  if (co2eMid < 2) return 'co2e_low';
  if (co2eMid < 10) return 'co2e_medium';
  return 'co2e_high';
}

// Utility to determine water risk badge variant
export function getWaterRiskBadgeVariant(
  bucket: string
): BadgeVariant {
  if (bucket === 'low' || bucket === 'low_medium') return 'water_risk_low';
  if (bucket === 'medium_high') return 'water_risk_medium';
  return 'water_risk_high';
}
