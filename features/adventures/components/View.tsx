"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
	Camera,
	Activity,
	ArrowUpRight,
	Mountain,
	Trophy,
	MapPin,
	Timer,
	Image as ImageIcon,
	Layers,
	Flame,
} from "lucide-react";

export default function AdventuresLanding() {
	const reduceMotion = useReducedMotion();

	const summaryStats = [
		{
			label: "Max Distance",
			value: "65.9 km",
			sublabel: "Ultra Trail Milestone",
			icon: Mountain,
			color: "text-purple-600 bg-purple-50 border-purple-100",
		},
		{
			label: "Max Elevation",
			value: "2,982 m",
			sublabel: "Single Peak Ascent",
			icon: Flame,
			color: "text-rose-600 bg-rose-50 border-rose-100",
		},
		{
			label: "Destinations",
			value: "10+ Cities",
			sublabel: "Domestic & Global",
			icon: MapPin,
			color: "text-indigo-600 bg-indigo-50 border-indigo-100",
		},
		{
			label: "Canvas Engines",
			value: "2 Generators",
			sublabel: "Postcards & Run Canvas",
			icon: ImageIcon,
			color: "text-emerald-600 bg-emerald-50 border-emerald-100",
		},
	];

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-24 sm:pt-32 pb-36 sm:pb-44 px-4 sm:px-6 lg:px-8">
			<div className="max-w-5xl mx-auto space-y-10 sm:space-y-14">
				{/* ═══════════════════════════════════════
				    HERO HEADER: Centered, Minimalist, Classy
				═══════════════════════════════════════ */}
				<motion.header
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center max-w-3xl mx-auto space-y-4 pt-2 sm:pt-4"
				>
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
						Personal
						<br />
						<span>adventures & journeys</span>
					</h1>

					<p className="text-slate-500 text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
						Exploring the intersection of endurance, discipline, and aesthetics.
						A collection of distance running logs, telemetry benchmarks, and
						curated global travel journeys.
					</p>
				</motion.header>

				{/* ═══════════════════════════════════════
				    TELEMETRY STATS ROW: 4 Core Milestones Strip
				═══════════════════════════════════════ */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4"
				>
					{summaryStats.map((stat) => (
						<div
							key={stat.label}
							className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3"
						>
							<div
								className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${stat.color}`}
							>
								<stat.icon className="w-4 h-4" />
							</div>
							<div className="min-w-0">
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
									{stat.label}
								</p>
								<p className="text-sm sm:text-base font-bold text-slate-900 truncate">
									{stat.value}
								</p>
								<p className="text-[10px] text-slate-500 font-normal truncate">
									{stat.sublabel}
								</p>
							</div>
						</div>
					))}
				</motion.div>

				{/* ═══════════════════════════════════════
				    TWO MAIN DOMAIN CARDS (Running & Travel)
				═══════════════════════════════════════ */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
					{/* Running Adventure Card */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.15, duration: 0.5 }}
						whileHover={{ y: -4 }}
					>
						<Link
							href="/adventures/running"
							className="group block relative p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200/80 hover:border-slate-300 transition-all duration-300 shadow-xs hover:shadow-md overflow-hidden !no-underline h-full flex flex-col justify-between"
						>
							<div>
								{/* Header & Icon */}
								<div className="flex items-center justify-between gap-4">
									<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs group-hover:scale-105 transition-transform duration-300">
										<Activity className="w-6 h-6 sm:w-7 sm:h-7" />
									</div>

									<div className="flex items-center gap-2">
										<span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
											Strava Sync
										</span>
										<div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/60 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
											<ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
										</div>
									</div>
								</div>

								{/* Title & Description */}
								<div className="mt-6 mb-4">
									<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors leading-snug">
										Running Performance
									</h2>
									<p className="mt-2 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
										Endurance training logs, race benchmarks, and mountain trail
										milestones with live split pacing telemetry and Instagram
										canvas exports.
									</p>
								</div>

								{/* Benchmark Milestones Snapshot */}
								<div className="grid grid-cols-3 divide-x divide-slate-200/60 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-center mb-5">
									<div className="px-2">
										<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
											5K Pace
										</p>
										<p className="text-sm font-bold text-slate-900 font-mono">
											25:45
										</p>
										<p className="text-[10px] text-slate-500 font-normal">
											5:09/km
										</p>
									</div>
									<div className="px-2">
										<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
											Marathon
										</p>
										<p className="text-sm font-bold text-slate-900 font-mono">
											4:30:29
										</p>
										<p className="text-[10px] text-slate-500 font-normal">
											42.2 km
										</p>
									</div>
									<div className="px-2">
										<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
											Ultra Trail
										</p>
										<p className="text-sm font-bold text-slate-900 font-mono">
											65.9 km
										</p>
										<p className="text-[10px] text-slate-500 font-normal">
											2,982m Gain
										</p>
									</div>
								</div>

								{/* Feature Highlights Chips */}
								<div className="flex flex-wrap gap-1.5">
									<span className="px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
										<Timer className="w-3.5 h-3.5 text-slate-400" />
										<span>Split Pacing</span>
									</span>
									<span className="px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
										<Trophy className="w-3.5 h-3.5 text-amber-500" />
										<span>PB Swipe Card</span>
									</span>
									<span className="px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
										<ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
										<span>Canvas Export</span>
									</span>
								</div>
							</div>

							{/* Card Action Link */}
							<div className="pt-6 mt-6 border-t border-slate-100/80 flex items-center justify-between">
								<span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
									<span>View Running Logs & Milestones</span>
									<ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
								</span>
							</div>
						</Link>
					</motion.div>

					{/* Travel Adventure Card */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.5 }}
						whileHover={{ y: -4 }}
					>
						<Link
							href="/adventures/travel"
							className="group block relative p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200/80 hover:border-slate-300 transition-all duration-300 shadow-xs hover:shadow-md overflow-hidden !no-underline h-full flex flex-col justify-between"
						>
							<div>
								{/* Header & Icon */}
								<div className="flex items-center justify-between gap-4">
									<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs group-hover:scale-105 transition-transform duration-300">
										<Camera className="w-6 h-6 sm:w-7 sm:h-7" />
									</div>

									<div className="flex items-center gap-2">
										<span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
											Postcard Studio
										</span>
										<div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/60 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
											<ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
										</div>
									</div>
								</div>

								{/* Title & Description */}
								<div className="mt-6 mb-4">
									<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-700 transition-colors leading-snug">
										Travel Bucket List
									</h2>
									<p className="mt-2 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
										Curated global destinations, cultural memories, and vintage
										airmail postcard generators with 3D flip polaroid sticker
										exports.
									</p>
								</div>

								{/* Travel Exploration Snapshot */}
								<div className="grid grid-cols-3 divide-x divide-slate-200/60 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-center mb-5">
									<div className="px-2">
										<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
											Completed
										</p>
										<p className="text-sm font-bold text-slate-900 font-mono">
											10+ Cities
										</p>
										<p className="text-[10px] text-slate-500 font-normal">
											Logged
										</p>
									</div>
									<div className="px-2">
										<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
											Regions
										</p>
										<p className="text-sm font-bold text-slate-900 font-mono">
											3 Countries
										</p>
										<p className="text-[10px] text-slate-500 font-normal">
											ID, TH, SG
										</p>
									</div>
									<div className="px-2">
										<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
											Postcards
										</p>
										<p className="text-sm font-bold text-slate-900 font-mono">
											3D Flip
										</p>
										<p className="text-[10px] text-slate-500 font-normal">
											Vintage PNG
										</p>
									</div>
								</div>

								{/* Feature Highlights Chips */}
								<div className="flex flex-wrap gap-1.5">
									<span className="px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
										<Layers className="w-3.5 h-3.5 text-slate-400" />
										<span>3D Flip Postcards</span>
									</span>
									<span className="px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
										<MapPin className="w-3.5 h-3.5 text-indigo-600" />
										<span>Wishlist Tracker</span>
									</span>
									<span className="px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
										<ImageIcon className="w-3.5 h-3.5 text-purple-600" />
										<span>Polaroid PNG</span>
									</span>
								</div>
							</div>

							{/* Card Action Link */}
							<div className="pt-6 mt-6 border-t border-slate-100/80 flex items-center justify-between">
								<span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
									<span>Explore Travel Tracker & Postcards</span>
									<ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
								</span>
							</div>
						</Link>
					</motion.div>
				</div>
			</div>
		</main>
	);
}
