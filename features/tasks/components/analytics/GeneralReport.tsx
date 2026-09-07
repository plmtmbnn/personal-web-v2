"use client";

import { useState, useEffect, useMemo } from "react";
import {
	BarChart3,
	ClipboardList,
	Zap,
	Activity,
	PieChart,
	Repeat,
	AlertTriangle,
	Flame,
	Target,
	Trophy,
	Info,
	Clock,
	ShieldCheck,
	TrendingUp,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
	getTaskStats,
	type AnalyticsStats,
} from "@/features/tasks/actions/analytics";
import type { Task } from "@/features/tasks/types";
import {
	parseISO,
	isSameDay,
	isAfter,
	subDays,
	differenceInDays,
} from "date-fns";
import { AnalyticsDashboardSkeleton } from "../shared/Skeleton";

import dynamic from "next/dynamic";

const DynamicVelocityBurndownCharts = dynamic(
	() => import("./VelocityBurndownCharts"),
	{
		loading: () => (
			<div className="h-64 flex flex-col items-center justify-center gap-3 bg-slate-50/50 rounded-2xl border border-slate-100">
				<div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 animate-spin rounded-full" />
				<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
					Loading charts telemetry...
				</p>
			</div>
		),
		ssr: false,
	},
);

interface GeneralReportProps {
	tasks?: Task[];
}

