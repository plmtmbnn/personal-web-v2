import { useMemo } from "react";
import type { ProcessedStock } from "../../types";

interface TopMoversProps {
	stocks: ProcessedStock[];
}

export default function TopMovers({ stocks }: TopMoversProps) {
	const topGainers = useMemo(
		() => [...stocks].sort((a, b) => b.ChangePct - a.ChangePct).slice(0, 5),
		[stocks],
	);
	const topLosers = useMemo(
		() => [...stocks].sort((a, b) => a.ChangePct - b.ChangePct).slice(0, 5),
		[stocks],
	);
	const topVolume = useMemo(
		() => [...stocks].sort((a, b) => b.Volume - a.Volume).slice(0, 5),
		[stocks],
	);

	const formatNumber = (n: number) => {
		if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
		if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
		return n.toLocaleString();
	};

	const renderList = (
		title: string,
		data: ProcessedStock[],
		metric: "ChangePct" | "Volume",
		color: string,
	) => (
		<div className="flex-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
			<h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
				{title}
			</h3>
			<div className="space-y-3">
				{data.map((s, idx) => (
					<div
						key={s.StockCode}
						className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg transition-colors"
					>
						<div className="flex items-center gap-3">
							<span className="text-[9px] font-bold text-slate-300 w-3">
								{idx + 1}
							</span>
							<div>
								<p className="text-xs font-black text-slate-900">
									{s.StockCode}
								</p>
								<p className="text-[9px] font-bold text-slate-500 truncate max-w-[100px]">
									{s.StockName}
								</p>
							</div>
						</div>
						<div className="text-right">
							<p className="text-xs font-bold text-slate-900">{s.Close}</p>
							<p className={`text-[10px] font-black ${color}`}>
								{metric === "ChangePct"
									? `${s.ChangePct > 0 ? "+" : ""}${s.ChangePct.toFixed(1)}%`
									: formatNumber(s.Volume)}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);

	return (
		<div className="flex flex-col md:flex-row gap-4">
			{renderList("Top Gainers", topGainers, "ChangePct", "text-emerald-600")}
			{renderList("Top Losers", topLosers, "ChangePct", "text-rose-600")}
			{renderList("Highest Volume", topVolume, "Volume", "text-indigo-600")}
		</div>
	);
}
