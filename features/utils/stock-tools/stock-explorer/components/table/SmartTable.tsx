"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";

interface SmartTableProps {
	stocks: ProcessedStock[];
	onSelectStock?: (stock: ProcessedStock) => void;
	watchlist: string[];
	onToggleWatchlist: (code: string) => void;
	minScore?: number;
	onMinScoreChange?: (score: number) => void;
}

export default function SmartTable({
	stocks,
	onSelectStock,
	watchlist,
	onToggleWatchlist,
	minScore = 0,
	onMinScoreChange,
}: SmartTableProps) {
	const [sortConfig, setSortConfig] = useState<SortConfig>({
		key: "CompositeScore",
		direction: "desc",
	});
	const [limit, setLimit] = useState(50);
	const [filterTab, setFilterTab] = useState<"all" | "watchlist">("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSector, setSelectedSector] = useState<Sector | "ALL">("ALL");

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

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter(
				(s) =>
					s.StockCode.toLowerCase().includes(q) ||
					s.StockName.toLowerCase().includes(q),
			);
		}

		return list;
	}, [stocks, filterTab, watchlist, selectedSector, minScore, searchQuery]);

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

	const formatBillions = (val: number) => {
		if (val === 0) return "0";
		const isNeg = val < 0;
		return `${isNeg ? "-" : "+"}${(Math.abs(val) / 1e9).toFixed(1)}B`;
	};

	const formatVolume = (val: number) => {
		if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
		if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
		return val.toLocaleString();
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

	const resetFilters = () => {
		setSearchQuery("");
		setSelectedSector("ALL");
		setFilterTab("all");
		onMinScoreChange?.(0);
	};

	return (
		<div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col overflow-hidden">
			{/* Top Bar with Search & Filters */}
			<div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
						<TableIcon className="w-5 h-5" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h3 className="text-base font-extrabold text-slate-900 tracking-tight">
								Market Screener &amp; Alpha Terminal
							</h3>
							{minScore > 0 && (
								<span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
									<span>Score ≥ {minScore}</span>
									<button
										onClick={() => onMinScoreChange?.(0)}
										className="hover:text-indigo-900 cursor-pointer"
										title="Remove score filter"
									>
										<X className="w-2.5 h-2.5" />
									</button>
								</span>
							)}
						</div>
						<p className="text-xs font-medium text-slate-500 mt-0.5">
							Showing {sortedStocks.length} of {filteredStocks.length} filtered
							instruments {minScore > 0 ? `(Score ≥ ${minScore})` : ""} (
							{stocks.length} total)
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
					{/* Live Search */}
					<div className="relative flex-1 sm:w-56">
						<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
						<input
							type="text"
							placeholder="Search ticker or name..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-8 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						)}
					</div>

					{/* Min Score Filter Dropdown */}
					<div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2">
						<SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
						<select
							value={minScore}
							onChange={(e) => onMinScoreChange?.(Number(e.target.value))}
							className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
						>
							<option value={0}>Score: All</option>
							<option value={50}>Score ≥ 50</option>
							<option value={65}>Score ≥ 65</option>
							<option value={75}>Score ≥ 75</option>
							<option value={80}>Score ≥ 80</option>
						</select>
					</div>

					{/* Sector Filter */}
					<div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2">
						<Filter className="w-3.5 h-3.5 text-slate-400" />
						<select
							value={selectedSector}
							onChange={(e) =>
								setSelectedSector(e.target.value as Sector | "ALL")
							}
							className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
						>
							<option value="ALL">All Sectors</option>
							{availableSectors.map((sec) => (
								<option key={sec} value={sec}>
									{sec}
								</option>
							))}
						</select>
					</div>

					{/* All / Watchlist Tabs */}
					<div className="flex bg-slate-200/70 p-1 rounded-xl">
						<button
							onClick={() => setFilterTab("all")}
							className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
								filterTab === "all"
									? "bg-white text-slate-900 shadow-xs"
									: "text-slate-600 hover:text-slate-900"
							}`}
						>
							All Stocks
						</button>
						<button
							onClick={() => setFilterTab("watchlist")}
							className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
								filterTab === "watchlist"
									? "bg-white text-slate-900 shadow-xs"
									: "text-slate-600 hover:text-slate-900"
							}`}
						>
							<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
							<span>Watchlist</span>
							<span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-extrabold">
								{watchlist.length}
							</span>
						</button>
					</div>
				</div>
			</div>

			{/* Table Content */}
			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse min-w-[850px]">
					<thead>
						<tr className="bg-slate-50/80 border-b border-slate-200/80">
							<th className="py-3 px-4 w-12 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
								Pin
							</th>
							<th
								className="py-3 px-5 cursor-pointer group select-none"
								onClick={() => requestSort("StockCode")}
							>
								<div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
									Ticker {getSortIcon("StockCode")}
								</div>
							</th>
							<th
								className="py-3 px-4 cursor-pointer group select-none text-right"
								onClick={() => requestSort("Close")}
							>
								<div className="flex items-center justify-end gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
									Price {getSortIcon("Close")}
								</div>
							</th>
							<th
								className="py-3 px-4 cursor-pointer group select-none text-right"
								onClick={() => requestSort("ChangePct")}
							>
								<div className="flex items-center justify-end gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
									Change {getSortIcon("ChangePct")}
								</div>
							</th>
							<th
								className="py-3 px-4 cursor-pointer group select-none text-right"
								onClick={() => requestSort("Volume")}
							>
								<div className="flex items-center justify-end gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
									Volume {getSortIcon("Volume")}
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
							<th className="py-3 px-4 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
								Opportunity
							</th>
							<th
								className="py-3 px-6 cursor-pointer group select-none text-right"
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
								<td colSpan={8} className="py-12 text-center text-slate-400">
									<p className="text-sm font-bold text-slate-700">
										No instruments match your active criteria
									</p>
									<p className="text-xs text-slate-400 mt-1">
										{minScore > 0
											? `Try lowering your minimum score threshold (currently ≥ ${minScore}) or clear filters.`
											: "Try adjusting your search query or reset sector filters."}
									</p>
									<button
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
									onClick={() => onSelectStock?.(s)}
									className="group hover:bg-indigo-50/40 transition-colors cursor-pointer"
								>
									<td
										className="py-3 px-4 text-center"
										onClick={(e) => {
											e.stopPropagation();
											onToggleWatchlist(s.StockCode);
										}}
									>
										<button className="text-slate-300 hover:text-amber-500 transition-colors cursor-pointer p-1">
											<Star
												className={`w-4 h-4 ${
													watchlist.includes(s.StockCode)
														? "fill-amber-400 text-amber-400"
														: "text-slate-300 hover:scale-110 transition-transform"
												}`}
											/>
										</button>
									</td>

									<td className="py-3 px-5">
										<div className="flex items-center gap-2">
											<p className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
												{s.StockCode}
											</p>
											<span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
												{s.Sector}
											</span>
										</div>
										<p className="text-[10px] font-medium text-slate-500 truncate max-w-[180px]">
											{s.StockName}
										</p>
									</td>

									<td className="py-3 px-4 text-right">
										<p className="text-xs font-black text-slate-900 tabular-nums">
											{s.Close.toLocaleString()}
										</p>
									</td>

									<td className="py-3 px-4 text-right">
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
										<p className="text-xs font-bold text-slate-700 tabular-nums">
											{formatVolume(s.Volume)}
										</p>
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
											{formatBillions(s.ForeignNet)}
										</span>
									</td>

									<td className="py-3 px-4 text-center">
										<span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
											{s.Opportunity}
										</span>
									</td>

									<td className="py-3 px-6 text-right">
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
