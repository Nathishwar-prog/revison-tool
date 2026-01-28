"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KnowledgeCard } from '@/components/KnowledgeCard';
import { LoadingState } from '@/components/LoadingState';
import { AlertCircle, Brain, Target, Star } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

export const KnowledgeTabs = () => {
    const [data, setData] = useState<{
        dueSoon: any[];
        mastered: any[];
        struggling: any[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("due");

    useEffect(() => {
        const fetchTabs = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
                const res = await fetch('/api/dashboard/knowledge-tabs', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                });
                const json = await res.json();
                if (json.error || !json.dueSoon) {
                    setData({ dueSoon: [], mastered: [], struggling: [] });
                } else {
                    setData(json);
                }
            } catch (err) {
                console.error("Failed to fetch tabs:", err);
                setData({ dueSoon: [], mastered: [], struggling: [] });
            } finally {
                setLoading(false);
            }
        };
        fetchTabs();
    }, []);

    if (loading) return <LoadingState />;

    return (
        <Tabs defaultValue="due" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/5 backdrop-blur-md border border-white/10 p-1 rounded-2xl">
                <TabsTrigger value="due" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2 text-slate-400">
                    <Target className="w-4 h-4" />
                    Due Soon
                </TabsTrigger>
                <TabsTrigger value="struggling" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2 text-slate-400">
                    <AlertCircle className="w-4 h-4" />
                    Struggling
                </TabsTrigger>
                <TabsTrigger value="mastered" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2 text-slate-400">
                    <Star className="w-4 h-4" />
                    Mastered
                </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <TabsContent value="due" className="mt-0 outline-none">
                        {data?.dueSoon.length === 0 ? (
                            <EmptyState message="No revisions due in the next 48 hours. Great job!" />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data?.dueSoon.map((item) => (
                                    <KnowledgeCard key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="struggling" className="mt-0 outline-none">
                        {data?.struggling.length === 0 ? (
                            <EmptyState message="You're handling everything well! No struggling concepts detected." />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data?.struggling.map((item) => (
                                    <KnowledgeCard key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="mastered" className="mt-0 outline-none">
                        {data?.mastered.length === 0 ? (
                            <EmptyState message="Keep learning to master your first concepts!" />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data?.mastered.map((item) => (
                                    <KnowledgeCard key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </motion.div>
            </AnimatePresence>
        </Tabs>
    );
};

const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md text-center">
        <Brain className="w-12 h-12 text-slate-600 dark:text-slate-500 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs">
            {message}
        </p>
    </div>
);
