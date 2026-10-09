"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import {
	BookOpen,
	TrendingUp,
	Trophy,
	Wrench,
	ArrowUpRight,
} from "lucide-react";

interface InsightModule {
	title: string;
	href: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	accentHover: string;
	accentText: string;
	badgeBg: string;
	badgeBorder: string;
	badgeText: string;
	dotColor: string;
	tags: string[];
	highlight: string;
	actionLabel: string;
}

const INSIGHT_MODULES: InsightModule[] = [
	{
		title: "Blog & Engineering Notes",
		href: "/blog",
		description:
			"Deep dives into distributed fintech engines, transactional integrity, state machines, and modern frontend architecture.",
		icon: BookOpen,
		accentHover:
			"group-hover:border-indigo-200 group-hover:shadow-indigo-500/5",
		accentText: "group-hover:text-indigo-600",
		badgeBg: "bg-indigo-50",
		badgeBorder: "border-indigo-100",
		badgeText: "text-indigo-700",
		dotColor: "bg-indigo-500",
		tags: ["Fintech Core", "Distributed Systems", "Technical Essays", "SSG"],
		highlight:
			"System design patterns, high-concurrency ledger design & culture",
		actionLabel: "Explore Articles",
	},
	{
		title: "Investments & Market Regimes",
		href: "/investment",
		description:
			"Live Fear & Greed market sentiment telemetry, crypto volatility regimes, historical trends, and macro liquidity tracking.",
		icon: TrendingUp,
		accentHover:
			"group-hover:border-emerald-200 group-hover:shadow-emerald-500/5",
		accentText: "group-hover:text-emerald-600",
		badgeBg: "bg-emerald-50",
		badgeBorder: "border-emerald-100",
		badgeText: "text-emerald-700",
		dotColor: "bg-emerald-500",
		tags: [
			"Fear & Greed Index",
			"Crypto Sentiment",
			"Market Regimes",
			"Telemetry",
		],
		highlight: "Real-time market sentiment & historical regime transitions",
		actionLabel: "View Market Telemetry",
	},
	{
		title: "Liverpool FC Matchday Hub",
		href: "/liverpool",
		description:
			"Complete match schedule, live kickoff countdown, official matchday reports, final scores, and calendar integration.",
		icon: Trophy,
		accentHover: "group-hover:border-rose-200 group-hover:shadow-rose-500/5",
		accentText: "group-hover:text-rose-600",
		badgeBg: "bg-rose-50",
		badgeBorder: "border-rose-100",
		badgeText: "text-rose-700",
		dotColor: "bg-rose-500",
		tags: [
			"Live Countdown",
			"Matchday Reports",
			"Fixtures & Results",
			"Calendar Sync",
		],
		highlight: "Kickoff timers, match recaps & Google Calendar export",
		actionLabel: "Open Matchday Hub",
	},
	{
		title: "Developer & Adventure Utilities",
		href: "/utils",
		description:
			"High-precision developer toolkits including JWT Inspector, Stock Explorer, Mock API Engine, Schema Forge, and Interval Timers.",
		icon: Wrench,
		accentHover: "group-hover:border-cyan-200 group-hover:shadow-cyan-500/5",
		accentText: "group-hover:text-cyan-600",
		badgeBg: "bg-cyan-50",
		badgeBorder: "border-cyan-100",
		badgeText: "text-cyan-700",
		dotColor: "bg-cyan-500",
		tags: [
			"JWT Inspector",
			"Stock Explorer",
			"Mock API Engine",
			"Schema Forge",
		],
		highlight:
			"20+ developer engines, formatters, converters & analyzers across 7 categories",
		actionLabel: "Launch Utility Suite",
	},
];

const cardVariants: Variants = {
	hidden: { opacity: 0, y: 14 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: "spring", stiffness: 300, damping: 24 },
	},
};

