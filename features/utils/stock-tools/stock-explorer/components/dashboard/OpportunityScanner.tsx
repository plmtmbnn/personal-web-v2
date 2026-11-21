"use client";

import { useState, useMemo } from "react";
import type {
	ProcessedStock,
	OpportunityCategory,
	CompassBridgeSummary,
} from "../../types";
import {
	Activity,
	Rocket,
	Landmark,
	RefreshCw,
	TrendingUp,
	Globe,
	Building2,
	Search,
	SlidersHorizontal,
	AlertTriangle,
} from "lucide-react";
import { useScreener } from "../../context/ScreenerContext";
import {
	matchesOpportunity,
	sortStocksForCategory,
	getCategoryPrimaryMetric,
} from "../../utils/opportunityPredicates";

interface OpportunityScannerProps {
	stocks: ProcessedStock[];
	onSelectStock?: (stock: ProcessedStock) => void;
	compassBridge?: CompassBridgeSummary | null;
}

interface CategoryMeta {
	key: OpportunityCategory;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	color: string;
	isTacticalSwing?: boolean;
}

const CATEGORIES: CategoryMeta[] = [
	{
		key: "Foreign Accumulation",
		label: "Foreign Stealth",
		icon: Globe,
		color: "text-violet-600 bg-violet-50 border-violet-200",
	},
	{
		key: "Breakout",
		label: "10D RVOL Breakout",
		icon: TrendingUp,
		color: "text-emerald-600 bg-emerald-50 border-emerald-200",
		isTacticalSwing: true,
	},
	{
		key: "Bandar Accumulation",
		label: "Whale / Bandar",
		icon: Landmark,
		color: "text-purple-600 bg-purple-50 border-purple-200",
	},
	{
		key: "Blue Chip",
		label: "Blue-Chip Pullback",
		icon: Building2,
		color: "text-blue-600 bg-blue-50 border-blue-200",
	},
	{
		key: "High Volatile",
		label: "High-Velocity Scalp",
		icon: Activity,
		color: "text-amber-600 bg-amber-50 border-amber-200",
		isTacticalSwing: true,
	},
	{
		key: "ARB Reversal",
		label: "ARB Washout",
		icon: RefreshCw,
		color: "text-orange-600 bg-orange-50 border-orange-200",
		isTacticalSwing: true,
	},
	{
		key: "Near ARA",
		label: "Near ARA",
		icon: Rocket,
		color: "text-rose-600 bg-rose-50 border-rose-200",
		isTacticalSwing: true,
	},
];

