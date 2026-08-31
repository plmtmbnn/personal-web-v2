"use client";

import { useMemo, useCallback } from "react";
import {
	CheckCircle2,
	Calendar,
	Flame,
	Timer,
	ArrowUpRight,
	BarChart3,
	Layers,
} from "lucide-react";
import type { Task } from "@/features/tasks/types";
import { formatEstimatedTime } from "@/features/tasks/constants";
import {
	format,
	addDays,
	addMonths,
	parseISO,
	startOfDay,
	isSameDay,
} from "date-fns";

interface TaskProgressProps {
	tasks: Task[];
}

function getStatusText(
	progress: number,
	verified: number,
	today: number,
	totalPending: number,
): string {
	if (progress === 100 && (verified > 0 || today > 0)) {
		return "All objectives complete — outstanding execution!";
	}
	if (totalPending === 0 && verified === 0) {
		return "All clear — no pending objectives.";
	}
	if (progress >= 75) return "Almost there — finish strong!";
	if (progress >= 50) return "Past halfway — great momentum.";
	if (progress > 0) return "In motion — keep pushing forward.";
	if (today > 0)
		return `${today} ${today === 1 ? "objective" : "objectives"} ready for today.`;
	return "Strategic readiness — prepare next actions.";
}

export default function TaskProgress({ tasks }: TaskProgressProps) {
	const todayRef = useMemo(() => startOfDay(new Date()), []);
	const todayStr = useMemo(() => format(todayRef, "yyyy-MM-dd"), [todayRef]);
	const next7DaysStr = useMemo(
		() => format(addDays(todayRef, 7), "yyyy-MM-dd"),
		[todayRef],
	);
	const next30DaysStr = useMemo(
		() => format(addMonths(todayRef, 1), "yyyy-MM-dd"),
		[todayRef],
	);

	// Compute metrics in real-time from active tasks state with zero latency
	const metrics = useMemo(() => {
		const allTasks = tasks || [];
		const activeTasks = allTasks.filter(
			(t) =>
				(t.status || "todo") !== "cancelled" && (t.status || "todo") !== "done",
		);

		// Today's pending tasks
		const pendingToday = activeTasks.filter((t) => {
			if (!t.due_date) return false;
			return t.due_date === todayStr;
		});

		// Completed today tasks
		const completedToday = allTasks.filter((t) => {
			if (t.status !== "done") return false;
			if (t.completed_at) {
				return isSameDay(parseISO(t.completed_at), todayRef);
			}
			if (t.due_date) {
				return t.due_date === todayStr;
			}
			return false;
		});

		// Next 7 days pending
		const pending7Days = activeTasks.filter((t) => {
			if (!t.due_date) return false;
			return t.due_date >= todayStr && t.due_date <= next7DaysStr;
		});

		// Next 30 days pending
		const pending30Days = activeTasks.filter((t) => {
			if (!t.due_date) return false;
			return t.due_date >= todayStr && t.due_date <= next30DaysStr;
		});

		const totalPending = activeTasks.length;
		const totalToday = pendingToday.length + completedToday.length;
		const progress =
			totalToday > 0
				? Math.round((completedToday.length / totalToday) * 100)
				: totalPending === 0 && completedToday.length > 0
					? 100
					: 0;

		// Effort tracking for today
		const pendingTodayEffort = pendingToday.reduce(
			(acc, t) => acc + (t.estimated_minutes || 0),
			0,
		);
		const completedTodayEffort = completedToday.reduce(
			(acc, t) => acc + (t.estimated_minutes || 0),
			0,
		);
		const todayEstimatedMinutes = pendingTodayEffort + completedTodayEffort;

		return {
			today: pendingToday.length,
			week: pending7Days.length,
			month: pending30Days.length,
			allTime: totalPending,
			verified: completedToday.length,
			progress,
			todayEstimatedMinutes,
			todayCompletedMinutes: completedTodayEffort,
		};
	}, [tasks, todayRef, todayStr, next7DaysStr, next30DaysStr]);

	const scrollToSection = useCallback((id: string) => {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, []);

	const isComplete =
		metrics.progress === 100 && (metrics.verified > 0 || metrics.today > 0);

	const radius = 30;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (metrics.progress / 100) * circumference;

	const statusText = getStatusText(
		metrics.progress,
		metrics.verified,
		metrics.today,
		metrics.allTime,
	);

	return (
		<div
			className={`p-5 sm:p-6 bg-white border rounded-[2rem] sm:rounded-[2.5rem] transition-all duration-300 ${
				isComplete
					? "border-emerald-300 bg-emerald-50/15 ring-2 ring-emerald-500/20 shadow-xl shadow-slate-200/40"
					: "border-slate-200/80 shadow-xl shadow-slate-200/40"
			}`}
		>
			<div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 sm:gap-8">
				{/* Progress Ring + Status Overview */}
				<div className="flex items-center gap-5 sm:gap-6 shrink-0 w-full lg:w-[48%] xl:w-[46%] min-w-0">
					{/* Animated SVG Ring */}
					<div className="relative w-20 h-20 shrink-0">
						<svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
							<circle
								cx="40"
								cy="40"
								r={radius}
								fill="transparent"
								stroke="currentColor"
								strokeWidth="7"
								className="text-slate-100"
							/>
							<circle
								cx="40"
								cy="40"
								r={radius}
								fill="transparent"
								stroke="currentColor"
								strokeWidth="7"
								strokeDasharray={circumference}
								style={{
									strokeDashoffset: offset,
									transition:
										"stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
								}}
								strokeLinecap="round"
								className={isComplete ? "text-emerald-500" : "text-indigo-600"}
							/>
						</svg>
						<div className="absolute inset-0 flex items-center justify-center text-[15px] font-black text-slate-900">
							{metrics.progress}%
						</div>
					</div>

					{/* Status Text & Execution Badges */}
					<div className="text-left flex-1 min-w-0">
						<p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">
							Mission Progress
						</p>
						<p
							className={`text-base sm:text-lg font-black tracking-tight leading-snug mb-2.5 ${
								isComplete ? "text-emerald-800" : "text-slate-900"
							}`}
						>
							{statusText}
						</p>
						<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
							<span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-2xs whitespace-nowrap">
								<CheckCircle2 className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
								{metrics.verified} Done Today
							</span>
							<span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-orange-50 text-orange-700 border border-orange-200/70 shadow-2xs whitespace-nowrap">
								<Flame className="w-3 h-3 text-orange-600 fill-orange-600" />
								{metrics.today} Due Today
							</span>
						</div>

						{/* Effort Tracking Bar */}
						{metrics.todayEstimatedMinutes > 0 && (
							<div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 max-w-[240px]">
								<div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
									<span className="flex items-center gap-1">
										<Timer className="w-3 h-3 text-indigo-600" /> Today's Effort
									</span>
									<span className="text-slate-900 font-extrabold">
										{formatEstimatedTime(metrics.todayCompletedMinutes)} /{" "}
										{formatEstimatedTime(metrics.todayEstimatedMinutes)}
									</span>
								</div>
								<div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
									<div
										className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
										style={{
											width: `${Math.min(
												100,
												(metrics.todayCompletedMinutes /
													metrics.todayEstimatedMinutes) *
													100,
											)}%`,
										}}
									/>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Vertical Separator for Desktop */}
				<div className="hidden lg:block w-px self-stretch bg-slate-200/80 my-1 shrink-0" />

				{/* Interactive Metric Cards 2x2 Grid (2 columns on mobile, 2 columns on desktop) */}
				<div className="grid grid-cols-2 gap-2.5 sm:gap-3 flex-1 min-w-0 w-full">
					{/* Today Card */}
					<button
						type="button"
						onClick={() => scrollToSection("today-section")}
						className="rounded-2xl p-3 sm:p-3.5 bg-slate-50/70 border border-slate-200/80 hover:border-orange-300 hover:bg-white hover:shadow-xs text-left transition-all active:scale-95 duration-200 group cursor-pointer min-w-0"
					>
						<div className="flex items-center justify-between gap-1 mb-1">
							<p className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 group-hover:text-orange-600 transition-colors truncate">
								<Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 shrink-0" />
								<span className="truncate">Today</span>
							</p>
							<ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-colors shrink-0" />
						</div>
						<p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
							{metrics.today}
						</p>
						<p className="text-[9px] font-semibold text-slate-400 truncate mt-0.5">
							Due today
						</p>
					</button>

					{/* Next 7 Days Card */}
					<button
						type="button"
						onClick={() => scrollToSection("upcoming-section")}
						className="rounded-2xl p-3 sm:p-3.5 bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 hover:bg-white hover:shadow-xs text-left transition-all active:scale-95 duration-200 group cursor-pointer min-w-0"
					>
						<div className="flex items-center justify-between gap-1 mb-1">
							<p className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 group-hover:text-indigo-600 transition-colors truncate">
								<Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
								<span className="truncate">Next 7 Days</span>
							</p>
							<ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0" />
						</div>
						<p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
							{metrics.week}
						</p>
						<p className="text-[9px] font-semibold text-slate-400 truncate mt-0.5">
							Week horizon
						</p>
					</button>

					{/* Next 1 Month Card */}
					<button
						type="button"
						onClick={() => scrollToSection("upcoming-section")}
						className="rounded-2xl p-3 sm:p-3.5 bg-slate-50/70 border border-slate-200/80 hover:border-blue-300 hover:bg-white hover:shadow-xs text-left transition-all active:scale-95 duration-200 group cursor-pointer min-w-0"
					>
						<div className="flex items-center justify-between gap-1 mb-1">
							<p className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 group-hover:text-blue-600 transition-colors truncate">
								<BarChart3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
								<span className="truncate">Next 1 Month</span>
							</p>
							<ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
						</div>
						<p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
							{metrics.month}
						</p>
						<p className="text-[9px] font-semibold text-slate-400 truncate mt-0.5">
							Monthly outlook
						</p>
					</button>

					{/* Total Pending Card (High Contrast) */}
					<button
						type="button"
						onClick={() => scrollToSection("upcoming-section")}
						className="rounded-2xl p-3 sm:p-3.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:shadow-md text-left transition-all active:scale-95 duration-200 group cursor-pointer min-w-0"
					>
						<div className="flex items-center justify-between gap-1 mb-1">
							<p className="text-[10px] font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5 truncate">
								<Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
								<span className="truncate">Total Pending</span>
							</p>
							<ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors shrink-0" />
						</div>
						<p className="text-xl sm:text-2xl font-black text-white leading-tight">
							{metrics.allTime}
						</p>
						<p className="text-[9px] font-semibold text-slate-400 truncate mt-0.5">
							Active backlog
						</p>
					</button>
				</div>
			</div>
		</div>
	);
}
