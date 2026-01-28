"use client";

import { LearningInsightsDashboard } from '@/insights/dashboards/LearningInsightsDashboard';
import { BarChart3 } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-3 dark:from-indigo-900/30 dark:to-purple-900/30">
          <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Learning Insights
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Visualize your learning progress and identify areas for improvement
          </p>
        </div>
      </div>
      
      <LearningInsightsDashboard />
    </div>
  );
}
