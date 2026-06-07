"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain,
  Target,
  AlertCircle,
  Plus,
  GraduationCap,
  ArrowRight,
  LayoutDashboard,
  Flame,
  Mic
} from 'lucide-react';
import { useKnowledge } from '@/hooks/useKnowledge';
import { LoadingState } from '@/components/LoadingState';
import { isDue } from '@/lib/dateUtils';
import { LearningHeatmap } from '@/components/dashboard/LearningHeatmap';
import { DailyProgressRing } from '@/components/dashboard/DailyProgressRing';
import { KnowledgeTabs } from '@/components/dashboard/KnowledgeTabs';
import { BrainGalaxy } from '@/components/dashboard/BrainGalaxy';
import { KnowledgeGarden } from '@/components/dashboard/KnowledgeGarden';
import { NeuralNexus } from '@/components/dashboard/NeuralNexus';
import { TimeCapsule } from '@/components/dashboard/TimeCapsule';
import { GapHunterWidget } from '@/components/dashboard/GapHunterWidget';

import { KnowledgeTree } from '@/components/dashboard/KnowledgeTree';

import { ApiAdapter } from '@/data/adapters/api.adapter';
import { QuizModal } from '@/components/quiz/QuizModal';
import { VoiceIngestionModal } from '@/components/dashboard/VoiceIngestionModal';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { user , logout } = useAuth();
  const { knowledge, loading, error, refresh } = useKnowledge();
  const [heatmapData, setHeatmapData] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({ completed: 0, target: 10 });
  const [streak, setStreak] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'galaxy' | 'garden' | 'nexus'>('nexus'); // Default to new feature

  const [viewDate, setViewDate] = useState(new Date());

  // Filter knowledge based on Time Capsule date
  const visibleKnowledge = React.useMemo(() => {
    return knowledge.filter(k => new Date(k.createdAt) <= viewDate);
  }, [knowledge, viewDate]);

  // Compute stats based on VISIBLE knowledge to reflect history
  const historyStats = React.useMemo(() => {
    const count = visibleKnowledge.length;
    const weak = visibleKnowledge.filter(k => (k.confidenceLevel ?? 5) <= 2).length;
    return { count, weak };
  }, [visibleKnowledge]);

  // Quiz State
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizTopics, setQuizTopics] = useState<string[]>([]);

  // Voice Ingestion State
  const [isVoiceIngestOpen, setIsVoiceIngestOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [heatmap, progress] = await Promise.all([
          ApiAdapter.get('/dashboard/heatmap'),
          ApiAdapter.get('/dashboard/daily-progress')
        ]);
        setHeatmapData(heatmap);
        setDailyProgress(progress);

        // Calculate streak from heatmap data
        let currentStreak = 0;
        const today = new Date();
        const sortedData = [...(heatmap || [])].sort((a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        for (let i = 0; i < sortedData.length; i++) {
          const entry = sortedData[i] as any;
          const entryDate = new Date(entry.date);
          const diffDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === i && entry.count > 0) {
            currentStreak++;
          } else if (diffDays === i && entry.count === 0) {
            break;
          }
        }
        setStreak(currentStreak);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  // Calculate total revisions from heatmap
  const totalRevisions = React.useMemo(() => {
    return heatmapData.reduce((acc: number, curr: any) => acc + (curr.count || 0), 0);
  }, [heatmapData]);

  if (loading) return <main className="flex-1 container mx-auto px-4 py-8"><LoadingState /></main>;
  if (error) return <main className="flex-1 container mx-auto px-4 py-8"><div className="p-8 text-center text-red-500">Error: {error}</div></main>;

  const totalCount = historyStats.count;
  // Due items: Always show real due items because you need to revise them regardless of time view
  const dueItems = knowledge.filter(k => isDue(k?.revision?.nextRevision));
  // Weak items: Based on visible knowledge (historical view)
  const weakItems = visibleKnowledge.filter(k => (k?.confidenceLevel ?? 5) <= 2);
  // We need an array for START CHALLENGE, so keeping visibleKnowledge.filter is correct.
  // But for the STAT display, we can use historyStats.weak if we want a number, but we kept it as array.

  const handleStartChallenge = () => {
    // Pick top 3 weak items or random items if no weak ones
    const topics = weakItems.length > 0
      ? weakItems.slice(0, 3).map(k => k.topic)
      : knowledge.slice(0, 3).map(k => k.topic);

    if (topics.length > 0) {
      setQuizTopics(topics);
      setIsQuizOpen(true);
    }
  };

  const stats = [
    { label: 'Total Knowledge', value: totalCount, icon: Brain, gradient: 'from-indigo-500 to-purple-600', lightBg: 'from-indigo-50 to-purple-50' },
    { label: 'Due for Revision', value: dueItems.length, icon: Target, gradient: 'from-emerald-500 to-teal-600', lightBg: 'from-emerald-50 to-teal-50' },
    {
      label: 'Weak Areas',
      value: weakItems.length,
      icon: AlertCircle,
      gradient: 'from-rose-500 to-orange-500',
      lightBg: 'from-rose-50 to-orange-50',
      action: (
        <button
          onClick={handleStartChallenge}
          className="mt-2 text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
        >
          Challenge Me <ArrowRight className="w-3 h-3" />
        </button>
      )
    },
  ];
  

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-8 min-h-screen bg-transparent transition-colors duration-300">
      <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} topics={quizTopics} />
      <VoiceIngestionModal
        isOpen={isVoiceIngestOpen}
        onClose={() => setIsVoiceIngestOpen(false)}
        onSuccess={refresh}
      />

      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Welcome back, { user?.name || 'Learner' }
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              You have {dueItems.length} concepts waiting for revision today.
            </p>
          </div>
          {/* ... existing header buttons ... */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsVoiceIngestOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 hover:scale-105 active:scale-95"
            >
              <Mic className="h-4 w-4 text-indigo-500" />
              Quick Record
            </button>
            <Link
              href="/knowledge/add"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Knowledge
            </Link>
            <Link
              href="/revision"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              <GraduationCap className="h-4 w-4" />
              Revision Mode
            </Link>
          </div>
        </div>


        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >


          {/* Hero Section - 3D Visualization */}
          <motion.div variants={item} className="lg:col-span-3 relative group">
            {/* View Toggles */}
            <div className="absolute left-64 top-6 z-30 flex gap-2 bg-black/20 backdrop-blur-md p-1 rounded-full border border-white/10">
              <button
                onClick={() => setViewMode('galaxy')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${viewMode === 'galaxy' ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                Galaxy
              </button>
              <button
                onClick={() => setViewMode('garden')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${viewMode === 'garden' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                Garden
              </button>
              <button
                onClick={() => setViewMode('nexus')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${viewMode === 'nexus' ? 'bg-violet-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                Nexus
              </button>
            </div>

            {/* Time Capsule Overlay */}
            <div className="absolute bottom-6 right-6 z-20 w-full max-w-sm px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <TimeCapsule
                startDate={new Date('2026-01-01')}
                endDate={new Date()}
                currentDate={viewDate}
                onChange={setViewDate}
              />
            </div>

            {/* Gap Hunter Overlay */}
            <div className="absolute top-6 right-6 z-30 w-80">
              <GapHunterWidget />
            </div>

            {/* 3D View Content */}
            {viewMode === 'galaxy' ? (
              <BrainGalaxy knowledge={visibleKnowledge} />
            ) : viewMode === 'garden' ? (
              <KnowledgeGarden
                knowledge={visibleKnowledge}
                onNodeSelect={(k) => console.log(k.title)}
                metrics={visibleKnowledge.map(k => ({
                  knowledgeId: k.id,
                  avgConfidence: k.confidenceLevel,
                  forgetRate: isDue(k.revision?.nextRevision) ? 0.8 : 0.1,
                  revisionConsistency: 1
                }))}
              />
            ) : (
              <NeuralNexus knowledge={visibleKnowledge} />
            )}
          </motion.div>

          {/* Left Column: Progress and Stats */}
          <motion.div variants={item} className="lg:col-span-1 space-y-8">

            {/* NEW: Knowledge Tree Garden */}
            <KnowledgeTree totalRevisions={totalRevisions} />

            {/* Daily Progress Card */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 dark:backdrop-blur-md p-8 shadow-sm flex flex-col items-center transition-all">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Daily Goal
              </h3>
              <DailyProgressRing
                completed={dailyProgress.completed}
                target={dailyProgress.target}
              />
            </div>

            {/* Streak Counter Card */}
            <div className="rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-gradient-to-br from-orange-500 to-red-600 p-6 shadow-xl shadow-orange-500/20 overflow-hidden relative group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-500 delay-75" />
              <div className="relative flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 shadow-inner">
                  <Flame className="h-8 w-8 text-white drop-shadow-md" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Current Streak</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-4xl font-bold text-white tracking-tight">{streak}</p>
                    <p className="text-lg font-medium text-white/80">days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-4">
              {stats.map((stat: any) => (
                <div
                  key={stat.label}
                  className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 dark:backdrop-blur-md p-6 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-500/30"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.lightBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:opacity-0`} />
                  <div className="relative flex items-center gap-4">
                    <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                      <div className="flex items-baseline justify-between w-full">
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
                      </div>
                      {/* Render Action Button if exists */}
                      {stat.action && stat.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </motion.div>

          {/* Right Column: Heatmap and Lists */}
          <motion.div variants={item} className="lg:col-span-2 space-y-8">
            {/* Learning Heatmap Card */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 dark:backdrop-blur-md p-8 shadow-sm transition-all">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                Revision Activity
              </h3>
              <LearningHeatmap data={heatmapData} />
            </div>

            {/* ... Rest of right column ... */}
            {dueItems.length > 0 && (
              <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-500/25">
                <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Time to Revise!</h2>
                    <p className="text-indigo-100 max-w-md">
                      You have {dueItems.length} items ready for review. Consistency is the key to long-term memory.
                    </p>
                  </div>
                  <Link
                    href="/revision"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-indigo-600 shadow-lg transition-all hover:scale-105 active:scale-95 hover:bg-indigo-50"
                  >
                    Start Now
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500 mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-purple-500 mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
              </div>
            )}

            {/* Dynamic Tabs Section */}
            <div className="space-y-6">
              <KnowledgeTabs />
            </div>
          </motion.div>
        </motion.div >
      </div >
    </main >
  );
}
