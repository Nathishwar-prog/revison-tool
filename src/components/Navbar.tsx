"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, LayoutDashboard, List, PlusCircle, GraduationCap, BarChart3, LogOut, ChevronDown, Settings as SettingsIcon } from 'lucide-react';
import { CommandPalette } from '@/components/CommandPalette';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

function UserAvatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div
      className={`bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-semibold shadow-md`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || 'U'}
    </div>
  );
}

// --- Dock Components ---

function DockIcon({ mouseX, item, isActive }: { mouseX: any, item: any, isActive: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate distance from mouse to the center of this icon
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Transform distance to width/height scale
  // Base size 40px, grows to 80px when mouse is directly over
  const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <Link href={item.href}>
      <div
        className="relative flex flex-col items-center justify-end mb-2"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 5, x: "-50%" }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-zinc-900/90 dark:bg-white/90 text-zinc-50 dark:text-zinc-900 text-xs font-medium whitespace-nowrap shadow-xl border border-white/10 z-20"
            >
              {item.name}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-zinc-900/90 dark:bg-white/90" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          ref={ref}
          style={{ width, height: width }}
          className={`aspect-square rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-200 border border-white/20 relative z-10
            ${isActive
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
              : 'bg-white/40 dark:bg-black/40 backdrop-blur-md text-zinc-700 dark:text-zinc-200 hover:bg-white/60 dark:hover:bg-black/60'
            }
          `}
        >
          <item.icon className="w-[50%] h-[50%]" />
        </motion.div>

        {/* Active indicator dot */}
        {isActive && (
          <motion.div
            layoutId="dock-dot"
            className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"
          />
        )}
      </div>
    </Link>
  );
}

function Dock({ items, pathname }: { items: any[], pathname: string }) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="fixed bottom-6 inset-x-0 mx-auto w-max z-[100] hidden md:flex flex-col items-center">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-end gap-3 px-4 pb-3 pt-3 rounded-3xl bg-white/30 dark:bg-black/30 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl"
      >
        {items.map((item) => (
          <DockIcon
            key={item.href}
            item={item}
            mouseX={mouseX}
            isActive={pathname === item.href}
          />
        ))}
      </motion.div>
    </div>
  );
}

// --- Main Navbar Component ---

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname?.startsWith('/auth');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Knowledge', href: '/knowledge', icon: List },
    { name: 'Revision', href: '/revision', icon: GraduationCap },
    { name: 'Insights', href: '/insights', icon: BarChart3 },
    { name: 'Add New', href: '/knowledge/add', icon: PlusCircle },
  ];

  if (isAuthPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex h-14 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:bg-white/25 group-hover:scale-105"
              style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}>
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-white/90 tracking-wide drop-shadow-lg">KnowGrow</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-sm text-white/80 font-light tracking-wide drop-shadow-lg">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              <span className="ml-3">
                {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-gradient(135deg, #1A1A2E, #16213E, #0F3460) dark:bg-black/60 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-300">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300 group-hover:scale-105">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-indigo-600 bg-clip-text text-transparent">
              Knowledge Garden
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {user && <CommandPalette />}

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

            <ThemeToggle />

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-full pl-1 pr-1 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200"
                >
                  <UserAvatar name={user?.name || 'User'} size={32} />
                  <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-2 origin-top-right overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user?.name || 'User'}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <SettingsIcon className="h-4 w-4" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Exit Garden
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg shadow hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 
        Only show Dock if user is logged in. 
        Hidden on small screens (md:flex) because MobileBottomNav takes over.
      */}
      {user && <Dock items={navItems} pathname={pathname} />}
    </>
  );
}
