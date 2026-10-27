"use client";

import { useMemo } from "react";
import { Clock, Footprints, Flame, ArrowRight, Plus } from "lucide-react";
import type {
	Movement,
	MovementRoutineConfig,
	MovementSession,
	MovementSummaryStats,
} from "../types";

interface DailyProgressCardProps {
	stats: MovementSummaryStats;
	config: MovementRoutineConfig;
	todaySessions: MovementSession[];
	allMovements: Movement[];
	onQuickLogWalk: () => void;
	onQuickLogSession: () => void;
}

export default function DailyProgressCard({
	stats,
	config,
	todaySessions,
	allMovements,
	onQuickLogWalk,
	onQuickLogSession,
}: DailyProgressCardProps) {
	const completedCount = stats.totalCompletedToday;
	const targetCount = stats.targetToday;
	const remaining = Math.max(0, targetCount - completedCount);
	const percent = stats.percentToday;

	// Dynamic, pressure-free encouraging message
	const motivationalMessage = useMemo(() => {
		if (completedCount === 0) {
			return "Ready for your first break today. Keep it short, light, and easy.";
		}
		if (completedCount >= targetCount) {
			return "Daily target completed. Nice work. Keep moving naturally for the rest of the day.";
		}
		if (remaining === 1) {
			return "You're building a great habit. Just one more break to reach today's target.";
		}
		return `You're building a good habit. ${remaining} more breaks to reach today's target.`;
	}, [completedCount, targetCount, remaining]);

	// Today's walking break minutes
	const walkingMinutesToday = useMemo(() => {
		return todaySessions
			.filter(
				(s) => s.status === "completed" && s.movementId === "easy-walking",
			)
			.reduce((acc, s) => acc + Math.round((s.durationSeconds || 600) / 60), 0);
	}, [todaySessions]);

	// Find next scheduled upcoming slot today
	const nextScheduledSlot = useMemo(() => {
		const handledSlotIds = new Set(
			todaySessions
				.filter((s) => s.status === "completed" || s.status === "skipped")
				.map((s) => s.slotId),
		);

		const now = new Date();
		const currentHourMinutes = `${String(now.getHours()).padStart(2, "0")}:${String(
			now.getMinutes(),
		).padStart(2, "0")}`;

		// First try to find upcoming slot later today that is not completed or skipped
		const upcoming = config.slots
			.filter((s) => s.enabled && !handledSlotIds.has(s.id))
			.find((s) => s.scheduledTime >= currentHourMinutes);

		if (upcoming) {
			const m = allMovements.find((mv) => mv.id === upcoming.movementId);
			return { slot: upcoming, movement: m, isLater: true };
		}

		// Or the first unhandled slot if all planned times passed
		const pendingAny = config.slots
			.filter((s) => s.enabled && !handledSlotIds.has(s.id))
			.at(0);

		if (pendingAny) {
			const m = allMovements.find((mv) => mv.id === pendingAny.movementId);
			return { slot: pendingAny, movement: m, isLater: false };
		}

		return null;
	}, [config.slots, todaySessions, allMovements]);

	// Ring parameters for SVG circular progress
	const radius = 42;
	const strokeWidth = 8;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percent / 100) * circumference;

	return (
		<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
			{/* Top Progress Overview */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
				{/* Circular Progress & Numbers */}
				<div className="flex items-center gap-5 sm:gap-6">
					<div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
						<svg
							className="w-full h-full -rotate-90"
							viewBox="0 0 100 100"
							aria-hidden="true"
						>
							{/* Track */}
							<circle
								cx="50"
								cy="50"
								r={radius}
								className="stroke-slate-100"
								strokeWidth={strokeWidth}
								fill="transparent"
							/>
							{/* Progress Bar */}
							<circle
								cx="50"
								cy="50"
								r={radius}
								className="stroke-emerald-600 transition-all duration-700 ease-out"
								strokeWidth={strokeWidth}
								strokeDasharray={circumference}
								strokeDashoffset={strokeDashoffset}
								strokeLinecap="round"
								fill="transparent"
							/>
						</svg>

						{/* Center Metric Display */}
						<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
							<span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
								{percent}%
							</span>
							<span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
								Target
							</span>
						</div>
					</div>

					{/* Text Narrative and Rationale */}
					<div className="space-y-1.5 max-w-md">
						<div className="flex items-center gap-2">
							<span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
								{completedCount} / {targetCount}
							</span>
							<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Sessions
							</span>
						</div>

						<p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
							{motivationalMessage}
						</p>

						<div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600">
							<span className="flex items-center gap-1">
								<Flame className="w-3.5 h-3.5 text-amber-500" />
								{stats.currentStreakDays}d streak
							</span>
							<span className="text-slate-400">/</span>
							<span>Rest days respected</span>
						</div>
					</div>
				</div>

				{/* Quick Actions Tray */}
				<div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
					<button
						type="button"
						onClick={onQuickLogWalk}
						className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
					>
						<Footprints className="w-4 h-4 text-emerald-600" />
						<span>Log Walk</span>
					</button>

					<button
						type="button"
						onClick={onQuickLogSession}
						className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
					>
						<Plus className="w-4 h-4 text-emerald-600" />
						<span>Quick Snack</span>
					</button>
				</div>
			</div>

			{/* Sub-Telemetry Quick Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{/* Next Scheduled Break */}
				<div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 min-w-0">
						<div className="w-9 h-9 rounded-xl bg-white border border-slate-200/70 text-indigo-600 flex items-center justify-center shrink-0">
							<Clock className="w-4 h-4" />
						</div>
						<div className="min-w-0">
							<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
								Suggested Next
							</span>
							<p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
								{nextScheduledSlot ? (
									<>
										{nextScheduledSlot.slot.scheduledTime} —{" "}
										{nextScheduledSlot.movement?.name || "Movement Break"}
									</>
								) : (
									"All planned slots completed"
								)}
							</p>
						</div>
					</div>

					{nextScheduledSlot && (
						<span className="text-[11px] font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60 shrink-0">
							{nextScheduledSlot.slot.scheduledTime}
						</span>
					)}
				</div>

				{/* Walking Activity Today */}
				<div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 min-w-0">
						<div className="w-9 h-9 rounded-xl bg-white border border-slate-200/70 text-emerald-600 flex items-center justify-center shrink-0">
							<Footprints className="w-4 h-4" />
						</div>
						<div className="min-w-0">
							<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
								Post-Meal Walking
							</span>
							<p className="text-xs sm:text-sm font-bold text-slate-900">
								{walkingMinutesToday} min logged today
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={onQuickLogWalk}
						className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
					>
						<span>Add</span>
						<ArrowRight className="w-3 h-3" />
					</button>
				</div>
			</div>
		</div>
	);
}
