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
} from "lucide-react";
import Link from "next/link";

/**
 * Personal Bests Data
 */
const personalBests = [
	{
		distance: "5K",
		time: "22:45",
		date: "2023",
		icon: Flame,
		color: "text-orange-400",
	},
	{
		distance: "10K",
		time: "48:12",
		date: "2023",
		icon: Zap,
		color: "text-yellow-400",
	},
	{
		distance: "Half Marathon",
		time: "1:52:30",
		date: "2024",
		icon: Milestone,
		color: "text-emerald-400",
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
				{/* Breadcrumb & Navigation */}
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
						<h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground">
							Endurance <span className="gradient-text">Journey</span>
						</h1>
						<p className="text-muted-foreground text-lg max-w-xl font-medium leading-relaxed">
							Miles logged, boundaries pushed. For me, running is the ultimate
							feedback loop for discipline, consistency, and mental clarity.
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
								KM / Year
							</p>
						</div>
						<div className="w-px h-10 bg-white/10 self-center" />
						<div className="text-center">
							<p className="text-2xl font-black text-foreground">450+</p>
							<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
								Activities
							</p>
						</div>
					</motion.div>
				</div>

				{/* Strava Live Integration Card */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.7 }}
					className="group relative mb-12"
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
										Real-time Activity Stream
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
								<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
								<span className="text-[10px] font-black uppercase tracking-widest">
									Strava Live
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

				{/* Grid: Personal Bests & Philosophy */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Personal Bests (LHS) */}
					<div className="lg:col-span-7 space-y-8">
						<h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4 flex items-center gap-3">
							<Trophy className="w-4 h-4" /> Personal Milestones
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							{personalBests.map((pb, idx) => (
								<motion.div
									key={pb.distance}
									initial={{ opacity: 0, x: -20 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ delay: 0.4 + idx * 0.1 }}
									className="p-6 glass-card border-2 border-white/5 rounded-3xl bg-white/5 hover:border-emerald-500/20 transition-all group"
								>
									<pb.icon
										className={`w-5 h-5 ${pb.color} mb-4 group-hover:scale-110 transition-transform`}
									/>
									<p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
										{pb.distance}
									</p>
									<p className="text-2xl font-black text-foreground tracking-tighter">
										{pb.time}
									</p>
									<p className="text-[10px] font-bold text-muted-foreground/40 mt-3">
										{pb.date} Season
									</p>
								</motion.div>
							))}
						</div>
					</div>

					{/* Philosophy (RHS) */}
					<div className="lg:col-span-5 space-y-8">
						<h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4 flex items-center gap-3">
							<Brain className="w-4 h-4" /> Running Mindset
						</h3>
						<div className="space-y-4">
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ delay: 0.6 }}
								className="p-6 glass-card border-2 border-white/5 rounded-3xl bg-white/5 flex items-start gap-5 hover:border-accent/30 transition-all"
							>
								<div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 flex-shrink-0">
									<Timer className="w-5 h-5" />
								</div>
								<div>
									<h4 className="font-bold text-foreground mb-1">
										Unwavering Consistency
									</h4>
									<p className="text-xs text-muted-foreground leading-relaxed font-medium">
										Since 2020, I've maintained a baseline of 1000KM+ yearly.
										Discipline in the morning predicts success in the afternoon.
									</p>
								</div>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ delay: 0.7 }}
								className="p-6 glass-card border-2 border-white/5 rounded-3xl bg-white/5 flex items-start gap-5 hover:border-accent/30 transition-all"
							>
								<div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0">
									<Brain className="w-5 h-5" />
								</div>
								<div>
									<h4 className="font-bold text-foreground mb-1">
										Problem Solving Zone
									</h4>
									<p className="text-xs text-muted-foreground leading-relaxed font-medium">
										Running is my moving meditation. It's where I solve my
										toughest architectural challenges and debug complex systems.
									</p>
								</div>
							</motion.div>
						</div>
					</div>
				</div>

				{/* Closing CTA / Final Quote */}
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					transition={{ delay: 0.8 }}
					className="mt-32 text-center"
				>
					<div className="inline-block p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm px-6 py-3">
						<span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500/60">
							Fuelled by Endorphins • Optimized by Code
						</span>
					</div>
				</motion.div>
			</div>
		</main>
	);
}
