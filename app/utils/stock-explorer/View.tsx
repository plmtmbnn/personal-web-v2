"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useDebounce } from "./hooks/useDebounce";
import {
	Search,
	RefreshCw,
	ArrowLeft,
	Filter,
	X,
	Settings,
	Activity,
	BarChart2,
	ChevronRight,
	Eye,
	AlertCircle,
	Flame,
	ArrowRightLeft,
	Globe,
} from "lucide-react";
import StockTable from "./components/StockTable";
import MarketSummary from "./components/MarketSummary";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface IDXStock {
	No: number;
	IDStockSummary: number;
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
	ListedShares: number;
	TradebleShares: number;
	WeightForIndex: number;
	ForeignSell: number;
	ForeignBuy: number;
	DelistingDate: string;
	NonRegularVolume: number;
	NonRegularValue: number;
	NonRegularFrequency: number;
	persen: number | null;
	percentage: number | null;
}

export interface ProcessedStock extends IDXStock {
	ForeignNet: number;
	ChangePct: number;
	IsHighVolume: boolean;
}

export type SortKey = keyof ProcessedStock;

/**
 * Type guard to validate if an object matches the IDXStock interface.
 * @param data - The data to validate.
 * @returns True if the data matches the IDXStock interface.
 */
const isIDXStock = (data: any): data is IDXStock => {
	return (
		data &&
		typeof data.StockCode === "string" &&
		typeof data.Previous === "number"
	);
};
export interface SortConfig {
	key: SortKey;
	direction: "asc" | "desc" | null;
}

// ─── Formatters ────────────────────────────────────────────────────────────

const fmtIDR = (n: number) =>
	new Intl.NumberFormat("id-ID", {
		style: "decimal",
		minimumFractionDigits: 0,
	}).format(n);

// ─── Search Header ─────────────────────────────────────────────────────────

