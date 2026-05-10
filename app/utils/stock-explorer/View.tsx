"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
	Search,
	ArrowUpDown,
	TrendingUp,
	TrendingDown,
	Minus,
	RefreshCw,
	Table as TableIcon,
	ArrowLeft,
	ArrowUp,
	ArrowDown,
	Filter,
	Volume2,
	Coins,
	X,
	Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── Types & Constants ─────────────────────────────────────────────────────

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

interface ProcessedStock extends IDXStock {
	ForeignNet: number;
	ChangePct: number;
	IsHighVolume: boolean;
}

type SortKey = keyof IDXStock | "ForeignNet" | "ChangePct";

interface SortConfig {
	key: SortKey;
	direction: "asc" | "desc" | null;
}

// ─── Formatting Utilities ──────────────────────────────────────────────────

const formatCompactNumber = (number: number) => {
	if (number === 0) return "0";
	return Intl.NumberFormat("en-US", {
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(number);
};

const formatCurrency = (number: number) => {
	return new Intl.NumberFormat("id-ID", {
		style: "decimal",
		minimumFractionDigits: 0,
	}).format(number);
};

// ─── Sub-Components ────────────────────────────────────────────────────────

function SortableHeader({
	label,
	sortKey,
	currentSort,
	onSort,
	align = "left",
}: {
	label: string;
	sortKey: SortKey;
	currentSort: SortConfig;
	onSort: (key: SortKey) => void;
	align?: "left" | "right" | "center";
}) {
	const isActive = currentSort.key === sortKey;
	const Icon =
		isActive && currentSort.direction
			? currentSort.direction === "asc"
				? ArrowUp
				: ArrowDown
			: ArrowUpDown;

	return (
		<th
			className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 sticky top-0 bg-slate-50 z-20 transition-colors ${
				align === "right"
					? "text-right"
					: align === "center"
						? "text-center"
						: "text-left"
			}`}
		>
			<button
				onClick={() => onSort(sortKey)}
				className={`inline-flex items-center gap-2 hover:text-indigo-600 transition-colors ${
					align === "right" ? "flex-row-reverse" : ""
				} ${isActive ? "text-indigo-600" : ""}`}
			>
				{label}
				<Icon
					className={`w-3 h-3 ${isActive ? "opacity-100" : "opacity-30"}`}
				/>
			</button>
		</th>
	);
}

function SearchHeader({
	searchQuery,
	setSearchQuery,
	totalCount,
	onRefresh,
	isLoading,
	priceRange,
	setPriceRange,
	changeRange,
	setChangeRange,
}: {
	searchQuery: string;
	setSearchQuery: (val: string) => void;
	totalCount: number;
	onRefresh: () => void;
	isLoading: boolean;
	priceRange: [number, number];
	setPriceRange: (val: [number, number]) => void;
	changeRange: [number, number];
	setChangeRange: (val: [number, number]) => void;
}) {
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	return (
		<div className="space-y-4 mb-8">
			<div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center gap-6">
				<div className="relative flex-1 w-full group">
					<Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
					<input
						type="text"
						placeholder="Search by Stock Code (e.g. BBCA) or Company Name..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all"
					/>
					{searchQuery && (
						<button
							onClick={() => setSearchQuery("")}
							className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-rose-500 transition-colors"
						>
							<X className="w-4 h-4" />
						</button>
					)}
				</div>

				<div className="flex items-center gap-3">
					<Link
						href="/utils/stock-explorer/admin"
						className="p-3.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-2xl hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
						title="Admin Portal"
					>
						<Settings className="w-4 h-4" />
					</Link>
					<button
						onClick={() => setIsFilterOpen(!isFilterOpen)}
						className={`p-3.5 border rounded-2xl transition-all active:scale-95 shadow-sm flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${
							isFilterOpen
								? "bg-indigo-600 border-indigo-600 text-white"
								: "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
						}`}
					>
						<Filter className="w-4 h-4" />
						Filters
					</button>
					<button
						onClick={onRefresh}
						disabled={isLoading}
						className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-95 shadow-sm disabled:opacity-50"
					>
						<RefreshCw
							className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
						/>
					</button>
					<div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-l border-slate-100 pl-6 hidden md:flex">
						<div className="flex flex-col gap-1">
							<span>Instruments</span>
							<span className="text-slate-900 text-lg leading-none tabular-nums">
								{totalCount}
							</span>
						</div>
					</div>
				</div>
			</div>

			<AnimatePresence>
				{isFilterOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="overflow-hidden"
					>
						<div className="p-8 bg-slate-900 text-white rounded-[2rem] shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8">
							<div className="space-y-4">
								<h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
									Price Range (IDR)
								</h3>
								<div className="flex items-center gap-4">
									<input
										type="number"
										value={priceRange[0]}
										onChange={(e) =>
											setPriceRange([Number(e.target.value), priceRange[1]])
										}
										className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
										placeholder="Min"
									/>
									<span className="text-slate-600">—</span>
									<input
										type="number"
										value={priceRange[1]}
										onChange={(e) =>
											setPriceRange([priceRange[0], Number(e.target.value)])
										}
										className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
										placeholder="Max"
									/>
								</div>
							</div>

							<div className="space-y-4">
								<h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
									Daily Change (%)
								</h3>
								<div className="flex items-center gap-4">
									<input
										type="number"
										value={changeRange[0]}
										onChange={(e) =>
											setChangeRange([Number(e.target.value), changeRange[1]])
										}
										className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
										placeholder="Min %"
									/>
									<span className="text-slate-600">—</span>
									<input
										type="number"
										value={changeRange[1]}
										onChange={(e) =>
											setChangeRange([changeRange[0], Number(e.target.value)])
										}
										className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

function StockRow({ stock }: { stock: ProcessedStock }) {
	return (
		<motion.tr
			layout
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="hover:bg-slate-50/50 transition-colors group"
		>
			<td className="px-6 py-5">
				<div className="flex items-center gap-4">
					<div className="w-16 h-10 bg-slate-900 text-white flex items-center justify-center rounded-xl shadow-lg shadow-slate-900/10 font-black text-xs tracking-tight">
						{stock.StockCode}
					</div>
					<div className="flex flex-col max-w-[200px] sm:max-w-[300px]">
						<span className="text-sm font-black text-slate-900 truncate">
							{stock.StockName}
						</span>
						<div className="flex gap-2 items-center mt-1">
							{stock.IsHighVolume && (
								<span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-amber-100">
									<Volume2 className="w-2.5 h-2.5" /> High Vol
								</span>
							)}
							{stock.Frequency > 20000 && (
								<span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-blue-100">
									Active
								</span>
							)}
						</div>
					</div>
				</div>
			</td>

			<td className="px-6 py-5">
				<div className="flex flex-col">
					<span className="text-sm font-black text-slate-900 tabular-nums font-mono">
						{formatCurrency(stock.Close)}
					</span>
					<span className="text-[10px] font-bold text-slate-400 tabular-nums">
						Prev: {formatCurrency(stock.Previous)}
					</span>
				</div>
			</td>

			<td className="px-6 py-5 text-right">
				<div
					className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tabular-nums ${
						stock.Change > 0
							? "bg-emerald-50 text-emerald-600"
							: stock.Change < 0
								? "bg-rose-50 text-rose-600"
								: "bg-slate-50 text-slate-400"
					}`}
				>
					{stock.Change > 0 ? (
						<TrendingUp className="w-3 h-3" />
					) : stock.Change < 0 ? (
						<TrendingDown className="w-3 h-3" />
					) : (
						<Minus className="w-3 h-3" />
					)}
					{Math.abs(stock.ChangePct).toFixed(2)}%
				</div>
			</td>

			<td className="px-6 py-5 text-right">
				<div className="flex flex-col items-end">
					<span className="text-xs font-black text-slate-700 tabular-nums font-mono">
						{formatCompactNumber(stock.Volume)}
					</span>
					<span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">
						Shares
					</span>
				</div>
			</td>

			<td className="px-6 py-5 text-right">
				<span className="text-xs font-black text-slate-700 tabular-nums font-mono">
					{formatCurrency(stock.Frequency)}
				</span>
			</td>

			<td className="px-6 py-5 text-right">
				<div className="flex flex-col items-end gap-1.5">
					<span
						className={`text-xs font-black tabular-nums font-mono ${
							stock.ForeignNet > 0
								? "text-emerald-600"
								: stock.ForeignNet < 0
									? "text-rose-600"
									: "text-slate-400"
						}`}
					>
						{stock.ForeignNet > 0 ? "+" : ""}
						{formatCompactNumber(stock.ForeignNet)}
					</span>
					{stock.ForeignNet !== 0 && (
						<span
							className={`text-[8px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-md ${
								stock.ForeignNet > 0
									? "bg-emerald-50 text-emerald-600"
									: "bg-rose-50 text-rose-600"
							}`}
						>
							{stock.ForeignNet > 0 ? "Net Buy" : "Net Sell"}
						</span>
					)}
				</div>
			</td>
		</motion.tr>
	);
}

function StockTable({
	stocks,
	isLoading,
	sortConfig,
	handleSort,
	visibleStocks,
}: {
	stocks: IDXStock[];
	isLoading: boolean;
	sortConfig: SortConfig;
	handleSort: (key: SortKey) => void;
	visibleStocks: ProcessedStock[];
}) {
	return (
		<div className="overflow-x-auto overflow-y-auto max-h-[800px] scrollbar-hide">
			<table className="w-full text-left border-collapse">
				<thead>
					<tr className="bg-slate-50/50">
						<SortableHeader
							label="Stock Instrument"
							sortKey="StockCode"
							currentSort={sortConfig}
							onSort={handleSort}
						/>
						<SortableHeader
							label="Last Price"
							sortKey="Close"
							currentSort={sortConfig}
							onSort={handleSort}
						/>
						<SortableHeader
							label="Change (%)"
							sortKey="ChangePct"
							currentSort={sortConfig}
							onSort={handleSort}
							align="right"
						/>
						<SortableHeader
							label="Volume"
							sortKey="Volume"
							currentSort={sortConfig}
							onSort={handleSort}
							align="right"
						/>
						<SortableHeader
							label="Frequency"
							sortKey="Frequency"
							currentSort={sortConfig}
							onSort={handleSort}
							align="right"
						/>
						<SortableHeader
							label="Foreign Flow"
							sortKey="ForeignNet"
							currentSort={sortConfig}
							onSort={handleSort}
							align="right"
						/>
					</tr>
				</thead>
				<tbody className="divide-y divide-slate-50">
					<AnimatePresence mode="popLayout">
						{visibleStocks.map((stock) => (
							<StockRow key={stock.StockCode} stock={stock} />
						))}
					</AnimatePresence>

					{/* Skeleton Loader */}
					{isLoading &&
						stocks.length === 0 &&
						[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
							<tr key={`skeleton-row-${id}`} className="animate-pulse">
								<td className="px-6 py-6">
									<div className="flex items-center gap-4">
										<div className="w-16 h-10 bg-slate-100 rounded-xl" />
										<div className="space-y-2">
											<div className="h-3 w-32 bg-slate-100 rounded" />
											<div className="h-2 w-20 bg-slate-50 rounded" />
										</div>
									</div>
								</td>
								<td className="px-6 py-6">
									<div className="h-4 w-16 bg-slate-100 rounded" />
								</td>
								<td className="px-6 py-6 text-right">
									<div className="h-6 w-20 bg-slate-100 rounded-full ml-auto" />
								</td>
								<td className="px-6 py-6 text-right">
									<div className="h-4 w-12 bg-slate-100 rounded ml-auto" />
								</td>
								<td className="px-6 py-6 text-right">
									<div className="h-4 w-12 bg-slate-100 rounded ml-auto" />
								</td>
								<td className="px-6 py-6 text-right">
									<div className="h-4 w-24 bg-slate-100 rounded ml-auto" />
								</td>
							</tr>
						))}
				</tbody>
			</table>
		</div>
	);
}

