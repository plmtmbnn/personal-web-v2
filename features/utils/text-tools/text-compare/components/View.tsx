"use client";

import { useState, useMemo, useRef, type ChangeEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft,
	ArrowRightLeft,
	Copy,
	Check,
	Download,
	Trash2,
	Columns2,
	AlignLeft,
	Sparkles,
	Plus,
	Minus,
	FileText,
	Upload,
	Clipboard,
	BookOpen,
	ListFilter,
	Search,
} from "lucide-react";
import type {
	ComparisonOptions,
	Granularity,
	TextComparisonMode,
} from "../types";
import {
	compareTexts,
	generateMarkdownReport,
} from "../utils/comparator-engine";
import { TEXT_COMPARE_SAMPLES } from "../utils/samples";

export default function TextCompareView() {
	const reduceMotion = useReducedMotion();

	const defaultSample = TEXT_COMPARE_SAMPLES[0] || {
		textA: "",
		textB: "",
	};

	const [textA, setTextA] = useState(defaultSample.textA);
	const [textB, setTextB] = useState(defaultSample.textB);
	const [mode, setMode] = useState<TextComparisonMode>("side-by-side");
	const [granularity, setGranularity] = useState<Granularity>("lines");

	const [options, setOptions] = useState<ComparisonOptions>({
		ignoreCase: false,
		ignoreWhitespace: false,
		ignorePunctuation: false,
		ignoreBlankLines: false,
		sortLines: false,
	});

	const [isCopiedMarkdown, setIsCopiedMarkdown] = useState(false);
	const [vocabSearch, setVocabSearch] = useState("");
	const [vocabTab, setVocabTab] = useState<"shared" | "uniqueA" | "uniqueB">(
		"shared",
	);

	const fileInputRefA = useRef<HTMLInputElement | null>(null);
	const fileInputRefB = useRef<HTMLInputElement | null>(null);

	// Compute comparison result
	const result = useMemo(() => {
		return compareTexts(textA, textB, options, granularity);
	}, [textA, textB, options, granularity]);

	const {
		statsA,
		statsB,
		metrics,
		rows,
		inlineChunks,
		differences,
		vocabulary,
	} = result;

	// Swap texts
	const handleSwap = () => {
		setTextA(textB);
		setTextB(textA);
	};

	// Clear both
	const handleClearAll = () => {
		setTextA("");
		setTextB("");
	};

	// Load sample preset
	const handleLoadSample = (sampleId: string) => {
		const sample = TEXT_COMPARE_SAMPLES.find((s) => s.id === sampleId);
		if (sample) {
			setTextA(sample.textA);
			setTextB(sample.textB);
		}
	};

	// Paste from clipboard
	const handlePaste = async (target: "A" | "B") => {
		try {
			const clip = await navigator.clipboard.readText();
			if (target === "A") setTextA(clip);
			else setTextB(clip);
		} catch {
			// Fallback: clipboard access denied
		}
	};

	// File upload handler
	const handleFileUpload = (
		e: ChangeEvent<HTMLInputElement>,
		target: "A" | "B",
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target?.result as string;
			if (typeof content === "string") {
				if (target === "A") setTextA(content);
				else setTextB(content);
			}
		};
		reader.readAsText(file);
		e.target.value = "";
	};

	// Copy formatted report markdown
	const handleCopyReport = () => {
		const md = generateMarkdownReport(result);
		navigator.clipboard.writeText(md);
		setIsCopiedMarkdown(true);
		setTimeout(() => setIsCopiedMarkdown(false), 2000);
	};

	// Download markdown report
	const handleDownloadReport = () => {
		const md = generateMarkdownReport(result);
		const blob = new Blob([md], { type: "text/markdown" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `text-comparison-report-${Date.now()}.md`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	// Filtered vocabulary based on search query
	const filteredVocab = useMemo(() => {
		const q = vocabSearch.trim().toLowerCase();
		if (!q) {
			return {
				shared: vocabulary.sharedWords,
				uniqueA: vocabulary.uniqueToA,
				uniqueB: vocabulary.uniqueToB,
			};
		}
		return {
			shared: vocabulary.sharedWords.filter((w) =>
				w.word.toLowerCase().includes(q),
			),
			uniqueA: vocabulary.uniqueToA.filter((w) =>
				w.word.toLowerCase().includes(q),
			),
			uniqueB: vocabulary.uniqueToB.filter((w) =>
				w.word.toLowerCase().includes(q),
			),
		};
	}, [vocabulary, vocabSearch]);

	// Color grading for similarity percentage
	const getSimilarityTheme = (pct: number) => {
		if (pct >= 90) {
			return {
				text: "text-emerald-700",
				bg: "bg-emerald-50",
				border: "border-emerald-200",
				badge: "bg-emerald-600 text-white",
				label: "Nearly Identical",
			};
		}
		if (pct >= 60) {
			return {
				text: "text-indigo-700",
				bg: "bg-indigo-50",
				border: "border-indigo-200",
				badge: "bg-indigo-600 text-white",
				label: "Moderately Modified",
			};
		}
		if (pct >= 30) {
			return {
				text: "text-amber-700",
				bg: "bg-amber-50",
				border: "border-amber-200",
				badge: "bg-amber-600 text-white",
				label: "Substantially Altered",
			};
		}
		return {
			text: "text-rose-700",
			bg: "bg-rose-50",
			border: "border-rose-200",
			badge: "bg-rose-600 text-white",
			label: "Completely Distinct",
		};
	};

	const simTheme = getSimilarityTheme(metrics.similarityPercent);

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 pt-24 sm:pt-32 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Breadcrumb & Navigation */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex flex-wrap items-center justify-between gap-4"
				>
					<Link
						href="/utils"
						className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors gap-2 group !no-underline"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to Utilities
					</Link>

					{/* Sample Preset Buttons */}
					<div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
						<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
							<Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Presets:
						</span>
						{TEXT_COMPARE_SAMPLES.map((sample) => (
							<button
								key={sample.id}
								type="button"
								onClick={() => handleLoadSample(sample.id)}
								className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200/80 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 shadow-2xs hover:shadow-xs transition-all shrink-0 cursor-pointer"
							>
								{sample.title}
							</button>
						))}
					</div>
				</motion.div>

				{/* Header Section */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="text-center max-w-3xl mx-auto space-y-4"
				>
					<div>
						<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs">
							<FileText className="w-4 h-4 text-indigo-600" />
							Text Comparison & Similarity Studio
						</span>
					</div>
					<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
						Compare 2 <span className="text-indigo-600">Texts</span>
					</h1>
					<p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
						Granular side-by-side diffs, prose inline tracking, Levenshtein edit
						distance, and vocabulary similarity matrix.
					</p>
				</motion.div>

				{/* Quick Stats & Overall Similarity Card */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1, duration: 0.4 }}
					className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4"
				>
					{/* Similarity Score Radial Card */}
					<div
						className={`col-span-2 p-4 rounded-2xl ${simTheme.bg} ${simTheme.border} border flex items-center justify-between gap-4`}
					>
						<div>
							<div className="flex items-center gap-2 mb-1">
								<span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
									Similarity Index
								</span>
								<span
									className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${simTheme.badge}`}
								>
									{simTheme.label}
								</span>
							</div>
							<div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
								{metrics.similarityPercent}%
							</div>
						</div>
						<div className="text-right space-y-0.5 text-xs font-semibold text-slate-600">
							<div>
								Jaccard:{" "}
								<span className="font-extrabold text-slate-900">
									{(metrics.jaccardIndex * 100).toFixed(0)}%
								</span>
							</div>
							<div>
								Dice:{" "}
								<span className="font-extrabold text-slate-900">
									{(metrics.diceCoefficient * 100).toFixed(0)}%
								</span>
							</div>
						</div>
					</div>

					{/* Levenshtein Edits */}
					<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
						<div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
							Edit Distance
						</div>
						<div className="text-xl sm:text-2xl font-extrabold text-slate-900">
							{metrics.levenshteinDistance}
						</div>
						<div className="text-[10px] font-semibold text-slate-500 mt-0.5">
							Levenshtein operations
						</div>
					</div>

					{/* Words Delta */}
					<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
						<div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
							Words Delta
						</div>
						<div
							className={`text-xl sm:text-2xl font-extrabold ${metrics.wordDelta > 0 ? "text-emerald-600" : metrics.wordDelta < 0 ? "text-rose-600" : "text-slate-900"}`}
						>
							{metrics.wordDelta > 0
								? `+${metrics.wordDelta}`
								: metrics.wordDelta}
						</div>
						<div className="text-[10px] font-semibold text-slate-500 mt-0.5">
							{statsA.wordCount} → {statsB.wordCount} words
						</div>
					</div>

					{/* Characters Delta */}
					<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
						<div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
							Chars Delta
						</div>
						<div
							className={`text-xl sm:text-2xl font-extrabold ${metrics.charDelta > 0 ? "text-emerald-600" : metrics.charDelta < 0 ? "text-rose-600" : "text-slate-900"}`}
						>
							{metrics.charDelta > 0
								? `+${metrics.charDelta}`
								: metrics.charDelta}
						</div>
						<div className="text-[10px] font-semibold text-slate-500 mt-0.5">
							{statsA.charCount} → {statsB.charCount} chars
						</div>
					</div>

					{/* Total Operations Count */}
					<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
						<div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
							Operations
						</div>
						<div className="text-xl sm:text-2xl font-extrabold text-slate-900">
							{metrics.totalChanges}
						</div>
						<div className="text-[10px] font-semibold text-slate-500 mt-0.5">
							<span className="text-emerald-600 font-bold">
								+{metrics.additionsCount}
							</span>{" "}
							<span className="text-rose-600 font-bold">
								-{metrics.deletionsCount}
							</span>{" "}
							<span className="text-amber-600 font-bold">
								~{metrics.modificationsCount}
							</span>
						</div>
					</div>
				</motion.div>

				{/* Dual Input Panels */}
				<div className="relative">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Input A - Original */}
						<div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
							<div>
								{/* Pane Header */}
								<div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
									<div className="flex items-center gap-2">
										<span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
										<h2 className="text-sm sm:text-base font-extrabold text-slate-900">
											Original Text (A)
										</h2>
									</div>
									<div className="flex items-center gap-1.5">
										{/* Paste */}
										<button
											type="button"
											onClick={() => handlePaste("A")}
											className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
											title="Paste from clipboard"
										>
											<Clipboard className="w-3.5 h-3.5" />
											<span className="hidden sm:inline">Paste</span>
										</button>
										{/* Upload */}
										<button
											type="button"
											onClick={() => fileInputRefA.current?.click()}
											className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
											title="Upload document or file"
										>
											<Upload className="w-3.5 h-3.5" />
											<span className="hidden sm:inline">Upload</span>
										</button>
										<input
											ref={fileInputRefA}
											type="file"
											accept=".txt,.md,.json,.csv,.log,.js,.ts,.html,.css"
											onChange={(e) => handleFileUpload(e, "A")}
											className="hidden"
										/>
										{/* Clear */}
										<button
											type="button"
											onClick={() => setTextA("")}
											disabled={!textA}
											className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold disabled:opacity-30 cursor-pointer"
											title="Clear Text A"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									</div>
								</div>

								{/* Textarea */}
								<div className="mt-3">
									<textarea
										value={textA}
										onChange={(e) => setTextA(e.target.value)}
										placeholder="Paste or type original text snippet here..."
										rows={10}
										className="w-full bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y leading-relaxed"
									/>
								</div>
							</div>

							{/* Pane Footer Stats */}
							<div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
								<div className="flex items-center gap-3">
									<span>
										Words:{" "}
										<strong className="text-slate-800">
											{statsA.wordCount}
										</strong>
									</span>
									<span>
										Chars:{" "}
										<strong className="text-slate-800">
											{statsA.charCount}
										</strong>
									</span>
									<span>
										Lines:{" "}
										<strong className="text-slate-800">
											{statsA.lineCount}
										</strong>
									</span>
								</div>
								<div>
									Est. Reading:{" "}
									<strong className="text-slate-800">
										~{statsA.readingTimeSeconds}s
									</strong>
								</div>
							</div>
						</div>

						{/* Input B - Modified */}
						<div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
							<div>
								{/* Pane Header */}
								<div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
									<div className="flex items-center gap-2">
										<span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
										<h2 className="text-sm sm:text-base font-extrabold text-slate-900">
											Modified Text (B)
										</h2>
									</div>
									<div className="flex items-center gap-1.5">
										{/* Paste */}
										<button
											type="button"
											onClick={() => handlePaste("B")}
											className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
											title="Paste from clipboard"
										>
											<Clipboard className="w-3.5 h-3.5" />
											<span className="hidden sm:inline">Paste</span>
										</button>
										{/* Upload */}
										<button
											type="button"
											onClick={() => fileInputRefB.current?.click()}
											className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
											title="Upload document or file"
										>
											<Upload className="w-3.5 h-3.5" />
											<span className="hidden sm:inline">Upload</span>
										</button>
										<input
											ref={fileInputRefB}
											type="file"
											accept=".txt,.md,.json,.csv,.log,.js,.ts,.html,.css"
											onChange={(e) => handleFileUpload(e, "B")}
											className="hidden"
										/>
										{/* Clear */}
										<button
											type="button"
											onClick={() => setTextB("")}
											disabled={!textB}
											className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold disabled:opacity-30 cursor-pointer"
											title="Clear Text B"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									</div>
								</div>

								{/* Textarea */}
								<div className="mt-3">
									<textarea
										value={textB}
										onChange={(e) => setTextB(e.target.value)}
										placeholder="Paste or type modified text snippet here..."
										rows={10}
										className="w-full bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y leading-relaxed"
									/>
								</div>
							</div>

							{/* Pane Footer Stats */}
							<div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
								<div className="flex items-center gap-3">
									<span>
										Words:{" "}
										<strong className="text-slate-800">
											{statsB.wordCount}
										</strong>
									</span>
									<span>
										Chars:{" "}
										<strong className="text-slate-800">
											{statsB.charCount}
										</strong>
									</span>
									<span>
										Lines:{" "}
										<strong className="text-slate-800">
											{statsB.lineCount}
										</strong>
									</span>
								</div>
								<div>
									Est. Reading:{" "}
									<strong className="text-slate-800">
										~{statsB.readingTimeSeconds}s
									</strong>
								</div>
							</div>
						</div>
					</div>

					{/* Centered Floating Swap Button */}
					<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex z-20">
						<button
							type="button"
							onClick={handleSwap}
							className="w-12 h-12 rounded-full bg-slate-900 text-white shadow-xl shadow-slate-900/20 border-4 border-slate-50 flex items-center justify-center hover:scale-110 hover:bg-indigo-600 active:scale-95 transition-all cursor-pointer group"
							title="Swap Text A and Text B"
						>
							<ArrowRightLeft className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
						</button>
					</div>
				</div>

				{/* Mobile Swap & Clear All Actions */}
				<div className="flex items-center justify-center gap-3 lg:hidden">
					<button
						type="button"
						onClick={handleSwap}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs active:scale-95 cursor-pointer"
					>
						<ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
						Swap Texts
					</button>
					<button
						type="button"
						onClick={handleClearAll}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-rose-600 shadow-xs active:scale-95 cursor-pointer"
					>
						<Trash2 className="w-3.5 h-3.5" />
						Clear All
					</button>
				</div>

				{/* Options & Granularity Toolbar */}
				<div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
					{/* Left: View Mode Pills */}
					<div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
						<button
							type="button"
							onClick={() => setMode("side-by-side")}
							className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
								mode === "side-by-side"
									? "bg-slate-900 text-white shadow-xs"
									: "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
							}`}
						>
							<Columns2 className="w-3.5 h-3.5" />
							<span>Side-by-Side</span>
						</button>
						<button
							type="button"
							onClick={() => setMode("inline")}
							className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
								mode === "inline"
									? "bg-slate-900 text-white shadow-xs"
									: "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
							}`}
						>
							<AlignLeft className="w-3.5 h-3.5" />
							<span>Inline Prose</span>
						</button>
						<button
							type="button"
							onClick={() => setMode("differences-only")}
							className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
								mode === "differences-only"
									? "bg-slate-900 text-white shadow-xs"
									: "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
							}`}
						>
							<ListFilter className="w-3.5 h-3.5" />
							<span>Change Log ({differences.length})</span>
						</button>
						<button
							type="button"
							onClick={() => setMode("vocabulary")}
							className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
								mode === "vocabulary"
									? "bg-slate-900 text-white shadow-xs"
									: "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
							}`}
						>
							<BookOpen className="w-3.5 h-3.5" />
							<span>Vocabulary</span>
						</button>
					</div>

					{/* Right: Granularity & Normalization Toggles */}
					<div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
						{/* Granularity Selector */}
						<div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
							{(["words", "chars", "lines", "sentences"] as Granularity[]).map(
								(g) => (
									<button
										key={g}
										type="button"
										onClick={() => setGranularity(g)}
										className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
											granularity === g
												? "bg-white text-slate-900 shadow-2xs"
												: "text-slate-500 hover:text-slate-900"
										}`}
									>
										{g}
									</button>
								),
							)}
						</div>

						{/* Quick Normalization Checkboxes */}
						<div className="flex items-center gap-2 ml-1">
							<button
								type="button"
								onClick={() =>
									setOptions((prev) => ({
										...prev,
										ignoreCase: !prev.ignoreCase,
									}))
								}
								className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
									options.ignoreCase
										? "bg-indigo-50 border-indigo-200 text-indigo-700"
										: "bg-white border-slate-200/80 text-slate-600 hover:border-slate-300"
								}`}
								title="Ignore uppercase vs lowercase differences"
							>
								Aa Case
							</button>
							<button
								type="button"
								onClick={() =>
									setOptions((prev) => ({
										...prev,
										ignoreWhitespace: !prev.ignoreWhitespace,
									}))
								}
								className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
									options.ignoreWhitespace
										? "bg-indigo-50 border-indigo-200 text-indigo-700"
										: "bg-white border-slate-200/80 text-slate-600 hover:border-slate-300"
								}`}
								title="Ignore consecutive spaces and line indentation"
							>
								\s Space
							</button>
							<button
								type="button"
								onClick={() =>
									setOptions((prev) => ({
										...prev,
										ignorePunctuation: !prev.ignorePunctuation,
									}))
								}
								className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
									options.ignorePunctuation
										? "bg-indigo-50 border-indigo-200 text-indigo-700"
										: "bg-white border-slate-200/80 text-slate-600 hover:border-slate-300"
								}`}
								title="Ignore punctuation marks"
							>
								!? Punct
							</button>
							<button
								type="button"
								onClick={() =>
									setOptions((prev) => ({
										...prev,
										sortLines: !prev.sortLines,
									}))
								}
								className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
									options.sortLines
										? "bg-indigo-50 border-indigo-200 text-indigo-700"
										: "bg-white border-slate-200/80 text-slate-600 hover:border-slate-300"
								}`}
								title="Alphabetically sort lines before comparing (great for email/ID lists)"
							>
								A→Z Sort
							</button>
						</div>
					</div>
				</div>

				{/* Visual Comparison Area */}
				<motion.div
					key={mode}
					initial={reduceMotion ? false : { opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden"
				>
					{/* Mode: Side by Side Dual View */}
					{mode === "side-by-side" && (
						<div>
							{/* Header row */}
							<div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200/80 px-4 py-3 text-xs font-extrabold text-slate-700">
								<div className="flex items-center gap-2">
									<span className="w-2 h-2 rounded-full bg-rose-500" />
									<span>Original (Text A)</span>
								</div>
								<div className="flex items-center gap-2 border-l border-slate-200/80 pl-4">
									<span className="w-2 h-2 rounded-full bg-emerald-500" />
									<span>Modified (Text B)</span>
								</div>
							</div>

							{/* Diff Table / Rows */}
							<div className="divide-y divide-slate-100 font-mono text-xs sm:text-sm overflow-x-auto max-h-[600px] overflow-y-auto">
								{rows.length > 0 ? (
									rows.map((row) => (
										<div
											key={row.id}
											className={`grid grid-cols-2 transition-colors ${
												row.type === "added"
													? "bg-emerald-50/40"
													: row.type === "removed"
														? "bg-rose-50/40"
														: row.type === "modified"
															? "bg-amber-50/30"
															: "hover:bg-slate-50/60"
											}`}
										>
											{/* Left Pane (Old) */}
											<div className="flex items-start gap-2 p-2 sm:p-2.5 overflow-hidden">
												<span className="w-8 shrink-0 text-[11px] text-slate-400 select-none text-right font-sans font-medium">
													{row.oldLineNumber ?? ""}
												</span>
												<div className="flex-1 overflow-x-auto whitespace-pre-wrap break-all">
													{row.oldChunks ? (
														row.oldChunks.map((chunk, ci) => (
															<span
																key={ci}
																className={
																	chunk.type === "removed"
																		? "bg-rose-200/70 text-rose-900 rounded-xs px-0.5"
																		: chunk.type === "added"
																			? "bg-emerald-200/70 text-emerald-900 rounded-xs px-0.5"
																			: ""
																}
															>
																{chunk.text}
															</span>
														))
													) : (
														<span className="text-slate-800">
															{row.oldContent || " "}
														</span>
													)}
												</div>
											</div>

											{/* Right Pane (New) */}
											<div className="flex items-start gap-2 p-2 sm:p-2.5 border-l border-slate-200/80 overflow-hidden">
												<span className="w-8 shrink-0 text-[11px] text-slate-400 select-none text-right font-sans font-medium">
													{row.newLineNumber ?? ""}
												</span>
												<div className="flex-1 overflow-x-auto whitespace-pre-wrap break-all">
													{row.newChunks ? (
														row.newChunks.map((chunk, ci) => (
															<span
																key={ci}
																className={
																	chunk.type === "added"
																		? "bg-emerald-200/70 text-emerald-900 rounded-xs px-0.5"
																		: chunk.type === "removed"
																			? "bg-rose-200/70 text-rose-900 rounded-xs px-0.5"
																			: ""
																}
															>
																{chunk.text}
															</span>
														))
													) : (
														<span className="text-slate-800">
															{row.newContent || " "}
														</span>
													)}
												</div>
											</div>
										</div>
									))
								) : (
									<div className="py-16 text-center text-slate-400 font-sans text-xs">
										Enter text into both panes above to inspect side-by-side
										differences.
									</div>
								)}
							</div>
						</div>
					)}

					{/* Mode: Inline Prose View */}
					{mode === "inline" && (
						<div className="p-6 sm:p-8 space-y-4">
							<div className="flex items-center justify-between pb-4 border-b border-slate-100">
								<div>
									<h2 className="text-sm sm:text-base font-extrabold text-slate-900">
										Inline Document Diff
									</h2>
									<p className="text-xs text-slate-500 font-medium mt-0.5">
										Visual prose markup: deleted elements are struck out in red,
										additions are highlighted in green.
									</p>
								</div>
								<div className="flex items-center gap-2 text-xs font-bold">
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 text-rose-800">
										<Minus className="w-3 h-3" /> Deletions
									</span>
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
										<Plus className="w-3 h-3" /> Additions
									</span>
								</div>
							</div>

							<div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/60 leading-relaxed text-sm sm:text-base text-slate-800 whitespace-pre-wrap break-words max-h-[600px] overflow-y-auto">
								{inlineChunks.length > 0 ? (
									inlineChunks.map((chunk, i) => {
										if (chunk.type === "removed") {
											return (
												<span
													key={i}
													className="bg-rose-100/90 text-rose-800 line-through rounded-sm px-1 py-0.5 mx-0.5 font-medium select-text"
												>
													{chunk.text}
												</span>
											);
										}
										if (chunk.type === "added") {
											return (
												<span
													key={i}
													className="bg-emerald-100/90 text-emerald-800 rounded-sm px-1 py-0.5 mx-0.5 font-medium select-text"
												>
													{chunk.text}
												</span>
											);
										}
										return <span key={i}>{chunk.text}</span>;
									})
								) : (
									<div className="py-12 text-center text-slate-400 text-xs">
										No text available for inline prose diff.
									</div>
								)}
							</div>
						</div>
					)}

					{/* Mode: Differences Only Change Log */}
					{mode === "differences-only" && (
						<div className="p-6 sm:p-8 space-y-4">
							<div className="flex items-center justify-between pb-4 border-b border-slate-100">
								<div>
									<h2 className="text-sm sm:text-base font-extrabold text-slate-900">
										Itemized Change Log
									</h2>
									<p className="text-xs text-slate-500 font-medium mt-0.5">
										List of all {differences.length} isolated changes,
										insertions, and deletions.
									</p>
								</div>
							</div>

							<div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
								{differences.length > 0 ? (
									differences.map((diff) => (
										<div
											key={diff.id}
											className="p-4 rounded-2xl border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
										>
											<div className="flex items-center justify-between gap-2">
												<div className="flex items-center gap-2">
													<span
														className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
															diff.type === "added"
																? "bg-emerald-100 text-emerald-800"
																: diff.type === "removed"
																	? "bg-rose-100 text-rose-800"
																	: "bg-amber-100 text-amber-800"
														}`}
													>
														{diff.type}
													</span>
													<span className="text-xs font-bold text-slate-700">
														{diff.position}
													</span>
												</div>
												<span className="text-xs text-slate-400 font-medium">
													{diff.description}
												</span>
											</div>

											{diff.oldSnippet && (
												<div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-100 text-xs font-mono text-rose-900 whitespace-pre-wrap break-all flex items-start gap-2">
													<Minus className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
													<span>{diff.oldSnippet}</span>
												</div>
											)}

											{diff.newSnippet && (
												<div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 text-xs font-mono text-emerald-900 whitespace-pre-wrap break-all flex items-start gap-2">
													<Plus className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
													<span>{diff.newSnippet}</span>
												</div>
											)}
										</div>
									))
								) : (
									<div className="py-16 text-center space-y-2">
										<Check className="w-8 h-8 text-emerald-500 mx-auto" />
										<h3 className="text-sm font-bold text-slate-800">
											Zero Differences Found
										</h3>
										<p className="text-xs text-slate-500">
											Text A and Text B are completely identical under current
											normalization settings.
										</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Mode: Vocabulary Matrix */}
					{mode === "vocabulary" && (
						<div className="p-6 sm:p-8 space-y-6">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
								<div>
									<h2 className="text-sm sm:text-base font-extrabold text-slate-900">
										Vocabulary Overlap Matrix
									</h2>
									<p className="text-xs text-slate-500 font-medium mt-0.5">
										Breakdown of shared terminology versus distinct vocabulary
										unique to each version.
									</p>
								</div>

								{/* Search Filter in Vocab */}
								<div className="relative max-w-xs w-full">
									<Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
									<input
										type="text"
										value={vocabSearch}
										onChange={(e) => setVocabSearch(e.target.value)}
										placeholder="Filter vocabulary..."
										className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
									/>
								</div>
							</div>

							{/* Vocab Segmented Pills */}
							<div className="flex items-center gap-2 overflow-x-auto pb-1">
								<button
									type="button"
									onClick={() => setVocabTab("shared")}
									className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
										vocabTab === "shared"
											? "bg-slate-900 text-white shadow-xs"
											: "bg-slate-100 text-slate-600 hover:bg-slate-200"
									}`}
								>
									<span>Shared Vocabulary</span>
									<span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-200">
										{vocabulary.totalShared}
									</span>
								</button>
								<button
									type="button"
									onClick={() => setVocabTab("uniqueA")}
									className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
										vocabTab === "uniqueA"
											? "bg-rose-600 text-white shadow-xs"
											: "bg-rose-50 text-rose-700 hover:bg-rose-100"
									}`}
								>
									<span>Unique to Text A</span>
									<span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-700 text-rose-100">
										{vocabulary.totalUniqueA}
									</span>
								</button>
								<button
									type="button"
									onClick={() => setVocabTab("uniqueB")}
									className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
										vocabTab === "uniqueB"
											? "bg-emerald-600 text-white shadow-xs"
											: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
									}`}
								>
									<span>Unique to Text B</span>
									<span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-700 text-emerald-100">
										{vocabulary.totalUniqueB}
									</span>
								</button>
							</div>

							{/* Vocab Tags Cloud */}
							<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60 min-h-[220px] max-h-[450px] overflow-y-auto">
								{vocabTab === "shared" && (
									<div className="flex flex-wrap gap-2">
										{filteredVocab.shared.length > 0 ? (
											filteredVocab.shared.map((item) => (
												<span
													key={item.word}
													className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-medium text-slate-800 shadow-2xs"
												>
													<strong>{item.word}</strong>
													<span className="text-[10px] text-slate-400 font-bold">
														(A:{item.countA} | B:{item.countB})
													</span>
												</span>
											))
										) : (
											<div className="w-full py-8 text-center text-slate-400 text-xs">
												No shared vocabulary found matching query.
											</div>
										)}
									</div>
								)}

								{vocabTab === "uniqueA" && (
									<div className="flex flex-wrap gap-2">
										{filteredVocab.uniqueA.length > 0 ? (
											filteredVocab.uniqueA.map((item) => (
												<span
													key={item.word}
													className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200/80 text-xs font-medium text-rose-900 shadow-2xs"
												>
													<strong>{item.word}</strong>
													<span className="text-[10px] text-rose-500 font-bold">
														x{item.countA}
													</span>
												</span>
											))
										) : (
											<div className="w-full py-8 text-center text-slate-400 text-xs">
												No unique words exclusively in Text A.
											</div>
										)}
									</div>
								)}

								{vocabTab === "uniqueB" && (
									<div className="flex flex-wrap gap-2">
										{filteredVocab.uniqueB.length > 0 ? (
											filteredVocab.uniqueB.map((item) => (
												<span
													key={item.word}
													className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs font-medium text-emerald-900 shadow-2xs"
												>
													<strong>{item.word}</strong>
													<span className="text-[10px] text-emerald-600 font-bold">
														x{item.countB}
													</span>
												</span>
											))
										) : (
											<div className="w-full py-8 text-center text-slate-400 text-xs">
												No unique words exclusively in Text B.
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					)}
				</motion.div>

				{/* Export & Actions Footer Bar */}
				<div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3 text-xs font-bold text-slate-600">
						<span className="flex items-center gap-1.5">
							<span className="w-2 h-2 rounded-full bg-emerald-500" />
							{metrics.similarityPercent}% Overlap
						</span>
						<span>•</span>
						<span>{metrics.totalChanges} modifications detected</span>
					</div>

					<div className="flex items-center gap-2.5">
						<button
							type="button"
							onClick={handleCopyReport}
							className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer active:scale-95"
						>
							{isCopiedMarkdown ? (
								<>
									<Check className="w-3.5 h-3.5 text-emerald-600" />
									<span>Copied Report!</span>
								</>
							) : (
								<>
									<Copy className="w-3.5 h-3.5" />
									<span>Copy Summary (.md)</span>
								</>
							)}
						</button>

						<button
							type="button"
							onClick={handleDownloadReport}
							className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
						>
							<Download className="w-3.5 h-3.5" />
							<span>Download Report</span>
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
