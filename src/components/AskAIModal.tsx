"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  ListTodo, 
  Loader2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { PersonalizationEngine } from '@/personalization/personalization.engine';
import { AIFeatureType } from '@/ai/ai.service';
import { AiMarkdownRenderer } from './AiMarkdownRenderer';

interface AskAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeId: string;
  knowledgeTitle: string;
}

type ModalTab = 'summary' | 'quiz' | 'explainWeak';

const tabConfig: Record<ModalTab, { icon: typeof Sparkles; label: string; description: string }> = {
  summary: {
    icon: FileText,
    label: 'Smart Summary',
    description: 'AI-generated summary adapted to your confidence level',
  },
  quiz: {
    icon: Sparkles,
    label: 'Practice Quiz',
    description: 'Personalized questions targeting your weak areas',
  },
  explainWeak: {
    icon: HelpCircle,
    label: 'Why Am I Struggling?',
    description: 'Analysis of your learning patterns and actionable advice',
  },
};

export function AskAIModal({ isOpen, onClose, knowledgeId, knowledgeTitle }: AskAIModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('summary');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (tab: ModalTab) => {
    setActiveTab(tab);
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      let result;
      switch (tab) {
        case 'summary':
          result = await PersonalizationEngine.generateSmartSummary(knowledgeId);
          break;
        case 'quiz':
          result = await PersonalizationEngine.generateQuiz(knowledgeId, 5);
          break;
        case 'explainWeak':
          result = await PersonalizationEngine.explainWeakness(knowledgeId);
          break;
      }

      if (result.response.success) {
        setResponse(result.response.content);
      } else {
        setError(result.response.error || 'Failed to generate response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResponse(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Ask AI</h2>
                <p className="text-sm text-zinc-500 truncate max-w-[300px]">{knowledgeTitle}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5 text-zinc-500" />
            </button>
          </div>

          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            {(Object.keys(tabConfig) as ModalTab[]).map((tab) => {
              const config = tabConfig[tab];
              const Icon = config.icon;
              const isActive = activeTab === tab;
              
              return (
                <button
                  key={tab}
                  onClick={() => handleGenerate(tab)}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all ${
                    isActive
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-5 min-h-[300px] max-h-[50vh] overflow-y-auto">
            {!response && !loading && !error && (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <div className="p-4 rounded-full bg-indigo-50 dark:bg-indigo-900/20 mb-4">
                  {(() => {
                    const Icon = tabConfig[activeTab].icon;
                    return <Icon className="h-8 w-8 text-indigo-600" />;
                  })()}
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  {tabConfig[activeTab].label}
                </h3>
                <p className="text-sm text-zinc-500 max-w-sm mb-6">
                  {tabConfig[activeTab].description}
                </p>
                <button
                  onClick={() => handleGenerate(activeTab)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  Generate
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-[250px]">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-sm text-zinc-500">Generating personalized content...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  Something went wrong
                </h3>
                <p className="text-sm text-red-500 max-w-sm mb-4">{error}</p>
                <button
                  onClick={() => handleGenerate(activeTab)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {response && !loading && (
              <AiMarkdownRenderer content={response} />
            )}
          </div>

          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
            <p className="text-xs text-zinc-400 text-center">
              AI suggestions are read-only and personalized to your learning data. They do not modify your knowledge.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