export function InsightsSkeleton() {
	return (
		<main
			className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden"
			role="status"
			aria-live="polite"
			aria-label="Loading insights"
		>
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10 space-y-8 sm:space-y-10">
				{/* ── Floating Card Header Skeleton ── */}
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
						<div className="space-y-2">
							<div className="h-8 sm:h-9 w-60 sm:w-72 bg-slate-200 rounded-xl animate-pulse" />
							<div className="h-4 w-full max-w-xl bg-slate-200 rounded animate-pulse" />
						</div>

						{/* Quick summary strip */}
						<div className="flex items-center gap-4 sm:gap-5 shrink-0">
							<div className="flex flex-col items-center gap-1.5">
								<div className="h-6 w-8 bg-slate-200 rounded animate-pulse" />
								<div className="h-2.5 w-10 bg-slate-200 rounded animate-pulse" />
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="flex flex-col items-center gap-1.5">
								<div className="h-6 w-10 bg-slate-200 rounded animate-pulse" />
								<div className="h-2.5 w-12 bg-slate-200 rounded animate-pulse" />
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="flex flex-col items-center gap-1.5">
								<div className="h-6 w-10 bg-slate-200 rounded animate-pulse" />
								<div className="h-2.5 w-14 bg-slate-200 rounded animate-pulse" />
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="flex flex-col items-center gap-1.5">
								<div className="h-6 w-10 bg-slate-200 rounded animate-pulse" />
								<div className="h-2.5 w-14 bg-slate-200 rounded animate-pulse" />
							</div>
						</div>
					</div>
				</div>

				{/* ── Telemetry Summary Strip (4-Col Grid) ── */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5"
						>
							<div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse shrink-0" />
							<div className="min-w-0 space-y-1.5 flex-1">
								<div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
								<div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
								<div className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
							</div>
						</div>
					))}
				</div>

				{/* ── 2x2 Balanced Module Cards Grid ── */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between min-h-[300px] animate-pulse"
						>
							<div>
								{/* Header: Icon + Title */}
								<div className="flex items-center gap-3.5 mb-4">
									<div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-200 shrink-0" />
									<div className="h-6 sm:h-7 w-48 sm:w-60 bg-slate-200 rounded-lg" />
								</div>

								{/* Description */}
								<div className="space-y-2 mb-4">
									<div className="h-3.5 w-full bg-slate-200 rounded" />
									<div className="h-3.5 w-4/5 bg-slate-200 rounded" />
								</div>

								{/* Subtle Highlight Callout */}
								<div className="h-9 rounded-xl bg-slate-50 border border-slate-200/70 mb-4" />

								{/* Topic Tags */}
								<div className="flex flex-wrap gap-1.5">
									{[1, 2, 3, 4].map((tag) => (
										<div
											key={tag}
											className="h-6 w-20 rounded-lg bg-slate-100 border border-slate-200/60"
										/>
									))}
								</div>
							</div>

							{/* Bottom Action Strip */}
							<div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between">
								<div className="h-4 w-28 bg-slate-200 rounded" />
								<div className="w-8 h-8 rounded-xl bg-slate-100" />
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}

