import React from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200/60 bg-white/50">
      <div className="container-page py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-stone-500">
            <Leaf size={16} className="text-emerald-600" />
            <span className="text-sm font-medium">GoodSeason</span>
            <span className="text-xs text-stone-400">
              &mdash; Guidance, not gospel. Always verify data.
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-stone-500">
            <Link
              href="/data-sources"
              className="hover:text-stone-700 transition-colors"
            >
              Data Sources & Methodology
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-700 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
        <p className="text-xs text-stone-400 text-center mt-4">
          All environmental data is approximate and subject to uncertainty.
          See our{' '}
          <Link href="/data-sources" className="underline hover:text-stone-500">
            methodology page
          </Link>{' '}
          for details and limitations.
        </p>
      </div>
    </footer>
  );
}
