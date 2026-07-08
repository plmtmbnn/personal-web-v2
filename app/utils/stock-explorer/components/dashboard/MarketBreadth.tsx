import { motion } from "framer-motion";

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
	const total = advancers + decliners + unchanged;
	const advPct = total > 0 ? (advancers / total) * 100 : 0;
	const decPct = total > 0 ? (decliners / total) * 100 : 0;
	const uncPct = total > 0 ? (unchanged / total) * 100 : 0;

	return (
		<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
			<h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
				Market Breadth
			</h3>

			<div className="space-y-4">
				{/* Advancers */}
				<div>
					<div className="flex justify-between items-end mb-1.5">
						<span className="text-xs font-bold text-emerald-600">
							Advancers
						</span>
						<span className="text-sm font-black text-slate-900">
							{advancers}{" "}
							<span className="text-[10px] text-slate-400 font-bold ml-1">
								({advPct.toFixed(1)}%)
							</span>
						</span>
					</div>
					<div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
						<motion.div
							initial={{ width: 0 }}
							animate={{ width: `${advPct}%` }}
							className="h-full bg-emerald-500 rounded-full"
						/>
					</div>
				</div>

				{/* Decliners */}
				<div>
					<div className="flex justify-between items-end mb-1.5">
						<span className="text-xs font-bold text-rose-600">Decliners</span>
						<span className="text-sm font-black text-slate-900">
							{decliners}{" "}
							<span className="text-[10px] text-slate-400 font-bold ml-1">
								({decPct.toFixed(1)}%)
							</span>
						</span>
					</div>
					<div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
						<motion.div
							initial={{ width: 0 }}
							animate={{ width: `${decPct}%` }}
							className="h-full bg-rose-500 rounded-full"
						/>
					</div>
				</div>

				{/* Unchanged */}
				<div>
					<div className="flex justify-between items-end mb-1.5">
						<span className="text-xs font-bold text-slate-500">Unchanged</span>
						<span className="text-sm font-black text-slate-900">
							{unchanged}{" "}
							<span className="text-[10px] text-slate-400 font-bold ml-1">
								({uncPct.toFixed(1)}%)
							</span>
						</span>
					</div>
					<div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
						<motion.div
							initial={{ width: 0 }}
							animate={{ width: `${uncPct}%` }}
							className="h-full bg-slate-400 rounded-full"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
