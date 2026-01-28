"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  ChevronRight,
  PieChart
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { SkeletonCharts } from '@/components/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
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

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  subtitle?: string;
  delay?: number;
}

function StatCard({ label, value, icon: Icon, color, bg, subtitle, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 hover:shadow-md transition-shadow"
    >
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
    </motion.div>
  );
}

const DOMAIN_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#f59e0b'];

function DomainPieChart({ knowledge }: { knowledge: any[] }) {
  const domainData = knowledge.reduce((acc: any, item: any) => {
    const domain = item?.domain || 'Unknown';
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(domainData).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-500">
        No domain data available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">
        <PieChart className="h-5 w-5 text-purple-500" />
        Knowledge by Domain
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={DOMAIN_COLORS[index % DOMAIN_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }} 
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function WeeklyProgressChart({ history }: { history: any[] }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const data = last7Days.map(date => {
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    const revisions = history.filter((h: any) => 
      h.timestamp?.split('T')[0] === date
    ).length;
    return { day: dayName, revisions, date };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">
        <TrendingUp className="h-5 w-5 text-indigo-500" />
        Weekly Progress
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}
              formatter={(value: number) => [`${value} revisions`, 'Completed']}
            />
            <Bar 
              dataKey="revisions" 
              fill="url(#colorGradient)" 
              radius={[8, 8, 0, 0]}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function RetentionRateChart({ knowledge }: { knowledge: any[] }) {
  const confidenceLevels = [1, 2, 3, 4, 5];
  const data = confidenceLevels.map(level => {
    const count = knowledge.filter((k: any) => k.confidenceLevel === level).length;
    return {
      level: `Level ${level}`,
      count,
      percentage: knowledge.length > 0 ? Math.round((count / knowledge.length) * 100) : 0
    };
  });

  const avgConfidence = knowledge.length > 0 
    ? (knowledge.reduce((sum: number, k: any) => sum + (k.confidenceLevel || 0), 0) / knowledge.length).toFixed(1)
    : '0.0';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
          <Target className="h-5 w-5 text-emerald-500" />
          Retention Rate
        </h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">{avgConfidence}</p>
          <p className="text-xs text-zinc-500">Avg Confidence</p>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 w-16">{item.level}</span>
            <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="h-full rounded-full"
                style={{ 
                  background: `linear-gradient(90deg, ${DOMAIN_COLORS[index]}, ${DOMAIN_COLORS[(index + 1) % DOMAIN_COLORS.length]})` 
                }}
              />
            </div>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 w-12 text-right">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DailyPlanCard() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 shadow-sm dark:border-zinc-800 dark:from-violet-900/20 dark:to-indigo-900/20"
    >
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
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95"
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
    </motion.div>
  );
}

export function LearningInsightsDashboard() {
  const [insights, setInsights] = useState<any>(null);
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [weakConceptsData, setWeakConceptsData] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const [knowledgeData, historyData, insightsData] = await Promise.all([
          KnowledgeRepository.getAll(),
          RevisionRepository.getAll(),
          InsightEngine.generateInsights(),
        ]);

        setKnowledge(knowledgeData);
        setHistory(historyData);
        setInsights(insightsData);
        setTrendData(getConfidenceTrendData(historyData, knowledgeData));
        setWeakConceptsData(getWeakConceptsBarData(insightsData.weakConcepts));
        setHeatmapData(getRevisionHeatmapData(historyData, 12));
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, []);

  if (loading) {
    return <SkeletonCharts />;
  }

  if (!insights || knowledge.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No insights yet"
        description="Start adding knowledge entries and completing revisions to see your learning analytics and progress charts."
        actionLabel="Add Knowledge"
        actionHref="/knowledge/add"
        variant="insights"
      />
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
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={index * 0.05} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyProgressChart history={history} />
        <DomainPieChart knowledge={knowledge} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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

        <RetentionRateChart knowledge={knowledge} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Weak Areas
            </h2>
          </div>
          <WeakConceptsChart data={weakConceptsData} />
        </section>

        <DailyPlanCard />
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

      {insights.learningPattern && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Learning Insights
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        </motion.section>
      )}
    </div>
  );
}
