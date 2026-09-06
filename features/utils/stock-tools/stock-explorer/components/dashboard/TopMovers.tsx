"use client";

import { useMemo } from "react";
import type { ProcessedStock } from "../../types";
import { TrendingUp, TrendingDown, Zap, ChevronRight } from "lucide-react";

interface TopMoversProps {
	stocks: ProcessedStock[];
	onSelectStock?: (stock: ProcessedStock) => void;
}

export default function TopMovers({ stocks, onSelectStock }: TopMoversProps) {
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
		if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
		if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
		return n.toLocaleString();
	};

	const renderColumn = (
		title: string,
		subtitle: string,
		icon: React.ReactNode,
		data: ProcessedStock[],
		metric: "ChangePct" | "Volume",
		colorClass: string,
		badgeBgClass: string,
	) => (
		<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
			<div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
				<div className="flex items-center gap-2.5">
					<div className={`p-2 rounded-xl ${badgeBgClass}`}>{icon}</div>
					<div>
						<h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
							{title}
						</h3>
						<p className="text-[10px] font-bold text-slate-400">{subtitle}</p>
					</div>
				</div>
				<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
					Top 5
				</span>
			</div>

			<div className="space-y-2">
				{data.map((s, idx) => (
					<div
						key={s.StockCode}
						onClick={() => onSelectStock?.(s)}
						className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-2.5 rounded-xl transition-all border border-transparent hover:border-slate-200/60"
					>
						<div className="flex items-center gap-3">
							<span className="text-[10px] font-extrabold text-slate-400 w-4 text-center">
								{idx + 1}
							</span>
							<div>
								<div className="flex items-center gap-1.5">
									<p className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
										{s.StockCode}
									</p>
									<span className="text-[9px] font-semibold text-slate-400">
										{s.Sector}
									</span>
								</div>
								<p className="text-[10px] font-medium text-slate-500 truncate max-w-[130px]">
									{s.StockName}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2 text-right">
							<div>
								<p className="text-xs font-black text-slate-900">
									{s.Close.toLocaleString()}
								</p>
								<p className={`text-[11px] font-black ${colorClass}`}>
									{metric === "ChangePct"
										? `${s.ChangePct > 0 ? "+" : ""}${s.ChangePct.toFixed(1)}%`
										: `${formatNumber(s.Volume)} vol`}
								</p>
							</div>
							<ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
						</div>
					</div>
				))}
			</div>
		</div>
	);

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{renderColumn(
				"Top Gainers",
				"Leading momentum",
				<TrendingUp className="w-4 h-4 text-emerald-600" />,
				topGainers,
				"ChangePct",
				"text-emerald-600",
				"bg-emerald-50 border border-emerald-100",
			)}
			{renderColumn(
				"Top Losers",
				"Heavy pullbacks",
				<TrendingDown className="w-4 h-4 text-rose-600" />,
				topLosers,
				"ChangePct",
				"text-rose-600",
				"bg-rose-50 border border-rose-100",
			)}
			{renderColumn(
				"Volume Leaders",
				"High liquidity flow",
				<Zap className="w-4 h-4 text-indigo-600" />,
				topVolume,
				"Volume",
				"text-indigo-600",
				"bg-indigo-50 border border-indigo-100",
			)}
		</div>
	);
}
