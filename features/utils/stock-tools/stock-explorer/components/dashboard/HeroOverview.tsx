"use client";

import { motion, useReducedMotion } from "framer-motion";
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
	const reduceMotion = useReducedMotion();
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
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
			>
				<div className="flex justify-between items-start mb-3">
					<div>
						<p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
							Market Return &amp; Breadth
						</p>
						<h2 className="text-3xl font-black text-slate-900 mt-1 tracking-tight tabular-nums">
							{marketReturn > 0 ? "+" : ""}
							{marketReturn.toFixed(2)}%
						</h2>
					</div>
					<div
						className={`p-3 rounded-2xl ${
							marketReturn >= 0
								? "bg-emerald-50 text-emerald-600 border border-emerald-100"
								: "bg-rose-50 text-rose-600 border border-rose-100"
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
					<div className="flex items-center justify-between text-[10px] font-bold">
						<span className="text-emerald-600 font-extrabold">
							{advancers} Up ({advPct}%)
						</span>
						<span className="text-slate-400">{unchanged} Flat</span>
						<span className="text-rose-600 font-extrabold">
							{decliners} Down
						</span>
					</div>
				</div>
			</motion.div>

			{/* Market Composite Score (Pure White Container Standard) */}
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.05 }}
				className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
			>
				<div className="flex justify-between items-start mb-4">
					<div>
						<p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
							Market Composite Score
						</p>
						<h2 className="text-3xl font-black text-slate-900 mt-1 tracking-tight tabular-nums">
							{sentimentScore}{" "}
							<span className="text-sm font-semibold text-slate-400">
								/ 100
							</span>
						</h2>
					</div>
					<div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
						<Activity className="w-5 h-5" />
					</div>
				</div>
				<div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
					<span
						className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
							sentimentScore >= 60
								? "bg-emerald-50 text-emerald-700 border-emerald-200"
								: sentimentScore <= 40
									? "bg-rose-50 text-rose-700 border-rose-200"
									: "bg-amber-50 text-amber-700 border-amber-200"
						}`}
					>
						{sentimentLabel}
					</span>
					<span className="text-[10px] font-bold text-slate-400">
						Microstructure Index
					</span>
				</div>
			</motion.div>

			{/* Foreign Net Flow (Dual Value & Volume) */}
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
			>
				<div className="flex justify-between items-start mb-4">
					<div>
						<div className="flex items-center gap-1.5">
							<p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
								Foreign Net Flow
							</p>
							<span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.2 rounded">
								Regular
							</span>
						</div>
						<h2
							className={`text-3xl font-black mt-1 tracking-tight ${
								netForeignValue > 0 ? "text-emerald-600" : "text-rose-600"
							}`}
						>
							{netForeignValue > 0 ? "+" : ""}
							{formatBillions(netForeignValue)}
						</h2>
						<p className="text-[11px] font-bold text-slate-500 mt-0.5">
							{netForeignVolume < 0 ? "Net Sell" : "Net Buy"}:{" "}
							<span
								className={`font-black ${
									netForeignVolume < 0 ? "text-rose-600" : "text-emerald-600"
								}`}
							>
								{formatBillions(netForeignVolume)}
							</span>{" "}
							vol
						</p>
					</div>
					<div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
						<Globe className="w-5 h-5" />
					</div>
				</div>
				<div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
					<span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
						Value (Rp)
					</span>
					<span
						className={`text-[10px] font-extrabold ${
							netForeignVolume < 0 ? "text-rose-600" : "text-emerald-600"
						}`}
					>
						Regular: {formatBillions(netForeignVolume)}
					</span>
				</div>
			</motion.div>

			{/* Total Turnover */}
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.15 }}
				className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
			>
				<div className="flex justify-between items-start mb-4">
					<div>
						<p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
							Total Turnover
						</p>
						<h2 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
							{formatTrillions(totalValue)}
						</h2>
					</div>
					<div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600">
						<Coins className="w-5 h-5" />
					</div>
				</div>
				<div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
					<span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
						Value (IDR)
					</span>
					<span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
						<BarChart2 className="w-3.5 h-3.5 text-slate-400" />
						{formatBillions(totalVolume, 1)} Vol
					</span>
				</div>
			</motion.div>
		</div>
	);
}
