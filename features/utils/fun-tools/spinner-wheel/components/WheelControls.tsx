"use client";

import {
	List,
	Shuffle,
	ArrowUpDown,
	Trash2,
	Palette,
	History,
	Trophy,
	Utensils,
	HelpCircle,
	Users,
	Target,
	Hash,
	BookmarkCheck,
} from "lucide-react";
import type { ColorTheme, SpinResult, WheelPreset } from "../types";
import { COLOR_THEMES, PRESETS } from "../data/presets";

interface WheelControlsProps {
	rawText: string;
	onRawTextChange: (text: string) => void;
	itemCount: number;
	isSpinning: boolean;
	themeKey: ColorTheme;
	onSelectTheme: (theme: ColorTheme) => void;
	history: SpinResult[];
	onClearHistory: () => void;
	onApplyPreset: (items: string[]) => void;
	onShuffle: () => void;
	onSort: () => void;
	onClearEntries: () => void;
}

// Icon mapper for presets
function getPresetIcon(id: string) {
	switch (id) {
		case "team-lunch":
			return Utensils;
		case "yes-no":
			return HelpCircle;
		case "names":
			return Users;
		case "priorities":
			return Target;
		case "numbers":
			return Hash;
		default:
			return BookmarkCheck;
	}
}

export default function WheelControls({
	rawText,
	onRawTextChange,
	itemCount,
	isSpinning,
	themeKey,
	onSelectTheme,
	history,
	onClearHistory,
	onApplyPreset,
	onShuffle,
	onSort,
	onClearEntries,
}: WheelControlsProps) {
	return (
		<div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
			{/* Section 1: Entries Input */}
			<div className="space-y-3">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<List className="w-4 h-4 text-indigo-600" />
						<h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
							Wheel Entries
						</h3>
						<span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
							{itemCount}
						</span>
					</div>

					<div className="flex items-center gap-1.5">
						<button
							type="button"
							onClick={onShuffle}
							disabled={isSpinning || itemCount === 0}
							className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1 active:scale-95"
							title="Randomize entry order"
						>
							<Shuffle className="w-3 h-3 text-slate-500" />
							<span>Shuffle</span>
						</button>
						<button
							type="button"
							onClick={onSort}
							disabled={isSpinning || itemCount === 0}
							className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1 active:scale-95"
							title="Sort alphabetically A-Z"
						>
							<ArrowUpDown className="w-3 h-3 text-slate-500" />
							<span>Sort</span>
						</button>
						<button
							type="button"
							onClick={onClearEntries}
							disabled={isSpinning || itemCount === 0}
							className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200/80 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1 active:scale-95"
							title="Clear all entries"
						>
							<Trash2 className="w-3 h-3" />
							<span className="hidden sm:inline">Clear</span>
						</button>
					</div>
				</div>

				<textarea
					value={rawText}
					onChange={(e) => onRawTextChange(e.target.value)}
					disabled={isSpinning}
					placeholder="Enter one item per line (e.g. Pizza, Burger, Pasta)..."
					rows={6}
					className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none leading-relaxed"
				/>
				<p className="text-[10px] text-slate-400 font-medium">
					Type one option per line. Duplicates and long titles are supported.
				</p>
			</div>

			{/* Section 2: Quick Presets */}
			<div className="space-y-2.5 pt-2 border-t border-slate-100">
				<div className="flex items-center gap-2">
					<BookmarkCheck className="w-4 h-4 text-indigo-600" />
					<h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
						Curated Presets
					</h3>
				</div>

				<div className="flex flex-wrap gap-2">
					{PRESETS.map((p: WheelPreset) => {
						const IconComp = getPresetIcon(p.id);
						return (
							<button
								key={p.id}
								type="button"
								onClick={() => onApplyPreset(p.items)}
								disabled={isSpinning}
								className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/80 text-xs font-bold text-slate-700 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 touch-manipulation disabled:opacity-40"
							>
								<IconComp className="w-3.5 h-3.5 text-slate-500" />
								<span>{p.name}</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Section 3: Color Palette Selector */}
			<div className="space-y-2.5 pt-2 border-t border-slate-100">
				<div className="flex items-center gap-2">
					<Palette className="w-4 h-4 text-indigo-600" />
					<h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
						Palette Theme
					</h3>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
					{(Object.keys(COLOR_THEMES) as ColorTheme[]).map((tKey) => {
						const theme = COLOR_THEMES[tKey];
						const isActive = themeKey === tKey;

						return (
							<button
								key={tKey}
								type="button"
								onClick={() => onSelectTheme(tKey)}
								className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer touch-manipulation active:scale-95 flex flex-col justify-between ${
									isActive
										? "bg-slate-900 border-slate-900 text-white shadow-xs"
										: "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100"
								}`}
							>
								<div className="flex items-center gap-1 mb-2">
									{theme.colors.slice(0, 4).map((c, i) => (
										<span
											key={`dot-${c}-${i}`}
											className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
											style={{ background: c }}
										/>
									))}
								</div>
								<span
									className={`text-[11px] font-bold tracking-tight block truncate ${
										isActive ? "text-white" : "text-slate-800"
									}`}
								>
									{theme.name}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Section 4: Recent Winners History */}
			<div className="space-y-2.5 pt-2 border-t border-slate-100">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<History className="w-4 h-4 text-indigo-600" />
						<h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
							Recent Winners
						</h3>
						{history.length > 0 && (
							<span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
								{history.length}
							</span>
						)}
					</div>

					{history.length > 0 && (
						<button
							type="button"
							onClick={onClearHistory}
							className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
						>
							Clear
						</button>
					)}
				</div>

				{history.length === 0 ? (
					<p className="text-xs text-slate-400 font-medium italic py-1">
						No winners yet. Spin the wheel to decide!
					</p>
				) : (
					<div className="space-y-1.5 max-h-40 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
						{history.map((h) => (
							<div
								key={h.id}
								className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800"
							>
								<div className="flex items-center gap-2 min-w-0">
									<Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
									<span className="truncate">{h.item.text}</span>
								</div>
								<span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
									{h.timestamp.toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
