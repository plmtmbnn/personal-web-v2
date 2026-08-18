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
		badgeText: "text-indigo-600",
		buttonColor: "text-indigo-600",
		tags: ["Fintech Core", "Distributed Systems", "Technical Essays", "SSG"],
		highlight: "Architecture, system design patterns & engineering culture",
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
		badgeText: "text-emerald-600",
		buttonColor: "text-emerald-600",
		tags: [
			"Fear & Greed Index",
			"Crypto Sentiment",
			"Market Regimes",
			"Telemetry",
		],
		highlight: "Real-time market sentiment & historical regime analysis",
	},
	{
		title: "Liverpool FC Matchday Hub",
		category: "Sports Analytics",
		href: "/liverpool",
		description:
			"Complete match schedule, live kickoff countdown, official matchday reports, final scores, and calendar integration.",
		icon: Trophy,
		accentColor: "group-hover:text-red-600",
		badgeBg: "bg-red-50",
		badgeBorder: "border-red-100",
		badgeText: "text-red-600",
		buttonColor: "text-red-600",
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
			"High-precision developer toolkits including IDX Stock Explorer, Mock API Engine, Schema Forge, SQL Formatters, and Running Timers.",
		icon: Wrench,
		accentColor: "group-hover:text-cyan-600",
		badgeBg: "bg-cyan-50",
		badgeBorder: "border-cyan-100",
		badgeText: "text-cyan-600",
		buttonColor: "text-cyan-600",
		tags: [
			"Stock Explorer",
			"Mock API Engine",
			"Schema Forge",
			"Interval Timer",
		],
		highlight: "30+ developer engines, formatters, converters & analyzers",
	},
];

export default function InsightsView() {
	const reduceMotion = useReducedMotion();

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-40 sm:pb-48">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32">
				{/* Hero Header */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7 }}
					className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4"
				>
					<div>
						<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
							<Sparkles className="w-4 h-4 text-indigo-600" />
							Knowledge & Intelligence Hub
						</span>
					</div>

					<h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
						Curated <span className="text-indigo-600">Insights</span>
					</h1>

					<p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
						A unified nexus of fintech engineering essays, financial sentiment
						intelligence, Liverpool FC matchday analytics, and precision
						developer toolkits.
					</p>

					{/* Quick Highlight Pills */}
					<div className="flex flex-wrap items-center justify-center gap-2 pt-2">
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-[11px] font-bold text-slate-600 shadow-xs">
							<Cpu className="w-3.5 h-3.5 text-indigo-500" />
							Engineering
						</span>
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-[11px] font-bold text-slate-600 shadow-xs">
							<BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
							Fintech & Markets
						</span>
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-[11px] font-bold text-slate-600 shadow-xs">
							<Flame className="w-3.5 h-3.5 text-red-500" />
							Matchday Center
						</span>
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-[11px] font-bold text-slate-600 shadow-xs">
							<Lightbulb className="w-3.5 h-3.5 text-cyan-500" />
							Developer Toolkits
						</span>
					</div>
				</motion.div>

				{/* Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
					{INSIGHT_MODULES.map((module, i) => {
						const Icon = module.icon;

						return (
							<motion.div
								key={module.href}
								initial={reduceMotion ? false : { opacity: 0, y: 24 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.1, duration: 0.5 }}
								whileHover={reduceMotion ? {} : { y: -4 }}
							>
								<Link
									href={module.href}
									className="group block relative p-7 sm:p-9 rounded-[2.5rem] bg-white border border-slate-200/80 hover:border-slate-300 transition-all duration-300 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/80 overflow-hidden !no-underline h-full flex flex-col justify-between"
								>
									{/* Top Row: Icon + Category Badge */}
									<div>
										<div className="flex items-center justify-between gap-4 mb-6">
											<div
												className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl ${module.badgeBg} ${module.badgeBorder} ${module.badgeText} border shadow-xs group-hover:scale-110 transition-transform duration-300`}
											>
												<Icon className="w-7 h-7 sm:w-8 sm:h-8" />
											</div>

											<div className="flex items-center gap-1.5">
												<span
													className={`px-3 py-1 rounded-full ${module.badgeBg} ${module.badgeBorder} border text-[11px] font-bold uppercase tracking-wider ${module.badgeText}`}
												>
													{module.category}
												</span>
												<div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-200/70 flex items-center justify-center transition-colors">
													<ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
												</div>
											</div>
										</div>

										{/* Title & Description */}
										<h2
											className={`text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight ${module.accentColor} transition-colors`}
										>
											{module.title}
										</h2>

										<p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mb-6">
											{module.description}
										</p>

										{/* Highlight Feature Quote */}
										<div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 mb-6">
											<span className="text-slate-400 font-normal">
												Featured:{" "}
											</span>
											{module.highlight}
										</div>
									</div>

									{/* Bottom Section: Tags & Action */}
									<div className="space-y-6 pt-2 border-t border-slate-100">
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
											className={`flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider ${module.buttonColor} transition-all`}
										>
											<span>Explore Module</span>
											<ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
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
