"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft,
	GitCompare,
	ArrowRightLeft,
	Copy,
	Check,
	Download,
	Trash2,
	Columns2,
	AlignLeft,
	Sparkles,
	Sliders,
	Plus,
	Minus,
	FileCode2,
} from "lucide-react";
import type { DiffGranularity, DiffOptions, ViewMode } from "../types";
import { computeDiff, generateUnifiedPatch } from "../utils/diff-engine";
import { DIFF_SAMPLES } from "../utils/samples";

export default function DiffViewerView() {
	const reduceMotion = useReducedMotion();

	const defaultSample = DIFF_SAMPLES[0] || {
		original: "const x = 1;",
		modified: "const x = 2;",
	};

	const [originalText, setOriginalText] = useState(defaultSample.original);
	const [modifiedText, setModifiedText] = useState(defaultSample.modified);
	const [viewMode, setViewMode] = useState<ViewMode>("split");
	const [activeTab, setActiveTab] = useState<"visual" | "editor">("visual");

	const [options, setOptions] = useState<DiffOptions>({
		ignoreWhitespace: false,
		ignoreCase: false,
		granularity: "words",
	});

	const [isCopied, setIsCopied] = useState(false);

	// Compute diff and stats
	const { lines, stats } = useMemo(() => {
		return computeDiff(originalText, modifiedText, options);
	}, [originalText, modifiedText, options]);

	// Swap inputs
	const handleSwap = () => {
		setOriginalText(modifiedText);
		setModifiedText(originalText);
	};

	// Copy formatted diff
	const handleCopyDiff = () => {
		const patch = generateUnifiedPatch(originalText, modifiedText, "diff.txt");
		navigator.clipboard.writeText(patch);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	// Download .patch file
	const handleDownloadPatch = () => {
		const patch = generateUnifiedPatch(
			originalText,
			modifiedText,
			"changes.patch",
		);
		const blob = new Blob([patch], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "changes.patch";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	// Load sample
	const handleLoadSample = (sampleId: string) => {
		const sample = DIFF_SAMPLES.find((s) => s.id === sampleId);
		if (sample) {
			setOriginalText(sample.original);
			setModifiedText(sample.modified);
			setActiveTab("visual");
		}
	};

	// Clear all
	const handleClear = () => {
		setOriginalText("");
		setModifiedText("");
	};

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 pt-24 sm:pt-32 px-4 sm:px-6 lg:px-8">
			<div className="max-w-[1500px] mx-auto space-y-8">
				{/* Top Breadcrumb & Badge */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
				>
					<Link
						href="/utils"
						className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors gap-2 group !no-underline"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to Utilities
					</Link>
					<div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-600 shadow-2xs">
						<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
						LCS Algorithm • Sub-Word Granularity • 100% In-Browser
					</div>
				</motion.div>

				{/* Header Section */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex flex-col xl:flex-row xl:items-end justify-between gap-6"
				>
					<div className="space-y-3">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
								<GitCompare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
							</div>
							<div>
								<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
									Text & Code{" "}
									<span className="text-indigo-600">Diff Comparator</span>
								</h1>
								<p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
									Side-by-side and inline semantic text comparison with
									word-level diff highlighting and unified patch export.
								</p>
							</div>
						</div>
					</div>

					{/* Sample Presets Buttons */}
					<div className="flex flex-wrap items-center gap-2">
						{DIFF_SAMPLES.map((sample) => (
							<button
								key={sample.id}
								type="button"
								onClick={() => handleLoadSample(sample.id)}
								className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
							>
								<FileCode2 className="w-3.5 h-3.5 text-indigo-600" />
								<span>{sample.title.split(" ")[0]} Sample</span>
							</button>
						))}
					</div>
				</motion.div>

				{/* Global Control & Settings Bar */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5"
				>
					<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
						{/* Left: View Mode & Tab Selector */}
						<div className="flex flex-wrap items-center gap-3">
							{/* Visual vs Raw Editor */}
							<div className="flex items-center p-1 bg-slate-100 rounded-2xl gap-1">
								<button
									type="button"
									onClick={() => setActiveTab("visual")}
									className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
										activeTab === "visual"
											? "bg-slate-900 text-white shadow-xs"
											: "text-slate-600 hover:text-slate-900"
									}`}
								>
									<GitCompare className="w-3.5 h-3.5" />
									<span>Visual Diff View</span>
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("editor")}
									className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
										activeTab === "editor"
											? "bg-slate-900 text-white shadow-xs"
											: "text-slate-600 hover:text-slate-900"
									}`}
								>
									<Sliders className="w-3.5 h-3.5" />
									<span>Edit Inputs</span>
								</button>
							</div>

							{/* Split vs Unified (when in visual tab) */}
							{activeTab === "visual" && (
								<div className="flex items-center p-1 bg-slate-100 rounded-2xl gap-1">
									<button
										type="button"
										onClick={() => setViewMode("split")}
										className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
											viewMode === "split"
												? "bg-indigo-600 text-white shadow-xs"
												: "text-slate-600 hover:text-slate-900"
										}`}
									>
										<Columns2 className="w-3.5 h-3.5" />
										<span>Split View</span>
									</button>
									<button
										type="button"
										onClick={() => setViewMode("unified")}
										className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
											viewMode === "unified"
												? "bg-indigo-600 text-white shadow-xs"
												: "text-slate-600 hover:text-slate-900"
										}`}
									>
										<AlignLeft className="w-3.5 h-3.5" />
										<span>Unified View</span>
									</button>
								</div>
							)}
						</div>

						{/* Right: Granularity & Comparison Options */}
						<div className="flex flex-wrap items-center gap-4 lg:border-l lg:border-slate-200 lg:pl-6">
							{/* Granularity Dropdown */}
							<div className="flex items-center gap-2">
								<span className="text-xs font-bold text-slate-500 uppercase">
									Precision:
								</span>
								<select
									value={options.granularity}
									onChange={(e) =>
										setOptions((prev) => ({
											...prev,
											granularity: e.target.value as DiffGranularity,
										}))
									}
									className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
								>
									<option value="words">Word Level</option>
									<option value="chars">Character Level</option>
									<option value="lines">Line Only</option>
								</select>
							</div>

							{/* Ignore Whitespace & Case Checkboxes */}
							<label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
								<input
									type="checkbox"
									checked={options.ignoreWhitespace}
									onChange={(e) =>
										setOptions((prev) => ({
											...prev,
											ignoreWhitespace: e.target.checked,
										}))
									}
									className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
								/>
								<span>Ignore Whitespace</span>
							</label>

							<label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
								<input
									type="checkbox"
									checked={options.ignoreCase}
									onChange={(e) =>
										setOptions((prev) => ({
											...prev,
											ignoreCase: e.target.checked,
										}))
									}
									className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
								/>
								<span>Ignore Case</span>
							</label>
						</div>
					</div>
				</motion.div>

				{/* Statistics Bar & Action Buttons */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15 }}
					className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs"
				>
					{/* Diff Metrics */}
					<div className="flex flex-wrap items-center gap-3">
						<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-mono font-extrabold">
							<Plus className="w-3.5 h-3.5" />
							{stats.additions} addition{stats.additions !== 1 ? "s" : ""}
						</span>
						<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-mono font-extrabold">
							<Minus className="w-3.5 h-3.5" />
							{stats.deletions} deletion{stats.deletions !== 1 ? "s" : ""}
						</span>
						<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-mono font-bold">
							{stats.unchanged} unchanged
						</span>
						<span className="text-xs font-bold text-slate-500">
							• Similarity:{" "}
							<strong className="font-mono text-indigo-600 font-extrabold">
								{stats.similarityPercent}%
							</strong>
						</span>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2 flex-wrap">
						<button
							type="button"
							onClick={handleSwap}
							className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
							title="Swap Original and Modified texts"
						>
							<ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
							<span>Swap</span>
						</button>
						<button
							type="button"
							onClick={handleCopyDiff}
							className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
						>
							{isCopied ? (
								<Check className="w-3.5 h-3.5 text-emerald-600" />
							) : (
								<Copy className="w-3.5 h-3.5" />
							)}
							<span>{isCopied ? "Copied Patch" : "Copy Patch"}</span>
						</button>
						<button
							type="button"
							onClick={handleDownloadPatch}
							className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
						>
							<Download className="w-3.5 h-3.5" />
							<span>Export .patch</span>
						</button>
						<button
							type="button"
							onClick={handleClear}
							className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 rounded-xl transition-all cursor-pointer"
							title="Clear all text"
						>
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				</motion.div>

				{/* ═══════════════════════════════════════════════════════════════════ */}
				{/* TAB 1: VISUAL DIFF VIEW                                            */}
				{/* ═══════════════════════════════════════════════════════════════════ */}
				{activeTab === "visual" && (
					<motion.div
						key="visual-tab"
						initial={reduceMotion ? false : { opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm font-mono text-xs sm:text-sm"
					>
						{/* Split View */}
						{viewMode === "split" && (
							<div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
								{/* Left Header */}
								<div className="bg-slate-100/70 px-4 py-2.5 font-sans font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-200">
									<span>Original Version</span>
									<span className="text-[10px] font-mono text-slate-400">
										{stats.totalOldLines} lines
									</span>
								</div>
								{/* Right Header */}
								<div className="bg-slate-100/70 px-4 py-2.5 font-sans font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-200">
									<span>Modified Version</span>
									<span className="text-[10px] font-mono text-slate-400">
										{stats.totalNewLines} lines
									</span>
								</div>

								{/* Left Column Rows */}
								<div className="divide-y divide-slate-100 overflow-x-auto">
									{lines.map((line) => (
										<div
											key={`left-${line.id}`}
											className={`flex items-stretch min-h-[26px] ${
												line.type === "removed" || line.type === "modified"
													? "bg-rose-50/50"
													: line.type === "added"
														? "bg-slate-50/30 opacity-40"
														: ""
											}`}
										>
											<span className="w-12 px-2 py-1 bg-slate-100/50 text-slate-400 text-right select-none shrink-0 border-r border-slate-200/60 text-[11px]">
												{line.oldLineNumber || ""}
											</span>
											<div className="px-3 py-1 flex-1 overflow-x-auto whitespace-pre leading-relaxed">
												{line.type === "modified" && line.oldChunks ? (
													line.oldChunks.map((chunk, cIdx) => (
														<span
															key={`old-chunk-${cIdx}`}
															className={
																chunk.type === "removed"
																	? "bg-rose-200/80 text-rose-950 font-bold px-0.5 rounded"
																	: "text-slate-800"
															}
														>
															{chunk.text}
														</span>
													))
												) : line.type === "removed" ? (
													<span className="text-rose-900 font-medium">
														{line.oldContent}
													</span>
												) : (
													<span className="text-slate-800">
														{line.oldContent}
													</span>
												)}
											</div>
										</div>
									))}
								</div>

								{/* Right Column Rows */}
								<div className="divide-y divide-slate-100 overflow-x-auto">
									{lines.map((line) => (
										<div
											key={`right-${line.id}`}
											className={`flex items-stretch min-h-[26px] ${
												line.type === "added" || line.type === "modified"
													? "bg-emerald-50/50"
													: line.type === "removed"
														? "bg-slate-50/30 opacity-40"
														: ""
											}`}
										>
											<span className="w-12 px-2 py-1 bg-slate-100/50 text-slate-400 text-right select-none shrink-0 border-r border-slate-200/60 text-[11px]">
												{line.newLineNumber || ""}
											</span>
											<div className="px-3 py-1 flex-1 overflow-x-auto whitespace-pre leading-relaxed">
												{line.type === "modified" && line.newChunks ? (
													line.newChunks.map((chunk, cIdx) => (
														<span
															key={`new-chunk-${cIdx}`}
															className={
																chunk.type === "added"
																	? "bg-emerald-200/80 text-emerald-950 font-bold px-0.5 rounded"
																	: "text-slate-800"
															}
														>
															{chunk.text}
														</span>
													))
												) : line.type === "added" ? (
													<span className="text-emerald-900 font-medium">
														{line.newContent}
													</span>
												) : (
													<span className="text-slate-800">
														{line.newContent}
													</span>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Unified View */}
						{viewMode === "unified" && (
							<div className="divide-y divide-slate-100 overflow-x-auto">
								{lines.map((line) => {
									if (line.type === "modified") {
										return (
											<div key={`mod-${line.id}`}>
												{/* Removed row */}
												<div className="flex items-stretch bg-rose-50/60 text-rose-950">
													<span className="w-12 px-2 py-1 bg-rose-100/50 text-rose-500 text-right select-none shrink-0 border-r border-rose-200 text-[11px]">
														{line.oldLineNumber}
													</span>
													<span className="w-12 px-2 py-1 bg-rose-100/50 text-rose-400 text-right select-none shrink-0 border-r border-rose-200 text-[11px]" />
													<span className="w-6 text-center select-none shrink-0 font-bold text-rose-600 py-1">
														-
													</span>
													<div className="px-2 py-1 flex-1 overflow-x-auto whitespace-pre leading-relaxed">
														{line.oldChunks?.map((chunk, cIdx) => (
															<span
																key={`chunk-rm-${cIdx}`}
																className={
																	chunk.type === "removed"
																		? "bg-rose-200/90 text-rose-950 font-bold px-0.5 rounded"
																		: ""
																}
															>
																{chunk.text}
															</span>
														))}
													</div>
												</div>
												{/* Added row */}
												<div className="flex items-stretch bg-emerald-50/60 text-emerald-950 border-t border-slate-100">
													<span className="w-12 px-2 py-1 bg-emerald-100/50 text-emerald-400 text-right select-none shrink-0 border-r border-emerald-200 text-[11px]" />
													<span className="w-12 px-2 py-1 bg-emerald-100/50 text-emerald-600 text-right select-none shrink-0 border-r border-emerald-200 text-[11px]">
														{line.newLineNumber}
													</span>
													<span className="w-6 text-center select-none shrink-0 font-bold text-emerald-600 py-1">
														+
													</span>
													<div className="px-2 py-1 flex-1 overflow-x-auto whitespace-pre leading-relaxed">
														{line.newChunks?.map((chunk, cIdx) => (
															<span
																key={`chunk-ad-${cIdx}`}
																className={
																	chunk.type === "added"
																		? "bg-emerald-200/90 text-emerald-950 font-bold px-0.5 rounded"
																		: ""
																}
															>
																{chunk.text}
															</span>
														))}
													</div>
												</div>
											</div>
										);
									}

									if (line.type === "added") {
										return (
											<div
												key={`add-${line.id}`}
												className="flex items-stretch bg-emerald-50/60 text-emerald-950"
											>
												<span className="w-12 px-2 py-1 bg-emerald-100/50 text-emerald-400 text-right select-none shrink-0 border-r border-emerald-200 text-[11px]" />
												<span className="w-12 px-2 py-1 bg-emerald-100/50 text-emerald-600 text-right select-none shrink-0 border-r border-emerald-200 text-[11px]">
													{line.newLineNumber}
												</span>
												<span className="w-6 text-center select-none shrink-0 font-bold text-emerald-600 py-1">
													+
												</span>
												<div className="px-2 py-1 flex-1 overflow-x-auto whitespace-pre leading-relaxed font-medium">
													{line.newContent}
												</div>
											</div>
										);
									}

									if (line.type === "removed") {
										return (
											<div
												key={`rm-${line.id}`}
												className="flex items-stretch bg-rose-50/60 text-rose-950"
											>
												<span className="w-12 px-2 py-1 bg-rose-100/50 text-rose-600 text-right select-none shrink-0 border-r border-rose-200 text-[11px]">
													{line.oldLineNumber}
												</span>
												<span className="w-12 px-2 py-1 bg-rose-100/50 text-rose-400 text-right select-none shrink-0 border-r border-rose-200 text-[11px]" />
												<span className="w-6 text-center select-none shrink-0 font-bold text-rose-600 py-1">
													-
												</span>
												<div className="px-2 py-1 flex-1 overflow-x-auto whitespace-pre leading-relaxed font-medium">
													{line.oldContent}
												</div>
											</div>
										);
									}

									return (
										<div
											key={`unchanged-${line.id}`}
											className="flex items-stretch text-slate-700"
										>
											<span className="w-12 px-2 py-1 bg-slate-100/50 text-slate-400 text-right select-none shrink-0 border-r border-slate-200 text-[11px]">
												{line.oldLineNumber}
											</span>
											<span className="w-12 px-2 py-1 bg-slate-100/50 text-slate-400 text-right select-none shrink-0 border-r border-slate-200 text-[11px]">
												{line.newLineNumber}
											</span>
											<span className="w-6 text-center select-none shrink-0 text-slate-300 py-1">
												{" "}
											</span>
											<div className="px-2 py-1 flex-1 overflow-x-auto whitespace-pre leading-relaxed">
												{line.oldContent}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</motion.div>
				)}

				{/* ═══════════════════════════════════════════════════════════════════ */}
				{/* TAB 2: RAW EDITORS                                                 */}
				{/* ═══════════════════════════════════════════════════════════════════ */}
				{activeTab === "editor" && (
					<motion.div
						key="editor-tab"
						initial={reduceMotion ? false : { opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						className="grid grid-cols-1 lg:grid-cols-2 gap-6"
					>
						{/* Original Input */}
						<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
									<span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
									Original Text / Code
								</span>
								<span className="text-xs font-mono font-bold text-slate-400">
									{originalText.split("\n").length} lines
								</span>
							</div>
							<textarea
								value={originalText}
								onChange={(e) => setOriginalText(e.target.value)}
								placeholder="Paste original source here..."
								className="w-full h-96 p-4 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-xs sm:text-sm text-slate-900 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
							/>
						</div>

						{/* Modified Input */}
						<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
									<span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
									Modified Text / Code
								</span>
								<span className="text-xs font-mono font-bold text-slate-400">
									{modifiedText.split("\n").length} lines
								</span>
							</div>
							<textarea
								value={modifiedText}
								onChange={(e) => setModifiedText(e.target.value)}
								placeholder="Paste modified source here..."
								className="w-full h-96 p-4 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-xs sm:text-sm text-slate-900 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
							/>
						</div>
					</motion.div>
				)}

				{/* Guidelines & Spec Highlights */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4"
				>
					<div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-2 shadow-xs">
						<div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
							<Columns2 className="w-5 h-5" />
						</div>
						<h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
							Sub-Word Precision
						</h4>
						<p className="text-xs text-slate-600 font-medium leading-relaxed">
							Identifies and highlights the exact modified tokens, words, or
							characters within lines without full line replacers.
						</p>
					</div>

					<div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-2 shadow-xs">
						<div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
							<Sparkles className="w-5 h-5" />
						</div>
						<h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
							Git Patch Compatible
						</h4>
						<p className="text-xs text-slate-600 font-medium leading-relaxed">
							Exports standard unified `.patch` format ready to apply directly
							via `git apply` or share in code reviews.
						</p>
					</div>

					<div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-2 shadow-xs">
						<div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
							<Sliders className="w-5 h-5" />
						</div>
						<h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
							100% Private Sandbox
						</h4>
						<p className="text-xs text-slate-600 font-medium leading-relaxed">
							All diffing runs in your browser memory. Proprietary code and
							confidential configs are never sent over the network.
						</p>
					</div>
				</motion.div>
			</div>
		</main>
	);
}
