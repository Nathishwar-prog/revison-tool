"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, AlertTriangle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface Gap {
    knowledgeId: string;
    reason: string;
    title: string;
}

export function GapHunterWidget() {
    const [isScanning, setIsScanning] = useState(false);
    const [gaps, setGaps] = useState<Gap[]>([]);
    const [showResults, setShowResults] = useState(false);
    const router = useRouter();

    const handleScan = async () => {
        setIsScanning(true);
        setGaps([]);
        setShowResults(false);

        try {
            // Call API to analyze gaps
            const response = await fetch('/api/insights/gaps', {
                method: 'POST',
                body: JSON.stringify({}), // Analyze all
            });

            if (!response.ok) throw new Error("Scan failed");

            const data = await response.json();

            // Assume API returns { gaps: [] }
            // And implicitly updates the backend state (confidence levels)
            setGaps(data.gaps || []);
            setShowResults(true);

            if (data.gaps?.length > 0) {
                toast.success(`Found ${data.gaps.length} knowledge gaps!`);
                router.refresh(); // Refresh to update graph colors
            } else {
                toast.success("Knowledge structure is solid! No obvious gaps found.");
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to run Gap Hunter.");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <Card className="border-0 bg-black/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />

            <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <Scan className="h-5 w-5 text-rose-500" />
                    Gap Hunter
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    AI analysis of your knowledge structure.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
                <AnimatePresence mode="wait">
                    {!showResults ? (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-4"
                        >
                            <Button
                                onClick={handleScan}
                                disabled={isScanning}
                                variant="outline"
                                className={`w-full h-12 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 text-zinc-300 transition-all ${isScanning ? 'animate-pulse' : ''}`}
                            >
                                {isScanning ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Scanning Neural Network...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="mr-2 h-4 w-4" />
                                        Initiate System Scan
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            {gaps.length === 0 ? (
                                <div className="text-center py-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                                    <p className="text-emerald-200 font-medium">All Systems Nominal</p>
                                    <p className="text-xs text-emerald-400/60">No critical gaps detected.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-xs font-mono text-rose-400 uppercase tracking-widest mb-2">
                                        CRITICAL GAPS DETECTED [{gaps.length}]
                                    </p>
                                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {gaps.map((gap, i) => (
                                            <div key={i} className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 flex items-start gap-3">
                                                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-bold text-rose-200">{gap.title}</p>
                                                    <p className="text-xs text-rose-300/70 mt-1">{gap.reason}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-zinc-500 hover:text-white mt-2"
                                        onClick={() => setShowResults(false)}
                                    >
                                        Dismiss
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
