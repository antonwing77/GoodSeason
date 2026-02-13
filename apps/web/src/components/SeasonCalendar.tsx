'use client';

import React from 'react';
import { clsx } from 'clsx';
import { getMonthName } from '@seasonscope/shared';

interface SeasonCalendarProps {
  data: { month: number; probability: number }[];
  currentMonth?: number;
  className?: string;
}

function getHeatmapLevel(probability: number): number {
  if (probability >= 0.9) return 5;
  if (probability >= 0.7) return 4;
  if (probability >= 0.5) return 3;
  if (probability >= 0.3) return 2;
  if (probability > 0) return 1;
  return 0;
}

export function SeasonCalendar({
  data,
  currentMonth = new Date().getMonth() + 1,
  className,
}: SeasonCalendarProps) {
  // Build all 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const entry = data.find((d) => d.month === month);
    return {
      month,
      name: getMonthName(month).slice(0, 3),
      probability: entry?.probability ?? 0,
    };
  });

  return (
    <div className={clsx('space-y-2', className)}>
      <h4 className="text-sm font-medium text-stone-700">Best months to buy locally</h4>
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
        {months.map((m) => {
          const level = getHeatmapLevel(m.probability);
          const isCurrent = m.month === currentMonth;

          return (
            <div
              key={m.month}
              className={clsx(
                'flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors',
                isCurrent && 'ring-2 ring-emerald-400 ring-offset-1'
              )}
              title={`${getMonthName(m.month)}: ${Math.round(m.probability * 100)}% in-season probability`}
            >
              <div
                className={clsx(
                  'w-full aspect-square rounded-md',
                  `heatmap-${level}`
                )}
              />
              <span className="text-[10px] text-stone-500 font-medium">
                {m.name}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 text-[10px] text-stone-400 pt-1">
        <span>Less likely</span>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4, 5].map((l) => (
            <div key={l} className={clsx('w-3 h-3 rounded-sm', `heatmap-${l}`)} />
          ))}
        </div>
        <span>More likely</span>
      </div>
    </div>
  );
}
