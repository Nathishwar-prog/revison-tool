"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Flame, 
  Brain, 
  Target, 
  Zap, 
  Crown,
  Medal,
  Award,
  Sparkles,
  BookOpen,
  Calendar,
  TrendingUp,
  Lock
} from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  requirement: number;
  type: 'revision' | 'knowledge' | 'streak' | 'mastery';
  unlocked: boolean;
  progress: number;
  xpReward: number;
}

export interface UserProgress {
  xp: number;
  level: number;
  totalRevisions: number;
  totalKnowledge: number;
  currentStreak: number;
  masteredCount: number;
  achievements: string[];
}

const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'progress'>[] = [
  { id: 'first_revision', title: 'First Steps', description: 'Complete your first revision', icon: Star, color: 'text-amber-500', requirement: 1, type: 'revision', xpReward: 50 },
  { id: 'revision_10', title: 'Getting Started', description: 'Complete 10 revisions', icon: BookOpen, color: 'text-blue-500', requirement: 10, type: 'revision', xpReward: 100 },
  { id: 'revision_50', title: 'Knowledge Seeker', description: 'Complete 50 revisions', icon: Brain, color: 'text-purple-500', requirement: 50, type: 'revision', xpReward: 250 },
  { id: 'revision_100', title: 'Dedicated Learner', description: 'Complete 100 revisions', icon: Medal, color: 'text-indigo-500', requirement: 100, type: 'revision', xpReward: 500 },
  { id: 'revision_500', title: 'Master Scholar', description: 'Complete 500 revisions', icon: Crown, color: 'text-yellow-500', requirement: 500, type: 'revision', xpReward: 1000 },
  { id: 'knowledge_5', title: 'Collector', description: 'Add 5 knowledge entries', icon: Target, color: 'text-emerald-500', requirement: 5, type: 'knowledge', xpReward: 75 },
  { id: 'knowledge_25', title: 'Library Builder', description: 'Add 25 knowledge entries', icon: BookOpen, color: 'text-teal-500', requirement: 25, type: 'knowledge', xpReward: 200 },
  { id: 'knowledge_100', title: 'Knowledge Architect', description: 'Add 100 knowledge entries', icon: Award, color: 'text-cyan-500', requirement: 100, type: 'knowledge', xpReward: 750 },
  { id: 'streak_3', title: 'Consistency', description: 'Maintain a 3-day streak', icon: Flame, color: 'text-orange-500', requirement: 3, type: 'streak', xpReward: 100 },
  { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: Flame, color: 'text-red-500', requirement: 7, type: 'streak', xpReward: 300 },
  { id: 'streak_30', title: 'Monthly Champion', description: 'Maintain a 30-day streak', icon: Flame, color: 'text-rose-500', requirement: 30, type: 'streak', xpReward: 1000 },
  { id: 'mastery_5', title: 'Expert', description: 'Master 5 concepts (confidence 5)', icon: Trophy, color: 'text-amber-500', requirement: 5, type: 'mastery', xpReward: 150 },
  { id: 'mastery_25', title: 'Guru', description: 'Master 25 concepts', icon: Trophy, color: 'text-yellow-500', requirement: 25, type: 'mastery', xpReward: 500 },
  { id: 'mastery_100', title: 'Grandmaster', description: 'Master 100 concepts', icon: Crown, color: 'text-amber-400', requirement: 100, type: 'mastery', xpReward: 2000 },
];

const LEVELS = [
  { level: 1, xpRequired: 0, title: 'Novice' },
  { level: 2, xpRequired: 100, title: 'Apprentice' },
  { level: 3, xpRequired: 300, title: 'Student' },
  { level: 4, xpRequired: 600, title: 'Scholar' },
  { level: 5, xpRequired: 1000, title: 'Adept' },
  { level: 6, xpRequired: 1500, title: 'Expert' },
  { level: 7, xpRequired: 2500, title: 'Master' },
  { level: 8, xpRequired: 4000, title: 'Sage' },
  { level: 9, xpRequired: 6000, title: 'Guru' },
  { level: 10, xpRequired: 10000, title: 'Grandmaster' },
];

