"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, LayoutDashboard, List, PlusCircle, GraduationCap, BarChart3, LogOut, ChevronDown, Settings as SettingsIcon } from 'lucide-react';
import { CommandPalette } from '@/components/CommandPalette';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';

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
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            KnowGrow
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {user && <CommandPalette />}

          {user ? (
            <>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`hidden md:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300 shadow-sm'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Link>
                );
              })}
            </>
          ) : null}

          <div className="ml-2 flex items-center gap-2 border-l pl-3 dark:border-zinc-700">
            <ThemeToggle />

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200"
                >
                  <UserAvatar name={user?.name || 'User'} size={32} />
                  <span className="hidden text-sm font-medium sm:inline text-zinc-700 dark:text-zinc-300">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user?.name || 'User'}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <SettingsIcon className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
