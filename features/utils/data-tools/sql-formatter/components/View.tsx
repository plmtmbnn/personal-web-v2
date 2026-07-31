"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	Database,
	Copy,
	Check,
	Trash2,
	Code2,
	AlertCircle,
	ArrowLeft,
	Settings2,
	RefreshCw,
	FileCode2,
	AlignLeft,
} from "lucide-react";
import Link from "next/link";
import { format as formatSql } from "sql-formatter";
import type { Dialect } from "../types";
import { DIALECT_OPTIONS } from "../types";
import { validateSql } from "../utils/sql";

// ─── Component ─────────────────────────────────────────────────────────────

export default function SqlFormatterView() {
	const reduceMotion = useReducedMotion();
	const [input, setInput] = useState("");
	const [output, setOutput] = useState("");
	const [dialect, setDialect] = useState<Dialect>("postgresql");
	const [error, setError] = useState<{
		message: string;
		line?: number;
		column?: number;
	} | null>(null);
	const [isCopied, setIsCopied] = useState(false);

	// ─── Handlers ─────────────────────────────────────────────────────────────

	const handleFormat = useCallback(() => {
		if (!input.trim()) return;

		// 1. Validate
		const { isValid, error: validationError } = validateSql(input, dialect);

		if (!isValid) {
			setError(validationError);
			// We still attempt to format even if invalid, or should we stop?
			// The requirement asks to display a clear error alert.
			// Let's stop if it's completely unparseable to avoid confusing output.
			setOutput("");
			return;
		}

		// 2. Format
		try {
			const formatted = formatSql(input, {
				language: dialect === "transactsql" ? "tsql" : dialect,
				tabWidth: 2,
				keywordCase: "upper",
				indentStyle: "tabularLeft",
			});
			setOutput(formatted);
			setError(null);
		} catch (err: any) {
			setError({ message: `Formatter Error: ${err.message}` });
		}
	}, [input, dialect]);

	const handleClear = () => {
		setInput("");
		setOutput("");
		setError(null);
	};

	const handleCopy = () => {
		if (!output) return;
		navigator.clipboard.writeText(output);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 pt-24 sm:pt-32 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
					<div className="space-y-4">
						<Link
							href="/utils"
							className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors gap-2 group !no-underline"
						>
							<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
							Back to Utilities
						</Link>
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20 shrink-0">
								<Database className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
							</div>
							<div>
								<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
									SQL <span className="text-indigo-600">Formatter</span>
								</h1>
								<p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
									Precise validation & structural query beautification.
								</p>
							</div>
						</div>
					</div>

					<button
						onClick={handleClear}
						className="self-start flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-xs cursor-pointer"
					>
						<Trash2 className="w-4 h-4" /> Clear Editor
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* ─── Column 1: Configuration & Input ─── */}
					<div className="lg:col-span-5 space-y-6">
						<section className="p-6 sm:p-8 bg-white border border-slate-200/80 rounded-[2.5rem] shadow-xl shadow-slate-200/50 space-y-6">
							<div className="space-y-4">
								<div className="flex items-center gap-2.5">
									<div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
										<Settings2 className="w-4 h-4" />
									</div>
									<h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
										Dialect Settings
									</h2>
								</div>

								<div className="space-y-2">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
										Select SQL Dialect
									</span>
									<div className="grid grid-cols-3 gap-2">
										{DIALECT_OPTIONS.map((opt) => (
											<button
												key={opt.value}
												onClick={() => setDialect(opt.value)}
												className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
													dialect === opt.value
														? "bg-slate-900 border-slate-900 text-white shadow-md"
														: "bg-slate-50/70 border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-white"
												}`}
											>
												{opt.label}
											</button>
										))}
									</div>
								</div>
							</div>

							<div className="h-px bg-slate-100" />

							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
										<AlignLeft className="w-4 h-4 text-indigo-600" /> Raw Query
										Input
									</div>
								</div>
								<div className="relative group">
									<textarea
										value={input}
										onChange={(e) => setInput(e.target.value)}
										placeholder="SELECT * FROM users WHERE active = true;"
										className="w-full min-h-[380px] p-6 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-slate-900 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all resize-none placeholder:text-slate-400"
										spellCheck={false}
									/>
									<button
										onClick={handleFormat}
										disabled={!input.trim()}
										className="absolute bottom-4 right-4 flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
									>
										<RefreshCw className="w-4 h-4" /> Format SQL
									</button>
								</div>
							</div>
						</section>
					</div>

					{/* ─── Column 2: Result & Validation ─── */}
					<div className="lg:col-span-7 flex flex-col space-y-4">
						<div className="flex items-center justify-between px-2">
							<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
								<Code2 className="w-4 h-4 text-indigo-600" /> Formatted Output
							</div>
							{output && !error && (
								<button
									onClick={handleCopy}
									className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
										isCopied
											? "bg-emerald-600 text-white shadow-md"
											: "bg-slate-900 text-white hover:bg-slate-800 shadow-md"
									}`}
								>
									{isCopied ? (
										<Check className="w-4 h-4" />
									) : (
										<Copy className="w-4 h-4" />
									)}
									{isCopied ? "Copied" : "Copy Result"}
								</button>
							)}
						</div>

						<div className="flex-1 relative bg-white border border-slate-200/80 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col min-h-[480px]">
							<AnimatePresence mode="wait">
								{error ? (
									<motion.div
										key="error"
										initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.98 }}
										className="absolute inset-0 z-20 flex items-center justify-center p-8 text-center bg-white"
									>
										<div className="space-y-6 max-w-md">
											<div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-xs border border-rose-100">
												<AlertCircle className="w-8 h-8" />
											</div>
											<div className="space-y-3">
												<h3 className="text-slate-900 font-extrabold uppercase tracking-wider text-xs sm:text-sm">
													Syntax Error Detected
												</h3>
												<div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 text-left">
													<p className="text-rose-600 font-mono text-xs leading-relaxed mb-3">
														{error.message}
													</p>
													{(error.line || error.column) && (
														<div className="flex items-center gap-2">
															<span className="px-2.5 py-1 bg-rose-600 text-white rounded-md font-bold text-[10px] uppercase tracking-wider">
																LOC: {error.line}:{error.column}
															</span>
														</div>
													)}
												</div>
												<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-2">
													Correct your query to proceed with formatting
												</p>
											</div>
										</div>
									</motion.div>
								) : output ? (
									<motion.div
										key="output"
										initial={reduceMotion ? false : { opacity: 0 }}
										animate={{ opacity: 1 }}
										className="h-full p-8 overflow-auto"
									>
										<pre className="w-full h-full font-mono text-xs sm:text-sm leading-relaxed text-indigo-700 font-semibold select-all whitespace-pre-wrap">
											{output}
										</pre>
									</motion.div>
								) : (
									<div className="h-full flex items-center justify-center pointer-events-none p-12">
										<div className="text-center space-y-4 opacity-20">
											<FileCode2 className="w-24 h-24 mx-auto text-slate-400" />
											<p className="font-extrabold uppercase tracking-widest text-xs text-slate-600">
												Awaiting SQL Input
											</p>
										</div>
									</div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
