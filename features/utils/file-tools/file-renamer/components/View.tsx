"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	Files,
	Copy,
	Check,
	Download,
	Trash2,
	FileText,
	Zap,
	AlertCircle,
	Type,
	ArrowRight,
} from "lucide-react";

import UtilHeader from "@/features/utils/components/UtilHeader";

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
	const reduceMotion = useReducedMotion();
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
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
				<UtilHeader
					title="File Renamer"
					description="Batch kebab-case normalization for filenames with extension preservation."
					category={{
						label: "Data & File Systems",
						sublabel: "file renamer",
						color: "blue",
					}}
					icon={Files}
					actions={
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={handleDownload}
								disabled={renamedList.length === 0}
								className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Download className="w-3.5 h-3.5" /> Download .txt
							</button>
							<button
								type="button"
								onClick={() => setInput("")}
								className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200/80 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer shadow-xs"
								title="Clear Input"
							>
								<Trash2 className="w-3.5 h-3.5" />
							</button>
						</div>
					}
				/>

				{/* Workspace */}
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">
					{/* Input Pane */}
					<div className="flex flex-col space-y-3">
						<div className="flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-500">
							<Type className="w-4 h-4 text-indigo-600" /> Original List
						</div>
						<div className="flex-1 relative bg-white border border-slate-200/80 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
							<textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Enter file names, one per line..."
								className="w-full h-full min-h-[480px] p-6 sm:p-8 bg-transparent text-slate-900 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-none placeholder:text-slate-400"
								spellCheck={false}
							/>
						</div>
					</div>

					{/* Output Pane */}
					<div className="flex flex-col space-y-3">
						<div className="flex items-center justify-between px-2">
							<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
								<Zap className="w-4 h-4 text-indigo-600" /> Live Preview
							</div>
							{renamedList.length > 0 && (
								<button
									onClick={handleCopyAll}
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
									{isCopied ? "Copied All" : "Copy All"}
								</button>
							)}
						</div>

						<div className="flex-1 relative bg-white border border-slate-200/80 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col min-h-[480px]">
							<div className="flex-1 overflow-auto p-6 sm:p-8 scrollbar-hide">
								<AnimatePresence mode="popLayout">
									{renamedList.length > 0 ? (
										<div className="space-y-3">
											{renamedList.map((name, idx) => (
												<motion.div
													key={`${name}-${idx}`}
													initial={reduceMotion ? false : { opacity: 0, x: 20 }}
													animate={{ opacity: 1, x: 0 }}
													exit={{ opacity: 0, x: -20 }}
													transition={{
														duration: 0.2,
														delay: Math.min(idx * 0.05, 0.5),
													}}
													className="flex items-center gap-3 p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl group hover:border-indigo-300 transition-colors"
												>
													<FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
													<span className="text-xs sm:text-sm font-mono font-bold text-slate-700 flex-1 truncate">
														{name}
													</span>
													<ArrowRight className="w-4 h-4 text-slate-300" />
												</motion.div>
											))}
										</div>
									) : (
										<div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-20">
											<Files className="w-20 h-20 text-slate-900" />
											<p className="text-slate-900 font-extrabold uppercase tracking-widest text-xs">
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
				<div className="p-6 bg-white border border-slate-200/80 rounded-2xl sm:rounded-[2rem] shadow-sm flex flex-col sm:flex-row items-center gap-5">
					<div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
						<AlertCircle className="w-5 h-5" />
					</div>
					<div className="space-y-1 text-center sm:text-left">
						<h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
							Normalizing Ruleset
						</h4>
						<p className="text-xs text-slate-600 font-semibold leading-relaxed">
							Filenames transformed to{" "}
							<span className="text-indigo-600 font-extrabold">lowercase</span>.
							Non-alphanumeric characters replaced by{" "}
							<span className="text-indigo-600 font-extrabold">hyphens</span>.
							File extensions preserved exactly as provided.
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}
