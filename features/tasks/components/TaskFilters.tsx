"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, ChevronDown } from "lucide-react";

export default function TaskFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentPriority = searchParams.get("priority") || "all";

	const setFilter = (key: string, value: string | null) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		router.push(`?${params.toString()}`);
	};

	const priorities = [
		{ label: "All Tasks", value: "all", color: "bg-slate-100 text-slate-600" },
		{ label: "High", value: "high", color: "bg-rose-50 text-rose-700 border-rose-100" },
		{ label: "Medium", value: "medium", color: "bg-amber-50 text-amber-700 border-amber-100" },
		{ label: "Low", value: "low", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
	];

	return (
		<div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 mr-2">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filters:</span>
      </div>

			{priorities.map((p) => (
				<button
					key={p.value}
					onClick={() => setFilter("priority", p.value === "all" ? null : p.value)}
					className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
						currentPriority === p.value
							? "bg-slate-900 text-white border-slate-900 shadow-md"
							: "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
					}`}
				>
					{p.label}
				</button>
			))}

			{currentPriority !== "all" && (
				<button
					onClick={() => router.push("?")}
					className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
					title="Clear Filters"
				>
					<X className="w-4 h-4" />
				</button>
			)}
		</div>
	);
}
