"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Parser } from "node-sql-parser";

// ─── Logic ────────────────────────────────────────────────────────────────

type Dialect = "postgresql" | "mysql" | "transactsql";

const DIALECT_OPTIONS = [
	{ label: "PostgreSQL", value: "postgresql" as Dialect },
	{ label: "MySQL", value: "mysql" as Dialect },
	{ label: "T-SQL", value: "transactsql" as Dialect },
];

/**
 * Validates SQL using node-sql-parser
 */
const validateSql = (sql: string, dialect: Dialect) => {
	const parser = new Parser();
	try {
		parser.astify(sql, { database: dialect });
		return { isValid: true, error: null };
	} catch (err: any) {
		return {
			isValid: false,
			error: {
				message: err.message,
				line: err.location?.start?.line,
				column: err.location?.start?.column,
			},
		};
	}
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function SqlFormatterView() {
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
		<main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 text-slate-900 pb-20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 relative z-10">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
					<div className="space-y-6">
						<Link
							href="/utils"
							className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 transition-colors gap-2 group"
						>
							<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
							Back to Utilities
						</Link>
						<div className="flex items-center gap-5">
							<div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 active:scale-90 transition-transform">
								<Database className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
							</div>
							<div>
								<h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 leading-none">
									SQL <span className="text-blue-600">Formatter</span>
								</h1>
								<p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] mt-3">
									Precise Validation & Structural Beautification
								</p>
							</div>
						</div>
					</div>

					<button
						onClick={handleClear}
						className="self-start flex items-center gap-2.5 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-all active:scale-95 shadow-sm"
					>
						<Trash2 className="w-4 h-4" /> Clear Editor
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
					{/* ─── Column 1: Configuration & Input ─── */}
					<div className="lg:col-span-5 space-y-6 sm:space-y-8">
						<section className="p-6 sm:p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm space-y-8">
							<div className="space-y-6">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
										<Settings2 className="w-4 h-4" />
									</div>
									<h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
										Dialect Settings
									</h2>
								</div>

								<div className="space-y-2">
									<span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block mb-2">
										SQL Dialect
									</span>
									<div className="grid grid-cols-3 gap-2">
										{DIALECT_OPTIONS.map((opt) => (
											<button
												key={opt.value}
												onClick={() => setDialect(opt.value)}
												className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all ${
													dialect === opt.value
														? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10"
														: "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-white"
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
								<div className="flex items-center justify-between px-1">
									<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
										<AlignLeft className="w-3.5 h-3.5" /> Raw Query
									</div>
								</div>
								<div className="relative group">
									<textarea
										value={input}
										onChange={(e) => setInput(e.target.value)}
										placeholder="SELECT * FROM users WHERE active = true;"
										className="w-full h-full min-h-[400px] p-8 bg-slate-50 border border-slate-200 rounded-[2rem] text-slate-900 font-mono text-sm leading-relaxed focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all resize-none placeholder:text-slate-200 scrollbar-hide"
										spellCheck={false}
									/>
									<button
										onClick={handleFormat}
										disabled={!input.trim()}
										className="absolute bottom-6 right-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
									>
										<RefreshCw className="w-4 h-4" /> Format SQL
									</button>
								</div>
							</div>
						</section>
					</div>

					{/* ─── Column 2: Result & Validation ─── */}
					<div className="lg:col-span-7 flex flex-col space-y-4">
						<div className="flex items-center justify-between px-3">
							<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
								<Code2 className="w-3.5 h-3.5" /> Formatted Output
							</div>
							{output && !error && (
								<button
									onClick={handleCopy}
									className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
										isCopied
											? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
											: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10"
									}`}
								>
									{isCopied ? (
										<Check className="w-3.5 h-3.5" />
									) : (
										<Copy className="w-3.5 h-3.5" />
									)}
									{isCopied ? "Copied" : "Copy Result"}
								</button>
							)}
						</div>

						<div className="flex-1 relative bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
							<AnimatePresence mode="wait">
								{error ? (
									<motion.div
										key="error"
										initial={{ opacity: 0, scale: 0.98 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.98 }}
										className="absolute inset-0 z-20 flex items-center justify-center p-12 text-center bg-white"
									>
										<div className="space-y-6 max-w-md">
											<div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto text-rose-500 shadow-sm shadow-rose-200/50">
												<AlertCircle className="w-10 h-10" />
											</div>
											<div className="space-y-3">
												<h3 className="text-slate-900 font-black uppercase tracking-[0.2em] text-sm">
													Syntax Error Detected
												</h3>
												<div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 text-left">
													<p className="text-rose-600 font-mono text-xs leading-relaxed mb-4">
														{error.message}
													</p>
													{(error.line || error.column) && (
														<div className="flex items-center gap-3">
															<span className="px-2 py-0.5 bg-rose-600 text-white rounded font-black text-[9px] uppercase tracking-tighter">
																LOC: {error.line}:{error.column}
															</span>
														</div>
													)}
												</div>
												<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
													Correct your query to proceed with formatting
												</p>
											</div>
										</div>
									</motion.div>
								) : output ? (
									<motion.div
										key="output"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="h-full p-10 overflow-auto scrollbar-hide"
									>
										<pre className="w-full h-full font-mono text-sm leading-[1.8] text-blue-600 select-all whitespace-pre-wrap">
											{output}
										</pre>
									</motion.div>
								) : (
									<div className="h-full flex items-center justify-center pointer-events-none">
										<div className="text-center space-y-6 opacity-5">
											<FileCode2 className="w-32 h-32 mx-auto" />
											<p className="font-black uppercase tracking-[1em] text-sm">
												Awaiting SQL
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
