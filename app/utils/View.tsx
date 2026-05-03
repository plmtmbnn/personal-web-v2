"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	Timer,
	ChevronRight,
	ArrowLeft,
	Wrench,
	Calculator,
	Braces,
	ArrowRightLeft,
	FileSpreadsheet,
	Database,
} from "lucide-react";

const utilities = [
	{
		title: "Running Timer",
		slug: "timer",
		description:
			"High-precision interval timer with automated transitions, beeps, and wake-lock.",
		accent: "from-rose-500 to-orange-500",
		color: "text-rose-500",
		bg: "bg-rose-500/5",
		icon: Timer,
	},
	{
		title: "Asset Averaging",
		slug: "stock-crypto-calculator",
		description:
			"Strategic calculator for weighted average cost analysis and goal-based purchase planning.",
		accent: "from-blue-500 to-indigo-500",
		color: "text-blue-500",
		bg: "bg-blue-500/5",
		icon: Calculator,
	},
	{
		title: "JSON Formatter",
		slug: "json-formatter",
		description:
			"Developer-centric tool to beautify, minify, and validate JSON strings with syntax highlighting.",
		accent: "from-indigo-500 to-purple-500",
		color: "text-indigo-500",
		bg: "bg-indigo-500/5",
		icon: Braces,
	},
	{
		title: "Case Converter",
		slug: "case-converter",
		description:
			"Universal recursive converter for variable names and JSON keys (Camel, Pascal, Snake, Kebab).",
		accent: "from-blue-600 to-cyan-500",
		color: "text-blue-600",
		bg: "bg-blue-600/5",
		icon: ArrowRightLeft,
	},
	{
		title: "CSV to JSON",
		slug: "csv-to-json",
		description:
			"Advanced CSV parser with support for nested objects, custom delimiters, and file uploads.",
		accent: "from-emerald-600 to-teal-500",
		color: "text-emerald-600",
		bg: "bg-emerald-600/5",
		icon: FileSpreadsheet,
	},
	{
		title: "SQL Formatter",
		slug: "sql-formatter",
		description:
			"Advanced SQL beautifier and syntax validator supporting PostgreSQL, MySQL, and T-SQL.",
		accent: "from-blue-500 to-indigo-500",
		color: "text-blue-500",
		bg: "bg-blue-500/5",
		icon: Database,
	},
];

export default function UtilsLanding() {
	const [mounted, setMounted] = useState(false);
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
					initial={{ opacity: 0, x: -10 }}
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
					initial={{ opacity: 0, y: 20 }}
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
						Adventure <span className="gradient-text">Utilities</span>
					</h1>
					<p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium leading-relaxed">
						High-fidelity tools designed to optimize physical performance and
						operational logistics during personal missions.
					</p>
				</motion.div>

				{/* Selection Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
					{utilities.map((util, i) => (
						<motion.div
							key={util.slug}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.1, duration: 0.6 }}
						>
							<Link
								href={`/utils/${util.slug}`}
								className="group block relative p-10 rounded-[2.5rem] bg-white/5 border-2 border-white/5 backdrop-blur-xl hover:border-blue-500/30 transition-all duration-500 shadow-2xl overflow-hidden !no-underline"
							>
								<div
									className={`absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-gradient-to-br ${util.accent} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl`}
								></div>

								<div className="relative z-10 flex flex-col h-full">
									<div
										className={`w-16 h-16 flex items-center justify-center rounded-2xl ${util.bg} ${util.color} shadow-lg mb-8 group-hover:scale-110 transition-transform duration-500 border border-white/5`}
									>
										<util.icon className="w-8 h-8" />
									</div>

									<h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">
										{util.title}
									</h3>

									<p className="text-muted-foreground font-medium leading-relaxed mb-10 flex-1">
										{util.description}
									</p>

									<div
										className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] ${util.color} transition-all`}
									>
										<span>Launch Utility</span>
										<ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
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
