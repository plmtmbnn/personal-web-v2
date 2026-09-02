"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
	FileUp,
	Sparkles,
	Code2,
	RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import PinGuard from "@/features/auth/PinGuard";

interface CacheStatusState {
	loading: boolean;
	available: boolean;
	count: number;
	lastDate: string | null;
}

interface ImportStatusState {
	type: "idle" | "loading" | "success" | "error";
	message: string;
}

const SAMPLE_TEMPLATE = `{
  "draw": 1,
  "recordsTotal": 3,
  "recordsFiltered": 3,
  "data": [
    {
      "No": 1,
      "Code": "BBCA",
      "Name": "Bank Central Asia Tbk.",
      "Remarks": "",
      "Previous": 10200,
      "OpenPrice": 10250,
      "FirstTrade": 10250,
      "High": 10350,
      "Low": 10200,
      "Close": 10300,
      "Change": 100,
      "Volume": 85000000,
      "Value": 875000000000,
      "Frequency": 18500,
      "IndexIndividual": 0,
      "Offer": 10325,
      "OfferVolume": 50000,
      "Bid": 10300,
      "BidVolume": 45000,
      "ForeignSell": 25000000,
      "ForeignBuy": 40000000,
      "NonRegularVolume": 1000000,
      "NonRegularValue": 10300000000,
      "NonRegularFrequency": 15
    },
    {
      "No": 2,
      "Code": "BBRI",
      "Name": "Bank Rakyat Indonesia (Persero) Tbk.",
      "Remarks": "",
      "Previous": 4850,
      "OpenPrice": 4860,
      "FirstTrade": 4860,
      "High": 4920,
      "Low": 4840,
      "Close": 4900,
      "Change": 50,
      "Volume": 120000000,
      "Value": 586000000000,
      "Frequency": 22400,
      "IndexIndividual": 0,
      "Offer": 4910,
      "OfferVolume": 60000,
      "Bid": 4900,
      "BidVolume": 75000,
      "ForeignSell": 35000000,
      "ForeignBuy": 50000000,
      "NonRegularVolume": 500000,
      "NonRegularValue": 2450000000,
      "NonRegularFrequency": 8
    },
    {
      "No": 3,
      "Code": "BMRI",
      "Name": "Bank Mandiri (Persero) Tbk.",
      "Remarks": "",
      "Previous": 6700,
      "OpenPrice": 6725,
      "FirstTrade": 6725,
      "High": 6800,
      "Low": 6700,
      "Close": 6775,
      "Change": 75,
      "Volume": 65000000,
      "Value": 439000000000,
      "Frequency": 14200,
      "IndexIndividual": 0,
      "Offer": 6800,
      "OfferVolume": 40000,
      "Bid": 6775,
      "BidVolume": 52000,
      "ForeignSell": 18000000,
      "ForeignBuy": 32000000,
      "NonRegularVolume": 200000,
      "NonRegularValue": 1350000000,
      "NonRegularFrequency": 5
    }
  ]
}`;

