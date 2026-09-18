"use client";

import { motion, useReducedMotion } from "framer-motion";
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
	accentColor: string;
	badgeBg: string;
	badgeBorder: string;
	badgeText: string;
	dotColor: string;
	tags: string[];
	highlight: string;
}

const INSIGHT_MODULES: InsightModule[] = [
	{
		title: "Blog & Engineering Notes",
		category: "Technical Architecture",
		href: "/blog",
		description:
			"Deep dives into distributed fintech engines, transactional integrity, state machines, and modern frontend architecture.",
		icon: BookOpen,
		accentColor: "group-hover:text-indigo-600",
		badgeBg: "bg-indigo-50",
		badgeBorder: "border-indigo-100",
		badgeText: "text-indigo-700",
		dotColor: "bg-indigo-500",
		tags: ["Fintech Core", "Distributed Systems", "Technical Essays", "SSG"],
		highlight:
			"System design patterns, high-concurrency ledger design & culture",
	},
	{
		title: "Investments & Market Regimes",
		category: "Financial Telemetry",
		href: "/investment",
		description:
			"Live Fear & Greed market sentiment telemetry, crypto volatility regimes, historical trends, and macro liquidity tracking.",
		icon: TrendingUp,
		accentColor: "group-hover:text-emerald-600",
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
	},
	{
		title: "Liverpool FC Matchday Hub",
		category: "Sports Analytics",
		href: "/liverpool",
		description:
			"Complete match schedule, live kickoff countdown, official matchday reports, final scores, and calendar integration.",
		icon: Trophy,
		accentColor: "group-hover:text-rose-600",
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
	},
	{
		title: "Developer & Adventure Utilities",
		category: "Toolkits & Generators",
		href: "/utils",
		description:
			"High-precision developer toolkits including JWT Inspector, Stock Explorer, Mock API Engine, Schema Forge, and Interval Timers.",
		icon: Wrench,
		accentColor: "group-hover:text-cyan-600",
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
	},
];

export default function InsightsView() {
	const reduceMotion = useReducedMotion();

	const summaryStats = [
		{
			label: "Engineering",
			value: "Technical Essays",
			sublabel: "Fintech & Architecture",
			icon: BookOpen,
			color: "text-indigo-600 bg-indigo-50 border-indigo-100",
		},
		{
			label: "Financial",
			value: "Fear & Greed",
			sublabel: "Live Market Sentiment",
			icon: TrendingUp,
			color: "text-emerald-600 bg-emerald-50 border-emerald-100",
		},
		{
			label: "Matchday Hub",
			value: "Liverpool FC",
			sublabel: "Fixtures & Results",
			icon: Trophy,
			color: "text-rose-600 bg-rose-50 border-rose-100",
		},
		{
			label: "Utilities",
			value: "20+ Toolkits",
			sublabel: "7 Developer Categories",
			icon: Wrench,
			color: "text-cyan-600 bg-cyan-50 border-cyan-100",
		},
	];

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-24 sm:pt-32 pb-36 sm:pb-44 px-4 sm:px-6 lg:px-8">
			<div className="max-w-5xl mx-auto space-y-10 sm:space-y-14">
				{/* ═══════════════════════════════════════
				    HERO HEADER: Centered, Minimalist, Classy
				═══════════════════════════════════════ */}
				<motion.header
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center max-w-3xl mx-auto space-y-4 pt-2 sm:pt-4"
				>
					<div className="flex items-center justify-center">
						<span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200/80 text-[10px] font-bold text-slate-700 uppercase tracking-wider shadow-xs">
							<Layers className="w-3.5 h-3.5 text-indigo-600" />
							Intelligence Nexus
						</span>
					</div>

					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
						Curated
						<br />
						<span>insights & intelligence</span>
					</h1>

					<p className="text-slate-500 text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
						A unified nexus of fintech engineering essays, market sentiment
						telemetry, matchday analytics, and precision developer toolkits.
					</p>
				</motion.header>

				{/* ═══════════════════════════════════════
				    TELEMETRY STATS ROW: 4 Core Modules Strip
				═══════════════════════════════════════ */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4"
				>
					{summaryStats.map((stat) => (
						<div
							key={stat.label}
							className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3"
						>
							<div
								className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${stat.color}`}
							>
								<stat.icon className="w-4 h-4" />
							</div>
							<div className="min-w-0">
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
									{stat.label}
								</p>
								<p className="text-sm sm:text-base font-bold text-slate-900 truncate">
									{stat.value}
								</p>
								<p className="text-[10px] text-slate-500 font-normal truncate">
									{stat.sublabel}
								</p>
							</div>
						</div>
					))}
				</motion.div>

				{/* ═══════════════════════════════════════
				    MODULE CARDS GRID (2x2 Balanced)
				═══════════════════════════════════════ */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
					{INSIGHT_MODULES.map((module, i) => {
						const Icon = module.icon;

						return (
							<motion.div
								key={module.href}
								initial={reduceMotion ? false : { opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
								whileHover={reduceMotion ? undefined : { y: -4 }}
							>
								<Link
									href={module.href}
									className="group block relative p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200/80 hover:border-slate-300 transition-[border-color,box-shadow] duration-300 shadow-xs hover:shadow-md overflow-hidden !no-underline h-full flex flex-col justify-between"
								>
									{/* Top Row: Squircle Icon + Category Pill + Arrow Circle */}
									<div>
										<div className="flex items-center justify-between gap-4">
											<div
												className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl ${module.badgeBg} ${module.badgeBorder} ${module.badgeText} border shadow-xs group-hover:scale-105 transition-transform duration-300`}
											>
												<Icon className="w-6 h-6 sm:w-7 sm:h-7" />
											</div>

											<div className="flex items-center gap-2">
												<span
													className={`px-3 py-1 rounded-full ${module.badgeBg} ${module.badgeBorder} border text-[10px] font-bold uppercase tracking-wider ${module.badgeText}`}
												>
													{module.category}
												</span>
												<div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/60 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
													<ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
												</div>
											</div>
										</div>

										{/* Title & Description */}
										<div className="mt-6 mb-4">
											<h2
												className={`text-xl sm:text-2xl font-bold text-slate-900 tracking-tight ${module.accentColor} transition-colors leading-snug`}
											>
												{module.title}
											</h2>

											<p className="mt-2 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
												{module.description}
											</p>
										</div>

										{/* Subtle Highlight Callout */}
										<div className="text-xs text-slate-600 bg-slate-50/80 border border-slate-200/60 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 mb-5">
											<span
												className={`w-1.5 h-1.5 rounded-full ${module.dotColor} shrink-0`}
											/>
											<span className="truncate">{module.highlight}</span>
										</div>

										{/* Topic Tags */}
										<div className="flex flex-wrap gap-1.5">
											{module.tags.map((tag) => (
												<span
													key={tag}
													className="px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-600 text-[11px] font-medium"
												>
													{tag}
												</span>
											))}
										</div>
									</div>

									{/* Bottom Action: Learn More ↗ Style */}
									<div className="pt-6 mt-6 border-t border-slate-100/80 flex items-center justify-between">
										<span
											className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 ${module.accentColor} transition-colors`}
										>
											<span>Explore Module</span>
											<ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
										</span>
									</div>
								</Link>
							</motion.div>
						);
					})}
				</div>
			</div>
		</main>
	);
}
