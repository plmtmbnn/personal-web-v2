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

interface HeroOverviewProps {
	marketHealth: {
		avgReturn: number;
		sentimentScore: number;
		sentimentLabel: string;
		netForeign: number;
		totalVolume: number;
		totalValue: number;
		advancers: number;
		decliners: number;
		unchanged: number;
	};
}

export default function HeroOverview({ marketHealth }: HeroOverviewProps) {
	const reduceMotion = useReducedMotion();
	const {
		avgReturn,
		sentimentScore,
		sentimentLabel,
		netForeign,
		totalVolume,
		totalValue,
		advancers,
		decliners,
	} = marketHealth;

	const formatBillions = (val: number) => `${(val / 1e9).toFixed(1)}B`;
	const formatTrillions = (val: number) => `${(val / 1e12).toFixed(1)}T`;

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{/* IHSG Return */}
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
			>
				<div className="flex justify-between items-start mb-4">
					<div>
						<p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
							Market Return (Avg)
						</p>
						<h2 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
							{avgReturn > 0 ? "+" : ""}
							{avgReturn.toFixed(2)}%
						</h2>
					</div>
					<div
						className={`p-3 rounded-2xl ${
							avgReturn >= 0
								? "bg-emerald-50 text-emerald-600 border border-emerald-100"
								: "bg-rose-50 text-rose-600 border border-rose-100"
						}`}
					>
						{avgReturn >= 0 ? (
							<TrendingUp className="w-5 h-5" />
						) : (
							<TrendingDown className="w-5 h-5" />
						)}
					</div>
				</div>
				<div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
					<span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
						IHSG Proxy
					</span>
					<span className="text-[10px] font-bold text-slate-400">
						{advancers} Up · {decliners} Down
					</span>
				</div>
			</motion.div>

			{/* Market Composite Score */}
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.05 }}
				className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-md flex flex-col justify-between text-white"
			>
				<div className="flex justify-between items-start mb-4">
					<div>
						<p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
							Market Score
						</p>
						<h2 className="text-3xl font-black text-white mt-1 tracking-tight">
							{sentimentScore}{" "}
							<span className="text-sm font-semibold text-slate-400">
								/ 100
							</span>
						</h2>
					</div>
					<div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-indigo-400">
						<Activity className="w-5 h-5" />
					</div>
				</div>
				<div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800">
					<span
						className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
							sentimentScore >= 60
								? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
								: sentimentScore <= 40
									? "bg-rose-500/10 text-rose-400 border-rose-500/30"
									: "bg-amber-500/10 text-amber-400 border-amber-500/30"
						}`}
					>
						{sentimentLabel}
					</span>
					<span className="text-[10px] font-bold text-slate-400">
						Real-Time Index
					</span>
				</div>
			</motion.div>

			{/* Foreign Net Flow */}
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
			>
				<div className="flex justify-between items-start mb-4">
					<div>
						<p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
							Foreign Net Flow
						</p>
						<h2
							className={`text-3xl font-black mt-1 tracking-tight ${
								netForeign > 0 ? "text-emerald-600" : "text-rose-600"
							}`}
						>
							{netForeign > 0 ? "+" : ""}
							{formatBillions(netForeign)}
						</h2>
					</div>
					<div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
						<Globe className="w-5 h-5" />
					</div>
				</div>
				<div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
					<span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
						IDR (Billions)
					</span>
					<span className="text-[10px] font-bold text-slate-400">
						{netForeign > 0 ? "Accumulation" : "Net Selling"}
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
						{formatBillions(totalVolume)} Vol
					</span>
				</div>
			</motion.div>
		</div>
	);
}
