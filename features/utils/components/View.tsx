"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
	Timer,
	Wrench,
	Calculator,
	Braces,
	ArrowRightLeft,
	FileSpreadsheet,
	Database,
	Files,
	Table as TableIcon,
	Dices,
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
	ArrowUpRight,
} from "lucide-react";

export interface UtilityCategory {
	id: string;
	label: string;
	shortLabel: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	badgeColor: string;
	accentText: string;
}

export interface UtilityItem {
	title: string;
	slug: string;
	path?: string;
	description: string;
	categoryId: string;
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
		badgeColor: "bg-indigo-50 border-indigo-100 text-indigo-600",
		accentText: "group-hover:text-indigo-600",
	},
	{
		id: "data",
		label: "Data & File Systems",
		shortLabel: "Data & Files",
		description:
			"Format parsers, JSON beautifiers, image transformers, and batch file utilities.",
		icon: FileStack,
		badgeColor: "bg-emerald-50 border-emerald-100 text-emerald-600",
		accentText: "group-hover:text-emerald-600",
	},
	{
		id: "security",
		label: "Security & Diagnostics",
		shortLabel: "Security & Web",
		description:
			"Cryptographic hashers, phishing detectors, network telemetry, and QR generation.",
		icon: ShieldCheck,
		badgeColor: "bg-sky-50 border-sky-100 text-sky-600",
		accentText: "group-hover:text-sky-600",
	},
	{
		id: "finance",
		label: "Financial Intelligence",
		shortLabel: "Finance",
		description:
			"IDX market flow tracking, stock opportunity exploration, and dollar-cost averaging.",
		icon: TrendingUp,
		badgeColor: "bg-amber-50 border-amber-100 text-amber-700",
		accentText: "group-hover:text-amber-600",
	},
	{
		id: "productivity",
		label: "Productivity & Lifestyle",
		shortLabel: "Time & Tools",
		description:
			"Interval training timers, cron schedule designers, and interactive decision tools.",
		icon: Clock,
		badgeColor: "bg-purple-50 border-purple-100 text-purple-600",
		accentText: "group-hover:text-purple-600",
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
		icon: FileText,
	},
	{
		title: "Schema Forge",
		slug: "json-converter-advanced",
		path: "/utils/json-converter-advanced",
		categoryId: "development",
		description:
			"Advanced JSON to Multi-Target converter (TS, Go, Zod, Mongoose, Joi) with recursive parsing.",
		icon: Braces,
	},
	{
		title: "Mock API Engine",
		slug: "mock-api",
		categoryId: "development",
		description:
			"Dynamic API mocking tool to create temporary endpoints with custom JSON responses and status codes.",
		icon: Braces,
	},
	{
		title: "Diff Comparator",
		slug: "diff-viewer",
		categoryId: "development",
		description:
			"Side-by-side split & unified code diffing with word/character-level highlight and patch export.",
		icon: GitCompare,
	},
	{
		title: "SQL Formatter",
		slug: "sql-formatter",
		categoryId: "development",
		description:
			"Advanced SQL beautifier and syntax validator supporting PostgreSQL, MySQL, and T-SQL.",
		icon: Database,
	},
	{
		title: "Case Converter",
		slug: "case-converter",
		categoryId: "development",
		description:
			"Universal recursive converter for variable names and JSON keys (Camel, Pascal, Snake, Kebab).",
		icon: ArrowRightLeft,
	},
	{
		title: "Code Social Card Studio",
		slug: "code-to-image",
		categoryId: "development",
		description:
			"Transform code snippets and text into high-resolution, aesthetic social export cards.",
		icon: Camera,
	},

	// Data & File Systems
	{
		title: "JSON Formatter",
		slug: "json-formatter",
		categoryId: "data",
		description:
			"Developer-centric tool to beautify, minify, and validate JSON strings with syntax highlighting.",
		icon: Braces,
	},
	{
		title: "CSV to JSON",
		slug: "csv-to-json",
		categoryId: "data",
		description:
			"Advanced CSV parser with support for nested objects, custom delimiters, and file uploads.",
		icon: FileSpreadsheet,
	},
	{
		title: "Image Converter",
		slug: "image-converter",
		categoryId: "data",
		description:
			"Convert image extensions (WebP, PNG, JPG, AVIF, ICO, BMP) with binary validation and quality scaling.",
		icon: ImageIcon,
	},
	{
		title: "File Renamer",
		slug: "file-renamer",
		categoryId: "data",
		description:
			"Batch rename files into clean, SEO-friendly kebab-case while preserving extensions.",
		icon: Files,
	},

	// Security & Diagnostics
	{
		title: "JWT & API Token Inspector",
		slug: "jwt-inspector",
		categoryId: "security",
		description:
			"Decode JSON Web Tokens, inspect RFC 7519 claims, monitor live expiration countdowns, and verify HMAC signatures locally.",
		icon: ShieldCheck,
	},
	{
		title: "Security & Hash Studio",
		slug: "hash-password-generator",
		categoryId: "security",
		description:
			"Cryptographic password & passphrase generator, multi-algorithm hasher (SHA-256, MD5, HMAC), and security formatter.",
		icon: KeyRound,
	},
	{
		title: "URL Safety Inspector",
		slug: "url-inspector",
		categoryId: "security",
		description:
			"Detect phishing links, IDN homographs, shorteners, raw IP hosts, and invalid URL characters.",
		icon: ShieldCheck,
	},
	{
		title: "QR Code Generator",
		slug: "qr-code-generator",
		categoryId: "security",
		description:
			"Generate high-resolution, customized vector and raster QR codes for URLs, text, Wi-Fi, vCard, and crypto.",
		icon: QrCode,
	},
	{
		title: "Device & Speed Inspector",
		slug: "device-inspector",
		categoryId: "security",
		description:
			"Internet speed test in Megabits per second (Mbps), ping, jitter, hardware GPU telemetry, display refresh rate, and media codecs.",
		icon: Gauge,
	},

	// Financial Intelligence
	{
		title: "Stock Explorer",
		slug: "stock-explorer",
		categoryId: "finance",
		description:
			"Interactive IDX stock summary explorer with foreign flow tracking and performance analysis.",
		icon: TableIcon,
	},
	{
		title: "Asset Averaging",
		slug: "stock-crypto-calculator",
		categoryId: "finance",
		description:
			"Strategic calculator for weighted average cost analysis and goal-based purchase planning.",
		icon: Calculator,
	},

	// Productivity & Lifestyle
	{
		title: "Cron Expression Studio",
		slug: "cron-builder",
		categoryId: "productivity",
		description:
			"Visual cron schedule builder, plain-English humanizer, future executions timeline, and platform exporters.",
		icon: Clock,
	},
	{
		title: "Running Timer",
		slug: "timer",
		categoryId: "productivity",
		description:
			"High-precision interval timer with automated transitions, beeps, and wake-lock.",
		icon: Timer,
	},
	{
		title: "Spinner Wheel",
		slug: "spinner-wheel",
		categoryId: "productivity",
		description:
			"Interactive decision wheel & random name picker with audio feedback, presets, and physics.",
		icon: Dices,
	},
];

