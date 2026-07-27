"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Tag,
	Search,
	X,
	ChevronLeft,
	ChevronRight,
	Workflow,
	SlidersHorizontal,
	ChevronDown,
	ChevronUp,
	RotateCcw,
} from "lucide-react";
import type { Task } from "@/features/tasks/types";
import { format, startOfWeek, endOfWeek, addDays, startOfDay } from "date-fns";
import {
	SEARCH_DEBOUNCE_MS,
	TASK_STATUS_CONFIG,
} from "@/features/tasks/constants";
import { motion, AnimatePresence } from "framer-motion";

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
	const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

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

	const clearAllFilters = () => {
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
	};

	const priorities = [
		{ label: "All", value: "all" },
		{ label: "High", value: "HIGH" },
		{ label: "Medium", value: "MEDIUM" },
		{ label: "Low", value: "LOW" },
	];

	// Extract unique categories safely with default fallbacks
	const uniqueCategories = useMemo(
		() => [
			"all",
			...new Set(
				(tasks || []).map((t) => t?.category).filter(Boolean) as string[],
			),
		],
		[tasks],
	);

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

	const statusOptions = useMemo(
		() => [
			{ label: "All", value: "all" },
			...Object.entries(TASK_STATUS_CONFIG).map(([key, cfg]) => ({
				label: cfg.shortLabel,
				value: key,
				color: cfg.color,
			})),
		],
		[],
	);

	const getStatusCount = (statusVal: string) => {
		const items = tasks || [];
		if (statusVal === "all") return items.length;
		return items.filter((t) => (t.status || "todo") === statusVal).length;
	};

	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (currentPriority !== "all") count++;
		if (currentCategory !== "all") count++;
		if (currentStatus !== "all") count++;
		if (showCompleted) count++;
		if (currentSearch.trim() !== "") count++;
		if (showRangeFilter) {
			if (paramPrefix === "completed" && weekOffset !== 0) count++;
			if (paramPrefix !== "completed" && currentRange !== "week") count++;
		}
		return count;
	}, [
		currentPriority,
		currentCategory,
		currentStatus,
		showCompleted,
		currentSearch,
		showRangeFilter,
		paramPrefix,
		weekOffset,
		currentRange,
	]);

	const hasActiveFilters = activeFilterCount > 0;

	return (
		<div className="flex flex-col gap-3 py-1 w-full max-w-full">
			{/* ─── MOBILE BAR (< 640px) ────────────────────────────────────────── */}
			<div className="flex sm:hidden flex-col gap-2.5 w-full">
				<div className="flex items-center gap-2 w-full">
					{/* Mobile Search Input */}
					<div className="relative flex-1 flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-400 transition-all">
						<Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
						<input
							type="text"
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							placeholder="Search..."
							className="bg-transparent border-none text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none w-full p-0"
						/>
						{searchValue && (
							<button
								type="button"
								onClick={() => setSearchValue("")}
								className="text-slate-400 hover:text-slate-600 ml-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
								aria-label="Clear search"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						)}
					</div>

					{/* Mobile Filter Toggle Button */}
					<button
						type="button"
						onClick={() => setIsMobilePanelOpen((prev) => !prev)}
						className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border shadow-sm cursor-pointer min-h-[38px] ${
							isMobilePanelOpen || hasActiveFilters
								? "bg-slate-900 text-white border-slate-900"
								: "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
						}`}
					>
						<SlidersHorizontal className="w-3.5 h-3.5" />
						<span>Filter</span>
						{activeFilterCount > 0 && (
							<span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-white leading-none">
								{activeFilterCount}
							</span>
						)}
						{isMobilePanelOpen ? (
							<ChevronUp className="w-3.5 h-3.5 ml-0.5 opacity-70" />
						) : (
							<ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
						)}
					</button>
				</div>

				{/* Mobile Date Range / Week Navigator row if applicable */}
				{showRangeFilter && (
					<div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 shadow-xs">
						{paramPrefix === "completed" ? (
							<div className="flex items-center justify-between w-full select-none">
								<button
									type="button"
									onClick={() =>
										setFilter(KEY_WEEK_OFFSET, (weekOffset - 1).toString())
									}
									className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
									aria-label="Previous week"
								>
									<ChevronLeft className="w-4 h-4 stroke-[2.5]" />
								</button>
								<span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
									{format(selectedWeekStart, "dd MMM")} -{" "}
									{format(selectedWeekEnd, "dd MMM")}
								</span>
								<button
									type="button"
									onClick={() =>
										setFilter(KEY_WEEK_OFFSET, (weekOffset + 1).toString())
									}
									disabled={weekOffset >= 0}
									className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent"
									aria-label="Next week"
								>
									<ChevronRight className="w-4 h-4 stroke-[2.5]" />
								</button>
							</div>
						) : (
							<div className="flex items-center gap-1 w-full">
								<button
									type="button"
									onClick={() => setFilter(KEY_RANGE, "week")}
									className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
										currentRange === "week"
											? "bg-slate-900 text-white shadow-xs"
											: "text-slate-500 hover:text-slate-700 bg-white/50"
									}`}
								>
									This Week
								</button>
								<button
									type="button"
									onClick={() => setFilter(KEY_RANGE, "month")}
									className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
										currentRange === "month"
											? "bg-slate-900 text-white shadow-xs"
											: "text-slate-500 hover:text-slate-700 bg-white/50"
									}`}
								>
									This Month
								</button>
							</div>
						)}
					</div>
				)}

				{/* Mobile Collapsible Panel */}
				<AnimatePresence>
					{isMobilePanelOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2, ease: "easeInOut" }}
							className="overflow-hidden"
						>
							<div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3.5 space-y-3.5 shadow-sm">
								{/* Priority Section */}
								<div>
									<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
										Priority Level
									</span>
									<div className="grid grid-cols-4 gap-1.5">
										{priorities.map((p) => (
											<button
												key={p.value}
												type="button"
												onClick={() => setFilter(KEY_PRIORITY, p.value)}
												className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border flex flex-col items-center justify-center gap-0.5 min-h-[42px] cursor-pointer ${
													currentPriority === p.value
														? "bg-slate-900 text-white border-slate-900 shadow-xs"
														: "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
												}`}
											>
												<span>{p.label}</span>
												<span
													className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${
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
								</div>

								{/* Category Section */}
								<div>
									<div className="flex items-center gap-1 mb-1.5">
										<Tag className="w-3 h-3 text-slate-400" />
										<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
											Category
										</span>
									</div>
									<div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
										{uniqueCategories.map((cat) => (
											<button
												key={cat}
												type="button"
												onClick={() => setFilter(KEY_CATEGORY, cat)}
												className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center gap-1 cursor-pointer min-h-[34px] ${
													currentCategory === cat
														? "bg-blue-600 text-white border-blue-600 shadow-xs"
														: "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
												}`}
											>
												<span>{cat}</span>
												<span
													className={`px-1.5 py-0.2 rounded-full text-[8px] font-bold ${
														currentCategory === cat
															? "bg-white/20 text-white"
															: "bg-slate-100 text-slate-500"
													}`}
												>
													{getCategoryCount(cat)}
												</span>
											</button>
										))}
									</div>
								</div>

								{/* Status Section */}
								<div>
									<div className="flex items-center gap-1 mb-1.5">
										<Workflow className="w-3 h-3 text-slate-400" />
										<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
											Workflow Status
										</span>
									</div>
									<div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
										{statusOptions.map((s) => (
											<button
												key={s.value}
												type="button"
												onClick={() => setFilter(KEY_STATUS, s.value)}
												className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center gap-1 cursor-pointer min-h-[34px] ${
													currentStatus === s.value
														? "bg-slate-900 text-white border-slate-900 shadow-xs"
														: "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
												}`}
											>
												<span>{s.label}</span>
												<span
													className={`px-1.5 py-0.2 rounded-full text-[8px] font-bold ${
														currentStatus === s.value
															? "bg-white/20 text-white"
															: "bg-slate-100 text-slate-500"
													}`}
												>
													{getStatusCount(s.value)}
												</span>
											</button>
										))}
									</div>
								</div>

								{/* Clear Button in Mobile Panel */}
								{hasActiveFilters && (
									<button
										type="button"
										onClick={clearAllFilters}
										className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer mt-2"
									>
										<RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
										Reset All Filters
									</button>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* ─── DESKTOP / TABLET BAR (>= 640px) ────────────────────────────── */}
			<div className="hidden sm:flex flex-col gap-3 w-full">
				{/* Primary Row: Search, Range, Priority, Clear */}
				<div className="flex flex-wrap items-center gap-2">
					{/* Desktop Search Input */}
					<div className="relative flex items-center bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-xs focus-within:ring-4 focus-within:ring-slate-900/5 focus-within:border-slate-400 transition-all max-w-[200px] w-full">
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
							<div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-xs select-none">
								<button
									type="button"
									onClick={() =>
										setFilter(KEY_WEEK_OFFSET, (weekOffset - 1).toString())
									}
									className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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
									className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent"
									aria-label="Next week"
								>
									<ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
								</button>
							</div>
						) : (
							<div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
								<button
									type="button"
									onClick={() => setFilter(KEY_RANGE, "week")}
									className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all cursor-pointer ${
										currentRange === "week"
											? "bg-slate-900 text-white shadow-xs"
											: "text-slate-400 hover:text-slate-600"
									}`}
								>
									Week
								</button>
								<button
									type="button"
									onClick={() => setFilter(KEY_RANGE, "month")}
									className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all cursor-pointer ${
										currentRange === "month"
											? "bg-slate-900 text-white shadow-xs"
											: "text-slate-400 hover:text-slate-600"
									}`}
								>
									Month
								</button>
							</div>
						))}

					<div className="w-px h-4 bg-slate-200 mx-1" />

					{/* Priority Pills */}
					<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
						{priorities.map((p) => (
							<button
								key={p.value}
								type="button"
								onClick={() => setFilter(KEY_PRIORITY, p.value)}
								className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all border whitespace-nowrap cursor-pointer flex items-center ${
									currentPriority === p.value
										? "bg-slate-900 text-white border-slate-900 shadow-xs"
										: "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
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
							type="button"
							onClick={clearAllFilters}
							className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all border border-rose-100 hover:border-rose-200 cursor-pointer ml-auto"
						>
							<X className="w-3 h-3 stroke-[3]" />
							Clear All
						</button>
					)}
				</div>

				{/* Category Row - Horizontal Scroll with Mask */}
				<div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 mask-fade-right">
					<Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
					{uniqueCategories.map((cat) => (
						<button
							key={cat}
							type="button"
							onClick={() => setFilter(KEY_CATEGORY, cat)}
							className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border flex-shrink-0 cursor-pointer flex items-center ${
								currentCategory === cat
									? "bg-blue-50 text-blue-600 border-blue-200 shadow-xs"
									: "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
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

				{/* Status Row */}
				<div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
					<Workflow className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
					{statusOptions.map((s) => (
						<button
							key={s.value}
							type="button"
							onClick={() => setFilter(KEY_STATUS, s.value)}
							className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border flex-shrink-0 cursor-pointer flex items-center gap-1 ${
								currentStatus === s.value
									? "bg-slate-900 text-white border-slate-900 shadow-xs"
									: "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
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
		</div>
	);
}
