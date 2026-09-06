"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Scale } from "lucide-react";

interface MarketBreadthProps {
	advancers: number;
	decliners: number;
	unchanged: number;
}

export default function MarketBreadth({
	advancers,
	decliners,
	unchanged,
}: MarketBreadthProps) {
	const reduceMotion = useReducedMotion();
	const total = advancers + decliners + unchanged;
	const advPct = total > 0 ? (advancers / total) * 100 : 0;
	const decPct = total > 0 ? (decliners / total) * 100 : 0;
	const uncPct = total > 0 ? (unchanged / total) * 100 : 0;

	return (
		<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
			<div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
				<div className="flex items-center gap-2.5">
					<div className="p-2 rounded-xl bg-slate-100 text-slate-700">
						<Scale className="w-4 h-4" />
					</div>
					<div>
						<h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
							Market Breadth
						</h3>
						<p className="text-[10px] font-bold text-slate-400">
							Advance vs Decline Ratio
						</p>
					</div>
				</div>
				<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
					{total} Stocks
				</span>
			</div>

			{/* Stacked Ratio Bar */}
			<div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex mb-5 p-0.5">
				<div
					style={{ width: `${advPct}%` }}
					className="bg-emerald-500 h-full rounded-l-full transition-all"
					title={`Advancers: ${advPct.toFixed(1)}%`}
				/>
				<div
					style={{ width: `${uncPct}%` }}
					className="bg-slate-300 h-full transition-all"
					title={`Unchanged: ${uncPct.toFixed(1)}%`}
				/>
				<div
					style={{ width: `${decPct}%` }}
					className="bg-rose-500 h-full rounded-r-full transition-all"
					title={`Decliners: ${decPct.toFixed(1)}%`}
				/>
			</div>

			<div className="space-y-3.5">
				{/* Advancers */}
				<div>
					<div className="flex justify-between items-end mb-1">
						<span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
							<span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
							Advancers
						</span>
						<span className="text-xs font-black text-slate-900">
							{advancers}{" "}
							<span className="text-[10px] text-slate-400 font-bold ml-1">
								({advPct.toFixed(1)}%)
							</span>
						</span>
					</div>
					<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
						<motion.div
							initial={reduceMotion ? false : { width: 0 }}
							animate={{ width: `${advPct}%` }}
							className="h-full bg-emerald-500 rounded-full"
						/>
					</div>
				</div>

				{/* Decliners */}
				<div>
					<div className="flex justify-between items-end mb-1">
						<span className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
							<span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
							Decliners
						</span>
						<span className="text-xs font-black text-slate-900">
							{decliners}{" "}
							<span className="text-[10px] text-slate-400 font-bold ml-1">
								({decPct.toFixed(1)}%)
							</span>
						</span>
					</div>
					<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
						<motion.div
							initial={reduceMotion ? false : { width: 0 }}
							animate={{ width: `${decPct}%` }}
							className="h-full bg-rose-500 rounded-full"
						/>
					</div>
				</div>

				{/* Unchanged */}
				<div>
					<div className="flex justify-between items-end mb-1">
						<span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
							<span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
							Unchanged
						</span>
						<span className="text-xs font-black text-slate-900">
							{unchanged}{" "}
							<span className="text-[10px] text-slate-400 font-bold ml-1">
								({uncPct.toFixed(1)}%)
							</span>
						</span>
					</div>
					<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
						<motion.div
							initial={reduceMotion ? false : { width: 0 }}
							animate={{ width: `${uncPct}%` }}
							className="h-full bg-slate-400 rounded-full"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
