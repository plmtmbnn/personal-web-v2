"use client";

import { useMemo } from "react";
import {
	Clock,
	CheckCircle2,
	BookOpen,
	SkipForward,
	ExternalLink,
	Plus,
	Check,
	Undo2,
} from "lucide-react";
import type {
	Movement,
	MovementRoutineConfig,
	MovementSession,
	ScheduledMovementSlot,
} from "../types";

interface TodayScheduleTimelineProps {
	config: MovementRoutineConfig;
	todaySessions: MovementSession[];
	allMovements: Movement[];
	onStartSession: (slot: ScheduledMovementSlot, movement: Movement) => void;
	onQuickCompleteSlot: (
		slot: ScheduledMovementSlot,
		movement: Movement,
	) => void;
	onUndoSession: (sessionId: string) => void;
	onToggleSkipSlot: (slot: ScheduledMovementSlot, movement: Movement) => void;
	onLogBonusBreak: () => void;
}

export default function TodayScheduleTimeline({
	config,
	todaySessions,
	allMovements,
	onStartSession,
	onQuickCompleteSlot,
	onUndoSession,
	onToggleSkipSlot,
	onLogBonusBreak,
}: TodayScheduleTimelineProps) {
	// Map sessions by slotId
	const sessionBySlotId = useMemo(() => {
		const map = new Map<string, MovementSession>();
		for (const session of todaySessions) {
			if (session.slotId) {
				map.set(session.slotId, session);
			}
		}
		return map;
	}, [todaySessions]);

	// Bonus sessions (logged without a scheduled slot)
	const bonusSessions = useMemo(() => {
		return todaySessions.filter((s) => !s.slotId && s.status === "completed");
	}, [todaySessions]);

	return (
		<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
			{/* Timeline Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
				<div>
					<h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
						Today's Schedule
					</h2>
					<p className="text-xs text-slate-500 font-normal">
						Flexible suggested intervals. Complete in any order, anytime during
						your workday.
					</p>
				</div>

				<button
					type="button"
					onClick={onLogBonusBreak}
					className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
				>
					<Plus className="w-3.5 h-3.5 text-emerald-600" />
					<span>Add Extra Break</span>
				</button>
			</div>

			{/* Timeline Items List */}
			<div className="space-y-3.5 relative">
				{config.slots.map((slot) => {
					const movement = allMovements.find((m) => m.id === slot.movementId);
					const session = sessionBySlotId.get(slot.id);
					const isCompleted = session?.status === "completed";
					const isSkipped = session?.status === "skipped";

					if (!movement) return null;

					return (
						<div
							key={slot.id}
							className={`group relative p-4 sm:p-5 rounded-2xl border transition-all ${
								isCompleted
									? "bg-emerald-50/40 border-emerald-200/80"
									: isSkipped
										? "bg-slate-50/60 border-slate-200/60 opacity-75"
										: "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
							}`}
						>
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
								{/* Left: Time + Exercise Details */}
								<div className="flex items-start sm:items-center gap-3.5 min-w-0">
									{/* Time Badge */}
									<div
										className={`px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold border shrink-0 flex items-center gap-1.5 ${
											isCompleted
												? "bg-emerald-100/70 border-emerald-300 text-emerald-800"
												: isSkipped
													? "bg-slate-100 border-slate-200 text-slate-600"
													: "bg-slate-50 border-slate-200/80 text-slate-700"
										}`}
									>
										<Clock className="w-3.5 h-3.5 text-slate-600" />
										<span>{slot.scheduledTime}</span>
									</div>

									{/* Exercise Name & Info */}
									<div className="min-w-0 space-y-1">
										<div className="flex flex-wrap items-center gap-2">
											<h3
												className={`text-sm sm:text-base font-bold truncate ${
													isCompleted
														? "text-emerald-950 line-through decoration-emerald-500/50"
														: isSkipped
															? "text-slate-500 line-through"
															: "text-slate-900"
												}`}
											>
												{movement.name}
											</h3>

											{/* Target Badge */}
											<span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
												{movement.targetReps
													? `${movement.targetReps} reps`
													: `${movement.targetSeconds || 60}s`}
											</span>

											{/* Category Badge */}
											<span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
												{movement.category}
											</span>
										</div>

										<p className="text-xs text-slate-500 line-clamp-1">
											{movement.primaryMuscles} • {movement.estimatedDuration}
										</p>
									</div>
								</div>

								{/* Right: Actions */}
								<div className="flex items-center gap-2 self-end sm:self-center shrink-0">
									{isCompleted ? (
										<div className="flex items-center gap-2">
											<span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold">
												<Check className="w-3.5 h-3.5" />
												<span>Done</span>
											</span>

											{session && (
												<button
													type="button"
													onClick={() => onUndoSession(session.id)}
													title="Undo completion"
													className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
												>
													<Undo2 className="w-3.5 h-3.5" />
													<span className="hidden sm:inline text-[11px]">
														Undo
													</span>
												</button>
											)}
										</div>
									) : isSkipped ? (
										<div className="flex items-center gap-2">
											<span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold">
												Skipped
											</span>
											<button
												type="button"
												onClick={() => onToggleSkipSlot(slot, movement)}
												className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
											>
												Unskip
											</button>
										</div>
									) : (
										<>
											{/* Guide */}
											<button
												type="button"
												onClick={() => onStartSession(slot, movement)}
												className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
											>
												<BookOpen className="w-3.5 h-3.5" />
												<span>Guide</span>
											</button>

											{/* 1-Click Fast Complete */}
											<button
												type="button"
												onClick={() => onQuickCompleteSlot(slot, movement)}
												title="Mark as completed immediately"
												className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-2xs cursor-pointer active:scale-95"
											>
												<Check className="w-3.5 h-3.5" />
												<span>Complete</span>
											</button>

											{/* Skip Action */}
											<button
												type="button"
												onClick={() => onToggleSkipSlot(slot, movement)}
												title="Skip this exercise for today"
												className="p-1.5 text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
											>
												<SkipForward className="w-3.5 h-3.5" />
											</button>
										</>
									)}

									{/* Google Form Linkout */}
									<a
										href={movement.referenceUrl}
										target="_blank"
										rel="noopener noreferrer"
										title="View demonstration on Google"
										className="p-1.5 text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
									>
										<ExternalLink className="w-3.5 h-3.5" />
									</a>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Extra / Bonus Sessions Recorded Today */}
			{bonusSessions.length > 0 && (
				<div className="pt-4 border-t border-slate-100 space-y-3">
					<div className="flex items-center gap-2">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-400">
							Additional Movement Breaks Logged
						</span>
						<span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
							+{bonusSessions.length}
						</span>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
						{bonusSessions.map((bonus) => {
							const m = allMovements.find((mv) => mv.id === bonus.movementId);
							return (
								<div
									key={bonus.id}
									className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3 text-xs"
								>
									<div className="flex items-center gap-2 min-w-0">
										<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
										<span className="font-bold text-slate-900 truncate">
											{m?.name || "Extra Movement"}
										</span>
										{bonus.reps && (
											<span className="text-slate-500">
												({bonus.reps} reps)
											</span>
										)}
										{bonus.durationSeconds && (
											<span className="text-slate-500">
												({Math.round(bonus.durationSeconds / 60)} min)
											</span>
										)}
									</div>

									<button
										type="button"
										onClick={() => onUndoSession(bonus.id)}
										className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 cursor-pointer"
									>
										Remove
									</button>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
