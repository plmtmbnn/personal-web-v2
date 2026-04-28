'use client';

import React from 'react';
import { startOfMonth, endOfMonth, format, getDay } from 'date-fns';
import { Task } from '../types';
import { aggregateHeatmapData } from '../utils/heatmap';
import { motion } from 'framer-motion';

export default function TaskHeatmap({ tasks }: { tasks: Task[] }) {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const data = aggregateHeatmapData(tasks, start, end);
  const days = Object.entries(data);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    if (count >= 1 && count <= 2) return 'bg-emerald-100';
    if (count >= 3 && count <= 5) return 'bg-emerald-300';
    if (count >= 6 && count <= 9) return 'bg-emerald-500';
    return 'bg-emerald-700';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
        Synchronization Heatmap
      </h3>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={`${day}-${i}`} className="text-[9px] font-black text-slate-300 text-center uppercase mb-1">
            {day}
          </div>
        ))}
        {/* Placeholder for offset if month doesn't start on Sunday */}
        {Array.from({ length: getDay(start) }).map((_, i) => (
          <div key={`offset-${i}`} />
        ))}
        {days.map(([date, count], index) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            title={`${date}: ${count} Tasks`}
            className={`aspect-square rounded-sm sm:rounded ${getIntensity(count)} transition-colors cursor-help`}
          />
        ))}
      </div>
    </div>
  );
}
