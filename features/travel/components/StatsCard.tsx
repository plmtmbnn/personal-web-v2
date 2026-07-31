"use client";

import { motion, useReducedMotion } from "framer-motion";

interface StatsCardProps {
	visited: number;
	total: number;
}

export default function StatsCard({ visited, total }: StatsCardProps) {
	const reduceMotion = useReducedMotion();
	const safeReduceMotion = reduceMotion !== null && reduceMotion !== undefined;
	const percentage = total > 0 ? Math.round((visited / total) * 100) : 0;

	// SVG ring calculations
	const radius = 45;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	const getRingColor = (pct: number) => {
		if (pct >= 80) return "stroke-emerald-500";
		if (pct >= 50) return "stroke-blue-500";
		if (pct >= 30) return "stroke-amber-500";
		return "stroke-slate-400";
	};

	return (
		<motion.div
			initial={safeReduceMotion ? false : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", stiffness: 350, damping: 30 }}
			className="bg-white border border-slate-200 rounded-[2.5rem] p-8 sm:p-10 shadow-sm"
		>
			<div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
				{/* Left: Ring Progress Visualization */}
				<div className="relative w-40 h-40 flex-shrink-0">
					<svg
						width="160"
						height="160"
						viewBox="0 0 120 120"
						className="transform -rotate-90"
					>
						{/* Background circle */}
						<circle
							cx="60"
							cy="60"
							r={radius}
							fill="none"
							stroke="currentColor"
							strokeWidth="10"
							className="text-slate-100"
						/>
						{/* Progress arc */}
						<motion.circle
							cx="60"
							cy="60"
							r={radius}
							fill="none"
							strokeWidth="10"
							strokeLinecap="round"
							initial={{
								strokeDasharray: circumference,
								strokeDashoffset: circumference,
							}}
							animate={{ strokeDashoffset: strokeDashoffset }}
							transition={{
								type: "spring",
								stiffness: 350,
								damping: 30,
								duration: 1.5,
							}}
							className={getRingColor(percentage)}
							style={{
								strokeDasharray: circumference,
								strokeDashoffset: strokeDashoffset,
							}}
						/>
					</svg>
					{/* Center content */}
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<span className="text-3xl font-black text-slate-900">
							{visited}
						</span>
						<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
							exploded
						</span>
					</div>
				</div>

				{/* Right: Stats Grid */}
				<div className="flex-1 w-full space-y-6">
					<div className="space-y-2">
						<h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest">
							Adventure Progress
						</h3>
						<div className="flex items-baseline gap-2">
							<span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">
								{visited}
							</span>
							<span className="text-slate-400 font-bold text-lg">
								/ {total} places explored
							</span>
						</div>
					</div>

					{/* Progress bar */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm font-bold">
							<span className="text-slate-600">Completion Rate</span>
							<span
								className={`font-black ${
									percentage >= 80
										? "text-emerald-600"
										: percentage >= 50
											? "text-blue-600"
											: percentage >= 30
												? "text-amber-600"
												: "text-slate-600"
								}`}
							>
								{percentage}%
							</span>
						</div>
						<div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
							<motion.div
								initial={safeReduceMotion ? false : { width: 0 }}
								animate={{ width: `${percentage}%` }}
								transition={{
									type: "spring",
									stiffness: 350,
									damping: 30,
									delay: 0.3,
								}}
								className={`h-full rounded-full ${
									percentage >= 80
										? "bg-emerald-500"
										: percentage >= 50
											? "bg-blue-500"
											: percentage >= 30
												? "bg-amber-500"
												: "bg-slate-400"
								}`}
							/>
						</div>
					</div>

					{/* Stats pills */}
					<div className="grid grid-cols-2 gap-3">
						<div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
							<p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">
								Visited
							</p>
							<p className="text-lg font-black text-emerald-700">{visited}</p>
						</div>
						<div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
							<p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
								Remaining
							</p>
							<p className="text-lg font-black text-slate-700">
								{total - visited}
							</p>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
