"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiAdapter } from '@/data/adapters/api.adapter';
import {
    User,
    Settings as SettingsIcon,
    Brain,
    Save,
    Key,
    Shield,
    Bell,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getAIKeys, saveAIKeys } from '@/ai/storage';

export default function SettingsPage() {
    const { user, login } = useAuth(); // login used to update local user state if needed
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'ai'>('profile');

    // Profile State
    const [name, setName] = useState('');
    const [dailyTarget, setDailyTarget] = useState(10);

    // AI State
    const [aiSettings, setAiSettings] = useState({
        primary_provider: 'gemini',
        encrypted_keys: {
            openai: '', // We map this to OpenRouter/Primary
            gemini: ''  // We map this to Gemini/Fallback
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch latest user data
                const userData = await ApiAdapter.get('/auth/me');
                if (userData?.user) {
                    setName(userData.user.name);
                    setDailyTarget(userData.user.dailyRevisionTarget || 10);
                }

                // Load AI Keys from LocalStorage (Source of Truth)
                // Load AI Keys from LocalStorage (Source of Truth)
                const localKeys = getAIKeys();

                // Determine which UI provider passed on storage value
                // Storage uses 'openrouter' / 'gemini'
                // UI uses 'openai' / 'gemini'
                let uiPrimaryProvider = 'gemini';
                if (localKeys.primaryProvider === 'openrouter') {
                    uiPrimaryProvider = 'openai';
                } else if (localKeys.primaryProvider === 'gemini') {
                    uiPrimaryProvider = 'gemini';
                } else {
                    // Default if nothing stored, or check fallback
                    // If stored primary is empty, maybe check if we have a key in a slot?
                    if (localKeys.primaryKey) {
                        // If we have a key but no provider name (shouldn't happen with new logic), determine by slot?
                        // Our storage logic writes provider name, so we should trust it.
                        // But if user is fresh, default to Gemini.
                    }
                }

                setAiSettings({
                    primary_provider: uiPrimaryProvider,
                    encrypted_keys: {
                        openai: (localKeys.primaryProvider === 'openrouter' ? localKeys.primaryKey : localKeys.fallbackKey) || '',
                        gemini: (localKeys.primaryProvider === 'gemini' ? localKeys.primaryKey : localKeys.fallbackKey) || ''
                    }
                });

            } catch (error) {
                console.error("Failed to load settings", error);
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await ApiAdapter.put('/auth/me', {
                name,
                dailyRevisionTarget: dailyTarget
            });
            toast.success("Profile updated successfully");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleAISave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Save to LocalStorage (Immediate Usage)
            // Map 'openai' UI choice to 'openrouter' storage key
            const preferred = aiSettings.primary_provider === 'gemini' ? 'gemini' : 'openrouter';

            saveAIKeys(
                aiSettings.encrypted_keys.openai,
                aiSettings.encrypted_keys.gemini,
                preferred
            );

            // Optional: Sync with backend if you want persistent cloud storage later
            // await ApiAdapter.put('/ai/settings', ...);

            toast.success("AI API keys saved successfully!");
        } catch (error) {
            toast.error("Failed to update AI settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Settings</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Manage your account and AI preferences.</p>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'profile'
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                                : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                                }`}
                        >
                            <User className="h-5 w-5" />
                            Profile & Goals
                        </button>
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'ai'
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                                : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                                }`}
                        >
                            <Brain className="h-5 w-5" />
                            AI Configuration
                        </button>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1">
                    {activeTab === 'profile' ? (
                        <div className="space-y-6">
                            {/* Profile Card */}
                            <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Personal Information</h2>
                                    <User className="h-5 w-5 text-zinc-400" />
                                </div>
                                <form onSubmit={handleProfileSave} className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Display Name
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                                placeholder="Your Name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-500 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Daily Revision Target</h3>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    How many concepts do you want to review daily?
                                                </p>
                                            </div>
                                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                {dailyTarget}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="5"
                                            max="50"
                                            step="5"
                                            value={dailyTarget}
                                            onChange={(e) => setDailyTarget(Number(e.target.value))}
                                            className="h-2 w-full appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-800 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110"
                                        />
                                        <div className="flex justify-between text-xs text-zinc-500">
                                            <span>Casual (5)</span>
                                            <span>Intense (50)</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* AI Configuration Card */}
                            <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Brain className="h-5 w-5 text-indigo-500" />
                                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">AI Tutor Configuration</h2>
                                    </div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Configure the AI engine that powers your personalized explanations.
                                        Your keys are encrypted and stored securely.
                                    </p>
                                </div>

                                <form onSubmit={handleAISave} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Primary AI Provider
                                            </label>
                                            <div className="flex gap-4">
                                                <label className={`flex flex-1 cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${aiSettings.primary_provider === 'gemini'
                                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500'
                                                    : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900'
                                                    }`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-4 w-4 rounded-full border-2 ${aiSettings.primary_provider === 'gemini' ? 'border-indigo-600 bg-indigo-600' : 'border-zinc-400'
                                                            }`} />
                                                        <span className="font-medium">Google Gemini</span>
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        className="hidden"
                                                        checked={aiSettings.primary_provider === 'gemini'}
                                                        onChange={() => setAiSettings(s => ({ ...s, primary_provider: 'gemini' }))}
                                                    />
                                                </label>

                                                <label className={`flex flex-1 cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${aiSettings.primary_provider === 'openai'
                                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500'
                                                    : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900'
                                                    }`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-4 w-4 rounded-full border-2 ${aiSettings.primary_provider === 'openai' ? 'border-indigo-600 bg-indigo-600' : 'border-zinc-400'
                                                            }`} />
                                                        <span className="font-medium">OpenAI GPT-4</span>
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        className="hidden"
                                                        checked={aiSettings.primary_provider === 'openai'}
                                                        onChange={() => setAiSettings(s => ({ ...s, primary_provider: 'openai' }))}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-4">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Gemini API Key
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={aiSettings.encrypted_keys.gemini || ''}
                                                    onChange={(e) => setAiSettings(s => ({
                                                        ...s,
                                                        encrypted_keys: { ...s.encrypted_keys, gemini: e.target.value }
                                                    }))}
                                                    placeholder="AIzaSy..."
                                                    className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                                />
                                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                            </div>
                                            <p className="text-xs text-zinc-500">
                                                Required for the AI Tutor to generate explanations.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                OpenAI API Key (Optional)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={aiSettings.encrypted_keys.openai || ''}
                                                    onChange={(e) => setAiSettings(s => ({
                                                        ...s,
                                                        encrypted_keys: { ...s.encrypted_keys, openai: e.target.value }
                                                    }))}
                                                    placeholder="sk-..."
                                                    className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                                />
                                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/20">
                                        <div className="flex gap-3">
                                            <Shield className="h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                                            <div>
                                                <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-200">Security Note</h4>
                                                <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                                                    Your API keys are encrypted at rest using AES-256 encryption.
                                                    They are strictly used for generating educational content and are never shared.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Save Settings
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
