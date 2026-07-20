"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
	Timer,
	ArrowLeft,
	Wrench,
	Calculator,
	Braces,
	ArrowRightLeft,
	FileSpreadsheet,
	Database,
	Files,
	Table as TableIcon,
	Globe,
} from "lucide-react";

const utilities = [
	{
		title: "Running Timer",
		slug: "timer",
		description:
			"High-precision interval timer with automated transitions, beeps, and wake-lock.",
		accent: "bg-rose-500",
		color: "text-rose-500",
		bg: "bg-rose-500/5",
		icon: Timer,
	},
	{
		title: "Asset Averaging",
		slug: "stock-crypto-calculator",
		description:
			"Strategic calculator for weighted average cost analysis and goal-based purchase planning.",
		accent: "bg-blue-500",
		color: "text-blue-500",
		bg: "bg-blue-500/5",
		icon: Calculator,
	},
	{
		title: "JSON Formatter",
		slug: "json-formatter",
		description:
			"Developer-centric tool to beautify, minify, and validate JSON strings with syntax highlighting.",
		accent: "bg-indigo-500",
		color: "text-indigo-500",
		bg: "bg-indigo-500/5",
		icon: Braces,
	},
	{
		title: "Case Converter",
		slug: "case-converter",
		description:
			"Universal recursive converter for variable names and JSON keys (Camel, Pascal, Snake, Kebab).",
		accent: "bg-blue-600",
		color: "text-blue-600",
		bg: "bg-blue-600/5",
		icon: ArrowRightLeft,
	},
	{
		title: "CSV to JSON",
		slug: "csv-to-json",
		description:
			"Advanced CSV parser with support for nested objects, custom delimiters, and file uploads.",
		accent: "bg-emerald-600",
		color: "text-emerald-600",
		bg: "bg-emerald-600/5",
		icon: FileSpreadsheet,
	},
	{
		title: "SQL Formatter",
		slug: "sql-formatter",
		description:
			"Advanced SQL beautifier and syntax validator supporting PostgreSQL, MySQL, and T-SQL.",
		accent: "bg-blue-500",
		color: "text-blue-500",
		bg: "bg-blue-500/5",
		icon: Database,
	},
	{
		title: "Schema Forge",
		slug: "json-converter-advanced",
		path: "/utils/json-converter-advanced",
		description:
			"Advanced JSON to Multi-Target converter (TS, Go, Zod, Mongoose, Joi) with recursive parsing.",
		accent: "bg-blue-600",
		color: "text-blue-600",
		bg: "bg-blue-600/5",
		icon: Braces,
	},
	{
		title: "File Renamer",
		slug: "file-renamer",
		description:
			"Batch rename files into clean, SEO-friendly kebab-case while preserving extensions.",
		accent: "bg-slate-600",
		color: "text-slate-700",
		bg: "bg-slate-700/5",
		icon: Files,
	},
	{
		title: "Stock Explorer",
		slug: "stock-explorer",
		description:
			"Interactive IDX stock summary explorer with foreign flow tracking and performance analysis.",
		accent: "bg-indigo-600",
		color: "text-indigo-600",
		bg: "bg-indigo-600/5",
		icon: TableIcon,
	},
	{
		title: "Mock API Engine",
		slug: "mock-api",
		description:
			"Dynamic API mocking tool to create temporary endpoints with custom JSON responses and status codes.",
		accent: "bg-blue-400",
		color: "text-cyan-500",
		bg: "bg-cyan-500/5",
		icon: Braces,
	},
	{
		title: "Web Archiver",
		slug: "web-archiver",
		description:
			"Scrape articles from URLs, extract clean content, and archive them directly into your Second Brain.",
		accent: "bg-blue-500",
		color: "text-blue-500",
		bg: "bg-blue-500/5",
		icon: Globe,
	},
];

export default function UtilsLanding() {
	const [mounted, setMounted] = useState(false);
	const reduceMotion = useReducedMotion();
	useEffect(() => setMounted(true), []);

	if (!mounted) return null;

	return (
		<main className="min-h-screen bg-background relative overflow-hidden pb-32">
			{/* Aesthetic Background Elements */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
				<div
					className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="max-w-6xl mx-auto px-6 pt-24 sm:pt-32">
				{/* Breadcrumb */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					className="mb-12"
				>
					<Link
						href="/"
						className="inline-flex items-center text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-500 transition-colors gap-2 group"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to Home
					</Link>
				</motion.div>

				{/* Header Section */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center space-y-6 mb-20"
				>
					<div className="flex items-center justify-center gap-3 text-blue-500 mb-4">
						<Wrench className="w-6 h-6" />
						<span className="text-[10px] font-black uppercase tracking-[0.4em]">
							Operational Tools
						</span>
					</div>
					<h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground leading-[0.9]">
						Adventure <span className="text-blue-600">Utilities</span>
					</h1>
					<p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium leading-relaxed">
						High-fidelity tools designed to optimize physical performance and
						operational logistics during personal missions.
					</p>
				</motion.div>

				{/* Selection Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
					{utilities.map((util, i) => (
						<motion.div
							key={util.slug}
							initial={reduceMotion ? false : { opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.05, duration: 0.5 }}
						>
							<Link
								href={util.path || `/utils/${util.slug}`}
								className="group block relative p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-300 shadow-xl overflow-hidden h-28 !no-underline"
							>
								{/* Glow effect on hover */}
								<div
									className={`absolute -right-12 -bottom-12 w-32 h-32 rounded-full ${util.accent} opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl pointer-events-none`}
								/>

								<div className="relative z-10 h-full flex flex-col justify-center">
									{/* Default view: Icon & Title centered */}
									<div className="flex items-center gap-3 transition-all duration-300 group-hover:-translate-y-3 group-hover:blur-[2px] group-hover:opacity-20">
										<div
											className={`w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 ${util.bg} ${util.color} shadow-md group-hover:scale-105 transition-transform duration-300 border border-white/5`}
										>
											<util.icon className="w-6 h-6" />
										</div>
										<div className="min-w-0">
											<h3 className="text-sm font-black text-foreground tracking-tight leading-snug group-hover:text-blue-400 transition-colors">
												{util.title}
											</h3>
										</div>
									</div>

									{/* Description: Hidden by default, slides & fades in on hover */}
									<div className="absolute bottom-0 left-0 right-0 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
										<p className="text-[10px] text-muted-foreground font-medium leading-normal line-clamp-2">
											{util.description}
										</p>
									</div>
								</div>
							</Link>
						</motion.div>
					))}
				</div>
			</div>
		</main>
	);
}
