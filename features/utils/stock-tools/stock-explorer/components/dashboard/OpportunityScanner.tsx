"use client";

import { useState, useMemo } from "react";
import type { ProcessedStock, OpportunityCategory } from "../../types";
import {
	Flame,
	Rocket,
	TrendingUp,
	Coins,
	Building2,
	Globe,
	Bookmark,
	TrendingDown,
	Search,
	ChevronRight,
	SlidersHorizontal,
} from "lucide-react";

interface OpportunityScannerProps {
	stocks: ProcessedStock[];
	onSelectStock?: (stock: ProcessedStock) => void;
}

interface CategoryMeta {
	key: OpportunityCategory;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	color: string;
}

const CATEGORIES: CategoryMeta[] = [
	{
		key: "Momentum",
		label: "Momentum",
		icon: Rocket,
		color: "text-indigo-600 bg-indigo-50 border-indigo-200",
	},
	{
		key: "Strong Buy",
		label: "Strong Buy",
		icon: Flame,
		color: "text-amber-600 bg-amber-50 border-amber-200",
	},
	{
		key: "Breakout",
		label: "Breakout",
		icon: TrendingUp,
		color: "text-emerald-600 bg-emerald-50 border-emerald-200",
	},
	{
		key: "Value",
		label: "Value",
		icon: Coins,
		color: "text-cyan-600 bg-cyan-50 border-cyan-200",
	},
	{
		key: "Blue Chip",
		label: "Blue Chip",
		icon: Building2,
		color: "text-blue-600 bg-blue-50 border-blue-200",
	},
	{
		key: "Foreign Accumulation",
		label: "Foreign Flow",
		icon: Globe,
		color: "text-violet-600 bg-violet-50 border-violet-200",
	},
	{
		key: "Watchlist",
		label: "Watchlist",
		icon: Bookmark,
		color: "text-slate-600 bg-slate-50 border-slate-200",
	},
	{
		key: "Weak Trend",
		label: "Weak Trend",
		icon: TrendingDown,
		color: "text-rose-600 bg-rose-50 border-rose-200",
	},
];

export default function OpportunityScanner({
	stocks,
	onSelectStock,
}: OpportunityScannerProps) {
	const [activeCategory, setActiveCategory] =
		useState<OpportunityCategory>("Momentum");
	const [searchQuery, setSearchQuery] = useState("");

	const categoryCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const cat of CATEGORIES) {
			counts[cat.key] = 0;
		}
		for (const s of stocks) {
			if (counts[s.Opportunity] !== undefined) {
				counts[s.Opportunity]++;
			}
		}
		return counts;
	}, [stocks]);

	const filteredStocks = useMemo(() => {
		let list = stocks.filter((s) => s.Opportunity === activeCategory);
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(s) =>
					s.StockCode.toLowerCase().includes(q) ||
					s.StockName.toLowerCase().includes(q),
			);
		}
		return list
			.sort((a, b) => b.CompositeScore - a.CompositeScore)
			.slice(0, 12);
	}, [stocks, activeCategory, searchQuery]);

	const activeMeta =
		CATEGORIES.find((c) => c.key === activeCategory) || CATEGORIES[0];
	const ActiveIcon = activeMeta.icon;

	return (
		<div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col h-full">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
						<SlidersHorizontal className="w-5 h-5 text-indigo-400" />
					</div>
					<div>
						<h3 className="text-base font-extrabold text-slate-900 tracking-tight">
							Opportunity Scanner
						</h3>
						<p className="text-xs font-medium text-slate-500">
							Algorithmic categorization based on active composite scoring
							weights
						</p>
					</div>
				</div>

				{/* In-Card Search */}
				<div className="relative w-full sm:w-56">
					<Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
					<input
						type="text"
						placeholder="Filter category..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
					/>
				</div>
			</div>

			{/* Category Filter Pills */}
			<div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-slate-100">
				{CATEGORIES.map((cat) => {
					const Icon = cat.icon;
					const count = categoryCounts[cat.key] || 0;
					const isActive = activeCategory === cat.key;
					return (
						<button
							key={cat.key}
							onClick={() => {
								setActiveCategory(cat.key);
								setSearchQuery("");
							}}
							className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
								isActive
									? "bg-slate-900 text-white border-slate-900 shadow-xs"
									: "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
							}`}
						>
							<Icon
								className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-slate-400"}`}
							/>
							<span>{cat.label}</span>
							<span
								className={`text-[10px] px-1.5 py-0.2 rounded-md ${
									isActive
										? "bg-slate-800 text-slate-300"
										: "bg-slate-100 text-slate-500"
								}`}
							>
								{count}
							</span>
						</button>
					);
				})}
			</div>

			{/* Filtered Stock List */}
			<div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[520px]">
				{filteredStocks.length === 0 ? (
					<div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
						<ActiveIcon className="w-8 h-8 text-slate-300 mb-2" />
						<p className="text-xs font-extrabold text-slate-700">
							No stocks match &quot;{activeCategory}&quot;
						</p>
						<p className="text-[11px] font-medium text-slate-400 mt-1 max-w-xs">
							{searchQuery
								? "Try a different search keyword or clear the filter."
								: "Adjust scoring weights or check other strategy categories."}
						</p>
					</div>
				) : (
					filteredStocks.map((s) => (
						<div
							key={s.StockCode}
							onClick={() => onSelectStock?.(s)}
							className="flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/60 hover:border-indigo-200 hover:shadow-xs transition-all cursor-pointer group"
						>
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center font-black text-xs text-slate-900 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
									{s.StockCode.slice(0, 2)}
								</div>
								<div>
									<div className="flex items-center gap-2">
										<p className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
											{s.StockCode}
										</p>
										<span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
											{s.Sector}
										</span>
									</div>
									<p className="text-[11px] font-medium text-slate-500 truncate max-w-[150px] sm:max-w-[220px]">
										{s.StockName}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-4 text-right">
								<div>
									<p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
										Price
									</p>
									<p className="text-xs font-black text-slate-900">
										{s.Close.toLocaleString()}
									</p>
								</div>

								<div className="w-16">
									<p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
										Trend
									</p>
									<p
										className={`text-xs font-black ${
											s.ChangePct > 0
												? "text-emerald-600"
												: s.ChangePct < 0
													? "text-rose-600"
													: "text-slate-600"
										}`}
									>
										{s.ChangePct > 0 ? "+" : ""}
										{s.ChangePct.toFixed(1)}%
									</p>
								</div>

								<div className="w-12">
									<p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
										Score
									</p>
									<span
										className={`inline-block text-[11px] font-black px-2 py-0.5 rounded-lg border ${
											s.CompositeScore >= 80
												? "bg-indigo-50 text-indigo-700 border-indigo-200"
												: s.CompositeScore >= 60
													? "bg-emerald-50 text-emerald-700 border-emerald-200"
													: "bg-slate-100 text-slate-700 border-slate-200"
										}`}
									>
										{s.CompositeScore}
									</span>
								</div>

								<ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
