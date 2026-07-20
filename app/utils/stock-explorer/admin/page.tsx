"use client";

import { useState, useCallback, useEffect } from "react";
import {
	Database,
	Upload,
	ArrowLeft,
	Trash2,
	CheckCircle2,
	AlertCircle,
	Loader2,
	FileCode,
	Clock,
	RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import PinGuard from "@/features/auth/PinGuard";

export default function StockImportAdmin() {
	const reduceMotion = useReducedMotion();
	const [input, setInput] = useState("");
	const [status, setStatus] = useState<{
		type: "idle" | "loading" | "success" | "error";
		message: string;
	}>({ type: "idle", message: "" });

	const [cacheStatus, setCacheStatus] = useState<{
		loading: boolean;
		available: boolean;
		count: number;
		lastDate: string | null;
	}>({ loading: true, available: false, count: 0, lastDate: null });

	const fetchCacheStatus = useCallback(async () => {
		setCacheStatus((prev) => ({ ...prev, loading: true }));
		try {
			const response = await fetch("/api/admin/import-stock");
			if (response.ok) {
				const result = await response.json();
				setCacheStatus({
					loading: false,
					available: result.available,
					count: result.count,
					lastDate: result.lastDate,
				});
			} else {
				throw new Error("Failed to load status");
			}
		} catch (error) {
			console.error("Cache Status Retrieval Error:", error);
			setCacheStatus((prev) => ({ ...prev, loading: false }));
		}
	}, []);

	useEffect(() => {
		fetchCacheStatus();
	}, [fetchCacheStatus]);

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
			fetchCacheStatus(); // Reload cache metadata
		} catch (error: any) {
			console.error("Import Error:", error);
			setStatus({
				type: "error",
				message: error.message || "An unexpected error occurred during import.",
			});
		}
	}, [input, fetchCacheStatus]);

	const handleClearCache = useCallback(async () => {
		const confirmed = window.confirm(
			"Are you sure you want to purge the stock data from Redis cache? This will delete all instruments and reset the auto-fetch cooldown.",
		);
		if (!confirmed) return;

		setStatus({ type: "loading", message: "Purging Redis cache..." });

		try {
			const response = await fetch("/api/admin/import-stock", {
				method: "DELETE",
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to clear cache");
			}

			setStatus({
				type: "success",
				message: result.message || "Redis cache cleared.",
			});
			fetchCacheStatus(); // Reload cache metadata
		} catch (error: any) {
			console.error("Clear Cache Error:", error);
			setStatus({
				type: "error",
				message:
					error.message || "An unexpected error occurred while clearing cache.",
			});
		}
	}, [fetchCacheStatus]);

	const handleResetInput = () => {
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
					</div>

					<div className="space-y-8">
						{/* Cache Status Indicator Card */}
						<section className="bg-white border border-slate-200 rounded-[2rem] shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
							<div className="space-y-4 flex-1">
								<div className="flex items-center gap-3">
									<h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
										Cache Status
									</h3>
									{cacheStatus.loading ? (
										<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
											<Loader2 className="w-3.5 h-3.5 animate-spin" /> checking
										</span>
									) : cacheStatus.available ? (
										<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
											● Active Cache
										</span>
									) : (
										<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100">
											○ No Cache / Expired
										</span>
									)}
								</div>

								{cacheStatus.loading ? (
									<div className="h-10 flex items-center">
										<p className="text-xs text-slate-400 font-medium">
											Retrieving Redis cache statistics...
										</p>
									</div>
								) : cacheStatus.available ? (
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
										<div>
											<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
												Total Instruments
											</span>
											<p className="text-xl font-black text-slate-900 mt-0.5">
												{cacheStatus.count.toLocaleString()}
											</p>
										</div>
										<div>
											<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
												Trading Date
											</span>
											<p className="text-xl font-black text-slate-900 mt-0.5">
												{cacheStatus.lastDate
													? cacheStatus.lastDate.substring(0, 10)
													: "N/A"}
											</p>
										</div>
										<div className="col-span-2 sm:col-span-1">
											<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
												<Clock className="w-3 h-3 text-indigo-500" /> Lifespan
											</span>
											<p className="text-xs font-bold text-indigo-600 mt-1">
												3 Hours (Auto-purges)
											</p>
										</div>
									</div>
								) : (
									<p className="text-xs text-slate-500 leading-relaxed font-medium">
										Redis database is empty or data has expired. System will
										automatically pull live data from IDX and rebuild the cache
										on the next stock query.
									</p>
								)}
							</div>

							<div className="flex items-center gap-3 w-full md:w-auto">
								<button
									onClick={fetchCacheStatus}
									disabled={cacheStatus.loading}
									className="flex items-center justify-center p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
									title="Refresh Status"
								>
									<RefreshCw
										className={`w-4 h-4 ${cacheStatus.loading ? "animate-spin" : ""}`}
									/>
								</button>
								<button
									onClick={handleClearCache}
									disabled={!cacheStatus.available || cacheStatus.loading}
									className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
								>
									<Trash2 className="w-4 h-4" /> Purge Cache
								</button>
							</div>
						</section>

						{/* Manual Fallback Instructions */}
						<section className="p-6 bg-indigo-50/50 border border-indigo-100/50 rounded-[2rem] space-y-4">
							<div className="flex items-start gap-4">
								<div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
									<FileCode className="w-4 h-4" />
								</div>
								<div className="space-y-1">
									<h3 className="text-sm font-black uppercase tracking-widest text-indigo-900">
										Manual Override Protocol
									</h3>
									<p className="text-xs text-indigo-700/80 leading-relaxed font-medium">
										If live connection to IDX API is unstable, paste the raw
										JSON response from IDX Trading Summary below to manually
										prime the Redis cache.
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
												initial={reduceMotion ? false : { opacity: 0, x: -10 }}
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

								<div className="flex items-center gap-3 w-full sm:w-auto">
									<button
										onClick={handleResetInput}
										disabled={!input.trim()}
										className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-rose-600 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
									>
										Clear Input
									</button>
									<button
										onClick={handleImport}
										disabled={!input.trim() || status.type === "loading"}
										className="flex-[2] sm:flex-none flex items-center justify-center gap-2.5 px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
									>
										<Upload className="w-4 h-4" /> Import to Redis
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</PinGuard>
	);
}