export function calculateLevel(xp: number): { level: number; title: string; progress: number; xpToNext: number } {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      const nextLevel = LEVELS[i + 1];
      const currentLevelXp = LEVELS[i].xpRequired;
      const progress = nextLevel 
        ? ((xp - currentLevelXp) / (nextLevel.xpRequired - currentLevelXp)) * 100
        : 100;
      const xpToNext = nextLevel ? nextLevel.xpRequired - xp : 0;
      return { level: LEVELS[i].level, title: LEVELS[i].title, progress, xpToNext };
    }
  }
  return { level: 1, title: 'Novice', progress: 0, xpToNext: 100 };
}

export function getAchievements(progress: UserProgress): Achievement[] {
  return ACHIEVEMENTS.map(achievement => {
    let currentProgress = 0;
    switch (achievement.type) {
      case 'revision':
        currentProgress = progress.totalRevisions;
        break;
      case 'knowledge':
        currentProgress = progress.totalKnowledge;
        break;
      case 'streak':
        currentProgress = progress.currentStreak;
        break;
      case 'mastery':
        currentProgress = progress.masteredCount;
        break;
    }
    return {
      ...achievement,
      unlocked: currentProgress >= achievement.requirement,
      progress: Math.min((currentProgress / achievement.requirement) * 100, 100),
    };
  });
}

export function AchievementBadge({ achievement, size = 'md' }: { achievement: Achievement; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = achievement.icon;
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };
  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-10 w-10',
  };

  return (
    <div className={`relative ${sizes[size]} rounded-2xl ${achievement.unlocked ? 'bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30' : 'bg-zinc-100 dark:bg-zinc-800'} flex items-center justify-center`}>
      {achievement.unlocked ? (
        <Icon className={`${iconSizes[size]} ${achievement.color}`} />
      ) : (
        <Lock className={`${iconSizes[size]} text-zinc-400`} />
      )}
      {!achievement.unlocked && achievement.progress > 0 && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full"
            style={{ width: `${achievement.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = achievement.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border p-5 ${
        achievement.unlocked 
          ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-800/50' 
          : 'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800'
      }`}
    >
      <div className="flex items-start gap-4">
        <AchievementBadge achievement={achievement} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold ${achievement.unlocked ? 'text-amber-700 dark:text-amber-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
              {achievement.title}
            </h3>
            {achievement.unlocked && (
              <Sparkles className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{achievement.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">+{achievement.xpReward} XP</span>
          </div>
        </div>
      </div>
      {!achievement.unlocked && achievement.progress > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(achievement.progress)}%</span>
          </div>
          <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${achievement.progress}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function XPLevelCard({ xp }: { xp: number }) {
  const { level, title, progress, xpToNext } = calculateLevel(xp);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:border-indigo-800/50 dark:from-indigo-900/30 dark:to-purple-900/30"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">{level}</span>
          </div>
          <div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Level {level}</p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{xp}</p>
          <p className="text-xs text-zinc-500">Total XP</p>
        </div>
      </div>

      {xpToNext > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
            <span>Progress to Level {level + 1}</span>
            <span>{xpToNext} XP to go</span>
          </div>
          <div className="h-3 bg-white/50 dark:bg-zinc-800/50 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function AchievementsGrid({ progress }: { progress: UserProgress }) {
  const achievements = getAchievements(progress);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Achievements
        </h2>
        <span className="text-sm text-zinc-500">
          {unlockedCount} / {achievements.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}

export function AchievementUnlockedModal({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
  const Icon = achievement.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10, delay: 0.2 }}
            className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 flex items-center justify-center mb-6"
          >
            <Icon className={`h-12 w-12 ${achievement.color}`} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
              Achievement Unlocked!
            </p>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {achievement.title}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              {achievement.description}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="font-bold text-amber-700 dark:text-amber-300">+{achievement.xpReward} XP</span>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onClose}
            className="mt-6 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-transform"
          >
            Awesome!
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
