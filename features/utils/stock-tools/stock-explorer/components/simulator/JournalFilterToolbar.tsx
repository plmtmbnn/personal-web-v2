"use client";

import { Search, RotateCcw, Download } from "lucide-react";
import type {
	ClosedTradesFilter,
	StockPickThesis,
	StockPickExitReason,
} from "../../types";

interface JournalFilterToolbarProps {
	filter: ClosedTradesFilter;
	onFilterChange: (next: ClosedTradesFilter) => void;
	onResetFilter: () => void;
	onExportJson: () => void;
	hasActiveFilters: boolean;
	totalResults: number;
}

const THESIS_OPTIONS: Array<{ value: StockPickThesis | "all"; label: string }> =
	[
		{ value: "all", label: "All Theses" },
		{ value: "Compass Core Tranche", label: "Compass Core Tranche" },
		{ value: "Foreign Flow Surge", label: "Foreign Flow Surge" },
		{ value: "Bandar Accumulation", label: "Bandar Accumulation" },
		{ value: "Value Accumulation", label: "Value Accumulation" },
		{ value: "Breakout Momentum", label: "Breakout Momentum" },
		{ value: "ARB Reversal", label: "ARB Reversal" },
		{ value: "High Volatile Scalp", label: "High Volatile Scalp" },
		{ value: "Near ARA Hunter", label: "Near ARA Hunter" },
		{ value: "Swing Speculation", label: "Swing Speculation" },
		{ value: "Custom", label: "Custom" },
	];

const EXIT_REASON_OPTIONS: Array<{
	value: StockPickExitReason | "all";
	label: string;
}> = [
	{ value: "all", label: "All Exit Reasons" },
	{ value: "target_hit", label: "Target Hit" },
	{ value: "trailing_stop", label: "Trailing Stop" },
	{ value: "manual_profit", label: "Discretionary Profit" },
	{ value: "stop_loss_hit", label: "Stop Loss Hit" },
	{ value: "thesis_invalidated", label: "Thesis Invalidated" },
	{ value: "manual_cut", label: "Discretionary Cut" },
];

export function JournalFilterToolbar({
	filter,
	onFilterChange,
	onResetFilter,
	onExportJson,
	hasActiveFilters,
	totalResults,
}: JournalFilterToolbarProps) {
	return (
		<div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
			<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
				{/* Search Bar */}
				<div className="relative flex-1">
					<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
					<input
						type="text"
						value={filter.search}
						onChange={(e) =>
							onFilterChange({ ...filter, search: e.target.value })
						}
						placeholder="Search closed ticker or company..."
						className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
					/>
				</div>

				{/* Outcome Quick Switcher */}
				<div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start md:self-auto">
					<button
						type="button"
						onClick={() => onFilterChange({ ...filter, outcome: "all" })}
						className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
							filter.outcome === "all"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						All ({totalResults})
					</button>
					<button
						type="button"
						onClick={() => onFilterChange({ ...filter, outcome: "win" })}
						className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
							filter.outcome === "win"
								? "bg-emerald-600 text-white shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						Wins
					</button>
					<button
						type="button"
						onClick={() => onFilterChange({ ...filter, outcome: "loss" })}
						className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
							filter.outcome === "loss"
								? "bg-rose-600 text-white shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						Losses
					</button>
				</div>

				{/* Export & Reset Actions */}
				<div className="flex items-center gap-2">
					{hasActiveFilters && (
						<button
							type="button"
							onClick={onResetFilter}
							className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
						>
							<RotateCcw className="w-3.5 h-3.5" />
							<span>Reset</span>
						</button>
					)}
					<button
						type="button"
						onClick={onExportJson}
						className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
					>
						<Download className="w-3.5 h-3.5" />
						<span>Export Ledger</span>
					</button>
				</div>
			</div>

			{/* Filter Dropdowns Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
				{/* Time Horizon */}
				<div>
					<label
						htmlFor="filter-horizon"
						className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
					>
						Time Horizon
					</label>
					<select
						id="filter-horizon"
						value={filter.horizon}
						onChange={(e) =>
							onFilterChange({
								...filter,
								horizon: e.target.value as ClosedTradesFilter["horizon"],
							})
						}
						className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
					>
						<option value="all">All-Time Horizon</option>
						<option value="30d">Last 30 Days</option>
						<option value="90d">Last 90 Days</option>
						<option value="ytd">Year-to-Date (YTD)</option>
					</select>
				</div>

				{/* Thesis Filter */}
				<div>
					<label
						htmlFor="filter-thesis"
						className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
					>
						Investment Thesis
					</label>
					<select
						id="filter-thesis"
						value={filter.thesis}
						onChange={(e) =>
							onFilterChange({
								...filter,
								thesis: e.target.value as ClosedTradesFilter["thesis"],
							})
						}
						className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
					>
						{THESIS_OPTIONS.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>

				{/* Exit Reason Filter */}
				<div>
					<label
						htmlFor="filter-exit-reason"
						className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
					>
						Exit Discipline Reason
					</label>
					<select
						id="filter-exit-reason"
						value={filter.exitReason}
						onChange={(e) =>
							onFilterChange({
								...filter,
								exitReason: e.target.value as ClosedTradesFilter["exitReason"],
							})
						}
						className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
					>
						{EXIT_REASON_OPTIONS.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
}