// ─── Main View ─────────────────────────────────────────────────────────────

export default function StockExplorerView() {
	// ── State ──────────────────────────────────────────────────────────────
	const [stocks, setStocks] = useState<IDXStock[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortConfig, setSortConfig] = useState<SortConfig>({
		key: "StockCode",
		direction: "asc",
	});
	const [visibleCount, setVisibleCount] = useState(50);

	// Range Filters
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
	const [changeRange, setChangeRange] = useState<[number, number]>([-100, 100]);

	// ── Data Fetching ──────────────────────────────────────────────────────
	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/utils/stock-data");

			// If 404 (Not found in Redis), just set to empty array instead of error
			if (response.status === 404) {
				setStocks([]);
				return;
			}

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Synchronization failure");
			}

			const result = await response.json();
			// API returns { data: [...] }
			const data = Array.isArray(result.data) ? result.data : [];

			setStocks(data);
		} catch (err: any) {
			console.error("Local registry fetch failed:", err);
			setError(err.message || "Failed to fetch from local registry");
		} finally {
			setIsLoading(false);
		}
	}, []);
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// ── Logic ──────────────────────────────────────────────────────────────
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

	/**
	 * High-Performance Data Processing
	 */
	const processedStocks = useMemo(() => {
		if (stocks.length === 0) return [];

		// 1. Initial Map & Calculation
		let result: ProcessedStock[] = stocks.map((stock) => ({
			...stock,
			ForeignNet: (stock.ForeignBuy || 0) - (stock.ForeignSell || 0),
			ChangePct:
				stock.Previous !== 0
					? ((stock.Close - stock.Previous) / stock.Previous) * 100
					: 0,
			IsHighVolume: false,
		}));

		// 2. Identify High Volume (Top 10%)
		const sortedVolumes = [...result]
			.map((s) => s.Volume)
			.sort((a, b) => b - a);
		const volumeThreshold = sortedVolumes[Math.floor(result.length * 0.1)] || 0;

		result = result.map((s) => ({
			...s,
			IsHighVolume: s.Volume >= volumeThreshold && s.Volume > 0,
		}));

		// 3. Filtering
		if (searchQuery) {
			const query = searchQuery.toLowerCase().trim();
			result = result.filter(
				(s) =>
					s.StockCode.toLowerCase().includes(query) ||
					s.StockName.toLowerCase().includes(query),
			);
		}

		// Range Filters
		result = result.filter(
			(s) =>
				s.Close >= priceRange[0] &&
				s.Close <= priceRange[1] &&
				s.ChangePct >= changeRange[0] &&
				s.ChangePct <= changeRange[1],
		);

		// 4. Sorting
		if (sortConfig.key && sortConfig.direction) {
			result.sort((a, b) => {
				const key = sortConfig.key as keyof ProcessedStock;
				const valA = a[key] ?? 0;
				const valB = b[key] ?? 0;

				if (typeof valA === "string" && typeof valB === "string") {
					return sortConfig.direction === "asc"
						? valA.localeCompare(valB)
						: valB.localeCompare(valA);
				}

				return sortConfig.direction === "asc"
					? (valA as number) - (valB as number)
					: (valB as number) - (valA as number);
			});
		}

		return result;
	}, [stocks, searchQuery, sortConfig, priceRange, changeRange]);

	const visibleStocks = useMemo(() => {
		return processedStocks.slice(0, visibleCount);
	}, [processedStocks, visibleCount]);

	const hasMore = visibleCount < processedStocks.length;

	// ── Render ─────────────────────────────────────────────────────────────

	return (
		<main className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 selection:bg-indigo-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 relative z-10">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
					<div className="space-y-6">
						<Link
							href="/utils"
							className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-600 transition-colors gap-2 group"
						>
							<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
							Utility Ecosystem
						</Link>
						<div className="flex items-center gap-5">
							<div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 active:scale-90 transition-transform">
								<TableIcon className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-400" />
							</div>
							<div>
								<h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 leading-none">
									Stock <span className="text-indigo-600">Explorer</span>
								</h1>
								<p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] mt-3">
									Real-time IDX Interactive Dashboard
								</p>
							</div>
						</div>
					</div>
				</div>

				<SearchHeader
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					totalCount={processedStocks.length}
					onRefresh={fetchData}
					isLoading={isLoading}
					priceRange={priceRange}
					setPriceRange={setPriceRange}
					changeRange={changeRange}
					setChangeRange={setChangeRange}
				/>

				{error && (
					<div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 text-rose-600">
						<X className="w-5 h-5" />
						<p className="text-xs font-bold uppercase tracking-widest">
							{error}
						</p>
						<button
							onClick={fetchData}
							className="ml-auto text-[10px] font-black underline underline-offset-4"
						>
							Retry Sync
						</button>
					</div>
				)}

				<div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
					<StockTable
						stocks={stocks}
						isLoading={isLoading}
						sortConfig={sortConfig}
						handleSort={handleSort}
						visibleStocks={visibleStocks}
					/>

					{/* Pagination / Footer */}
					{!isLoading && processedStocks.length > 0 && (
						<div className="p-10 flex flex-col items-center justify-center bg-slate-50/50 border-t border-slate-100 gap-6">
							{hasMore ? (
								<button
									onClick={() => setVisibleCount((prev) => prev + 100)}
									className="group flex items-center gap-3 px-10 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all active:scale-95 shadow-sm"
								>
									Analyze {processedStocks.length - visibleCount} more
									instruments
								</button>
							) : (
								<p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
									End of Transaction Registry
								</p>
							)}
						</div>
					)}

					{/* Empty State */}
					{!isLoading && processedStocks.length === 0 && (
						<div className="p-32 text-center space-y-6">
							<div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
								<Search className="w-8 h-8 text-slate-200" />
							</div>
							<div>
								<p className="text-slate-900 font-black uppercase tracking-widest text-sm">
									No Instruments Found
								</p>
								<p className="text-slate-400 text-xs mt-2">
									Try adjusting your search criteria or refresh the
									synchronization.
								</p>
							</div>
							<button
								onClick={() => {
									setSearchQuery("");
									setPriceRange([0, 1000000]);
									setChangeRange([-100, 100]);
								}}
								className="text-indigo-600 font-black text-[10px] uppercase tracking-widest underline underline-offset-8"
							>
								Reset All Filters
							</button>
						</div>
					)}
				</div>

				{/* Footer Info Cards */}
				<div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex items-start gap-4">
						<div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
							<Volume2 className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">
								Volume Analysis
							</h3>
							<p className="text-[10px] font-medium text-slate-500 leading-relaxed">
								Highlighting instruments in the top 10% of trading volume to
								identify market interest and liquidity centers.
							</p>
						</div>
					</div>

					<div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex items-start gap-4">
						<div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
							<Filter className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">
								Smart Filtering
							</h3>
							<p className="text-[10px] font-medium text-slate-500 leading-relaxed">
								Optimized search indexing for Stock Codes and Company Names with
								instant UI updates and multi-column sorting.
							</p>
						</div>
					</div>

					<div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex items-start gap-4">
						<div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
							<Coins className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">
								Foreign Flow
							</h3>
							<p className="text-[10px] font-medium text-slate-500 leading-relaxed">
								Tracking net foreign buy/sell transactions to measure global
								investor sentiment on local capital market assets.
							</p>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
