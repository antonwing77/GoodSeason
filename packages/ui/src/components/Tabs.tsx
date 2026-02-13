import React, { useState } from 'react';
import { clsx } from 'clsx';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div
      className={clsx('flex gap-1 bg-stone-100 rounded-xl p-1', className)}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={clsx(
            'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            activeTab === tab.id
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ id, activeTab, children, className }: TabPanelProps) {
  if (id !== activeTab) return null;
  return (
    <div role="tabpanel" aria-labelledby={id} className={className}>
      {children}
    </div>
  );
}
