"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import {
	BookOpen,
	TrendingUp,
	Trophy,
	Wrench,
	ArrowUpRight,
	Layers,
} from "lucide-react";

interface InsightModule {
	title: string;
	category: string;
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
	statusBadge: string;
	actionLabel: string;
}

const INSIGHT_MODULES: InsightModule[] = [
	{
		title: "Blog & Engineering Notes",
		category: "Technical Architecture",
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
		statusBadge: "Deep Technical Reads",
		actionLabel: "Explore Articles",
	},
	{
		title: "Investments & Market Regimes",
		category: "Financial Telemetry",
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
		statusBadge: "Live Telemetry Feed",
		actionLabel: "View Market Telemetry",
	},
	{
		title: "Liverpool FC Matchday Hub",
		category: "Sports Analytics",
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
		statusBadge: "Anfield & Away Intel",
		actionLabel: "Open Matchday Hub",
	},
	{
		title: "Developer & Adventure Utilities",
		category: "Toolkits & Generators",
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
		statusBadge: "20+ Interactive Tools",
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

export default function InsightsView() {
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
							<div className="flex items-center gap-2 mb-2">
								<div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
									<Layers className="w-3.5 h-3.5 text-indigo-600" />
								</div>
								<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
									INTELLIGENCE NEXUS · DOMAIN KNOWLEDGE & TELEMETRY
								</span>
							</div>
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
										{/* Top Row: Squircle Icon + Category Pill + Status Pill */}
										<div className="flex items-center justify-between gap-3 mb-5">
											<div className="flex items-center gap-3">
												<div
													className={`w-12 h-12 rounded-2xl flex items-center justify-center ${module.badgeBg} ${module.badgeBorder} ${module.badgeText} border shrink-0 group-hover:scale-105 transition-transform duration-200`}
												>
													<Icon className="w-6 h-6" />
												</div>
												<div>
													<span
														className={`inline-block px-2.5 py-0.5 rounded-full ${module.badgeBg} ${module.badgeBorder} border text-[10px] font-bold uppercase tracking-wider ${module.badgeText}`}
													>
														{module.category}
													</span>
												</div>
											</div>

											{/* Status chip */}
											<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-full shrink-0">
												{module.statusBadge}
											</span>
										</div>

										{/* Title & Description */}
										<div>
											<h2
												className={`text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight ${module.accentText} transition-colors leading-snug`}
											>
												{module.title}
											</h2>

											<p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
												{module.description}
											</p>
										</div>

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
