"use client";

import { useEffect, useState, useTransition } from "react";
import {
	getWeeklyReviewStats,
	type WeeklyReviewStats,
} from "../../actions/analytics";
import {
	Loader2,
	Trophy,
	Clock,
	AlertTriangle,
	ArrowRight,
	Award,
	CheckCircle2,
	Zap,
} from "lucide-react";
import { motion } from "framer-motion";

export default function WeeklyReview() {
	const [stats, setStats] = useState<WeeklyReviewStats | null>(null);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		startTransition(async () => {
			try {
				const res = await getWeeklyReviewStats();
				setStats(res);
			} catch (err) {
				console.error("Failed to load weekly review stats:", err);
			}
		});
	}, []);

	if (isPending || !stats) {
		return (
			<div className="h-96 flex flex-col items-center justify-center gap-3 bg-slate-50/50 rounded-[2rem] border border-slate-100">
				<Loader2 className="w-8 h-8 animate-spin text-slate-400" />
				<p className="text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">
					Consolidating Weekly Logs...
				</p>
			</div>
		);
	}

	const formatMinutes = (mins: number) => {
		if (mins < 60) return `${mins}m`;
		const hours = Math.floor(mins / 60);
		const remaining = mins % 60;
		return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
	};

	const gradeColors = {
		"A+": "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
		A: "text-teal-500 bg-teal-500/10 border-teal-500/30",
		B: "text-blue-500 bg-blue-500/10 border-blue-500/30",
		C: "text-amber-500 bg-amber-500/10 border-amber-500/30",
		D: "text-rose-500 bg-rose-500/10 border-rose-500/30",
	};

	return (
		<div className="space-y-8">
			{/* Hero Performance Card */}
			<div className="bg-slate-900 text-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden group border border-slate-800">
				<div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
					<Award className="w-40 h-40" />
				</div>
				<div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
					<div className="space-y-3 text-center md:text-left">
						<div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/20 rounded-full border border-violet-500/30 text-violet-300 text-[10px] font-black uppercase tracking-widest">
							<Award className="w-3.5 h-3.5" /> Weekly Performance Report
						</div>
						<h2 className="text-3xl font-black tracking-tight font-sans">
							Weekly Review
						</h2>
						<p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
							Monitored Execution: {stats.completionRate}% Target Neutralization
						</p>
					</div>

					{/* Grade Circle */}
					<div className="flex items-center gap-6 bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-xl">
						<div
							className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black border ${gradeColors[stats.performanceGrade]}`}
						>
							{stats.performanceGrade}
						</div>
						<div className="max-w-[200px] text-left">
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
								Operational Grade
							</p>
							<p className="text-xs font-semibold text-slate-200 mt-1 leading-snug">
								{stats.feedbackMessage}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Highlight Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center gap-4">
					<div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl flex-shrink-0">
						<CheckCircle2 className="w-6 h-6" />
					</div>
					<div>
						<p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
							Objectives Met
						</p>
						<h4 className="text-xl font-black text-slate-900 mt-0.5">
							{stats.completedCount} Tasks
						</h4>
						<p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
							Created this week: {stats.createdCount}
						</p>
					</div>
				</div>

				<div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center gap-4">
					<div className="p-3.5 bg-violet-50 text-violet-600 rounded-2xl flex-shrink-0">
						<Clock className="w-6 h-6" />
					</div>
					<div>
						<p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
							Focus Duration
						</p>
						<h4 className="text-xl font-black text-slate-900 mt-0.5">
							{formatMinutes(stats.effortNeutralized)}
						</h4>
						<p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
							Neutralized effort
						</p>
					</div>
				</div>

				<div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center gap-4">
					<div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl flex-shrink-0">
						<AlertTriangle className="w-6 h-6" />
					</div>
					<div>
						<p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
							Execution Delays
						</p>
						<h4 className="text-xl font-black text-slate-900 mt-0.5">
							{stats.totalDelays} Reschedules
						</h4>
						<p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
							Due date shifts
						</p>
					</div>
				</div>

				<div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center gap-4">
					<div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl flex-shrink-0">
						<ArrowRight className="w-6 h-6" />
					</div>
					<div>
						<p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
							Carried Forward
						</p>
						<h4 className="text-xl font-black text-slate-900 mt-0.5">
							{stats.carriedForwardCount} Overdue
						</h4>
						<p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
							Pushed to next sprint
						</p>
					</div>
				</div>
			</div>

			{/* Columns: Top Wins vs. Focus Categories */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Top Wins */}
				<div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6">
					<div className="flex items-center justify-between border-b border-slate-50 pb-4">
						<div>
							<h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
								<Trophy className="w-4 h-4 text-amber-500" />
								Major Wins
							</h3>
							<p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
								Highest priority or effort completed tasks
							</p>
						</div>
					</div>

					<div className="space-y-3">
						{stats.topWins.length === 0 ? (
							<div className="p-6 text-center text-slate-400 text-xs font-semibold">
								No tasks completed this week yet.
							</div>
						) : (
							stats.topWins.map((win, idx) => (
								<motion.div
									key={win.id}
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: idx * 0.1 }}
									className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors"
								>
									<div className="flex items-center gap-3 min-w-0">
										<span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black">
											{idx + 1}
										</span>
										<p className="text-xs font-black text-slate-800 truncate max-w-md">
											{win.title}
										</p>
									</div>
									<div className="flex items-center gap-2 flex-shrink-0">
										{win.priority === "HIGH" && (
											<span className="text-[8px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-100">
												High
											</span>
										)}
										<span className="text-[8px] font-black uppercase tracking-widest bg-slate-200/50 text-slate-500 px-2 py-0.5 rounded">
											{formatMinutes(win.estimated_minutes)}
										</span>
									</div>
								</motion.div>
							))
						)}
					</div>
				</div>

				{/* Active Areas */}
				<div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6">
					<div>
						<h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
							<Zap className="w-4 h-4 text-violet-500" />
							Domain Highlight
						</h3>
						<p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
							Most active categories this week
						</p>
					</div>

					<div className="flex flex-col items-center justify-center p-6 bg-violet-50/50 border border-violet-100 rounded-3xl text-center space-y-3">
						<div className="w-12 h-12 rounded-2xl bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/20">
							<Zap className="w-6 h-6" />
						</div>
						<div>
							<p className="text-[10px] font-black text-violet-500 uppercase tracking-widest">
								Active Category
							</p>
							<h4 className="text-lg font-black text-slate-900 mt-1">
								{stats.activeCategory}
							</h4>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
