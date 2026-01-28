"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Plus, Trash2, Folder, ArrowLeft, Cloud, CloudOff, Check, Loader2 } from 'lucide-react';
import { ConfidenceSelector } from './ConfidenceSelector';

interface KnowledgeFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  title: string;
}

function CharacterCounter({ current, max, warning = 0.8 }: { current: number; max: number; warning?: number }) {
  const percentage = current / max;
  const isWarning = percentage >= warning && percentage < 1;
  const isOver = percentage >= 1;

  return (
    <span className={`text-xs ${isOver ? 'text-red-500 font-bold' : isWarning ? 'text-amber-500' : 'text-zinc-400'}`}>
      {current}/{max}
    </span>
  );
}

function AutoSaveIndicator({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex items-center gap-1.5 text-xs"
      >
        {status === 'idle' && (
          <>
            <CloudOff className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-zinc-400">Not saved</span>
          </>
        )}
        {status === 'saving' && (
          <>
            <Loader2 className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
            <span className="text-indigo-500">Saving draft...</span>
          </>
        )}
        {status === 'saved' && (
          <>
            <Cloud className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-emerald-500">Draft saved</span>
          </>
        )}
        {status === 'error' && (
          <>
            <CloudOff className="h-3.5 w-3.5 text-red-500" />
            <span className="text-red-500">Save failed</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function CodeEditor({ value, onChange, placeholder }: { value: string; onChange: (val: string) => void; placeholder?: string }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([1]);

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineNumbers(Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1));
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="relative rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden">
      <div className="flex">
        <div className="flex flex-col py-3 px-2 bg-zinc-800/50 text-zinc-500 text-xs font-mono select-none border-r border-zinc-700">
          {lineNumbers.map(num => (
            <span key={num} className="leading-5 text-right min-w-[20px]">{num}</span>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={Math.max(lineNumbers.length, 4)}
          className="flex-1 p-3 bg-transparent text-emerald-400 font-mono text-sm leading-5 resize-none focus:outline-none placeholder-zinc-600"
          placeholder={placeholder}
          spellCheck={false}
        />
      </div>
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">Tab = 2 spaces</span>
        <CharacterCounter current={value.length} max={2000} />
      </div>
    </div>
  );
}

const FIELD_LIMITS = {
  title: 100,
  domain: 50,
  technology: 50,
  definition: 500,
  simpleExplanation: 300,
  example: 500,
  code: 2000,
  mistake: 200,
  myConfusion: 500,
};

export function KnowledgeForm({ initialData, onSubmit, title }: KnowledgeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>(initialData?.collections || []);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    domain: initialData?.domain || '',
    technology: initialData?.technology || '',
    difficulty: initialData?.difficulty || 'Beginner',
    type: initialData?.type || 'concept',
    confidenceLevel: initialData?.confidenceLevel || 3,
    tags: initialData?.tags || [''],
    content: {
      definition: initialData?.content?.definition || '',
      simpleExplanation: initialData?.content?.simpleExplanation || '',
      example: initialData?.content?.example || '',
      code: initialData?.content?.code || '',
      commonMistakes: initialData?.content?.commonMistakes || [''],
      myConfusion: initialData?.content?.myConfusion || '',
    },
  });

  useEffect(() => {
    if (!initialData) {
      const savedDraft = localStorage.getItem('knowledge_draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setFormData(draft.formData);
          setSelectedCollections(draft.collections || []);
          setAutoSaveStatus('saved');
        } catch (e) {
          console.error('Failed to load draft:', e);
        }
      }
    }
  }, [initialData]);

  const saveDraft = useCallback(() => {
    if (initialData) return;
    
    setAutoSaveStatus('saving');
    try {
      localStorage.setItem('knowledge_draft', JSON.stringify({
        formData,
        collections: selectedCollections,
        savedAt: new Date().toISOString(),
      }));
      setAutoSaveStatus('saved');
    } catch (e) {
      setAutoSaveStatus('error');
    }
  }, [formData, selectedCollections, initialData]);

  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    if (formData.title || formData.content.definition) {
      autoSaveTimerRef.current = setTimeout(saveDraft, 2000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, saveDraft]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const res = await fetch('/api/collections', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setCollections(data);
        }
      } catch (err) {
        console.error("Failed to fetch collections:", err);
      }
    };
    fetchCollections();
  }, []);

  const toggleCollection = (id: string) => {
    setSelectedCollections(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const addTag = () => setFormData({ ...formData, tags: [...formData.tags, ''] });
  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_: string, i: number) => i !== index);
    setFormData({ ...formData, tags: newTags.length ? newTags : [''] });
  };
  const updateTag = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({ ...formData, tags: newTags });
  };

  const addMistake = () => setFormData({
    ...formData,
    content: { ...formData.content, commonMistakes: [...formData.content.commonMistakes, ''] }
  });
  const removeMistake = (index: number) => {
    const newMistakes = formData.content.commonMistakes.filter((_: string, i: number) => i !== index);
    setFormData({
      ...formData,
      content: { ...formData.content, commonMistakes: newMistakes.length ? newMistakes : [''] }
    });
  };
  const updateMistake = (index: number, value: string) => {
    const newMistakes = [...formData.content.commonMistakes];
    newMistakes[index] = value;
    setFormData({ ...formData, content: { ...formData.content, commonMistakes: newMistakes } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        collections: selectedCollections,
        tags: formData.tags.filter((t: string) => t.trim()),
        content: {
          ...formData.content,
          commonMistakes: formData.content.commonMistakes.filter((m: string) => m.trim()),
        },
      });
      localStorage.removeItem('knowledge_draft');
    } catch (err) {
      console.error("Failed to submit:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('knowledge_draft');
    setFormData({
      title: '',
      domain: '',
      technology: '',
      difficulty: 'Beginner',
      type: 'concept',
      confidenceLevel: 3,
      tags: [''],
      content: {
        definition: '',
        simpleExplanation: '',
        example: '',
        code: '',
        commonMistakes: [''],
        myConfusion: '',
      },
    });
    setSelectedCollections([]);
    setAutoSaveStatus('idle');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <AutoSaveIndicator status={autoSaveStatus} />
          {!initialData && autoSaveStatus === 'saved' && (
            <button
              type="button"
              onClick={clearDraft}
              className="text-xs text-zinc-500 hover:text-red-500 transition-colors"
            >
              Clear draft
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 min-h-[44px]"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6 rounded-2xl border bg-white p-6 dark:bg-zinc-900 shadow-sm">
          <h2 className="font-bold border-b pb-2">Core Information</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Title</label>
                <CharacterCounter current={formData.title.length} max={FIELD_LIMITS.title} />
              </div>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, FIELD_LIMITS.title) })}
                className="w-full rounded-lg border p-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:border-zinc-700 min-h-[44px]"
                placeholder="e.g. React useEffect Hook"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">Domain</label>
                  <CharacterCounter current={formData.domain.length} max={FIELD_LIMITS.domain} />
                </div>
                <input
                  required
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value.slice(0, FIELD_LIMITS.domain) })}
                  className="w-full rounded-lg border p-3 text-sm dark:bg-zinc-800 dark:border-zinc-700 min-h-[44px]"
                  placeholder="e.g. Frontend"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">Technology</label>
                  <CharacterCounter current={formData.technology.length} max={FIELD_LIMITS.technology} />
                </div>
                <input
                  required
                  type="text"
                  value={formData.technology}
                  onChange={(e) => setFormData({ ...formData, technology: e.target.value.slice(0, FIELD_LIMITS.technology) })}
                  className="w-full rounded-lg border p-3 text-sm dark:bg-zinc-800 dark:border-zinc-700 min-h-[44px]"
                  placeholder="e.g. React"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full rounded-lg border p-3 text-sm dark:bg-zinc-800 dark:border-zinc-700 min-h-[44px]"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border p-3 text-sm dark:bg-zinc-800 dark:border-zinc-700 min-h-[44px]"
                >
                  <option value="concept">Concept</option>
                  <option value="pattern">Pattern</option>
                  <option value="tool">Tool</option>
                  <option value="theory">Theory</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border bg-white p-6 dark:bg-zinc-900 shadow-sm">
          <h2 className="font-bold border-b pb-2">Status & Strategy</h2>
          <ConfidenceSelector 
            value={formData.confidenceLevel} 
            onChange={(val) => setFormData({ ...formData, confidenceLevel: val })} 
          />
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <Folder className="w-4 h-4 text-indigo-500" />
              Collections
            </label>
            <div className="flex flex-wrap gap-2">
              {collections.map((coll) => (
                <button
                  key={coll.id}
                  type="button"
                  onClick={() => toggleCollection(coll.id)}
                  className={`text-xs px-4 py-2 rounded-full border transition-all min-h-[36px] ${
                    selectedCollections.includes(coll.id)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300'
                  }`}
                >
                  {coll.name}
                </button>
              ))}
              {collections.length === 0 && (
                <p className="text-[10px] text-zinc-400 italic">No collections created yet.</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag: string, i: number) => (
                <div key={i} className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1.5 pr-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => updateTag(i, e.target.value)}
                    className="bg-transparent text-sm w-24 focus:outline-none min-h-[32px]"
                    placeholder="Tag name"
                  />
                  <button type="button" onClick={() => removeTag(i)} className="text-zinc-400 hover:text-red-500 p-1 min-w-[28px] min-h-[28px] flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTag}
                className="flex items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50 min-h-[40px]"
              >
                <Plus className="h-4 w-4" />
                Add Tag
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border bg-white p-6 dark:bg-zinc-900 shadow-sm">
        <h2 className="font-bold border-b pb-2">Structured Content</h2>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Definition</label>
              <CharacterCounter current={formData.content.definition.length} max={FIELD_LIMITS.definition} />
            </div>
            <textarea
              required
              rows={3}
              value={formData.content.definition}
              onChange={(e) => setFormData({
                ...formData,
                content: { ...formData.content, definition: e.target.value.slice(0, FIELD_LIMITS.definition) }
              })}
              className="w-full rounded-lg border p-3 text-sm dark:bg-zinc-800 dark:border-zinc-700"
              placeholder="What is this concept?"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Simple Explanation (The "ELI5")</label>
              <CharacterCounter current={formData.content.simpleExplanation.length} max={FIELD_LIMITS.simpleExplanation} />
            </div>
            <textarea
              required
              rows={2}
              value={formData.content.simpleExplanation}
              onChange={(e) => setFormData({
                ...formData,
                content: { ...formData.content, simpleExplanation: e.target.value.slice(0, FIELD_LIMITS.simpleExplanation) }
              })}
              className="w-full rounded-lg border p-3 text-sm italic dark:bg-zinc-800 dark:border-zinc-700"
              placeholder="Explain it like I'm five..."
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Real-World Example</label>
              <CharacterCounter current={formData.content.example.length} max={FIELD_LIMITS.example} />
            </div>
            <textarea
              rows={2}
              value={formData.content.example}
              onChange={(e) => setFormData({
                ...formData,
                content: { ...formData.content, example: e.target.value.slice(0, FIELD_LIMITS.example) }
              })}
              className="w-full rounded-lg border p-3 text-sm dark:bg-zinc-800 dark:border-zinc-700"
              placeholder="Where is this used in practice?"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Code / Syntax Block</label>
            </div>
            <CodeEditor
              value={formData.content.code}
              onChange={(val) => setFormData({
                ...formData,
                content: { ...formData.content, code: val.slice(0, FIELD_LIMITS.code) }
              })}
              placeholder="// Code example here..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium mb-2">Common Mistakes</label>
              <div className="space-y-2">
                {formData.content.commonMistakes.map((mistake: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={mistake}
                      onChange={(e) => updateMistake(i, e.target.value.slice(0, FIELD_LIMITS.mistake))}
                      className="w-full rounded-lg border p-3 text-sm dark:bg-zinc-800 dark:border-zinc-700 min-h-[44px]"
                      placeholder="e.g. Forgetting to..."
                    />
                    <button type="button" onClick={() => removeMistake(i)} className="text-zinc-400 hover:text-red-500 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMistake}
                  className="flex items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50 min-h-[44px]"
                >
                  <Plus className="h-4 w-4" />
                  Add Mistake
                </button>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">My Confusion / Notes</label>
                <CharacterCounter current={formData.content.myConfusion.length} max={FIELD_LIMITS.myConfusion} />
              </div>
              <textarea
                rows={4}
                value={formData.content.myConfusion}
                onChange={(e) => setFormData({
                  ...formData,
                  content: { ...formData.content, myConfusion: e.target.value.slice(0, FIELD_LIMITS.myConfusion) }
                })}
                className="w-full rounded-lg border p-3 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                placeholder="What do I still find tricky?"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
