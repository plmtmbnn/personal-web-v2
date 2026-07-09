import { useMemo, useState } from "react";
import type { ProcessedStock } from "../../types";
import { Maximize2, Minimize2 } from "lucide-react";

interface HeatmapProps {
	stocks: ProcessedStock[];
	onSelectStock?: (stock: ProcessedStock) => void;
}

export default function Heatmap({ stocks, onSelectStock }: HeatmapProps) {
	const [expanded, setExpanded] = useState(false);

	const topStocks = useMemo(() => {
		return [...stocks]
			.sort((a, b) => b.Volume - a.Volume)
			.slice(0, expanded ? 400 : 100);
	}, [stocks, expanded]);

	const getColor = (change: number) => {
		if (change > 5) return "bg-emerald-600";
		if (change > 2) return "bg-emerald-500";
		if (change > 0) return "bg-emerald-400";
		if (change < -5) return "bg-rose-600";
		if (change < -2) return "bg-rose-500";
		if (change < 0) return "bg-rose-400";
		return "bg-slate-300";
	};

	return (
		<div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
						Market Heatmap
					</h3>
					<p className="text-xs font-bold text-slate-900 mt-1">
						Top {expanded ? "400" : "100"} by Volume
					</p>
				</div>
				<button
					onClick={() => setExpanded(!expanded)}
					className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
				>
					{expanded ? (
						<Minimize2 className="w-4 h-4" />
					) : (
						<Maximize2 className="w-4 h-4" />
					)}
				</button>
			</div>

			<div className="flex flex-wrap gap-1 content-start">
				{topStocks.map((s) => (
					<div
						key={s.StockCode}
						onClick={() => onSelectStock && onSelectStock(s)}
						title={`${s.StockCode}\nChange: ${s.ChangePct.toFixed(2)}%\nVolume: ${(s.Volume / 1e6).toFixed(1)}M`}
						className={`cursor-pointer transition-transform hover:scale-110 hover:z-10 rounded-sm flex items-center justify-center ${getColor(s.ChangePct)}`}
						style={{
							width:
								s.Volume > 100000000
									? "40px"
									: s.Volume > 50000000
										? "30px"
										: "24px",
							height:
								s.Volume > 100000000
									? "40px"
									: s.Volume > 50000000
										? "30px"
										: "24px",
						}}
					>
						{s.Volume > 100000000 && (
							<span className="text-[8px] font-black text-white/90">
								{s.StockCode}
							</span>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
