"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  BarChart3, 
  PlusCircle,
  Settings,
  Command,
  ArrowRight,
  Clock
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  keywords?: string[];
  category: 'navigation' | 'action' | 'recent';
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: CommandItem[] = [
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      description: 'View your learning overview',
      icon: LayoutDashboard,
      action: () => router.push('/'),
      keywords: ['home', 'main', 'overview'],
      category: 'navigation',
    },
    {
      id: 'knowledge',
      title: 'Knowledge Library',
      description: 'Browse all your knowledge entries',
      icon: BookOpen,
      action: () => router.push('/knowledge'),
      keywords: ['library', 'concepts', 'entries', 'browse'],
      category: 'navigation',
    },
    {
      id: 'revision',
      title: 'Start Revision',
      description: 'Review due flashcards',
      icon: GraduationCap,
      action: () => router.push('/revision'),
      keywords: ['study', 'flashcards', 'review', 'practice'],
      category: 'navigation',
    },
    {
      id: 'insights',
      title: 'View Insights',
      description: 'See your learning analytics',
      icon: BarChart3,
      action: () => router.push('/insights'),
      keywords: ['analytics', 'stats', 'progress', 'charts'],
      category: 'navigation',
    },
    {
      id: 'add',
      title: 'Add New Knowledge',
      description: 'Create a new knowledge entry',
      icon: PlusCircle,
      action: () => router.push('/knowledge/add'),
      keywords: ['create', 'new', 'entry', 'concept'],
      category: 'action',
    },
  ];

  const filteredCommands = search
    ? commands.filter(cmd => {
        const searchLower = search.toLowerCase();
        return (
          cmd.title.toLowerCase().includes(searchLower) ||
          cmd.description?.toLowerCase().includes(searchLower) ||
          cmd.keywords?.some(k => k.includes(searchLower))
        );
      })
    : commands;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }

    if (!isOpen) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    }

    if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      const cmd = filteredCommands[selectedIndex];
      if (search && !recentSearches.includes(search)) {
        setRecentSearches(prev => [search, ...prev].slice(0, 5));
      }
      cmd.action();
      setIsOpen(false);
      setSearch('');
    }
  }, [isOpen, filteredCommands, selectedIndex, search, recentSearches]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-700">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => {
                setIsOpen(false);
                setSearch('');
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl z-50"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="flex items-center gap-3 px-4 border-b border-zinc-200 dark:border-zinc-800">
                  <Search className="h-5 w-5 text-zinc-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search commands..."
                    className="flex-1 py-4 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                  />
                  <kbd className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500">
                    ESC
                  </kbd>
                </div>

                <div className="max-h-80 overflow-y-auto py-2">
                  {filteredCommands.length === 0 ? (
                    <div className="px-4 py-8 text-center text-zinc-500">
                      No commands found for &quot;{search}&quot;
                    </div>
                  ) : (
                    <>
                      {recentSearches.length > 0 && !search && (
                        <div className="px-3 py-2">
                          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Recent</p>
                          {recentSearches.slice(0, 3).map((term, i) => (
                            <button
                              key={i}
                              onClick={() => setSearch(term)}
                              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                            >
                              <Clock className="h-3.5 w-3.5" />
                              {term}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="px-3 py-2">
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                          {search ? 'Results' : 'Commands'}
                        </p>
                        {filteredCommands.map((cmd, index) => {
                          const Icon = cmd.icon;
                          const isSelected = index === selectedIndex;
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => {
                                cmd.action();
                                setIsOpen(false);
                                setSearch('');
                              }}
                              onMouseEnter={() => setSelectedIndex(index)}
                              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors ${
                                isSelected 
                                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              <div className={`p-2 rounded-lg ${
                                isSelected 
                                  ? 'bg-indigo-100 dark:bg-indigo-900/50' 
                                  : 'bg-zinc-100 dark:bg-zinc-800'
                              }`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium">{cmd.title}</p>
                                {cmd.description && (
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{cmd.description}</p>
                                )}
                              </div>
                              {isSelected && (
                                <ArrowRight className="h-4 w-4 text-indigo-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">↑↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">↵</kbd>
                      Select
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Command className="h-3 w-3" />
                    <span>KnowGrow</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
