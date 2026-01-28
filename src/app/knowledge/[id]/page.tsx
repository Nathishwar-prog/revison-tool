"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  BookOpen,
  AlertTriangle,
  Brain,
  Code,
  CheckCircle2,
  GraduationCap,
  X,
  Sparkles
} from 'lucide-react';
import { useKnowledge } from '@/hooks/useKnowledge';
import { api } from '@/services/api';
import { LoadingState } from '@/components/LoadingState';
import { formatDate } from '@/lib/dateUtils';
import { AskAIModal } from '@/components/AskAIModal';

export default function KnowledgeDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { deleteEntry } = useKnowledge(false);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await api.getKnowledgeById(id);
        setItem(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch knowledge');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteEntry(id);
      router.push('/knowledge');
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!item) return <div className="p-8 text-center">Knowledge not found</div>;

  const confidenceColors: Record<number, string> = {
    1: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    2: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    4: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    5: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/knowledge"
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white transition-all hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/25"
          >
            <Sparkles className="h-4 w-4" />
            Ask AI
          </button>
          <Link
            href={`/revision?id=${item.id}`}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-emerald-700"
          >
            <GraduationCap className="h-4 w-4" />
            Revise Now
          </Link>
          <Link
            href={`/knowledge/${item.id}/edit`}
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Confirm Delete</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to delete this knowledge? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border bg-white text-sm font-medium hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      <AskAIModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        knowledgeId={id}
        knowledgeTitle={item.title}
      />

      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${confidenceColors[item.confidenceLevel]}`}>
            Confidence: Level {item.confidenceLevel}
          </span>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {item.difficulty}
          </span>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {item.technology}
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">{item.title}</h1>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Created {formatDate(item.createdAt)}
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Revised {item.revision?.revisionCount || 0} times
            </div>
          </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
            {/* Definition */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Definition
              </h2>
              <div className="p-5 rounded-2xl bg-white border shadow-sm dark:bg-zinc-900">
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {item.content?.definition || 'No definition provided'}
                </p>
              </div>
            </section>

            {/* Simple Explanation */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Brain className="h-5 w-5 text-amber-500" />
                Simple Explanation
              </h2>
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30">
                <p className="text-zinc-700 dark:text-zinc-300 italic">
                  "{item.content?.simpleExplanation || 'No explanation provided'}"
                </p>
              </div>
            </section>

            {/* Code Example */}
            {item.content?.code && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Code className="h-5 w-5 text-emerald-500" />
                Code Example
              </h2>
              <div className="relative">
                <pre className="p-5 rounded-2xl bg-zinc-900 text-zinc-300 overflow-x-auto font-mono text-sm leading-relaxed border border-zinc-800 shadow-xl">
                  <code>{item.content.code}</code>
                </pre>
              </div>
            </section>
            )}

            {/* Real World Example */}
            {item.content?.example && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold">Real World Use Case</h2>
              <div className="p-5 rounded-2xl bg-white border shadow-sm dark:bg-zinc-900">
                <p className="text-zinc-600 dark:text-zinc-400">
                  {item.content.example}
                </p>
              </div>
            </section>
            )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
            {/* Tags */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {(item.tags || []).map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Common Mistakes */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Common Mistakes
              </h2>
              <ul className="space-y-2">
                {(item.content?.commonMistakes || []).map((mistake: string, i: number) => (
                  <li key={i} className="text-sm p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-300">
                    • {mistake}
                  </li>
                ))}
              </ul>
            </section>

          {/* My Confusion */}
          {item.content?.myConfusion && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold">Personal Notes / Confusion</h2>
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30 text-sm text-indigo-700 dark:text-indigo-300">
                {item.content.myConfusion}
              </div>
            </section>
          )}

          {/* Revision Stats Card */}
            <section className="p-5 rounded-2xl bg-white border shadow-sm dark:bg-zinc-900 space-y-4">
              <h3 className="font-bold border-b pb-2">Revision Schedule</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Last Revised</span>
                  <span className="font-medium">{item.revision?.lastRevised ? formatDate(item.revision.lastRevised) : 'Never'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Next Due</span>
                  <span className={`font-bold ${item.revision?.nextRevision && item.revision.nextRevision <= new Date().toISOString() ? 'text-red-500' : 'text-emerald-500'}`}>
                    {item.revision?.nextRevision ? formatDate(item.revision.nextRevision) : 'Not scheduled'}
                  </span>
                </div>
              </div>
            </section>
        </div>
      </div>
    </div>
  );
}
