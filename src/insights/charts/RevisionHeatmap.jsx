"use client";

import { useMemo } from 'react';

export function RevisionHeatmap({ data }) {
  const hasData = data && Object.keys(data).length > 0;
  
  const { weeks, days } = useMemo(() => {
    const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (!hasData) return { weeks: [], days: daysArr };

    const today = new Date();
    // Align end of grid to Saturday of current week to ensure full 7-row columns
    const endOfGrid = new Date(today);
    endOfGrid.setDate(today.getDate() + (6 - today.getDay()));
    
    const weeksArr = [];
    const currentDate = new Date(endOfGrid);
    // Move back to the start of the 12-week grid (12 weeks ago Sunday)
    currentDate.setDate(currentDate.getDate() - (12 * 7 - 1));

      for (let w = 0; w < 12; w++) {
        const week = [];
        for (let d = 0; d < 7; d++) {
          const key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
          week.push({
            date: key,
            count: data[key] || 0
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        weeksArr.push(week);
      }
    return { weeks: weeksArr, days: daysArr };
  }, [data, hasData]);

  if (!hasData) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
        No revision history available to show activity.
      </div>
    );
  }

  const getColor = (count) => {
    if (count === 0) return 'bg-zinc-100 dark:bg-zinc-800';
    if (count <= 2) return 'bg-indigo-200 dark:bg-indigo-900/40';
    if (count <= 4) return 'bg-indigo-300 dark:bg-indigo-900/60';
    if (count <= 6) return 'bg-indigo-400 dark:bg-indigo-900/80';
    return 'bg-indigo-600 dark:bg-indigo-500';
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-1">
          <div className="grid grid-rows-7 gap-1 pr-2 pt-6">
            {days.map((day, i) => (
              <span key={day} className="h-3 text-[10px] leading-3 text-zinc-400">
                {i % 2 === 1 ? day : ''}
              </span>
            ))}
          </div>
          
          <div className="flex gap-1">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="grid grid-rows-7 gap-1">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`h-3 w-3 rounded-sm transition-colors ${getColor(day.count)}`}
                    title={`${day.date}: ${day.count} revisions`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-zinc-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-sm bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-2 w-2 rounded-sm bg-indigo-200 dark:bg-indigo-900/40" />
          <div className="h-2 w-2 rounded-sm bg-indigo-400 dark:bg-indigo-900/80" />
          <div className="h-2 w-2 rounded-sm bg-indigo-600 dark:bg-indigo-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
