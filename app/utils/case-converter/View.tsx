"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import Link from "next/link";

// ─── Logic ────────────────────────────────────────────────────────────────

type CaseType =
	| "camel"
	| "pascal"
	| "snake"
	| "kebab"
	| "upper"
	| "lower"
	| "capitalize";

/**
 * Splits a string into words regardless of its current case
 */
const toWords = (str: string): string[] => {
	return str
		.replace(/([A-Z])/g, " $1") // Split camel/pascal
		.replace(/[_-]+/g, " ") // Split snake/kebab
		.trim()
		.split(/\s+/)
		.filter((w) => w.length > 0)
		.map((w) => w.toLowerCase());
};

/**
 * Joins words into the target case
 */
const fromWords = (words: string[], target: CaseType): string => {
	if (words.length === 0) return "";

	switch (target) {
		case "camel":
			return (
				words[0] +
				words
					.slice(1)
					.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
					.join("")
			);
		case "pascal":
			return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
		case "snake":
			return words.join("_");
		case "kebab":
			return words.join("-");
		case "upper":
			return words.join(" ").toUpperCase();
		case "lower":
			return words.join(" ").toLowerCase();
		case "capitalize":
			return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
		default:
			return words.join(" ");
	}
};

/**
 * Recursively transforms keys of a JSON object
 */
const transformObject = (obj: any, target: CaseType): any => {
	if (Array.isArray(obj)) {
		return obj.map((v) => transformObject(v, target));
	}
	if (obj !== null && typeof obj === "object") {
		const newObj: any = {};
		for (const key of Object.keys(obj)) {
			const words = toWords(key);
			const newKey = fromWords(words, target);
			newObj[newKey] = transformObject(obj[key], target);
		}
		return newObj;
	}
	return obj;
};

// ─── View Component ─────────────────────────────────────────────────────────

export default function CaseConverterView() {
	const [input, setInput] = useState("");
	const [output, setOutput] = useState("");
	const [isCopied, setIsCopied] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
							Operational Utilities
						</Link>
						<div className="flex items-center gap-5">
							<div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 active:scale-90 transition-transform">
								<ArrowRightLeft className="w-7 h-7 sm:w-8 sm:h-8" />
							</div>
							<div>
								<h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 leading-none">
									Case <span className="text-blue-600">Converter</span>
								</h1>
								<p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] mt-3">
									Recursive Variable & JSON Transformation
								</p>
							</div>
						</div>
					</div>

					<button
						onClick={handleReset}
						className="self-start flex items-center gap-2.5 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-all active:scale-95 shadow-sm"
					>
						<RotateCcw className="w-4 h-4" /> Reset Workspace
					</button>
				</div>

				{/* Editor Layout */}
				<div className="grid grid-cols-1 xl:grid-cols-[1fr_120px_1fr] gap-4 sm:gap-8 items-stretch">
					{/* Input Pane */}
					<div className="space-y-4">
						<div className="flex items-center gap-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
							<AlignLeft className="w-3.5 h-3.5" /> Source Code / JSON
						</div>
						<div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm h-full min-h-[400px] sm:min-h-[500px] overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
							<textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder='paste_variable_names or {"json_keys": "data"}'
								className="w-full h-full p-8 bg-transparent text-slate-900 font-mono text-sm leading-relaxed focus:outline-none resize-none placeholder:text-slate-200"
								spellCheck={false}
							/>
						</div>
					</div>

					{/* Center Controls */}
					<div className="flex xl:flex-col justify-center gap-2 py-4 xl:py-12">
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
								whileHover={{ scale: 1.05, x: 5 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => convert(btn.type as CaseType)}
								className="flex-1 xl:flex-none py-3 px-4 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-blue-600 transition-colors"
							>
								{btn.label}
							</motion.button>
						))}
					</div>

					{/* Output Pane */}
					<div className="space-y-4">
						<div className="flex items-center justify-between px-3">
							<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
								<Code2 className="w-3.5 h-3.5" /> Resulting Case
							</div>
							{output && (
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
						<div className="relative bg-white border border-slate-200 rounded-[2.5rem] shadow-sm h-full min-h-[400px] sm:min-h-[500px] overflow-hidden group">
							<AnimatePresence mode="wait">
								{error ? (
									<motion.div
										key="error"
										initial={{ opacity: 0 }}
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
										initial={{ opacity: 0 }}
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
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
