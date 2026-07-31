"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	ArrowLeft,
	ArrowRightLeft,
	ClipboardCheck,
	Copy,
	RotateCcw,
	Code2,
	AlertCircle,
	AlignLeft,
	Zap,
	Minimize2,
	Maximize2,
} from "lucide-react";
import Link from "next/link";

import type { CaseType } from "../utils/case";
import { toWords, fromWords, transformObject } from "../utils/case";

// ─── View Component ─────────────────────────────────────────────────────────

export default function CaseConverterView() {
	const reduceMotion = useReducedMotion();
	const [input, setInput] = useState("");
	const [output, setOutput] = useState("");
	const [isCopied, setIsCopied] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isInputCollapsed, setIsInputCollapsed] = useState(false);
	const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);

	const convert = useCallback(
		(target: CaseType) => {
			if (!input.trim()) return;

			setError(null);
			const trimmed = input.trim();

			// Detect if input is JSON
			if (
				(trimmed.startsWith("{") && trimmed.endsWith("}")) ||
				(trimmed.startsWith("[") && trimmed.endsWith("]"))
			) {
				try {
					const parsed = JSON.parse(trimmed);
					const transformed = transformObject(parsed, target);
					setOutput(JSON.stringify(transformed, null, 2));
				} catch (e: any) {
					setError(`Malformed JSON: ${e.message}`);
					// Fallback to line-by-line if JSON parse fails
					const lines = input.split("\n");
					const results = lines.map((line) => {
						const words = toWords(line);
						return fromWords(words, target);
					});
					setOutput(results.join("\n"));
				}
			} else {
				// Line by line variable processing
				const lines = input.split("\n");
				const results = lines.map((line) => {
					const words = toWords(line);
					return fromWords(words, target);
				});
				setOutput(results.join("\n"));
			}
		},
		[input],
	);

	const handleCopy = () => {
		if (!output) return;
		navigator.clipboard.writeText(output);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	const handleReset = () => {
		setInput("");
		setOutput("");
		setError(null);
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
								<ArrowRightLeft className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
							</div>
							<div>
								<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
									Case <span className="text-indigo-600">Converter</span>
								</h1>
								<p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
									Recursive variable name & JSON key transformation.
								</p>
							</div>
						</div>
					</div>

					<button
						onClick={handleReset}
						className="self-start flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-xs cursor-pointer"
					>
						<RotateCcw className="w-4 h-4" /> Reset Workspace
					</button>
				</div>

				{/* Editor Layout */}
				<div className="flex flex-col xl:flex-row gap-4 sm:gap-8 items-stretch min-h-[500px] xl:min-h-[600px]">
					{/* Input Pane */}
					<motion.div
						layout
						className={`flex flex-col space-y-4 transition-all duration-300 ${
							isInputCollapsed
								? "w-full xl:w-20"
								: isOutputCollapsed
									? "flex-1"
									: "flex-[1.5]"
						}`}
					>
						<div className="flex items-center gap-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap overflow-hidden">
							<button
								onClick={() => setIsInputCollapsed(!isInputCollapsed)}
								className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
							>
								{isInputCollapsed ? (
									<Maximize2 className="w-3.5 h-3.5" />
								) : (
									<Minimize2 className="w-3.5 h-3.5" />
								)}
							</button>
							{!isInputCollapsed && (
								<>
									<AlignLeft className="w-3.5 h-3.5 flex-shrink-0" />
									<span>Source Code / JSON</span>
								</>
							)}
						</div>
						<div
							className={`flex-1 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all ${
								isInputCollapsed ? "opacity-40" : "opacity-100"
							}`}
						>
							{!isInputCollapsed ? (
								<textarea
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder='paste_variable_names or {"json_keys": "data"}'
									className="w-full h-full p-8 bg-transparent text-slate-900 font-mono text-sm leading-relaxed focus:outline-none resize-none placeholder:text-slate-200 scrollbar-hide"
									spellCheck={false}
								/>
							) : (
								<div
									className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors py-10"
									onClick={() => setIsInputCollapsed(false)}
								>
									<AlignLeft className="w-6 h-6 text-slate-300" />
								</div>
							)}
						</div>
					</motion.div>

					{/* Center Controls */}
					<div className="flex flex-col justify-center py-4 xl:py-12 flex-shrink-0 w-full xl:w-[180px]">
						<div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-col gap-2 sm:gap-3">
							{[
								{ label: "camelCase", type: "camel" },
								{ label: "PascalCase", type: "pascal" },
								{ label: "snake_case", type: "snake" },
								{ label: "kebab-case", type: "kebab" },
								{ label: "UPPER CASE", type: "upper" },
								{ label: "lower case", type: "lower" },
								{ label: "Capitalize", type: "capitalize" },
							].map((btn) => (
								<motion.button
									key={btn.type}
									whileHover={{ scale: 1.02, x: 5 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => convert(btn.type as CaseType)}
									className="w-full py-3 px-3 bg-slate-900 text-white rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-blue-600 transition-all flex items-center justify-center text-center min-h-[44px]"
								>
									{btn.label}
								</motion.button>
							))}
							<button
								onClick={handleReset}
								className="xl:hidden py-3 px-3 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:text-rose-600 transition-all min-h-[44px]"
							>
								Reset
							</button>
						</div>
					</div>

					{/* Output Pane */}
					<motion.div
						layout
						className={`flex flex-col space-y-4 transition-all duration-300 ${
							isOutputCollapsed
								? "w-full xl:w-20"
								: isInputCollapsed
									? "flex-1"
									: "flex-[1.5]"
						}`}
					>
						<div className="flex items-center justify-between px-3 h-8">
							<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap overflow-hidden">
								<button
									onClick={() => setIsOutputCollapsed(!isOutputCollapsed)}
									className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
								>
									{isOutputCollapsed ? (
										<Maximize2 className="w-3.5 h-3.5" />
									) : (
										<Minimize2 className="w-3.5 h-3.5" />
									)}
								</button>
								{!isOutputCollapsed && (
									<>
										<Code2 className="w-3.5 h-3.5 flex-shrink-0" />
										<span>Resulting Case</span>
									</>
								)}
							</div>
							{!isOutputCollapsed && output && (
								<button
									onClick={handleCopy}
									className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
										isCopied
											? "bg-emerald-50 text-emerald-600 border border-emerald-200"
											: "bg-slate-100 text-slate-600 hover:bg-slate-200"
									}`}
								>
									{isCopied ? (
										<ClipboardCheck className="w-3 h-3" />
									) : (
										<Copy className="w-3 h-3" />
									)}
									{isCopied ? "Copied!" : "Copy Output"}
								</button>
							)}
						</div>
						<div
							className={`flex-1 relative bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden group ${
								isOutputCollapsed ? "opacity-40" : "opacity-100"
							}`}
						>
							{!isOutputCollapsed ? (
								<AnimatePresence mode="wait">
									{error ? (
										<motion.div
											key="error"
											initial={reduceMotion ? false : { opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="absolute inset-0 flex items-center justify-center p-12 text-center"
										>
											<div className="space-y-4">
												<div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
													<AlertCircle className="w-8 h-8" />
												</div>
												<div className="space-y-1">
													<p className="text-slate-900 font-black uppercase tracking-widest text-xs">
														Input Warning
													</p>
													<p className="text-slate-500 text-[10px] font-medium leading-relaxed">
														{error}. Lines processed individually.
													</p>
												</div>
											</div>
										</motion.div>
									) : output ? (
										<motion.div
											key="output"
											initial={reduceMotion ? false : { opacity: 0 }}
											animate={{ opacity: 1 }}
											className="h-full"
										>
											<pre className="w-full h-full p-8 font-mono text-sm leading-relaxed text-blue-600 overflow-auto scrollbar-hide select-all">
												{output}
											</pre>
										</motion.div>
									) : (
										<div className="h-full flex items-center justify-center pointer-events-none">
											<div className="text-center space-y-4 opacity-[0.03]">
												<Zap className="w-32 h-32 mx-auto" />
												<p className="font-black uppercase tracking-[1em] text-sm">
													Ready to Convert
												</p>
											</div>
										</div>
									)}
								</AnimatePresence>
							) : (
								<div
									className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors py-10"
									onClick={() => setIsOutputCollapsed(false)}
								>
									<Code2 className="w-6 h-6 text-slate-300" />
								</div>
							)}
						</div>
					</motion.div>
				</div>
			</div>
		</main>
	);
}
