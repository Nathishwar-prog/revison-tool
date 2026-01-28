"use client";

import { useState, useMemo } from 'react';
import { useKnowledge } from '@/hooks/useKnowledge';
import { KnowledgeCard } from '@/components/KnowledgeCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { LoadingState, SkeletonCard } from '@/components/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SortAsc, SortDesc, BookOpen, Search } from 'lucide-react';

export default function KnowledgeList() {
  const { knowledge, loading, error } = useKnowledge();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    domain: '',
    technology: '',
    difficulty: '',
    confidence: '',
  });
  const [sortBy, setSortBy] = useState('nextRevision');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const domains = useMemo(() => 
    Array.from(new Set(knowledge.map(k => k?.domain || 'Unknown'))).sort()
  , [knowledge]);

  const technologies = useMemo(() => 
    Array.from(new Set(knowledge.map(k => k?.technology || 'General'))).sort()
  , [knowledge]);

  const filteredKnowledge = useMemo(() => {
    return knowledge.filter(item => {
      const title = item?.title || '';
      const tech = item?.technology || '';
      const tags = item?.tags || [];

      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tech.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tags.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDomain = !filters.domain || item?.domain === filters.domain;
      const matchesTech = !filters.technology || item?.technology === filters.technology;
      const matchesDifficulty = !filters.difficulty || item?.difficulty === filters.difficulty;
      const matchesConfidence = !filters.confidence || item?.confidenceLevel === parseInt(filters.confidence);

      return matchesSearch && matchesDomain && matchesTech && matchesDifficulty && matchesConfidence;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'nextRevision') {
        comparison = new Date(a?.revision?.nextRevision || 0).getTime() - new Date(b?.revision?.nextRevision || 0).getTime();
      } else if (sortBy === 'lastRevised') {
        comparison = new Date(a?.revision?.lastRevised || 0).getTime() - new Date(b?.revision?.lastRevised || 0).getTime();
      } else if (sortBy === 'title') {
        comparison = (a?.title || '').localeCompare(b?.title || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [knowledge, searchTerm, filters, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-9 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-10 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1 space-y-4">
            <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  if (knowledge.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Knowledge Library</h1>
        <EmptyState
          icon={BookOpen}
          title="Your knowledge library is empty"
          description="Start building your personal knowledge base. Add concepts, definitions, and code snippets to remember forever with spaced repetition."
          actionLabel="Add Your First Knowledge"
          actionHref="/knowledge/add"
          variant="knowledge"
        />
      </div>
    );
  }

  const hasActiveFilters = searchTerm || filters.domain || filters.technology || filters.difficulty || filters.confidence;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Knowledge Library</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="rounded-md p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none"
            >
              <option value="nextRevision">Due Date</option>
              <option value="lastRevised">Last Revised</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-6">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <FilterPanel 
            filters={filters} 
            setFilters={setFilters} 
            domains={domains} 
            technologies={technologies} 
          />
        </div>

        <div className="lg:col-span-3">
          {filteredKnowledge.length === 0 && hasActiveFilters ? (
            <EmptyState
              icon={Search}
              title="No matching results"
              description="Try adjusting your search terms or filters to find what you're looking for."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchTerm('');
                setFilters({ domain: '', technology: '', difficulty: '', confidence: '' });
              }}
              variant="default"
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {filteredKnowledge.map((item) => (
                <KnowledgeCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