export default function InsightsView({
	isLoading = false,
}: {
	isLoading?: boolean;
} = {}) {
	if (isLoading) {
		return <InsightsSkeleton />;
	}

	const reduceMotion = useReducedMotion();

	const summaryStats = [
		{
			label: "Engineering",
			value: "Technical Essays",
			sublabel: "Fintech & Architecture",
			icon: BookOpen,
			badgeColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
		},
		{
			label: "Financial",
			value: "Fear & Greed",
			sublabel: "Live Market Sentiment",
			icon: TrendingUp,
			badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
		},
		{
			label: "Matchday Hub",
			value: "Liverpool FC",
			sublabel: "Fixtures & Countdown",
			icon: Trophy,
			badgeColor: "text-rose-600 bg-rose-50 border-rose-100",
		},
		{
			label: "Utilities",
			value: "20+ Toolkits",
			sublabel: "7 Functional Categories",
			icon: Wrench,
			badgeColor: "text-cyan-600 bg-cyan-50 border-cyan-100",
		},
	];

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10 space-y-8 sm:space-y-10">
				{/* ── Floating Card Header Standard ── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs"
				>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
						<div>
							<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
								Insights & Intelligence
							</h1>
							<p className="text-sm text-slate-500 font-medium mt-1 max-w-xl">
								Fintech engineering essays, live market sentiment telemetry,
								matchday analytics, and precision developer toolkits.
							</p>
						</div>

						{/* Quick summary strip */}
						<div className="flex items-center gap-4 sm:gap-5 shrink-0">
							<div className="text-center">
								<p className="text-xl font-extrabold text-slate-900 tabular-nums">
									4
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Hubs
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-indigo-600 tabular-nums">
									10+
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Essays
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-cyan-600 tabular-nums">
									20+
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Toolkits
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<div className="flex items-center justify-center gap-1.5">
									<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
									<p className="text-sm font-extrabold text-slate-900">Live</p>
								</div>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Telemetry
								</p>
							</div>
						</div>
					</div>
				</motion.div>

				{/* ── Telemetry Summary Strip (4-Col Grid) ── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
					className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
				>
					{summaryStats.map((stat) => (
						<div
							key={stat.label}
							className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5"
						>
							<div
								className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${stat.badgeColor}`}
							>
								<stat.icon className="w-5 h-5" />
							</div>
							<div className="min-w-0">
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">
									{stat.label}
								</p>
								<p className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
									{stat.value}
								</p>
								<p className="text-[11px] text-slate-500 font-medium truncate">
									{stat.sublabel}
								</p>
							</div>
						</div>
					))}
				</motion.div>

				{/* ── 2x2 Balanced Module Cards Grid ── */}
				<motion.div
					className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7"
					initial={reduceMotion ? false : "hidden"}
					animate="visible"
					variants={{
						visible: { transition: { staggerChildren: 0.06 } },
					}}
				>
					{INSIGHT_MODULES.map((module) => {
						const Icon = module.icon;

						return (
							<motion.div
								key={module.href}
								variants={cardVariants}
								whileHover={reduceMotion ? undefined : { y: -3 }}
								transition={{ type: "spring", stiffness: 300, damping: 20 }}
								className="h-full"
							>
								<Link
									href={module.href}
									className={`group block h-full bg-white border border-slate-200/80 ${module.accentHover} rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-[border-color,box-shadow] duration-200 !no-underline flex flex-col justify-between`}
								>
									<div>
										{/* Header: Icon direct beside Title */}
										<div className="flex items-center gap-3.5 mb-2.5">
											<div
												className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${module.badgeBg} ${module.badgeBorder} ${module.badgeText} border shrink-0 group-hover:scale-105 transition-transform duration-200`}
											>
												<Icon className="w-5 h-5 sm:w-6 sm:h-6" />
											</div>
											<h2
												className={`text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight ${module.accentText} transition-colors leading-snug`}
											>
												{module.title}
											</h2>
										</div>

										{/* Description */}
										<p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
											{module.description}
										</p>

										{/* Subtle Highlight Callout */}
										<div className="mt-4 text-xs text-slate-600 bg-slate-50 border border-slate-200/70 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
											<span
												className={`w-1.5 h-1.5 rounded-full ${module.dotColor} shrink-0`}
											/>
											<span className="truncate font-medium">
												{module.highlight}
											</span>
										</div>

										{/* Topic Tags */}
										<div className="mt-4 flex flex-wrap gap-1.5">
											{module.tags.map((tag) => (
												<span
													key={tag}
													className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600 text-[11px] font-medium"
												>
													{tag}
												</span>
											))}
										</div>
									</div>

									{/* Bottom Action Strip: Single clear link affordance */}
									<div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between">
										<span
											className={`text-xs sm:text-sm font-bold text-slate-900 ${module.accentText} transition-colors flex items-center gap-1`}
										>
											{module.actionLabel}
										</span>
										<div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 flex items-center justify-center transition-[colors,transform]">
											<ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
										</div>
									</div>
								</Link>
							</motion.div>
						);
					})}
				</motion.div>
			</div>
		</main>
	);
}
