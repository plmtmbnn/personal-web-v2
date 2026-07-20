"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import {
	getWeeklyReviewStats,
	type WeeklyReviewStats,
} from "../../actions/analytics";
import {
	Trophy,
	Clock,
	AlertTriangle,
	ArrowUpRight,
	Award,
	CheckCircle2,
	Zap,
	Target,
	Flame,
	TrendingUp,
	TrendingDown,
	CalendarDays,
	Star,
	BarChart2,
	Activity,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ─── Mini circular progress ───────────────────────────────────────────────────
function RingProgress({
	value,
	size = 80,
	stroke = 8,
	color = "#10b981",
}: {
	value: number;
	size?: number;
	stroke?: number;
	color?: string;
}) {
	const reduceMotion = useReducedMotion();
	const r = (size - stroke) / 2;
	const circ = 2 * Math.PI * r;
	const offset = circ - (value / 100) * circ;

	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
			<title>Progress Ring</title>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={r}
				fill="none"
				stroke="rgba(0,0,0,0.06)"
				strokeWidth={stroke}
			/>
			<motion.circle
				cx={size / 2}
				cy={size / 2}
				r={r}
				fill="none"
				stroke={color}
				strokeWidth={stroke}
				strokeLinecap="round"
				strokeDasharray={circ}
				initial={reduceMotion ? false : { strokeDashoffset: circ }}
				animate={{ strokeDashoffset: offset }}
				transition={{ duration: 1.4, ease: "easeOut" }}
				transform={`rotate(-90 ${size / 2} ${size / 2})`}
			/>
		</svg>
	);
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
	const [count, setCount] = useState(0);
	useEffect(() => {
		let start = 0;
		const step = Math.max(1, Math.ceil(target / 40));
		const timer = setInterval(() => {
			start += step;
			if (start >= target) {
				setCount(target);
				clearInterval(timer);
			} else {
				setCount(start);
			}
		}, 25);
		return () => clearInterval(timer);
	}, [target]);
	return (
		<span>
			{count}
			{suffix}
		</span>
	);
}

