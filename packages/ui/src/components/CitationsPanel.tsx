import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ExternalLink, BookOpen } from 'lucide-react';

interface Citation {
  id: string;
  title: string;
  publisher: string;
  url: string;
  published_date?: string | null;
  accessed_date: string;
  license: string;
  notes?: string;
}

interface CitationsPanelProps {
  citations: Citation[];
  className?: string;
  defaultOpen?: boolean;
}

export function CitationsPanel({ citations, className, defaultOpen = false }: CitationsPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (citations.length === 0) return null;

  return (
    <div className={clsx('border border-stone-200 rounded-xl overflow-hidden', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <BookOpen size={16} className="text-stone-400" />
          Sources & Citations ({citations.length})
        </span>
        <ChevronDown
          size={16}
          className={clsx(
            'text-stone-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="divide-y divide-stone-100">
          {citations.map((c) => (
            <div key={c.id} className="px-4 py-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 leading-snug">{c.title}</p>
                  <p className="text-stone-500 mt-0.5">{c.publisher}</p>
                  {c.published_date && (
                    <p className="text-stone-400 text-xs mt-0.5">Published: {c.published_date}</p>
                  )}
                  <p className="text-stone-400 text-xs">Accessed: {c.accessed_date}</p>
                  {c.license && c.license !== 'Unknown' && (
                    <p className="text-stone-400 text-xs">License: {c.license}</p>
                  )}
                  {c.notes && (
                    <p className="text-stone-400 text-xs italic mt-0.5">{c.notes}</p>
                  )}
                </div>
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                    aria-label={`Open source: ${c.title}`}
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline citation marker for use within text
export function CitationMarker({
  sourceId,
  index,
  onClick,
}: {
  sourceId: string;
  index: number;
  onClick?: (sourceId: string) => void;
}) {
  return (
    <button
      onClick={() => onClick?.(sourceId)}
      className="inline-flex items-center justify-center w-4 h-4 ml-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors align-super"
      aria-label={`Citation ${index}`}
    >
      {index}
    </button>
  );
}
