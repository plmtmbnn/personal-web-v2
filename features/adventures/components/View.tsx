"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
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
	Route,
	Compass,
} from "lucide-react";

const cardVariants: Variants = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: "spring", stiffness: 300, damping: 24 },
	},
};

export default function AdventuresLanding() {
	const reduceMotion = useReducedMotion();

	const summaryStats = [
		{
			label: "Max Distance",
			value: "65.9 km",
			sublabel: "Ultra Trail Milestone",
			icon: Route,
			badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
		},
		{
			label: "Max Elevation",
			value: "2,982 m",
			sublabel: "Single Peak Ascent",
			icon: Mountain,
			badgeColor: "text-teal-600 bg-teal-50 border-teal-100",
		},
		{
			label: "Destinations",
			value: "10+ Cities",
			sublabel: "Domestic & Global",
			icon: MapPin,
			badgeColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
		},
		{
			label: "Canvas Engines",
			value: "2 Tools",
			sublabel: "Postcards & Run Canvas",
			icon: ImageIcon,
			badgeColor: "text-amber-600 bg-amber-50 border-amber-100",
		},
	];

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10 space-y-8 sm:space-y-10">
				{/* ── Modern Floating Card Header Standard ── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs"
				>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
						<div>
							<div className="flex items-center gap-2 mb-2">
								<div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
									<Compass className="w-3.5 h-3.5 text-emerald-600" />
								</div>
								<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
									ADVENTURES & EXPEDITIONS · ENDURANCE & GLOBAL TRAVEL
								</span>
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
								Adventures & Journeys
							</h1>
							<p className="text-sm text-slate-500 font-medium mt-1 max-w-xl">
								Exploring the intersection of physical endurance, discipline,
								and visual storytelling across running telemetry and curated
								travel journeys.
							</p>
						</div>

						{/* Telemetry Quick Strip */}
						<div className="flex items-center gap-4 sm:gap-5 shrink-0">
							<div className="text-center">
								<p className="text-xl font-extrabold text-slate-900 tabular-nums">
									65.9
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									km Max Run
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-teal-600 tabular-nums">
									2,982
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									m Vert Gain
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-indigo-600 tabular-nums">
									10+
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Cities
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-amber-600 tabular-nums">
									2
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Canvases
								</p>
							</div>
						</div>
					</div>
				</motion.div>

				{/* ── Telemetry Summary Strip (4-Col Grid) ── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
					className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
				>
					{summaryStats.map((stat) => (
						<div
							key={stat.label}
							className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5"
						>
							<div
								className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${stat.badgeColor}`}
							>
								<stat.icon className="w-5 h-5" />
							</div>
							<div className="min-w-0">
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">
									{stat.label}
								</p>
								<p className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
									{stat.value}
								</p>
								<p className="text-[11px] text-slate-500 font-medium truncate">
									{stat.sublabel}
								</p>
							</div>
						</div>
					))}
				</motion.div>

				{/* ── Two Main Domain Cards (Running & Travel) ── */}
				<motion.div
					className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7"
					initial={reduceMotion ? false : "hidden"}
					animate="visible"
					variants={{
						visible: { transition: { staggerChildren: 0.08 } },
					}}
				>
					{/* Running Adventure Card */}
					<motion.div
						variants={cardVariants}
						whileHover={reduceMotion ? undefined : { y: -3 }}
						transition={{ type: "spring", stiffness: 300, damping: 20 }}
						className="h-full"
					>
						<Link
							href="/adventures/running"
							className="group block h-full bg-white border border-slate-200/80 hover:border-emerald-200 hover:shadow-md transition-[border-color,box-shadow] duration-200 rounded-3xl p-6 sm:p-7 shadow-xs !no-underline flex flex-col justify-between"
						>
							<div>
								{/* Header & Icon */}
								<div className="flex items-center justify-between gap-3 mb-5">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform duration-200">
											<Activity className="w-6 h-6" />
										</div>
										<span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
											Strava Telemetry
										</span>
									</div>
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-full shrink-0">
										Endurance Logs
									</span>
								</div>

								{/* Title & Description */}
								<div>
									<h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors leading-snug">
										Running Performance
									</h2>
									<p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
										Endurance training logs, race benchmarks, and mountain trail
										milestones with live split pacing telemetry and Instagram
										canvas exports.
									</p>
								</div>

								{/* Benchmark Milestones Snapshot */}
								<div className="grid grid-cols-3 divide-x divide-slate-200/60 p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-center my-4">
									<div className="px-2">
										<p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
											5K Pace
										</p>
										<p className="text-sm font-extrabold text-slate-900 font-mono">
											25:45
										</p>
										<p className="text-[10px] text-slate-500 font-medium">
											5:09/km
										</p>
									</div>
									<div className="px-2">
										<p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
											Marathon
										</p>
										<p className="text-sm font-extrabold text-slate-900 font-mono">
											4:30:29
										</p>
										<p className="text-[10px] text-slate-500 font-medium">
											42.2 km
										</p>
									</div>
									<div className="px-2">
										<p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
											Ultra Trail
										</p>
										<p className="text-sm font-extrabold text-slate-900 font-mono">
											65.9 km
										</p>
										<p className="text-[10px] text-slate-500 font-medium">
											2,982m Gain
										</p>
									</div>
								</div>

								{/* Feature Highlights Chips */}
								<div className="flex flex-wrap gap-1.5">
									<span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
										<Timer className="w-3.5 h-3.5 text-emerald-600" />
										<span>Split Pacing</span>
									</span>
									<span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
										<Trophy className="w-3.5 h-3.5 text-amber-500" />
										<span>PB Swipe Card</span>
									</span>
									<span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
										<ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
										<span>Run Canvas Export</span>
									</span>
								</div>
							</div>

							{/* Bottom Action Affordance */}
							<div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between">
								<span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
									Explore Running Logs
								</span>
								<div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 flex items-center justify-center transition-[colors,transform]">
									<ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
								</div>
							</div>
						</Link>
					</motion.div>

					{/* Travel Adventure Card */}
					<motion.div
						variants={cardVariants}
						whileHover={reduceMotion ? undefined : { y: -3 }}
						transition={{ type: "spring", stiffness: 300, damping: 20 }}
						className="h-full"
					>
						<Link
							href="/adventures/travel"
							className="group block h-full bg-white border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-[border-color,box-shadow] duration-200 rounded-3xl p-6 sm:p-7 shadow-xs !no-underline flex flex-col justify-between"
						>
							<div>
								{/* Header & Icon */}
								<div className="flex items-center justify-between gap-3 mb-5">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform duration-200">
											<Camera className="w-6 h-6" />
										</div>
										<span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
											Postcard Studio
										</span>
									</div>
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-full shrink-0">
										Global Journeys
									</span>
								</div>

								{/* Title & Description */}
								<div>
									<h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors leading-snug">
										Travel Bucket List
									</h2>
									<p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
										Curated global destinations, cultural memories, and vintage
										airmail postcard generators with 3D flip polaroid sticker
										exports.
									</p>
								</div>

								{/* Travel Exploration Snapshot */}
								<div className="grid grid-cols-3 divide-x divide-slate-200/60 p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-center my-4">
									<div className="px-2">
										<p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
											Completed
										</p>
										<p className="text-sm font-extrabold text-slate-900 font-mono">
											10+ Cities
										</p>
										<p className="text-[10px] text-slate-500 font-medium">
											Logged
										</p>
									</div>
									<div className="px-2">
										<p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
											Regions
										</p>
										<p className="text-sm font-extrabold text-slate-900 font-mono">
											3 Countries
										</p>
										<p className="text-[10px] text-slate-500 font-medium">
											ID, TH, SG
										</p>
									</div>
									<div className="px-2">
										<p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
											Postcards
										</p>
										<p className="text-sm font-extrabold text-slate-900 font-mono">
											3D Flip
										</p>
										<p className="text-[10px] text-slate-500 font-medium">
											Vintage PNG
										</p>
									</div>
								</div>

								{/* Feature Highlights Chips */}
								<div className="flex flex-wrap gap-1.5">
									<span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
										<Layers className="w-3.5 h-3.5 text-indigo-600" />
										<span>3D Flip Postcards</span>
									</span>
									<span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
										<MapPin className="w-3.5 h-3.5 text-indigo-600" />
										<span>Wishlist Tracker</span>
									</span>
									<span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
										<ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
										<span>Polaroid Export</span>
									</span>
								</div>
							</div>

							{/* Bottom Action Affordance */}
							<div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between">
								<span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
									Explore Travel Tracker
								</span>
								<div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 flex items-center justify-center transition-[colors,transform]">
									<ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
								</div>
							</div>
						</Link>
					</motion.div>
				</motion.div>
			</div>
		</main>
	);
}
