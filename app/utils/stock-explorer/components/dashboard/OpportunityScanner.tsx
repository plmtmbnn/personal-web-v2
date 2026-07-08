import { useState, useMemo } from "react";
import type { ProcessedStock, OpportunityCategory } from "../../types";

interface OpportunityScannerProps {
	stocks: ProcessedStock[];
	onSelectStock?: (stock: ProcessedStock) => void;
}

const CATEGORIES: OpportunityCategory[] = [
	"🔥 Strong Buy",
	"🚀 Momentum",
	"📈 Breakout",
	"💰 Value",
	"🏦 Blue Chip",
	"🌍 Foreign Accumulation",
	"⚠ Watchlist",
	"❌ Weak Trend",
];

export default function OpportunityScanner({
	stocks,
	onSelectStock,
}: OpportunityScannerProps) {
	const [activeCategory, setActiveCategory] =
		useState<OpportunityCategory>("🚀 Momentum");

	const filteredStocks = useMemo(() => {
		return stocks
			.filter((s) => s.Opportunity === activeCategory)
			.sort((a, b) => b.CompositeScore - a.CompositeScore)
			.slice(0, 10);
	}, [stocks, activeCategory]);

	return (
		<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
			<h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
				Opportunity Scanner
			</h3>

			<div className="flex flex-wrap gap-2 mb-6">
				{CATEGORIES.map((cat) => (
					<button
						key={cat}
						onClick={() => setActiveCategory(cat)}
						className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
							activeCategory === cat
								? "bg-slate-900 text-white shadow-md"
								: "bg-slate-50 text-slate-500 hover:bg-slate-100"
						}`}
					>
						{cat}
					</button>
				))}
			</div>

			<div className="flex-1 overflow-auto pr-2">
				{filteredStocks.length === 0 ? (
					<div className="h-full flex flex-col items-center justify-center text-slate-400">
						<p className="text-xs font-bold">
							No stocks match this category right now.
						</p>
					</div>
				) : (
					<div className="space-y-2">
						{filteredStocks.map((s) => (
							<div
								key={s.StockCode}
								onClick={() => onSelectStock && onSelectStock(s)}
								className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-indigo-100 group"
							>
								<div className="flex items-center gap-4">
									<div>
										<p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
											{s.StockCode}
										</p>
										<p className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">
											{s.StockName}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-6 text-right">
									<div>
										<p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
											Score
										</p>
										<p
											className={`text-sm font-black ${s.CompositeScore > 80 ? "text-emerald-600" : s.CompositeScore > 60 ? "text-indigo-600" : "text-amber-600"}`}
										>
											{s.CompositeScore}
										</p>
									</div>
									<div className="w-20">
										<p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
											Change
										</p>
										<p
											className={`text-sm font-black ${s.ChangePct > 0 ? "text-emerald-600" : s.ChangePct < 0 ? "text-rose-600" : "text-slate-600"}`}
										>
											{s.ChangePct > 0 ? "+" : ""}
											{s.ChangePct.toFixed(1)}%
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
