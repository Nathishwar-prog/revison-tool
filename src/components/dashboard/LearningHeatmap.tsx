"use client";

import React, { useMemo } from 'react';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapData {
    date: string;
    count: number;
}

interface LearningHeatmapProps {
    data: HeatmapData[];
}

export const LearningHeatmap: React.FC<LearningHeatmapProps> = ({ data }) => {
    const days = useMemo(() => {
        const result = [];
        const today = startOfDay(new Date());
        for (let i = 180; i >= 0; i--) {
            result.push(subDays(today, i));
        }
        return result;
    }, []);

    const getColorClass = (count: number) => {
        if (count === 0) return 'bg-zinc-100 dark:bg-zinc-800';
        if (count <= 2) return 'bg-emerald-200 dark:bg-emerald-900/50';
        if (count <= 5) return 'bg-emerald-400 dark:bg-emerald-700';
        if (count <= 10) return 'bg-emerald-500 dark:bg-emerald-500';
        return 'bg-emerald-600 dark:bg-emerald-400';
    };

    const getDayData = (day: Date) => {
        if (!Array.isArray(data)) return { date: day.toISOString(), count: 0 };
        return data.find(d => isSameDay(new Date(d.date), day)) || { date: day.toISOString(), count: 0 };
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col space-y-3">
                <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 pb-1">
                    <span className="font-medium">Past 6 Months</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-zinc-400">Less</span>
                        <div className="w-3 h-3 rounded bg-zinc-100 dark:bg-zinc-800" />
                        <div className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900/50" />
                        <div className="w-3 h-3 rounded bg-emerald-400 dark:bg-emerald-700" />
                        <div className="w-3 h-3 rounded bg-emerald-500 dark:bg-emerald-500" />
                        <div className="w-3 h-3 rounded bg-emerald-600 dark:bg-emerald-400" />
                        <span className="text-zinc-400">More</span>
                    </div>
                </div>
                
                <div className="grid grid-flow-col grid-rows-7 gap-[3px] overflow-x-auto pb-2 scrollbar-hide">
                    {days.map((day, idx) => {
                        const dayData = getDayData(day);
                        const isToday = isSameDay(day, new Date());
                        return (
                            <Tooltip key={idx}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={`w-[14px] h-[14px] rounded-[3px] transition-all duration-200 cursor-pointer hover:scale-125 hover:ring-2 hover:ring-offset-1 hover:ring-emerald-400 dark:hover:ring-offset-zinc-900 ${getColorClass(dayData.count)} ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-zinc-900' : ''}`}
                                    />
                                </TooltipTrigger>
                                <TooltipContent className="bg-zinc-900 dark:bg-zinc-800 border-zinc-700">
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-xs font-semibold text-white">
                                            {dayData.count} revision{dayData.count !== 1 ? 's' : ''}
                                        </p>
                                        <p className="text-[10px] text-zinc-400">
                                            {format(day, 'EEEE, MMM d, yyyy')}
                                        </p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
                
                <div className="flex justify-between text-[11px] text-zinc-400 dark:text-zinc-500 px-1 font-medium">
                    <span>{format(days[0], 'MMM yyyy')}</span>
                    <span className="text-indigo-500 dark:text-indigo-400">Today</span>
                </div>
            </div>
        </TooltipProvider>
    );
};
