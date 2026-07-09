"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { CheckCircle2, Circle, Calendar, Clock, BarChart3 } from "lucide-react";
import { getTaskProgressMetrics } from "@/features/tasks/actions/analytics";
import type { Task } from "@/features/tasks/types";
import { formatEstimatedTime } from "@/features/tasks/constants";

interface Metrics {
	today: number;
	week: number;
	month: number;
	allTime: number;
	verified: number;
	progress: number;
	todayEstimatedMinutes: number;
	todayCompletedMinutes: number;
}

interface TaskProgressProps {
	tasks: Task[];
}

function getStatusText(
	progress: number,
	verified: number,
	today: number,
): string {
	if (progress === 100 && (verified > 0 || today > 0))
		return "All tasks complete — great work!";
	if (progress >= 50) return "Past halfway — finish strong.";
	if (verified === 0 && today === 0) return "No tasks started yet.";
	return "Getting started, keep going.";
}

export default function TaskProgress({ tasks }: TaskProgressProps) {
	const [metrics, setMetrics] = useState<Metrics | null>(null);
	const [_isPending, startTransition] = useTransition();

	useEffect(() => {
		startTransition(async () => {
			const data = await getTaskProgressMetrics();
			setMetrics(data);
		});
	}, [tasks]);

	const scrollToSection = useCallback((id: string) => {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, []);

	if (!metrics) {
		return (
			<div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm animate-pulse min-h-[142px]">
				<div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
					{/* Progress ring + status skeleton */}
					<div className="flex items-center gap-6 flex-shrink-0 w-full lg:w-auto">
						<div className="w-20 h-20 bg-slate-100 rounded-full flex-shrink-0" />
						<div className="space-y-2 flex-1 lg:w-48">
							<div className="h-2.5 w-16 bg-slate-100 rounded" />
							<div className="h-4.5 w-36 bg-slate-100 rounded" />
							<div className="flex gap-2 pt-1">
								<div className="h-6 w-20 bg-slate-100 rounded-lg" />
								<div className="h-6 w-20 bg-slate-100 rounded-lg" />
							</div>
						</div>
					</div>

					{/* Divider skeleton */}
					<div className="hidden lg:block w-px h-16 bg-slate-100 self-center" />

					{/* Metric cards skeleton */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 w-full">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="rounded-xl px-4 py-3 bg-slate-50 border border-slate-100 h-[68px] flex flex-col justify-between"
							>
								<div className="h-2.5 w-12 bg-slate-100 rounded" />
								<div className="h-5 w-8 bg-slate-100 rounded" />
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	const isComplete =
		metrics.progress === 100 && (metrics.verified > 0 || metrics.today > 0);

	const radius = 30;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (metrics.progress / 100) * circumference;

	const statusText = getStatusText(
		metrics.progress,
		metrics.verified,
		metrics.today,
	);

	return (
		<div
			className={`p-5 bg-white border rounded-2xl transition-all duration-500 ${
				isComplete
					? "border-emerald-200 bg-emerald-50/30 ring-2 ring-emerald-500/10"
					: "border-slate-200 shadow-sm"
			}`}
		>
			<div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
				{/* Progress ring + status */}
				<div className="flex items-center gap-6 flex-shrink-0">
					{/* Ring */}
					<div className="relative w-20 h-20 flex-shrink-0">
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
										"stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
								}}
								strokeLinecap="round"
								className={isComplete ? "text-emerald-500" : "text-blue-500"}
							/>
						</svg>
						<div className="absolute inset-0 flex items-center justify-center text-[15px] font-black text-slate-900">
							{metrics.progress}%
						</div>
					</div>

					{/* Status text + badges */}
					<div className="text-left">
						<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
							Mission Progress
						</p>
						<p
							className={`text-lg font-black tracking-tight leading-tight mb-3 ${
								isComplete ? "text-emerald-700" : "text-slate-900"
							}`}
						>
							{statusText}
						</p>
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
								<CheckCircle2 className="w-3 h-3" />
								{metrics.verified} Verified
							</span>
							<span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 border border-slate-200">
								<Circle className="w-3 h-3" />
								{metrics.today} Pending
							</span>
						</div>
						{metrics.todayEstimatedMinutes > 0 && (
							<div className="mt-3 pt-3 border-t border-slate-100/50 space-y-1.5">
								<div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
									<span className="flex items-center gap-1">
										<Clock className="w-2.5 h-2.5" /> Effort today
									</span>
									<span>
										{formatEstimatedTime(metrics.todayCompletedMinutes)} /{" "}
										{formatEstimatedTime(metrics.todayEstimatedMinutes)}
									</span>
								</div>
								<div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
									<div
										className="h-full bg-cyan-500 rounded-full transition-all duration-500"
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

				{/* Divider */}
				<div className="hidden lg:block w-px h-16 bg-slate-100 self-center" />

				{/* Metric cards */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 w-full">
					{[
						{
							label: "Today",
							value: metrics.today,
							icon: <Clock className="w-3 h-3" />,
							targetId: "today-section",
						},
						{
							label: "This week",
							value: metrics.week,
							icon: <Calendar className="w-3 h-3" />,
							targetId: "upcoming-section",
						},
						{
							label: "This month",
							value: metrics.month,
							icon: <BarChart3 className="w-3 h-3" />,
							targetId: "upcoming-section",
						},
					].map(({ label, value, icon, targetId }) => (
						<button
							key={label}
							type="button"
							onClick={() => scrollToSection(targetId)}
							className="rounded-xl px-4 py-3 bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-slate-100/50 hover:shadow-sm text-left transition-all active:scale-95 duration-200 group"
						>
							<p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5 flex items-center gap-1.5 group-hover:text-blue-500 transition-colors">
								{icon}
								{label}
							</p>
							<p className="text-xl font-black text-slate-900">{value}</p>
						</button>
					))}
					{/* Total Pending Card (High Contrast) */}
					<button
						type="button"
						onClick={() => scrollToSection("upcoming-section")}
						className="rounded-xl px-4 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 hover:shadow-lg text-left transition-all active:scale-95 duration-200 group"
					>
						<p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5 !text-white opacity-80 group-hover:opacity-100 transition-opacity">
							Total Pending
						</p>
						<p className="text-xl font-black text-white !text-white">
							{metrics.allTime}
						</p>
					</button>
				</div>
			</div>
		</div>
	);
}
