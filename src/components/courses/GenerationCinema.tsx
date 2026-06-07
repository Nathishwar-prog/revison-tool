"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Copy, CheckCircle2, Search, FileText, Database, Sparkles } from 'lucide-react';

const PROCESSING_STEPS = [
    { text: "Scanning content structure...", icon: Search },
    { text: "Identifying key concepts...", icon: BrainCircuit },
    { text: "Structuring knowledge graph...", icon: Database },
    { text: "Generating curriculum modules...", icon: Copy },
    { text: "Finalizing course path...", icon: CheckCircle2 }
];

export function GenerationCinema() {
    const [currentStep, setCurrentStep] = useState(0);

    // Cycle through steps
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
        }, 3500); // 3.5s per step
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-[500px] bg-black/90 rounded-xl overflow-hidden border border-white/10 flex flex-col items-center justify-center font-mono text-sm">
            {/* Background Grid & Particles */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

            {/* Center Processing Orb */}
            <div className="relative z-10 mb-12">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full animate-pulse" />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="relative w-32 h-32 rounded-full border border-emerald-500/30 flex items-center justify-center"
                >
                    <div className="absolute inset-2 rounded-full border-t border-r border-emerald-400/50" />
                    <Sparkles className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                </motion.div>
            </div>

            {/* Step Indicators */}
            <div className="relative z-10 w-full max-w-md space-y-4 px-8">
                {PROCESSING_STEPS.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    const isPending = index > currentStep;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center gap-4 transition-all duration-500 ${isActive ? 'scale-105' : 'scale-100'}`}
                        >
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center border transition-colors duration-500
                                ${isActive ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : ''}
                                ${isCompleted ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-700' : ''}
                                ${isPending ? 'bg-transparent border-white/5 text-zinc-700' : ''}
                            `}>
                                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                            </div>

                            <div className="flex-1">
                                <p className={`
                                    text-sm tracking-wide transition-colors duration-300
                                    ${isActive ? 'text-emerald-100 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''}
                                    ${isCompleted ? 'text-emerald-800 line-through decoration-emerald-900/50' : ''}
                                    ${isPending ? 'text-zinc-800' : ''}
                                `}>
                                    {step.text}
                                </p>
                                {/* Progress Bar for Active Step */}
                                {isActive && (
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 3.5, ease: "linear" }}
                                        className="h-0.5 bg-emerald-500/50 mt-1 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                                    />
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Terminal Output Stream (Decor) */}
            <div className="absolute bottom-4 left-4 text-[10px] text-emerald-900/40 font-mono select-none pointer-events-none">
                <p>{">"} INITIALIZING NEURAL PATHWAYS...</p>
                <p>{">"} CONNECTING NODES [AF-209] {"->"} [BX-102]</p>
                <p>{">"} OPTIMIZING LEARNING VECTORS...</p>
            </div>
        </div>
    );
}
