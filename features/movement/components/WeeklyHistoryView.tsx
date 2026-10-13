"use client";

import { useState, useMemo } from "react";
import {
	CheckCircle2,
	Footprints,
	TrendingUp,
	Activity,
	Award,
	Columns3,
	TableProperties,
} from "lucide-react";
import type { MovementAppState, MovementSummaryStats } from "../types";
import { getMonthlyDayAccumulation } from "../lib/storage";

interface WeeklyHistoryViewProps {
	state: MovementAppState;
	stats: MovementSummaryStats;
}

export default function WeeklyHistoryView({
	state,
	stats,
}: WeeklyHistoryViewProps) {
	const [viewMode, setViewMode] = useState<"cards" | "matrix">("cards");

	const monthlyData = useMemo(() => {
		return getMonthlyDayAccumulation(state);
	}, [state]);

	const targetPerDay = state.config.dailyTarget;

	// Calculate 3-month combined average per day of the week for matrix comparison
	const combinedDayStats = useMemo(() => {
		const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		return days.map((dayName, idx) => {
			let totalSessions = 0;
			let totalOccurrences = 0;
			for (const m of monthlyData) {
				const dayData = m.days[idx];
				if (dayData) {
					totalSessions += dayData.totalSessions;
					totalOccurrences += dayData.occurrencesCount;
				}
			}
			const avg =
				totalOccurrences > 0
					? Math.round((totalSessions / totalOccurrences) * 10) / 10
					: 0;
			return {
				dayName,
				totalSessions,
				totalOccurrences,
				avg,
			};
		});
	}, [monthlyData]);

	return (
		<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
			{/* Section Header */}
			<div className="pb-4 border-b border-slate-100">
				<h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
					Consistency &amp; Weekly Activity
				</h2>
				<p className="text-xs text-slate-500 font-normal">
					Focus on sustainable weekly volume. Mon to Sun routines adapt to
					meetings, rest, and deep work.
				</p>
			</div>

			{/* Weekly Metrics Matrix (Trailing 7 Days) */}
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

			{/* Mon to Sun Monthly Day Accumulation Section */}
			<div className="space-y-4 pt-2">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div>
						<h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider">
							Weekly Accumulation by Day (Mon – Sun)
						</h3>
						<p className="text-xs text-slate-500 font-normal">
							Habit volume accumulated into days of the week across the last 2
							months and current month.
						</p>
					</div>

					{/* View Mode Switcher */}
					<div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/70 self-start sm:self-auto">
						<button
							type="button"
							onClick={() => setViewMode("cards")}
							className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
								viewMode === "cards"
									? "bg-white text-slate-900 shadow-2xs border border-slate-200/60"
									: "text-slate-500 hover:text-slate-900"
							}`}
						>
							<Columns3 className="w-3.5 h-3.5" />
							<span>Monthly Cards</span>
						</button>
						<button
							type="button"
							onClick={() => setViewMode("matrix")}
							className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
								viewMode === "matrix"
									? "bg-white text-slate-900 shadow-2xs border border-slate-200/60"
									: "text-slate-500 hover:text-slate-900"
							}`}
						>
							<TableProperties className="w-3.5 h-3.5" />
							<span>Comparison Matrix</span>
						</button>
					</div>
				</div>

				{/* MODE 1: Responsive 3-Month Cards (Side-by-side on desktop, stacked on mobile) */}
				{viewMode === "cards" && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-4.5">
						{monthlyData.map((month) => (
							<div
								key={month.monthLabel}
								className={`rounded-3xl p-4 sm:p-5 border transition-all ${
									month.isCurrentMonth
										? "bg-white border-emerald-300/80 shadow-xs"
										: "bg-slate-50/70 border-slate-200/80"
								}`}
							>
								{/* Card Header */}
								<div className="flex items-center justify-between pb-3.5 border-b border-slate-200/70">
									<div>
										<div className="flex items-center gap-1.5">
											<span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
												{month.monthLabel}
											</span>
											{month.isCurrentMonth && (
												<span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-200">
													Current
												</span>
											)}
										</div>
										<span className="text-[11px] text-slate-500 font-medium">
											{month.totalTargetMetDays} days reached target
										</span>
									</div>

									{/* Total Breaks Pill */}
									<div className="text-right">
										<span className="text-lg font-black font-mono text-slate-900">
											{month.totalSessions}
										</span>
										<span className="block text-[10px] text-slate-400 uppercase font-semibold">
											Breaks
										</span>
									</div>
								</div>

								{/* Mon to Sun Day List */}
								<div className="space-y-2 pt-3">
									{month.days.map((day) => {
										const pctOfTarget = Math.min(
											100,
											Math.round((day.averagePerDay / targetPerDay) * 100),
										);

										let barColor = "bg-slate-200";
										let badgeBg = "bg-slate-100 text-slate-500";

										if (day.averagePerDay >= targetPerDay) {
											barColor = "bg-emerald-600";
											badgeBg = "bg-emerald-100 text-emerald-900 font-bold";
										} else if (day.averagePerDay >= 4) {
											barColor = "bg-emerald-400";
											badgeBg = "bg-emerald-50 text-emerald-800 font-semibold";
										} else if (day.averagePerDay >= 1) {
											barColor = "bg-emerald-200";
											badgeBg = "bg-emerald-50 text-emerald-700";
										}

										return (
											<div
												key={day.dayName}
												className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200/70 hover:border-slate-300 transition-colors space-y-1.5"
											>
												<div className="flex items-center justify-between text-xs">
													<div className="flex items-center gap-2">
														<span className="w-8 font-black text-slate-900 text-xs">
															{day.dayName}
														</span>
														<span className="text-[11px] text-slate-400">
															{day.occurrencesCount} {day.dayFullName}s
														</span>
													</div>

													<div className="flex items-center gap-2">
														<span className="text-[11px] font-mono text-slate-500">
															avg {day.averagePerDay}/d
														</span>
														<span
															className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${badgeBg}`}
														>
															{day.totalSessions}
														</span>
													</div>
												</div>

												{/* Mini Progress Bar representing habit strength */}
												<div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
													<div
														className={`h-full rounded-full transition-all duration-300 ${barColor}`}
														style={{ width: `${pctOfTarget}%` }}
													/>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>
				)}

				{/* MODE 2: Unified Comparison Matrix (Mon to Sun rows, Month columns) */}
				{viewMode === "matrix" && (
					<div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
									<th className="py-3 px-4">Day</th>
									{monthlyData.map((m) => (
										<th key={m.monthLabel} className="py-3 px-4 text-center">
											{m.monthLabel}
											{m.isCurrentMonth && (
												<span className="ml-1 text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded">
													Current
												</span>
											)}
										</th>
									))}
									<th className="py-3 px-4 text-center text-slate-700">
										3-Mo Average
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 text-xs">
								{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
									(dayName, idx) => (
										<tr
											key={dayName}
											className="hover:bg-slate-50/60 transition-colors"
										>
											<td className="py-3 px-4 font-black text-slate-900 font-mono">
												{dayName}
											</td>

											{monthlyData.map((m) => {
												const d = m.days[idx];
												const isHit = d.averagePerDay >= targetPerDay;
												return (
													<td
														key={m.monthLabel}
														className="py-3 px-4 text-center font-mono"
													>
														<div className="flex flex-col items-center justify-center">
															<span
																className={`text-sm font-bold ${
																	isHit
																		? "text-emerald-700"
																		: d.totalSessions > 0
																			? "text-slate-800"
																			: "text-slate-400"
																}`}
															>
																{d.totalSessions} breaks
															</span>
															<span className="text-[10px] text-slate-400">
																avg {d.averagePerDay}/d
															</span>
														</div>
													</td>
												);
											})}

											<td className="py-3 px-4 text-center font-mono">
												<span className="font-bold text-slate-900">
													avg {combinedDayStats[idx].avg} / {dayName}
												</span>
											</td>
										</tr>
									),
								)}

								{/* Summary Row */}
								<tr className="bg-slate-50/70 font-bold border-t-2 border-slate-200">
									<td className="py-3.5 px-4 font-black uppercase text-slate-700">
										Monthly Total
									</td>
									{monthlyData.map((m) => (
										<td
											key={m.monthLabel}
											className="py-3.5 px-4 text-center font-mono text-sm font-black text-slate-900"
										>
											{m.totalSessions} breaks
										</td>
									))}
									<td className="py-3.5 px-4 text-center font-mono text-slate-500 text-xs">
										3-Month Window
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				)}

				<p className="text-[11px] text-slate-500 text-center pt-1">
					Accumulated into days of the week (Mon to Sun) without specific date
					clutter. Records older than 3 months are pruned automatically from
					Redis.
				</p>
			</div>
		</div>
	);
}
