"use client";

import React from 'react';

interface DailyProgressRingProps {
    completed: number;
    target: number;
    size?: number;
    strokeWidth?: number;
}

export const DailyProgressRing: React.FC<DailyProgressRingProps> = ({
    completed,
    target,
    size = 160,
    strokeWidth = 12
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background Ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        className="text-zinc-100 dark:text-zinc-800"
                    />
                    {/* Progress Ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        style={{
                            strokeDashoffset: offset,
                            transition: 'stroke-dashoffset 0.5s ease-in-out'
                        }}
                        strokeLinecap="round"
                        className="text-indigo-600 dark:text-indigo-500"
                    />
                </svg>
                
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                        {completed}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        of {target} today
                    </span>
                </div>
            </div>
            
            <div className="text-center">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {percentage}% Completed
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {completed >= target ? "Goal reached! 🚀" : "Keep going!"}
                </p>
            </div>
        </div>
    );
};
