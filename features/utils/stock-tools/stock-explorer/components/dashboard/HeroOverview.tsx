"use client";

import {
	TrendingUp,
	TrendingDown,
	Activity,
	Globe,
	BarChart2,
	Coins,
} from "lucide-react";
import type { MarketHealth } from "../../types";

interface HeroOverviewProps {
	marketHealth: MarketHealth;
}

export default function HeroOverview({ marketHealth }: HeroOverviewProps) {
	const {
		marketReturn,
		sentimentScore,
		sentimentLabel,
		netForeignValue,
		netForeignVolume,
		totalVolume,
		totalValue,
		advancers,
		decliners,
		unchanged,
	} = marketHealth;

	const totalBreadth = Math.max(1, advancers + decliners + unchanged);
	const advPct = Math.round((advancers / totalBreadth) * 100);
	const decPct = Math.round((decliners / totalBreadth) * 100);
	const unchPct = Math.max(0, 100 - advPct - decPct);

	const formatBillions = (val: number, decimals = 2) => {
		const abs = Math.abs(val);
		const sign = val < 0 ? "-" : "";
		if (abs >= 1e12) {
			return `${sign}${(abs / 1e12).toFixed(2)}T`;
		}
		return `${sign}${(abs / 1e9).toFixed(decimals)}B`;
	};

	const formatTrillions = (val: number) => `${(val / 1e12).toFixed(2)}T`;

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{/* IHSG Return (Cap-Weighted) + Integrated Breadth Bar */}
			<div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
				<div className="flex justify-between items-start mb-3">
					<div>
						<p className="text-xs font-bold text-slate-600">
							Market return &amp; breadth
						</p>
						<h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">
							{marketReturn > 0 ? "+" : ""}
							{marketReturn.toFixed(2)}%
						</h2>
					</div>
					<div
						className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
							marketReturn >= 0
								? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
								: "bg-rose-50 text-rose-700 border border-rose-200/80"
						}`}
					>
						{marketReturn >= 0 ? (
							<TrendingUp className="w-5 h-5" />
						) : (
							<TrendingDown className="w-5 h-5" />
						)}
					</div>
				</div>
				<div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
					<div
						className="w-full h-1.5 rounded-full overflow-hidden flex bg-slate-100"
						title={`${advancers} Up (${advPct}%) | ${unchanged} Flat | ${decliners} Down (${decPct}%)`}
					>
						<div
							style={{ width: `${advPct}%` }}
							className="bg-emerald-500 h-full"
						/>
						<div
							style={{ width: `${unchPct}%` }}
							className="bg-slate-300 h-full"
						/>
						<div
							style={{ width: `${decPct}%` }}
							className="bg-rose-500 h-full"
						/>
					</div>
					<div className="flex items-center justify-between text-xs font-semibold tabular-nums">
						<span className="text-emerald-700">
							{advancers} Up ({advPct}%)
						</span>
						<span className="text-slate-600">{unchanged} Flat</span>
						<span className="text-rose-700">{decliners} Down</span>
					</div>
				</div>
			</div>

			{/* Market Composite Score */}
			<div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
				<div className="flex justify-between items-start mb-4">
					<div>
						<p className="text-xs font-bold text-slate-600">
							Market composite score
						</p>
						<h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">
							{sentimentScore}{" "}
							<span className="text-sm font-semibold text-slate-500">
								/ 100
							</span>
						</h2>
					</div>
					<div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
						<Activity className="w-5 h-5" />
					</div>
				</div>
				<div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-slate-100">
					<span
						className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
							sentimentScore >= 60
								? "bg-emerald-50 text-emerald-800 border-emerald-200"
								: sentimentScore <= 40
									? "bg-rose-50 text-rose-800 border-rose-200"
									: "bg-amber-50 text-amber-800 border-amber-200"
						}`}
					>
						{sentimentLabel}
					</span>
					<span className="text-xs font-medium text-slate-600">
						Microstructure index
					</span>
				</div>
			</div>

			{/* Foreign Net Flow */}
			<div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
				<div className="flex justify-between items-start mb-4">
					<div>
						<div className="flex items-center gap-1.5">
							<p className="text-xs font-bold text-slate-600">
								Foreign net flow
							</p>
							<span className="text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
								Regular
							</span>
						</div>
						<h2
							className={`text-2xl sm:text-3xl font-bold mt-1 tracking-tight tabular-nums ${
								netForeignValue >= 0 ? "text-emerald-700" : "text-rose-700"
							}`}
						>
							{netForeignValue > 0 ? "+" : ""}
							{formatBillions(netForeignValue)}
						</h2>
						<p className="text-xs font-semibold text-slate-600 mt-0.5 tabular-nums">
							{netForeignVolume < 0 ? "Net sell" : "Net buy"}:{" "}
							<span
								className={`font-bold ${
									netForeignVolume < 0 ? "text-rose-700" : "text-emerald-700"
								}`}
							>
								{formatBillions(netForeignVolume)}
							</span>{" "}
							vol
						</p>
					</div>
					<div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
						<Globe className="w-5 h-5" />
					</div>
				</div>
				<div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-slate-100">
					<span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
						Value (IDR)
					</span>
					<span
						className={`text-xs font-bold tabular-nums ${
							netForeignVolume < 0 ? "text-rose-700" : "text-emerald-700"
						}`}
					>
						Regular: {formatBillions(netForeignVolume)}
					</span>
				</div>
			</div>

			{/* Total Turnover */}
			<div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
				<div className="flex justify-between items-start mb-4">
					<div>
						<p className="text-xs font-bold text-slate-600">Total turnover</p>
						<h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">
							{formatTrillions(totalValue)}
						</h2>
					</div>
					<div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
						<Coins className="w-5 h-5" />
					</div>
				</div>
				<div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-slate-100">
					<span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
						Value (IDR)
					</span>
					<span className="text-xs font-semibold text-slate-600 flex items-center gap-1 tabular-nums">
						<BarChart2 className="w-3.5 h-3.5 text-slate-500" />
						{formatBillions(totalVolume, 1)} Vol
					</span>
				</div>
			</div>
		</div>
	);
}
