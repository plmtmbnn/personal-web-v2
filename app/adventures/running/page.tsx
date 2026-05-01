"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	Timer,
	Trophy,
	Zap,
	Brain,
	Activity,
	ArrowLeft,
	Route,
	Flame,
	Milestone,
	Gauge,
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
];

export default function RunningPage() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<main className="min-h-screen bg-background relative overflow-hidden pb-32">
			{/* Aesthetic Background Ambience */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-5%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[60%] bg-teal-500/5 rounded-full blur-[120px]" />
			</div>

			<div className="max-w-6xl mx-auto px-6 pt-24 sm:pt-32">
				{/* Breadcrumb */}
				<motion.div
					initial={{ opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					className="mb-12"
				>
					<Link
						href="/adventures"
						className="inline-flex items-center text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-emerald-500 transition-colors gap-2 group"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to Adventures
					</Link>
				</motion.div>

				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="space-y-6"
					>
						<div className="flex items-center gap-3 text-emerald-500 mb-2">
							<Activity className="w-6 h-6" />
							<span className="text-[10px] font-black uppercase tracking-[0.4em]">
								Performance Hub
							</span>
						</div>
						<h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground leading-[0.9]">
							Endurance <span className="gradient-text">Journey</span>
						</h1>
						<p className="text-muted-foreground text-lg max-w-xl font-medium leading-relaxed">
							Tracking physical limits and mental discipline. For me, running is
							the ultimate feedback loop for consistency and resilience in
							engineering and life.
						</p>
					</motion.div>

					{/* Quick Stats Overlay */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.2 }}
						className="flex gap-4 sm:gap-8 p-6 glass-strong rounded-[2rem] border border-white/10"
					>
						<div className="text-center">
							<p className="text-2xl font-black text-foreground">1000+</p>
							<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
								Total Runs
							</p>
						</div>
						<div className="w-px h-10 bg-white/10 self-center" />
						<div className="text-center">
							<p className="text-2xl font-black text-foreground">1000+</p>
							<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
								KM / Year
							</p>
						</div>
					</motion.div>
				</div>

				{/* Training Tools - New Section */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-20"
				>
					<Link
						href="/utils/timer"
						className="group relative block p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-2 border-white/5 hover:border-rose-500/30 transition-all duration-500 shadow-2xl overflow-hidden !no-underline"
					>
						<div className="absolute -right-20 -top-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />

						<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
							<div className="flex items-center gap-6">
								<div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
									<Timer className="w-8 h-8" />
								</div>
								<div>
									<h2 className="text-3xl font-black text-foreground tracking-tight">
										Interval Timer
									</h2>
									<p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-1">
										High-Precision Training Utility
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 text-rose-400 font-black uppercase text-[10px] tracking-widest">
								Launch Tool{" "}
								<ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-2 transition-transform" />
							</div>
						</div>
					</Link>
				</motion.div>

				{/* Personal Bests Grid */}
				<div className="space-y-8 mb-20">
					<h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4 flex items-center gap-3">
						<Trophy className="w-4 h-4" /> Personal Milestones
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{personalBests.map((pb, idx) => (
							<motion.div
								key={pb.distance}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.1 * idx }}
								className="p-8 glass-card border-2 border-white/5 rounded-[2.5rem] bg-white/5 hover:border-emerald-500/20 transition-all group flex flex-col justify-between h-full"
							>
								<div>
									<div className="flex justify-between items-start mb-6">
										<pb.icon
											className={`w-6 h-6 ${pb.color} group-hover:scale-110 transition-transform`}
										/>
										<span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
											PB Entry
										</span>
									</div>
									<p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
										{pb.distance}
									</p>
									<p className="text-3xl font-black text-foreground tracking-tighter">
										{pb.time}
									</p>
								</div>

								<div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Gauge className="w-3.5 h-3.5 text-emerald-500/60" />
										<span className="text-xs font-bold text-foreground/80">
											{pb.pace}
										</span>
									</div>
									<span className="text-[9px] font-black uppercase text-muted-foreground/30">
										Avg Pace
									</span>
								</div>
							</motion.div>
						))}
					</div>
				</div>

				{/* Strava Live Integration Card */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.7 }}
					className="group relative mb-20"
				>
					<div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-500" />
					<div className="relative glass-card p-8 sm:p-10 rounded-[2.5rem] border-2 border-white/5 bg-white/5 backdrop-blur-xl hover:border-emerald-500/30 transition-all duration-500 shadow-2xl">
						<div className="flex items-center justify-between mb-10">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
									<Route className="w-6 h-6" />
								</div>
								<div>
									<h2 className="text-2xl font-black text-foreground tracking-tight">
										Weekly Summary
									</h2>
									<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
										Strava Activity Stream
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
								<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
								<span className="text-[10px] font-black uppercase tracking-widest">
									Live Sync
								</span>
							</div>
						</div>

						<div className="rounded-[1.5rem] overflow-hidden border border-white/5 bg-black/5 p-1">
							<iframe
								title="Strava Summary"
								src="https://www.strava.com/athletes/38682026/activity-summary/84e311c34f606bea25b477bc6aa3e24b84c55e33"
								height="180px"
								className="w-full grayscale-[30%] hover:grayscale-0 transition-all duration-500"
								frameBorder="0"
								scrolling="no"
								loading="lazy"
							/>
						</div>
					</div>
				</motion.div>

				{/* Philosophy Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						className="p-10 glass-card border-2 border-white/5 rounded-[3rem] bg-white/5 flex flex-col gap-6 hover:border-emerald-500/30 transition-all"
					>
						<div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
							<Brain className="w-7 h-7" />
						</div>
						<div>
							<h4 className="text-2xl font-black text-foreground mb-3">
								Moving Meditation
							</h4>
							<p className="text-muted-foreground leading-relaxed font-medium">
								Running is where I solve my toughest architectural challenges.
								The rhythm of the pace creates a unique cognitive space for
								system design and debugging.
							</p>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						className="p-10 glass-card border-2 border-white/5 rounded-[3rem] bg-white/5 flex flex-col gap-6 hover:border-emerald-500/30 transition-all"
					>
						<div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
							<Timer className="w-7 h-7" />
						</div>
						<div>
							<h4 className="text-2xl font-black text-foreground mb-3">
								Absolute Consistency
							</h4>
							<p className="text-muted-foreground leading-relaxed font-medium">
								Maintaining a high activity baseline regardless of external
								factors. Disciplined training translates directly into
								high-fidelity engineering execution.
							</p>
						</div>
					</motion.div>
				</div>
			</div>
		</main>
	);
}
