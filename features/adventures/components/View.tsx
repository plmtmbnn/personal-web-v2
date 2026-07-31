"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Camera, ChevronRight, Activity, Compass } from "lucide-react";

const categories = [
	{
		title: "Running",
		slug: "running",
		description:
			"Tracking consistency, endurance, and mental clarity through miles logged.",
		accent: "bg-emerald-500",
		color: "text-emerald-500",
		bg: "bg-emerald-500/5",
		icon: Activity,
	},
	{
		title: "Travel",
		slug: "travel",
		description:
			"Visual stories and cultural insights captured across the globe.",
		accent: "bg-purple-500",
		color: "text-purple-500",
		bg: "bg-purple-500/5",
		icon: Camera,
	},
];

export default function AdventuresLanding() {
	const reduceMotion = useReducedMotion();

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32">
				{/* Header Section */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4"
				>
					<div>
						<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
							<Compass className="w-4 h-4 text-indigo-600" />
							Life in Motion & Explorations
						</span>
					</div>
					<h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
						Personal <span className="text-indigo-600">Adventures</span>
					</h1>
					<p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl mx-auto">
						Exploring the intersection of endurance, discipline, and aesthetics.
						A collection of distance running milestones and global travel logs.
					</p>
				</motion.div>

				{/* Selection Grid - Optimized for Mobile */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
					{categories.map((cat, i) => (
						<motion.div
							key={cat.slug}
							initial={reduceMotion ? false : { opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.1, duration: 0.5 }}
						>
							<Link
								href={`/adventures/${cat.slug}`}
								className="group block relative p-8 sm:p-10 rounded-[2.5rem] bg-white border border-slate-200/80 hover:border-slate-300 transition-all duration-300 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/80 hover:-translate-y-1.5 overflow-hidden !no-underline h-full"
							>
								<div className="relative z-10 flex flex-col h-full">
									<div
										className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl ${
											cat.slug === "running"
												? "bg-emerald-50 border-emerald-100 text-emerald-600"
												: "bg-indigo-50 border-indigo-100 text-indigo-600"
										} border shadow-xs mb-8 group-hover:scale-110 transition-transform duration-300`}
									>
										<cat.icon className="w-7 h-7 sm:w-8 sm:h-8" />
									</div>

									<h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">
										{cat.title}
									</h3>

									<p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mb-8 flex-1">
										{cat.description}
									</p>

									<div
										className={`flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider ${
											cat.slug === "running"
												? "text-emerald-600"
												: "text-indigo-600"
										} transition-all`}
									>
										<span>Begin Exploration</span>
										<ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
									</div>
								</div>
							</Link>
						</motion.div>
					))}
				</div>
			</div>
		</main>
	);
}
