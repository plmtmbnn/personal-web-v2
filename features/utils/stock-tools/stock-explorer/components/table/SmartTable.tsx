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
} from "lucide-react";
import { fmtIDRNet, fmtIDRValue, fmtCompact } from "../../utils";
import { useScreener } from "../../context/ScreenerContext";
import ScreenerDropdown from "../shared/ScreenerDropdown";

interface SmartTableProps {
	stocks: ProcessedStock[];
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
		key: "CompositeScore",
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

	const filteredStocks = useMemo(() => {
		let list = stocks;

		if (filterTab === "watchlist") {
			list = list.filter((s) => watchlist.includes(s.StockCode));
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
		<div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col overflow-hidden">
			{/* Top Bar with Search & Filters */}
			<div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
						<TableIcon className="w-5 h-5" />
					</div>
					<div>
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="text-base font-extrabold text-slate-900 tracking-tight">
								Market Screener &amp; Alpha Terminal
							</h3>
							{minScore > 0 && (
								<span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
									<span>Score ≥ {minScore}</span>
									<button
										type="button"
										onClick={() => setMinScore(0)}
										className="hover:text-indigo-900 cursor-pointer"
										title="Remove score filter"
									>
										<X className="w-2.5 h-2.5" />
									</button>
								</span>
							)}
							{minTurnover > 0 && (
								<span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
									<span>Turnover ≥ Rp {fmtIDRValue(minTurnover)}</span>
									<button
										type="button"
										onClick={() => setMinTurnover(0)}
										className="hover:text-emerald-900 cursor-pointer"
										title="Remove turnover filter"
									>
										<X className="w-2.5 h-2.5" />
									</button>
								</span>
							)}
						</div>
						<p className="text-xs font-medium text-slate-500 mt-0.5">
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

				<div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
					{/* Live Search */}
					<div className="relative flex-1 sm:w-48">
						<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
						<input
							type="text"
							placeholder="Search ticker or name..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-8 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
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
					<div className="relative flex items-center border-b border-slate-200/60 pb-0.5">
						<button
							type="button"
							onClick={() => setFilterTab("all")}
							className={`relative px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
								filterTab === "all"
									? "text-slate-900 font-black"
									: "text-slate-500 hover:text-slate-800"
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
							onClick={() => setFilterTab("watchlist")}
							className={`relative px-3.5 py-1.5 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
								filterTab === "watchlist"
									? "text-slate-900 font-black"
									: "text-slate-500 hover:text-slate-800"
							}`}
						>
							<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
							<span>Watchlist</span>
							<span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-extrabold">
								{watchlist.length}
							</span>
							{filterTab === "watchlist" && (
								<motion.div
									layoutId="smartTableTabUnderline"
									className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-slate-900 rounded-full z-20"
									transition={{ type: "spring", stiffness: 380, damping: 30 }}
								/>
							)}
						</button>
					</div>

					{/* CSV Export Action Button */}
					<button
						type="button"
						onClick={exportToCsv}
						disabled={filteredStocks.length === 0}
						className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
						title="Export filtered records to CSV"
					>
						<Download className="w-3.5 h-3.5 text-slate-500" />
						<span className="hidden sm:inline">Export CSV</span>
					</button>
				</div>
			</div>

			{/* Table Content */}
			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse min-w-[980px]">
					<thead>
						<tr className="bg-slate-50/80 border-b border-slate-200/80">
							<th className="py-3 px-3 w-10 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
								Pin
							</th>
							<th
								className="py-3 px-4 cursor-pointer group select-none"
								onClick={() => requestSort("StockCode")}
							>
								<div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
									Ticker {getSortIcon("StockCode")}
								</div>
							</th>
							<th
								className="py-3 px-3 cursor-pointer group select-none text-right"
								onClick={() => requestSort("Close")}
							>
								<div className="flex items-center justify-end gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
									Price {getSortIcon("Close")}
								</div>
							</th>
							<th
								className="py-3 px-3 cursor-pointer group select-none text-right"
								onClick={() => requestSort("ChangePct")}
							>
								<div className="flex items-center justify-end gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
									Change {getSortIcon("ChangePct")}
								</div>
							</th>
							<th
								className="py-3 px-4 cursor-pointer group select-none text-right"
								onClick={() => requestSort("Value")}
							>
								<div className="flex items-center justify-end gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
									Turnover {getSortIcon("Value")}
								</div>
							</th>
							<th className="py-3 px-3 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
								Order Book
							</th>
							<th
								className="py-3 px-3 cursor-pointer group select-none text-right"
								onClick={() => requestSort("AvgValuePerTx")}
							>
								<div className="flex items-center justify-end gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
									Avg / Tx {getSortIcon("AvgValuePerTx")}
								</div>
							</th>
							<th
								className="py-3 px-4 cursor-pointer group select-none text-right"
								onClick={() => requestSort("ForeignNet")}
							>
								<div className="flex items-center justify-end gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
									Foreign Net {getSortIcon("ForeignNet")}
								</div>
							</th>
							<th className="py-3 px-3 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
								Opportunity
							</th>
							<th
								className="py-3 px-5 cursor-pointer group select-none text-right"
								onClick={() => requestSort("CompositeScore")}
							>
								<div className="flex items-center justify-end gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
									Score {getSortIcon("CompositeScore")}
								</div>
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{sortedStocks.length === 0 ? (
							<tr>
								<td colSpan={10} className="py-12 text-center text-slate-400">
									<p className="text-sm font-bold text-slate-700">
										No instruments match your active criteria
									</p>
									<p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
										{minScore > 0 || minTurnover > 0
											? "Try adjusting your minimum score or turnover liquidity thresholds to discover more trading instruments."
											: "Try adjusting your search query or reset sector filters."}
									</p>
									<button
										type="button"
										onClick={resetFilters}
										className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
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
										className="py-3 px-3 text-center"
										onClick={(e) => {
											e.stopPropagation();
											onToggleWatchlist(s.StockCode);
										}}
									>
										<button
											type="button"
											className="text-slate-300 hover:text-amber-500 transition-colors cursor-pointer p-1"
										>
											<Star
												className={`w-4 h-4 ${
													watchlist.includes(s.StockCode)
														? "fill-amber-400 text-amber-400"
														: "text-slate-300 hover:scale-110 transition-transform"
												}`}
											/>
										</button>
									</td>

									<td className="py-3 px-4">
										<div className="flex items-center gap-1.5 flex-wrap">
											<p className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
												{s.StockCode}
											</p>
											<span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
												{s.Sector}
											</span>
											{s.ARARisk === "ARA" && (
												<span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white px-1.5 py-0.2 rounded shadow-2xs">
													ARA
												</span>
											)}
											{s.ARARisk === "Near ARA" && (
												<span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">
													Near ARA
												</span>
											)}
											{s.ARARisk === "ARB" && (
												<span className="text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white px-1.5 py-0.2 rounded shadow-2xs">
													ARB
												</span>
											)}
											{s.ARARisk === "Near ARB" && (
												<span className="text-[9px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded">
													Near ARB
												</span>
											)}
										</div>
										<p className="text-[10px] font-medium text-slate-500 truncate max-w-[160px]">
											{s.StockName}
										</p>
									</td>

									<td className="py-3 px-3 text-right">
										<p className="text-xs font-black text-slate-900 tabular-nums">
											{s.Close.toLocaleString()}
										</p>
										<p className="text-[9px] font-medium text-slate-400 tabular-nums">
											{s.Low.toLocaleString()}-{s.High.toLocaleString()}
										</p>
									</td>

									<td className="py-3 px-3 text-right">
										<span
											className={`inline-block text-xs font-black tabular-nums ${
												s.ChangePct > 0
													? "text-emerald-600"
													: s.ChangePct < 0
														? "text-rose-600"
														: "text-slate-500"
											}`}
										>
											{s.ChangePct > 0 ? "+" : ""}
											{s.ChangePct.toFixed(2)}%
										</span>
									</td>

									<td className="py-3 px-4 text-right">
										<p className="text-xs font-black text-slate-900 tabular-nums">
											{fmtIDRValue(s.Value)}
										</p>
										<p className="text-[9px] font-medium text-slate-400 tabular-nums">
											{fmtCompact(s.Frequency)} tx
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
											<span className="text-[9px] font-bold text-slate-600 tabular-nums">
												Bid {s.BidOfferPressure}%
											</span>
										</div>
									</td>

									<td className="py-3 px-3 text-right">
										<span
											className={`inline-block text-[11px] tabular-nums px-2 py-0.5 rounded-md ${
												s.AvgValuePerTx >= 35000000
													? "text-indigo-700 bg-indigo-50 font-black border border-indigo-200/60"
													: "text-slate-700 bg-slate-100 font-bold"
											}`}
											title="Average trade nominal (Whale block ticket proxy)"
										>
											{fmtIDRValue(s.AvgValuePerTx)}
										</span>
									</td>

									<td className="py-3 px-4 text-right">
										<span
											className={`inline-block text-[11px] font-black tabular-nums px-2 py-0.5 rounded-md ${
												s.ForeignNet > 0
													? "text-emerald-700 bg-emerald-50"
													: s.ForeignNet < 0
														? "text-rose-700 bg-rose-50"
														: "text-slate-500 bg-slate-100"
											}`}
										>
											{fmtIDRNet(s.ForeignNet)}
										</span>
									</td>

									<td className="py-3 px-3 text-center">
										<span className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
											{s.Opportunity}
										</span>
									</td>

									<td className="py-3 px-5 text-right">
										<span
											className={`inline-flex items-center justify-center min-w-[32px] h-7 px-2 rounded-lg text-xs font-black tabular-nums ${
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
				<div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center px-6">
					<p className="text-xs font-bold text-slate-400">
						Showing {sortedStocks.length} of {filteredStocks.length} instruments
					</p>
					<div className="flex gap-2">
						<button
							onClick={() => setLimit((l) => l + 50)}
							className="px-4 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
						>
							Load 50 More
						</button>
						<button
							onClick={() => setLimit(filteredStocks.length)}
							className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl transition-all hover:bg-slate-800 active:scale-95 cursor-pointer shadow-xs"
						>
							Show All ({filteredStocks.length})
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
