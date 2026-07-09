import { motion } from "framer-motion";
import {
	TrendingUp,
	TrendingDown,
	Activity,
	Globe,
	BarChart2,
	Coins,
} from "lucide-react";
import type { ProcessedStock } from "../../types";

interface HeroOverviewProps {
	marketHealth: any;
}

export default function HeroOverview({ marketHealth }: HeroOverviewProps) {
	const {
		avgReturn,
		sentimentScore,
		sentimentLabel,
		netForeign,
		totalVolume,
		totalValue,
	} = marketHealth;

	const formatBillions = (val: number) => (val / 1000000000).toFixed(1) + "B";
	const formatTrillions = (val: number) =>
		(val / 1000000000000).toFixed(1) + "T";

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
			{/* IHSG Return */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
			>
				<div className="flex justify-between items-start mb-4">
					<div>
						<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
							Market Return (Avg)
						</p>
						<h2 className="text-3xl font-black text-slate-900 mt-1">
							{avgReturn > 0 ? "+" : ""}
							{avgReturn.toFixed(2)}%
						</h2>
					</div>
					<div
						className={`p-3 rounded-xl ${avgReturn >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
					>
						{avgReturn >= 0 ? (
							<TrendingUp className="w-6 h-6" />
						) : (
							<TrendingDown className="w-6 h-6" />
						)}
					</div>
				</div>
				<div className="mt-auto">
					<span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
						IHSG Proxy
					</span>
				</div>
			</motion.div>

			{/* Market Score */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between text-white relative overflow-hidden"
			>
				<div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
				<div className="flex justify-between items-start mb-4 relative z-10">
					<div>
						<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
							Market Score
						</p>
						<h2 className="text-3xl font-black text-white mt-1">
							{sentimentScore}{" "}
							<span className="text-sm font-medium text-slate-400">/ 100</span>
						</h2>
					</div>
					<div className="p-3 rounded-xl bg-slate-800 text-indigo-400">
						<Activity className="w-6 h-6" />
					</div>
				</div>
				<div className="mt-auto relative z-10">
					<span
						className={`text-xs font-bold px-2 py-1 rounded-md ${
							sentimentScore >= 60
								? "bg-emerald-500/20 text-emerald-400"
								: sentimentScore <= 40
									? "bg-rose-500/20 text-rose-400"
									: "bg-amber-500/20 text-amber-400"
						}`}
					>
						{sentimentLabel}
					</span>
				</div>
			</motion.div>

			{/* Foreign Flow */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
			>
				<div className="flex justify-between items-start mb-4">
					<div>
						<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
							Foreign Net Flow
						</p>
						<h2
							className={`text-3xl font-black mt-1 ${netForeign > 0 ? "text-emerald-600" : "text-rose-600"}`}
						>
							{netForeign > 0 ? "+" : ""}
							{formatBillions(netForeign)}
						</h2>
					</div>
					<div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
						<Globe className="w-6 h-6" />
					</div>
				</div>
				<div className="mt-auto">
					<span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
						IDR (Billions)
					</span>
				</div>
			</motion.div>

			{/* Volume & Value */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
			>
				<div className="flex justify-between items-start mb-4">
					<div>
						<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
							Total Transaction
						</p>
						<h2 className="text-3xl font-black text-slate-900 mt-1">
							{formatTrillions(totalValue)}
						</h2>
					</div>
					<div className="p-3 rounded-xl bg-amber-50 text-amber-600">
						<Coins className="w-6 h-6" />
					</div>
				</div>
				<div className="mt-auto flex items-center justify-between">
					<span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
						Value (IDR)
					</span>
					<span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
						<BarChart2 className="w-3 h-3" /> {formatBillions(totalVolume)} Vol
					</span>
				</div>
			</motion.div>
		</div>
	);
}