export default function UtilsLanding() {
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const reduceMotion = useReducedMotion();

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

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10 space-y-6 sm:space-y-8">
				{/* ── Modern Floating Card Header Standard ── */}
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
									<Wrench className="w-3.5 h-3.5 text-indigo-600" />
								</div>
								<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
									UTILITY REGISTRY · DEVELOPER & OPERATIONAL ENGINES
								</span>
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
								Developer & Tech Utilities
							</h1>
							<p className="text-sm text-slate-500 font-medium mt-1 max-w-xl">
								High-precision developer tools, schema converters, financial
								calculators, and operational utilities running locally in your
								browser.
							</p>
						</div>

						{/* Telemetry Quick Strip */}
						<div className="flex items-center gap-4 sm:gap-5 shrink-0">
							<div className="text-center">
								<p className="text-xl font-extrabold text-slate-900 tabular-nums">
									{utilities.length}
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Engines
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-indigo-600 tabular-nums">
									{CATEGORIES.length}
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Domains
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-emerald-600 tabular-nums">
									100%
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Client-Side
								</p>
							</div>
						</div>
					</div>
				</motion.div>

				{/* ── Filter & Search Toolbar ── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
					className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5"
				>
					{/* Search Input with explicit icon layering */}
					<div className="relative max-w-md">
						<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search utilities by name, description, or keyword..."
							className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
								aria-label="Clear search"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						)}
					</div>

					{/* Category Filter Pills */}
					<div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
						<button
							type="button"
							onClick={() => setSelectedCategory("all")}
							className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
								selectedCategory === "all"
									? "bg-slate-900 text-white shadow-xs"
									: "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100"
							}`}
						>
							<Layers className="w-3.5 h-3.5" />
							<span>All</span>
							<span
								className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
									selectedCategory === "all"
										? "bg-slate-800 text-slate-200"
										: "bg-slate-200/70 text-slate-600"
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
									className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
										isActive
											? "bg-slate-900 text-white shadow-xs"
											: "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100"
									}`}
								>
									<Icon className="w-3.5 h-3.5" />
									<span>{cat.shortLabel}</span>
									<span
										className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
											isActive
												? "bg-slate-800 text-slate-200"
												: "bg-slate-200/70 text-slate-600"
										}`}
									>
										{categoryCounts[cat.id]}
									</span>
								</button>
							);
						})}
					</div>
				</motion.div>

				{/* ── Grouped Category Sections ── */}
				{groupedCategories.length > 0 ? (
					<div className="space-y-10 sm:space-y-12">
						{groupedCategories.map(({ category, items }, groupIndex) => {
							const CategoryIcon = category.icon;

							return (
								<motion.section
									key={category.id}
									initial={reduceMotion ? false : { opacity: 0, y: 16 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										delay: 0.12 + groupIndex * 0.05,
										duration: 0.4,
										ease: "easeOut",
									}}
									className="space-y-4 sm:space-y-5"
								>
									{/* Category Header Row */}
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
										<div className="flex items-center gap-3">
											<div
												className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${category.badgeColor}`}
											>
												<CategoryIcon className="w-4 h-4" />
											</div>
											<div>
												<div className="flex items-center gap-2.5">
													<h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
														{category.label}
													</h2>
													<span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 text-[10px] font-bold text-slate-600">
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
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4.5">
										{items.map((util) => (
											<motion.div
												key={util.slug}
												whileHover={reduceMotion ? undefined : { y: -2 }}
												transition={{
													type: "spring",
													stiffness: 300,
													damping: 24,
												}}
												className="h-full"
											>
												<Link
													href={util.path || `/utils/${util.slug}`}
													className={`group flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-[border-color,box-shadow] duration-200 !no-underline h-full`}
												>
													<div>
														{/* Card Head: Squircle Icon + Action Arrow */}
														<div className="flex items-center justify-between gap-3 mb-3.5">
															<div
																className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${category.badgeColor} group-hover:scale-105 transition-transform duration-200`}
															>
																<util.icon className="w-5 h-5" />
															</div>
															<div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0">
																<ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
															</div>
														</div>

														{/* Title */}
														<h3
															className={`text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-snug ${category.accentText} transition-colors mb-1.5`}
														>
															{util.title}
														</h3>

														{/* Description */}
														<p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 sm:line-clamp-3">
															{util.description}
														</p>
													</div>

													{/* Card Footer: Slug indicator */}
													<div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
														<span className="truncate">/{util.slug}</span>
														<span
															className={`text-[10px] font-bold uppercase tracking-wider ${category.accentText} transition-colors opacity-0 group-hover:opacity-100`}
														>
															Launch →
														</span>
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
						initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
						animate={{ opacity: 1, scale: 1 }}
						className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs"
					>
						<div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
							<Search className="w-6 h-6" />
						</div>
						<h3 className="text-base font-extrabold text-slate-900 mb-1">
							No utilities found
						</h3>
						<p className="text-xs text-slate-500 mb-6">
							No tools matched "{searchQuery}". Try searching for something else
							or reset your filters.
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
