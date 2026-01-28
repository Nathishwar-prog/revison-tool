"use client";

import { motion } from 'framer-motion';

export function LoadingState() {
  return (
    <div className="flex h-64 w-full flex-col items-center justify-center gap-4">
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} delay={i * 0.1} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="relative h-48 w-full rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-zinc-700/50 to-transparent" />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-4/6 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-6 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonLine({ width = "100%" }: { width?: string }) {
  return (
    <div 
      className="h-4 rounded bg-zinc-200 dark:bg-zinc-800 relative overflow-hidden"
      style={{ width }}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-zinc-300/50 dark:via-zinc-600/50 to-transparent" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative h-32 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-zinc-700/50 to-transparent" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} delay={0.3 + i * 0.1} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonRevisionCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-[450px] w-full rounded-3xl border-2 bg-white dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-zinc-700/50 to-transparent" />
      <div className="flex flex-col items-center justify-center h-full p-12 space-y-6">
        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-10 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-6 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-auto h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </motion.div>
  );
}

export function SkeletonCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-80 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden p-6"
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-zinc-700/50 to-transparent" />
        <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800 mb-6" />
        <div className="flex items-end justify-between h-48 gap-4">
          {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-zinc-200 dark:bg-zinc-800" style={{ height: `${h}%` }} />
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative h-80 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden p-6"
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-zinc-700/50 to-transparent" />
        <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-800 mb-6" />
        <div className="flex items-center justify-center h-48">
          <div className="w-40 h-40 rounded-full border-[20px] border-zinc-200 dark:border-zinc-800" />
        </div>
      </motion.div>
    </div>
  );
}
