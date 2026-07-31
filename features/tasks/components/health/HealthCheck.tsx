"use client";

import type React from "react";
import { useEffect, useState, useTransition } from "react";
import {
	AlertTriangle,
	CalendarRange,
	X,
	Clock,
	Loader2,
	CalendarDays,
} from "lucide-react";
import {
	getStaleTasks,
	rescheduleOverdueTasks,
} from "@/features/tasks/actions/tasks";
import type { Task } from "@/features/tasks/types";

/**
 * HealthCheck Component
 * Detects uncompleted tasks from past dates and offers multiple rescheduling paths.
 * Enhanced for high contrast and operational clarity.
 */
export default function HealthCheck() {
	const [staleTasks, setStaleTasks] = useState<Task[]>([]);
	const [isVisible, setIsVisible] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
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
				console.error("Failed to fetch stale tasks:", error);
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
					alert(`Error: ${result.message}`);
				}
			} catch (error) {
				console.error("Failed to reschedule tasks:", error);
			} finally {
				setRescheduleType(null);
			}
		});
	};

	const handleIgnore = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsVisible(false);
	};

	if (!isVisible || staleTasks.length === 0) return null;

	if (!isExpanded) {
		return (
			<div
				onClick={() => setIsExpanded(true)}
				className="p-5 bg-white border border-amber-200/80 rounded-[2.5rem] shadow-xl shadow-slate-200/50 relative overflow-hidden cursor-pointer group hover:border-amber-300 transition-all"
			>
				<div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shadow-amber-500/20 shrink-0 group-hover:scale-105 transition-transform">
							<AlertTriangle className="w-5 h-5" />
						</div>
						<div>
							<h3 className="font-extrabold text-slate-900 text-base tracking-tight">
								{staleTasks.length} Lapsed Objectives Detected
							</h3>
							<p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">
								Click to review and reschedule
							</p>
						</div>
					</div>
					<button
						onClick={handleIgnore}
						className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
						aria-label="Dismiss alert"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 sm:p-8 bg-white border border-amber-200/80 rounded-[2.5rem] shadow-xl shadow-slate-200/50 relative overflow-hidden">
			{/* Structural Accent */}
			<div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />

			<div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
				<div className="p-4 bg-amber-500 text-white rounded-2xl shadow-md shadow-amber-500/20 shrink-0">
					<AlertTriangle className="w-7 h-7" />
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between mb-2">
						<h3 className="font-extrabold text-slate-900 text-xl tracking-tight">
							Attention: {staleTasks.length} Lapsed Objectives
						</h3>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setIsExpanded(false)}
								className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all cursor-pointer"
							>
								Collapse
							</button>
							<button
								onClick={handleIgnore}
								className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
								aria-label="Dismiss alert"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
					</div>

					<p className="text-slate-600 text-sm font-medium mb-6 leading-relaxed max-w-2xl">
						We detected incomplete tasks from previous cycles. Reschedule them
						now to maintain your current operational momentum and system
						integrity.
					</p>

					<div className="flex flex-wrap gap-2.5 mb-8">
						{staleTasks.slice(0, 3).map((task) => (
							<div
								key={task.id}
								className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl shadow-xs"
							>
								<div className="flex items-center gap-1.5 px-2 py-0.5 bg-white text-amber-700 rounded-md text-[9px] font-bold uppercase tracking-wider border border-amber-200">
									<Clock className="w-3 h-3 text-amber-600" />
									Pending
								</div>
								<span className="truncate max-w-[180px] font-extrabold text-slate-900 text-xs">
									{task.title}
								</span>
							</div>
						))}
						{staleTasks.length > 3 && (
							<div className="px-4 py-2 bg-slate-100/50 border border-dashed border-slate-300 rounded-xl text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center">
								+{staleTasks.length - 3} additional
							</div>
						)}
					</div>

					<div className="flex flex-wrap items-center gap-4">
						<button
							onClick={() => handleReschedule(1)}
							disabled={isPending}
							className="px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-amber-600 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
						>
							{rescheduleType === 1 ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<CalendarRange className="w-4 h-4" />
							)}
							Reschedule Tomorrow
						</button>

						<button
							onClick={() => handleReschedule(7)}
							disabled={isPending}
							className="px-6 py-3.5 bg-white border border-slate-200/80 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
						>
							{rescheduleType === 7 ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<CalendarDays className="w-4 h-4" />
							)}
							Push to Next Week
						</button>

						<button
							onClick={handleIgnore}
							className="px-4 py-3.5 text-slate-500 font-bold text-xs uppercase tracking-wider hover:text-slate-900 transition-colors ml-auto sm:ml-0 cursor-pointer"
						>
							Discard Alert
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
