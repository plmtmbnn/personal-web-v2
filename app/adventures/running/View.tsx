"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	Trophy,
	Zap,
	Activity,
	ArrowLeft,
	Route,
	Flame,
	Milestone,
	Gauge,
	Mountain,
} from "lucide-react";
import Link from "next/link";

/**
 * Personal Bests Data - Updated with user performance
 */
const personalBests = [
	{
		distance: "5K",
		time: "25:45",
		pace: "5:09/km",
		icon: Flame,
		color: "text-orange-400",
	},
	{
		distance: "10K",
		time: "54:42",
		pace: "5:28/km",
		icon: Zap,
		color: "text-yellow-400",
	},
	{
		distance: "Half Marathon",
		time: "2:05:37",
		pace: "5:57/km",
		icon: Milestone,
		color: "text-emerald-400",
	},
	{
		distance: "Marathon",
		time: "4:30:29",
		pace: "6:24/km",
		icon: Trophy,
		color: "text-blue-400",
	},
	{
		distance: "Ultra Trail (65.9k)",
		time: "19:40:28",
		pace: "17:55/km",
		elevation: "2,982 m",
		icon: Mountain,
		color: "text-purple-400",
	},
];

export default function RunningPage() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<main className="min-h-screen bg-background relative overflow-hidden flex items-center py-16 lg:py-0">
			{/* Aesthetic Background Ambience */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-5%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[60%] bg-teal-500/5 rounded-full blur-[120px]" />
			</div>

			<div className="max-w-6xl w-full mx-auto px-6">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
					{/* ═══════════════════════════════════════
					    LEFT COLUMN: Header & Quick Stats
					═══════════════════════════════════════ */}
					<div className="lg:col-span-5 space-y-6">
						{/* Breadcrumb */}
						<motion.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
						>
							<Link
								href="/adventures"
								className="inline-flex items-center text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-emerald-500 transition-colors gap-2 group"
							>
								<ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
								Back to Adventures
							</Link>
						</motion.div>

						{/* Header Content */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="space-y-4"
						>
							<div className="flex items-center gap-2.5 text-emerald-500">
								<Activity className="w-5 h-5" />
								<span className="text-[9px] font-black uppercase tracking-[0.4em]">
									Performance Hub
								</span>
							</div>
							<h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-foreground leading-[0.95]">
								Endurance <span className="gradient-text">Journey</span>
							</h1>
							<p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-md">
								Tracking physical limits and mental discipline. Running is the
								ultimate feedback loop for consistency and resilience in both
								engineering and life.
							</p>
						</motion.div>

						{/* Quick Stats Cards */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.15 }}
							className="grid grid-cols-2 gap-4 p-5 bg-white/5 border border-white/10 rounded-[1.5rem] max-w-sm backdrop-blur-md"
						>
							<div className="text-center py-1">
								<p className="text-xl sm:text-2xl font-black text-foreground">
									1,000+
								</p>
								<p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">
									Total Runs
								</p>
							</div>
							<div className="text-center py-1 border-l border-white/10">
								<p className="text-xl sm:text-2xl font-black text-foreground">
									1,000+
								</p>
								<p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">
									KM / Year
								</p>
							</div>
						</motion.div>
					</div>

					{/* ═══════════════════════════════════════
					    RIGHT COLUMN: Personal Bests
					═══════════════════════════════════════ */}
					<div className="lg:col-span-7 space-y-6">
						<motion.h3
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2"
						>
							<Trophy className="w-4 h-4 text-emerald-500" /> Personal
							Milestones
						</motion.h3>

						<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 animate-fade-in">
							{personalBests.map((pb, idx) => (
								<motion.div
									key={pb.distance}
									initial={{ opacity: 0, y: 15 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.05 * idx, duration: 0.4 }}
									className="p-5 glass-card border border-white/10 rounded-[1.8rem] bg-white/5 hover:border-emerald-500/20 transition-all group flex flex-col justify-between h-full"
								>
									<div>
										<div className="flex justify-between items-start mb-4">
											<pb.icon
												className={`w-5 h-5 ${pb.color} group-hover:scale-110 transition-transform`}
											/>
											<span className="text-[7.5px] font-black uppercase tracking-widest text-muted-foreground/30 italic">
												Record
											</span>
										</div>
										<p className="text-[8.5px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
											{pb.distance}
										</p>
										<p className="text-xl sm:text-2xl font-black text-foreground tracking-tighter leading-none">
											{pb.time}
										</p>
									</div>

									<div className="mt-6 pt-4 border-t border-white/5 space-y-2">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-1.5">
												<Gauge className="w-3 h-3 text-emerald-500/60" />
												<span className="text-[10px] font-bold text-foreground/80 leading-none">
													{pb.pace}
												</span>
											</div>
											<span className="text-[7.5px] font-black uppercase text-muted-foreground/30">
												Pace
											</span>
										</div>
										{pb.elevation && (
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-1.5">
													<Route className="w-3 h-3 text-emerald-500/60" />
													<span className="text-[10px] font-bold text-foreground/80 leading-none">
														{pb.elevation}
													</span>
												</div>
												<span className="text-[7.5px] font-black uppercase text-muted-foreground/30">
													Gain
												</span>
											</div>
										)}
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
