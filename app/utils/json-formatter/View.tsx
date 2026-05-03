"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Braces,
	Copy,
	Check,
	Trash2,
	Type,
	Code2,
	AlertCircle,
	ArrowLeft,
	Zap,
	ZapOff,
	ChevronRight,
	ChevronDown,
	Maximize2,
	Minimize2,
	ClipboardCheck,
} from "lucide-react";
import Link from "next/link";

// ─── JSON Repair Logic ──────────────────────────────────────────────────────

/**
 * Attempts to salvage "Dirty" JSON (unquoted keys, single quotes, etc.)
 */
const repairJson = (str: string) => {
	const salvaged = str.trim();
	if (!salvaged) return { data: null, status: "empty" as const };

	const _isRepaired = false;

	try {
		// Try standard parse first
		const data = JSON.parse(salvaged);
		return { data, status: "valid" as const };
	} catch (e) {
		// Salvage attempt
		try {
			const working = salvaged
				// 1. Convert single quotes to double quotes (naive but effective for most code snippets)
				.replace(/'/g, '"')
				// 2. Quote unquoted keys
				.replace(/([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3')
				// 3. Remove trailing commas
				.replace(/,(\s*[}\]])/g, "$1");

			const data = JSON.parse(working);
			return { data, status: "auto-fixed" as const };
		} catch (_err) {
			return {
				data: null,
				status: "invalid" as const,
				error: (e as Error).message,
			};
		}
	}
};

// ─── Tree View Components ───────────────────────────────────────────────────

function JsonValue({ value, label }: { value: any; label?: string }) {
	const [isExpanded, setIsExpanded] = useState(true);
	const [isCopied, setIsCopied] = useState(false);

	const type = typeof value;
	const isObject = value !== null && type === "object";
	const isArray = Array.isArray(value);

	const copyToClipboard = (e: React.MouseEvent) => {
		e.stopPropagation();
		const text =
			typeof value === "string" ? value : JSON.stringify(value, null, 2);
		navigator.clipboard.writeText(text);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 1500);
	};

	if (isObject) {
		const keys = Object.keys(value);
		const isEmpty = keys.length === 0;
		const bracketOpen = isArray ? "[" : "{";
		const bracketClose = isArray ? "]" : "}";

		return (
			<div className="font-mono text-sm leading-relaxed group/node">
				<div
					className="flex items-center gap-1 cursor-pointer hover:bg-slate-100/50 rounded px-1 -ml-1 transition-colors"
					onClick={() => setIsExpanded(!isExpanded)}
				>
					{!isEmpty && (
						<span className="text-slate-400">
							{isExpanded ? (
								<ChevronDown className="w-3.5 h-3.5" />
							) : (
								<ChevronRight className="w-3.5 h-3.5" />
							)}
						</span>
					)}
					{label && <span className="text-blue-600 font-bold">{label}: </span>}
					<span className="text-slate-400 font-black">{bracketOpen}</span>
					{!isExpanded && (
						<span className="text-slate-400 text-xs italic bg-slate-100 px-1 rounded mx-1">
							{keys.length} items
						</span>
					)}
					{!isExpanded && (
						<span className="text-slate-400 font-black">{bracketClose}</span>
					)}

					{/* Value-level Copy */}
					<button
						onClick={copyToClipboard}
						className="opacity-0 group-hover/node:opacity-100 ml-2 p-1 text-slate-300 hover:text-blue-500 transition-all active:scale-90"
						title="Copy value"
					>
						{isCopied ? (
							<ClipboardCheck className="w-3.5 h-3.5" />
						) : (
							<Copy className="w-3.5 h-3.5" />
						)}
					</button>
				</div>

				{isExpanded && !isEmpty && (
					<div className="pl-6 border-l border-slate-100 ml-1.5 mt-1 space-y-1">
						{keys.map((key) => (
							<JsonValue
								key={key}
								label={isArray ? undefined : key}
								value={value[key]}
							/>
						))}
					</div>
				)}

				{isExpanded && (
					<div className="text-slate-400 font-black mt-1">{bracketClose}</div>
				)}
			</div>
		);
	}

	return (
		<div className="font-mono text-sm leading-relaxed flex items-center gap-2 group/val hover:bg-slate-50 rounded px-1 -ml-1 transition-colors py-0.5">
			{label && <span className="text-blue-500 font-bold">{label}: </span>}
			<span
				className={`
				${type === "string" ? "text-emerald-600" : ""}
				${type === "number" ? "text-orange-500" : ""}
				${type === "boolean" ? "text-purple-600" : ""}
				${value === null ? "text-slate-400 italic" : ""}
				font-medium break-all
			`}
			>
				{type === "string" ? `"${value}"` : String(value)}
			</span>

			<button
				onClick={copyToClipboard}
				className="opacity-0 group-hover/val:opacity-100 p-1 text-slate-300 hover:text-blue-500 transition-all active:scale-90"
			>
				{isCopied ? (
					<ClipboardCheck className="w-3 h-3" />
				) : (
					<Copy className="w-3 h-3" />
				)}
			</button>
		</div>
	);
}

// ─── Main View ──────────────────────────────────────────────────────────────

export default function JsonFormatterView() {
	const [input, setInput] = useState("");
	const [parsedData, setParsedData] = useState<any>(null);
	const [status, setStatus] = useState<
		"empty" | "valid" | "auto-fixed" | "invalid"
	>("empty");
	const [error, setError] = useState<string | null>(null);
	const [isAutoFormat, setIsAutoFormat] = useState(true);
	const [isMinified, setIsMinified] = useState(false);
	const [isCopied, setIsCopied] = useState(false);
	const debounceTimer = useRef<NodeJS.Timeout | null>(null);

	const processJson = useCallback((raw: string) => {
		const result = repairJson(raw);
		setParsedData(result.data);
		setStatus(result.status);
		setError(result.error || null);
	}, []);

	const handleClear = () => {
		setInput("");
		setParsedData(null);
		setStatus("empty");
		setError(null);
	};

	const handleCopy = () => {
		if (!parsedData) return;
		const text = isMinified
			? JSON.stringify(parsedData)
			: JSON.stringify(parsedData, null, 2);
		navigator.clipboard.writeText(text);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	useEffect(() => {
		if (isAutoFormat) {
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
			debounceTimer.current = setTimeout(() => {
				processJson(input);
			}, 300);
		}
		return () => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
		};
	}, [input, isAutoFormat, processJson]);

	return (
		<main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 text-slate-900 pb-20">
			<div className="max-w-[1600px] mx-auto px-4 sm:px-8 pt-10 sm:pt-16 relative z-10">
				{/* Header */}
				<div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10 sm:mb-14">
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
								<Braces className="w-7 h-7 sm:w-8 sm:h-8" />
							</div>
							<div>
								<h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 leading-none">
									JSON <span className="text-blue-600">Architect</span>
								</h1>
								<p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] mt-3">
									High-Fidelity Structure & Validation
								</p>
							</div>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<button
							onClick={() => setIsAutoFormat(!isAutoFormat)}
							className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border ${
								isAutoFormat
									? "bg-blue-50 border-blue-200 text-blue-600"
									: "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
							}`}
						>
							{isAutoFormat ? (
								<Zap className="w-4 h-4" />
							) : (
								<ZapOff className="w-4 h-4" />
							)}
							Live Mode {isAutoFormat ? "ON" : "OFF"}
						</button>

						<button
							onClick={() => setIsMinified(!isMinified)}
							className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border ${
								isMinified
									? "bg-purple-50 border-purple-200 text-purple-600"
									: "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
							}`}
						>
							{isMinified ? (
								<Minimize2 className="w-4 h-4" />
							) : (
								<Maximize2 className="w-4 h-4" />
							)}
							{isMinified ? "Compact" : "Pretty"}
						</button>

						<button
							onClick={handleClear}
							className="flex items-center gap-2.5 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-all active:scale-95 shadow-sm"
						>
							<Trash2 className="w-4 h-4" /> Reset
						</button>
					</div>
				</div>

				{/* Editor Workspace */}
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1 min-h-[700px]">
					{/* Input Module */}
					<div className="flex flex-col space-y-4">
						<div className="flex items-center justify-between px-3">
							<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
								<Type className="w-3.5 h-3.5" /> Source Input
							</div>
							<div className="flex items-center gap-2">
								{status !== "empty" && (
									<div
										className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
											status === "valid"
												? "bg-emerald-50 border-emerald-200 text-emerald-600"
												: status === "auto-fixed"
													? "bg-amber-50 border-amber-200 text-amber-600"
													: "bg-rose-50 border-rose-200 text-rose-600"
										}`}
									>
										{status.replace("-", " ")}
									</div>
								)}
							</div>
						</div>
						<div className="flex-1 relative group bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
							<textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Paste raw data here... unquoted keys and single quotes are fine."
								className="w-full h-full min-h-[500px] p-8 bg-transparent text-slate-900 font-mono text-sm leading-relaxed focus:outline-none resize-none placeholder:text-slate-200 scrollbar-hide"
								spellCheck={false}
							/>
						</div>
					</div>

					{/* Output Module */}
					<div className="flex flex-col space-y-4">
						<div className="flex items-center justify-between px-3">
							<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
								<Code2 className="w-3.5 h-3.5" /> Logical Preview
							</div>
							<div className="flex items-center gap-3">
								{!isAutoFormat && (
									<button
										onClick={() => processJson(input)}
										className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
									>
										Run Manually
									</button>
								)}
								{parsedData && (
									<button
										onClick={handleCopy}
										className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
											isCopied
												? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
												: "bg-slate-900 text-white hover:bg-slate-800"
										}`}
									>
										{isCopied ? (
											<Check className="w-3 h-3" />
										) : (
											<Copy className="w-3 h-3" />
										)}
										{isCopied ? "Copied" : "Copy JSON"}
									</button>
								)}
							</div>
						</div>

						<div className="flex-1 relative bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
							<AnimatePresence mode="wait">
								{error ? (
									<motion.div
										key="error"
										initial={{ opacity: 0, scale: 0.98 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.98 }}
										className="absolute inset-0 z-20 flex items-center justify-center p-12 text-center"
									>
										<div className="space-y-6 max-w-md">
											<div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
												<AlertCircle className="w-10 h-10" />
											</div>
											<div className="space-y-2">
												<h3 className="text-slate-900 font-black uppercase tracking-[0.2em] text-sm">
													System Error
												</h3>
												<p className="text-slate-500 font-mono text-xs leading-loose break-words bg-slate-50 p-6 rounded-2xl border border-slate-100">
													{error}
												</p>
											</div>
										</div>
									</motion.div>
								) : parsedData ? (
									<motion.div
										key="output"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="h-full p-8 overflow-auto scrollbar-hide"
									>
										{isMinified ? (
											<div className="font-mono text-sm break-all text-slate-600 bg-slate-50 p-6 rounded-2xl border border-slate-100">
												{JSON.stringify(parsedData)}
											</div>
										) : (
											<div className="pb-10">
												<JsonValue value={parsedData} />
											</div>
										)}
									</motion.div>
								) : (
									<div className="h-full flex items-center justify-center">
										<div className="text-center space-y-4 opacity-10">
											<Braces className="w-24 h-24 mx-auto" />
											<p className="font-black uppercase tracking-[0.5em] text-xs">
												Waiting for Data
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
