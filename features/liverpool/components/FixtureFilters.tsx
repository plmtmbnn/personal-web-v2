"use client";

import { Search, X } from "lucide-react";
import type { VenueFilter } from "../types";

interface FixtureFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	selectedCompetition: string;
	onCompetitionChange: (comp: string) => void;
	competitions: string[];
	venue: VenueFilter;
	onVenueChange: (venue: VenueFilter) => void;
	selectedMonth: string;
	onMonthChange: (month: string) => void;
	months: { key: string; label: string; count: number }[];
	totalCount: number;
}

export default function FixtureFilters({
	search,
	onSearchChange,
	selectedCompetition,
	onCompetitionChange,
	competitions,
	venue,
	onVenueChange,
	selectedMonth,
	onMonthChange,
	months,
	totalCount,
}: FixtureFiltersProps) {
	const hasActiveFilters =
		Boolean(search) ||
		selectedCompetition !== "all" ||
		venue !== "all" ||
		selectedMonth !== "all";

	const resetFilters = () => {
		onSearchChange("");
		onCompetitionChange("all");
		onVenueChange("all");
		onMonthChange("all");
	};

	return (
		<div className="space-y-4">
			{/* Search & Venue Control Bar */}
			<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
				{/* Search Input */}
				<div className="relative flex-1">
					<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
					<input
						type="text"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="Search opponent or stadium (e.g. Real Madrid, Anfield)..."
						className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-sm"
					/>
					{search && (
						<button
							onClick={() => onSearchChange("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
						>
							<X className="w-3.5 h-3.5" />
						</button>
					)}
				</div>

				{/* Venue Filter Pills */}
				<div className="flex items-center rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/60 dark:border-slate-700/60 self-start md:self-auto shrink-0">
					<button
						onClick={() => onVenueChange("all")}
						className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
							venue === "all"
								? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
								: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
						}`}
					>
						All Venues
					</button>
					<button
						onClick={() => onVenueChange("home")}
						className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
							venue === "home"
								? "bg-red-600 text-white shadow-sm"
								: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
						}`}
					>
						Anfield Only
					</button>
					<button
						onClick={() => onVenueChange("away")}
						className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
							venue === "away"
								? "bg-slate-900 dark:bg-slate-700 text-white shadow-sm"
								: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
						}`}
					>
						Away Only
					</button>
				</div>
			</div>

			{/* Competition Tabs Filter */}
			<div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
				<button
					onClick={() => onCompetitionChange("all")}
					className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
						selectedCompetition === "all"
							? "bg-red-600 text-white shadow-md shadow-red-600/20"
							: "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400"
					}`}
				>
					All Competitions ({totalCount})
				</button>
				{competitions.map((comp) => (
					<button
						key={comp}
						onClick={() => onCompetitionChange(comp)}
						className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
							selectedCompetition === comp
								? "bg-red-600 text-white shadow-md shadow-red-600/20"
								: "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400"
						}`}
					>
						{comp}
					</button>
				))}
			</div>

			{/* Month Filter Bar (if multiple months exist) */}
			{months.length > 1 && (
				<div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100 dark:border-slate-800/60">
					<span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
						Month:
					</span>
					<button
						onClick={() => onMonthChange("all")}
						className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
							selectedMonth === "all"
								? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
								: "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
						}`}
					>
						All
					</button>
					{months.map((m) => (
						<button
							key={m.key}
							onClick={() => onMonthChange(m.key)}
							className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
								selectedMonth === m.key
									? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
									: "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
							}`}
						>
							<span>{m.label}</span>
							<span className="opacity-60 text-[9px]">({m.count})</span>
						</button>
					))}

					{hasActiveFilters && (
						<button
							onClick={resetFilters}
							className="ml-auto text-[11px] font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline shrink-0 cursor-pointer"
						>
							Reset Filters
						</button>
					)}
				</div>
			)}
		</div>
	);
}