// ─── Grade config ─────────────────────────────────────────────────────────────
const GRADE_CONFIG = {
	"A+": {
		bg: "bg-emerald-500",
		text: "!text-emerald-400",
		badge: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
		ring: "#10b981",
		label: "Elite Execution",
	},
	A: {
		bg: "bg-teal-500",
		text: "!text-teal-400",
		badge: "bg-teal-400/20 text-teal-300 border-teal-400/30",
		ring: "#14b8a6",
		label: "High Performer",
	},
	B: {
		bg: "bg-blue-500",
		text: "!text-blue-400",
		badge: "bg-blue-400/20 text-blue-300 border-blue-400/30",
		ring: "#3b82f6",
		label: "Solid Progress",
	},
	C: {
		bg: "bg-amber-500",
		text: "!text-amber-400",
		badge: "bg-amber-400/20 text-amber-300 border-amber-400/30",
		ring: "#f59e0b",
		label: "Moderate Run",
	},
	D: {
		bg: "bg-rose-500",
		text: "!text-rose-400",
		badge: "bg-rose-400/20 text-rose-300 border-rose-400/30",
		ring: "#f43f5e",
		label: "Needs Recovery",
	},
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatMinutes = (mins: number) => {
	if (!mins || mins === 0) return "—";
	if (mins < 60) return `${mins}m`;
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const PRIORITY_CFG: Record<
	string,
	{ label: string; color: string; bg: string; border: string }
> = {
	HIGH: {
		label: "HIGH",
		color: "text-rose-600",
		bg: "bg-rose-50",
		border: "border-rose-200",
	},
	MEDIUM: {
		label: "MED",
		color: "text-amber-600",
		bg: "bg-amber-50",
		border: "border-amber-200",
	},
	LOW: {
		label: "LOW",
		color: "text-slate-500",
		bg: "bg-slate-100",
		border: "border-slate-200",
	},
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function WeeklyReview() {
	const [stats, setStats] = useState<WeeklyReviewStats | null>(null);
	const [isPending, startTransition] = useTransition();
	const reduceMotion = useReducedMotion();

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

	const grade = useMemo(
		() => (stats ? GRADE_CONFIG[stats.performanceGrade] : null),
		[stats],
	);

	if (isPending || !stats || !grade) {
		return (
			<div className="space-y-6 sm:space-y-8 animate-pulse pointer-events-none select-none">
				{/* Hero Banner Skeleton */}
				<div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 sm:p-10 h-64 sm:h-72 flex flex-col justify-between">
					<div className="flex justify-between items-start gap-4">
						<div className="space-y-4">
							<div className="h-5 w-40 bg-slate-800 rounded-full" />
							<div className="space-y-2">
								<div className="h-8 w-64 bg-slate-800 rounded-lg" />
								<div className="h-8 w-48 bg-slate-800 rounded-lg" />
							</div>
						</div>
						<div className="w-20 h-20 bg-slate-800 rounded-3xl" />
					</div>
					<div className="flex gap-2">
						<div className="h-5 w-24 bg-slate-800 rounded-full" />
						<div className="h-5 w-32 bg-slate-800 rounded-full" />
					</div>
				</div>

				{/* Metrics Row Skeleton */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col gap-4 shadow-sm"
						>
							<div className="w-10 h-10 bg-slate-100 rounded-xl" />
							<div className="space-y-2">
								<div className="h-3 w-16 bg-slate-100 rounded-full" />
								<div className="h-6 w-24 bg-slate-200 rounded-lg" />
								<div className="h-3 w-28 bg-slate-100 rounded-full" />
							</div>
							<div className="h-1.5 bg-slate-100 rounded-full" />
						</div>
					))}
				</div>

				{/* Main Content Skeleton */}
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
					<div className="lg:col-span-3 bg-white border border-slate-200 rounded-[2rem] p-7 shadow-sm space-y-6">
						<div className="flex justify-between items-center pb-4 border-b border-slate-50">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 bg-slate-100 rounded-xl" />
								<div className="space-y-1.5">
									<div className="h-4 w-28 bg-slate-200 rounded-full" />
									<div className="h-3 w-36 bg-slate-100 rounded-full" />
								</div>
							</div>
							<div className="h-5 w-16 bg-slate-100 rounded-lg" />
						</div>
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={i}
									className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100"
								>
									<div className="w-8 h-8 bg-slate-200 rounded-xl" />
									<div className="flex-1 space-y-2">
										<div className="h-3 w-3/4 bg-slate-200 rounded-full" />
										<div className="h-2 w-1/3 bg-slate-100 rounded-full" />
									</div>
									<div className="w-12 h-4 bg-slate-200 rounded-lg" />
									<div className="w-4 h-4 bg-slate-200 rounded-full" />
								</div>
							))}
						</div>
					</div>

					<div className="lg:col-span-2 flex flex-col gap-6">
						<div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 bg-slate-100 rounded-xl" />
								<div className="space-y-1">
									<div className="h-3 w-20 bg-slate-200 rounded-full" />
									<div className="h-2 w-24 bg-slate-100 rounded-full" />
								</div>
							</div>
							<div className="h-32 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
								<div className="space-y-2 text-center w-full px-8">
									<div className="w-10 h-10 bg-slate-200 rounded-xl mx-auto" />
									<div className="h-4 w-24 bg-slate-200 rounded-full mx-auto" />
									<div className="h-3 w-16 bg-slate-100 rounded-full mx-auto" />
								</div>
							</div>
						</div>

						<div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-5 flex-1">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 bg-slate-100 rounded-xl" />
								<div className="h-4 w-24 bg-slate-200 rounded-full" />
							</div>
							<div className="space-y-3.5">
								{Array.from({ length: 4 }).map((_, i) => (
									<div key={i} className="flex justify-between items-center">
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 bg-slate-100 rounded-lg" />
											<div className="h-3 w-16 bg-slate-200 rounded-full" />
										</div>
										<div className="h-4 w-6 bg-slate-200 rounded-lg" />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const completionRatio = `${stats.completedCount}/${stats.completedCount + stats.carriedForwardCount}`;
	const efficiency =
		stats.completedCount + stats.createdCount > 0
			? Math.round(
					(stats.completedCount /
						(stats.completedCount + stats.carriedForwardCount || 1)) *
						100,
				)
			: 0;

	return (
		<AnimatePresence>
			<motion.div
				initial={reduceMotion ? false : { opacity: 0 }}
				animate={{ opacity: 1 }}
				className="space-y-6 sm:space-y-8"
			>
				{/* ── Hero Banner ──────────────────────────────────────────────── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-slate-800"
				>
					{/* Decorative grid lines */}
					<div
						className="absolute inset-0 opacity-[0.03] pointer-events-none"
						style={{
							backgroundImage:
								"linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
							backgroundSize: "40px 40px",
						}}
					/>

					<div className="relative z-10 p-8 sm:p-10">
						<div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
							{/* Left: Title & context */}
							<div className="flex-1 space-y-4">
								<div className="flex items-center gap-2">
									<span
										className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${grade.badge}`}
									>
										<CalendarDays className="w-3 h-3" />
										Weekly Performance Report
									</span>
								</div>

								<div>
									<h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
										Weekly
										<br />
										<span className={`${grade.text}`}>Review</span>
									</h2>
								</div>

								<p className="!text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
									{stats.feedbackMessage}
								</p>

								{/* Quick tag pills */}
								<div className="flex flex-wrap gap-2 pt-1">
									<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-slate-300 uppercase tracking-widest">
										<Target className="w-2.5 h-2.5" />
										{stats.completionRate}% Completion Rate
									</span>
									<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-slate-300 uppercase tracking-widest">
										<Flame className="w-2.5 h-2.5 text-orange-400" />
										{stats.activeCategory} Most Active
									</span>
								</div>
							</div>

							{/* Center: Big Ring + Grade */}
							<div className="flex items-center gap-8 lg:gap-10">
								<div className="relative flex-shrink-0">
									<RingProgress
										value={stats.completionRate}
										size={120}
										stroke={10}
										color={grade.ring}
									/>
									<div className="absolute inset-0 flex flex-col items-center justify-center">
										<span className="text-2xl font-black text-white leading-none">
											<CountUp target={stats.completionRate} suffix="%" />
										</span>
										<span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
											done
										</span>
									</div>
								</div>

								{/* Grade box */}
								<div className="text-center">
									<div
										className={`w-20 h-20 rounded-3xl flex items-center justify-center text-5xl font-black border-2 ${grade.badge} shadow-xl`}
									>
										{stats.performanceGrade}
									</div>
									<p
										className={`text-[9px] font-black uppercase tracking-widest mt-2 ${grade.text}`}
									>
										{grade.label}
									</p>
								</div>
							</div>

							{/* Right: Key numbers column */}
							<div className="flex flex-row lg:flex-col gap-4 lg:gap-5 flex-shrink-0">
								<div className="text-center lg:text-right">
									<p className="text-[9px] font-black !text-white uppercase tracking-widest">
										Tasks Completed
									</p>
									<p className="text-2xl font-black !text-white mt-0.5">
										<CountUp target={stats.completedCount} />
									</p>
								</div>
								<div className="w-px lg:w-full h-full lg:h-px bg-white/5" />
								<div className="text-center lg:text-right">
									<p className="text-[9px] font-black !text-white uppercase tracking-widest">
										Effort Neutralized
									</p>
									<p className="text-2xl font-black !text-white mt-0.5">
										{formatMinutes(stats.effortNeutralized)}
									</p>
								</div>
							</div>
						</div>
					</div>
				</motion.div>

				{/* ── Metrics Row ───────────────────────────────────────────────── */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{[
						{
							icon: CheckCircle2,
							label: "Objectives Met",
							value: `${stats.completedCount}`,
							sub: `of ${completionRatio} tasks closed`,
							accent: "bg-emerald-50 text-emerald-600",
							border: "border-emerald-100",
							bar: efficiency,
							barColor: "bg-emerald-400",
						},
						{
							icon: Clock,
							label: "Focus Time",
							value: formatMinutes(stats.effortNeutralized),
							sub: `Estimated work cleared`,
							accent: "bg-violet-50 text-violet-600",
							border: "border-violet-100",
							bar: Math.min(
								100,
								Math.round((stats.effortNeutralized / 480) * 100),
							),
							barColor: "bg-violet-400",
						},
						{
							icon: AlertTriangle,
							label: "Reschedules",
							value: `${stats.totalDelays}`,
							sub: "Due date shifts",
							accent:
								stats.totalDelays > 3
									? "bg-rose-50 text-rose-600"
									: "bg-amber-50 text-amber-600",
							border:
								stats.totalDelays > 3 ? "border-rose-100" : "border-amber-100",
							bar: Math.min(100, stats.totalDelays * 10),
							barColor: stats.totalDelays > 3 ? "bg-rose-400" : "bg-amber-400",
						},
						{
							icon: ArrowUpRight,
							label: "Carried Forward",
							value: `${stats.carriedForwardCount}`,
							sub: "Rolling into next week",
							accent:
								stats.carriedForwardCount > 0
									? "bg-rose-50 text-rose-600"
									: "bg-slate-50 text-slate-500",
							border:
								stats.carriedForwardCount > 0
									? "border-rose-100"
									: "border-slate-100",
							bar: Math.min(
								100,
								Math.round(
									(stats.carriedForwardCount /
										(stats.completedCount + stats.carriedForwardCount || 1)) *
										100,
								),
							),
							barColor:
								stats.carriedForwardCount > 0 ? "bg-rose-400" : "bg-slate-300",
						},
					].map((item, idx) => (
						<motion.div
							key={item.label}
							initial={reduceMotion ? false : { opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.05 * idx }}
							className={`bg-white border ${item.border} rounded-3xl p-5 shadow-sm flex flex-col gap-4`}
						>
							<div className="flex items-start justify-between">
								<div className={`p-2.5 rounded-xl ${item.accent}`}>
									<item.icon className="w-5 h-5" />
								</div>
							</div>
							<div>
								<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
									{item.label}
								</p>
								<h4 className="text-2xl font-black text-slate-900 mt-0.5 leading-none">
									{item.value}
								</h4>
								<p className="text-[9px] text-slate-400 font-medium mt-1">
									{item.sub}
								</p>
							</div>
							{/* Mini progress bar */}
							<div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
								<motion.div
									initial={reduceMotion ? false : { width: 0 }}
									animate={{ width: `${item.bar}%` }}
									transition={{ duration: 1, delay: 0.2 + 0.05 * idx }}
									className={`h-full ${item.barColor} rounded-full`}
								/>
							</div>
						</motion.div>
					))}
				</div>

				{/* ── Main Content ──────────────────────────────────────────────── */}
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
					{/* Left: Top Wins (wider) */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="lg:col-span-3 bg-white border border-slate-200 rounded-[2rem] p-7 shadow-sm space-y-5"
					>
						<div className="flex items-center justify-between border-b border-slate-50 pb-4">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
									<Trophy className="w-5 h-5" />
								</div>
								<div>
									<h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
										Major Wins
									</h3>
									<p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
										Top completed objectives this week
									</p>
								</div>
							</div>
							<span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-wider">
								{stats.topWins.length} / top picks
							</span>
						</div>

						{stats.topWins.length === 0 ? (
							<div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-300">
								<Star className="w-8 h-8" />
								<p className="text-xs font-bold uppercase tracking-widest">
									Complete tasks to see your wins here!
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{stats.topWins.map((win, idx) => {
									const pCfg = PRIORITY_CFG[win.priority] || PRIORITY_CFG.LOW;
									return (
										<motion.div
											key={win.id}
											initial={reduceMotion ? false : { opacity: 0, x: -12 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.25 + idx * 0.1 }}
											className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all group"
										>
											{/* Rank badge */}
											<div
												className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
													idx === 0
														? "bg-amber-400 text-white shadow-lg shadow-amber-400/30"
														: idx === 1
															? "bg-slate-300 text-slate-700"
															: "bg-slate-200 text-slate-500"
												}`}
											>
												{idx + 1}
											</div>

											{/* Task info */}
											<div className="flex-1 min-w-0">
												<p className="text-xs font-black text-slate-800 truncate group-hover:text-slate-900">
													{win.title}
												</p>
												<p className="text-[9px] text-slate-400 font-medium mt-0.5">
													{formatMinutes(win.estimated_minutes)} estimated
													effort
												</p>
											</div>

											{/* Priority badge */}
											<span
												className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border flex-shrink-0 ${pCfg.bg} ${pCfg.color} ${pCfg.border}`}
											>
												{pCfg.label}
											</span>

											{/* Done indicator */}
											<CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
										</motion.div>
									);
								})}
							</div>
						)}
					</motion.div>

					{/* Right: Side cards stack */}
					<div className="lg:col-span-2 flex flex-col gap-6">
						{/* Domain Focus */}
						<motion.div
							initial={reduceMotion ? false : { opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.25 }}
							className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-4"
						>
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center">
									<Zap className="w-5 h-5" />
								</div>
								<div>
									<h3 className="text-xs font-black uppercase tracking-widest text-slate-900">
										Domain Focus
									</h3>
									<p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
										Most active category
									</p>
								</div>
							</div>

							<div className="p-5 rounded-2xl bg-violet-50 border border-violet-100 text-center">
								<div className="w-12 h-12 rounded-2xl bg-violet-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-violet-500/25">
									<Activity className="w-6 h-6" />
								</div>
								<h4 className="text-lg font-black text-slate-900 mt-3">
									{stats.activeCategory}
								</h4>
								<p className="text-[9px] text-violet-500 font-black uppercase tracking-widest mt-1">
									Highest engagement
								</p>
							</div>
						</motion.div>

						{/* Sprint Audit */}
						<motion.div
							initial={reduceMotion ? false : { opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="flex-1 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-5"
						>
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
									<BarChart2 className="w-5 h-5" />
								</div>
								<h3 className="text-xs font-black uppercase tracking-widest text-slate-900">
									Sprint Audit
								</h3>
							</div>

							<div className="space-y-3">
								{[
									{
										label: "Created",
										value: stats.createdCount,
										icon: TrendingUp,
										color: "text-blue-500",
										bg: "bg-blue-50",
									},
									{
										label: "Completed",
										value: stats.completedCount,
										icon: CheckCircle2,
										color: "text-emerald-500",
										bg: "bg-emerald-50",
									},
									{
										label: "Delayed",
										value: stats.totalDelays,
										icon: TrendingDown,
										color:
											stats.totalDelays > 3
												? "text-rose-500"
												: "text-amber-500",
										bg: stats.totalDelays > 3 ? "bg-rose-50" : "bg-amber-50",
									},
									{
										label: "Carried Fwd",
										value: stats.carriedForwardCount,
										icon: ArrowUpRight,
										color: "text-slate-500",
										bg: "bg-slate-50",
									},
								].map((row) => (
									<div
										key={row.label}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											<div
												className={`w-6 h-6 rounded-lg ${row.bg} flex items-center justify-center`}
											>
												<row.icon className={`w-3.5 h-3.5 ${row.color}`} />
											</div>
											<span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
												{row.label}
											</span>
										</div>
										<span className="text-sm font-black text-slate-900">
											{row.value}
										</span>
									</div>
								))}
							</div>

							{/* Overall health bar */}
							<div className="pt-2 border-t border-slate-50">
								<div className="flex items-center justify-between mb-2">
									<span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
										Sprint Health
									</span>
									<span
										className={`text-[9px] font-black uppercase tracking-widest ${grade.text}`}
									>
										{grade.label}
									</span>
								</div>
								<div className="h-2 bg-slate-100 rounded-full overflow-hidden">
									<motion.div
										initial={reduceMotion ? false : { width: 0 }}
										animate={{ width: `${stats.completionRate}%` }}
										transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
										className={`h-full rounded-full ${grade.bg}`}
									/>
								</div>
							</div>
						</motion.div>
					</div>
				</div>

				{/* ── Feedback Banner ───────────────────────────────────────────── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className={`relative overflow-hidden rounded-[2rem] p-7 border ${grade.bg} shadow-lg`}
				>
					<div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
						<Award className="w-32 h-32 text-white" />
					</div>
					<div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
						<div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
							<Award className="w-6 h-6 text-white" />
						</div>
						<div className="flex-1">
							<p className="text-[9px] font-black text-white/60 uppercase tracking-[0.25em]">
								Commander's Assessment
							</p>
							<p className="text-base font-black text-white mt-1 leading-snug">
								{stats.feedbackMessage}
							</p>
						</div>
						<div className="text-right flex-shrink-0 hidden sm:block">
							<p className="text-[9px] font-black text-white/60 uppercase tracking-widest">
								Grade
							</p>
							<p className="text-4xl font-black text-white mt-0.5">
								{stats.performanceGrade}
							</p>
						</div>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
