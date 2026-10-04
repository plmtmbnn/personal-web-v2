"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	X,
	Plus,
	Minus,
	CheckCircle2,
	AlertCircle,
	Sliders,
} from "lucide-react";
import type { FormationDefinition } from "../types";
import {
	parseFormationString,
	validateFormationLines,
	buildCustomFormation,
} from "../utils/formation-builder";

interface CustomFormationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSaveFormation: (formation: FormationDefinition) => void;
}

const POPULAR_CUSTOM_PRESETS = [
	{ notation: "4-2-4", name: "4-2-4 Brazil Quad", cat: "Attacking" as const },
	{ notation: "3-4-2-1", name: "3-4-2-1 Dual Tens", cat: "Attacking" as const },
	{
		notation: "4-1-4-1",
		name: "4-1-4-1 Single Pivot",
		cat: "Balanced" as const,
	},
	{
		notation: "4-2-2-2",
		name: "4-2-2-2 Box Midfield",
		cat: "Attacking" as const,
	},
	{ notation: "5-4-1", name: "5-4-1 Iron Wall", cat: "Defensive" as const },
	{
		notation: "3-3-3-1",
		name: "3-3-3-1 Bielsa Press",
		cat: "Attacking" as const,
	},
];

export default function CustomFormationModal({
	isOpen,
	onClose,
	onSaveFormation,
}: CustomFormationModalProps) {
	const reduceMotion = useReducedMotion();
	const [notationInput, setNotationInput] = useState("4-2-4");
	const [lines, setLines] = useState<number[]>([4, 2, 4]);
	const [name, setName] = useState("4-2-4 Custom");
	const [category, setCategory] = useState<
		"Attacking" | "Balanced" | "Defensive"
	>("Attacking");

	// Sync notation string to lines
	const handleNotationChange = (val: string) => {
		setNotationInput(val);
		const parsed = parseFormationString(val);
		if (parsed.length >= 2 && parsed.length <= 5) {
			setLines(parsed);
		}
	};

	// Quick Preset selection
	const handleSelectPreset = (preset: (typeof POPULAR_CUSTOM_PRESETS)[0]) => {
		setNotationInput(preset.notation);
		const parsed = parseFormationString(preset.notation);
		setLines(parsed);
		setName(preset.name);
		setCategory(preset.cat);
	};

	// Stepper adjustments for a line
	const handleAdjustLine = (index: number, delta: number) => {
		const next = [...lines];
		const current = next[index] ?? 1;
		const updated = Math.max(1, Math.min(6, current + delta));
		next[index] = updated;
		setLines(next);
		setNotationInput(next.join("-"));
	};

	const handleAddLine = () => {
		if (lines.length >= 5) return;
		const next = [...lines, 1];
		setLines(next);
		setNotationInput(next.join("-"));
	};

	const handleRemoveLine = (index: number) => {
		if (lines.length <= 2) return;
		const next = lines.filter((_, i) => i !== index);
		setLines(next);
		setNotationInput(next.join("-"));
	};

	// Validation
	const validation = useMemo(() => {
		return validateFormationLines(lines);
	}, [lines]);

	// Live preview preview definition
	const previewFormation = useMemo(() => {
		if (!validation.isValid) return null;
		try {
			return buildCustomFormation(name, lines, category);
		} catch {
			return null;
		}
	}, [validation.isValid, name, lines, category]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validation.isValid || !previewFormation) return;

		onSaveFormation(previewFormation);
		onClose();
	};

	// Body scroll lock
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

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
				{/* Backdrop */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
				/>

				{/* Modal Container */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 16 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 16 }}
					transition={{ type: "spring", damping: 25, stiffness: 300 }}
					className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden z-10 my-auto"
				>
					{/* Modal Header */}
					<div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm shadow-2xs">
								<Sliders className="w-5 h-5" />
							</div>
							<div>
								<h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
									Custom Formation Builder
								</h3>
								<p className="text-xs text-slate-500 font-medium">
									Create custom tactical setups with min and max 10 outfielders
								</p>
							</div>
						</div>

						<button
							type="button"
							onClick={onClose}
							className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
							aria-label="Close dialog"
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					<form
						onSubmit={handleSubmit}
						className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-5"
					>
						{/* Quick Preset Inspiration Chips */}
						<div className="space-y-1.5">
							<span className="text-xs font-bold text-slate-700 block">
								Tactical Ideas & Suggestions
							</span>
							<div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
								{POPULAR_CUSTOM_PRESETS.map((p) => (
									<button
										key={p.notation}
										type="button"
										onClick={() => handleSelectPreset(p)}
										className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
											notationInput === p.notation
												? "bg-slate-900 text-white shadow-xs"
												: "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
										}`}
									>
										{p.notation}
									</button>
								))}
							</div>
						</div>

						{/* Formation Notation Input */}
						<div>
							<label
								htmlFor="custom-formation-notation"
								className="block text-xs font-bold text-slate-700 mb-1"
							>
								Formation Notation (Outfield Lines)
							</label>
							<input
								id="custom-formation-notation"
								type="text"
								value={notationInput}
								onChange={(e) => handleNotationChange(e.target.value)}
								placeholder="e.g. 4-2-3-1 or 3-4-2-1"
								className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-sm font-black font-mono tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
							/>
							<p className="text-[11px] text-slate-400 mt-1">
								Type numbers separated by hyphens (e.g. 4-3-3, 4-2-4, 3-4-2-1)
							</p>
						</div>

						{/* ── Strict Min & Max 10 Validation Status Badge ── */}
						<div
							className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
								validation.isValid
									? "bg-emerald-50/80 border-emerald-200/80 text-emerald-900"
									: validation.sum < 10
										? "bg-amber-50/80 border-amber-200/80 text-amber-900"
										: "bg-rose-50/80 border-rose-200/80 text-rose-900"
							}`}
						>
							<div className="flex items-center gap-2.5 min-w-0">
								{validation.isValid ? (
									<CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
								) : (
									<AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
								)}
								<div className="min-w-0">
									<p className="text-xs font-black tracking-tight">
										{validation.isValid
											? "Valid Formation: Exactly 10 Outfield Players"
											: "Outfield Validation (Min & Max: 10 Players)"}
									</p>
									<p className="text-[11px] font-medium opacity-90 leading-tight">
										{validation.isValid
											? "10 Outfielders + 1 Goalkeeper = 11 Total Players."
											: validation.error}
									</p>
								</div>
							</div>

							<div className="text-right shrink-0">
								<span
									className={`px-2 py-0.5 rounded-lg text-xs font-black tabular-nums ${
										validation.isValid
											? "bg-emerald-600 text-white"
											: "bg-white text-slate-900 border border-current shadow-2xs"
									}`}
								>
									{validation.sum} / 10
								</span>
							</div>
						</div>

						{/* Interactive Outfield Lines Steppers */}
						<div className="space-y-2 pt-1">
							<div className="flex items-center justify-between">
								<span className="text-xs font-bold text-slate-700">
									Configure Lines by Position
								</span>
								{lines.length < 5 && (
									<button
										type="button"
										onClick={handleAddLine}
										className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
									>
										<Plus className="w-3.5 h-3.5" />
										Add Line
									</button>
								)}
							</div>

							<div className="space-y-2">
								{lines.map((count, idx) => {
									const isDefense = idx === 0;
									const isAttack = idx === lines.length - 1;
									const roleName = isDefense
										? "Defenders (Back)"
										: isAttack
											? "Attackers (Front)"
											: `Midfielders (Line ${idx + 1})`;

									return (
										<div
											key={`line-${idx}`}
											className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70"
										>
											<div className="flex items-center gap-2">
												<span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center">
													{idx + 1}
												</span>
												<span className="text-xs font-bold text-slate-800">
													{roleName}
												</span>
											</div>

											<div className="flex items-center gap-2">
												<button
													type="button"
													onClick={() => handleAdjustLine(idx, -1)}
													disabled={count <= 1}
													className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95 disabled:opacity-40"
													aria-label="Decrease player count"
												>
													<Minus className="w-3.5 h-3.5" />
												</button>

												<span className="w-6 text-center text-xs font-black text-slate-900 tabular-nums">
													{count}
												</span>

												<button
													type="button"
													onClick={() => handleAdjustLine(idx, 1)}
													disabled={count >= 6}
													className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95 disabled:opacity-40"
													aria-label="Increase player count"
												>
													<Plus className="w-3.5 h-3.5" />
												</button>

												{lines.length > 2 && (
													<button
														type="button"
														onClick={() => handleRemoveLine(idx)}
														className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
														aria-label="Remove line"
													>
														<X className="w-3.5 h-3.5" />
													</button>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Pitch Mini Preview (Visual Layout Verification) */}
						{previewFormation && (
							<div className="space-y-1.5">
								<span className="text-xs font-bold text-slate-700 block">
									Pitch Layout Preview
								</span>
								<div className="relative w-full h-44 rounded-2xl bg-emerald-950 border border-emerald-800 overflow-hidden shadow-inner">
									{/* Field outlines */}
									<div className="absolute inset-2 border border-white/20 rounded-xl pointer-events-none" />
									<div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 border-t border-white/20 pointer-events-none" />

									{/* Render Preview Dots */}
									{previewFormation.slots.map((s) => (
										<div
											key={s.id}
											className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
											style={{ left: `${s.x}%`, top: `${s.y}%` }}
										>
											<div
												className={`w-4 h-4 rounded-full border border-white flex items-center justify-center text-[7px] font-black text-white shadow-xs ${
													s.role === "GK"
														? "bg-amber-500"
														: s.role === "DF"
															? "bg-blue-500"
															: s.role === "MF"
																? "bg-emerald-500"
																: "bg-rose-500"
												}`}
											>
												{s.label[0]}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Formation Metadata Inputs */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
							<div>
								<label
									htmlFor="custom-formation-name"
									className="block text-xs font-bold text-slate-700 mb-1"
								>
									Formation Name
								</label>
								<input
									id="custom-formation-name"
									type="text"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="e.g. 4-2-4 Brazil Quad"
									className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
								/>
							</div>

							<div>
								<label
									htmlFor="custom-formation-category"
									className="block text-xs font-bold text-slate-700 mb-1"
								>
									Tactical Style
								</label>
								<select
									id="custom-formation-category"
									value={category}
									onChange={(e) =>
										setCategory(
											e.target.value as "Attacking" | "Balanced" | "Defensive",
										)
									}
									className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
								>
									<option value="Attacking">Attacking</option>
									<option value="Balanced">Balanced</option>
									<option value="Defensive">Defensive</option>
								</select>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="pt-2 flex items-center justify-end gap-2">
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-xs font-bold cursor-pointer transition-colors"
							>
								Cancel
							</button>

							<button
								type="submit"
								disabled={!validation.isValid}
								className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:pointer-events-none active:scale-95"
							>
								Save & Apply Formation
							</button>
						</div>
					</form>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
