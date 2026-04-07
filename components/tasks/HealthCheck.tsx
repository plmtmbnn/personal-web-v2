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

	const handleIgnore = () => {
		setIsVisible(false);
	};

	if (!isVisible || staleTasks.length === 0) return null;

	return (
		<div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-[2rem] animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
			<div className="flex items-start gap-4">
				<div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
					<AlertTriangle className="w-6 h-6" />
				</div>
				<div className="flex-1">
					<div className="flex items-center justify-between mb-1">
						<h3 className="font-bold text-amber-900 text-lg flex items-center gap-2">
							Attention: {staleTasks.length} Lapsed {staleTasks.length === 1 ? 'Task' : 'Tasks'}
						</h3>
						<button
							onClick={handleIgnore}
							className="p-1 text-amber-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-100"
							aria-label="Close"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
					<p className="text-amber-700 text-sm mb-5 leading-relaxed">
						You have tasks from previous days that were never completed. Keep your schedule clean by moving them to today or ignoring them.
					</p>

					{/* Task Visualization with Badges */}
					<div className="flex flex-wrap gap-2 mb-6">
						{staleTasks.slice(0, 3).map((task) => (
							<div
								key={task.id}
								className="flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs text-amber-800 shadow-sm"
							>
								<span className="flex items-center gap-1 font-black px-2 py-0.5 bg-amber-200 text-amber-900 rounded-lg text-[9px] uppercase tracking-wider">
									<Clock className="w-3 h-3" />
									Lapsed
								</span>
								<span className="truncate max-w-[150px] font-medium">{task.title}</span>
							</div>
						))}
						{staleTasks.length > 3 && (
							<div className="flex items-center px-3 py-1.5 bg-amber-100/50 border border-dashed border-amber-300 rounded-xl text-xs text-amber-600 font-bold">
								+{staleTasks.length - 3} more
							</div>
						)}
					</div>

					<div className="flex flex-wrap gap-3">
						<button
							onClick={handleRescheduleAll}
							disabled={isPending}
							className="px-5 py-2.5 bg-amber-600 text-white rounded-2xl text-sm font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
						>
							<CalendarRange className="w-4 h-4" />
							{isPending ? 'Rescheduling...' : 'Reschedule All to Today'}
						</button>
						<button
							onClick={handleIgnore}
							className="px-5 py-2.5 bg-white text-amber-700 border border-amber-200 rounded-2xl text-sm font-bold hover:bg-amber-50 hover:border-amber-300 transition-all active:scale-95"
						>
							Ignore
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
