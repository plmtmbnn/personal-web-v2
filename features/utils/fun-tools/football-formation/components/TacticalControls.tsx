"use client";

import { useState, useEffect } from "react";
import {
	Download,
	Copy,
	Share2,
	Check,
	Sliders,
	Layers,
	Palette,
	Plus,
	Trash2,
} from "lucide-react";
import type { FormationDefinition, PitchTheme, TeamTactics } from "../types";
import { PITCH_THEMES } from "../constants";

interface TacticalControlsProps {
	tactics: TeamTactics;
	formations: Record<string, FormationDefinition>;
	onUpdateTactics: (updates: Partial<TeamTactics>) => void;
	onOpenCustomModal: () => void;
	onDeleteCustomFormation?: (id: string) => void;
	onDownload: () => Promise<void>;
	onCopy: () => Promise<boolean>;
	onShare: () => Promise<void>;
	isExporting?: boolean;
}

export default function TacticalControls({
	tactics,
	formations,
	onUpdateTactics,
	onOpenCustomModal,
	onDeleteCustomFormation,
	onDownload,
	onCopy,
	onShare,
	isExporting = false,
}: TacticalControlsProps) {
	const [hasCopied, setHasCopied] = useState(false);
	const [canShare, setCanShare] = useState(false);

	useEffect(() => {
		if (typeof navigator !== "undefined" && "share" in navigator) {
			setCanShare(true);
		}
	}, []);

	const handleCopyClick = async () => {
		const success = await onCopy();
		if (success) {
			setHasCopied(true);
			setTimeout(() => setHasCopied(false), 2000);
		}
	};

	const currentFormation = formations[tactics.formation];

	return (
		<div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-6">
			{/* Team Identity Configuration */}
			<div className="space-y-3">
				<div className="flex items-center gap-2 pb-2 border-b border-slate-100">
					<Sliders className="w-4 h-4 text-indigo-600" />
					<h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
						Tactical Setup & Identity
					</h3>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label
							htmlFor="tactics-team-name"
							className="block text-xs font-bold text-slate-700 mb-1"
						>
							Team / Squad Name
						</label>
						<input
							id="tactics-team-name"
							type="text"
							value={tactics.teamName}
							onChange={(e) => onUpdateTactics({ teamName: e.target.value })}
							placeholder="e.g. Anfield Masters XI"
							className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
						/>
					</div>

					<div>
						<label
							htmlFor="tactics-manager-name"
							className="block text-xs font-bold text-slate-700 mb-1"
						>
							Head Coach / Manager
						</label>
						<input
							id="tactics-manager-name"
							type="text"
							value={tactics.manager}
							onChange={(e) => onUpdateTactics({ manager: e.target.value })}
							placeholder="e.g. Polma Tambunan"
							className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
						/>
					</div>
				</div>
			</div>

			{/* Formation Presets Selector */}
			<div className="space-y-3">
				<div className="flex items-center justify-between pb-2 border-b border-slate-100">
					<div className="flex items-center gap-2">
						<Layers className="w-4 h-4 text-indigo-600" />
						<h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
							Formation Preset
						</h3>
					</div>
					<div className="flex items-center gap-2">
						{currentFormation && (
							<span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/70">
								{currentFormation.category}
							</span>
						)}
						<button
							type="button"
							onClick={onOpenCustomModal}
							className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-2xs active:scale-95"
						>
							<Plus className="w-3 h-3" />
							<span>Custom</span>
						</button>
					</div>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
					{Object.keys(formations).map((fKey) => {
						const f = formations[fKey];
						if (!f) return null;
						const isActive = tactics.formation === fKey;
						const isCustom = f.isCustom;

						return (
							<div
								key={fKey}
								className={`relative group rounded-xl border text-left transition-all ${
									isActive
										? "bg-slate-900 text-white border-slate-900 shadow-xs"
										: "bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-slate-200/80"
								}`}
							>
								<button
									type="button"
									onClick={() => onUpdateTactics({ formation: fKey })}
									className="w-full p-2.5 text-left cursor-pointer active:scale-98"
								>
									<div className="flex items-center justify-between gap-1">
										<span className="text-xs font-black tracking-tight truncate">
											{fKey}
										</span>
										{isCustom ? (
											<span
												className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${
													isActive
														? "bg-indigo-500 text-white"
														: "bg-indigo-100 text-indigo-700"
												}`}
											>
												Custom
											</span>
										) : (
											<span
												className={`text-[9px] font-semibold px-1 rounded ${
													isActive
														? "bg-slate-800 text-slate-300"
														: "text-slate-400"
												}`}
											>
												{f.category[0]}
											</span>
										)}
									</div>
									<p
										className={`text-[10px] mt-0.5 truncate font-medium ${
											isActive ? "text-slate-300" : "text-slate-500"
										}`}
									>
										{f.name.replace(`${fKey} `, "")}
									</p>
								</button>

								{/* Delete Button for Custom Formation */}
								{isCustom && onDeleteCustomFormation && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											onDeleteCustomFormation(fKey);
										}}
										className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-rose-500 text-white hover:bg-rose-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
										title="Delete custom formation"
										aria-label={`Delete custom formation ${fKey}`}
									>
										<Trash2 className="w-2.5 h-2.5" />
									</button>
								)}
							</div>
						);
					})}

					{/* Add Custom Formation Tile */}
					<button
						type="button"
						onClick={onOpenCustomModal}
						className="p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-500 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
					>
						<Plus className="w-4 h-4 text-indigo-600" />
						<span className="text-[10px] font-bold text-slate-700">
							+ Create Custom
						</span>
					</button>
				</div>
			</div>

			{/* Pitch Style / Visual Theme */}
			<div className="space-y-3">
				<div className="flex items-center gap-2 pb-2 border-b border-slate-100">
					<Palette className="w-4 h-4 text-indigo-600" />
					<h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
						Pitch Theme & Surface
					</h3>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
					{(Object.keys(PITCH_THEMES) as PitchTheme[]).map((tKey) => {
						const t = PITCH_THEMES[tKey];
						const isActive = tactics.theme === tKey;
						return (
							<button
								key={tKey}
								type="button"
								onClick={() => onUpdateTactics({ theme: tKey })}
								className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all active:scale-95 ${
									isActive
										? "bg-indigo-50 border-indigo-400 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs"
										: "bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700"
								}`}
							>
								<div className="flex items-center justify-center gap-1.5 mb-1">
									<span
										className={`w-3.5 h-3.5 rounded-full border ${
											tKey === "classic-emerald"
												? "bg-emerald-600 border-emerald-700"
												: tKey === "night-floodlight"
													? "bg-slate-900 border-slate-800"
													: tKey === "tactical-slate"
														? "bg-sky-900 border-sky-800"
														: "bg-stone-800 border-stone-700"
										}`}
									/>
									<span className="text-xs font-bold">{t.name}</span>
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{/* High-Resolution Exporters & Sharing */}
			<div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
				<div className="text-xs text-slate-500 font-medium">
					Export as High-Resolution Matchday Card
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={handleCopyClick}
						disabled={isExporting}
						className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
					>
						{hasCopied ? (
							<>
								<Check className="w-3.5 h-3.5 text-emerald-600" />
								<span>Copied!</span>
							</>
						) : (
							<>
								<Copy className="w-3.5 h-3.5 text-slate-600" />
								<span>Copy Image</span>
							</>
						)}
					</button>

					{canShare && (
						<button
							type="button"
							onClick={onShare}
							disabled={isExporting}
							className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
						>
							<Share2 className="w-3.5 h-3.5 text-slate-600" />
							<span>Share</span>
						</button>
					)}

					<button
						type="button"
						onClick={onDownload}
						disabled={isExporting}
						className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-xs disabled:opacity-50"
					>
						<Download className="w-3.5 h-3.5" />
						<span>Download PNG</span>
					</button>
				</div>
			</div>
		</div>
	);
}
