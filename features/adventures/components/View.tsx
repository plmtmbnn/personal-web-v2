"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
	Camera,
	Activity,
	Compass,
	ArrowUpRight,
	Mountain,
	Trophy,
	MapPin,
	Sparkles,
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
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden py-20 pb-32 sm:py-24 sm:pb-36 px-4 sm:px-6 lg:px-8">
			<div className="max-w-6xl mx-auto space-y-8 sm:space-y-10 pt-4 sm:pt-6">
				{/* Hero Header */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4"
				>
					<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs">
						<Compass className="w-3.5 h-3.5 text-indigo-600" />
						<span>Life in Motion & Explorations</span>
					</div>

					<h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
						Personal <span className="text-indigo-600">Adventures.</span>
					</h1>

					<p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl mx-auto">
						Exploring the intersection of endurance, discipline, and aesthetics.
						A collection of distance running logs, telemetry benchmarks, and
						curated global travel journeys.
					</p>
				</motion.div>

				{/* Telemetry Summary Stats Row */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto"
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
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
									{stat.label}
								</p>
								<p className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
									{stat.value}
								</p>
								<p className="text-[10px] text-slate-400 font-medium truncate">
									{stat.sublabel}
								</p>
							</div>
						</div>
					))}
				</motion.div>

				{/* Two Main Domain Cards Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
					{/* Running Adventure Card */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.15, duration: 0.5 }}
						whileHover={{ y: -4 }}
					>
						<Link
							href="/adventures/running"
							className="group block relative p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200/80 hover:border-emerald-300 transition-all duration-300 shadow-xs hover:shadow-md overflow-hidden !no-underline h-full flex flex-col justify-between"
						>
							<div className="space-y-5">
								{/* Header & Icon */}
								<div className="flex items-start justify-between">
									<div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
										<Activity className="w-6 h-6" />
									</div>
									<div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-700">
										<Sparkles className="w-3 h-3 text-emerald-600" />
										<span>Strava Sync</span>
									</div>
								</div>

								{/* Title & Description */}
								<div className="space-y-1.5">
									<h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
										Running Performance
									</h2>
									<p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
										Endurance training logs, race benchmarks, and mountain trail
										milestones with live split pacing telemetry and Instagram
										canvas exports.
									</p>
								</div>

								{/* Benchmark Milestones Snapshot */}
								<div className="grid grid-cols-3 gap-2 p-3 bg-slate-50/70 rounded-2xl border border-slate-200/70 text-center">
									<div className="p-1.5">
										<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
											5K Pace
										</p>
										<p className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono">
											25:45
										</p>
										<p className="text-[10px] text-slate-400 font-medium">
											5:09/km
										</p>
									</div>
									<div className="p-1.5 border-x border-slate-200/60">
										<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
											Marathon
										</p>
										<p className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono">
											4:30:29
										</p>
										<p className="text-[10px] text-slate-400 font-medium">
											42.2K
										</p>
									</div>
									<div className="p-1.5">
										<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
											Ultra Trail
										</p>
										<p className="text-xs sm:text-sm font-extrabold text-purple-700 font-mono">
											65.9 km
										</p>
										<p className="text-[10px] text-slate-400 font-medium">
											2,982m Gain
										</p>
									</div>
								</div>

								{/* Feature Highlights Chips */}
								<div className="flex flex-wrap gap-1.5 pt-1">
									<span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1">
										<Timer className="w-3 h-3 text-slate-500" />
										<span>Split Pacing</span>
									</span>
									<span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1">
										<Trophy className="w-3 h-3 text-amber-500" />
										<span>PB Swipe Card</span>
									</span>
									<span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1">
										<ImageIcon className="w-3 h-3 text-emerald-600" />
										<span>Canvas Sticker Export</span>
									</span>
								</div>
							</div>

							{/* Card Action Link */}
							<div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
								<span className="text-xs font-bold text-emerald-700 group-hover:text-emerald-800 transition-colors">
									View Running Logs & Milestones
								</span>
								<div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
									<ArrowUpRight className="w-4 h-4" />
								</div>
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
							className="group block relative p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-xs hover:shadow-md overflow-hidden !no-underline h-full flex flex-col justify-between"
						>
							<div className="space-y-5">
								{/* Header & Icon */}
								<div className="flex items-start justify-between">
									<div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
										<Camera className="w-6 h-6" />
									</div>
									<div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-bold text-indigo-700">
										<Sparkles className="w-3 h-3 text-indigo-600" />
										<span>Postcard Studio</span>
									</div>
								</div>

								{/* Title & Description */}
								<div className="space-y-1.5">
									<h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors">
										Travel Bucket List
									</h2>
									<p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
										Curated global destinations, cultural memories, and vintage
										airmail postcard generators with 3D flip polaroid sticker
										exports.
									</p>
								</div>

								{/* Travel Exploration Snapshot */}
								<div className="grid grid-cols-3 gap-2 p-3 bg-slate-50/70 rounded-2xl border border-slate-200/70 text-center">
									<div className="p-1.5">
										<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
											Completed
										</p>
										<p className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono">
											10+ Cities
										</p>
										<p className="text-[10px] text-slate-400 font-medium">
											Logged
										</p>
									</div>
									<div className="p-1.5 border-x border-slate-200/60">
										<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
											Regions
										</p>
										<p className="text-xs sm:text-sm font-extrabold text-indigo-700 font-mono">
											3 Countries
										</p>
										<p className="text-[10px] text-slate-400 font-medium">
											ID, TH, SG
										</p>
									</div>
									<div className="p-1.5">
										<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
											Postcards
										</p>
										<p className="text-xs sm:text-sm font-extrabold text-purple-700 font-mono">
											3D Flip
										</p>
										<p className="text-[10px] text-slate-400 font-medium">
											Vintage PNG
										</p>
									</div>
								</div>

								{/* Feature Highlights Chips */}
								<div className="flex flex-wrap gap-1.5 pt-1">
									<span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1">
										<Layers className="w-3 h-3 text-slate-500" />
										<span>3D Flip Postcards</span>
									</span>
									<span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1">
										<MapPin className="w-3 h-3 text-indigo-600" />
										<span>Wishlist Tracker</span>
									</span>
									<span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1">
										<ImageIcon className="w-3 h-3 text-purple-600" />
										<span>Polaroid PNG Export</span>
									</span>
								</div>
							</div>

							{/* Card Action Link */}
							<div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
								<span className="text-xs font-bold text-indigo-700 group-hover:text-indigo-800 transition-colors">
									Explore Travel Tracker & Postcards
								</span>
								<div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
									<ArrowUpRight className="w-4 h-4" />
								</div>
							</div>
						</Link>
					</motion.div>
				</div>
			</div>
		</main>
	);
}
