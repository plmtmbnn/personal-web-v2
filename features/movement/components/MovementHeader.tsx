"use client";

import Link from "next/link";
import {
	Activity,
	ChevronRight,
	Plus,
	Settings,
	Calendar,
	BookOpen,
	Flame,
	CheckCircle2,
} from "lucide-react";
import type { MovementSummaryStats } from "../types";

interface MovementHeaderProps {
	stats: MovementSummaryStats;
	activeTab: "today" | "library" | "history";
	onTabChange: (tab: "today" | "library" | "history") => void;
	onOpenQuickLog: () => void;
	onOpenSettings: () => void;
}

export default function MovementHeader({
	stats,
	activeTab,
	onTabChange,
	onOpenQuickLog,
	onOpenSettings,
}: MovementHeaderProps) {
	return (
		<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
			{/* Breadcrumbs & Header Actions */}
			<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-5 border-b border-slate-100">
				<div className="space-y-2.5">
					{/* Contextual Breadcrumbs */}
					<nav
						aria-label="Breadcrumb"
						className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"
					>
						<Link
							href="/admin"
							className="hover:text-slate-900 transition-colors"
						>
							Admin Console
						</Link>
						<ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span className="text-slate-900 font-semibold">
							Movement Snacks
						</span>
					</nav>

					{/* Title and Concise Description */}
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-600 flex items-center justify-center shrink-0">
							<Activity className="w-5 h-5 sm:w-6 sm:h-6" />
						</div>
						<div>
							<h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
								Daily Movement Snacks
							</h1>
							<p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-xl">
								Short, desk-friendly movement breaks between deep work sessions.
								Zero pressure, consistent motion, and active recovery.
							</p>
						</div>
					</div>
				</div>

				{/* Primary Controls */}
				<div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
					<button
						type="button"
						onClick={onOpenQuickLog}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-[background-color,transform] shadow-xs active:scale-95 cursor-pointer"
					>
						<Plus className="w-4 h-4" />
						<span>Log Movement</span>
					</button>

					<button
						type="button"
						onClick={onOpenSettings}
						aria-label="Configure routine settings"
						className="p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
					>
						<Settings className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* Telemetry Summary Strip */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
				{/* Today's Count */}
				<div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70">
					<div className="flex items-center gap-1.5 text-slate-400 mb-1">
						<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
						<span className="text-[10px] font-bold uppercase tracking-wider truncate">
							Today's Breaks
						</span>
					</div>
					<p className="text-sm sm:text-base font-black text-slate-900 font-mono">
						{stats.totalCompletedToday} / {stats.targetToday}{" "}
						<span className="text-[11px] font-normal text-slate-500">
							completed
						</span>
					</p>
				</div>

				{/* Target Rate */}
				<div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70">
					<div className="flex items-center gap-1.5 text-slate-400 mb-1">
						<Activity className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
						<span className="text-[10px] font-bold uppercase tracking-wider truncate">
							Target Progress
						</span>
					</div>
					<p className="text-sm sm:text-base font-black text-slate-900 font-mono">
						{stats.percentToday}%{" "}
						<span className="text-[11px] font-normal text-slate-500">
							{stats.percentToday >= 100 ? "achieved" : "in progress"}
						</span>
					</p>
				</div>

				{/* Streak */}
				<div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70">
					<div className="flex items-center gap-1.5 text-slate-400 mb-1">
						<Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
						<span className="text-[10px] font-bold uppercase tracking-wider truncate">
							Active Streak
						</span>
					</div>
					<p className="text-sm sm:text-base font-black text-slate-900 font-mono">
						{stats.currentStreakDays}{" "}
						<span className="text-[11px] font-normal text-slate-500">
							{stats.currentStreakDays === 1 ? "day" : "days"}
						</span>
					</p>
				</div>

				{/* All-time Completed */}
				<div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70">
					<div className="flex items-center gap-1.5 text-slate-400 mb-1">
						<Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
						<span className="text-[10px] font-bold uppercase tracking-wider truncate">
							All-Time Breaks
						</span>
					</div>
					<p className="text-sm sm:text-base font-black text-slate-900 font-mono">
						{stats.totalAllTimeCompleted}{" "}
						<span className="text-[11px] font-normal text-slate-500">
							logged
						</span>
					</p>
				</div>
			</div>

			{/* Minimalist Frameless Navigation Tabs */}
			<div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 max-w-md">
				<button
					type="button"
					onClick={() => onTabChange("today")}
					className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
						activeTab === "today"
							? "bg-white text-slate-900 shadow-xs"
							: "text-slate-600 hover:text-slate-900"
					}`}
				>
					<Activity className="w-3.5 h-3.5" />
					<span>Today's Routine</span>
				</button>

				<button
					type="button"
					onClick={() => onTabChange("library")}
					className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
						activeTab === "library"
							? "bg-white text-slate-900 shadow-xs"
							: "text-slate-600 hover:text-slate-900"
					}`}
				>
					<BookOpen className="w-3.5 h-3.5" />
					<span>Library</span>
				</button>

				<button
					type="button"
					onClick={() => onTabChange("history")}
					className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
						activeTab === "history"
							? "bg-white text-slate-900 shadow-xs"
							: "text-slate-600 hover:text-slate-900"
					}`}
				>
					<Calendar className="w-3.5 h-3.5" />
					<span>Consistency</span>
				</button>
			</div>
		</div>
	);
}
