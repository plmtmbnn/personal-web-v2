import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, CheckCircle2 } from "lucide-react";
import type { Task } from "@/features/tasks/types";

interface TaskFiltersProps {
	tasks: Task[];
}

export default function TaskFilters({ tasks }: TaskFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentPriority = searchParams.get("priority") || "all";
	const currentCategory = searchParams.get("category") || "all";
	const showCompleted = searchParams.get("completed") === "true";

	const setFilter = (key: string, value: string | null) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value && value !== "all") {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const toggleCompleted = () => {
		setFilter("completed", showCompleted ? null : "true");
	};

	const priorities = [
		{ label: "All", value: "all" },
		{ label: "High", value: "HIGH" },
		{ label: "Medium", value: "MEDIUM" },
		{ label: "Low", value: "LOW" },
	];

	const categories = ["all", ...new Set(tasks.map((t) => t.category).filter(Boolean))];

	return (
		<div className="flex flex-col gap-4">
			{/* Priority Filters */}
			<div className="flex flex-wrap items-center gap-2">
				<div className="flex items-center gap-2 mr-2">
					<Filter className="w-3.5 h-3.5 text-slate-400" />
					<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority:</span>
				</div>

				{priorities.map((p) => (
					<button
						key={p.value}
						onClick={() => setFilter("priority", p.value)}
						className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
							currentPriority === p.value
								? "bg-slate-900 text-white border-slate-900 shadow-sm"
								: "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
						}`}
					>
						{p.label}
					</button>
				))}
			</div>

			{/* Category Filters */}
			<div className="flex flex-wrap items-center gap-2">
				<div className="flex items-center gap-2 mr-2">
					<Filter className="w-3.5 h-3.5 text-slate-400" />
					<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category:</span>
				</div>

				{categories.map((cat) => (
					<button
						key={cat}
						onClick={() => setFilter("category", cat)}
						className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
							currentCategory === cat
								? "bg-slate-900 text-white border-slate-900 shadow-sm"
								: "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
						}`}
					>
						{cat === "all" ? "All" : cat}
					</button>
				))}
			</div>

			{/* Status Toggles */}
			<div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
				<button
					onClick={toggleCompleted}
					className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
						showCompleted
							? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
							: "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
					}`}
				>
					<CheckCircle2 className={`w-3.5 h-3.5 ${showCompleted ? "text-emerald-500" : "text-slate-300"}`} />
					Show Completed
				</button>

				{(currentPriority !== "all" || currentCategory !== "all" || showCompleted) && (
					<button
						onClick={() => router.push("?", { scroll: false })}
						className="flex items-center gap-1.5 text-slate-400 hover:text-rose-600 transition-colors text-[10px] font-black uppercase tracking-widest"
					>
						<X className="w-3.5 h-3.5" />
						Clear All
					</button>
				)}
			</div>
		</div>
	);
}
