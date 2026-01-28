"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Calendar } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TimeCapsuleProps {
    startDate: Date;
    endDate: Date; // Usually today
    currentDate: Date;
    onChange: (date: Date) => void;
    className?: string;
}

export function TimeCapsule({ startDate, endDate, currentDate, onChange, className }: TimeCapsuleProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    // Convert dates to timestamps for slider
    const minTime = startDate.getTime();
    const maxTime = endDate.getTime();
    const currentTime = currentDate.getTime();

    // Use refs for animation loop to avoid dependency cycles / re-renders
    const rafRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const simTimeRef = useRef<number>(currentTime);

    // Sync ref when props change (if not playing)
    useEffect(() => {
        if (!isPlaying) {
            simTimeRef.current = currentDate.getTime();
        }
    }, [currentDate, isPlaying]);

    const stopPlaying = () => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        setIsPlaying(false);
    };

    const animate = (timestamp: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp;

        const delta = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;

        // Target Speed: 2 days per second (Very slow growth visualization)
        // 2 days * 24h * 60m * 60s * 1000ms
        const msPerSecond = 2 * 24 * 60 * 60 * 1000;

        // Calculate advancement based on real elapsed time
        const advance = (msPerSecond * delta) / 1000;

        const nextTime = simTimeRef.current + advance;

        if (nextTime >= maxTime) {
            simTimeRef.current = maxTime;
            onChange(new Date(maxTime));
            stopPlaying();
        } else {
            simTimeRef.current = nextTime;
            onChange(new Date(nextTime));
            rafRef.current = requestAnimationFrame(animate);
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            stopPlaying();
        } else {
            // Restart if at end
            if (simTimeRef.current >= maxTime) {
                simTimeRef.current = minTime;
                onChange(new Date(minTime));
            }

            setIsPlaying(true);
            lastTimeRef.current = 0; // Reset to 0 so first frame captures timestamp
            rafRef.current = requestAnimationFrame(animate);
        }
    };

    const handleSliderChange = (values: number[]) => {
        onChange(new Date(values[0]));
        if (isPlaying) stopPlaying(); // Stop if user drags
    };

    const reset = () => {
        stopPlaying();
        onChange(new Date(maxTime)); // Reset to Today (Live view)
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // Format date for display
    const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', day: 'numeric' }).format(currentDate);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-6 shadow-2xl w-full max-w-2xl mx-auto", className)}
        >
            {/* Controls */}
            <div className="flex items-center gap-2">
                <button
                    onClick={togglePlay}
                    className={cn(
                        "p-3 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg",
                        isPlaying
                            ? "bg-rose-500 text-white shadow-rose-500/30"
                            : "bg-indigo-500 text-white shadow-indigo-500/30"
                    )}
                >
                    {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                </button>

                <button
                    onClick={reset}
                    className="p-2 rounded-full text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                    title="Reset to Present"
                >
                    <RotateCcw className="h-4 w-4" />
                </button>
            </div>

            {/* Slider Section */}
            <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Time Capsule</span>
                    <div className="flex items-center gap-2 text-indigo-200 font-mono font-bold text-sm bg-indigo-500/10 px-3 py-1 rounded border border-indigo-500/20">
                        <Calendar className="h-3 w-3" />
                        {formattedDate}
                    </div>
                </div>

                <Slider
                    defaultValue={[currentTime]}
                    value={[currentTime]}
                    min={minTime}
                    max={maxTime}
                    step={1000 * 60 * 60 * 24} // 1 Day
                    onValueChange={handleSliderChange}
                    className="cursor-pointer py-2"
                />

                <div className="flex justify-between text-[10px] text-zinc-600 font-medium">
                    <span>Day 1</span>
                    <span>Today</span>
                </div>
            </div>
        </motion.div>
    );
}
