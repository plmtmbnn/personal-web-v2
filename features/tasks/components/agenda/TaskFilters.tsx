"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
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
	Loader2,
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
	const [isPending, startTransition] = useTransition();
	const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
	const [isDebouncing, setIsDebouncing] = useState(false);

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

	// Optimistic local state for instantaneous 0ms UI feedback
	const [localPriority, setLocalPriority] = useState(currentPriority);
	const [localCategory, setLocalCategory] = useState(currentCategory);
	const [localRange, setLocalRange] = useState(currentRange);
	const [localWeekOffset, setLocalWeekOffset] = useState(weekOffset);
	const [localStatus, setLocalStatus] = useState(currentStatus);
	const [searchValue, setSearchValue] = useState(currentSearch);

	// Sync local state whenever URL searchParams change
	useEffect(() => {
		setLocalPriority(currentPriority);
		setLocalCategory(currentCategory);
		setLocalRange(currentRange);
		setLocalWeekOffset(weekOffset);
		setLocalStatus(currentStatus);
		setSearchValue(currentSearch);
	}, [
		currentPriority,
		currentCategory,
		currentRange,
		weekOffset,
		currentStatus,
		currentSearch,
	]);

	// Weekly date range calculation for Completed navigator
	const todayRef = useMemo(() => startOfDay(new Date()), []);
	const selectedWeekStart = useMemo(
		() =>
			addDays(startOfWeek(todayRef, { weekStartsOn: 1 }), localWeekOffset * 7),
		[todayRef, localWeekOffset],
	);
	const selectedWeekEnd = useMemo(
		() => endOfWeek(selectedWeekStart, { weekStartsOn: 1 }),
		[selectedWeekStart],
	);

	// Combined loading state for background navigation or debouncing
	const isLoading = isPending || isDebouncing;

	// Debounce search URL update to avoid rate-limiting routing changes on keypresses
	useEffect(() => {
		if (searchValue !== currentSearch) {
			setIsDebouncing(true);
		}
		const delayDebounce = setTimeout(() => {
			if (searchValue !== currentSearch) {
				startTransition(() => {
					const params = new URLSearchParams(searchParams.toString());
					if (!searchValue.trim()) {
						params.delete(KEY_SEARCH);
					} else {
						params.set(KEY_SEARCH, searchValue.trim());
					}
					router.replace(`?${params.toString()}`, { scroll: false });
				});
			}
			setIsDebouncing(false);
		}, SEARCH_DEBOUNCE_MS);

		return () => clearTimeout(delayDebounce);
	}, [searchValue, currentSearch, KEY_SEARCH, searchParams, router]);

	const setFilter = (key: string, value: string | null) => {
		// 1. Optimistically update local state for immediate feedback
		if (key === KEY_PRIORITY) setLocalPriority(value || "all");
		if (key === KEY_CATEGORY) setLocalCategory(value || "all");
		if (key === KEY_STATUS) setLocalStatus(value || "all");
		if (key === KEY_RANGE) setLocalRange(value || "week");
		if (key === KEY_WEEK_OFFSET) setLocalWeekOffset(Number(value || "0"));

		// 2. Perform smooth concurrent router transition
		startTransition(() => {
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
			router.replace(`?${params.toString()}`, { scroll: false });
		});
	};

	const clearAllFilters = () => {
		// 1. Optimistic reset
		setLocalPriority("all");
		setLocalCategory("all");
		setLocalStatus("all");
		setLocalRange("week");
		setLocalWeekOffset(0);
		setSearchValue("");

		// 2. Clear query parameters concurrently
		startTransition(() => {
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
			router.replace(`?${params.toString()}`, { scroll: false });
		});
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

	// Precomputed Count Lookups for O(1) performance
	const priorityCounts = useMemo(() => {
		const counts: Record<string, number> = { all: tasks?.length || 0 };
		for (const t of tasks || []) {
			if (t?.priority) {
				counts[t.priority] = (counts[t.priority] || 0) + 1;
			}
		}
		return counts;
	}, [tasks]);

	const categoryCounts = useMemo(() => {
		const counts: Record<string, number> = { all: tasks?.length || 0 };
		for (const t of tasks || []) {
			if (t?.category) {
				counts[t.category] = (counts[t.category] || 0) + 1;
			}
		}
		return counts;
	}, [tasks]);

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

	const statusCounts = useMemo(() => {
		const counts: Record<string, number> = { all: tasks?.length || 0 };
		for (const t of tasks || []) {
			const s = t?.status || "todo";
			counts[s] = (counts[s] || 0) + 1;
		}
		return counts;
	}, [tasks]);

	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (localPriority !== "all") count++;
		if (localCategory !== "all") count++;
		if (localStatus !== "all") count++;
		if (showCompleted) count++;
		if (searchValue.trim() !== "") count++;
		if (showRangeFilter) {
			if (paramPrefix === "completed" && localWeekOffset !== 0) count++;
			if (paramPrefix !== "completed" && localRange !== "week") count++;
		}
		return count;
	}, [
		localPriority,
		localCategory,
		localStatus,
		showCompleted,
		searchValue,
		showRangeFilter,
		paramPrefix,
		localWeekOffset,
		localRange,
	]);

	const hasActiveFilters = activeFilterCount > 0;

	return (
		<div
			className="flex flex-col gap-2.5 py-1 w-full max-w-full relative"
			aria-busy={isLoading}
		>
			{/* ─── ULTRA-SMOOTH INDETERMINATE PROGRESS BEAM ─────────────────── */}
			<div className="h-0.5 w-full overflow-hidden rounded-full bg-transparent relative -my-0.5">
				<AnimatePresence>
					{isLoading && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							className="w-full h-full bg-slate-100 rounded-full relative overflow-hidden"
						>
							<motion.div
								className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full w-1/3 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
								animate={{ x: ["-100%", "300%"] }}
								transition={{
									repeat: Infinity,
									duration: 1,
									ease: "easeInOut",
								}}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* ─── MOBILE BAR (< 640px) ────────────────────────────────────────── */}
			<div className="flex sm:hidden flex-col gap-2.5 w-full">
				<div className="flex items-center gap-2 w-full">
					{/* Mobile Search Input */}
					<div className="relative flex-1 flex items-center bg-white border border-slate-200/90 rounded-xl px-3 py-2 shadow-xs focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-400 transition-all">
						{isLoading ? (
							<Loader2 className="w-4 h-4 text-blue-500 animate-spin mr-2 flex-shrink-0" />
						) : (
							<Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
						)}
						<input
							type="text"
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							placeholder="Search tasks..."
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
						className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border shadow-xs cursor-pointer min-h-[38px] active:scale-95 ${
							isMobilePanelOpen || hasActiveFilters
								? "bg-slate-900 text-white border-slate-900"
								: "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
						}`}
					>
						{isLoading ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
						) : (
							<SlidersHorizontal className="w-3.5 h-3.5" />
						)}
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
										setFilter(KEY_WEEK_OFFSET, (localWeekOffset - 1).toString())
									}
									className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer active:scale-90"
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
										setFilter(KEY_WEEK_OFFSET, (localWeekOffset + 1).toString())
									}
									disabled={localWeekOffset >= 0}
									className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent active:scale-90"
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
									className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center active:scale-95 ${
										localRange === "week"
											? "bg-slate-900 text-white shadow-xs"
											: "text-slate-500 hover:text-slate-700 bg-white/50"
									}`}
								>
									Next 7 Days
								</button>
								<button
									type="button"
									onClick={() => setFilter(KEY_RANGE, "month")}
									className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center active:scale-95 ${
										localRange === "month"
											? "bg-slate-900 text-white shadow-xs"
											: "text-slate-500 hover:text-slate-700 bg-white/50"
									}`}
								>
									Next 1 Month
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
							<div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3.5 space-y-3.5 shadow-sm">
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
												className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border flex flex-col items-center justify-center gap-0.5 min-h-[42px] cursor-pointer active:scale-95 ${
													localPriority === p.value
														? "bg-slate-900 text-white border-slate-900 shadow-xs"
														: "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
												}`}
											>
												<span>{p.label}</span>
												<span
													className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${
														localPriority === p.value
															? "bg-white/20 text-white"
															: "bg-slate-100 text-slate-500"
													}`}
												>
													{priorityCounts[p.value] || 0}
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
												className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center gap-1 cursor-pointer min-h-[34px] active:scale-95 ${
													localCategory === cat
														? "bg-blue-600 text-white border-blue-600 shadow-xs"
														: "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
												}`}
											>
												<span>{cat}</span>
												<span
													className={`px-1.5 py-0.2 rounded-full text-[8px] font-bold ${
														localCategory === cat
															? "bg-white/20 text-white"
															: "bg-slate-100 text-slate-500"
													}`}
												>
													{categoryCounts[cat] || 0}
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
												className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center gap-1 cursor-pointer min-h-[34px] active:scale-95 ${
													localStatus === s.value
														? "bg-slate-900 text-white border-slate-900 shadow-xs"
														: "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
												}`}
											>
												<span>{s.label}</span>
												<span
													className={`px-1.5 py-0.2 rounded-full text-[8px] font-bold ${
														localStatus === s.value
															? "bg-white/20 text-white"
															: "bg-slate-100 text-slate-500"
													}`}
												>
													{statusCounts[s.value] || 0}
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
										className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer mt-2 active:scale-95"
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
			<div className="hidden sm:flex flex-col gap-2.5 w-full">
				{/* Primary Row: Search, Range, Priority, Status Badge, Clear */}
				<div className="flex flex-wrap items-center gap-2">
					{/* Desktop Search Input */}
					<div className="relative flex items-center bg-white border border-slate-200/90 rounded-full px-3 py-1.5 shadow-xs focus-within:ring-4 focus-within:ring-slate-900/5 focus-within:border-slate-400 transition-all max-w-[200px] w-full">
						{isLoading ? (
							<Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin mr-1.5 flex-shrink-0" />
						) : (
							<Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 flex-shrink-0" />
						)}
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
							<div className="flex items-center gap-1 bg-white border border-slate-200/90 rounded-xl p-1 shadow-xs select-none">
								<button
									type="button"
									onClick={() =>
										setFilter(KEY_WEEK_OFFSET, (localWeekOffset - 1).toString())
									}
									className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer active:scale-90"
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
										setFilter(KEY_WEEK_OFFSET, (localWeekOffset + 1).toString())
									}
									disabled={localWeekOffset >= 0}
									className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent active:scale-90"
									aria-label="Next week"
								>
									<ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
								</button>
							</div>
						) : (
							<div className="flex items-center gap-1 bg-white border border-slate-200/90 rounded-xl p-1 shadow-xs">
								<button
									type="button"
									onClick={() => setFilter(KEY_RANGE, "week")}
									className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all cursor-pointer active:scale-95 ${
										localRange === "week"
											? "bg-slate-900 text-white shadow-xs"
											: "text-slate-400 hover:text-slate-600"
									}`}
								>
									7 Days
								</button>
								<button
									type="button"
									onClick={() => setFilter(KEY_RANGE, "month")}
									className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all cursor-pointer active:scale-95 ${
										localRange === "month"
											? "bg-slate-900 text-white shadow-xs"
											: "text-slate-400 hover:text-slate-600"
									}`}
								>
									1 Month
								</button>
							</div>
						))}

					<div className="w-px h-4 bg-slate-200 mx-0.5" />

					{/* Priority Pills */}
					<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
						{priorities.map((p) => (
							<button
								key={p.value}
								type="button"
								onClick={() => setFilter(KEY_PRIORITY, p.value)}
								className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all border whitespace-nowrap cursor-pointer flex items-center active:scale-95 ${
									localPriority === p.value
										? "bg-slate-900 text-white border-slate-900 shadow-xs"
										: "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
								}`}
							>
								{p.label}
								<span
									className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
										localPriority === p.value
											? "bg-white/20 text-white"
											: "bg-slate-100 text-slate-500"
									}`}
								>
									{priorityCounts[p.value] || 0}
								</span>
							</button>
						))}
					</div>

					{/* Live Updating Badge Indicator */}
					<AnimatePresence>
						{isLoading && (
							<motion.div
								initial={{ opacity: 0, scale: 0.8, x: -4 }}
								animate={{ opacity: 1, scale: 1, x: 0 }}
								exit={{ opacity: 0, scale: 0.8, x: -4 }}
								transition={{ duration: 0.15 }}
								className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200/70 shadow-xs"
							>
								<Loader2 className="w-2.5 h-2.5 animate-spin text-blue-600" />
								<span>Updating</span>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Clear Filters Button */}
					{hasActiveFilters && (
						<button
							type="button"
							onClick={clearAllFilters}
							className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all border border-rose-100 hover:border-rose-200 cursor-pointer ml-auto active:scale-95"
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
							className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border flex-shrink-0 cursor-pointer flex items-center active:scale-95 ${
								localCategory === cat
									? "bg-blue-50 text-blue-600 border-blue-200 shadow-xs"
									: "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
							}`}
						>
							{cat}
							<span
								className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
									localCategory === cat
										? "bg-blue-200/50 text-blue-600"
										: "bg-slate-100 text-slate-400"
								}`}
							>
								{categoryCounts[cat] || 0}
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
							className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border flex-shrink-0 cursor-pointer flex items-center gap-1 active:scale-95 ${
								localStatus === s.value
									? "bg-slate-900 text-white border-slate-900 shadow-xs"
									: "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
							}`}
						>
							{s.label}
							<span
								className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
									localStatus === s.value
										? "bg-white/20 text-white"
										: "bg-slate-100 text-slate-400"
								}`}
							>
								{statusCounts[s.value] || 0}
							</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
