"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Compass, Sparkles, Star } from "lucide-react";

interface StatsCardProps {
	visited: number;
	total: number;
}

export default function StatsCard({ visited, total }: StatsCardProps) {
	const reduceMotion = useReducedMotion();
	const percentage = total > 0 ? Math.round((visited / total) * 100) : 0;
	const remaining = Math.max(0, total - visited);

	// Ring calculations
	const radius = 32;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", stiffness: 350, damping: 30 }}
			className="bg-white border border-slate-200/80 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-7 shadow-xl shadow-slate-200/40 relative overflow-hidden"
		>
			<div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 lg:gap-8">
				{/* Left: Compact Ring + Milestone Narrative */}
				<div className="flex items-center gap-5 sm:gap-6 w-full lg:w-auto min-w-0">
					{/* Precision Progress Ring */}
					<div className="relative w-20 h-20 shrink-0">
						<svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
							<circle
								cx="40"
								cy="40"
								r={radius}
								fill="none"
								stroke="currentColor"
								strokeWidth="6"
								className="text-slate-100"
							/>
							<motion.circle
								cx="40"
								cy="40"
								r={radius}
								fill="none"
								strokeWidth="6"
								strokeLinecap="round"
								initial={
									reduceMotion
										? false
										: {
												strokeDasharray: circumference,
												strokeDashoffset: circumference,
											}
								}
								animate={{ strokeDashoffset }}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 30,
									delay: 0.2,
								}}
								className="text-emerald-600"
								style={{
									strokeDasharray: circumference,
									strokeDashoffset,
								}}
							/>
						</svg>
						<div className="absolute inset-0 flex flex-col items-center justify-center">
							<span className="text-base font-black text-slate-900 leading-none">
								{percentage}%
							</span>
							<span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 mt-0.5">
								Done
							</span>
						</div>
					</div>

					{/* Title & Description */}
					<div className="space-y-1 min-w-0">
						<div className="flex items-center gap-2">
							<span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
								<Sparkles className="w-3 h-3 text-emerald-600" />
								Exploration Progress
							</span>
						</div>
						<h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
							{visited}{" "}
							<span className="text-slate-400 font-bold text-base sm:text-lg">
								/ {total} destinations explored
							</span>
						</h3>
						<p className="text-xs text-slate-500 font-medium line-clamp-1">
							{remaining === 0
								? "All bucket list destinations achieved! World unlocked."
								: `${remaining} more planned adventures waiting to be charted.`}
						</p>
					</div>
				</div>

				{/* Divider for Desktop */}
				<div className="hidden lg:block w-px self-stretch bg-slate-200/80 my-1 shrink-0" />

				{/* Right: Classy Metric Tiles & Progress bar */}
				<div className="w-full lg:w-auto lg:min-w-[340px] xl:min-w-[380px] space-y-3">
					{/* Stat Tiles */}
					<div className="grid grid-cols-3 gap-2.5 sm:gap-3">
						<div className="p-3 bg-emerald-50/70 border border-emerald-100/80 rounded-2xl min-w-0">
							<div className="flex items-center gap-1 text-emerald-700 mb-1 truncate">
								<CheckCircle2 className="w-3 h-3 text-emerald-600 stroke-[2.5] shrink-0" />
								<span className="text-[9px] font-extrabold uppercase tracking-wider truncate">
									Explored
								</span>
							</div>
							<p className="text-lg sm:text-xl font-black text-emerald-900 leading-none">
								{visited}
							</p>
						</div>

						<div className="p-3 bg-amber-50/70 border border-amber-100/80 rounded-2xl min-w-0">
							<div className="flex items-center gap-1 text-amber-700 mb-1 truncate">
								<Star className="w-3 h-3 text-amber-600 fill-amber-600 shrink-0" />
								<span className="text-[9px] font-extrabold uppercase tracking-wider truncate">
									Wishlist
								</span>
							</div>
							<p className="text-lg sm:text-xl font-black text-amber-900 leading-none">
								{remaining}
							</p>
						</div>

						<div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl min-w-0">
							<div className="flex items-center gap-1 text-slate-300 mb-1 truncate">
								<Compass className="w-3 h-3 text-emerald-400 shrink-0" />
								<span className="text-[9px] font-extrabold uppercase tracking-wider truncate">
									Rate
								</span>
							</div>
							<p className="text-lg sm:text-xl font-black text-white leading-none">
								{percentage}%
							</p>
						</div>
					</div>

					{/* Sleek Gradient Progress Bar */}
					<div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
						<motion.div
							initial={reduceMotion ? false : { width: 0 }}
							animate={{ width: `${percentage}%` }}
							transition={{
								type: "spring",
								stiffness: 300,
								damping: 30,
								delay: 0.3,
							}}
							className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 rounded-full"
						/>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
