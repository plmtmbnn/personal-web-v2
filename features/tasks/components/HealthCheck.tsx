'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { AlertTriangle, CalendarRange, X, Clock, Loader2, CalendarDays } from 'lucide-react';
import { getStaleTasks, rescheduleOverdueTasks } from '@/features/tasks/actions/tasks';
import { Task } from '@/features/tasks/types';

/**
 * HealthCheck Component
 * Detects uncompleted tasks from past dates and offers multiple rescheduling paths.
 * Enhanced for high contrast and operational clarity.
 */
export default function HealthCheck() {
	const [staleTasks, setStaleTasks] = useState<Task[]>([]);
	const [isVisible, setIsVisible] = useState(false);
	const [isPending, startTransition] = useTransition();
  const [rescheduleType, setRescheduleType] = useState<number | null>(null);

	useEffect(() => {
		const fetchStale = async () => {
			try {
				const tasks = await getStaleTasks();
				if (tasks.length > 0) {
					setStaleTasks(tasks);
					setIsVisible(true);
				}
			} catch (error) {
				console.error('Failed to fetch stale tasks:', error);
			}
		};
		fetchStale();
	}, []);

	const handleReschedule = (days: number) => {
    setRescheduleType(days);
		startTransition(async () => {
			try {
				const result = await rescheduleOverdueTasks(days);
				if (result.success) {
          setIsVisible(false);
          setStaleTasks([]);
        } else {
          alert('Error: ' + result.message);
        }
			} catch (error) {
				console.error('Failed to reschedule tasks:', error);
			} finally {
        setRescheduleType(null);
      }
		});
	};

	const handleIgnore = () => setIsVisible(false);

	if (!isVisible || staleTasks.length === 0) return null;

	return (
		<div className="p-6 bg-amber-50/80 border-2 border-amber-200 rounded-[2rem] shadow-lg shadow-amber-900/5 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden backdrop-blur-sm">
      {/* Structural Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />

			<div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
				<div className="p-4 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20 flex-shrink-0">
					<AlertTriangle className="w-7 h-7" />
				</div>
        
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between mb-2">
						<h3 className="font-black text-slate-900 text-xl tracking-tight">
							Attention: {staleTasks.length} Lapsed Objectives
						</h3>
						<button 
              onClick={handleIgnore} 
              className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-xl transition-all"
              aria-label="Dismiss alert"
            >
							<X className="w-5 h-5" />
						</button>
					</div>
          
					<p className="text-slate-600 text-sm font-medium mb-8 leading-relaxed max-w-2xl">
						We detected incomplete tasks from previous cycles. Reschedule them now to maintain your current operational momentum and system integrity.
					</p>

					<div className="flex flex-wrap gap-2.5 mb-10">
						{staleTasks.slice(0, 3).map((task) => (
							<div key={task.id} className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm group hover:border-amber-300 transition-colors">
								<div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-tighter border border-slate-100">
									<Clock className="w-3 h-3" />
									Pending
								</div>
								<span className="truncate max-w-[180px] font-bold text-slate-800 text-xs">{task.title}</span>
							</div>
						))}
						{staleTasks.length > 3 && (
							<div className="px-4 py-2 bg-slate-100/50 border border-dashed border-slate-300 rounded-xl text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center">
								+{staleTasks.length - 3} additional
							</div>
						)}
					</div>

					<div className="flex flex-wrap items-center gap-4">
						<button
							onClick={() => handleReschedule(1)}
							disabled={isPending}
							className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-amber-600 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none"
						>
							{rescheduleType === 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarRange className="w-4 h-4" />}
							Reschedule Tomorrow
						</button>
            
						<button
							onClick={() => handleReschedule(7)}
							disabled={isPending}
							className="px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none"
						>
							{rescheduleType === 7 ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
							Push to Next Week
						</button>

						<button 
              onClick={handleIgnore} 
              className="px-4 py-3.5 text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] hover:text-slate-600 transition-colors ml-auto sm:ml-0"
            >
							Discard Alert
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