export default function OpportunityScanner({
	stocks,
	onSelectStock,
	compassBridge,
}: OpportunityScannerProps) {
	const screener = useScreener();
	const handleSelect = onSelectStock || screener.setSelectedStock;
	const [activeCategory, setActiveCategory] = useState<OpportunityCategory>(
		"Foreign Accumulation",
	);
	const [searchQuery, setSearchQuery] = useState("");

	const isDefensiveOrStress =
		compassBridge?.effectiveState === "defensive" ||
		compassBridge?.effectiveState === "stress";

	const categoryCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const cat of CATEGORIES) {
			counts[cat.key] = 0;
		}
		for (const s of stocks) {
			for (const cat of CATEGORIES) {
				if (matchesOpportunity(s, cat.key)) {
					counts[cat.key]++;
				}
			}
		}
		return counts;
	}, [stocks]);

	const filteredStocks = useMemo(() => {
		let list = stocks.filter((s) => matchesOpportunity(s, activeCategory));
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(s) =>
					s.StockCode.toLowerCase().includes(q) ||
					s.StockName.toLowerCase().includes(q),
			);
		}
		return sortStocksForCategory(list, activeCategory).slice(0, 12);
	}, [stocks, activeCategory, searchQuery]);

	const activeMeta =
		CATEGORIES.find((c) => c.key === activeCategory) || CATEGORIES[0];
	const ActiveIcon = activeMeta.icon;

	return (
		<div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col h-full">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
						<SlidersHorizontal className="w-5 h-5" />
					</div>
					<div>
						<h3 className="text-base font-bold text-slate-900 tracking-tight">
							Opportunity Scanner
						</h3>
						<p className="text-xs font-medium text-slate-600">
							Algorithmic categorization based on active market setups and flow
						</p>
					</div>
				</div>

				{/* In-Card Search */}
				<div className="relative w-full sm:w-56">
					<Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
					<input
						type="text"
						aria-label="Filter category tickers"
						placeholder="Filter category..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full min-h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
					/>
				</div>
			</div>

			{/* Category Filter Pills */}
			<div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-100">
				{CATEGORIES.map((cat) => {
					const Icon = cat.icon;
					const count = categoryCounts[cat.key] || 0;
					const isActive = activeCategory === cat.key;
					const isCounterRegime = isDefensiveOrStress && cat.isTacticalSwing;
					return (
						<button
							key={cat.key}
							type="button"
							aria-pressed={isActive}
							onClick={() => {
								setActiveCategory(cat.key);
								setSearchQuery("");
							}}
							className={`min-h-11 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border ${
								isActive
									? "bg-slate-900 text-white border-slate-900 shadow-xs"
									: "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:text-slate-950"
							}`}
						>
							<Icon
								className={`w-3.5 h-3.5 ${isActive ? "text-indigo-300" : "text-slate-500"}`}
							/>
							<span>{cat.label}</span>
							{isCounterRegime && (
								<AlertTriangle
									className={`w-3.5 h-3.5 ${isActive ? "text-amber-300" : "text-amber-600"}`}
								/>
							)}
							<span
								className={`text-xs px-1.5 py-0.5 rounded-md tabular-nums ${
									isActive
										? "bg-slate-800 text-slate-200"
										: "bg-slate-100 text-slate-700"
								}`}
							>
								{count}
							</span>
						</button>
					);
				})}
			</div>

			{/* Counter-Regime Warning Banner when viewing tactical scalp/breakout in Defensive/Stress */}
			{isDefensiveOrStress && activeMeta.isTacticalSwing && (
				<div className="mb-4 p-3.5 rounded-2xl bg-white border border-amber-200/90 border-l-4 border-l-amber-500 flex items-center justify-between gap-2 text-xs text-slate-800">
					<div className="flex items-start gap-2 font-semibold leading-relaxed">
						<AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
						<span>
							Counter-regime warning: IHSG Compass is in{" "}
							<strong className="font-bold text-slate-900">
								{compassBridge?.effectiveState}
							</strong>{" "}
							mode (
							{compassBridge?.isTradingLocked ? "swing locked" : "cautious"}).
							Avoid chasing breakouts; prioritize Foreign Stealth or Blue-Chip
							Pullback.
						</span>
					</div>
				</div>
			)}

			{/* Filtered Stock List */}
			<div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[520px]">
				{filteredStocks.length === 0 ? (
					<div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
						<ActiveIcon className="w-8 h-8 text-slate-400 mb-2" />
						<p className="text-xs font-bold text-slate-800">
							No stocks match &quot;{activeMeta.label}&quot;
						</p>
						<p className="text-xs font-medium text-slate-600 mt-1 max-w-xs">
							{searchQuery
								? "Try a different search keyword or clear the filter."
								: "No instruments currently meet the setup criteria for this category."}
						</p>
					</div>
				) : (
					filteredStocks.map((s) => {
						const metric = getCategoryPrimaryMetric(s, activeCategory);
						return (
							<button
								key={s.StockCode}
								type="button"
								onClick={() => handleSelect(s)}
								className="w-full text-left flex items-center justify-between gap-3 p-3.5 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/70 hover:border-indigo-200 hover:shadow-xs transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-indigo-600"
							>
								<div className="flex items-center gap-3 min-w-0">
									<div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center font-bold text-xs text-slate-900 group-hover:text-indigo-700 group-hover:border-indigo-200 transition-colors shrink-0">
										{s.StockCode.slice(0, 2)}
									</div>
									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
												{s.StockCode}
											</p>
											<span className="text-xs font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md truncate">
												{s.Sector}
											</span>
										</div>
										<p className="text-xs font-medium text-slate-600 truncate max-w-[140px] sm:max-w-[200px]">
											{s.StockName}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3 sm:gap-4 text-right shrink-0">
									<div>
										<p className="text-xs font-semibold text-slate-600">
											Price
										</p>
										<p className="text-xs font-bold tabular-nums text-slate-900">
											{s.Close.toLocaleString("id-ID")}
										</p>
									</div>

									<div className="w-14 sm:w-16">
										<p className="text-xs font-semibold text-slate-600">
											Trend
										</p>
										<p
											className={`text-xs font-bold tabular-nums ${
												s.ChangePct > 0
													? "text-emerald-700"
													: s.ChangePct < 0
														? "text-rose-700"
														: "text-slate-600"
											}`}
										>
											{s.ChangePct > 0 ? "+" : ""}
											{s.ChangePct.toFixed(1)}%
										</p>
									</div>

									<div className="min-w-16 text-right">
										<p className="text-xs font-semibold text-slate-600">
											{metric.label}
										</p>
										<span
											className={`inline-block text-xs font-bold px-2 py-0.5 rounded-lg border tabular-nums ${
												metric.colorClass ||
												"bg-slate-100 text-slate-800 border-slate-200"
											}`}
										>
											{metric.value}
										</span>
									</div>
								</div>
							</button>
						);
					})
				)}
			</div>
		</div>
	);
}
