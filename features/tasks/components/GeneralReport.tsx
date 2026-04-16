"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart3, 
  CheckCircle2, 
  ClipboardList, 
  TrendingUp, 
  Zap,
  Loader2,
  ChevronDown,
  ChevronUp,
  Activity,
  PieChart,
  Repeat,
  AlertTriangle,
  Flame,
  Target,
  Trophy,
  Info,
  Clock,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTaskStats, AnalyticsStats } from "@/features/tasks/actions/analytics";
import type { Task } from "@/features/tasks/types";
import { parseISO, isSameDay, isAfter, subDays, differenceInDays } from "date-fns";

const ANALYTICS_EXPAND_KEY = "analytics_expanded_state_v6";

interface GeneralReportProps {
  tasks?: Task[];
}

export default function GeneralReport({ tasks = [] }: GeneralReportProps) {
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

  /**
   * Advanced Metrics Engine
   * Calculates Reliability and Lead Time based on the passed tasks prop and selected period.
   */
  const reliabilityMetrics = useMemo(() => {
    if (!tasks || tasks.length === 0) return { punctualityRate: 0, executionScore: 0, avgLeadTime: 0 };

    const now = new Date();
    const periodFiltered = tasks.filter(t => {
      const dueDate = parseISO(t.due_date);
      if (period === 'today') return isSameDay(dueDate, now);
      if (period === 'week') return isAfter(dueDate, subDays(now, 8));
      if (period === 'month') return isAfter(dueDate, subDays(now, 31));
      return true;
    });

    const completed = periodFiltered.filter(t => t.is_completed && t.completed_at);
    if (completed.length === 0) return { punctualityRate: 0, executionScore: 0, avgLeadTime: 0 };

    // 1. Punctuality Rate
    const punctualCount = completed.filter(t => (t.reschedule_count || 0) === 0).length;
    const punctualityRate = Math.round((punctualCount / completed.length) * 100);

    // 2. Execution Score (Weighted average)
    const scores = completed.map(t => {
      const rc = t.reschedule_count || 0;
      if (rc === 0) return 100;
      if (rc === 1) return 80;
      if (rc === 2) return 50;
      return 0;
    });
    const executionScore = Math.round(scores.reduce<number>((a, b) => a + b, 0) / scores.length);

    // 3. Average Lead Time
    const leadTimes = completed.map(t => {
      const start = parseISO(t.created_at);
      const end = parseISO(t.completed_at!);
      return Math.max(0, differenceInDays(end, start));
    });
    const avgLeadTime = parseFloat((leadTimes.reduce<number>((a, b) => a + b, 0) / leadTimes.length).toFixed(1));

    return { punctualityRate, executionScore, avgLeadTime };
  }, [tasks, period]);

	const StatCard = ({ title, value, icon: Icon, colorClass, subtext, description }: any) => (
		<div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm transition-all duration-300 hover:border-slate-300 group flex flex-col min-w-0">
			<div className="flex items-center justify-between mb-6">
				<div className={`p-3 sm:p-4 rounded-2xl ${colorClass} shadow-sm group-hover:scale-110 transition-transform flex-shrink-0`}>
					<Icon className="w-5 h-5 sm:w-6 sm:h-6" />
				</div>
				{subtext && (
					<span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex-shrink-0">
						{subtext}
					</span>
				)}
			</div>
			<p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
			<h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight break-words whitespace-normal leading-tight">{value}</h4>
      {description && <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-50 font-medium leading-relaxed break-words">{description}</p>}
		</div>
	);

	if (loading && !stats) {
		return (
      <div className="flex flex-col items-center justify-center py-24 bg-slate-50 border border-slate-200 rounded-[3rem]">
        <Loader2 className="w-10 h-10 text-slate-300 animate-spin mb-4" />
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing Intel</p>
      </div>
    );
	}

	if (!stats) return null;

	return (
		<div className="space-y-10">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-4">
				<div onClick={toggleExpand} className="cursor-pointer group flex items-center gap-6">
					<div className="p-5 bg-slate-900 text-white rounded-[1.5rem] group-hover:bg-slate-800 transition-all shadow-xl shadow-black/10 flex-shrink-0">
						<BarChart3 className="w-7 h-7" />
					</div>
					<div>
						<h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
							Operational Intel
							{isExpanded ? <ChevronUp className="w-6 h-6 text-slate-300" /> : <ChevronDown className="w-6 h-6 text-slate-300" />}
						</h2>
						<p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Senior Strategic Audit</p>
					</div>
				</div>

				<div className="flex items-center gap-2 bg-slate-100 p-2 rounded-[1.2rem] border border-slate-200 shadow-inner w-full md:w-auto">
					{(["today", "week", "month"] as const).map((p) => (
						<button
							key={p}
							onClick={() => setPeriod(p)}
							className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
								period === p ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600"
							}`}
						>
							{p}
						</button>
					))}
				</div>
			</div>

			<AnimatePresence>
				{isExpanded && (
					<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-10 px-4 pb-10">
						
            {/* Row 1: Execution & Reliability Command */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Efficiency Card */}
              <div className="bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-10 group shadow-2xl shadow-black/20 transition-transform hover:-translate-y-1 min-w-0">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                    <motion.circle 
                      cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="10" 
                      className="text-emerald-400"
                      strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * stats.completionRate) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-black text-white">
                    {stats.completionRate}%
                  </div>
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Completion Rate</p>
                  <h4 className="text-3xl font-black text-white tracking-tight leading-none mb-3">Efficiency</h4>
                  <p className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1.5 rounded-lg inline-block !text-white">{stats.completedTasks} Objectives Neutralized</p>
                </div>
              </div>

              {/* Reliability Card - NEW */}
              <div className={`p-8 sm:p-10 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-10 group shadow-2xl transition-all hover:-translate-y-1 border-2 ${
                reliabilityMetrics.punctualityRate > 80 
                  ? "bg-white border-emerald-500/20 text-emerald-600" 
                  : reliabilityMetrics.punctualityRate > 50
                  ? "bg-white border-amber-500/20 text-amber-600"
                  : "bg-white border-rose-500/20 text-rose-600"
              }`}>
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(0,0,0,0.05)" strokeWidth="10" />
                    <motion.circle 
                      cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="10" 
                      strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * reliabilityMetrics.punctualityRate) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-black text-slate-900">
                    {reliabilityMetrics.punctualityRate}%
                  </div>
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Punctuality Rate</p>
                    <div className="group/info relative cursor-help">
                      <Info className="w-3 h-3 text-slate-300" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                        Completing tasks without ever rescheduling them.
                      </div>
                    </div>
                  </div>
                  <h4 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">Reliability</h4>
                  <p className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border flex items-center gap-2 justify-center sm:justify-start ${
                    reliabilityMetrics.punctualityRate > 80 ? "bg-emerald-50 border-emerald-100" : reliabilityMetrics.punctualityRate > 50 ? "bg-amber-50 border-amber-100" : "bg-rose-50 border-rose-100"
                  }`}>
                    {reliabilityMetrics.punctualityRate > 80 ? <ShieldCheck className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                    {reliabilityMetrics.punctualityRate > 80 ? "Elite Execution" : reliabilityMetrics.punctualityRate > 50 ? "Stable Performance" : "Needs Discipline"}
                  </p>
                </div>
              </div>
						</div>

            {/* Row 2: Supporting Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Scope" value={stats.totalTasks} icon={ClipboardList} colorClass="bg-blue-50 text-blue-600" description="Objectives in cycle" />
              <StatCard title="Active Streak" value={`${stats.streak}d`} icon={Flame} colorClass="bg-orange-50 text-orange-600" description="Operational momentum" />
              <StatCard title="Execution Score" value={`${reliabilityMetrics.executionScore}/100`} icon={Zap} colorClass="bg-yellow-50 text-yellow-600" description="Weighted reliability grade" />
              <StatCard title="Lead Time" value={`${reliabilityMetrics.avgLeadTime}d`} icon={Clock} colorClass="bg-purple-50 text-purple-600" description="Avg cycle duration" />
            </div>

            {/* Row 3: Tactical Breakdown */}
            <div className="grid grid-cols-1 gap-8">
              
              {/* Distribution & Categories Dual Column */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-[3rem] shadow-sm space-y-10 min-w-0">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.2rem] border border-indigo-100 flex-shrink-0">
                      <Target className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-[0.3em] text-slate-900">Distribution</h3>
                      <p className="text-xs font-medium text-slate-400">Current operational spread</p>
                    </div>
                  </div>
                  <div className="space-y-8">
                    {[
                      { label: "Focus (Today)", count: stats.distribution.today, color: "bg-orange-500" },
                      { label: "Upcoming Awareness", count: stats.distribution.upcoming, color: "bg-blue-500" },
                      { label: "Overdue Lapsed", count: stats.distribution.overdue, color: "bg-rose-500" },
                    ].map((item) => (
                      <div key={item.label} className="space-y-3">
                        <div className="flex justify-between items-end gap-4">
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 break-words leading-tight">{item.label}</span>
                          <span className="text-lg font-black text-slate-900 flex-shrink-0">{item.count}</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / (stats.distribution.today + stats.distribution.upcoming + stats.distribution.overdue || 1)) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${item.color} shadow-lg`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-[3rem] shadow-sm space-y-10 min-w-0">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-cyan-50 text-cyan-600 rounded-[1.2rem] border border-cyan-100 flex-shrink-0">
                      <PieChart className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-[0.3em] text-slate-900">Top Segments</h3>
                      <p className="text-xs font-medium text-slate-400">Dominant categories</p>
                    </div>
                  </div>
                  <div className="space-y-8">
                    {stats.categoryDistribution.slice(0, 4).map((item) => (
                      <div key={item.category} className="space-y-3">
                        <div className="flex justify-between items-end gap-4">
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 break-words leading-tight">{item.category}</span>
                          <span className="text-lg font-black text-slate-900 flex-shrink-0">{item.count}</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / stats.totalTasks) * 100}%` }}
                            className="h-full bg-cyan-500 shadow-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reschedule Intelligence */}
              <div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-[3rem] shadow-sm min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-8">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-[1.2rem] border border-amber-100 flex-shrink-0">
                      <Repeat className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-[0.3em] text-slate-900">Reschedule Intel</h3>
                      <p className="text-xs font-medium text-slate-400">Temporal discipline analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-center md:text-right">
                      <p className="text-3xl font-black text-slate-900 leading-none">{stats.totalReschedules}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Total Delays</p>
                    </div>
                    <div className="w-px h-10 bg-slate-100 hidden md:block" />
                    <div className="text-center md:text-right">
                      <p className="text-3xl font-black text-slate-900 leading-none">{stats.averageReschedule}x</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Avg per task</p>
                    </div>
                  </div>
                </div>

                {stats.mostRescheduledTask && (
                  <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] relative overflow-hidden group hover:bg-rose-100/50 transition-colors">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-24 h-24 text-rose-600" />
                    </div>
                    <div className="flex items-center gap-3 text-rose-600 mb-4 relative z-10">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">Procrastinator Alert</span>
                    </div>
                    <p className="text-xl font-black text-slate-900 mb-4 break-words whitespace-normal relative z-10 leading-snug max-w-2xl">
                      {stats.mostRescheduledTask.title}
                    </p>
                    <div className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 relative z-10">
                      {stats.mostRescheduledTask.count} Times Delayed
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: High-Level Insights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm transition-all hover:bg-emerald-100/50 min-w-0">
                <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 flex-shrink-0">
                  <Trophy className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Peak Performance</p>
                  <h4 className="text-xl font-black text-slate-900 break-words whitespace-normal leading-tight">{stats.mostProductiveDay}</h4>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm transition-all hover:bg-slate-100/50 min-w-0">
                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg shadow-black/20 flex-shrink-0">
                  <Activity className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">System Health</p>
                  <h4 className="text-xl font-black text-slate-900 break-words whitespace-normal leading-tight">Operations Nominal</h4>
                </div>
              </div>
            </div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
