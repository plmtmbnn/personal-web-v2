"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  CheckCircle2, 
  ClipboardList, 
  TrendingUp, 
  CalendarDays,
  Zap,
  Loader2,
  ChevronDown,
  ChevronUp,
  Activity,
  PieChart,
  ArrowDown,
  Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTaskStats, AnalyticsStats } from "@/features/tasks/actions/analytics";

const ANALYTICS_EXPAND_KEY = "analytics_expanded_state";

export default function GeneralReport() {
	const [period, setPeriod] = useState<"today" | "week" | "month">("week");
	const [stats, setStats] = useState<AnalyticsStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [isExpanded, setIsExpanded] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem(ANALYTICS_EXPAND_KEY);
		if (stored !== null) setIsExpanded(JSON.parse(stored));
	}, []);

	const toggleExpand = () => {
		const newState = !isExpanded;
		setIsExpanded(newState);
		localStorage.setItem(ANALYTICS_EXPAND_KEY, JSON.stringify(newState));
	};

	useEffect(() => {
		const fetchStats = async () => {
			setLoading(true);
			try {
				const data = await getTaskStats(period);
				setStats(data);
			} catch (error) {
				console.error("Failed to fetch analytics:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, [period]);

	const StatCard = ({ title, value, icon: Icon, colorClass, subtext }: any) => (
		<div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:border-slate-300">
			<div className="flex items-center justify-between mb-4">
				<div className={`p-3 rounded-xl ${colorClass}`}>
					<Icon className="w-5 h-5" />
				</div>
				{subtext && (
					<span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
						{subtext}
					</span>
				)}
			</div>
			<p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
			<h4 className="text-2xl font-black text-slate-900 mt-1">{value}</h4>
		</div>
	);

	if (loading && !stats) {
		return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-slate-300 animate-spin" /></div>;
	}

	if (!stats) return null;

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
				<div onClick={toggleExpand} className="cursor-pointer group flex items-center gap-4">
					<div className="p-3 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-slate-200 transition-colors">
						<BarChart3 className="w-5 h-5" />
					</div>
					<div>
						<h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
							Performance Metrics
							{isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
						</h2>
						<p className="text-slate-400 text-xs font-medium uppercase tracking-tight">Review productivity analytics</p>
					</div>
				</div>

				<div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
					{(["today", "week", "month"] as const).map((p) => (
						<button
							key={p}
							onClick={() => setPeriod(p)}
							className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
								period === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
							}`}
						>
							{p}
						</button>
					))}
				</div>
			</div>

			<AnimatePresence>
				{isExpanded && (
					<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-6 px-4 pb-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							<StatCard title="Total Scope" value={stats.totalTasks} icon={ClipboardList} colorClass="bg-blue-50 text-blue-600" />
							<StatCard title="Completed" value={stats.completedTasks} icon={CheckCircle2} colorClass="bg-emerald-50 text-emerald-600" subtext={stats.comparison !== 0 ? `${stats.comparison > 0 ? "+" : ""}${stats.comparison}%` : undefined} />
							<StatCard title="Efficiency" value={`${stats.completionRate}%`} icon={TrendingUp} colorClass="bg-indigo-50 text-indigo-600" />
							<StatCard title="Daily Velocity" value={stats.taskVelocity} icon={Activity} colorClass="bg-purple-50 text-purple-600" />
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
							<div className="space-y-4">
								<StatCard title="Active Streak" value={`${stats.streak} Days`} icon={Zap} colorClass="bg-amber-50 text-amber-600" />
								<div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
									<div className="flex items-center justify-center gap-3 mb-4 text-purple-600">
										<Trophy className="w-5 h-5" />
										<h3 className="font-black text-[10px] uppercase tracking-widest">Peak Performance</h3>
									</div>
									<h4 className="text-3xl font-black text-slate-900">{stats.mostProductiveDay}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Most active day</p>
								</div>
							</div>

							<div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col">
								<div className="flex items-center gap-3 mb-6 text-rose-600">
									<PieChart className="w-5 h-5" />
									<h3 className="font-black text-[10px] uppercase tracking-widest">Priority Spread</h3>
								</div>
								<div className="flex-1 flex flex-col justify-center">
									<div className="flex h-6 w-full rounded-full overflow-hidden border border-slate-100 mb-6 bg-slate-50">
										{stats.priorityDistribution.map((p) => {
											const percentage = stats.totalTasks > 0 ? (p.count / stats.totalTasks) * 100 : 0;
											const colors = { HIGH: "bg-rose-500", MEDIUM: "bg-amber-500", LOW: "bg-emerald-500" };
											return percentage > 0 ? <div key={p.priority} style={{ width: `${percentage}%` }} className={`${colors[p.priority]} transition-all duration-700`} /> : null;
										})}
									</div>
									<div className="grid grid-cols-3 gap-2">
										{stats.priorityDistribution.map((p) => (
											<div key={p.priority} className="text-center">
												<div className={`w-1.5 h-1.5 rounded-full mx-auto mb-1 ${p.priority === "HIGH" ? "bg-rose-500" : p.priority === "MEDIUM" ? "bg-amber-500" : "bg-emerald-500"}`} />
												<p className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">{p.priority}</p>
												<p className="text-xs font-bold text-slate-400">{p.count}</p>
											</div>
										))}
									</div>
								</div>
							</div>

							<div className="bg-white p-6 rounded-2xl border border-slate-200">
								<div className="flex items-center gap-3 mb-6 text-orange-600">
									<BarChart3 className="w-5 h-5" />
									<h3 className="font-black text-[10px] uppercase tracking-widest">Category Focus</h3>
								</div>
								<div className="space-y-4">
									{stats.categoryDistribution.slice(0, 4).map((item) => (
										<div key={item.category} className="space-y-1.5">
											<div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
												<span className="text-slate-900">{item.category}</span>
												<span className="text-slate-400">{item.count}</span>
											</div>
											<div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
												<div className="h-full bg-orange-500 transition-all duration-1000 ease-out" style={{ width: `${(item.count / stats.totalTasks) * 100}%` }} />
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
