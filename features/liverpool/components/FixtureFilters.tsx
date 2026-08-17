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
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
					<input
						type="text"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="Search opponent or stadium (e.g. Newcastle, Anfield, Arsenal)..."
						className="w-full pl-11 pr-10 py-3 rounded-full bg-white border border-slate-200/80 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all shadow-xs"
					/>
					{search && (
						<button
							onClick={() => onSearchChange("")}
							className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
						>
							<X className="w-3.5 h-3.5" />
						</button>
					)}
				</div>

				{/* Venue Filter Pills */}
				<div className="flex items-center rounded-full bg-white p-1 border border-slate-200/80 shadow-xs self-start md:self-auto shrink-0 gap-1">
					<button
						onClick={() => onVenueChange("all")}
						className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
							venue === "all"
								? "bg-slate-900 text-white shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						All Venues
					</button>
					<button
						onClick={() => onVenueChange("home")}
						className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
							venue === "home"
								? "bg-red-600 text-white shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						Anfield Only
					</button>
					<button
						onClick={() => onVenueChange("away")}
						className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
							venue === "away"
								? "bg-slate-800 text-white shadow-xs"
								: "text-slate-600 hover:text-slate-900"
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
					className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
						selectedCompetition === "all"
							? "bg-red-600 text-white shadow-xs"
							: "bg-white border border-slate-200/80 text-slate-700 hover:border-slate-300 shadow-xs"
					}`}
				>
					All Competitions ({totalCount})
				</button>
				{competitions.map((comp) => (
					<button
						key={comp}
						onClick={() => onCompetitionChange(comp)}
						className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
							selectedCompetition === comp
								? "bg-red-600 text-white shadow-xs"
								: "bg-white border border-slate-200/80 text-slate-700 hover:border-slate-300 shadow-xs"
						}`}
					>
						{comp}
					</button>
				))}
			</div>

			{/* Month Filter Bar (if multiple months exist) */}
			{months.length > 1 && (
				<div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-slate-200/60">
					<span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
						Month:
					</span>
					<button
						onClick={() => onMonthChange("all")}
						className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
							selectedMonth === "all"
								? "bg-slate-900 text-white shadow-xs"
								: "bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 shadow-xs"
						}`}
					>
						All
					</button>
					{months.map((m) => (
						<button
							key={m.key}
							onClick={() => onMonthChange(m.key)}
							className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
								selectedMonth === m.key
									? "bg-slate-900 text-white shadow-xs"
									: "bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 shadow-xs"
							}`}
						>
							<span>{m.label}</span>
							<span className="opacity-60 text-[10px]">({m.count})</span>
						</button>
					))}

					{hasActiveFilters && (
						<button
							onClick={resetFilters}
							className="ml-auto text-xs font-bold text-red-600 hover:underline shrink-0 cursor-pointer"
						>
							Reset Filters
						</button>
					)}
				</div>
			)}
		</div>
	);
}