export default function StockImportAdmin() {
	const reduceMotion = useReducedMotion();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [input, setInput] = useState("");
	const [status, setStatus] = useState<ImportStatusState>({
		type: "idle",
		message: "",
	});

	const [cacheStatus, setCacheStatus] = useState<CacheStatusState>({
		loading: true,
		available: false,
		count: 0,
		lastDate: null,
	});

	const fetchCacheStatus = useCallback(async () => {
		setCacheStatus((prev) => ({ ...prev, loading: true }));
		try {
			const response = await fetch("/api/admin/import-stock");
			if (response.ok) {
				const result = (await response.json()) as {
					available: boolean;
					count: number;
					lastDate: string | null;
				};
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
			let parsed: unknown;
			try {
				parsed = JSON.parse(input);
			} catch {
				throw new Error("Invalid JSON format. Please check your syntax.");
			}

			// 2. Validate Structure (Expect { draw, recordsTotal, data: [] } or just [])
			const stockData = Array.isArray(parsed)
				? parsed
				: (parsed as { data?: unknown[] })?.data;

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

			const result = (await response.json()) as {
				error?: string;
				message?: string;
			};

			if (!response.ok) {
				throw new Error(result.error || "Failed to import data");
			}

			setStatus({
				type: "success",
				message: result.message || "Data imported successfully!",
			});
			setInput(""); // Clear input on success
			fetchCacheStatus(); // Reload cache metadata
		} catch (error: unknown) {
			console.error("Import Error:", error);
			setStatus({
				type: "error",
				message:
					error instanceof Error
						? error.message
						: "An unexpected error occurred during import.",
			});
		}
	}, [input, fetchCacheStatus]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
			e.preventDefault();
			handleImport();
		}
	};

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

			const result = (await response.json()) as {
				error?: string;
				message?: string;
			};

			if (!response.ok) {
				throw new Error(result.error || "Failed to clear cache");
			}

			setStatus({
				type: "success",
				message: result.message || "Redis cache cleared.",
			});
			fetchCacheStatus(); // Reload cache metadata
		} catch (error: unknown) {
			console.error("Clear Cache Error:", error);
			setStatus({
				type: "error",
				message:
					error instanceof Error
						? error.message
						: "An unexpected error occurred while clearing cache.",
			});
		}
	}, [fetchCacheStatus]);

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target?.result;
			if (typeof content === "string") {
				try {
					const parsed = JSON.parse(content);
					setInput(JSON.stringify(parsed, null, 2));
					setStatus({
						type: "success",
						message: `Loaded ${file.name} successfully`,
					});
				} catch {
					setInput(content);
					setStatus({
						type: "error",
						message: "Uploaded file contains invalid JSON syntax.",
					});
				}
			}
		};
		reader.readAsText(file);
		// Reset file input so same file can be re-uploaded if needed
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleFormatJson = () => {
		if (!input.trim()) return;
		try {
			const parsed = JSON.parse(input);
			setInput(JSON.stringify(parsed, null, 2));
			setStatus({ type: "success", message: "JSON formatted successfully." });
		} catch {
			setStatus({
				type: "error",
				message: "Cannot format: invalid JSON syntax.",
			});
		}
	};

	const handleLoadSample = () => {
		setInput(SAMPLE_TEMPLATE);
		setStatus({
			type: "success",
			message: "Sample IDX template loaded.",
		});
	};

	const handleResetInput = () => {
		setInput("");
		setStatus({ type: "idle", message: "" });
	};

	return (
		<PinGuard>
			<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 sm:pb-36 py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
				<div className="max-w-5xl mx-auto space-y-6">
					{/* Header */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
						<div className="space-y-3">
							<Link
								href="/utils/stock-explorer"
								className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors gap-2 group !no-underline"
							>
								<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
								<span>Back to Explorer</span>
							</Link>

							<div className="flex items-center gap-4">
								<div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xs shrink-0">
									<Database className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
								</div>
								<div>
									<h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
										Redis <span className="text-indigo-600">Import</span>
									</h1>
									<p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">
										IDX Stock Data Synchronization Center
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Cache Status Indicator Card */}
					<section className="bg-white border border-slate-200/80 rounded-[2rem] shadow-xs p-5 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
						<div className="space-y-3.5 flex-1">
							<div className="flex items-center gap-3">
								<h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
									Cache Status
								</h2>
								{cacheStatus.loading ? (
									<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
										<Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
										<span>Checking...</span>
									</span>
								) : cacheStatus.available ? (
									<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
										<CheckCircle2 className="w-3 h-3 text-emerald-600" />
										<span>Active Cache</span>
									</span>
								) : (
									<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
										<AlertCircle className="w-3 h-3 text-rose-600" />
										<span>No Cache / Expired</span>
									</span>
								)}
							</div>

							{cacheStatus.loading ? (
								<div className="h-10 flex items-center">
									<p className="text-xs text-slate-500 font-medium">
										Retrieving Redis cache statistics...
									</p>
								</div>
							) : cacheStatus.available ? (
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
									<div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
										<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
											Total Instruments
										</span>
										<p className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
											{cacheStatus.count.toLocaleString()}
										</p>
									</div>
									<div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
										<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
											Trading Date
										</span>
										<p className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
											{cacheStatus.lastDate
												? cacheStatus.lastDate.substring(0, 10)
												: "N/A"}
										</p>
									</div>
									<div className="col-span-2 sm:col-span-1 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100/80">
										<span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
											<Clock className="w-3 h-3 text-indigo-600" /> Lifespan
										</span>
										<p className="text-xs font-bold text-indigo-950 mt-1">
											3 Hours (Auto-purges)
										</p>
									</div>
								</div>
							) : (
								<p className="text-xs text-slate-600 leading-relaxed font-medium">
									Redis database is empty or data has expired. System will
									automatically pull live data from IDX and rebuild the cache on
									the next stock query.
								</p>
							)}
						</div>

						{/* Cache Actions */}
						<div className="flex items-center gap-2.5 w-full md:w-auto">
							<button
								type="button"
								onClick={fetchCacheStatus}
								disabled={cacheStatus.loading}
								className="flex items-center justify-center p-3 bg-white border border-slate-200/80 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
								title="Refresh Status"
								aria-label="Refresh Cache Status"
							>
								<RefreshCw
									className={`w-4 h-4 ${cacheStatus.loading ? "animate-spin" : ""}`}
								/>
							</button>

							<button
								type="button"
								onClick={handleClearCache}
								disabled={!cacheStatus.available || cacheStatus.loading}
								className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
							>
								<Trash2 className="w-4 h-4" />
								<span>Purge Cache</span>
							</button>
						</div>
					</section>

					{/* Protocol Helper Card */}
					<section className="p-4 sm:p-5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2 shadow-xs">
						<div className="flex items-start gap-3">
							<div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
								<FileCode className="w-4 h-4" />
							</div>
							<div className="space-y-0.5">
								<h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
									Manual Override Protocol
								</h3>
								<p className="text-xs text-indigo-900/80 leading-relaxed font-medium">
									If live connection to IDX API is unstable, paste or upload the
									raw JSON response from IDX Trading Summary below to manually
									prime the Redis cache.
								</p>
							</div>
						</div>
					</section>

					{/* Input Area */}
					<div className="bg-white border border-slate-200/80 rounded-[2rem] shadow-xs overflow-hidden flex flex-col min-h-[480px]">
						{/* Quick Action Toolbar */}
						<div className="p-3 sm:p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5">
							<div className="flex flex-wrap items-center gap-2">
								{/* Hidden file input */}
								<input
									type="file"
									ref={fileInputRef}
									onChange={handleFileUpload}
									accept=".json,application/json"
									className="hidden"
								/>
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
								>
									<FileUp className="w-3.5 h-3.5 text-indigo-600" />
									<span>Upload JSON File</span>
								</button>

								<button
									type="button"
									onClick={handleFormatJson}
									disabled={!input.trim()}
									className="px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
								>
									<Code2 className="w-3.5 h-3.5 text-blue-600" />
									<span>Format JSON</span>
								</button>

								<button
									type="button"
									onClick={handleLoadSample}
									className="px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
								>
									<Sparkles className="w-3.5 h-3.5 text-amber-500" />
									<span>Load Sample</span>
								</button>
							</div>

							<span className="hidden sm:inline-flex text-[11px] font-bold text-slate-400 font-mono">
								{input.length > 0
									? `${input.length.toLocaleString()} chars`
									: "⌘/Ctrl + ↵ to Import"}
							</span>
						</div>

						{/* Textarea */}
						<div className="flex-1 relative p-4 sm:p-6">
							<textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder='{ "draw": 1, "recordsTotal": 900, "data": [...] }'
								className="w-full h-full min-h-[340px] p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl text-slate-900 font-mono text-xs leading-relaxed outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y"
								spellCheck={false}
							/>
						</div>

						{/* Status Bar & Submit Row */}
						<div className="p-4 sm:p-5 bg-slate-50/60 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="flex-1 w-full sm:w-auto">
								<AnimatePresence mode="wait">
									{status.type !== "idle" && (
										<motion.div
											key={status.type}
											initial={reduceMotion ? false : { opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 10 }}
											className="flex items-center gap-2.5"
										>
											{status.type === "loading" ? (
												<Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
											) : status.type === "success" ? (
												<CheckCircle2 className="w-4 h-4 text-emerald-600" />
											) : (
												<AlertCircle className="w-4 h-4 text-rose-600" />
											)}
											<span
												className={`text-xs font-bold uppercase tracking-wider ${
													status.type === "loading"
														? "text-indigo-600"
														: status.type === "success"
															? "text-emerald-700"
															: "text-rose-700"
												}`}
											>
												{status.message}
											</span>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							<div className="flex items-center gap-2.5 w-full sm:w-auto">
								<button
									type="button"
									onClick={handleResetInput}
									disabled={!input.trim()}
									className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
								>
									<RotateCcw className="w-3.5 h-3.5" />
									<span>Clear</span>
								</button>

								<button
									type="button"
									onClick={handleImport}
									disabled={!input.trim() || status.type === "loading"}
									className="flex-[2] sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
								>
									<Upload className="w-4 h-4" />
									<span>Import to Redis</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</main>
		</PinGuard>
	);
}
