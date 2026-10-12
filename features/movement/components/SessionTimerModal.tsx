"use client";

import { useEffect } from "react";
import { X, Check, ExternalLink, Activity } from "lucide-react";
import type { Movement, ScheduledMovementSlot } from "../types";
import { playChimeSound } from "../lib/sound";

interface SessionTimerModalProps {
	isOpen: boolean;
	slot?: ScheduledMovementSlot;
	movement: Movement;
	soundEnabled: boolean;
	onClose: () => void;
	onComplete: (data: { reps?: number; durationSeconds?: number }) => void;
}

export default function SessionTimerModal({
	isOpen,
	slot,
	movement,
	soundEnabled,
	onClose,
	onComplete,
}: SessionTimerModalProps) {
	// Prevent body scroll while modal is active
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	const handleDone = () => {
		if (soundEnabled) playChimeSound();
		onComplete({
			reps: movement.targetReps,
			durationSeconds: movement.targetSeconds || 60,
		});
		onClose();
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
		>
			<div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200/80 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				{/* Modal Top Bar */}
				<div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
					<div className="flex items-center gap-2.5">
						<div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
							<Activity className="w-4 h-4" />
						</div>
						<div>
							<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
								{slot
									? `Slot ${slot.slotNumber} • ${slot.scheduledTime}`
									: "Movement Break"}
							</span>
							<h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
								{movement.name}
							</h3>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						aria-label="Close dialog"
						className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Body Content */}
				<div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
					{/* Target Reps / Duration Pill Strip */}
					<div className="flex flex-wrap items-center gap-2">
						<span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-mono text-xs font-bold">
							{movement.targetReps
								? `Target: ${movement.targetReps} reps`
								: `Target: ${Math.round((movement.targetSeconds || 60) / 60)} min`}
						</span>
						<span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
							{movement.primaryMuscles}
						</span>
						{movement.tempo && (
							<span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-semibold">
								Tempo: {movement.tempo}
							</span>
						)}
					</div>

					{/* Instructions */}
					<div className="space-y-1.5">
						<span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
							Proper Execution &amp; Form
						</span>
						<p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
							{movement.instructions}
						</p>
					</div>

					{/* Google Search Demonstration Reference */}
					<div className="pt-1 flex items-center justify-between text-xs text-slate-500">
						<span>Need a visual form check?</span>
						<a
							href={movement.referenceUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold"
						>
							<span>Search Video Demo</span>
							<ExternalLink className="w-3.5 h-3.5" />
						</a>
					</div>
				</div>

				{/* Modal Footer Actions */}
				<div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
					>
						Cancel
					</button>

					<button
						type="button"
						onClick={handleDone}
						className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs active:scale-95 cursor-pointer"
					>
						<Check className="w-4 h-4" />
						<span>Mark Completed</span>
					</button>
				</div>
			</div>
		</div>
	);
}
