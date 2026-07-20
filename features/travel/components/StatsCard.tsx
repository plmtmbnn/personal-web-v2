"use client";

import { motion, useReducedMotion } from "framer-motion";

const StatsCard = ({ visited, total }: { visited: number; total: number }) => {
	const reduceMotion = useReducedMotion();
	const percentage = total > 0 ? Math.round((visited / total) * 100) : 0;

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-white border border-slate-200 rounded-3xl p-8 mb-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8"
		>
			<div className="space-y-2 text-center md:text-left">
				<h2 className="text-slate-500 text-sm font-bold uppercase tracking-widest">
					Adventure Progress
				</h2>
				<div className="flex items-baseline gap-2">
					<span className="text-5xl font-black text-slate-900">{visited}</span>
					<span className="text-slate-400 font-bold">
						/ {total} Places Explored
					</span>
				</div>
			</div>

			<div className="w-full md:w-1/2 space-y-3">
				<div className="flex justify-between text-sm font-bold">
					<span className="text-slate-600">Completion</span>
					<span className="text-emerald-600">{percentage}%</span>
				</div>
				<div className="h-4 bg-slate-100 rounded-full overflow-hidden">
					<motion.div
						initial={reduceMotion ? false : { width: 0 }}
						animate={{ width: `${percentage}%` }}
						transition={{ duration: 1.5, ease: "easeOut" }}
						className="h-full bg-emerald-500 rounded-full"
					/>
				</div>
			</div>
		</motion.div>
	);
};

export default StatsCard;