export default function GeneralReport({ tasks = [] }: GeneralReportProps) {
	const [period, setPeriod] = useState<"today" | "week" | "month">("week");
	const [stats, setStats] = useState<AnalyticsStats | null>(null);
	const [loading, setLoading] = useState(true);
	const reduceMotion = useReducedMotion();

	useEffect(() => {
		const fetchStats = async () => {
			setLoading(true);
			try {
				const data = await getTaskStats(period);
				setStats(data);
			} catch (error) {
				console.error("Failed to fetch analytics:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, [period]);

	/**
	 * Advanced Metrics Engine
	 * Calculates Reliability and Lead Time based on the passed tasks prop and selected period.
	 */
	const reliabilityMetrics = useMemo(() => {
		if (!tasks || tasks.length === 0)
			return {
				punctualityRate: 0,
				executionScore: 0,
				avgLeadTime: 0,
				hasData: false,
			};

		const now = new Date();
		const periodFiltered = tasks.filter((t) => {
			const dueDate = parseISO(t.due_date);
			if (period === "today") return isSameDay(dueDate, now);
			if (period === "week") return isAfter(dueDate, subDays(now, 8));
			if (period === "month") return isAfter(dueDate, subDays(now, 31));
			return true;
		});

		const completed = periodFiltered.filter(
			(t) => t.status === "done" && t.completed_at,
		);
		if (completed.length === 0)
			return {
				punctualityRate: 0,
				executionScore: 0,
				avgLeadTime: 0,
				hasData: false,
			};

		// 1. Punctuality Rate
		const punctualCount = completed.filter(
			(t) => (t.reschedule_count || 0) === 0,
		).length;
		const punctualityRate = Math.round(
			(punctualCount / completed.length) * 100,
		);

		// 2. Execution Score (Weighted average)
		const scores = completed.map((t) => {
			const rc = t.reschedule_count || 0;
			if (rc === 0) return 100;
			if (rc === 1) return 80;
			if (rc === 2) return 50;
			return 0;
		});
		const executionScore = Math.round(
			scores.reduce<number>((a, b) => a + b, 0) / scores.length,
		);

		// 3. Average Lead Time
		const leadTimes = completed.map((t) => {
			const start = parseISO(t.created_at);
			const end = parseISO(t.completed_at!);
			return Math.max(0, differenceInDays(end, start));
		});
		const avgLeadTime = parseFloat(
			(leadTimes.reduce<number>((a, b) => a + b, 0) / leadTimes.length).toFixed(
				1,
			),
		);

		return { punctualityRate, executionScore, avgLeadTime, hasData: true };
	}, [tasks, period]);

	const StatCard = ({
		title,
		value,
		unit,
		icon: Icon,
		colorClass,
		subtext,
		badge,
		description,
	}: {
		title: string;
		value: React.ReactNode;
		unit?: string;
		icon: any;
		colorClass: string;
		subtext?: string;
		badge?: {
			text: string;
			variant?:
				| "emerald"
				| "rose"
				| "slate"
				| "amber"
				| "orange"
				| "blue"
				| "indigo";
		};
		description?: string;
	}) => {
		const badgeVariant = badge?.variant || "slate";
		const badgeStyles =
			badgeVariant === "emerald"
				? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
				: badgeVariant === "rose"
					? "bg-rose-50 text-rose-700 border-rose-200/80"
					: badgeVariant === "amber"
						? "bg-amber-50 text-amber-700 border-amber-200/80"
						: badgeVariant === "orange"
							? "bg-orange-50 text-orange-700 border-orange-200/80"
							: badgeVariant === "blue"
								? "bg-blue-50 text-blue-700 border-blue-200/80"
								: badgeVariant === "indigo"
									? "bg-indigo-50 text-indigo-700 border-indigo-200/80"
									: "bg-slate-50 text-slate-600 border-slate-200/80";

		return (
			<div className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md hover:border-slate-300/80 hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between min-w-0">
				<div>
					<div className="flex items-center justify-between gap-2 mb-3">
						<div
							className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl ${colorClass} transition-transform duration-200 group-hover:scale-105 shrink-0`}
						>
							<Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
						</div>
						{(badge || subtext) && (
							<span
								className={`text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
									badge
										? badgeStyles
										: "bg-emerald-50 text-emerald-700 border-emerald-100"
								}`}
							>
								{badge ? badge.text : subtext}
							</span>
						)}
					</div>
					<p className="text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 truncate">
						{title}
					</p>
					<div className="flex items-baseline gap-1.5 whitespace-nowrap min-w-0">
						<h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
							{value}
						</h4>
						{unit && (
							<span className="text-xs sm:text-sm font-semibold text-slate-400">
								{unit}
							</span>
						)}
					</div>
				</div>
				{description && (
					<p className="text-[10.5px] sm:text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100 font-medium leading-normal break-words">
						{description}
					</p>
				)}
			</div>
		);
	};

	if (loading || !stats) return <AnalyticsDashboardSkeleton />;

	return (
		<div className="space-y-10 pb-10">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-4">
				<div className="group flex items-center gap-6">
					<div className="p-5 bg-slate-900 text-white rounded-[1.5rem] shadow-xl shadow-black/10 shrink-0">
						<BarChart3 className="w-7 h-7 text-indigo-400" />
					</div>
					<div>
						<h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
							Operational Intel
						</h2>
						<p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">
							Strategic Audit
						</p>
					</div>
				</div>

				<div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 w-full md:w-auto">
					{(["today", "week", "month"] as const).map((p) => (
						<button
							key={p}
							onClick={() => setPeriod(p)}
							className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
								period === p
									? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
									: "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
							}`}
						>
							{p}
						</button>
					))}
				</div>
			</div>
			{/* Row 1: Execution & Reliability Command */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Efficiency Card */}
				<div className="bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-10 group shadow-2xl shadow-black/20 transition-transform hover:-translate-y-1 min-w-0">
					<div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
						<svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
							<circle
								cx="50"
								cy="50"
								r="40"
								fill="transparent"
								stroke="rgba(255,255,255,0.1)"
								strokeWidth="10"
							/>
							<motion.circle
								cx="50"
								cy="50"
								r="40"
								fill="transparent"
								stroke="currentColor"
								strokeWidth="10"
								className="text-emerald-400"
								strokeDasharray="251.2"
								initial={reduceMotion ? false : { strokeDashoffset: 251.2 }}
								animate={{
									strokeDashoffset:
										251.2 - (251.2 * stats.completionRate) / 100,
								}}
								transition={{ duration: 1.5, ease: "easeOut" }}
								strokeLinecap="round"
							/>
						</svg>
						<div className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-black text-white">
							{stats.completionRate}%
						</div>
					</div>
					<div className="text-center sm:text-left min-w-0">
						<p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
							Completion Rate
						</p>
						<h4 className="text-3xl font-black text-white tracking-tight leading-none mb-3">
							Efficiency
						</h4>
						<p className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1.5 rounded-lg inline-block !text-white">
							{stats.completedTasks} Objectives Neutralized
						</p>
					</div>
				</div>

				{/* Reliability Card - NEW */}
				<div
					className={`p-8 sm:p-10 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-10 group shadow-2xl transition-all hover:-translate-y-1 border-2 ${
						!reliabilityMetrics.hasData
							? "bg-white border-slate-200 text-slate-400"
							: reliabilityMetrics.punctualityRate > 80
								? "bg-white border-emerald-500/20 text-emerald-600"
								: reliabilityMetrics.punctualityRate > 50
									? "bg-white border-amber-500/20 text-amber-600"
									: "bg-white border-rose-500/20 text-rose-600"
					}`}
				>
					<div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
						<svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
							<circle
								cx="50"
								cy="50"
								r="40"
								fill="transparent"
								stroke="rgba(0,0,0,0.05)"
								strokeWidth="10"
							/>
							{reliabilityMetrics.hasData && (
								<motion.circle
									cx="50"
									cy="50"
									r="40"
									fill="transparent"
									stroke="currentColor"
									strokeWidth="10"
									strokeDasharray="251.2"
									initial={reduceMotion ? false : { strokeDashoffset: 251.2 }}
									animate={{
										strokeDashoffset:
											251.2 -
											(251.2 * reliabilityMetrics.punctualityRate) / 100,
									}}
									transition={{
										duration: 1.5,
										ease: "easeOut",
										delay: 0.5,
									}}
									strokeLinecap="round"
								/>
							)}
						</svg>
						<div className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-black text-slate-900">
							{reliabilityMetrics.hasData
								? `${reliabilityMetrics.punctualityRate}%`
								: "—"}
						</div>
					</div>
					<div className="text-center sm:text-left min-w-0">
						<div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
							<p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
								Punctuality Rate
							</p>
							<div className="group/info relative cursor-help">
								<Info className="w-3 h-3 text-slate-300" />
								<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
									Completing tasks without ever rescheduling them.
								</div>
							</div>
						</div>
						<h4 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">
							Reliability
						</h4>
						<p
							className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border flex items-center gap-2 justify-center sm:justify-start ${
								!reliabilityMetrics.hasData
									? "bg-slate-50 border-slate-200 text-slate-400"
									: reliabilityMetrics.punctualityRate > 80
										? "bg-emerald-50 border-emerald-100"
										: reliabilityMetrics.punctualityRate > 50
											? "bg-amber-50 border-amber-100"
											: "bg-rose-50 border-rose-100"
							}`}
						>
							{!reliabilityMetrics.hasData ? (
								<Clock className="w-3 h-3" />
							) : reliabilityMetrics.punctualityRate > 80 ? (
								<ShieldCheck className="w-3 h-3" />
							) : (
								<Activity className="w-3 h-3" />
							)}
							{!reliabilityMetrics.hasData
								? "Awaiting Data"
								: reliabilityMetrics.punctualityRate > 80
									? "Elite Execution"
									: reliabilityMetrics.punctualityRate > 50
										? "Stable Performance"
										: "Needs Discipline"}
						</p>
					</div>
				</div>
			</div>

			{/* Velocity & Burndown Charts Section - NEW */}
			<section className="bg-slate-50/50 p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
				<DynamicVelocityBurndownCharts />
			</section>

			{/* Row 2: Supporting Stats */}
			<section className="space-y-4">
				<div className="flex items-center justify-between px-1">
					<h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
						<Activity className="w-3.5 h-3.5 text-slate-400" />
						Supporting Intel
					</h3>
					<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
						Operational Cadence
					</span>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
					<StatCard
						title="Total Scope"
						value={stats.totalTasks}
						unit={stats.totalTasks === 1 ? "task" : "tasks"}
						icon={ClipboardList}
						colorClass="bg-blue-50 text-blue-600 border border-blue-100/80"
						badge={{ text: period, variant: "blue" }}
						description="Objectives in cycle"
					/>
					<StatCard
						title="Active Streak"
						value={stats.streak}
						unit={stats.streak === 1 ? "day" : "days"}
						icon={Flame}
						colorClass="bg-orange-50 text-orange-600 border border-orange-100/80"
						badge={
							stats.streak >= 7
								? { text: "On Fire", variant: "orange" }
								: stats.streak > 0
									? { text: "Active", variant: "emerald" }
									: undefined
						}
						description="Operational momentum"
					/>
					<StatCard
						title="Execution Score"
						value={
							reliabilityMetrics.hasData
								? reliabilityMetrics.executionScore
								: "—"
						}
						unit={reliabilityMetrics.hasData ? "/ 100" : undefined}
						icon={Zap}
						colorClass="bg-amber-50 text-amber-600 border border-amber-100/80"
						badge={
							reliabilityMetrics.hasData
								? reliabilityMetrics.executionScore >= 80
									? { text: "Optimal", variant: "emerald" }
									: reliabilityMetrics.executionScore >= 50
										? { text: "Moderate", variant: "amber" }
										: { text: "Critical", variant: "rose" }
								: undefined
						}
						description="Weighted reliability grade"
					/>
					<StatCard
						title="Lead Time"
						value={
							reliabilityMetrics.hasData ? reliabilityMetrics.avgLeadTime : "—"
						}
						unit={reliabilityMetrics.hasData ? "d avg" : undefined}
						icon={Clock}
						colorClass="bg-purple-50 text-purple-600 border border-purple-100/80"
						badge={{ text: "Cycle", variant: "slate" }}
						description="Avg cycle duration"
					/>
					<StatCard
						title="Velocity"
						value={stats.taskVelocity}
						unit="tasks / day"
						icon={TrendingUp}
						colorClass="bg-indigo-50 text-indigo-600 border border-indigo-100/80"
						badge={
							stats.taskVelocity >= 1
								? { text: "High", variant: "emerald" }
								: { text: "Steady", variant: "slate" }
						}
						description="Average completion rate"
					/>
					<StatCard
						title="Trend"
						value={
							<span
								className={
									stats.comparison > 0
										? "text-emerald-600"
										: stats.comparison < 0
											? "text-rose-600"
											: "text-slate-900"
								}
							>
								{stats.comparison > 0
									? `+${stats.comparison}%`
									: `${stats.comparison}%`}
							</span>
						}
						icon={Activity}
						colorClass={
							stats.comparison > 0
								? "bg-emerald-50 text-emerald-600 border border-emerald-100/80"
								: stats.comparison < 0
									? "bg-rose-50 text-rose-600 border border-rose-100/80"
									: "bg-slate-50 text-slate-600 border border-slate-200/80"
						}
						badge={
							stats.comparison > 0
								? { text: "Rising", variant: "emerald" }
								: stats.comparison < 0
									? { text: "Falling", variant: "rose" }
									: { text: "Flat", variant: "slate" }
						}
						description="vs. Previous Period"
					/>
				</div>
			</section>

			{/* Row 3: Tactical Breakdown */}
			<div className="grid grid-cols-1 gap-8">
				{/* Distribution & Categories Dual Column */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-[3rem] shadow-sm space-y-10 min-w-0">
						<div className="flex items-center gap-5">
							<div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.2rem] border border-indigo-100 flex-shrink-0">
								<Target className="w-7 h-7" />
							</div>
							<div>
								<h3 className="font-black text-sm uppercase tracking-[0.3em] text-slate-900">
									Distribution
								</h3>
								<p className="text-xs font-medium text-slate-400">
									Current operational spread
								</p>
							</div>
						</div>
						<div className="space-y-8">
							{[
								{
									label: "Focus (Today)",
									count: stats.distribution.today,
									color: "bg-orange-500",
								},
								{
									label: "Upcoming Awareness",
									count: stats.distribution.upcoming,
									color: "bg-blue-500",
								},
								{
									label: "Overdue Lapsed",
									count: stats.distribution.overdue,
									color: "bg-rose-500",
								},
							].map((item) => (
								<div key={item.label} className="space-y-3">
									<div className="flex justify-between items-end gap-4">
										<span className="text-[11px] font-black uppercase tracking-widest text-slate-500 break-words leading-tight">
											{item.label}
										</span>
										<span className="text-lg font-black text-slate-900 flex-shrink-0">
											{item.count}
										</span>
									</div>
									<div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
										<motion.div
											initial={reduceMotion ? false : { width: 0 }}
											animate={{
												width: `${(item.count / (stats.distribution.today + stats.distribution.upcoming + stats.distribution.overdue || 1)) * 100}%`,
											}}
											transition={{ duration: 1, ease: "easeOut" }}
											className={`h-full ${item.color} shadow-lg`}
										/>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-[3rem] shadow-sm space-y-10 min-w-0">
						<div className="flex items-center gap-5">
							<div className="p-4 bg-cyan-50 text-cyan-600 rounded-[1.2rem] border border-cyan-100 flex-shrink-0">
								<PieChart className="w-7 h-7" />
							</div>
							<div>
								<h3 className="font-black text-sm uppercase tracking-[0.3em] text-slate-900">
									Top Segments
								</h3>
								<p className="text-xs font-medium text-slate-400">
									Dominant categories
								</p>
							</div>
						</div>
						<div className="space-y-8">
							{stats.categoryDistribution.slice(0, 4).map((item) => (
								<div key={item.category} className="space-y-3">
									<div className="flex justify-between items-end gap-4">
										<span className="text-[11px] font-black uppercase tracking-widest text-slate-500 break-words leading-tight">
											{item.category}
										</span>
										<span className="text-lg font-black text-slate-900 flex-shrink-0">
											{item.count}
										</span>
									</div>
									<div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
										<motion.div
											initial={reduceMotion ? false : { width: 0 }}
											animate={{
												width: `${(item.count / stats.totalTasks) * 100}%`,
											}}
											className="h-full bg-cyan-500 shadow-lg"
										/>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Reschedule Intelligence */}
				<div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-[3rem] shadow-sm min-w-0">
					<div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-8">
						<div className="flex items-center gap-5">
							<div className="p-4 bg-amber-50 text-amber-600 rounded-[1.2rem] border border-amber-100 flex-shrink-0">
								<Repeat className="w-7 h-7" />
							</div>
							<div>
								<h3 className="font-black text-sm uppercase tracking-[0.3em] text-slate-900">
									Reschedule Intel
								</h3>
								<p className="text-xs font-medium text-slate-400">
									Temporal discipline analysis
								</p>
							</div>
						</div>
						<div className="flex items-center gap-10">
							<div className="text-center md:text-right">
								<p className="text-3xl font-black text-slate-900 leading-none">
									{stats.totalReschedules}
								</p>
								<p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">
									Total Delays
								</p>
							</div>
							<div className="w-px h-10 bg-slate-100 hidden md:block" />
							<div className="text-center md:text-right">
								<p className="text-3xl font-black text-slate-900 leading-none">
									{stats.averageReschedule}x
								</p>
								<p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">
									Avg per task
								</p>
							</div>
						</div>
					</div>

					{stats.mostRescheduledTask && (
						<div className="p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] relative overflow-hidden group hover:bg-rose-100/50 transition-colors">
							<div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
								<AlertTriangle className="w-24 h-24 text-rose-600" />
							</div>
							<div className="flex items-center gap-3 text-rose-600 mb-4 relative z-10">
								<AlertTriangle className="w-5 h-5 flex-shrink-0" />
								<span className="text-[11px] font-black uppercase tracking-[0.2em]">
									Procrastinator Alert
								</span>
							</div>
							<p className="text-xl font-black text-slate-900 mb-4 break-words whitespace-normal relative z-10 leading-snug max-w-2xl">
								{stats.mostRescheduledTask.title}
							</p>
							<div className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 relative z-10">
								{stats.mostRescheduledTask.count} Times Delayed
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Bottom Row: High-Level Insights */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
				<div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm transition-all hover:bg-emerald-100/50 min-w-0">
					<div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 flex-shrink-0">
						<Trophy className="w-7 h-7" />
					</div>
					<div className="min-w-0">
						<p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
							Peak Performance
						</p>
						<h4 className="text-xl font-black text-slate-900 break-words whitespace-normal leading-tight">
							{stats.mostProductiveDay}
						</h4>
					</div>
				</div>
				<div className="bg-slate-50 border border-slate-200 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm transition-all hover:bg-slate-100/50 min-w-0">
					<div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg shadow-black/20 flex-shrink-0">
						<Activity className="w-7 h-7" />
					</div>
					<div className="min-w-0">
						<p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
							System Health
						</p>
						<h4 className="text-xl font-black text-slate-900 break-words whitespace-normal leading-tight">
							Operations Nominal
						</h4>
					</div>
				</div>
			</div>
		</div>
	);
}
