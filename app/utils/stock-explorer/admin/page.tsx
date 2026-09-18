"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
	LayoutTemplate,
	Code2,
	RotateCcw,
	Radio,
	CloudDownload,
	Eye,
	ChevronDown,
	ChevronUp,
	ChevronRight,
	Calendar,
	Server,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import PinGuard from "@/features/auth/PinGuard";
import CustomModal from "@/features/shared/components/CustomModal";
import { format } from "date-fns";

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

interface NormalizedStockRecord {
	No: number;
	IDStockSummary?: number;
	Date: string;
	StockCode: string;
	StockName: string;
	Remarks: string;
	Previous: number;
	OpenPrice: number;
	FirstTrade: number;
	High: number;
	Low: number;
	Close: number;
	Change: number;
	Volume: number;
	Value: number;
	Frequency: number;
	IndexIndividual: number;
	Offer: number;
	OfferVolume: number;
	Bid: number;
	BidVolume: number;
	ForeignSell: number;
	ForeignBuy: number;
	NonRegularVolume: number;
	NonRegularValue: number;
	NonRegularFrequency: number;
	[key: string]: unknown;
}

const SAMPLE_TEMPLATE = `{
  "draw": 1,
  "recordsTotal": 3,
  "recordsFiltered": 3,
  "data": [
    {
      "No": 1,
      "IDStockSummary": 101,
      "Date": "2026-09-05T00:00:00",
      "StockCode": "BBCA",
      "StockName": "Bank Central Asia Tbk.",
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
      "IndexIndividual": 100,
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
      "IDStockSummary": 102,
      "Date": "2026-09-05T00:00:00",
      "StockCode": "BBRI",
      "StockName": "Bank Rakyat Indonesia (Persero) Tbk.",
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
      "IndexIndividual": 100,
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
      "IDStockSummary": 103,
      "Date": "2026-09-05T00:00:00",
      "StockCode": "BMRI",
      "StockName": "Bank Mandiri (Persero) Tbk.",
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
      "IndexIndividual": 100,
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

/**
 * Resilient array extractor for various IDX JSON response structures
 */
function extractStockArray(parsed: unknown): unknown[] | null {
	if (Array.isArray(parsed)) {
		return parsed;
	}
	if (typeof parsed === "object" && parsed !== null) {
		const obj = parsed as Record<string, unknown>;
		if (Array.isArray(obj.data)) return obj.data;
		if (Array.isArray(obj.results)) return obj.results;
		if (Array.isArray(obj.stocks)) return obj.stocks;
		if (Array.isArray(obj.items)) return obj.items;

		for (const val of Object.values(obj)) {
			if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
				return val;
			}
		}
	}
	return null;
}

/**
 * Normalizes input stock objects to ensure consistent field names and types
 */
function normalizeStockData(rawArray: unknown[]): NormalizedStockRecord[] {
	const defaultDate = new Date().toISOString();

	return rawArray
		.filter(
			(item): item is Record<string, unknown> =>
				typeof item === "object" && item !== null,
		)
		.map((item, index) => {
			const code = String(
				item.StockCode ||
					item.Code ||
					item.code ||
					item.symbol ||
					item.Ticker ||
					item.ticker ||
					"",
			)
				.trim()
				.toUpperCase();

			const name = String(
				item.StockName || item.Name || item.name || item.companyName || "",
			).trim();

			const dateStr = String(
				item.Date || item.date || item.tradingDate || defaultDate,
			).trim();

			return {
				...item,
				No: Number(item.No) || index + 1,
				IDStockSummary: Number(item.IDStockSummary) || index + 1,
				Date: dateStr,
				StockCode: code,
				StockName: name || code,
				Remarks: String(item.Remarks || item.remarks || ""),
				Previous: Number(item.Previous || item.previous) || 0,
				OpenPrice: Number(item.OpenPrice || item.openPrice || item.open) || 0,
				FirstTrade: Number(item.FirstTrade || item.firstTrade) || 0,
				High: Number(item.High || item.high) || 0,
				Low: Number(item.Low || item.low) || 0,
				Close: Number(item.Close || item.close || item.price) || 0,
				Change: Number(item.Change || item.change) || 0,
				Volume: Number(item.Volume || item.volume) || 0,
				Value: Number(item.Value || item.value) || 0,
				Frequency: Number(item.Frequency || item.frequency) || 0,
				IndexIndividual:
					Number(item.IndexIndividual || item.indexIndividual) || 0,
				Offer: Number(item.Offer || item.offer) || 0,
				OfferVolume: Number(item.OfferVolume || item.offerVolume) || 0,
				Bid: Number(item.Bid || item.bid) || 0,
				BidVolume: Number(item.BidVolume || item.bidVolume) || 0,
				ForeignSell: Number(item.ForeignSell || item.foreignSell) || 0,
				ForeignBuy: Number(item.ForeignBuy || item.foreignBuy) || 0,
				NonRegularVolume:
					Number(item.NonRegularVolume || item.nonRegularVolume) || 0,
				NonRegularValue:
					Number(item.NonRegularValue || item.nonRegularValue) || 0,
				NonRegularFrequency:
					Number(item.NonRegularFrequency || item.nonRegularFrequency) || 0,
			};
		})
		.filter((record) => record.StockCode.length > 0);
}

function formatTradingDate(dateStr: string | null): string {
	if (!dateStr) return "N/A";
	try {
		const d = new Date(dateStr);
		if (Number.isNaN(d.getTime())) return dateStr.substring(0, 10);
		return format(d, "dd MMM yyyy");
	} catch {
		return dateStr.substring(0, 10);
	}
}

function formatCompactNumber(num: number): string {
	if (num >= 1_000_000_000_000) {
		return `${(num / 1_000_000_000_000).toFixed(2)}T`;
	}
	if (num >= 1_000_000_000) {
		return `${(num / 1_000_000_000).toFixed(2)}B`;
	}
	if (num >= 1_000_000) {
		return `${(num / 1_000_000).toFixed(2)}M`;
	}
	if (num >= 1_000) {
		return `${(num / 1_000).toFixed(1)}K`;
	}
	return num.toLocaleString();
}

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

	const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
	const [isPurging, setIsPurging] = useState(false);
	const [isLiveFetching, setIsLiveFetching] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [showPreviewTable, setShowPreviewTable] = useState(false);

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

	// Compute pre-import data preview
	const previewData = useMemo(() => {
		if (!input.trim()) return null;
		try {
			const parsed = JSON.parse(input);
			const arr = extractStockArray(parsed);
			if (!arr || arr.length === 0) return null;
			const normalized = normalizeStockData(arr);
			if (normalized.length === 0) return null;

			const totalVolume = normalized.reduce(
				(acc, s) => acc + (s.Volume || 0),
				0,
			);
			const totalValue = normalized.reduce((acc, s) => acc + (s.Value || 0), 0);
			const sampleDate = normalized[0]?.Date || null;

			return {
				totalCount: normalized.length,
				totalVolume,
				totalValue,
				sampleDate,
				samples: normalized.slice(0, 5),
			};
		} catch {
			return null;
		}
	}, [input]);

	// Live sync from IDX API
	const handleLiveSync = async () => {
		setIsLiveFetching(true);
		setStatus({
			type: "loading",
			message: "Attempting live IDX Trading Summary fetch...",
		});

		try {
			const response = await fetch("/api/utils/stock-data?refresh=true");
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to fetch live stock data");
			}

			if (result.source === "idx_live") {
				setStatus({
					type: "success",
					message: `Successfully synced ${result.data?.length || 0} stocks directly from IDX!`,
				});
			} else if (result.source === "fallback_static") {
				setStatus({
					type: "error",
					message:
						"Live IDX blocked datacenter IP. Fallback loaded. Please use manual JSON upload below.",
				});
			} else {
				setStatus({
					type: "success",
					message: `Cache updated from ${result.source} (${result.data?.length || 0} items).`,
				});
			}
			fetchCacheStatus();
		} catch (err: unknown) {
			setStatus({
				type: "error",
				message: err instanceof Error ? err.message : "Live IDX sync failed.",
			});
		} finally {
			setIsLiveFetching(false);
		}
	};

	// Import to Redis with normalization & force overwrite
	const handleImport = useCallback(async () => {
		if (!input.trim()) return;

		setStatus({ type: "loading", message: "Validating JSON structure..." });

		try {
			let parsed: unknown;
			try {
				parsed = JSON.parse(input);
			} catch {
				throw new Error("Invalid JSON format. Please check your syntax.");
			}

			const stockArray = extractStockArray(parsed);
			if (!stockArray || stockArray.length === 0) {
				throw new Error(
					"Invalid structure. Could not find an array of stock objects in the JSON.",
				);
			}

			const normalizedData = normalizeStockData(stockArray);
			if (normalizedData.length === 0) {
				throw new Error("No valid stock records with ticker codes found.");
			}

			setStatus({
				type: "loading",
				message: `Importing ${normalizedData.length} records to Redis (Force Overwrite)...`,
			});

			const response = await fetch("/api/admin/import-stock", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ data: normalizedData, force: true }),
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
				message:
					result.message ||
					`Successfully imported ${normalizedData.length} instruments to Redis!`,
			});
			setInput("");
			fetchCacheStatus();
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

	// Cache Purge Confirmation
	const handleClearCacheConfirm = async () => {
		setIsPurging(true);
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
				message: result.message || "Redis cache cleared successfully.",
			});
			setIsPurgeModalOpen(false);
			fetchCacheStatus();
		} catch (error: unknown) {
			console.error("Clear Cache Error:", error);
			setStatus({
				type: "error",
				message:
					error instanceof Error
						? error.message
						: "An unexpected error occurred while clearing cache.",
			});
		} finally {
			setIsPurging(false);
		}
	};

	const processUploadedFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target?.result;
			if (typeof content === "string") {
				try {
					const parsed = JSON.parse(content);
					const extracted = extractStockArray(parsed);
					if (extracted && extracted.length > 0) {
						setInput(JSON.stringify(parsed, null, 2));
						setStatus({
							type: "success",
							message: `Loaded ${file.name} (${extracted.length} instruments detected)`,
						});
					} else {
						setInput(content);
						setStatus({
							type: "error",
							message:
								"Uploaded file does not contain a recognized stock records array.",
						});
					}
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
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		processUploadedFile(file);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (!file.name.endsWith(".json") && file.type !== "application/json") {
				setStatus({
					type: "error",
					message: "Please drop a valid .json file.",
				});
				return;
			}
			processUploadedFile(file);
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
			message: "Sample IDX template loaded (BBCA, BBRI, BMRI).",
		});
	};

	const handleResetInput = () => {
		setInput("");
		setStatus({ type: "idle", message: "" });
	};

	return (
		<PinGuard>
			<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36 px-4 sm:px-6 lg:px-8">
				<div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
					{/* Top Floating Header Card */}
					<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
							<div className="space-y-1.5 sm:space-y-2">
								<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold uppercase tracking-wider">
									<Database className="w-3.5 h-3.5 text-indigo-600" />
									<span>Financial Registry</span>
									<span className="w-1 h-1 rounded-full bg-indigo-400" />
									<span className="text-[11px] font-semibold text-indigo-600 lowercase tracking-normal">
										idx market synchronization
									</span>
								</div>
								<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
									Stock Explorer Manager
								</h1>
								<div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
									<Link
										href="/admin"
										className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline"
									>
										Admin Dashboard
									</Link>
									<ChevronRight className="w-3 h-3 text-slate-400" />
									<span className="text-slate-900 font-bold">
										Stock Registry
									</span>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<Link
									href="/utils/stock-explorer"
									className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 hover:text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-[background-color,color] active:scale-95 cursor-pointer !no-underline group"
								>
									<ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
									<span>Back to Explorer</span>
								</Link>
							</div>
						</div>
					</div>

					{/* Cache Status Indicator Card */}
					<section className="bg-white border border-slate-200/80 rounded-3xl shadow-xs p-5 sm:p-7 space-y-5 sm:space-y-6">
						{/* Card Header & Operational Controls */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
							<div className="flex items-center gap-3.5">
								<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
									<Server className="w-5 h-5" />
								</div>
								<div className="space-y-0.5">
									<div className="flex items-center gap-2.5 flex-wrap">
										<h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
											Redis Cache Status
										</h2>
										{cacheStatus.loading ? (
											<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
												<Loader2 className="w-3 h-3 animate-spin text-slate-500" />
												<span>Verifying</span>
											</span>
										) : cacheStatus.available ? (
											<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80">
												<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
												<span>Active Cache</span>
											</span>
										) : (
											<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/80">
												<AlertCircle className="w-3 h-3 text-rose-500" />
												<span>No Cache / Expired</span>
											</span>
										)}
									</div>
									<p className="text-xs text-slate-500 font-medium">
										In-memory IDX equity dataset status and operational controls
									</p>
								</div>
							</div>

							{/* Cache Actions */}
							<div className="flex items-center gap-2 self-start sm:self-center shrink-0">
								<button
									type="button"
									onClick={fetchCacheStatus}
									disabled={cacheStatus.loading}
									className="flex items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-slate-600 hover:text-slate-900 transition-[background-color,color] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-2xs"
									title="Refresh Status"
									aria-label="Refresh Cache Status"
								>
									<RefreshCw
										className={`w-4 h-4 ${cacheStatus.loading ? "animate-spin text-indigo-600" : ""}`}
									/>
								</button>

								<button
									type="button"
									onClick={handleLiveSync}
									disabled={isLiveFetching || cacheStatus.loading}
									className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold uppercase tracking-wider transition-[background-color] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-2xs"
									title="Trigger Live IDX API Fetch"
								>
									{isLiveFetching ? (
										<Loader2 className="w-3.5 h-3.5 animate-spin" />
									) : (
										<Radio className="w-3.5 h-3.5" />
									)}
									<span>Sync Live</span>
								</button>

								<button
									type="button"
									onClick={() => setIsPurgeModalOpen(true)}
									disabled={!cacheStatus.available || cacheStatus.loading}
									className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-bold uppercase tracking-wider transition-[background-color] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-2xs"
								>
									<Trash2 className="w-3.5 h-3.5" />
									<span>Purge Cache</span>
								</button>
							</div>
						</div>

						{/* Telemetry Metrics Grid or Empty/Loading Fallback */}
						{cacheStatus.loading ? (
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex flex-col justify-between min-h-[118px] animate-pulse"
									>
										<div className="flex items-center justify-between mb-2">
											<div className="h-3 w-24 bg-slate-200 rounded-md" />
											<div className="w-7 h-7 rounded-lg bg-slate-200" />
										</div>
										<div className="h-7 w-28 bg-slate-200 rounded-lg my-1" />
										<div className="h-3 w-36 bg-slate-200 rounded-md mt-1" />
									</div>
								))}
							</div>
						) : cacheStatus.available ? (
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
								<div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex flex-col justify-between group hover:bg-slate-50 transition-colors min-w-0">
									<div className="flex items-center justify-between mb-2">
										<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
											Total Instruments
										</span>
										<div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-2xs shrink-0">
											<Database className="w-3.5 h-3.5" />
										</div>
									</div>
									<div className="flex items-baseline gap-1.5">
										<p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
											{cacheStatus.count.toLocaleString()}
										</p>
										<span className="text-xs font-bold text-slate-400">
											equities
										</span>
									</div>
									<p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
										Active symbols indexed in Redis
									</p>
								</div>

								<div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex flex-col justify-between group hover:bg-slate-50 transition-colors min-w-0">
									<div className="flex items-center justify-between mb-2">
										<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
											Trading Date
										</span>
										<div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-2xs shrink-0">
											<Calendar className="w-3.5 h-3.5" />
										</div>
									</div>
									<p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
										{formatTradingDate(cacheStatus.lastDate)}
									</p>
									<p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
										Latest IDX market close session
									</p>
								</div>

								<div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/90 flex flex-col justify-between group hover:bg-indigo-50/80 transition-colors min-w-0">
									<div className="flex items-center justify-between mb-2">
										<span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider truncate">
											Cache Lifespan
										</span>
										<div className="w-7 h-7 rounded-lg bg-white border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
											<Clock className="w-3.5 h-3.5" />
										</div>
									</div>
									<div className="flex items-baseline gap-1.5">
										<p className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">
											12
										</p>
										<span className="text-xs font-bold text-indigo-800">
											Hours
										</span>
									</div>
									<p className="text-[11px] font-medium text-indigo-700/90 mt-1 truncate">
										Auto-purges via rolling Redis TTL
									</p>
								</div>
							</div>
						) : (
							<div className="rounded-2xl bg-amber-50/60 border border-amber-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
								<div className="flex items-start gap-3.5">
									<div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
										<AlertCircle className="w-5 h-5" />
									</div>
									<div className="space-y-1">
										<h4 className="text-sm font-bold text-amber-950">
											Redis Cache is Empty or Expired
										</h4>
										<p className="text-xs text-amber-800/90 leading-relaxed font-medium max-w-2xl">
											No equity records are currently stored in Redis. The
											system will automatically fetch live data on the next
											query, or you can prime the dataset immediately.
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={handleLiveSync}
									disabled={isLiveFetching}
									className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-[background-color] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shrink-0 shadow-xs"
								>
									{isLiveFetching ? (
										<Loader2 className="w-3.5 h-3.5 animate-spin" />
									) : (
										<CloudDownload className="w-3.5 h-3.5" />
									)}
									<span>Prime Cache Now</span>
								</button>
							</div>
						)}
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
									If cloud datacenter IP is blocked by IDX, drag and drop or
									paste the raw JSON response from IDX Trading Summary below to
									manually prime the Redis cache.
								</p>
							</div>
						</div>
					</section>

					{/* Input Area with Drag & Drop */}
					<div
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						className={`bg-white border rounded-[2rem] shadow-xs overflow-hidden flex flex-col min-h-[480px] transition-[border-color,box-shadow,background-color] relative ${
							isDragging
								? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10"
								: "border-slate-200/80"
						}`}
					>
						{/* Drag & Drop Visual Overlay */}
						{isDragging && (
							<div className="absolute inset-0 z-20 bg-indigo-50/90 backdrop-blur-xs border-2 border-dashed border-indigo-500 rounded-[2rem] flex flex-col items-center justify-center gap-3 pointer-events-none">
								<div className="w-14 h-14 rounded-2xl bg-white border border-indigo-200 shadow-xs flex items-center justify-center text-indigo-600">
									<FileUp className="w-7 h-7" />
								</div>
								<div className="text-center">
									<p className="text-sm font-extrabold text-indigo-950 uppercase tracking-wider">
										Drop JSON File to Load Instruments
									</p>
									<p className="text-xs text-indigo-700 font-medium">
										IDX Trading Summary structure detected automatically
									</p>
								</div>
							</div>
						)}

						{/* Quick Action Toolbar */}
						<div className="p-3 sm:p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5">
							<div className="flex flex-wrap items-center gap-2">
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
									className="px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-[background-color] flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
								>
									<FileUp className="w-3.5 h-3.5 text-indigo-600" />
									<span>Upload JSON File</span>
								</button>

								<button
									type="button"
									onClick={handleFormatJson}
									disabled={!input.trim()}
									className="px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold transition-[background-color] flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
								>
									<Code2 className="w-3.5 h-3.5 text-indigo-600" />
									<span>Format JSON</span>
								</button>

								<button
									type="button"
									onClick={handleLoadSample}
									className="px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-[background-color] flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
								>
									<LayoutTemplate className="w-3.5 h-3.5 text-amber-500" />
									<span>Load Sample</span>
								</button>
							</div>

							<div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-slate-500 font-mono">
								{input.length > 0 && (
									<span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700">
										{input.length.toLocaleString()} chars
									</span>
								)}
								<span className="inline-flex items-center gap-1 text-slate-500">
									<kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200/80 text-[10px] text-slate-600 shadow-2xs font-mono">
										⌘/Ctrl + ↵
									</kbd>
									<span className="text-slate-400 font-sans font-semibold">
										to import
									</span>
								</span>
							</div>
						</div>

						{/* Pre-Import Inspector Strip */}
						{previewData && (
							<div className="p-3 sm:p-4 bg-emerald-50/50 border-b border-emerald-100 flex flex-col gap-2.5">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div className="flex flex-wrap items-center gap-2 text-xs">
										<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-extrabold text-[11px] border border-emerald-200/60">
											<CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
											{previewData.totalCount.toLocaleString()} Instruments
											Detected
										</span>
										<span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 font-bold text-[11px]">
											Date: {formatTradingDate(previewData.sampleDate)}
										</span>
										<span className="hidden md:inline-flex px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-slate-600 font-medium text-[11px]">
											Vol: {formatCompactNumber(previewData.totalVolume)}
										</span>
										<span className="hidden md:inline-flex px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-slate-600 font-medium text-[11px]">
											Val: Rp {formatCompactNumber(previewData.totalValue)}
										</span>
									</div>

									<button
										type="button"
										onClick={() => setShowPreviewTable((prev) => !prev)}
										className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/60 transition-[background-color,color] active:scale-95 cursor-pointer"
									>
										<Eye className="w-3.5 h-3.5" />
										<span>
											{showPreviewTable ? "Hide Sample" : "Inspect Sample"}
										</span>
										{showPreviewTable ? (
											<ChevronUp className="w-3.5 h-3.5" />
										) : (
											<ChevronDown className="w-3.5 h-3.5" />
										)}
									</button>
								</div>

								{/* Collapsible Mini Preview Table */}
								{showPreviewTable && (
									<div className="overflow-x-auto bg-white rounded-xl border border-emerald-200/80 p-2 shadow-2xs mt-1">
										<table className="w-full text-left text-[11px]">
											<thead>
												<tr className="border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
													<th className="p-1.5">Ticker</th>
													<th className="p-1.5">Name</th>
													<th className="p-1.5 text-right">Close</th>
													<th className="p-1.5 text-right">Change</th>
													<th className="p-1.5 text-right">Volume</th>
													<th className="p-1.5 text-right">Foreign Buy</th>
													<th className="p-1.5 text-right">Foreign Sell</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-50 font-medium text-slate-800">
												{previewData.samples.map((stock) => (
													<tr
														key={stock.StockCode}
														className="hover:bg-slate-50/70 transition-colors"
													>
														<td className="p-1.5 font-mono font-bold text-indigo-700">
															{stock.StockCode}
														</td>
														<td className="p-1.5 truncate max-w-[180px]">
															{stock.StockName}
														</td>
														<td className="p-1.5 text-right font-mono font-bold">
															{stock.Close.toLocaleString()}
														</td>
														<td
															className={`p-1.5 text-right font-mono font-bold ${
																stock.Change > 0
																	? "text-emerald-600"
																	: stock.Change < 0
																		? "text-rose-600"
																		: "text-slate-500"
															}`}
														>
															{stock.Change > 0
																? `+${stock.Change}`
																: stock.Change}
														</td>
														<td className="p-1.5 text-right font-mono text-slate-600">
															{formatCompactNumber(stock.Volume)}
														</td>
														<td className="p-1.5 text-right font-mono text-emerald-700">
															{formatCompactNumber(stock.ForeignBuy)}
														</td>
														<td className="p-1.5 text-right font-mono text-rose-700">
															{formatCompactNumber(stock.ForeignSell)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						)}

						{/* Textarea */}
						<div className="flex-1 relative p-4 sm:p-6">
							<textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder='Paste IDX JSON data here or drag and drop a .json file... e.g. { "data": [ { "StockCode": "BBCA", ... } ] }'
								className="w-full h-full min-h-[340px] p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl text-slate-900 font-mono text-xs leading-relaxed outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-[border-color,background-color,box-shadow] resize-y"
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
												<Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
											) : status.type === "success" ? (
												<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
											) : (
												<AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
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
									className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-[background-color,color] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-xs"
								>
									<RotateCcw className="w-3.5 h-3.5" />
									<span>Clear</span>
								</button>

								<button
									type="button"
									onClick={handleImport}
									disabled={!input.trim() || status.type === "loading"}
									className="flex-[2] sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-[background-color] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
								>
									{status.type === "loading" ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<Upload className="w-4 h-4" />
									)}
									<span>
										{status.type === "loading"
											? "Importing..."
											: "Import to Redis"}
									</span>
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* High-Fidelity CustomModal for Cache Purging */}
				<CustomModal
					isOpen={isPurgeModalOpen}
					onClose={() => setIsPurgeModalOpen(false)}
					onConfirm={handleClearCacheConfirm}
					title="Purge Stock Cache?"
					description="Are you sure you want to purge the IDX stock data from Redis cache? This will delete all instruments and reset the auto-fetch cooldown."
					confirmText="Yes, Purge Cache"
					cancelText="Cancel"
					variant="danger"
					isLoading={isPurging}
				/>
			</main>
		</PinGuard>
	);
}
