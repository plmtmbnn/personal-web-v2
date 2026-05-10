"use client";

import { useState, useCallback } from "react";
import {
	Database,
	Upload,
	ArrowLeft,
	Trash2,
	CheckCircle2,
	AlertCircle,
	Loader2,
	FileCode,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PinGuard from "@/features/auth/PinGuard";

export default function StockImportAdmin() {
	const [input, setInput] = useState("");
	const [status, setStatus] = useState<{
		type: "idle" | "loading" | "success" | "error";
		message: string;
	}>({ type: "idle", message: "" });

	const handleImport = useCallback(async () => {
		if (!input.trim()) return;

		setStatus({ type: "loading", message: "Validating JSON structure..." });

		try {
			// 1. Parse JSON
			let parsed: any;
			try {
				parsed = JSON.parse(input);
			} catch (_e) {
				throw new Error("Invalid JSON format. Please check your syntax.");
			}

			// 2. Validate Structure (Expect { draw, recordsTotal, data: [] } or just [])
			const stockData = Array.isArray(parsed) ? parsed : parsed.data;

			if (!stockData || !Array.isArray(stockData)) {
				throw new Error(
					"Invalid structure. Could not find a 'data' array in the JSON.",
				);
			}

			if (stockData.length === 0) {
				throw new Error("The data array is empty.");
			}

			// 3. API Call
			setStatus({
				type: "loading",
				message: `Importing ${stockData.length} records to Redis...`,
			});

			const response = await fetch("/api/admin/import-stock", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ data: stockData }),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to import data");
			}

			setStatus({
				type: "success",
				message: result.message || "Data imported successfully!",
			});
			setInput(""); // Clear input on success
		} catch (error: any) {
			console.error("Import Error:", error);
			setStatus({
				type: "error",
				message: error.message || "An unexpected error occurred during import.",
			});
		}
	}, [input]);

	const handleReset = () => {
		setInput("");
		setStatus({ type: "idle", message: "" });
	};

	return (
		<PinGuard>
			<main className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 selection:bg-indigo-100">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 relative z-10">
					{/* Header */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
						<div className="space-y-6">
							<Link
								href="/utils/stock-explorer"
								className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-600 transition-colors gap-2 group"
							>
								<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
								Back to Explorer
							</Link>
							<div className="flex items-center gap-5">
								<div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20">
									<Database className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-400" />
								</div>
								<div>
									<h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 leading-none">
										Redis <span className="text-indigo-600">Import</span>
									</h1>
									<p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] mt-3">
										Stock Data Synchronization Center
									</p>
								</div>
							</div>
						</div>

						<button
							onClick={handleReset}
							className="self-start flex items-center gap-2.5 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-all active:scale-95 shadow-sm"
						>
							<Trash2 className="w-4 h-4" /> Clear
						</button>
					</div>

					<div className="space-y-8">
						{/* Instructions */}
						<section className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
							<div className="flex items-start gap-4">
								<div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
									<FileCode className="w-4 h-4" />
								</div>
								<div className="space-y-1">
									<h3 className="text-sm font-black uppercase tracking-widest text-indigo-900">
										Import Protocol
									</h3>
									<p className="text-xs text-indigo-700 leading-relaxed font-medium">
										Paste the raw JSON response from IDX Market Statistics here.
										The system automatically identifies the <code>data</code>{" "}
										array and persists it to Redis. Existing stock data will be
										completely overwritten.
									</p>
								</div>
							</div>
						</section>

						{/* Input Area */}
						<div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
							<div className="flex-1 relative group">
								<textarea
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder='{ "draw": 1, "recordsTotal": 900, "data": [...] }'
									className="w-full h-full min-h-[400px] p-8 bg-white text-slate-900 font-mono text-xs leading-relaxed focus:outline-none transition-all resize-none"
									spellCheck={false}
								/>
							</div>

							<div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
								<div className="flex-1">
									<AnimatePresence mode="wait">
										{status.type !== "idle" && (
											<motion.div
												key={status.type}
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: 10 }}
												className="flex items-center gap-3"
											>
												{status.type === "loading" ? (
													<Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
												) : status.type === "success" ? (
													<CheckCircle2 className="w-4 h-4 text-emerald-600" />
												) : (
													<AlertCircle className="w-4 h-4 text-rose-600" />
												)}
												<span
													className={`text-[10px] font-black uppercase tracking-widest ${
														status.type === "loading"
															? "text-indigo-600"
															: status.type === "success"
																? "text-emerald-600"
																: "text-rose-600"
													}`}
												>
													{status.message}
												</span>
											</motion.div>
										)}
									</AnimatePresence>
								</div>

								<button
									onClick={handleImport}
									disabled={!input.trim() || status.type === "loading"}
									className="flex items-center gap-2.5 px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
								>
									<Upload className="w-4 h-4" /> Import to Redis
								</button>
							</div>
						</div>
					</div>
				</div>
			</main>
		</PinGuard>
	);
}
