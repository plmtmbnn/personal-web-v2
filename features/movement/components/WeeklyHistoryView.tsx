"use client";

import { useMemo } from "react";
import {
	CheckCircle2,
	Footprints,
	TrendingUp,
	Activity,
	Award,
} from "lucide-react";
import type { MovementAppState, MovementSummaryStats } from "../types";
import { getCalendarHeatmapData } from "../lib/storage";

interface WeeklyHistoryViewProps {
	state: MovementAppState;
	stats: MovementSummaryStats;
}

export default function WeeklyHistoryView({
	state,
	stats,
}: WeeklyHistoryViewProps) {
	const heatmapDays = useMemo(() => {
		return getCalendarHeatmapData(state, 28);
	}, [state]);

	return (
		<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
			{/* Header */}
			<div className="pb-4 border-b border-slate-100">
				<h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
					Consistency &amp; Weekly Activity
				</h2>
				<p className="text-xs text-slate-500 font-normal">
					Focus on sustainable weekly volume. Daily routines adapt to meetings,
					rest, and endurance runs.
				</p>
			</div>

			{/* Weekly Metrics Matrix */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{/* Weekly Total */}
				<div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1">
					<div className="flex items-center gap-1.5 text-slate-400">
						<Activity className="w-3.5 h-3.5 text-emerald-600" />
						<span className="text-[10px] font-bold uppercase tracking-wider">
							Weekly Total
						</span>
					</div>
					<p className="text-xl font-black text-slate-900 font-mono">
						{stats.weeklyTotalSessions}
					</p>
					<span className="text-[11px] text-slate-500">breaks completed</span>
				</div>

				{/* Daily Average */}
				<div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1">
					<div className="flex items-center gap-1.5 text-slate-400">
						<TrendingUp className="w-3.5 h-3.5 text-blue-600" />
						<span className="text-[10px] font-bold uppercase tracking-wider">
							Daily Avg
						</span>
					</div>
					<p className="text-xl font-black text-slate-900 font-mono">
						{stats.weeklyAveragePerDay}
					</p>
					<span className="text-[11px] text-slate-500">sessions / day</span>
				</div>

				{/* Target Days Met */}
				<div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1">
					<div className="flex items-center gap-1.5 text-slate-400">
						<CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
						<span className="text-[10px] font-bold uppercase tracking-wider">
							Target Hit
						</span>
					</div>
					<p className="text-xl font-black text-slate-900 font-mono">
						{stats.weeklyDaysMetTarget} / 7
					</p>
					<span className="text-[11px] text-slate-500">days met target</span>
				</div>

				{/* Walking Time */}
				<div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1">
					<div className="flex items-center gap-1.5 text-slate-400">
						<Footprints className="w-3.5 h-3.5 text-amber-600" />
						<span className="text-[10px] font-bold uppercase tracking-wider">
							Walking Time
						</span>
					</div>
					<p className="text-xl font-black text-slate-900 font-mono">
						{stats.totalWalkingMinutesThisWeek}m
					</p>
					<span className="text-[11px] text-slate-500">post-meal walks</span>
				</div>
			</div>

			{/* Most Frequent Exercise Pill if exists */}
			{stats.mostFrequentMovement && (
				<div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/70 flex items-center justify-between text-xs">
					<div className="flex items-center gap-2">
						<Award className="w-4 h-4 text-emerald-600 shrink-0" />
						<span className="font-semibold text-emerald-950">
							Most Frequent Habit:
						</span>
						<span className="font-bold text-emerald-900">
							{stats.mostFrequentMovement.movement.name}
						</span>
					</div>
					<span className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
						{stats.mostFrequentMovement.count} sessions
					</span>
				</div>
			)}

			{/* 4-Week Consistency Heatmap */}
			<div className="space-y-3 pt-2">
				<div className="flex items-center justify-between text-xs">
					<span className="font-bold text-slate-700 uppercase tracking-wider">
						4-Week Movement Heatmap
					</span>
					<div className="flex items-center gap-1.5 text-[11px] text-slate-400">
						<span>Light</span>
						<div className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
						<div className="w-3 h-3 rounded bg-emerald-200" />
						<div className="w-3 h-3 rounded bg-emerald-400" />
						<div className="w-3 h-3 rounded bg-emerald-600" />
						<span>Target</span>
					</div>
				</div>

				{/* Grid of 28 days (4 weeks x 7 days) */}
				<div className="grid grid-cols-7 gap-2 pt-1">
					{heatmapDays.map((day) => {
						const count = day.count;
						let bgClass = "bg-slate-100 border-slate-200/80 text-slate-500";

						if (count >= 6) {
							bgClass = "bg-emerald-600 border-emerald-700 text-white";
						} else if (count >= 4) {
							bgClass = "bg-emerald-400 border-emerald-500 text-white";
						} else if (count >= 1) {
							bgClass = "bg-emerald-100 border-emerald-300 text-emerald-900";
						}

						return (
							<div
								key={day.date}
								title={`${day.date} (${day.dayName}): ${count} sessions logged`}
								className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center transition-transform hover:scale-105 ${bgClass}`}
							>
								<span className="text-[10px] font-bold uppercase opacity-80">
									{day.dayName}
								</span>
								<span className="text-xs sm:text-sm font-black font-mono">
									{count}
								</span>
							</div>
						);
					})}
				</div>

				<p className="text-[11px] text-slate-600 text-center pt-1">
					Neutral visual consistency tracker. Every break breaks prolonged
					sitting.
				</p>
			</div>
		</div>
	);
}
