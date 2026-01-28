"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, GraduationCap, BarChart3, PlusCircle } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Library', href: '/knowledge', icon: BookOpen },
  { name: 'Add', href: '/knowledge/add', icon: PlusCircle, highlight: true },
  { name: 'Revise', href: '/revision', icon: GraduationCap },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-6"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
                >
                  <Icon className="h-6 w-6 text-white" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-1 px-3 py-2 min-w-[60px]"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30'
                    : ''
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                />
              </motion.div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {item.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -bottom-2 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
