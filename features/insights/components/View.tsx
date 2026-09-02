"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
	BookOpen,
	TrendingUp,
	Trophy,
	Wrench,
	ChevronRight,
	Sparkles,
	ArrowUpRight,
	Lightbulb,
	Flame,
	Cpu,
	BarChart3,
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
	buttonColor: string;
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
		buttonColor: "text-indigo-700",
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
		buttonColor: "text-emerald-700",
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
		buttonColor: "text-rose-700",
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
		buttonColor: "text-cyan-700",
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
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden py-20 pb-32 sm:py-24 sm:pb-36 px-4 sm:px-6 lg:px-8">
			<div className="max-w-6xl mx-auto space-y-8 sm:space-y-10 pt-4 sm:pt-6">
				{/* Hero Header */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4"
				>
					<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs">
						<Sparkles className="w-3.5 h-3.5 text-indigo-600" />
						<span>Knowledge & Intelligence Hub</span>
					</div>

					<h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
						Curated <span className="text-indigo-600">Insights.</span>
					</h1>

					<p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl mx-auto">
						A unified nexus of fintech engineering essays, market sentiment
						telemetry, Liverpool FC matchday analytics, and precision developer
						toolkits.
					</p>

					{/* Quick Highlight Pills */}
					<div className="flex flex-wrap items-center justify-center gap-2 pt-1">
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-[11px] font-bold text-slate-600 shadow-xs">
							<Cpu className="w-3.5 h-3.5 text-indigo-500" />
							<span>Engineering</span>
						</span>
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-[11px] font-bold text-slate-600 shadow-xs">
							<BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
							<span>Fintech & Markets</span>
						</span>
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-[11px] font-bold text-slate-600 shadow-xs">
							<Flame className="w-3.5 h-3.5 text-rose-500" />
							<span>Matchday Center</span>
						</span>
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-[11px] font-bold text-slate-600 shadow-xs">
							<Lightbulb className="w-3.5 h-3.5 text-cyan-500" />
							<span>Developer Toolkits</span>
						</span>
					</div>
				</motion.div>

				{/* Global Intelligence Telemetry Stats Row */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto"
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
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
									{stat.label}
								</p>
								<p className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
									{stat.value}
								</p>
								<p className="text-[10px] text-slate-400 font-medium truncate">
									{stat.sublabel}
								</p>
							</div>
						</div>
					))}
				</motion.div>

				{/* Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
					{INSIGHT_MODULES.map((module, i) => {
						const Icon = module.icon;

						return (
							<motion.div
								key={module.href}
								initial={reduceMotion ? false : { opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
								whileHover={{ y: -4 }}
							>
								<Link
									href={module.href}
									className="group block relative p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200/80 hover:border-slate-300 transition-all duration-300 shadow-xs hover:shadow-md overflow-hidden !no-underline h-full flex flex-col justify-between"
								>
									{/* Top Row: Icon + Category Badge */}
									<div className="space-y-4">
										<div className="flex items-center justify-between gap-4">
											<div
												className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl ${module.badgeBg} ${module.badgeBorder} ${module.badgeText} border shadow-xs group-hover:scale-105 transition-transform duration-300`}
											>
												<Icon className="w-6 h-6 sm:w-7 sm:h-7" />
											</div>

											<div className="flex items-center gap-1.5">
												<span
													className={`px-3 py-1 rounded-full ${module.badgeBg} ${module.badgeBorder} border text-[11px] font-bold uppercase tracking-wider ${module.badgeText}`}
												>
													{module.category}
												</span>
												<div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/60 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
													<ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
												</div>
											</div>
										</div>

										{/* Title & Description */}
										<div className="space-y-1.5">
											<h2
												className={`text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight ${module.accentColor} transition-colors`}
											>
												{module.title}
											</h2>

											<p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
												{module.description}
											</p>
										</div>

										{/* Highlight Feature Quote */}
										<div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700">
											<span className="text-slate-400 font-normal">
												Featured:{" "}
											</span>
											<span>{module.highlight}</span>
										</div>
									</div>

									{/* Bottom Section: Tags & Action */}
									<div className="space-y-4 pt-4 mt-4 border-t border-slate-100">
										{/* Tags */}
										<div className="flex flex-wrap gap-1.5">
											{module.tags.map((tag) => (
												<span
													key={tag}
													className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold"
												>
													{tag}
												</span>
											))}
										</div>

										{/* Action Link */}
										<div
											className={`flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider ${module.buttonColor} transition-all`}
										>
											<span>Explore Module</span>
											<ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
										</div>
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
