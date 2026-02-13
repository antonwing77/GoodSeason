import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-stone-200/70',
        variant === 'text' && 'rounded-md h-4',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-xl',
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
      role="presentation"
    />
  );
}

export function FoodCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-stone-200/60 shadow-sm p-5 space-y-3">
      <Skeleton variant="text" className="w-2/3 h-5" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" className="w-20 h-6" />
        <Skeleton variant="rectangular" className="w-16 h-6" />
      </div>
      <Skeleton variant="text" className="w-1/2 h-4" />
      <Skeleton variant="text" className="w-3/4 h-4" />
    </div>
  );
}