function SearchHeader({
	searchQuery,
	setSearchQuery,
	totalCount,
	filteredCount,
	onRefresh,
	isLoading,
	priceRange,
	setPriceRange,
	changeRange,
	setChangeRange,
	foreignFilter,
	setForeignFilter,
	volumeOnly,
	setVolumeOnly,
}: {
	searchQuery: string;
	setSearchQuery: (v: string) => void;
	totalCount: number;
	filteredCount: number;
	onRefresh: () => void;
	isLoading: boolean;
	priceRange: [number, number];
	setPriceRange: (v: [number, number]) => void;
	changeRange: [number, number];
	setChangeRange: (v: [number, number]) => void;
	foreignFilter: "all" | "buy" | "sell";
	setForeignFilter: (v: "all" | "buy" | "sell") => void;
	volumeOnly: boolean;
	setVolumeOnly: (v: boolean) => void;
}) {
	const [open, setOpen] = useState(false);
	const hasFilters =
		priceRange[0] > 0 ||
		priceRange[1] < 1000000 ||
		changeRange[0] > -100 ||
		changeRange[1] < 100 ||
		foreignFilter !== "all" ||
		volumeOnly;

	return (
		<div className="space-y-3 mb-5">
			<div className="flex flex-col md:flex-row gap-3">
				<div className="relative flex-1 group">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
					<input
						type="text"
						placeholder="Search ticker or company…"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-11 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-[12px] font-bold text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all shadow-sm"
					/>
					{searchQuery && (
						<button
							onClick={() => setSearchQuery("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-300 hover:text-rose-400 transition-colors"
						>
							<X className="w-3.5 h-3.5" />
						</button>
					)}
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					{(["all", "buy", "sell"] as const).map((opt) => (
						<button
							key={opt}
							onClick={() =>
								setForeignFilter(
									foreignFilter === opt && opt !== "all" ? "all" : opt,
								)
							}
							className={`hidden md:flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm ${foreignFilter === opt ? (opt === "buy" ? "bg-emerald-600 border-emerald-600 text-white" : opt === "sell" ? "bg-rose-500 border-rose-500 text-white" : "bg-stone-800 border-stone-800 text-white") : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"}`}
						>
							<Globe className="w-3 h-3" />
							{opt === "all"
								? "All Flow"
								: opt === "buy"
									? "Fgn. Buy"
									: "Fgn. Sell"}
						</button>
					))}
					<button
						onClick={() => setVolumeOnly(!volumeOnly)}
						className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm ${volumeOnly ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"}`}
					>
						<Flame className="w-3 h-3" />
						Hot Only
					</button>
					<button
						onClick={() => setOpen(!open)}
						className={`relative p-2.5 rounded-xl border transition-all shadow-sm ${open || hasFilters ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"}`}
					>
						<Filter className="w-4 h-4" />
						{hasFilters && (
							<span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[7px] font-black rounded-full flex items-center justify-center">
								!
							</span>
						)}
					</button>
					<button
						onClick={onRefresh}
						disabled={isLoading}
						className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-amber-600 hover:border-amber-300 transition-all shadow-sm disabled:opacity-40"
					>
						<RefreshCw
							className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
						/>
					</button>
					<Link
						href="/utils/stock-explorer/admin"
						className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-all shadow-sm"
					>
						<Settings className="w-4 h-4" />
					</Link>
					{hasFilters && (
						<button
							onClick={() => {
								setPriceRange([0, 1000000]);
								setChangeRange([-100, 100]);
								setForeignFilter("all");
								setVolumeOnly(false);
								setSearchQuery("");
							}}
							className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all shadow-sm"
						>
							<X className="w-3 h-3" />
							Reset
						</button>
					)}
					<div className="hidden md:flex flex-col items-end pl-3 border-l border-stone-200">
						<span className="text-lg font-black text-stone-900 tabular-nums leading-none">
							{filteredCount}
						</span>
						<span className="text-[8px] font-black uppercase tracking-widest text-stone-400">
							of {totalCount}
						</span>
					</div>
				</div>
			</div>

			{/* Filter Chips */}
			<AnimatePresence>
				{hasFilters && (
					<motion.div
						initial={{ opacity: 0, y: -5 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -5 }}
						className="flex flex-wrap gap-2"
					>
						{priceRange[0] > 0 && (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-stone-200 shadow-sm">
								Min {fmtIDR(priceRange[0])}{" "}
								<X
									className="w-2.5 h-2.5 cursor-pointer hover:text-rose-500"
									onClick={() => setPriceRange([0, priceRange[1]])}
								/>
							</span>
						)}
						{priceRange[1] < 1000000 && (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-stone-200 shadow-sm">
								Max {fmtIDR(priceRange[1])}{" "}
								<X
									className="w-2.5 h-2.5 cursor-pointer hover:text-rose-500"
									onClick={() => setPriceRange([priceRange[0], 1000000])}
								/>
							</span>
						)}
						{changeRange[0] > -100 && (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-stone-200 shadow-sm">
								Min {changeRange[0]}%{" "}
								<X
									className="w-2.5 h-2.5 cursor-pointer hover:text-rose-500"
									onClick={() => setChangeRange([-100, changeRange[1]])}
								/>
							</span>
						)}
						{changeRange[1] < 100 && (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-stone-200 shadow-sm">
								Max {changeRange[1]}%{" "}
								<X
									className="w-2.5 h-2.5 cursor-pointer hover:text-rose-500"
									onClick={() => setChangeRange([changeRange[0], 100])}
								/>
							</span>
						)}
						{foreignFilter !== "all" && (
							<span
								className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${foreignFilter === "buy" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"}`}
							>
								Fgn. {foreignFilter}{" "}
								<X
									className="w-2.5 h-2.5 cursor-pointer hover:opacity-70"
									onClick={() => setForeignFilter("all")}
								/>
							</span>
						)}
						{volumeOnly && (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-200 shadow-sm">
								Hot Only{" "}
								<X
									className="w-2.5 h-2.5 cursor-pointer hover:text-rose-500"
									onClick={() => setVolumeOnly(false)}
								/>
							</span>
						)}
						<button
							onClick={() => {
								setPriceRange([0, 1000000]);
								setChangeRange([-100, 100]);
								setForeignFilter("all");
								setVolumeOnly(false);
								setSearchQuery("");
							}}
							className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 underline underline-offset-4 ml-1"
						>
							Clear All
						</button>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="overflow-hidden"
					>
						<div className="p-5 bg-white border border-stone-200 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">
							<div className="space-y-2">
								<p className="text-[9px] font-black uppercase tracking-[0.35em] text-stone-400">
									Price Range (IDR)
								</p>
								<div className="flex items-center gap-2">
									<input
										type="number"
										value={priceRange[0]}
										onChange={(e) =>
											setPriceRange([Number(e.target.value), priceRange[1]])
										}
										className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[11px] font-bold text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
										placeholder="Min"
									/>
									<span className="text-stone-300">—</span>
									<input
										type="number"
										value={priceRange[1]}
										onChange={(e) =>
											setPriceRange([priceRange[0], Number(e.target.value)])
										}
										className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[11px] font-bold text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
										placeholder="Max"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<p className="text-[9px] font-black uppercase tracking-[0.35em] text-stone-400">
									Daily Change (%)
								</p>
								<div className="flex items-center gap-2">
									<input
										type="number"
										value={changeRange[0]}
										onChange={(e) =>
											setChangeRange([Number(e.target.value), changeRange[1]])
										}
										className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[11px] font-bold text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
										placeholder="Min %"
									/>
									<span className="text-stone-300">—</span>
									<input
										type="number"
										value={changeRange[1]}
										onChange={(e) =>
											setChangeRange([changeRange[0], Number(e.target.value)])
										}
										className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[11px] font-bold text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
										placeholder="Max %"
									/>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function StockExplorerView() {
	const [stocks, setStocks] = useState<IDXStock[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearchQuery = useDebounce(searchQuery, 300);
	const [sortConfig, setSortConfig] = useState<SortConfig>({
		key: "Volume",
		direction: "desc",
	});
	const [visibleCount, setVisibleCount] = useState(50);
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
	const [changeRange, setChangeRange] = useState<[number, number]>([-100, 100]);
	const [foreignFilter, setForeignFilter] = useState<"all" | "buy" | "sell">(
		"all",
	);
	const [volumeOnly, setVolumeOnly] = useState(false);

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/utils/stock-data");
			if (res.status === 404) {
				setStocks([]);
				return;
			}
			if (!res.ok) {
				const e = await res.json();
				throw new Error(e.error || "Sync failure");
			}
			const result = await res.json();
			if (!Array.isArray(result.data)) {
				throw new Error("Invalid data format received");
			}
			// Validate each stock item
			if (!result.data.every(isIDXStock)) {
				throw new Error("Invalid stock data received");
			}
			setStocks(result.data);
		} catch (e: any) {
			setError(e.message || "Failed to fetch");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleSort = (key: SortKey) => {
		setSortConfig((prev) => {
			if (prev.key === key) {
				if (prev.direction === "asc") return { key, direction: "desc" };
				if (prev.direction === "desc") return { key, direction: null };
				return { key, direction: "asc" };
			}
			return { key, direction: "asc" };
		});
	};

	const processedStocks = useMemo((): ProcessedStock[] => {
		if (!stocks.length) return [];

		// Step 1: Process raw stock data into ProcessedStock
		let result: ProcessedStock[] = stocks.map((s) => ({
			...s,
			ForeignNet: (s.ForeignBuy || 0) - (s.ForeignSell || 0),
			ChangePct:
				s.Previous !== 0 ? ((s.Close - s.Previous) / s.Previous) * 100 : 0,
			IsHighVolume: false,
		}));

		// Step 2: Determine high volume threshold
		const sortedVol = [...result].map((s) => s.Volume).sort((a, b) => b - a);
		const volThresh = sortedVol[Math.floor(result.length * 0.1)] || 0;
		result = result.map((s) => ({
			...s,
			IsHighVolume: s.Volume >= volThresh && s.Volume > 0,
		}));

		// Step 3: Apply search filter
		if (debouncedSearchQuery) {
			const q = debouncedSearchQuery.toLowerCase().trim();
			result = result.filter(
				(s) =>
					s.StockCode.toLowerCase().includes(q) ||
					s.StockName.toLowerCase().includes(q),
			);
		}

		// Step 4: Apply price and change filters
		result = result.filter(
			(s) =>
				s.Close >= priceRange[0] &&
				s.Close <= priceRange[1] &&
				s.ChangePct >= changeRange[0] &&
				s.ChangePct <= changeRange[1],
		);

		// Step 5: Apply foreign flow filter
		if (foreignFilter === "buy")
			result = result.filter((s) => s.ForeignNet > 0);
		if (foreignFilter === "sell")
			result = result.filter((s) => s.ForeignNet < 0);

		// Step 6: Apply volume filter
		if (volumeOnly) result = result.filter((s) => s.IsHighVolume);

		// Step 7: Apply sorting
		if (sortConfig.key && sortConfig.direction) {
			result.sort((a, b) => {
				const k = sortConfig.key as keyof ProcessedStock;
				const va = a[k] ?? 0,
					vb = b[k] ?? 0;
				if (typeof va === "string" && typeof vb === "string")
					return sortConfig.direction === "asc"
						? va.localeCompare(vb)
						: vb.localeCompare(va);
				return sortConfig.direction === "asc"
					? (va as number) - (vb as number)
					: (vb as number) - (va as number);
			});
		}

		return result;
	}, [
		stocks,
		debouncedSearchQuery,
		sortConfig,
		priceRange,
		changeRange,
		foreignFilter,
		volumeOnly,
	]);

	const visibleStocks = useMemo(
		() => processedStocks.slice(0, visibleCount),
		[processedStocks, visibleCount],
	);
	const hasMore = visibleCount < processedStocks.length;
	const date = stocks[0]?.Date || "";

	return (
		<main className="min-h-screen bg-stone-50 font-sans text-stone-900 pb-24 selection:bg-amber-200 relative">
			{/* Dot grid */}
			<div
				className="fixed inset-0 pointer-events-none opacity-30"
				style={{
					backgroundImage:
						"radial-gradient(circle, #d6d3d1 1px, transparent 1px)",
					backgroundSize: "28px 28px",
				}}
			/>
			{/* Amber top bar */}
			<div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 z-50" />

			{/* Sync Overlay */}
			<AnimatePresence>
				{isLoading && stocks.length > 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[60] bg-white/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
					>
						<div className="bg-stone-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
							<RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
							<span className="text-[10px] font-black uppercase tracking-[0.2em]">
								Synchronizing Registry...
							</span>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="max-w-screen-2xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 relative z-10">
				{/* ── Header ── */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10">
					<div>
						<Link
							href="/utils"
							className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.35em] text-stone-400 hover:text-amber-600 transition-colors mb-5 group"
						>
							<ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
							Utility Ecosystem
						</Link>
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
								<BarChart2 className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-stone-900 leading-none">
									IDX <span className="text-amber-500">Explorer</span>
								</h1>
								<p className="text-[9px] font-black uppercase tracking-[0.45em] text-stone-400 mt-2">
									Jakarta Stock Exchange · Interactive Dashboard
								</p>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-3">
						{date && (
							<div className="px-4 py-2 bg-white border border-stone-200 rounded-xl shadow-sm text-center">
								<p className="text-[8px] font-black uppercase tracking-widest text-stone-400">
									Session Date
								</p>
								<p className="text-xs font-black text-stone-800 mt-0.5">
									{date}
								</p>
							</div>
						)}
						<div className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl shadow-sm">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
								<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
							</span>
							<span className="text-[9px] font-black uppercase tracking-widest text-stone-500">
								Live
							</span>
						</div>
					</div>
				</div>

				{/* ── Summary ── */}
				{!isLoading && processedStocks.length > 0 && (
					<MarketSummary stocks={processedStocks} date={date} />
				)}

				{/* ── Search ── */}
				<SearchHeader
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					totalCount={stocks.length}
					filteredCount={processedStocks.length}
					onRefresh={fetchData}
					isLoading={isLoading}
					priceRange={priceRange}
					setPriceRange={setPriceRange}
					changeRange={changeRange}
					setChangeRange={setChangeRange}
					foreignFilter={foreignFilter}
					setForeignFilter={setForeignFilter}
					volumeOnly={volumeOnly}
					setVolumeOnly={setVolumeOnly}
				/>

				{/* ── Error ── */}
				<AnimatePresence>
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-600 shadow-sm"
						>
							<AlertCircle className="w-4 h-4 flex-shrink-0" />
							<p className="text-[11px] font-bold flex-1">{error}</p>
							<button
								onClick={fetchData}
								className="text-[10px] font-black uppercase tracking-wider hover:text-rose-700 transition-colors"
							>
								Retry
							</button>
						</motion.div>
					)}
				</AnimatePresence>

				{/* ── Table ── */}
				<div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
					<div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 bg-stone-50/50">
						<div className="flex items-center gap-2">
							<Eye className="w-3.5 h-3.5 text-stone-400" />
							<span className="text-[9px] font-black uppercase tracking-[0.35em] text-stone-400">
								Transaction Registry
							</span>
							<span className="text-stone-200 mx-1">·</span>
							<span className="text-[9px] font-bold text-stone-400">
								Click any row to expand details
							</span>
						</div>
						<span className="text-[9px] font-bold text-stone-400">
							{Math.min(visibleCount, processedStocks.length)} /{" "}
							{processedStocks.length}
						</span>
					</div>

					{error ? (
						<div className="p-8 text-center">
							<p className="text-stone-500 mb-4">Failed to load stock data.</p>
							<button
								onClick={fetchData}
								className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
							>
								Retry
							</button>
						</div>
					) : processedStocks.length === 0 ? (
						<div className="p-8 text-center">
							<p className="text-stone-500 mb-4">
								No stocks match your criteria.
							</p>
							<button
								onClick={() => {
									setSearchQuery("");
									setPriceRange([0, 1000000]);
									setChangeRange([-100, 100]);
									setForeignFilter("all");
									setVolumeOnly(false);
								}}
								className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
							>
								Reset Filters
							</button>
						</div>
					) : (
						<StockTable
							stocks={visibleStocks}
							sortConfig={sortConfig}
							onSort={handleSort}
							hasMore={hasMore}
							onLoadMore={() => setVisibleCount((c) => c + 50)}
						/>
					)}

					{!isLoading && processedStocks.length > 0 && (
						<div className="flex items-center justify-center p-8 border-t border-stone-100 bg-stone-50/40">
							{hasMore ? (
								<button
									onClick={() => setVisibleCount((c) => c + 100)}
									className="flex items-center gap-2 px-8 py-3 bg-white border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-amber-600 hover:border-amber-300 transition-all active:scale-95 shadow-sm"
								>
									Load {Math.min(100, processedStocks.length - visibleCount)}{" "}
									more
									<ChevronRight className="w-3.5 h-3.5" />
								</button>
							) : (
								<p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300">
									— End of Registry —
								</p>
							)}
						</div>
					)}

					{!isLoading && processedStocks.length === 0 && (
						<div className="py-32 text-center space-y-5">
							<div className="w-16 h-16 bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-center mx-auto">
								<Search className="w-7 h-7 text-stone-300" />
							</div>
							<div>
								<p className="text-stone-700 font-black uppercase tracking-widest text-sm">
									No instruments found
								</p>
								<p className="text-stone-400 text-[11px] mt-1.5">
									Try adjusting your search or filters
								</p>
							</div>
							<button
								onClick={() => {
									setSearchQuery("");
									setPriceRange([0, 1000000]);
									setChangeRange([-100, 100]);
									setForeignFilter("all");
									setVolumeOnly(false);
								}}
								className="text-amber-600 font-black text-[10px] uppercase tracking-widest underline underline-offset-4 hover:text-amber-700 transition-colors"
							>
								Reset all filters
							</button>
						</div>
					)}
				</div>

				{/* ── Footer ── */}
				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
					{[
						{
							icon: Flame,
							accent: "amber",
							title: "Hot Volume",
							body: "Instruments in the top 10% of today's trading volume — signals high liquidity and market activity.",
						},
						{
							icon: ArrowRightLeft,
							accent: "sky",
							title: "Foreign Flow",
							body: "Net foreign buy/sell per instrument and session total. Expand rows for raw buy & sell breakdown.",
						},
						{
							icon: Activity,
							accent: "emerald",
							title: "Expandable Rows",
							body: "Tap any row to reveal Open, High, Low, First Trade, and full bid/offer volume data.",
						},
					].map(({ icon: Icon, accent, title, body }) => (
						<div
							key={title}
							className="p-5 bg-white border border-stone-200 rounded-xl shadow-sm flex items-start gap-4 hover:border-stone-300 transition-colors"
						>
							<div
								className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent === "amber" ? "bg-amber-100 text-amber-600" : accent === "sky" ? "bg-sky-100 text-sky-600" : "bg-emerald-100 text-emerald-600"}`}
							>
								<Icon className="w-4 h-4" />
							</div>
							<div>
								<p className="text-[10px] font-black uppercase tracking-widest text-stone-700 mb-1">
									{title}
								</p>
								<p className="text-[10px] font-medium text-stone-400 leading-relaxed">
									{body}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
