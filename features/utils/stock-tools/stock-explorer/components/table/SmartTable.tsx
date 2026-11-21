"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import Papa from "papaparse";
import type { ProcessedStock, SortConfig, SortKey, Sector } from "../../types";
import {
	ArrowUp,
	ArrowDown,
	ArrowUpDown,
	Star,
	Search,
	Filter,
	Table as TableIcon,
	X,
	SlidersHorizontal,
	Coins,
	Download,
	BookmarkPlus,
	ArrowUpRight,
} from "lucide-react";
import { fmtIDRNet, fmtIDRValue, fmtCompact } from "../../utils";
import { useScreener } from "../../context/ScreenerContext";
import ScreenerDropdown from "../shared/ScreenerDropdown";

interface SmartTableProps {
	stocks: ProcessedStock[];
	embedded?: boolean;
	researchSort?: boolean;
	onSelectStock?: (stock: ProcessedStock) => void;
	watchlist?: string[];
	onToggleWatchlist?: (code: string) => void;
	minScore?: number;
	onMinScoreChange?: (score: number) => void;
	minTurnover?: number;
	onMinTurnoverChange?: (turnover: number) => void;
}

export default function SmartTable({
	stocks,
	embedded = false,
	researchSort,
	onSelectStock,
	watchlist: watchlistProp,
	onToggleWatchlist: onToggleWatchlistProp,
	minScore: minScoreProp,
	onMinScoreChange,
	minTurnover: minTurnoverProp,
	onMinTurnoverChange,
}: SmartTableProps) {
	const screener = useScreener();

	const handleSelect = onSelectStock || screener.setSelectedStock;
	const watchlist = watchlistProp ?? screener.watchlist;
	const onToggleWatchlist = onToggleWatchlistProp ?? screener.toggleWatchlist;

	const minScore = minScoreProp ?? screener.minScore;
	const setMinScore = onMinScoreChange ?? screener.setMinScore;

	const minTurnover = minTurnoverProp ?? screener.minTurnover;
	const setMinTurnover = onMinTurnoverChange ?? screener.setMinTurnover;

	const selectedSector = screener.selectedSector;
	const setSelectedSector = screener.setSelectedSector;

	const searchQuery = screener.searchQuery;
	const setSearchQuery = screener.setSearchQuery;

	const [sortConfig, setSortConfig] = useState<SortConfig>({
		key: researchSort ? "RelativeStrength" : "CompositeScore",
		direction: "desc",
	});
	const [limit, setLimit] = useState(50);
	const [filterTab, setFilterTab] = useState<"all" | "watchlist">("all");

	const availableSectors = useMemo(() => {
		const set = new Set<Sector>();
		for (const s of stocks) {
			if (s.Sector) set.add(s.Sector);
		}
		return Array.from(set).sort();
	}, [stocks]);

	const simulatedCodesSet = useMemo(() => {
		return new Set(
			screener.stockPicks
				.map((p) => (p.stockCode || "").toUpperCase())
				.filter(Boolean),
		);
	}, [screener.stockPicks]);

	const filteredStocks = useMemo(() => {
		let list = stocks;

		if (filterTab === "watchlist") {
			list = list.filter(
				(s) =>
					watchlist.includes(s.StockCode) ||
					simulatedCodesSet.has(s.StockCode.toUpperCase()),
			);
		}

		if (selectedSector !== "ALL") {
			list = list.filter((s) => s.Sector === selectedSector);
		}

		if (minScore > 0) {
			list = list.filter((s) => s.CompositeScore >= minScore);
		}

		if (minTurnover > 0) {
			list = list.filter((s) => s.Value >= minTurnover);
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter(
				(s) =>
					s.StockCode.toLowerCase().includes(q) ||
					s.StockName.toLowerCase().includes(q),
			);
		}

		return list;
	}, [
		stocks,
		filterTab,
		watchlist,
		selectedSector,
		minScore,
		minTurnover,
		searchQuery,
	]);

	const sortedStocks = useMemo(() => {
		const sorted = [...filteredStocks].sort((a, b) => {
			const aVal = a[sortConfig.key];
			const bVal = b[sortConfig.key];
			if (aVal === null || aVal === undefined) return 1;
			if (bVal === null || bVal === undefined) return -1;
			if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
			if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
			return 0;
		});
		return sorted.slice(0, limit);
	}, [filteredStocks, sortConfig, limit]);

	const requestSort = (key: SortKey) => {
		let direction: "asc" | "desc" = "desc";
		if (sortConfig.key === key && sortConfig.direction === "desc") {
			direction = "asc";
		}
		setSortConfig({ key, direction });
	};

	const getSortIcon = (col: SortKey) => {
		if (sortConfig.key !== col) {
			return (
				<ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
			);
		}
		return sortConfig.direction === "asc" ? (
			<ArrowUp className="w-3 h-3 text-indigo-600" />
		) : (
			<ArrowDown className="w-3 h-3 text-indigo-600" />
		);
	};

	const resetFilters = useCallback(() => {
		screener.resetFilters();
		setFilterTab("all");
	}, [screener]);

	// PapaParse CSV Export with microstructure fields
	const exportToCsv = useCallback(() => {
		const exportRows = filteredStocks.map((s) => ({
			Ticker: s.StockCode,
			Name: s.StockName,
			Sector: s.Sector,
			Price: s.Close,
			ChangePct: Number(s.ChangePct.toFixed(2)),
			TurnoverIDR: s.Value,
			Frequency: s.Frequency,
			BidOfferPressurePct: s.BidOfferPressure,
			AvgValuePerTxIDR: s.AvgValuePerTx,
			ForeignNetIDR: s.ForeignNet,
			NegoRatioPct: s.NegoRatio,
			AutoRejection: s.ARARisk,
			ARALimitPrice: s.ARALimitPrice,
			ARBLimitPrice: s.ARBLimitPrice,
			MarketCapIDR: s.MarketCap,
			CompositeScore: s.CompositeScore,
			...(researchSort
				? { RelativeStrength63SessionsPp: s.RelativeStrength ?? null }
				: {}),
			Opportunity: s.Opportunity,
			Trend: s.Trend,
		}));

		const csv = Papa.unparse(exportRows);
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`idx_screener_${new Date().toISOString().split("T")[0]}.csv`,
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}, [filteredStocks]);

	return (
		<div
			className={
				embedded
					? "flex flex-col"
					: "bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col"
			}
		>
			{/* Top Bar with Search & Filters */}
			<div
				className={`p-5 sm:p-7 border-b border-slate-100 bg-slate-50/40 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${
					embedded ? "" : "rounded-t-3xl"
				}`}
			>
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
						<TableIcon className="w-5 h-5" />
					</div>
					<div>
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="text-base font-bold text-slate-900 tracking-tight">
								Market Screener &amp; Alpha Terminal
							</h3>
							{minScore > 0 && (
								<span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-lg">
									<span>Score ≥ {minScore}</span>
									<button
										type="button"
										onClick={() => setMinScore(0)}
										className="p-0.5 hover:text-indigo-950 cursor-pointer"
										aria-label="Remove score filter"
										title="Remove score filter"
									>
										<X className="w-3 h-3" />
									</button>
								</span>
							)}
							{minTurnover > 0 && (
								<span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-lg">
									<span>Turnover ≥ Rp {fmtIDRValue(minTurnover)}</span>
									<button
										type="button"
										onClick={() => setMinTurnover(0)}
										className="p-0.5 hover:text-emerald-950 cursor-pointer"
										aria-label="Remove turnover filter"
										title="Remove turnover filter"
									>
										<X className="w-3 h-3" />
									</button>
								</span>
							)}
						</div>
						<p className="text-xs font-medium text-slate-600 mt-0.5 tabular-nums">
							Showing {sortedStocks.length} of {filteredStocks.length} filtered
							instruments{" "}
							{minScore > 0 || minTurnover > 0
								? `(Filtered: ${[
										minScore > 0 ? `Score ≥ ${minScore}` : "",
										minTurnover > 0
											? `Turnover ≥ ${fmtIDRValue(minTurnover)}`
											: "",
									]
										.filter(Boolean)
										.join(", ")})`
								: ""}{" "}
							({stocks.length} total)
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
					{/* Live Search */}
					<div className="relative flex-1 min-w-[180px] sm:w-48">
						<Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
						<input
							type="text"
							aria-label="Search ticker or company name"
							placeholder="Search ticker or name..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full min-h-11 bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-2xs"
						/>
						{searchQuery && (
							<button
								type="button"
								aria-label="Clear search"
								onClick={() => setSearchQuery("")}
								className="min-h-11 min-w-11 flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 cursor-pointer"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						)}
					</div>

					{/* Custom Score Filter Dropdown */}
					<ScreenerDropdown
						icon={SlidersHorizontal}
						value={minScore}
						onChange={(val) => setMinScore(Number(val))}
						options={[
							{ value: 0, label: "Score: All" },
							{ value: 50, label: "Score ≥ 50" },
							{ value: 65, label: "Score ≥ 65" },
							{ value: 75, label: "Score ≥ 75" },
							{ value: 80, label: "Score ≥ 80" },
						]}
						placeholder="Score Filter"
					/>

					{/* Custom Liquidity Filter Dropdown */}
					<ScreenerDropdown
						icon={Coins}
						value={minTurnover}
						onChange={(val) => setMinTurnover(Number(val))}
						options={[
							{ value: 0, label: "Liquidity: All" },
							{ value: 1000000000, label: "Turnover ≥ 1B" },
							{ value: 5000000000, label: "Turnover ≥ 5B" },
							{ value: 20000000000, label: "Turnover ≥ 20B" },
							{ value: 50000000000, label: "Turnover ≥ 50B" },
						]}
						placeholder="Liquidity Filter"
					/>

					{/* Custom Sector Filter Dropdown */}
					<ScreenerDropdown
						icon={Filter}
						value={selectedSector}
						onChange={(val) => setSelectedSector(val as Sector | "ALL")}
						options={[
							{ value: "ALL", label: "All Sectors" },
							...availableSectors.map((sec) => ({ value: sec, label: sec })),
						]}
						placeholder="All Sectors"
					/>

					{/* Minimalist Frameless Milestone Standard: All / Watchlist Tabs */}
					<div
						role="tablist"
						aria-label="Screener universe filter"
						className="relative flex items-center border-b border-slate-200/60"
					>
						<button
							type="button"
							role="tab"
							aria-selected={filterTab === "all"}
							onClick={() => setFilterTab("all")}
							className={`relative min-h-11 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
								filterTab === "all"
									? "text-slate-900"
									: "text-slate-600 hover:text-slate-900"
							}`}
						>
							<span>All Stocks</span>
							{filterTab === "all" && (
								<motion.div
									layoutId="smartTableTabUnderline"
									className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-slate-900 rounded-full z-20"
									transition={{ type: "spring", stiffness: 380, damping: 30 }}
								/>
							)}
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={filterTab === "watchlist"}
							onClick={() => setFilterTab("watchlist")}
							className={`relative min-h-11 px-3.5 py-2 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
								filterTab === "watchlist"
									? "text-slate-900"
									: "text-slate-600 hover:text-slate-900"
							}`}
						>
							<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
							<span>Watchlist</span>
							<span className="text-xs bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md font-bold tabular-nums">
								{
									Array.from(
										new Set([...watchlist, ...Array.from(simulatedCodesSet)]),
									).length
								}
							</span>
							{filterTab === "watchlist" && (
								<motion.div
									layoutId="smartTableTabUnderline"
									className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-slate-900 rounded-full z-20"
									transition={{ type: "spring", stiffness: 380, damping: 30 }}
								/>
							)}
						</button>
						{filterTab === "watchlist" && (
							<button
								type="button"
								onClick={() => screener.setWorkstationTab("simulator")}
								className="ml-2 min-h-11 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
								title="Open Stockpick Simulator Workstation"
							>
								<span>Simulator</span>
								<ArrowUpRight className="w-3.5 h-3.5" />
							</button>
						)}
					</div>

					{/* CSV Export Action Button */}
					<button
						type="button"
						onClick={exportToCsv}
						disabled={filteredStocks.length === 0}
						className="inline-flex min-h-11 items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-colors shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
						title="Export filtered records to CSV"
					>
						<Download className="w-4 h-4 text-slate-600" />
						<span className="hidden sm:inline">Export CSV</span>
					</button>
				</div>
			</div>

			{/* Mobile & Tablet Card Ledger (< lg) */}
			<div className="lg:hidden divide-y divide-slate-100">
				{sortedStocks.length === 0 ? (
					<div className="p-8 text-center">
						<p className="text-sm font-bold text-slate-800">
							No instruments match your active criteria
						</p>
						<p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
							{minScore > 0 || minTurnover > 0
								? "Try adjusting your minimum score or turnover liquidity thresholds to discover more trading instruments."
								: "Try adjusting your search query or reset sector filters."}
						</p>
						<button
							type="button"
							onClick={resetFilters}
							className="mt-4 inline-flex min-h-11 items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
						>
							Reset All Filters
						</button>
					</div>
				) : (
					sortedStocks.map((s) => {
						const isWatched = watchlist.includes(s.StockCode);
						const isSimulated = simulatedCodesSet.has(
							s.StockCode.toUpperCase(),
						);
						return (
							<div key={s.StockCode} className="p-4 sm:p-5 space-y-3">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<div className="flex items-center gap-1.5 flex-wrap">
											<button
												type="button"
												onClick={() => handleSelect(s)}
												className="text-sm font-bold text-slate-900 hover:text-indigo-700 transition-colors cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-indigo-600"
											>
												{s.StockCode}
											</button>
											<span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
												{s.Sector}
											</span>
											{s.ARARisk === "ARA" && (
												<span className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-lg">
													ARA
												</span>
											)}
											{s.ARARisk === "Near ARA" && (
												<span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg">
													Near ARA
												</span>
											)}
											{s.ARARisk === "ARB" && (
												<span className="text-xs font-bold bg-rose-600 text-white px-2 py-0.5 rounded-lg">
													ARB
												</span>
											)}
											{s.ARARisk === "Near ARB" && (
												<span className="text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-lg">
													Near ARB
												</span>
											)}
										</div>
										<p className="text-xs font-medium text-slate-600 truncate mt-0.5">
											{s.StockName}
										</p>
									</div>

									<span
										className={`inline-flex items-center justify-center min-w-[36px] h-7 px-2 rounded-lg text-xs font-bold tabular-nums shrink-0 ${
											s.CompositeScore >= 80
												? "bg-indigo-600 text-white shadow-xs"
												: s.CompositeScore >= 60
													? "bg-emerald-600 text-white"
													: s.CompositeScore >= 40
														? "bg-slate-200 text-slate-800"
														: "bg-rose-100 text-rose-800"
										}`}
									>
										{s.CompositeScore}
									</span>
								</div>

								<div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50/70 border border-slate-200/70 text-xs">
									<div>
										<span className="text-slate-600 font-medium block">
											Price / VWAP
										</span>
										<span className="font-bold text-slate-900 tabular-nums">
											{s.Close.toLocaleString("id-ID")}
										</span>{" "}
										<span className="text-slate-600 tabular-nums">
											({(s.VWAP || s.Close).toLocaleString("id-ID")})
										</span>
									</div>
									<div className="text-right">
										<span className="text-slate-600 font-medium block">
											Change / Setup
										</span>
										<span
											className={`font-bold tabular-nums ${
												s.ChangePct > 0
													? "text-emerald-700"
													: s.ChangePct < 0
														? "text-rose-700"
														: "text-slate-600"
											}`}
										>
											{s.ChangePct > 0 ? "+" : ""}
											{s.ChangePct.toFixed(2)}%
										</span>{" "}
										<span className="text-slate-700 font-semibold">
											({s.Opportunity})
										</span>
									</div>
									<div>
										<span className="text-slate-600 font-medium block">
											Turnover
										</span>
										<span className="font-bold text-slate-900 tabular-nums">
											{fmtIDRValue(s.Value)}
										</span>{" "}
										<span className="text-slate-600 tabular-nums">
											({fmtCompact(s.Frequency)} tx)
										</span>
									</div>
									<div className="text-right">
										<span className="text-slate-600 font-medium block">
											Foreign Net
										</span>
										<span
											className={`font-bold tabular-nums ${
												s.ForeignNet > 0
													? "text-emerald-700"
													: s.ForeignNet < 0
														? "text-rose-700"
														: "text-slate-600"
											}`}
										>
											{fmtIDRNet(s.ForeignNet)}
										</span>
									</div>
								</div>

								<div className="flex flex-wrap items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() => onToggleWatchlist(s.StockCode)}
											className={`inline-flex min-h-11 items-center gap-1.5 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
												isWatched
													? "bg-amber-50 border-amber-200 text-amber-900"
													: "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50"
											}`}
										>
											<Star
												className={`w-3.5 h-3.5 ${
													isWatched
														? "fill-amber-400 text-amber-500"
														: "text-slate-500"
												}`}
											/>
											<span>{isWatched ? "Pinned" : "Watch"}</span>
										</button>
										<button
											type="button"
											onClick={() => screener.openAddPickModal(s)}
											className={`inline-flex min-h-11 items-center gap-1.5 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
												isSimulated
													? "bg-emerald-50 border-emerald-200 text-emerald-800"
													: "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50"
											}`}
										>
											<BookmarkPlus className="w-3.5 h-3.5" />
											<span>{isSimulated ? "Tracked" : "Simulate"}</span>
										</button>
									</div>

									<button
										type="button"
										onClick={() => handleSelect(s)}
										className="inline-flex min-h-11 items-center gap-1 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
									>
										<span>Inspect</span>
										<ArrowUpRight className="w-3.5 h-3.5" />
									</button>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Desktop Table Content (lg+) */}
			<div className="hidden lg:block overflow-x-auto">
				<table className="w-full text-left border-collapse min-w-[980px]">
					<thead>
						<tr className="bg-slate-50/80 border-b border-slate-200/80">
							<th className="py-2.5 px-3 w-20 text-center text-xs font-bold text-slate-600">
								Pin
							</th>
							<th className="py-2 px-4">
								<button
									type="button"
									onClick={() => requestSort("StockCode")}
									className="min-h-11 inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 cursor-pointer group"
								>
									<span>Ticker</span>
									{getSortIcon("StockCode")}
								</button>
							</th>
							<th className="py-2 px-3 text-right">
								<button
									type="button"
									onClick={() => requestSort("Close")}
									className="min-h-11 inline-flex items-center justify-end gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 cursor-pointer group"
								>
									<span>Price</span>
									{getSortIcon("Close")}
								</button>
							</th>
							<th className="py-2 px-3 text-right">
								<button
									type="button"
									onClick={() => requestSort("ChangePct")}
									className="min-h-11 inline-flex items-center justify-end gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 cursor-pointer group"
								>
									<span>Change</span>
									{getSortIcon("ChangePct")}
								</button>
							</th>
							<th className="py-2 px-4 text-right">
								<button
									type="button"
									onClick={() => requestSort("Value")}
									className="min-h-11 inline-flex items-center justify-end gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 cursor-pointer group"
								>
									<span>Turnover</span>
									{getSortIcon("Value")}
								</button>
							</th>
							<th className="py-2.5 px-3 text-center text-xs font-bold text-slate-700">
								Order Book
							</th>
							<th className="py-2 px-3 text-right">
								<button
									type="button"
									onClick={() => requestSort("AvgValuePerTx")}
									className="min-h-11 inline-flex items-center justify-end gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 cursor-pointer group"
								>
									<span>Avg / Tx</span>
									{getSortIcon("AvgValuePerTx")}
								</button>
							</th>
							<th className="py-2 px-4 text-right">
								<button
									type="button"
									onClick={() => requestSort("ForeignNet")}
									className="min-h-11 inline-flex items-center justify-end gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 cursor-pointer group"
								>
									<span>Foreign Net</span>
									{getSortIcon("ForeignNet")}
								</button>
							</th>
							{researchSort && (
								<th
									scope="col"
									className="py-2 px-3 text-right text-xs font-bold text-slate-700"
								>
									<button
										type="button"
										onClick={() => requestSort("RelativeStrength")}
										className="inline-flex min-h-11 items-center gap-2 focus-visible:outline-2 focus-visible:outline-indigo-600 cursor-pointer"
									>
										Vs IHSG (63 sessions) {getSortIcon("RelativeStrength")}
									</button>
								</th>
							)}
							<th className="py-2.5 px-3 text-center text-xs font-bold text-slate-700">
								Opportunity
							</th>
							<th className="py-2 px-5 text-right">
								<button
									type="button"
									onClick={() => requestSort("CompositeScore")}
									className="min-h-11 inline-flex items-center justify-end gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 cursor-pointer group"
								>
									<span>Score</span>
									{getSortIcon("CompositeScore")}
								</button>
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{sortedStocks.length === 0 ? (
							<tr>
								<td
									colSpan={researchSort ? 11 : 10}
									className="py-12 text-center text-slate-600"
								>
									<p className="text-sm font-bold text-slate-800">
										No instruments match your active criteria
									</p>
									<p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
										{minScore > 0 || minTurnover > 0
											? "Try adjusting your minimum score or turnover liquidity thresholds to discover more trading instruments."
											: "Try adjusting your search query or reset sector filters."}
									</p>
									<button
										type="button"
										onClick={resetFilters}
										className="mt-4 inline-flex min-h-11 items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
									>
										Reset All Filters
									</button>
								</td>
							</tr>
						) : (
							sortedStocks.map((s) => (
								<tr
									key={s.StockCode}
									onClick={() => handleSelect(s)}
									className="group hover:bg-indigo-50/40 transition-colors cursor-pointer"
								>
									<td
										className="py-2 px-2 text-center"
										onClick={(e) => e.stopPropagation()}
									>
										<div className="flex items-center justify-center">
											<button
												type="button"
												onClick={() => onToggleWatchlist(s.StockCode)}
												aria-label={
													watchlist.includes(s.StockCode)
														? `Remove ${s.StockCode} from watchlist`
														: `Add ${s.StockCode} to watchlist`
												}
												className="min-h-11 min-w-11 inline-flex items-center justify-center text-slate-400 hover:text-amber-500 transition-colors cursor-pointer rounded-xl"
												title={
													watchlist.includes(s.StockCode)
														? "Remove from watchlist"
														: "Add to watchlist"
												}
											>
												<Star
													className={`w-4 h-4 ${
														watchlist.includes(s.StockCode)
															? "fill-amber-400 text-amber-500"
															: "text-slate-400 hover:scale-110 transition-transform"
													}`}
												/>
											</button>
											<button
												type="button"
												onClick={() => screener.openAddPickModal(s)}
												aria-label={`Simulate entry for ${s.StockCode}`}
												className={`min-h-11 min-w-11 inline-flex items-center justify-center transition-colors cursor-pointer rounded-xl ${
													simulatedCodesSet.has(s.StockCode.toUpperCase())
														? "text-emerald-700 hover:text-emerald-800"
														: "text-slate-400 hover:text-indigo-600"
												}`}
												title={
													simulatedCodesSet.has(s.StockCode.toUpperCase())
														? "Tracked in Stockpick Simulator (Click to add another entry)"
														: "Simulate pick entry price"
												}
											>
												<BookmarkPlus className="w-4 h-4" />
											</button>
										</div>
									</td>

									<td className="py-3 px-4">
										<div className="flex items-center gap-1.5 flex-wrap">
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													handleSelect(s);
												}}
												className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-indigo-600"
											>
												{s.StockCode}
											</button>
											<span className="text-xs font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
												{s.Sector}
											</span>
											{s.ARARisk === "ARA" && (
												<span className="text-xs font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded-md shadow-2xs">
													ARA
												</span>
											)}
											{s.ARARisk === "Near ARA" && (
												<span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md">
													Near ARA
												</span>
											)}
											{s.ARARisk === "ARB" && (
												<span className="text-xs font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded-md shadow-2xs">
													ARB
												</span>
											)}
											{s.ARARisk === "Near ARB" && (
												<span className="text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded-md">
													Near ARB
												</span>
											)}
										</div>
										<p className="text-xs font-medium text-slate-600 truncate max-w-[180px]">
											{s.StockName}
										</p>
									</td>

									<td className="py-3 px-3 text-right">
										<p className="text-xs font-bold text-slate-900 tabular-nums">
											{s.Close.toLocaleString("id-ID")}
										</p>
										<p
											className="text-xs font-medium text-slate-600 tabular-nums"
											title={`Range: ${s.Low.toLocaleString("id-ID")}-${s.High.toLocaleString("id-ID")} | VWAP: ${(s.VWAP || s.Close).toLocaleString("id-ID")}`}
										>
											VWAP {(s.VWAP || s.Close).toLocaleString("id-ID")}
										</p>
									</td>

									<td className="py-3 px-3 text-right">
										<span
											className={`inline-block text-xs font-bold tabular-nums ${
												s.ChangePct > 0
													? "text-emerald-700"
													: s.ChangePct < 0
														? "text-rose-700"
														: "text-slate-600"
											}`}
										>
											{s.ChangePct > 0 ? "+" : ""}
											{s.ChangePct.toFixed(2)}%
										</span>
									</td>

									<td className="py-3 px-4 text-right">
										<p className="text-xs font-bold text-slate-900 tabular-nums">
											{fmtIDRValue(s.Value)}
										</p>
										<p className="text-xs font-medium text-slate-600 tabular-nums">
											{fmtCompact(s.Frequency)} tx
											{s.RVOL !== undefined && s.RVOL >= 1.3 ? (
												<span className="ml-1 font-bold text-indigo-700">
													({s.RVOL.toFixed(1)}x)
												</span>
											) : null}
										</p>
									</td>

									<td className="py-3 px-3 text-center">
										<div className="inline-flex flex-col items-center gap-1">
											<div
												className="w-14 h-1.5 bg-rose-200 rounded-full overflow-hidden flex"
												title={`Bid: ${s.BidOfferPressure}% | Offer: ${100 - s.BidOfferPressure}%`}
											>
												<div
													style={{ width: `${s.BidOfferPressure}%` }}
													className="bg-emerald-500 h-full transition-all"
												/>
												<div
													style={{ width: `${100 - s.BidOfferPressure}%` }}
													className="bg-rose-500 h-full transition-all"
												/>
											</div>
											<span className="text-xs font-semibold text-slate-700 tabular-nums">
												Bid {s.BidOfferPressure}%
											</span>
										</div>
									</td>

									<td className="py-3 px-3 text-right">
										<span
											className={`inline-block text-xs tabular-nums px-2 py-0.5 rounded-lg ${
												s.AvgValuePerTx >= 35000000
													? "text-indigo-800 bg-indigo-50 font-bold border border-indigo-200/60"
													: "text-slate-700 bg-slate-100 font-semibold"
											}`}
											title="Average trade nominal (Whale block ticket proxy)"
										>
											{fmtIDRValue(s.AvgValuePerTx)}
										</span>
									</td>

									<td className="py-3 px-4 text-right">
										<div className="inline-flex flex-col items-end gap-0.5">
											<span
												className={`inline-block text-xs font-bold tabular-nums px-2 py-0.5 rounded-lg ${
													s.ForeignNet > 0
														? "text-emerald-800 bg-emerald-50"
														: s.ForeignNet < 0
															? "text-rose-800 bg-rose-50"
															: "text-slate-600 bg-slate-100"
												}`}
											>
												{fmtIDRNet(s.ForeignNet)}
											</span>
											{s.ForeignStreakDays !== undefined &&
												Math.abs(s.ForeignStreakDays) >= 2 && (
													<span
														className={`text-xs font-bold font-mono ${
															s.ForeignStreakDays > 0
																? "text-emerald-700"
																: "text-rose-700"
														}`}
													>
														{s.ForeignStreakDays > 0
															? `${s.ForeignStreakDays}D Inflow`
															: `${Math.abs(s.ForeignStreakDays)}D Outflow`}
													</span>
												)}
										</div>
									</td>

									{researchSort && (
										<td className="py-3 px-3 text-right text-xs font-medium tabular-nums text-slate-800">
											{s.RelativeStrength == null
												? "Unavailable"
												: `${s.RelativeStrength.toFixed(2)} pp`}
										</td>
									)}
									<td className="py-3 px-3 text-center">
										<span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">
											{s.Opportunity}
										</span>
									</td>

									<td className="py-3 px-5 text-right">
										<span
											className={`inline-flex items-center justify-center min-w-[36px] h-7 px-2 rounded-lg text-xs font-bold tabular-nums ${
												s.CompositeScore >= 80
													? "bg-indigo-600 text-white shadow-xs"
													: s.CompositeScore >= 60
														? "bg-emerald-600 text-white"
														: s.CompositeScore >= 40
															? "bg-slate-200 text-slate-800"
															: "bg-rose-100 text-rose-800"
											}`}
										>
											{s.CompositeScore}
										</span>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Load More Footer */}
			{limit < filteredStocks.length && (
				<div
					className={`p-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-3 px-5 sm:px-6 ${
						embedded ? "rounded-b-3xl" : "rounded-b-3xl"
					}`}
				>
					<p className="text-xs font-semibold text-slate-600 tabular-nums">
						Showing {sortedStocks.length} of {filteredStocks.length} instruments
					</p>
					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={() => setLimit((l) => l + 50)}
							className="min-h-11 px-4 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-indigo-700 hover:border-indigo-200 rounded-xl transition-colors shadow-2xs active:scale-95 cursor-pointer"
						>
							Load 50 More
						</button>
						<button
							type="button"
							onClick={() => setLimit(filteredStocks.length)}
							className="min-h-11 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors hover:bg-slate-800 active:scale-95 cursor-pointer shadow-xs"
						>
							Show All ({filteredStocks.length})
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
