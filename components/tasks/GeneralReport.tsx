'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  ClipboardList, 
  TrendingUp, 
  CalendarDays,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { getTaskStats, AnalyticsStats } from '@/lib/actions/analytics';

export default function GeneralReport() {
	const [period, setPeriod] = useState<'week' | 'month'>('week');
	const [stats, setStats] = useState<AnalyticsStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			setLoading(true);
			try {
				const data = await getTaskStats(period);
				setStats(data);
			} catch (error) {
				console.error('Failed to fetch analytics:', error);
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

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="w-8 h-8 text-accent animate-spin" />
			</div>
		);
	}

	if (!stats) return null;

	return (
		<div className="space-y-8 animate-in fade-in duration-700">
			{/* Header & Filter */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-black flex items-center gap-2">
						<BarChart3 className="w-6 h-6 text-accent" />
						Performance Report
					</h2>
					<p className="text-muted-foreground text-sm">Review your productivity trends.</p>
				</div>
				<div className="flex bg-background-secondary p-1 rounded-2xl border border-border/50 w-fit">
					<button
						onClick={() => setPeriod('week')}
						className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
							period === 'week' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
						}`}
					>
						Last 7 Days
					</button>
					<button
						onClick={() => setPeriod('month')}
						className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
							period === 'month' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
						}`}
					>
						Last 30 Days
					</button>
				</div>
			</div>

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
					subtext={stats.comparison !== 0 ? `${stats.comparison > 0 ? '+' : ''}${stats.comparison}%` : undefined}
				/>
				<StatCard 
					title="Efficiency" 
					value={`${stats.completionRate}%`} 
					icon={TrendingUp} 
					colorClass="bg-accent/10 text-accent" 
				/>
				<StatCard 
					title="Active Streak" 
					value={`${stats.streak} Days`} 
					icon={Zap} 
					colorClass="bg-amber-500/10 text-amber-500" 
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Productivity Peak */}
				<div className="lg:col-span-1 glass p-6 rounded-[2.5rem] border border-border/50">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
							<CalendarDays className="w-5 h-5" />
						</div>
						<h3 className="font-black">Productivity Peak</h3>
					</div>
					<div className="text-center py-8">
						<p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter mb-2">Most Active Day</p>
						<h4 className="text-4xl font-black text-purple-600">{stats.mostProductiveDay}</h4>
					</div>
					<div className="mt-6 p-4 bg-background-secondary rounded-2xl text-center">
						<p className="text-xs text-muted-foreground">
							{stats.comparison > 0 
								? `You're killing it! ${stats.comparison}% better than last period.`
								: stats.comparison < 0 
								? `Focus up! You're ${Math.abs(stats.comparison)}% behind last period.`
								: "Consistency is key. Keep maintaining your pace!"}
						</p>
					</div>
				</div>

				{/* Category Distribution */}
				<div className="lg:col-span-2 glass p-6 rounded-[2.5rem] border border-border/50">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl">
							<BarChart3 className="w-5 h-5" />
						</div>
						<h3 className="font-black">Category Focus</h3>
					</div>
					<div className="space-y-4">
						{stats.categoryDistribution.length > 0 ? (
							stats.categoryDistribution.map((item) => (
								<div key={item.category} className="space-y-1.5">
									<div className="flex justify-between text-xs font-bold uppercase">
										<span>{item.category}</span>
										<span className="text-muted-foreground">{item.count} tasks</span>
									</div>
									<div className="h-3 bg-background-secondary rounded-full overflow-hidden">
										<div 
											className="h-full bg-orange-500 transition-all duration-1000 ease-out"
											style={{ width: `${(item.count / stats.totalTasks) * 100}%` }}
										/>
									</div>
								</div>
							))
						) : (
							<div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
								No data available for this period.
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
