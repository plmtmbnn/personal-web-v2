"use client";

import { useState, useMemo } from "react";
import type { ProcessedStock, Sector } from "../../types";
import { LayoutGrid, Filter, Sparkles } from "lucide-react";

interface HeatmapProps {
	stocks: ProcessedStock[];
	onSelectStock?: (stock: ProcessedStock) => void;
	minScore?: number;
}

export default function Heatmap({
	stocks,
	onSelectStock,
	minScore = 0,
}: HeatmapProps) {
	const [volumeLimit, setVolumeLimit] = useState<50 | 100 | 200>(100);
	const [selectedSector, setSelectedSector] = useState<Sector | "ALL">("ALL");
	const [filterByScore, setFilterByScore] = useState(false);

	const availableSectors = useMemo(() => {
		const set = new Set<Sector>();
		for (const s of stocks) {
			if (s.Sector) set.add(s.Sector);
		}
		return Array.from(set).sort();
	}, [stocks]);

	const topStocks = useMemo(() => {
		let list = [...stocks];
		if (selectedSector !== "ALL") {
			list = list.filter((s) => s.Sector === selectedSector);
		}
		if (filterByScore && minScore > 0) {
			list = list.filter((s) => s.CompositeScore >= minScore);
		}
		return list.sort((a, b) => b.Volume - a.Volume).slice(0, volumeLimit);
	}, [stocks, selectedSector, volumeLimit, filterByScore, minScore]);

	const getColorStyle = (change: number) => {
		if (change >= 5)
			return "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs";
		if (change >= 2) return "bg-emerald-500 text-white hover:bg-emerald-600";
		if (change > 0)
			return "bg-emerald-400 text-emerald-950 hover:bg-emerald-500";
		if (change === 0) return "bg-slate-200 text-slate-800 hover:bg-slate-300";
		if (change > -2) return "bg-rose-400 text-rose-950 hover:bg-rose-500";
		if (change > -5) return "bg-rose-500 text-white hover:bg-rose-600";
		return "bg-rose-600 text-white hover:bg-rose-700 shadow-xs";
	};

	const formatVolume = (val: number) => {
		if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
		if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
		return val.toLocaleString();
	};

	return (
		<div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col">
			{/* Top Bar with Filters */}
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
						<LayoutGrid className="w-5 h-5" />
					</div>
					<div>
						<h3 className="text-base font-extrabold text-slate-900 tracking-tight">
							Market Liquidity Heatmap
						</h3>
						<p className="text-xs font-medium text-slate-500">
							Visualizing top traded instruments by volume and price trend
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
					{/* Score Qualified Toggle */}
					{minScore > 0 && (
						<button
							onClick={() => setFilterByScore(!filterByScore)}
							className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
								filterByScore
									? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
									: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
							}`}
						>
							<Sparkles className="w-3.5 h-3.5" />
							<span>Score ≥ {minScore}</span>
						</button>
					)}

					{/* Sector Filter */}
					<div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
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

					{/* Volume Tier Limit */}
					<div className="flex bg-slate-100 p-1 rounded-xl">
						{[50, 100, 200].map((lim) => (
							<button
								key={lim}
								onClick={() => setVolumeLimit(lim as 50 | 100 | 200)}
								className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
									volumeLimit === lim
										? "bg-white text-slate-900 shadow-xs"
										: "text-slate-500 hover:text-slate-900"
								}`}
							>
								Top {lim}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Color Legend */}
			<div className="flex flex-wrap items-center justify-between gap-2 mb-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">
				<div className="flex items-center gap-1.5 flex-wrap">
					<span className="text-slate-400 mr-1">Sentiment Scale:</span>
					<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white">
						&gt; +5%
					</span>
					<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500 text-white">
						+2% to +5%
					</span>
					<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-400 text-emerald-950">
						&gt; 0%
					</span>
					<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-700">
						0%
					</span>
					<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-400 text-rose-950">
						&lt; 0%
					</span>
					<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500 text-white">
						-2% to -5%
					</span>
					<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600 text-white">
						&lt; -5%
					</span>
				</div>
				<span className="text-slate-400">
					Displaying {topStocks.length} tickers
				</span>
			</div>

			{/* Heatmap Grid of Tiles */}
			{topStocks.length === 0 ? (
				<div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
					<p className="text-xs font-bold text-slate-600">
						No instruments match this filter combination
					</p>
					<p className="text-[11px] text-slate-400 mt-1">
						Try disabling the score filter or selecting another sector
					</p>
				</div>
			) : (
				<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
					{topStocks.map((s) => {
						const isLargeVolume = s.Volume > 50000000;
						return (
							<div
								key={s.StockCode}
								onClick={() => onSelectStock?.(s)}
								title={`${s.StockCode} (${s.StockName})\nPrice: ${s.Close.toLocaleString()} IDR\nChange: ${s.ChangePct > 0 ? "+" : ""}${s.ChangePct.toFixed(2)}%\nVolume: ${formatVolume(s.Volume)}\nScore: ${s.CompositeScore}\nSector: ${s.Sector}`}
								className={`group cursor-pointer rounded-xl p-2.5 transition-all transform hover:scale-105 hover:z-20 flex flex-col justify-between items-center text-center ${getColorStyle(
									s.ChangePct,
								)} ${isLargeVolume ? "ring-1 ring-white/20" : ""}`}
							>
								<span className="text-xs font-black tracking-tight leading-tight">
									{s.StockCode}
								</span>
								<span className="text-[10px] font-extrabold tracking-tight mt-0.5 opacity-90">
									{s.ChangePct > 0 ? "+" : ""}
									{s.ChangePct.toFixed(1)}%
								</span>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
