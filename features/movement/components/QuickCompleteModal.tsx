"use client";

import { useState, useEffect } from "react";
import { X, Check, Plus } from "lucide-react";
import type { Movement } from "../types";
import { playChimeSound } from "../lib/sound";

interface QuickCompleteModalProps {
	isOpen: boolean;
	movements: Movement[];
	soundEnabled: boolean;
	initialMovementId?: string;
	onClose: () => void;
	onRecordSession: (
		movementId: string,
		reps?: number,
		durationSeconds?: number,
	) => void;
}

export const WALKING_DURATION_PRESETS = [
	{ label: "5 Min Walk", seconds: 300 },
	{ label: "10 Min Walk", seconds: 600 },
	{ label: "15 Min Walk", seconds: 900 },
];

export default function QuickCompleteModal({
	isOpen,
	movements,
	soundEnabled,
	initialMovementId,
	onClose,
	onRecordSession,
}: QuickCompleteModalProps) {
	const [selectedId, setSelectedId] = useState<string>(
		initialMovementId || movements[0]?.id || "slow-squat",
	);
	const [reps, setReps] = useState<number>(10);
	const [customDurationMinutes, setCustomDurationMinutes] =
		useState<number>(10);

	useEffect(() => {
		if (isOpen) {
			const active = initialMovementId || movements[0]?.id || "slow-squat";
			setSelectedId(active);
			const m = movements.find((x) => x.id === active);
			if (m?.targetReps) setReps(m.targetReps);
			if (m?.targetSeconds)
				setCustomDurationMinutes(Math.round(m.targetSeconds / 60));
		}
	}, [isOpen, initialMovementId, movements]);

	if (!isOpen) return null;

	const selectedMovement =
		movements.find((m) => m.id === selectedId) || movements[0];

	const handleSelectMovement = (m: Movement) => {
		setSelectedId(m.id);
		if (m.targetReps) setReps(m.targetReps);
		if (m.targetSeconds)
			setCustomDurationMinutes(Math.round(m.targetSeconds / 60));
	};

	const handleSubmit = () => {
		if (soundEnabled) playChimeSound();

		if (selectedMovement.category === "walking") {
			onRecordSession(
				selectedMovement.id,
				undefined,
				customDurationMinutes * 60,
			);
		} else if (selectedMovement.targetReps) {
			onRecordSession(selectedMovement.id, reps, undefined);
		} else {
			onRecordSession(
				selectedMovement.id,
				undefined,
				selectedMovement.targetSeconds || 60,
			);
		}

		onClose();
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
		>
			<div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200/80 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
					<div className="flex items-center gap-2.5">
						<div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
							<Plus className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
								Log Movement Snack
							</h3>
							<p className="text-xs text-slate-500 font-normal">
								Quick 1-tap recording outside scheduled slots.
							</p>
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
				<div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
					{/* Movement Picker Grid */}
					<div className="space-y-2">
						<span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
							Select Movement
						</span>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							{movements.map((m) => {
								const isSelected = m.id === selectedId;
								return (
									<button
										key={m.id}
										type="button"
										onClick={() => handleSelectMovement(m)}
										className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
											isSelected
												? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20"
												: "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100"
										}`}
									>
										<div className="flex items-center justify-between gap-1 mb-1">
											<span className="font-bold text-xs text-slate-900 truncate">
												{m.name}
											</span>
											{isSelected && (
												<Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
											)}
										</div>
										<div className="flex items-center gap-2 text-[10px] text-slate-500">
											<span className="uppercase font-semibold">
												{m.category}
											</span>
											<span>•</span>
											<span>{m.estimatedDuration}</span>
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* Walking Presets if Walking selected */}
					{selectedMovement.category === "walking" ? (
						<div className="space-y-2 pt-2 border-t border-slate-100">
							<span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
								Walking Duration
							</span>
							<div className="grid grid-cols-3 gap-2">
								{WALKING_DURATION_PRESETS.map((p) => {
									const min = Math.round(p.seconds / 60);
									const isSelected = customDurationMinutes === min;
									return (
										<button
											key={p.seconds}
											type="button"
											onClick={() => setCustomDurationMinutes(min)}
											className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
												isSelected
													? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
													: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
											}`}
										>
											{p.label}
										</button>
									);
								})}
							</div>
						</div>
					) : selectedMovement.targetReps ? (
						/* Reps Selector */
						<div className="space-y-2 pt-2 border-t border-slate-100">
							<span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
								Repetitions Completed
							</span>
							<div className="flex items-center gap-3">
								<div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
									<button
										type="button"
										onClick={() => setReps((r) => Math.max(1, r - 2))}
										className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 font-bold hover:bg-slate-100 cursor-pointer text-slate-700"
									>
										-
									</button>
									<span className="w-16 text-center font-mono font-bold text-slate-900 text-sm">
										{reps}
									</span>
									<button
										type="button"
										onClick={() => setReps((r) => r + 2)}
										className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 font-bold hover:bg-slate-100 cursor-pointer text-slate-700"
									>
										+
									</button>
								</div>

								<span className="text-xs text-slate-500">
									Target: {selectedMovement.targetReps} reps
								</span>
							</div>
						</div>
					) : null}
				</div>

				{/* Footer */}
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
						onClick={handleSubmit}
						className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs active:scale-95 cursor-pointer"
					>
						<Check className="w-4 h-4" />
						<span>Record Now</span>
					</button>
				</div>
			</div>
		</div>
	);
}
