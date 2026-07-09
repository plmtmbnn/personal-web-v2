"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Tag,
	Search,
	X,
	ChevronLeft,
	ChevronRight,
	Workflow,
} from "lucide-react";
import type { Task } from "@/features/tasks/types";
import { format, startOfWeek, endOfWeek, addDays, startOfDay } from "date-fns";
import {
	SEARCH_DEBOUNCE_MS,
	TASK_STATUS_CONFIG,
} from "@/features/tasks/constants";

interface TaskFiltersProps {
	tasks: Task[];
	paramPrefix: string; // e.g., "today" or "upcoming" or "completed"
	showRangeFilter?: boolean;
}

export default function TaskFilters({
	tasks,
	paramPrefix,
	showRangeFilter = false,
}: TaskFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Keys with prefix
	const KEY_PRIORITY = `${paramPrefix}_priority`;
	const KEY_CATEGORY = `${paramPrefix}_category`;
	const KEY_COMPLETED = `${paramPrefix}_completed`;
	const KEY_RANGE = `${paramPrefix}_range`;
	const KEY_SEARCH = `${paramPrefix}_search`;
	const KEY_WEEK_OFFSET = `${paramPrefix}_week_offset`;
	const KEY_STATUS = `${paramPrefix}_status`;

	const currentPriority = searchParams.get(KEY_PRIORITY) || "all";
	const currentCategory = searchParams.get(KEY_CATEGORY) || "all";
	const currentRange = searchParams.get(KEY_RANGE) || "week";
	const showCompleted = searchParams.get(KEY_COMPLETED) === "true";
	const currentSearch = searchParams.get(KEY_SEARCH) || "";
	const weekOffset = Number(searchParams.get(KEY_WEEK_OFFSET) || "0");
	const currentStatus = searchParams.get(KEY_STATUS) || "all";

	// Weekly date range calculation for Completed navigator
	const todayRef = startOfDay(new Date());
	const selectedWeekStart = addDays(
		startOfWeek(todayRef, { weekStartsOn: 1 }),
		weekOffset * 7,
	);
	const selectedWeekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 1 });

	// Local state for debounced search input
	const [searchValue, setSearchValue] = useState(currentSearch);

	// Sync local input with URL param changes (e.g. on reset or back navigation)
	useEffect(() => {
		setSearchValue(currentSearch);
	}, [currentSearch]);

	// Debounce search URL update to avoid rate-limiting routing changes on keypresses
	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			if (searchValue !== currentSearch) {
				const params = new URLSearchParams(searchParams.toString());
				if (!searchValue) {
					params.delete(KEY_SEARCH);
				} else {
					params.set(KEY_SEARCH, searchValue);
				}
				router.push(`?${params.toString()}`, { scroll: false });
			}
		}, SEARCH_DEBOUNCE_MS);

		return () => clearTimeout(delayDebounce);
	}, [searchValue, currentSearch, KEY_SEARCH, searchParams, router]);

	const setFilter = (key: string, value: string | null) => {
		const params = new URLSearchParams(searchParams.toString());
		if (
			!value ||
			value === "all" ||
			value === "false" ||
			(key === KEY_RANGE && value === "week") ||
			(key === KEY_WEEK_OFFSET && value === "0")
		) {
			params.delete(key);
		} else {
			params.set(key, value);
		}
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const priorities = [
		{ label: "All", value: "all" },
		{ label: "High", value: "HIGH" },
		{ label: "Medium", value: "MEDIUM" },
		{ label: "Low", value: "LOW" },
	];

	// Extract unique categories safely with default fallbacks
	const uniqueCategories = [
		"all",
		...new Set(
			(tasks || []).map((t) => t?.category).filter(Boolean) as string[],
		),
	];

	// Count calculators for badges
	const getPriorityCount = (priorityVal: string) => {
		const items = tasks || [];
		if (priorityVal === "all") return items.length;
		return items.filter((t) => t.priority === priorityVal).length;
	};

	const getCategoryCount = (catVal: string) => {
		const items = tasks || [];
		if (catVal === "all") return items.length;
		return items.filter((t) => t.category === catVal).length;
	};

	const hasActiveFilters =
		currentPriority !== "all" ||
		currentCategory !== "all" ||
		currentStatus !== "all" ||
		showCompleted ||
		(showRangeFilter &&
			(paramPrefix === "completed"
				? weekOffset !== 0
				: currentRange !== "week")) ||
		!!currentSearch;

	const statusOptions = [
		{ label: "All", value: "all" },
		...Object.entries(TASK_STATUS_CONFIG).map(([key, cfg]) => ({
			label: cfg.shortLabel,
			value: key,
			color: cfg.color,
		})),
	];

	const getStatusCount = (statusVal: string) => {
		const items = tasks || [];
		if (statusVal === "all") return items.length;
		return items.filter((t) => (t.status || "todo") === statusVal).length;
	};

	return (
		<div className="flex flex-col gap-4 py-2">
			{/* Primary Row: Range, Completed, Priority */}
			<div className="flex flex-wrap items-center gap-2">
				{/* Search Input */}
				<div className="relative flex items-center bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm focus-within:ring-4 focus-within:ring-slate-900/5 focus-within:border-slate-350 transition-all max-w-[180px] w-full">
					<Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 flex-shrink-0" />
					<input
						type="text"
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						placeholder="Search tasks..."
						className="bg-transparent border-none text-[10px] font-semibold text-slate-700 placeholder-slate-400 focus:outline-none w-full p-0"
					/>
					{searchValue && (
						<button
							type="button"
							onClick={() => setSearchValue("")}
							className="text-slate-400 hover:text-slate-600 ml-1.5 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
							aria-label="Clear search"
						>
							<X className="w-3 h-3" />
						</button>
					)}
				</div>

				{/* Range Toggle or Weekly Date Range Navigator */}
				{showRangeFilter &&
					(paramPrefix === "completed" ? (
						<div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm mr-1 select-none">
							<button
								type="button"
								onClick={() =>
									setFilter(KEY_WEEK_OFFSET, (weekOffset - 1).toString())
								}
								className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-655 transition-colors cursor-pointer"
								aria-label="Previous week"
							>
								<ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
							</button>
							<span className="text-[9px] font-black uppercase tracking-tight text-slate-700 px-1 min-w-[70px] text-center">
								{format(selectedWeekStart, "dd MMM")} -{" "}
								{format(selectedWeekEnd, "dd MMM")}
							</span>
							<button
								type="button"
								onClick={() =>
									setFilter(KEY_WEEK_OFFSET, (weekOffset + 1).toString())
								}
								disabled={weekOffset >= 0}
								className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-655 transition-colors cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent"
								aria-label="Next week"
							>
								<ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
							</button>
						</div>
					) : (
						<div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm mr-1">
							<button
								onClick={() => setFilter(KEY_RANGE, "week")}
								className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all cursor-pointer ${
									currentRange === "week"
										? "bg-slate-900 text-white shadow-sm"
										: "text-slate-400 hover:text-slate-600"
								}`}
							>
								Week
							</button>
							<button
								onClick={() => setFilter(KEY_RANGE, "month")}
								className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all cursor-pointer ${
									currentRange === "month"
										? "bg-slate-900 text-white shadow-sm"
										: "text-slate-400 hover:text-slate-600"
								}`}
							>
								Month
							</button>
						</div>
					))}
				{(showRangeFilter || currentSearch) && (
					<div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />
				)}

				{/* Priority Pills */}
				<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
					{priorities.map((p) => (
						<button
							key={p.value}
							onClick={() => setFilter(KEY_PRIORITY, p.value)}
							className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all border whitespace-nowrap cursor-pointer flex items-center ${
								currentPriority === p.value
									? "bg-slate-900 text-white border-slate-900 shadow-sm"
									: "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
							}`}
						>
							{p.label}
							<span
								className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
									currentPriority === p.value
										? "bg-white/20 text-white"
										: "bg-slate-100 text-slate-500"
								}`}
							>
								{getPriorityCount(p.value)}
							</span>
						</button>
					))}
				</div>

				{/* Clear Filters Button */}
				{hasActiveFilters && (
					<button
						onClick={() => {
							const params = new URLSearchParams(searchParams.toString());
							params.delete(KEY_PRIORITY);
							params.delete(KEY_CATEGORY);
							params.delete(KEY_COMPLETED);
							params.delete(KEY_SEARCH);
							params.delete(KEY_STATUS);
							if (showRangeFilter) {
								params.delete(KEY_RANGE);
								params.delete(KEY_WEEK_OFFSET);
							}
							setSearchValue("");
							router.push(`?${params.toString()}`, { scroll: false });
						}}
						className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all border border-rose-100 hover:border-rose-200 cursor-pointer"
					>
						<X className="w-3 h-3 stroke-[3]" />
						Clear
					</button>
				)}
			</div>

			{/* Category Row - Horizontal Scroll */}
			<div className="relative group">
				<div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mask-fade-right">
					<Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
					{uniqueCategories.map((cat) => (
						<button
							key={cat}
							onClick={() => setFilter(KEY_CATEGORY, cat)}
							className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border flex-shrink-0 cursor-pointer flex items-center ${
								currentCategory === cat
									? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
									: "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
							}`}
						>
							{cat}
							<span
								className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
									currentCategory === cat
										? "bg-blue-200/50 text-blue-600"
										: "bg-slate-100 text-slate-400"
								}`}
							>
								{getCategoryCount(cat)}
							</span>
						</button>
					))}
				</div>
			</div>

			{/* Status Row */}
			<div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
				<Workflow className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
				{statusOptions.map((s) => (
					<button
						key={s.value}
						onClick={() => setFilter(KEY_STATUS, s.value)}
						className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border flex-shrink-0 cursor-pointer flex items-center gap-1 ${
							currentStatus === s.value
								? "bg-slate-900 text-white border-slate-900 shadow-sm"
								: "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
						}`}
					>
						{s.label}
						<span
							className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
								currentStatus === s.value
									? "bg-white/20 text-white"
									: "bg-slate-100 text-slate-400"
							}`}
						>
							{getStatusCount(s.value)}
						</span>
					</button>
				))}
			</div>
		</div>
	);
}
