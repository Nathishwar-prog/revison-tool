"use client";

import Link from 'next/link';
import { Calendar, Tag, ChevronRight, BookOpen, Star } from 'lucide-react';
import { formatDate, isDue } from '@/lib/dateUtils';

const domainColors: Record<string, string> = {
  'JavaScript': 'from-yellow-400 to-yellow-600',
  'TypeScript': 'from-blue-500 to-blue-700',
  'React': 'from-cyan-400 to-cyan-600',
  'Next.js': 'from-zinc-700 to-zinc-900',
  'Node.js': 'from-green-500 to-green-700',
  'Python': 'from-blue-400 to-yellow-500',
  'CSS': 'from-pink-400 to-purple-600',
  'HTML': 'from-orange-400 to-orange-600',
  'Database': 'from-emerald-500 to-teal-600',
  'DevOps': 'from-violet-500 to-purple-700',
  'General': 'from-indigo-500 to-purple-600',
};

function MasteryStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 transition-all ${
            star <= level
              ? 'fill-amber-400 text-amber-400'
              : 'fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700'
          }`}
        />
      ))}
    </div>
  );
}

export function KnowledgeCard({ item }: { item: any }) {
  const nextRevision = item?.revision?.nextRevision;
  const due = isDue(nextRevision);
  const confidenceLevel = item?.confidenceLevel ?? 3;
  const technology = item?.technology || 'General';
  const borderColor = domainColors[technology] || domainColors['General'];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:bg-zinc-900">
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${borderColor}`} />
      
      <div className="p-5 pl-6">
        <div className="mb-3 flex items-start justify-between">
          <MasteryStars level={confidenceLevel} />
          {due && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
              </span>
              Due
            </span>
          )}
        </div>

        <h3 className="mb-2 line-clamp-1 text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {item?.title || 'Untitled Concept'}
        </h3>
        
        <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {item?.content?.definition || 'No definition available.'}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center gap-1 rounded-lg bg-gradient-to-r ${borderColor} px-2.5 py-1 text-xs font-semibold text-white shadow-sm`}>
            <BookOpen className="h-3 w-3" />
            {technology}
          </span>
          {(item?.tags || []).slice(0, 2).map((tag: string) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>Next: {formatDate(nextRevision)}</span>
          </div>
          <Link
            href={`/knowledge/${item?.id}`}
            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 group-hover:gap-2 transition-all"
          >
            Details
            <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
