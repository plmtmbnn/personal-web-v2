import { useState, useMemo } from "react";
import type { ProcessedStock, SortConfig, SortKey } from "../../types";
import { ArrowUp, ArrowDown, ArrowUpDown, Star } from "lucide-react";

interface SmartTableProps {
	stocks: ProcessedStock[];
	onSelectStock?: (stock: ProcessedStock) => void;
	watchlist: string[];
	onToggleWatchlist: (code: string) => void;
}

export default function SmartTable({
	stocks,
	onSelectStock,
	watchlist,
	onToggleWatchlist,
}: SmartTableProps) {
	const [sortConfig, setSortConfig] = useState<SortConfig>({
		key: "CompositeScore",
		direction: "desc",
	});
	const [limit, setLimit] = useState(100);
	const [filterTab, setFilterTab] = useState<"all" | "watchlist">("all");

	const filteredStocks = useMemo(() => {
		if (filterTab === "watchlist") {
			return stocks.filter((s) => watchlist.includes(s.StockCode));
		}
		return stocks;
	}, [stocks, filterTab, watchlist]);

	const sortedStocks = useMemo(() => {
		const sorted = [...filteredStocks].sort((a, b) => {
			const aVal = a[sortConfig.key];
			const bVal = b[sortConfig.key];
			if (aVal === null) return 1;
			if (bVal === null) return -1;
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
		if (val === 0) return "-";
		const isNeg = val < 0;
		return `${isNeg ? "-" : "+"}${(Math.abs(val) / 1e9).toFixed(1)}B`;
	};

	const renderMomentumStars = (score: number) => {
		const stars = Math.round(score / 20); // 0 to 5
		return "★".repeat(stars) + "☆".repeat(5 - stars);
	};

	const getSortIcon = (col: SortKey) => {
		if (sortConfig.key !== col)
			return (
				<ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
			);
		return sortConfig.direction === "asc" ? (
			<ArrowUp className="w-3 h-3 text-indigo-500" />
		) : (
			<ArrowDown className="w-3 h-3 text-indigo-500" />
		);
	};

	return (
		<div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
			<div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
				<div>
					<h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
						Market Screener
					</h3>
					<p className="text-[10px] font-bold text-slate-400 mt-1">
						Showing top {sortedStocks.length} of {filteredStocks.length}{" "}
						instruments
					</p>
				</div>
				<div className="flex gap-2 p-1 bg-slate-200/60 rounded-xl">
					<button
						onClick={() => setFilterTab("all")}
						className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
							filterTab === "all"
								? "bg-white text-slate-900 shadow-sm"
								: "text-slate-500 hover:text-slate-950"
						}`}
					>
						All Stocks
					</button>
					<button
						onClick={() => setFilterTab("watchlist")}
						className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer ${
							filterTab === "watchlist"
								? "bg-white text-slate-900 shadow-sm"
								: "text-slate-500 hover:text-slate-950"
						}`}
					>
						<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
						Watchlist ({watchlist.length})
					</button>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse min-w-[850px]">
					<thead>
						<tr className="bg-white border-b border-slate-100">
							<th className="py-4 px-6 w-12 text-center">
								<div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Pin
								</div>
							</th>
							<th
								className="py-4 px-6 cursor-pointer group"
								onClick={() => requestSort("StockCode")}
							>
								<div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
									Ticker {getSortIcon("StockCode")}
								</div>
							</th>
							<th
								className="py-4 px-6 cursor-pointer group"
								onClick={() => requestSort("Close")}
							>
								<div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
									Price {getSortIcon("Close")}
								</div>
							</th>
							<th
								className="py-4 px-6 cursor-pointer group"
								onClick={() => requestSort("ChangePct")}
							>
								<div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
									Trend {getSortIcon("ChangePct")}
								</div>
							</th>
							<th
								className="py-4 px-6 cursor-pointer group"
								onClick={() => requestSort("CompositeScore")}
							>
								<div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
									Momentum {getSortIcon("CompositeScore")}
								</div>
							</th>
							<th
								className="py-4 px-6 cursor-pointer group"
								onClick={() => requestSort("Volume")}
							>
								<div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
									Volume {getSortIcon("Volume")}
								</div>
							</th>
							<th
								className="py-4 px-6 cursor-pointer group text-right"
								onClick={() => requestSort("ForeignNet")}
							>
								<div className="flex items-center justify-end gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
									{getSortIcon("ForeignNet")} Foreign
								</div>
							</th>
							<th
								className="py-4 px-6 cursor-pointer group text-right"
								onClick={() => requestSort("CompositeScore")}
							>
								<div className="flex items-center justify-end gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
									{getSortIcon("CompositeScore")} Score
								</div>
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-50">
						{sortedStocks.map((s) => (
							<tr
								key={s.StockCode}
								onClick={() => onSelectStock && onSelectStock(s)}
								className="group hover:bg-indigo-50/50 transition-colors cursor-pointer"
							>
								<td
									className="py-3 px-6 text-center"
									onClick={(e) => {
										e.stopPropagation();
										onToggleWatchlist(s.StockCode);
									}}
								>
									<button className="text-slate-300 hover:text-amber-500 transition-colors cursor-pointer focus:outline-none">
										<Star
											className={`w-4 h-4 ${
												watchlist.includes(s.StockCode)
													? "fill-amber-400 text-amber-400"
													: "text-slate-300 hover:scale-110 transition-transform"
											}`}
										/>
									</button>
								</td>
								<td className="py-3 px-6">
									<p className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
										{s.StockCode}
									</p>
									<p className="text-[9px] font-bold text-slate-400 truncate max-w-[150px]">
										{s.StockName}
									</p>
								</td>
								<td className="py-3 px-6">
									<p className="text-xs font-black text-slate-900">
										{s.Close.toLocaleString()}
									</p>
								</td>
								<td className="py-3 px-6">
									<div className="flex items-center gap-2">
										<div
											className={`w-2 h-2 rounded-full ${s.Trend === "Up" ? "bg-emerald-500" : s.Trend === "Down" ? "bg-rose-500" : "bg-slate-300"}`}
										/>
										<span
											className={`text-[10px] font-black ${s.Trend === "Up" ? "text-emerald-600" : s.Trend === "Down" ? "text-rose-600" : "text-slate-500"}`}
										>
											{s.ChangePct > 0 ? "+" : ""}
											{s.ChangePct.toFixed(1)}%
										</span>
									</div>
								</td>
								<td className="py-3 px-6">
									<span
										className={`text-xs tracking-widest ${s.CompositeScore > 70 ? "text-amber-400" : "text-slate-300"}`}
									>
										{renderMomentumStars(s.CompositeScore)}
									</span>
								</td>
								<td className="py-3 px-6">
									<div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
										<div
											className="h-full bg-indigo-500 rounded-full"
											style={{
												width: `${Math.min((s.Volume / 100000000) * 100, 100)}%`,
											}}
										/>
									</div>
								</td>
								<td className="py-3 px-6 text-right">
									<span
										className={`text-[10px] font-black ${s.ForeignNet > 0 ? "text-emerald-600 bg-emerald-50" : s.ForeignNet < 0 ? "text-rose-600 bg-rose-50" : "text-slate-500 bg-slate-50"} px-2 py-1 rounded-md`}
									>
										{formatBillions(s.ForeignNet)}
									</span>
								</td>
								<td className="py-3 px-6 text-right">
									<span
										className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-[11px] font-black ${
											s.CompositeScore >= 80
												? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
												: s.CompositeScore >= 50
													? "bg-slate-900 text-white"
													: "bg-slate-100 text-slate-500"
										}`}
									>
										{s.CompositeScore}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{limit < filteredStocks.length && (
				<div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-center">
					<button
						onClick={() => setLimit((l) => l + 100)}
						className="px-4 py-2 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
					>
						Load More Rows
					</button>
				</div>
			)}
		</div>
	);
}
