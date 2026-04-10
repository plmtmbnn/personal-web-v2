'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { AlertTriangle, CalendarRange, X, Clock } from 'lucide-react';
import { getStaleTasks, rescheduleStaleTasks } from '@/lib/actions/tasks';
import { Task } from '@/lib/types/tasks';
import { format } from 'date-fns';

/**
 * HealthCheck Component
 * Detects uncompleted tasks from past dates and offers bulk rescheduling.
 */
export default function HealthCheck() {
	const [staleTasks, setStaleTasks] = useState<Task[]>([]);
	const [isVisible, setIsVisible] = useState(false);
	const [isPending, startTransition] = useTransition();

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

	const handleRescheduleAll = () => {
		const today = format(new Date(), 'yyyy-MM-dd');
		const ids = staleTasks.map((t) => t.id);

		startTransition(async () => {
			try {
				await rescheduleStaleTasks(ids, today);
				setIsVisible(false);
				setStaleTasks([]);
			} catch (error) {
				console.error('Failed to reschedule tasks:', error);
			}
		});
	};

	const handleIgnore = () => setIsVisible(false);

	if (!isVisible || staleTasks.length === 0) return null;

	return (
		<div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
			<div className="flex items-start gap-5">
				<div className="p-3.5 bg-amber-100 text-amber-600 rounded-2xl border border-amber-200">
					<AlertTriangle className="w-6 h-6" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between mb-1">
						<h3 className="font-black text-amber-900 text-lg">
							Operational Alert: {staleTasks.length} Lapsed {staleTasks.length === 1 ? 'Task' : 'Tasks'}
						</h3>
						<button onClick={handleIgnore} className="p-1.5 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-all">
							<X className="w-5 h-5" />
						</button>
					</div>
					<p className="text-amber-700 text-sm font-medium mb-6 leading-relaxed">
						System detected incomplete objectives from previous cycles. Reschedule to current date to maintain tracking integrity.
					</p>

					<div className="flex flex-wrap gap-2 mb-8">
						{staleTasks.slice(0, 3).map((task) => (
							<div key={task.id} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs text-amber-800 shadow-sm">
								<span className="flex items-center gap-1 font-black px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[9px] uppercase tracking-tighter border border-amber-200">
									<Clock className="w-3 h-3" />
									Pending
								</span>
								<span className="truncate max-w-[120px] font-bold">{task.title}</span>
							</div>
						))}
						{staleTasks.length > 3 && (
							<div className="px-3 py-1.5 bg-white/50 border border-dashed border-amber-300 rounded-xl text-[10px] text-amber-600 font-black uppercase">
								+{staleTasks.length - 3} more
							</div>
						)}
					</div>

					<div className="flex flex-wrap gap-3">
						<button
							onClick={handleRescheduleAll}
							disabled={isPending}
							className="px-6 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-md shadow-amber-200 flex items-center gap-2 active:scale-95 disabled:opacity-50"
						>
							<CalendarRange className="w-4 h-4" />
							{isPending ? 'Syncing...' : 'Reschedule All'}
						</button>
						<button onClick={handleIgnore} className="px-6 py-2.5 bg-white text-amber-700 border border-amber-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all active:scale-95">
							Dismiss
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
