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
	Sparkles,
	ShieldCheck,
	QrCode,
	Image as ImageIcon,
	KeyRound,
	Clock,
	GitCompare,
	Gauge,
	Camera,
} from "lucide-react";

const utilities = [
	{
		title: "Code Social Card Studio",
		slug: "code-to-image",
		description:
			"Transform code snippets and text into high-resolution, gradient-backed aesthetic social cards.",
		accent: "bg-fuchsia-600",
		color: "text-fuchsia-600",
		bg: "bg-fuchsia-600/5",
		icon: Camera,
	},
	{
		title: "Device & Speed Inspector",
		slug: "device-inspector",
		description:
			"Internet speed test (Mbps/Ping/Jitter), hardware GPU telemetry, display refresh rate, and media codecs.",
		accent: "bg-cyan-600",
		color: "text-cyan-600",
		bg: "bg-cyan-600/5",
		icon: Gauge,
	},
	{
		title: "Diff Comparator",
		slug: "diff-viewer",
		description:
			"Side-by-side split & unified code diffing with word/character-level highlight and patch export.",
		accent: "bg-blue-600",
		color: "text-blue-600",
		bg: "bg-blue-600/5",
		icon: GitCompare,
	},
	{
		title: "Cron Expression Studio",
		slug: "cron-builder",
		description:
			"Visual cron schedule builder, plain-English humanizer, future executions timeline, and platform exporters.",
		accent: "bg-purple-600",
		color: "text-purple-600",
		bg: "bg-purple-600/5",
		icon: Clock,
	},
	{
		title: "Security & Hash Studio",
		slug: "hash-password-generator",
		description:
			"Cryptographic password & passphrase generator, multi-algorithm hasher (SHA-256, MD5, HMAC), and security formatter.",
		accent: "bg-emerald-600",
		color: "text-emerald-600",
		bg: "bg-emerald-600/5",
		icon: KeyRound,
	},
	{
		title: "Image Converter",
		slug: "image-converter",
		description:
			"Convert image extensions (WebP, PNG, JPG, AVIF, ICO, BMP) with binary validation and quality scaling.",
		accent: "bg-indigo-600",
		color: "text-indigo-600",
		bg: "bg-indigo-600/5",
		icon: ImageIcon,
	},
	{
		title: "QR Code Generator",
		slug: "qr-code-generator",
		description:
			"Generate high-resolution, customized vector and raster QR codes for URLs, text, Wi-Fi, vCard, and crypto.",
		accent: "bg-indigo-600",
		color: "text-indigo-600",
		bg: "bg-indigo-600/5",
		icon: QrCode,
	},
	{
		title: "URL Safety Inspector",
		slug: "url-inspector",
		description:
			"Detect phishing links, IDN homographs, shorteners, raw IP hosts, and invalid URL characters.",
		accent: "bg-emerald-600",
		color: "text-emerald-600",
		bg: "bg-emerald-600/5",
		icon: ShieldCheck,
	},
	{
		title: "Spinner Wheel",
		slug: "spinner-wheel",
		description:
			"Interactive decision wheel & random name picker with audio feedback, presets, and physics.",
		accent: "bg-purple-600",
		color: "text-purple-600",
		bg: "bg-purple-600/5",
		icon: Sparkles,
	},
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
];

export default function UtilsLanding() {
	const [mounted, setMounted] = useState(false);
	const reduceMotion = useReducedMotion();
	useEffect(() => setMounted(true), []);

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
					className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4"
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
						operational utilities designed for performance and logistics.
					</p>
				</motion.div>

				{/* Selection Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
					{utilities.map((util, i) => (
						<motion.div
							key={util.slug}
							initial={reduceMotion ? false : { opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.04, duration: 0.4 }}
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
			</div>
		</main>
	);
}
