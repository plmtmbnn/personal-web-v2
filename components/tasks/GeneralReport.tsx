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
  ArrowDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTaskStats, AnalyticsStats } from "@/lib/actions/analytics";

const ANALYTICS_EXPAND_KEY = "analytics_expanded_state";

export default function GeneralReport() {
	const [period, setPeriod] = useState<"today" | "week" | "month">("week");
	const [stats, setStats] = useState<AnalyticsStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [isExpanded, setIsExpanded] = useState(false);

	// Load expansion state from localStorage
	useEffect(() => {
		const stored = localStorage.getItem(ANALYTICS_EXPAND_KEY);
		if (stored !== null) {
			setIsExpanded(JSON.parse(stored));
		}
	}, []);

	// Save expansion state to localStorage
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

	const StatCard = ({ 
		title, 
		value, 
		icon: Icon, 
		colorClass,
		subtext 
	}: { 
		title: string; 
		value: string | number; 
		icon: any; 
		colorClass: string;
		subtext?: string;
	}) => (
		<div className="glass shadow-sm p-5 rounded-[2rem] border border-border/50 hover:border-accent/20 transition-all duration-300">
			<div className="flex items-center justify-between mb-4">
				<div className={`p-3 rounded-2xl ${colorClass}`}>
					<Icon className="w-5 h-5" />
				</div>
				{subtext && (
					<span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-background-secondary px-2 py-1 rounded-lg">
						{subtext}
					</span>
				)}
			</div>
			<p className="text-muted-foreground text-sm font-medium">{title}</p>
			<h4 className="text-2xl font-black mt-1">{value}</h4>
		</div>
	);

	const scrollToTasks = () => {
		const agenda = document.getElementById("agenda-section");
		if (agenda) {
			agenda.scrollIntoView({ behavior: "smooth" });
		}
	};

	if (loading && !stats) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="w-8 h-8 text-accent animate-spin" />
			</div>
		);
	}

	if (!stats) return null;

	return (
		<div id="analytics-overview" className="space-y-6">
			{/* Header & Filter */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<div 
						onClick={toggleExpand}
						className="cursor-pointer group flex items-center gap-3"
					>
						<div className="p-3 bg-accent/10 text-accent rounded-2xl group-hover:scale-110 transition-transform">
							<BarChart3 className="w-6 h-6" />
						</div>
						<div>
							<h2 className="text-2xl font-black flex items-center gap-2">
								{isExpanded ? "Hide Insights" : "Show Insights"}
								{isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
							</h2>
							<p className="text-muted-foreground text-sm">Review your productivity trends.</p>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<div className="flex bg-background-secondary p-1 rounded-2xl border border-border/50 w-fit">
						{(["today", "week", "month"] as const).map((p) => (
							<button
								key={p}
								onClick={() => setPeriod(p)}
								className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
									period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
								}`}
							>
								{p}
							</button>
						))}
					</div>
					{isExpanded && (
						<button 
							onClick={scrollToTasks}
							className="p-2 bg-background-secondary hover:bg-border/30 rounded-xl border border-border/50 text-accent transition-colors"
							title="Jump to Tasks"
						>
							<ArrowDown className="w-5 h-5" />
						</button>
					)}
				</div>
			</div>

			<AnimatePresence initial={false}>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.4, ease: "easeInOut" }}
						className="overflow-hidden space-y-6"
					>
						{/* Main Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							<StatCard 
								title="Total Scope" 
								value={stats.totalTasks} 
								icon={ClipboardList} 
								colorClass="bg-blue-500/10 text-blue-500" 
							/>
							<StatCard 
								title="Completed" 
								value={stats.completedTasks} 
								icon={CheckCircle2} 
								colorClass="bg-green-500/10 text-green-500" 
								subtext={stats.comparison !== 0 ? `${stats.comparison > 0 ? "+" : ""}${stats.comparison}%` : undefined}
							/>
							<StatCard 
								title="Efficiency" 
								value={`${stats.completionRate}%`} 
								icon={TrendingUp} 
								colorClass="bg-accent/10 text-accent" 
							/>
							<StatCard 
								title="Daily Velocity" 
								value={stats.taskVelocity} 
								icon={Activity} 
								colorClass="bg-purple-500/10 text-purple-500" 
							/>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
							{/* Left Column: Streak & Peak */}
							<div className="space-y-6">
								<StatCard 
									title="Active Streak" 
									value={`${stats.streak} Days`} 
									icon={Zap} 
									colorClass="bg-amber-500/10 text-amber-500" 
								/>
								<div className="glass p-6 rounded-[2.5rem] border border-border/50">
									<div className="flex items-center gap-3 mb-4">
										<div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
											<CalendarDays className="w-5 h-5" />
										</div>
										<h3 className="font-black text-sm">Productivity Peak</h3>
									</div>
									<div className="text-center py-4">
										<h4 className="text-3xl font-black text-purple-600">{stats.mostProductiveDay}</h4>
										<p className="text-xs text-muted-foreground mt-2">Most active day this period</p>
									</div>
								</div>
							</div>

							{/* Center: Priority Distribution */}
							<div className="glass p-6 rounded-[2.5rem] border border-border/50 flex flex-col">
								<div className="flex items-center gap-3 mb-6">
									<div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
										<PieChart className="w-5 h-5" />
									</div>
									<h3 className="font-black text-sm">Priority Spread</h3>
								</div>
								<div className="flex-1 flex flex-col justify-center">
									<div className="flex h-8 w-full rounded-full overflow-hidden border border-border/30 mb-6">
										{stats.priorityDistribution.map((p) => {
											const percentage = stats.totalTasks > 0 ? (p.count / stats.totalTasks) * 100 : 0;
											const colors = {
												HIGH: "bg-red-500",
												MEDIUM: "bg-amber-500",
												LOW: "bg-blue-500"
											};
											if (percentage === 0) return null;
											return (
												<div 
													key={p.priority}
													style={{ width: `${percentage}%` }}
													className={`${colors[p.priority]} transition-all duration-1000`}
													title={`${p.priority}: ${p.count}`}
												/>
											);
										})}
									</div>
									<div className="grid grid-cols-3 gap-2">
										{stats.priorityDistribution.map((p) => (
											<div key={p.priority} className="text-center">
												<div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
													p.priority === "HIGH" ? "bg-red-500" : p.priority === "MEDIUM" ? "bg-amber-500" : "bg-blue-500"
												}`} />
												<p className="text-[10px] font-black">{p.priority}</p>
												<p className="text-xs text-muted-foreground">{p.count}</p>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Right: Category Distribution */}
							<div className="glass p-6 rounded-[2.5rem] border border-border/50">
								<div className="flex items-center gap-3 mb-6">
									<div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl">
										<BarChart3 className="w-5 h-5" />
									</div>
									<h3 className="font-black text-sm">Category Focus</h3>
								</div>
								<div className="space-y-3">
									{stats.categoryDistribution.slice(0, 5).map((item) => (
										<div key={item.category} className="space-y-1">
											<div className="flex justify-between text-[10px] font-bold uppercase">
												<span>{item.category}</span>
												<span className="text-muted-foreground">{item.count}</span>
											</div>
											<div className="h-2 bg-background-secondary rounded-full overflow-hidden">
												<div 
													className="h-full bg-orange-500 transition-all duration-1000 ease-out"
													style={{ width: `${(item.count / stats.totalTasks) * 100}%` }}
												/>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						<button 
							onClick={scrollToTasks}
							className="w-full py-3 bg-accent/5 hover:bg-accent/10 text-accent text-sm font-bold rounded-2xl border border-dashed border-accent/20 transition-all flex items-center justify-center gap-2 group"
						>
							<ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
							Jump to Agenda
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
