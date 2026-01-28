"use client";

import { SkeletonRevisionCard } from '@/components/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useConfetti, ConfettiCanvas } from '@/components/ui/Interactions';
import { Timer } from '@/components/ui/Interactions';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  RotateCcw,
  CheckCircle2,
  Brain,
  Code,
  AlertTriangle,
  Lightbulb,
  Trophy,
  ArrowRight,
  Sparkles,
  Mic,
  MicOff,
  Keyboard,
  GraduationCap,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { ConfidenceSelector } from '@/components/ConfidenceSelector';
import { AskAIModal } from '@/components/AskAIModal';
import { RevisionRepository } from '@/data/repositories/revision.repo';
import { processRevision } from '@/domain/revision/revision.engine';

function KeyboardShortcutsHint({ show }: { show: boolean }) {
  if (!show) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-900/90 dark:bg-zinc-800/90 backdrop-blur-lg text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-4 text-sm z-50"
    >
      <div className="flex items-center gap-2">
        <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs">Space</kbd>
        <span>Flip</span>
      </div>
      <div className="w-px h-4 bg-zinc-600" />
      <div className="flex items-center gap-2">
        <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs">1-5</kbd>
        <span>Confidence</span>
      </div>
      <div className="w-px h-4 bg-zinc-600" />
      <div className="flex items-center gap-2">
        <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs">Enter</kbd>
        <span>Submit</span>
      </div>
    </motion.div>
  );
}

function SwipeHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-zinc-400"
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Swipe to navigate</span>
      <ChevronRight className="h-4 w-4" />
    </motion.div>
  );
}

function RevisionContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [revisionQueue, setRevisionQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [confidence, setConfidence] = useState(3);
  const [isComplete, setIsComplete] = useState(false);
  const [revisedCount, setRevisedCount] = useState(0);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [totalTime, setTotalTime] = useState(0);
  const { pieces, triggerConfetti } = useConfetti();
  const constraintsRef = useRef(null);

  useEffect(() => {
    const fetchRevisionQueue = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const res = await fetch('/api/revision', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.error) {
          setRevisionQueue([]);
        } else {
          setRevisionQueue(Array.isArray(data) ? data : data.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch revision queue:", err);
        setRevisionQueue([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRevisionQueue();
  }, []);

  const currentItem = revisionQueue[currentIndex];

  const speakCurrentCard = useCallback((flipped: boolean) => {
    if (!currentItem || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = flipped 
      ? currentItem.content?.definition || currentItem.title
      : currentItem.title;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }, [currentItem]);

  useEffect(() => {
    if (isVoiceEnabled && currentItem) {
      speakCurrentCard(isFlipped);
    }
  }, [currentIndex, isVoiceEnabled, speakCurrentCard, currentItem, isFlipped]);

  useEffect(() => {
    setCardStartTime(Date.now());
  }, [currentIndex]);

  const toggleVoice = () => {
    if (isVoiceEnabled) {
      window.speechSynthesis?.cancel();
    }
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
    if (isVoiceEnabled) {
      speakCurrentCard(!isFlipped);
    }
  }, [isVoiceEnabled, isFlipped, speakCurrentCard]);

  const handleMarkRevised = useCallback(async () => {
    if (!currentItem) return;

    const timeTaken = Math.round((Date.now() - cardStartTime) / 1000);
    setTotalTime(prev => prev + timeTaken);

    const revisionUpdate = processRevision(currentItem.revision || {}, confidence);

    try {
      await RevisionRepository.addRevision({
        knowledgeId: currentItem.id,
        confidenceGiven: confidence,
        revisionData: revisionUpdate,
        timeTakenSeconds: timeTaken,
      });
    } catch (e) {
      console.error("Failed to save revision", e);
    }

    setRevisedCount(prev => prev + 1);

    if (currentIndex < revisionQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setConfidence(3);
    } else {
      setIsComplete(true);
      triggerConfetti();
    }
  }, [currentItem, confidence, currentIndex, revisionQueue.length, cardStartTime, triggerConfetti]);

  const handleSwipe = useCallback((event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      handleFlip();
    } else if (info.offset.x < -swipeThreshold) {
      handleFlip();
    }
  }, [handleFlip]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete || loading || revisionQueue.length === 0) return;
      if (showAIModal) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handleFlip();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          e.preventDefault();
          setConfidence(parseInt(e.key));
          break;
        case 'Enter':
          e.preventDefault();
          handleMarkRevised();
          break;
        case 'v':
          e.preventDefault();
          toggleVoice();
          break;
        case '?':
          setShowShortcuts(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleMarkRevised, isComplete, loading, revisionQueue.length, showAIModal]);

  useEffect(() => {
    const timer = setTimeout(() => setShowShortcuts(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 p-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
        <SkeletonRevisionCard />
      </div>
    );
  }

  if (revisionQueue.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          icon={GraduationCap}
          title="All caught up!"
          description="No concepts are due for revision right now. Keep learning and adding new knowledge to your library."
          actionLabel="Browse Library"
          actionHref="/knowledge"
          variant="revision"
        />
      </div>
    );
  }

  if (isComplete) {
    const avgTime = revisedCount > 0 ? Math.round(totalTime / revisedCount) : 0;
    
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 p-4">
        <ConfettiCanvas pieces={pieces} />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 p-8 rounded-full"
        >
          <Trophy className="h-20 w-20 text-indigo-600 dark:text-indigo-400" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold"
        >
          Revision Complete!
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-6 text-center"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
            <p className="text-2xl font-bold text-indigo-600">{revisedCount}</p>
            <p className="text-xs text-zinc-500">Cards Revised</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
            <p className="text-2xl font-bold text-emerald-600">{Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}</p>
            <p className="text-xs text-zinc-500">Total Time</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
            <p className="text-2xl font-bold text-amber-600">{avgTime}s</p>
            <p className="text-xs text-zinc-500">Avg per Card</p>
          </div>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-zinc-500 text-center max-w-sm"
        >
          Great job! Your long-term retention is improving.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4"
        >
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push('/knowledge')}
            className="px-6 py-3 border border-zinc-200 bg-white text-zinc-900 rounded-xl font-bold dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 hover:scale-105 transition-all"
          >
            Library
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          <span className="font-bold">Revision Session</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Timer isRunning={!isComplete && !loading} />
          <button
            onClick={() => setShowShortcuts(prev => !prev)}
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>Shortcuts</span>
          </button>
          <button
            onClick={toggleVoice}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              isVoiceEnabled 
                ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' 
                : 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200'
            }`}
          >
            {isVoiceEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isVoiceEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:from-violet-700 hover:to-indigo-700"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
          <div className="text-sm font-medium text-zinc-500">
            {currentIndex + 1}/{revisionQueue.length}
          </div>
        </div>
      </div>

      {currentItem && (
        <AskAIModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          knowledgeId={currentItem.id}
          knowledgeTitle={currentItem.title}
        />
      )}

      <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden dark:bg-zinc-800">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / revisionQueue.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {currentItem && (
        <>
          <div ref={constraintsRef} className="relative h-[450px] w-full" style={{ perspective: '1000px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id + (isFlipped ? '-back' : '-front')}
                initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full cursor-pointer touch-pan-y"
                onClick={handleFlip}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleSwipe}
              >
                {!isFlipped ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-3xl border-2 border-indigo-100 shadow-xl text-center dark:bg-zinc-900 dark:border-zinc-800 select-none">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-4">{currentItem.technology}</span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-8">{currentItem.title}</h2>
                    <div className="mt-auto flex items-center gap-2 text-zinc-400 font-medium text-sm">
                      <RotateCcw className="h-4 w-4" />
                      <span className="hidden sm:inline">Click or press <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs">Space</kbd> to reveal</span>
                      <span className="sm:hidden">Tap to reveal</span>
                    </div>
                    <SwipeHint />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col p-6 sm:p-8 bg-zinc-50 rounded-3xl border-2 border-indigo-600 shadow-2xl overflow-y-auto dark:bg-zinc-900 dark:border-indigo-500/50 select-none">
                    <div className="space-y-6">
                      <section>
                        <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                          <Lightbulb className="h-4 w-4" />
                          Definition
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{currentItem.content?.definition}</p>
                      </section>

                      {currentItem.content?.simpleExplanation && (
                        <section className="p-4 bg-indigo-50 rounded-2xl dark:bg-indigo-900/20">
                          <div className="text-xs font-bold text-indigo-600 uppercase mb-1">Simple Explanation</div>
                          <p className="text-sm italic text-zinc-600 dark:text-zinc-400">&quot;{currentItem.content.simpleExplanation}&quot;</p>
                        </section>
                      )}

                      {currentItem.content?.code && (
                        <section>
                          <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
                            <Code className="h-4 w-4" />
                            Syntax
                          </div>
                          <pre className="p-4 bg-zinc-900 text-zinc-300 rounded-xl overflow-x-auto text-xs font-mono">
                            {currentItem.content.code}
                          </pre>
                        </section>
                      )}

                      {currentItem.content?.commonMistakes && currentItem.content.commonMistakes.length > 0 && (
                        <section>
                          <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
                            <AlertTriangle className="h-4 w-4" />
                            Watch out for
                          </div>
                          <ul className="text-xs space-y-1 text-zinc-600 dark:text-zinc-400">
                            {currentItem.content.commonMistakes.map((m: string, i: number) => (
                              <li key={i}>• {m}</li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </div>
                    <div className="mt-8 flex items-center justify-center gap-2 text-indigo-600 font-bold">
                      <RotateCcw className="h-4 w-4" />
                      Flip back
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-bold text-zinc-500">
                How well did you remember this? <span className="text-zinc-400 hidden sm:inline">(Press 1-5)</span>
              </p>
              <ConfidenceSelector value={confidence} onChange={setConfidence} label="" />
            </div>

            <button
              onClick={handleMarkRevised}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-indigo-500/20 transition-all active:scale-95 min-h-[56px]"
            >
              Mark as Revised
              <ArrowRight className="h-6 w-6" />
              <kbd className="ml-2 px-2 py-1 bg-white/20 rounded text-sm hidden sm:inline">Enter</kbd>
            </button>
          </div>
        </>
      )}

      <AnimatePresence>
        <KeyboardShortcutsHint show={showShortcuts} />
      </AnimatePresence>
    </div>
  );
}

export default function RevisionPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto space-y-8 p-4">
        <SkeletonRevisionCard />
      </div>
    }>
      <RevisionContent />
    </Suspense>
  );
}
