"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, Check, CalendarDays, History } from "lucide-react";
import type { Task } from "@/features/tasks/types";

interface TaskFiltersProps {
	tasks: Task[];
  paramPrefix: string; // e.g., "today" or "upcoming"
  showRangeFilter?: boolean;
}

export default function TaskFilters({ tasks, paramPrefix, showRangeFilter = false }: TaskFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

  // Keys with prefix
  const KEY_PRIORITY = `${paramPrefix}_priority`;
  const KEY_CATEGORY = `${paramPrefix}_category`;
  const KEY_COMPLETED = `${paramPrefix}_completed`;
  const KEY_RANGE = `${paramPrefix}_range`;

	const currentPriority = searchParams.get(KEY_PRIORITY) || "all";
	const currentCategory = searchParams.get(KEY_CATEGORY) || "all";
  const currentRange = searchParams.get(KEY_RANGE) || "week";
  const showCompleted = searchParams.get(KEY_COMPLETED) === "true";

	const setFilter = (key: string, value: string | null) => {
		const params = new URLSearchParams(searchParams.toString());
		if (!value || value === "all" || value === "false" || (key === KEY_RANGE && value === "week")) {
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

  const uniqueCategories = ["all", ...new Set(tasks.map(t => t.category).filter(Boolean) as string[])];

	return (
		<div className="flex flex-col gap-4 py-2">
      {/* Primary Row: Range, Completed, Priority */}
      <div className="flex flex-wrap items-center gap-2">
        
        {/* Range Toggle (Only for Upcoming) */}
        {showRangeFilter && (
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm mr-1">
            <button
              onClick={() => setFilter(KEY_RANGE, "week")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                currentRange === "week" ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setFilter(KEY_RANGE, "month")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                currentRange === "month" ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Month
            </button>
          </div>
        )}

        {/* Completed Toggle */}
        <button
          onClick={() => setFilter(KEY_COMPLETED, (!showCompleted).toString())}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
            showCompleted
              ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
              : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
          }`}
        >
          {showCompleted ? <History className="w-3 h-3" /> : <Check className="w-3 h-3" />}
          {showCompleted ? "History" : "Done"}
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />

        {/* Priority Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {priorities.map((p) => (
            <button
              key={p.value}
              onClick={() => setFilter(KEY_PRIORITY, p.value)}
              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all border whitespace-nowrap ${
                currentPriority === p.value
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Row - Horizontal Scroll */}
      <div className="relative group">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mask-fade-right">
          <TagIcon className="w-3 h-3 text-slate-300 flex-shrink-0" />
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(KEY_CATEGORY, cat)}
              className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border flex-shrink-0 ${
                currentCategory === cat
                  ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
		</div>
	);
}

function TagIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/>
    </svg>
  );
}
