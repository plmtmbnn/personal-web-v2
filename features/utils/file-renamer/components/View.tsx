"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Files,
	Copy,
	Check,
	Download,
	Trash2,
	ArrowLeft,
	FileText,
	Zap,
	AlertCircle,
	Type,
	ArrowRight,
} from "lucide-react";
import Link from "next/link";

// ─── Transformation Logic ───────────────────────────────────────────────────

/**
 * Transforms a single filename to kebab-case while preserving extensions.
 */
const transformToKebab = (filename: string): string => {
	const trimmed = filename.trim();
	if (!trimmed) return "";

	// Handle hidden files (starting with dot)
	if (trimmed.startsWith(".") && !trimmed.includes(".", 1)) {
		return trimmed;
	}

	// Detect Extension (handle multi-part extensions like .tar.gz)
	const parts = trimmed.split(".");
	let namePart = trimmed;
	let extension = "";

	if (parts.length > 1) {
		// Basic extension detection: last part is extension
		// If it's a known multi-part like .tar.gz, we could add logic,
		// but standard is last dot.
		extension = `.${parts.pop()}`;
		namePart = parts.join(".");
	}

	// Kebab-case conversion
	const kebab = namePart
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-") // Non-alphanumeric to hyphen
		.replace(/^-+|-+$/g, ""); // Trim start/end hyphens

	return kebab + extension;
};

// ─── Main View ──────────────────────────────────────────────────────────────

export default function FileRenamerView() {
	const [input, setInput] = useState("");
	const [isCopied, setIsCopied] = useState(false);

	const renamedList = useMemo(() => {
		return input
			.split("\n")
			.map((line) => transformToKebab(line))
			.filter((line) => line !== "");
	}, [input]);

	const handleCopyAll = () => {
		if (renamedList.length === 0) return;
		navigator.clipboard.writeText(renamedList.join("\n"));
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	const handleDownload = () => {
		if (renamedList.length === 0) return;
		const blob = new Blob([renamedList.join("\n")], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "renamed-files.txt";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 text-slate-900 pb-20">
			<div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-10 sm:pt-16 relative z-10">
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
								<Files className="w-7 h-7 sm:w-8 sm:h-8" />
							</div>
							<div>
								<h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 leading-none">
									File <span className="text-blue-600">Renamer</span>
								</h1>
								<p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] mt-3">
									Batch Kebab-Case Normalization
								</p>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<button
							onClick={handleDownload}
							disabled={renamedList.length === 0}
							className="flex items-center gap-2.5 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Download className="w-4 h-4" /> Download .txt
						</button>
						<button
							onClick={() => setInput("")}
							className="flex items-center justify-center w-14 h-14 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95 shadow-sm"
						>
							<Trash2 className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Workspace */}
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">
					{/* Input Pane */}
					<div className="flex flex-col space-y-4">
						<div className="flex items-center gap-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
							<Type className="w-3.5 h-3.5" /> Original List
						</div>
						<div className="flex-1 relative bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
							<textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Enter file names, one per line..."
								className="w-full h-full min-h-[500px] p-8 bg-transparent text-slate-900 font-mono text-sm leading-relaxed focus:outline-none resize-none placeholder:text-slate-200 scrollbar-hide"
								spellCheck={false}
							/>
						</div>
					</div>

					{/* Output Pane */}
					<div className="flex flex-col space-y-4">
						<div className="flex items-center justify-between px-3">
							<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
								<Zap className="w-3.5 h-3.5" /> Live Preview
							</div>
							{renamedList.length > 0 && (
								<button
									onClick={handleCopyAll}
									className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
										isCopied
											? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
											: "bg-slate-900 text-white hover:bg-slate-800"
									}`}
								>
									{isCopied ? (
										<Check className="w-3.5 h-3.5" />
									) : (
										<Copy className="w-3.5 h-3.5" />
									)}
									{isCopied ? "Copied All" : "Copy All"}
								</button>
							)}
						</div>

						<div className="flex-1 relative bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
							<div className="flex-1 overflow-auto p-8 scrollbar-hide">
								<AnimatePresence mode="popLayout">
									{renamedList.length > 0 ? (
										<div className="space-y-3">
											{renamedList.map((name, idx) => (
												<motion.div
													// biome-ignore lint/suspicious/noArrayIndexKey: List is purely decorative preview, index is stable for this usage
													key={`${name}-${idx}`}
													initial={{ opacity: 0, x: 20 }}
													animate={{ opacity: 1, x: 0 }}
													exit={{ opacity: 0, x: -20 }}
													transition={{
														duration: 0.2,
														delay: Math.min(idx * 0.05, 0.5),
													}}
													className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-blue-200 transition-colors"
												>
													<FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
													<span className="text-sm font-mono text-slate-600 flex-1 truncate">
														{name}
													</span>
													<ArrowRight className="w-3.5 h-3.5 text-slate-200" />
												</motion.div>
											))}
										</div>
									) : (
										<div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-20">
											<Files className="w-20 h-20 text-slate-900" />
											<p className="text-slate-900 font-black uppercase tracking-[0.5em] text-[10px]">
												Awaiting Input
											</p>
										</div>
									)}
								</AnimatePresence>
							</div>
						</div>
					</div>
				</div>

				{/* Quick Info */}
				<div className="mt-12 p-8 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex flex-col sm:flex-row items-center gap-6">
					<div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 shrink-0">
						<AlertCircle className="w-6 h-6" />
					</div>
					<div className="space-y-1">
						<h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
							Ruleset
						</h4>
						<p className="text-xs text-slate-500 font-medium leading-relaxed">
							Filename transformed to{" "}
							<span className="text-blue-600 font-bold">lowercase</span>.
							Non-alphanumeric chars replaced by{" "}
							<span className="text-blue-600 font-bold">hyphens</span>.
							Extensions are preserved exactly as provided.
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}
