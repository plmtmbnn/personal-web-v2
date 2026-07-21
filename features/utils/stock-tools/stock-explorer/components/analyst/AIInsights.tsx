import type { ProcessedStock } from "../../types";

interface AIInsightsProps {
	stock: ProcessedStock;
}

export default function AIInsights({ stock }: AIInsightsProps) {
	const generateNarrative = () => {
		let narrative = "";

		if (stock.CompositeScore > 80) {
			narrative += `${stock.StockCode} exhibits exceptional market momentum and strong institutional interest. `;
		} else if (stock.CompositeScore > 50) {
			narrative += `${stock.StockCode} shows moderate stability with balanced market participation. `;
		} else {
			narrative += `${stock.StockCode} is currently facing significant downward pressure and weak market participation. `;
		}

		if (stock.ForeignNet > 10000000000) {
			narrative += `Heavy foreign accumulation is evident, indicating robust overseas confidence. `;
		} else if (stock.ForeignNet < -10000000000) {
			narrative += `Substantial foreign distribution suggests capital flight from the asset. `;
		}

		if (stock.ChangePct > 2 && stock.Volume > 50000000) {
			narrative += `The recent price breakout is supported by above-average volume, confirming a healthy uptrend. `;
		}

		if (stock.Fundamentals.PE < 10 && stock.Fundamentals.ROE > 15) {
			narrative += `Fundamentally, the stock appears undervalued relative to its strong Return on Equity (ROE). `;
		}

		return (
			narrative ||
			"Insufficient significant data points to generate a conclusive market narrative."
		);
	};

	const rating =
		stock.CompositeScore > 75
			? "BUY"
			: stock.CompositeScore > 45
				? "HOLD"
				: "SELL";
	const ratingColor =
		rating === "BUY"
			? "text-emerald-600 bg-emerald-50 border-emerald-200"
			: rating === "SELL"
				? "text-rose-600 bg-rose-50 border-rose-200"
				: "text-amber-600 bg-amber-50 border-amber-200";

	return (
		<div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-black uppercase tracking-widest text-indigo-900 flex items-center gap-2">
					<span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
					AI Analyst Engine
				</h3>
				<span
					className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest border ${ratingColor}`}
				>
					{rating}
				</span>
			</div>

			<div className="space-y-4">
				<p className="text-sm text-slate-700 leading-relaxed font-medium">
					{generateNarrative()}
				</p>

				<div className="grid grid-cols-2 gap-4 mt-6">
					<div className="bg-white p-3 rounded-xl border border-slate-100">
						<p className="text-[10px] font-bold text-slate-400 uppercase">
							Trend Strength
						</p>
						<p
							className={`text-sm font-black mt-1 ${stock.Trend === "Up" ? "text-emerald-600" : stock.Trend === "Down" ? "text-rose-600" : "text-slate-600"}`}
						>
							{stock.Trend}
						</p>
					</div>
					<div className="bg-white p-3 rounded-xl border border-slate-100">
						<p className="text-[10px] font-bold text-slate-400 uppercase">
							Risk Level
						</p>
						<p
							className={`text-sm font-black mt-1 ${stock.CompositeScore < 40 ? "text-rose-600" : stock.CompositeScore > 70 ? "text-emerald-600" : "text-amber-600"}`}
						>
							{stock.CompositeScore < 40
								? "High"
								: stock.CompositeScore > 70
									? "Low"
									: "Medium"}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
