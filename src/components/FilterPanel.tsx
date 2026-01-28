"use client";

import { Filter, X } from 'lucide-react';

export function FilterPanel({ filters, setFilters, domains, technologies }: {
  filters: any;
  setFilters: (f: any) => void;
  domains: string[];
  technologies: string[];
}) {
  const clearFilters = () => {
    setFilters({
      domain: '',
      technology: '',
      difficulty: '',
      confidence: '',
    });
  };

  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Domain</label>
          <select
            value={filters.domain}
            onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
          >
            <option value="">All Domains</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Technology</label>
          <select
            value={filters.technology}
            onChange={(e) => setFilters({ ...filters, technology: e.target.value })}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
          >
            <option value="">All Tech</option>
            {technologies.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Difficulty</label>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Confidence</label>
          <select
            value={filters.confidence}
            onChange={(e) => setFilters({ ...filters, confidence: e.target.value })}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
          >
            <option value="">All Confidence</option>
            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>Level {v}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
