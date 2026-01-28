"use client";

import { motion } from 'framer-motion';
import { LucideIcon, BookOpen, PlusCircle, Sparkles, Brain, Rocket } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  variant?: 'default' | 'knowledge' | 'revision' | 'insights';
}

const illustrations = {
  default: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="80" fill="url(#grad1)" />
      <circle cx="100" cy="100" r="60" fill="none" stroke="#818cf8" strokeWidth="2" strokeDasharray="8 4" opacity="0.5" />
      <circle cx="100" cy="100" r="40" fill="none" stroke="#c084fc" strokeWidth="2" opacity="0.3" />
    </svg>
  ),
  knowledge: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect x="40" y="50" width="120" height="100" rx="8" fill="url(#bookGrad)" opacity="0.1" />
      <rect x="50" y="60" width="100" height="80" rx="4" fill="white" stroke="#6366f1" strokeWidth="2" />
      <line x1="70" y1="80" x2="130" y2="80" stroke="#6366f1" strokeWidth="2" opacity="0.5" />
      <line x1="70" y1="95" x2="120" y2="95" stroke="#8b5cf6" strokeWidth="2" opacity="0.4" />
      <line x1="70" y1="110" x2="110" y2="110" stroke="#6366f1" strokeWidth="2" opacity="0.3" />
      <circle cx="150" cy="45" r="15" fill="#fbbf24" opacity="0.8" />
      <path d="M145 45 L150 40 L155 45 L150 50 Z" fill="white" />
    </svg>
  ),
  revision: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect x="60" y="40" width="80" height="50" rx="8" fill="url(#cardGrad)" opacity="0.2" transform="rotate(-5 100 65)" />
      <rect x="55" y="55" width="90" height="55" rx="8" fill="url(#cardGrad)" opacity="0.4" transform="rotate(3 100 82)" />
      <rect x="50" y="70" width="100" height="60" rx="8" fill="white" stroke="#10b981" strokeWidth="2" />
      <circle cx="100" cy="100" r="15" fill="#10b981" opacity="0.2" />
      <path d="M95 100 L100 105 L110 93" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  insights: (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <linearGradient id="chartGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect x="40" y="140" width="25" height="30" rx="4" fill="url(#chartGrad)" opacity="0.6" />
      <rect x="75" y="110" width="25" height="60" rx="4" fill="url(#chartGrad)" opacity="0.7" />
      <rect x="110" y="80" width="25" height="90" rx="4" fill="url(#chartGrad)" opacity="0.8" />
      <rect x="145" y="60" width="25" height="110" rx="4" fill="url(#chartGrad)" opacity="0.9" />
      <path d="M40 50 Q100 30 170 70" stroke="#8b5cf6" strokeWidth="3" fill="none" strokeDasharray="5 3" />
      <circle cx="170" cy="70" r="8" fill="#8b5cf6" />
    </svg>
  ),
};

export function EmptyState({
  icon: Icon = BookOpen,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = 'default',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-48 h-48 mb-6"
      >
        {illustrations[variant]}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 mb-4"
      >
        <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 text-center"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-zinc-500 dark:text-zinc-400 text-center max-w-sm mb-6"
      >
        {description}
      </motion.p>

      {(actionLabel && (actionHref || onAction)) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <PlusCircle className="h-5 w-5" />
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="h-5 w-5" />
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex items-center gap-6 text-sm text-zinc-400"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span>AI-Powered</span>
        </div>
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4" />
          <span>Spaced Repetition</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
