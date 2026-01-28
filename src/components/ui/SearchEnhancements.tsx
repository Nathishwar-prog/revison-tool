"use client";

import { motion } from 'framer-motion';

export function highlightText(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm || !text) return text;
  
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  
  return parts.map((part, i) => 
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-inherit rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

interface FilterPreset {
  id: string;
  name: string;
  filters: {
    domain?: string;
    technology?: string;
    difficulty?: string;
    confidence?: string;
  };
}

const DEFAULT_PRESETS: FilterPreset[] = [
  { id: 'weak', name: 'Weak Areas', filters: { confidence: '1' } },
  { id: 'beginner', name: 'Beginner', filters: { difficulty: 'Beginner' } },
  { id: 'advanced', name: 'Advanced', filters: { difficulty: 'Advanced' } },
];

export function SavedFiltersPresets({ 
  onApply, 
  activePreset 
}: { 
  onApply: (filters: FilterPreset['filters']) => void;
  activePreset?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Quick Filters</p>
      <div className="flex flex-wrap gap-2">
        {DEFAULT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onApply(preset.filters)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
              activePreset === preset.id
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HoverPreviewCard({ 
  item, 
  children 
}: { 
  item: any;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      {children}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        whileHover={{ opacity: 1, y: 0, scale: 1 }}
        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-1">
          {item?.technology}
        </p>
        <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">{item?.title}</h4>
        {item?.content?.definition && (
          <p className="text-xs text-zinc-500 line-clamp-3">{item.content.definition}</p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            item?.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
            item?.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {item?.difficulty}
          </span>
          <span className="text-xs text-zinc-400">
            Confidence: {item?.confidenceLevel}/5
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export function PullToRefresh({ 
  onRefresh, 
  children 
}: { 
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="md:hidden text-center py-2 text-xs text-zinc-400">
        Pull down to refresh
      </div>
      {children}
    </div>
  );
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: 'streak' | 'revision' | 'knowledge';
  xpReward: number;
  endDate: string;
}

const WEEKLY_CHALLENGES: Omit<WeeklyChallenge, 'current' | 'endDate'>[] = [
  { id: 'streak_7', title: '7-Day Streak', description: 'Revise every day for a week', target: 7, type: 'streak', xpReward: 500 },
  { id: 'revision_50', title: 'Revision Master', description: 'Complete 50 revisions this week', target: 50, type: 'revision', xpReward: 300 },
  { id: 'knowledge_10', title: 'Knowledge Builder', description: 'Add 10 new knowledge entries', target: 10, type: 'knowledge', xpReward: 250 },
];

export function WeeklyChallengesCard({ 
  currentStreak, 
  revisionsThisWeek, 
  knowledgeThisWeek 
}: { 
  currentStreak: number;
  revisionsThisWeek: number;
  knowledgeThisWeek: number;
}) {
  const challenges: WeeklyChallenge[] = WEEKLY_CHALLENGES.map(c => ({
    ...c,
    current: c.type === 'streak' ? currentStreak : 
             c.type === 'revision' ? revisionsThisWeek : 
             knowledgeThisWeek,
    endDate: getEndOfWeek().toISOString(),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 dark:border-amber-800/50 dark:from-amber-900/20 dark:to-orange-900/20"
    >
      <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">
        <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        Weekly Challenges
      </h3>
      <p className="text-xs text-zinc-500 mb-4">
        Ends {new Date(challenges[0].endDate).toLocaleDateString('en-US', { weekday: 'long' })}
      </p>
      <div className="space-y-4">
        {challenges.map((challenge) => {
          const progress = Math.min((challenge.current / challenge.target) * 100, 100);
          const isComplete = challenge.current >= challenge.target;
          
          return (
            <div key={challenge.id} className={`p-4 rounded-xl ${isComplete ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-white/50 dark:bg-zinc-800/50'}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className={`font-bold ${isComplete ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {challenge.title}
                    {isComplete && ' ✓'}
                  </h4>
                  <p className="text-xs text-zinc-500">{challenge.description}</p>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  +{challenge.xpReward} XP
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  />
                </div>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {challenge.current}/{challenge.target}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function getEndOfWeek(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilSunday = 7 - dayOfWeek;
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
}

export function LeaderboardCard({ 
  entries 
}: { 
  entries: Array<{ id: string; name: string; xp: number; level: number; rank: number }>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 dark:border-purple-800/50 dark:from-purple-900/20 dark:to-indigo-900/20"
    >
      <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">
        <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Leaderboard
      </h3>
      <div className="space-y-3">
        {entries.slice(0, 5).map((entry, index) => (
          <div 
            key={entry.id} 
            className={`flex items-center gap-3 p-3 rounded-xl ${
              index === 0 ? 'bg-amber-100 dark:bg-amber-900/30' :
              index === 1 ? 'bg-zinc-100 dark:bg-zinc-800/50' :
              index === 2 ? 'bg-orange-100 dark:bg-orange-900/30' :
              'bg-white/50 dark:bg-zinc-800/30'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              index === 0 ? 'bg-amber-500 text-white' :
              index === 1 ? 'bg-zinc-400 text-white' :
              index === 2 ? 'bg-orange-500 text-white' :
              'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
            }`}>
              {entry.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{entry.name}</p>
              <p className="text-xs text-zinc-500">Level {entry.level}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-purple-600 dark:text-purple-400">{entry.xp.toLocaleString()}</p>
              <p className="text-xs text-zinc-400">XP</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
