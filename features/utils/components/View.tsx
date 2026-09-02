"use client";

import { useEffect, useMemo, useState } from "react";
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
	Sparkles,
	ShieldCheck,
	QrCode,
	Image as ImageIcon,
	KeyRound,
	Clock,
	GitCompare,
	Gauge,
	Camera,
	Code2,
	FileStack,
	TrendingUp,
	Search,
	X,
	Layers,
	FileText,
} from "lucide-react";

export interface UtilityCategory {
	id: string;
	label: string;
	shortLabel: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
}

export interface UtilityItem {
	title: string;
	slug: string;
	path?: string;
	description: string;
	categoryId: string;
	accent: string;
	color: string;
	bg: string;
	icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: UtilityCategory[] = [
	{
		id: "development",
		label: "Development & Code",
		shortLabel: "Code & Dev",
		description:
			"Schema generators, API mocking, diff analysis, and syntax formatters.",
		icon: Code2,
	},
	{
		id: "data",
		label: "Data & File Systems",
		shortLabel: "Data & Files",
		description:
			"Format parsers, JSON beautifiers, image transformers, and batch file utilities.",
		icon: FileStack,
	},
	{
		id: "security",
		label: "Security & Diagnostics",
		shortLabel: "Security & Web",
		description:
			"Cryptographic hashers, phishing detectors, network telemetry, and QR generation.",
		icon: ShieldCheck,
	},
	{
		id: "finance",
		label: "Financial Intelligence",
		shortLabel: "Finance",
		description:
			"IDX market flow tracking, stock opportunity exploration, and dollar-cost averaging.",
		icon: TrendingUp,
	},
	{
		id: "productivity",
		label: "Productivity & Lifestyle",
		shortLabel: "Time & Tools",
		description:
			"Interval training timers, cron schedule designers, and interactive decision tools.",
		icon: Clock,
	},
];

const utilities: UtilityItem[] = [
	// Development & Code
	{
		title: "Text Compare Studio",
		slug: "text-compare",
		categoryId: "development",
		description:
			"Compare 2 texts with real-time similarity metrics, Levenshtein edit distance, vocabulary matrix, and side-by-side highlighting.",
		accent: "bg-indigo-600",
		color: "text-indigo-600",
		bg: "bg-indigo-600/5",
		icon: FileText,
	},
	{
		title: "Schema Forge",
		slug: "json-converter-advanced",
		path: "/utils/json-converter-advanced",
		categoryId: "development",
		description:
			"Advanced JSON to Multi-Target converter (TS, Go, Zod, Mongoose, Joi) with recursive parsing.",
		accent: "bg-blue-600",
		color: "text-blue-600",
		bg: "bg-blue-600/5",
		icon: Braces,
	},
	{
		title: "Mock API Engine",
		slug: "mock-api",
		categoryId: "development",
		description:
			"Dynamic API mocking tool to create temporary endpoints with custom JSON responses and status codes.",
		accent: "bg-blue-400",
		color: "text-cyan-500",
		bg: "bg-cyan-500/5",
		icon: Braces,
	},
	{
		title: "Diff Comparator",
		slug: "diff-viewer",
		categoryId: "development",
		description:
			"Side-by-side split & unified code diffing with word/character-level highlight and patch export.",
		accent: "bg-blue-600",
		color: "text-blue-600",
		bg: "bg-blue-600/5",
		icon: GitCompare,
	},
	{
		title: "SQL Formatter",
		slug: "sql-formatter",
		categoryId: "development",
		description:
			"Advanced SQL beautifier and syntax validator supporting PostgreSQL, MySQL, and T-SQL.",
		accent: "bg-blue-500",
		color: "text-blue-500",
		bg: "bg-blue-500/5",
		icon: Database,
	},
	{
		title: "Case Converter",
		slug: "case-converter",
		categoryId: "development",
		description:
			"Universal recursive converter for variable names and JSON keys (Camel, Pascal, Snake, Kebab).",
		accent: "bg-blue-600",
		color: "text-blue-600",
		bg: "bg-blue-600/5",
		icon: ArrowRightLeft,
	},
	{
		title: "Code Social Card Studio",
		slug: "code-to-image",
		categoryId: "development",
		description:
			"Transform code snippets and text into high-resolution, gradient-backed aesthetic social cards.",
		accent: "bg-fuchsia-600",
		color: "text-fuchsia-600",
		bg: "bg-fuchsia-600/5",
		icon: Camera,
	},

	// Data & File Systems
	{
		title: "JSON Formatter",
		slug: "json-formatter",
		categoryId: "data",
		description:
			"Developer-centric tool to beautify, minify, and validate JSON strings with syntax highlighting.",
		accent: "bg-indigo-500",
		color: "text-indigo-500",
		bg: "bg-indigo-500/5",
		icon: Braces,
	},
	{
		title: "CSV to JSON",
		slug: "csv-to-json",
		categoryId: "data",
		description:
			"Advanced CSV parser with support for nested objects, custom delimiters, and file uploads.",
		accent: "bg-emerald-600",
		color: "text-emerald-600",
		bg: "bg-emerald-600/5",
		icon: FileSpreadsheet,
	},
	{
		title: "Image Converter",
		slug: "image-converter",
		categoryId: "data",
		description:
			"Convert image extensions (WebP, PNG, JPG, AVIF, ICO, BMP) with binary validation and quality scaling.",
		accent: "bg-indigo-600",
		color: "text-indigo-600",
		bg: "bg-indigo-600/5",
		icon: ImageIcon,
	},
	{
		title: "File Renamer",
		slug: "file-renamer",
		categoryId: "data",
		description:
			"Batch rename files into clean, SEO-friendly kebab-case while preserving extensions.",
		accent: "bg-slate-600",
		color: "text-slate-700",
		bg: "bg-slate-700/5",
		icon: Files,
	},

	// Security & Diagnostics
	{
		title: "JWT & API Token Inspector",
		slug: "jwt-inspector",
		categoryId: "security",
		description:
			"Decode JSON Web Tokens, inspect RFC 7519 claims, monitor live expiration countdowns, and verify HMAC signatures locally.",
		accent: "bg-indigo-600",
		color: "text-indigo-600",
		bg: "bg-indigo-600/5",
		icon: ShieldCheck,
	},
	{
		title: "Security & Hash Studio",
		slug: "hash-password-generator",
		categoryId: "security",
		description:
			"Cryptographic password & passphrase generator, multi-algorithm hasher (SHA-256, MD5, HMAC), and security formatter.",
		accent: "bg-emerald-600",
		color: "text-emerald-600",
		bg: "bg-emerald-600/5",
		icon: KeyRound,
	},
	{
		title: "URL Safety Inspector",
		slug: "url-inspector",
		categoryId: "security",
		description:
			"Detect phishing links, IDN homographs, shorteners, raw IP hosts, and invalid URL characters.",
		accent: "bg-emerald-600",
		color: "text-emerald-600",
		bg: "bg-emerald-600/5",
		icon: ShieldCheck,
	},
	{
		title: "QR Code Generator",
		slug: "qr-code-generator",
		categoryId: "security",
		description:
			"Generate high-resolution, customized vector and raster QR codes for URLs, text, Wi-Fi, vCard, and crypto.",
		accent: "bg-indigo-600",
		color: "text-indigo-600",
		bg: "bg-indigo-600/5",
		icon: QrCode,
	},
	{
		title: "Device & Speed Inspector",
		slug: "device-inspector",
		categoryId: "security",
		description:
			"Internet speed test in Megabits per second (Mbps), ping, jitter, hardware GPU telemetry, display refresh rate, and media codecs.",
		accent: "bg-cyan-600",
		color: "text-cyan-600",
		bg: "bg-cyan-600/5",
		icon: Gauge,
	},

	// Financial Intelligence
	{
		title: "Stock Explorer",
		slug: "stock-explorer",
		categoryId: "finance",
		description:
			"Interactive IDX stock summary explorer with foreign flow tracking and performance analysis.",
		accent: "bg-indigo-600",
		color: "text-indigo-600",
		bg: "bg-indigo-600/5",
		icon: TableIcon,
	},
	{
		title: "Asset Averaging",
		slug: "stock-crypto-calculator",
		categoryId: "finance",
		description:
			"Strategic calculator for weighted average cost analysis and goal-based purchase planning.",
		accent: "bg-blue-500",
		color: "text-blue-500",
		bg: "bg-blue-500/5",
		icon: Calculator,
	},

	// Productivity & Lifestyle
	{
		title: "Cron Expression Studio",
		slug: "cron-builder",
		categoryId: "productivity",
		description:
			"Visual cron schedule builder, plain-English humanizer, future executions timeline, and platform exporters.",
		accent: "bg-purple-600",
		color: "text-purple-600",
		bg: "bg-purple-600/5",
		icon: Clock,
	},
	{
		title: "Running Timer",
		slug: "timer",
		categoryId: "productivity",
		description:
			"High-precision interval timer with automated transitions, beeps, and wake-lock.",
		accent: "bg-rose-500",
		color: "text-rose-500",
		bg: "bg-rose-500/5",
		icon: Timer,
	},
	{
		title: "Spinner Wheel",
		slug: "spinner-wheel",
		categoryId: "productivity",
		description:
			"Interactive decision wheel & random name picker with audio feedback, presets, and physics.",
		accent: "bg-purple-600",
		color: "text-purple-600",
		bg: "bg-purple-600/5",
		icon: Sparkles,
	},
];

export default function UtilsLanding() {
	const [mounted, setMounted] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const reduceMotion = useReducedMotion();

	useEffect(() => setMounted(true), []);

	// Category counts mapping
	const categoryCounts = useMemo(() => {
		const counts: Record<string, number> = { all: utilities.length };
		for (const cat of CATEGORIES) {
			counts[cat.id] = utilities.filter((u) => u.categoryId === cat.id).length;
		}
		return counts;
	}, []);

	// Filtered utilities based on search query and category filter
	const filteredUtilities = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		return utilities.filter((util) => {
			const matchesCategory =
				selectedCategory === "all" || util.categoryId === selectedCategory;
			if (!matchesCategory) return false;

			if (!query) return true;

			const category = CATEGORIES.find((c) => c.id === util.categoryId);
			const categoryLabel = category ? category.label.toLowerCase() : "";
			const categoryShort = category ? category.shortLabel.toLowerCase() : "";

			return (
				util.title.toLowerCase().includes(query) ||
				util.description.toLowerCase().includes(query) ||
				categoryLabel.includes(query) ||
				categoryShort.includes(query)
			);
		});
	}, [searchQuery, selectedCategory]);

	// Grouping filtered items by category
	const groupedCategories = useMemo(() => {
		return CATEGORIES.map((cat) => ({
			category: cat,
			items: filteredUtilities.filter((u) => u.categoryId === cat.id),
		})).filter((group) => group.items.length > 0);
	}, [filteredUtilities]);

	if (!mounted) return null;

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32">
				{/* Breadcrumb */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					className="mb-8"
				>
					<Link
						href="/"
						className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors gap-2 group !no-underline"
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
					className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4"
				>
					<div>
						<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
							<Wrench className="w-4 h-4 text-indigo-600" />
							Operational & Developer Utilities
						</span>
					</div>
					<h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
						Developer & Tech <span className="text-indigo-600">Utilities</span>
					</h1>
					<p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl mx-auto">
						High-fidelity developer tools, financial calculators, and
						operational utilities categorized for performance and logistics.
					</p>
				</motion.div>

				{/* Controls Bar: Search & Category Filter Pills */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1, duration: 0.5 }}
					className="max-w-5xl mx-auto mb-12 space-y-4"
				>
					{/* Search Input */}
					<div className="relative max-w-md mx-auto sm:mx-0">
						<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search utilities by name, description, or group..."
							className="w-full bg-white border border-slate-200/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
								aria-label="Clear search"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						)}
					</div>

					{/* Category Filter Pills */}
					<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
						<button
							type="button"
							onClick={() => setSelectedCategory("all")}
							className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
								selectedCategory === "all"
									? "bg-slate-900 text-white shadow-sm shadow-slate-900/20"
									: "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300"
							}`}
						>
							<Layers className="w-3.5 h-3.5" />
							<span>All</span>
							<span
								className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
									selectedCategory === "all"
										? "bg-slate-800 text-slate-200"
										: "bg-slate-100 text-slate-600"
								}`}
							>
								{categoryCounts.all}
							</span>
						</button>

						{CATEGORIES.map((cat) => {
							const Icon = cat.icon;
							const isActive = selectedCategory === cat.id;
							return (
								<button
									key={cat.id}
									type="button"
									onClick={() => setSelectedCategory(cat.id)}
									className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
										isActive
											? "bg-slate-900 text-white shadow-sm shadow-slate-900/20"
											: "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300"
									}`}
								>
									<Icon className="w-3.5 h-3.5" />
									<span>{cat.shortLabel}</span>
									<span
										className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
											isActive
												? "bg-slate-800 text-slate-200"
												: "bg-slate-100 text-slate-600"
										}`}
									>
										{categoryCounts[cat.id]}
									</span>
								</button>
							);
						})}
					</div>
				</motion.div>

				{/* Grouped Category Sections */}
				{groupedCategories.length > 0 ? (
					<div className="space-y-14 max-w-5xl mx-auto">
						{groupedCategories.map(({ category, items }, groupIndex) => {
							const CategoryIcon = category.icon;
							return (
								<motion.section
									key={category.id}
									initial={reduceMotion ? false : { opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: groupIndex * 0.08, duration: 0.5 }}
									className="space-y-6"
								>
									{/* Grouping Label / Section Header */}
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
										<div className="flex items-center gap-3">
											<div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs">
												<CategoryIcon className="w-4 h-4" />
											</div>
											<div>
												<div className="flex items-center gap-2.5">
													<h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
														{category.label}
													</h2>
													<span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/60 text-[11px] font-bold text-slate-600">
														{items.length}{" "}
														{items.length === 1 ? "tool" : "tools"}
													</span>
												</div>
												<p className="text-xs text-slate-500 font-medium">
													{category.description}
												</p>
											</div>
										</div>
									</div>

									{/* Cards Grid */}
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
										{items.map((util, i) => (
											<motion.div
												key={util.slug}
												initial={reduceMotion ? false : { opacity: 0, y: 15 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: i * 0.03, duration: 0.3 }}
											>
												<Link
													href={util.path || `/utils/${util.slug}`}
													className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 !no-underline h-full"
												>
													<div>
														<div className="flex items-center justify-between gap-3 mb-4">
															<div
																className={`w-12 h-12 flex items-center justify-center rounded-xl shrink-0 ${util.bg} ${util.color} border border-slate-100 shadow-2xs group-hover:scale-110 transition-transform duration-300`}
															>
																<util.icon className="w-6 h-6" />
															</div>
															<span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
																Open Tool →
															</span>
														</div>
														<div className="mb-2 flex items-center gap-2">
															<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
																{category.shortLabel}
															</span>
														</div>
														<h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors mb-2">
															{util.title}
														</h3>
														<p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
															{util.description}
														</p>
													</div>
												</Link>
											</motion.div>
										))}
									</div>
								</motion.section>
							);
						})}
					</div>
				) : (
					/* Empty Search State */
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs"
					>
						<div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
							<Search className="w-6 h-6" />
						</div>
						<h3 className="text-base font-bold text-slate-900 mb-1">
							No utilities found
						</h3>
						<p className="text-xs text-slate-500 mb-6">
							No tools matched "{searchQuery}". Try searching for something else
							or reset your category filter.
						</p>
						<button
							type="button"
							onClick={() => {
								setSearchQuery("");
								setSelectedCategory("all");
							}}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
						>
							Reset Filters
						</button>
					</motion.div>
				)}
			</div>
		</main>
	);
}
