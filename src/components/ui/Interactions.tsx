"use client";

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
}

export function useConfetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const triggerConfetti = useCallback(() => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#fbbf24'];
    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.3,
      rotation: Math.random() * 360,
    }));
    setPieces(newPieces);
    setTimeout(() => setPieces([]), 3000);
  }, []);

  return { pieces, triggerConfetti };
}

export function ConfettiCanvas({ pieces }: { pieces: ConfettiPiece[] }) {
  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ 
            y: -20, 
            x: `${piece.x}vw`,
            rotate: 0,
            opacity: 1 
          }}
          animate={{ 
            y: '100vh',
            rotate: piece.rotation + 720,
            opacity: 0
          }}
          transition={{ 
            duration: 2.5 + Math.random(),
            delay: piece.delay,
            ease: 'easeOut'
          }}
          className="absolute"
          style={{ left: 0 }}
        >
          <div 
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: piece.color }}
          />
        </motion.div>
      ))}
    </div>
  );
}

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  threshold?: number;
}

export function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100 
}: SwipeableCardProps) {
  const [dragX, setDragX] = useState(0);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }
    setDragX(0);
  };

  const leftOpacity = Math.min(Math.abs(Math.min(dragX, 0)) / threshold, 1);
  const rightOpacity = Math.min(Math.max(dragX, 0) / threshold, 1);

  return (
    <div className="relative overflow-hidden">
      {leftAction && (
        <div 
          className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 bg-red-500 rounded-xl"
          style={{ opacity: leftOpacity, width: '100px' }}
        >
          {leftAction}
        </div>
      )}
      {rightAction && (
        <div 
          className="absolute inset-y-0 left-0 flex items-center justify-start pl-4 bg-emerald-500 rounded-xl"
          style={{ opacity: rightOpacity, width: '100px' }}
        >
          {rightAction}
        </div>
      )}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose: (id: string) => void;
}

const toastIcons = {
  success: (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const toastColors = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

function Toast({ id, type, title, message, onClose }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 min-w-[300px]"
    >
      <div className={`p-1.5 rounded-lg ${toastColors[type]}`}>
        {toastIcons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        {message && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    return addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    return addToast({ type: 'error', title, message });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    return addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    return addToast({ type: 'info', title, message });
  }, [addToast]);

  return { toasts, addToast, removeToast, success, error, warning, info };
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastItem[], onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ScrollProgressIndicator() {
  const [progress, setProgress] = useState(0);

  useMemo(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrollProgress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (progress < 1) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-zinc-200/50 dark:bg-zinc-800/50">
      <motion.div
        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}

interface TimerProps {
  isRunning: boolean;
  onTimeUpdate?: (seconds: number) => void;
}

export function Timer({ isRunning, onTimeUpdate }: TimerProps) {
  const [seconds, setSeconds] = useState(0);

  useMemo(() => {
    if (!isRunning) {
      setSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setSeconds(prev => {
        const newValue = prev + 1;
        onTimeUpdate?.(newValue);
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUpdate]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-sm font-mono text-zinc-500 dark:text-zinc-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {formatTime(seconds)}
    </div>
  );
}
