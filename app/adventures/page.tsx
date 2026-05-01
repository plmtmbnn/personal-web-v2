"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, ChevronRight, Activity, Compass } from "lucide-react";

const categories = [
	{
		title: "Running",
		slug: "running",
		description:
			"Tracking consistency, endurance, and mental clarity through miles logged.",
		accent: "from-emerald-500 to-teal-500",
		color: "text-emerald-500",
		bg: "bg-emerald-500/5",
		icon: Activity,
	},
	{
		title: "Travel",
		slug: "travel",
		description:
			"Visual stories and cultural insights captured across the globe.",
		accent: "from-purple-500 to-pink-500",
		color: "text-purple-500",
		bg: "bg-purple-500/5",
		icon: Camera,
	},
	{
		title: "Utilities",
		slug: "utils",
		description:
			"Specialized high-precision tools for training, logistics, and performance tracking.",
		accent: "from-blue-500 to-indigo-500",
		color: "text-blue-500",
		bg: "bg-blue-500/5",
		icon: Activity,
	},
];

export default function AdventuresLanding() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	if (!mounted) return null;

	return (
		<main className="min-h-screen bg-background relative overflow-hidden pb-32">
			{/* Aesthetic Background Elements */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-10%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
				<div
					className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="max-w-6xl mx-auto px-6 pt-24 sm:pt-32">
				{/* Header Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center space-y-6 mb-20"
				>
					<div className="flex items-center justify-center gap-3 text-accent mb-4">
						<Compass className="w-6 h-6" />
						<span className="text-[10px] font-black uppercase tracking-[0.4em]">
							Life in Motion
						</span>
					</div>
					<h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground leading-[0.9]">
						Personal <span className="gradient-text">Adventures</span>
					</h1>
					<p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium leading-relaxed">
						Exploring the intersection of endurance and aesthetics. A collection
						of physical journeys and visual stories.
					</p>
				</motion.div>

				{/* Selection Grid - Optimized for Mobile */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
					{categories.map((cat, i) => (
						<motion.div
							key={cat.slug}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.1, duration: 0.6 }}
						>
							<Link
								href={`/adventures/${cat.slug}`}
								className="group block relative p-10 rounded-[2.5rem] bg-white/5 border-2 border-white/5 backdrop-blur-xl hover:border-accent/30 transition-all duration-500 shadow-2xl overflow-hidden !no-underline"
							>
								{/* Dynamic Inner Glow */}
								<div
									className={`absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-gradient-to-br ${cat.accent} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl`}
								></div>

								<div className="relative z-10 flex flex-col h-full">
									<div
										className={`w-16 h-16 flex items-center justify-center rounded-2xl ${cat.bg} ${cat.color} shadow-lg mb-8 group-hover:scale-110 transition-transform duration-500 border border-white/5`}
									>
										<cat.icon className="w-8 h-8" />
									</div>

									<h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">
										{cat.title}
									</h3>

									<p className="text-muted-foreground font-medium leading-relaxed mb-10 flex-1">
										{cat.description}
									</p>

									<div
										className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] ${cat.color} transition-all`}
									>
										<span>Begin Exploration</span>
										<ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
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
