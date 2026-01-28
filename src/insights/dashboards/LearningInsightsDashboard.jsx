"use client";

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Brain,
  Target,
  Zap,
  BarChart3,
  Sparkles,
  Loader2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { ConfidenceTrendChart } from '../charts/ConfidenceTrendChart';
import { WeakConceptsChart } from '../charts/WeakConceptsChart';
import { RevisionHeatmap } from '../charts/RevisionHeatmap';
import {
  getConfidenceTrendData,
  getWeakConceptsBarData,
  getRevisionHeatmapData
} from '../insight.selectors';
import { InsightEngine } from '../../intelligence/insight.engine';
import { KnowledgeRepository } from '../../data/repositories/knowledge.repo';
import { RevisionRepository } from '../../data/repositories/revision.repo';
import { PersonalizationEngine } from '../../personalization/personalization.engine';
import { AiMarkdownRenderer } from '../../components/AiMarkdownRenderer';

function StatCard({ label, value, icon: Icon, color, bg, subtitle }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-zinc-400">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-xl ${bg} p-2.5 dark:bg-opacity-20`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

function DailyPlanCard() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [sessionLength, setSessionLength] = useState('short');

  const handleGeneratePlan = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const result = await PersonalizationEngine.getDailyPlan(sessionLength);
      if (result.response.success) {
        setPlan(result.response.content);
      }
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 shadow-sm dark:border-zinc-800 dark:from-violet-900/20 dark:to-indigo-900/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50">AI Daily Learning Plan</h3>
            <p className="text-xs text-zinc-500">Personalized study schedule</p>
          </div>
        </div>
      </div>

      {!plan && !loading && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSessionLength('short')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                sessionLength === 'short'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              <Clock className="h-4 w-4" />
              Short (15-20 min)
            </button>
            <button
              onClick={() => setSessionLength('long')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                sessionLength === 'long'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              <Clock className="h-4 w-4" />
              Long (45-60 min)
            </button>
          </div>
          <button
            onClick={handleGeneratePlan}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            Generate My Plan
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm text-zinc-500">Creating your personalized plan...</p>
        </div>
      )}

      {plan && !loading && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 max-h-[300px] overflow-y-auto">
            <AiMarkdownRenderer content={plan} />
          </div>
          <button
            onClick={() => setPlan(null)}
            className="w-full py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Generate New Plan
          </button>
        </div>
      )}

      <p className="mt-4 text-xs text-zinc-400 text-center">
        AI suggestions are read-only and do not modify your data.
      </p>
    </div>
  );
}

export function LearningInsightsDashboard() {
  const [insights, setInsights] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [weakConceptsData, setWeakConceptsData] = useState([]);
    const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const [knowledge, history, insightsData] = await Promise.all([
          KnowledgeRepository.getAll(),
          RevisionRepository.getAll(),
          InsightEngine.generateInsights(),
        ]);

        setInsights(insightsData);
        setTrendData(getConfidenceTrendData(history, knowledge));
        setWeakConceptsData(getWeakConceptsBarData(insightsData.weakConcepts));
        setHeatmapData(getRevisionHeatmapData(history, 12));
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-zinc-500">
        Unable to load insights. Please try again.
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Knowledge',
      value: insights.totalKnowledge || 0,
      icon: Brain,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Mastered',
      value: insights.masteredCount || 0,
      icon: Target,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      subtitle: `${insights.totalKnowledge > 0 ? Math.round((insights.masteredCount / insights.totalKnowledge) * 100) : 0}% of total`,
    },
    {
      label: 'Avg Confidence',
      value: (insights.averageConfidence || 0).toFixed(1),
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      subtitle: 'out of 5',
    },
    {
      label: 'Revision Streak',
      value: `${insights.revisionStreak || 0} days`,
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Due Today',
      value: insights.dailyPlan?.totalCount || 0,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Weak Areas',
      value: (insights.weakConcepts || []).length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Confidence Trends
            </h2>
          </div>
          <ConfidenceTrendChart 
            data={trendData} 
            title="Overall Confidence Over Time"
          />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Weak Areas
            </h2>
          </div>
          <WeakConceptsChart data={weakConceptsData} />
        </section>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            <Calendar className="h-5 w-5 text-emerald-500" />
            Revision Consistency
          </h2>
        </div>
        <RevisionHeatmap data={heatmapData} />
      </section>

        <div className="grid gap-8 lg:grid-cols-2">
          {insights.learningPattern && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Learning Insights
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-sm text-zinc-500">Most Active Day</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {insights.learningPattern.mostActiveDay}
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-sm text-zinc-500">Avg Revisions/Week</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {insights.learningPattern.avgRevisionsPerWeek}
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-sm text-zinc-500">Strongest Domain</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {insights.learningPattern.strongestDomain}
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-sm text-zinc-500">Weakest Domain</p>
                  <p className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">
                    {insights.learningPattern.weakestDomain}
                  </p>
                </div>
              </div>
            </section>
          )}

          <section>
            <DailyPlanCard />
          </section>
        </div>
      </div>
    );
  }
