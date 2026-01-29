"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveAIKeys, clearAIKeys, getAIKeys, hasAIKeys } from '@/ai/storage';
import { Check, Trash2, KeyRound, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface AiSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiSettingsModal({ open, onOpenChange }: AiSettingsModalProps) {
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [hasOpenrouter, setHasOpenrouter] = useState(false);
  const [hasGemini, setHasGemini] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  /* New state for server keys */
  const [serverStatus, setServerStatus] = useState({ hasOpenRouter: false, hasGemini: false });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const keys = getAIKeys();
      setHasOpenrouter(!!keys.primaryKey);
      setHasGemini(!!keys.fallbackKey);
      setOpenrouterKey('');
      setGeminiKey('');
      setFeedback(null);

      /* Fetch server status */
      setIsLoading(true);
      fetch('/api/ai/status')
        .then(res => res.json())
        .then(data => {
          setServerStatus(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [open]);

  const handleSave = () => {
    const keys = getAIKeys();
    const newOpenrouter = openrouterKey || (hasOpenrouter ? keys.primaryKey : '');
    const newGemini = geminiKey || (hasGemini ? keys.fallbackKey : '');

    saveAIKeys(newOpenrouter, newGemini);

    setHasOpenrouter(!!newOpenrouter);
    setHasGemini(!!newGemini);
    setOpenrouterKey('');
    setGeminiKey('');
    setFeedback('Keys saved successfully');
    toast.success('AI API keys saved successfully!');

    setTimeout(() => setFeedback(null), 2000);
  };

  const handleClear = () => {
    clearAIKeys();
    setHasOpenrouter(false);
    setHasGemini(false);
    setOpenrouterKey('');
    setGeminiKey('');
    setFeedback('Keys cleared');
    toast.info('AI API keys cleared.');

    setTimeout(() => setFeedback(null), 2000);
  };

  const isModelActive = (clientHas: boolean, serverHas: boolean) => clientHas || serverHas;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-indigo-500" />
            AI Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI provider API keys for personalized learning
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">1</span>
                OpenRouter API Key
                <span className="text-xs text-zinc-500">(Primary)</span>
              </span>
              {serverStatus.hasOpenRouter && !hasOpenrouter && (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full dark:bg-indigo-900/50 dark:text-indigo-300 font-semibold uppercase tracking-wide">
                  Server Active
                </span>
              )}
            </label>
            <div className="relative">
              <Input
                type="password"
                placeholder={hasOpenrouter ? '••••••••••••••••' : serverStatus.hasOpenRouter ? 'Configured on Server' : 'sk-or-...'}
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
                className="pr-10"
              />
              {isModelActive(hasOpenrouter, serverStatus.hasOpenRouter) && (
                <Check className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${hasOpenrouter ? 'text-emerald-500' : 'text-indigo-500'}`} />
              )}
            </div>
            <p className="text-xs text-zinc-500">
              Get from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">openrouter.ai/keys</a>
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">2</span>
                Gemini API Key
                <span className="text-xs text-zinc-500">(Fallback)</span>
              </span>
              {serverStatus.hasGemini && !hasGemini && (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full dark:bg-indigo-900/50 dark:text-indigo-300 font-semibold uppercase tracking-wide">
                  Server Active
                </span>
              )}
            </label>
            <div className="relative">
              <Input
                type="password"
                placeholder={hasGemini ? '••••••••••••••••' : serverStatus.hasGemini ? 'Configured on Server' : 'AIza...'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="pr-10"
              />
              {isModelActive(hasGemini, serverStatus.hasGemini) && (
                <Check className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${hasGemini ? 'text-emerald-500' : 'text-indigo-500'}`} />
              )}
            </div>
            <p className="text-xs text-zinc-500">
              Get from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">aistudio.google.com</a>
            </p>
          </div>

          {feedback && (
            <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <Zap className="h-4 w-4" />
              {feedback}
            </div>
          )}

          {!isModelActive(hasOpenrouter, serverStatus.hasOpenRouter) && !isModelActive(hasGemini, serverStatus.hasGemini) && !feedback && (
            <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              No API keys configured. AI features will use mock responses.
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Keys
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
