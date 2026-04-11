"use client";

import { EXPERIENCE_YEAR, AUTHOR } from "@/lib/constants";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	Code2,
	Zap,
	ArrowRight,
	MousePointer2,
	Briefcase,
	Trophy,
} from "lucide-react";

/**
 * Countdown Hook for animated numbers
 */
const useCountdown = (to: number, duration: number) => {
	const [count, setCount] = useState(0);

	useEffect(() => {
		let start = 0;
		const increment = to / (duration / 16);
		const timer = setInterval(() => {
			start += increment;
			if (start >= to) {
				setCount(to);
				clearInterval(timer);
			} else {
				setCount(Math.floor(start));
			}
		}, 16);

		return () => clearInterval(timer);
	}, [to, duration]);

	return count;
};

export default function Home() {
	const yearsCount = useCountdown(EXPERIENCE_YEAR, 1500);
	const kmCount = useCountdown(1000, 2000);

	return (
		<main className="min-h-screen bg-background relative flex items-center justify-center px-6 overflow-hidden py-24 sm:py-0">
			{/* Aesthetic Background Elements */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
				<div
					className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-background-secondary/20 rounded-full blur-[160px]" />
			</div>

			<div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center relative z-10">
				{/* Left Column: Content */}
				<div className="lg:col-span-7 space-y-10 order-2 lg:order-1">
					<div className="space-y-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm"
						>
							<Zap className="w-4 h-4 text-accent fill-accent" />
							<span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
								Software Engineer • Fintech Expert
							</span>
						</motion.div>

						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="text-5xl sm:text-7xl xl:text-8xl font-black tracking-tighter text-foreground leading-[0.9]"
						>
							Crafting <span className="gradient-text">Reliable</span> Digital
							Systems.
						</motion.h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed font-medium"
						>
							Hi, I'm{" "}
							<span className="text-foreground font-bold">{AUTHOR.name}</span>.
							For over {EXPERIENCE_YEAR} years, I've specialized in building
							secure, high-performance software for the global fintech
							landscape.
						</motion.p>
					</div>

					{/* Primary Stats Grid */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="grid grid-cols-1 sm:grid-cols-2 gap-6"
					>
						<div className="group relative">
							<div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-indigo-500 rounded-3xl opacity-0 group-hover:opacity-20 transition duration-500 blur-xl" />
							<div className="relative glass-card p-8 rounded-3xl border-2 border-white/5 flex items-center gap-6 hover:border-accent/30 transition-all duration-500">
								<div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
									<Briefcase className="w-7 h-7" />
								</div>
								<div>
									<p className="text-3xl font-black text-foreground tracking-tighter">
										{yearsCount}+ Years
									</p>
									<p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-1">
										Engineering
									</p>
								</div>
							</div>
						</div>

						<div className="group relative">
							<div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-20 transition duration-500 blur-xl" />
							<div className="relative glass-card p-8 rounded-3xl border-2 border-white/5 flex items-center gap-6 hover:border-emerald-500/30 transition-all duration-500">
								<div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
									<Trophy className="w-7 h-7" />
								</div>
								<div>
									<p className="text-3xl font-black text-foreground tracking-tighter">
										{kmCount}+ KM
									</p>
									<p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-1">
										Yearly Running
									</p>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Action Buttons */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className="flex flex-wrap gap-4"
					>
						<a
							href="/work-experience"
							className="flex items-center gap-2 px-8 py-4 bg-accent text-white !no-underline rounded-2xl font-black shadow-xl shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-1 active:scale-95 transition-all"
						>
							<span className="text-white">Explore Work</span>
							<ArrowRight className="w-5 h-5 text-white" />
						</a>
						<a
							href="/contact"
							className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 !no-underline rounded-2xl font-black text-foreground hover:bg-white/10 transition-all backdrop-blur-md active:scale-95"
						>
							<span>Let's Talk</span>
						</a>
					</motion.div>
				</div>

				{/* Right Column: Visual */}
				<div className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2">
					<motion.div
						initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
						animate={{ opacity: 1, scale: 1, rotate: 0 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
						className="relative group"
					>
						{/* Ambient Glow */}
						<div className="absolute -inset-4 bg-gradient-to-tr from-accent via-purple-500 to-indigo-500 rounded-[3rem] opacity-20 blur-2xl group-hover:opacity-40 transition duration-700 animate-float" />

						{/* Main Frame */}
						<div className="relative w-64 h-64 sm:w-80 sm:h-80 xl:w-96 xl:h-96 rounded-[3rem] p-3 glass-strong border border-white/10 overflow-hidden group-hover:scale-[1.02] transition-transform duration-700">
							<div className="w-full h-full rounded-[2.2rem] overflow-hidden relative">
								<Image
									src="/profile.jpg"
									alt={AUTHOR.name}
									className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
									priority
									width={800}
									height={800}
								/>

								{/* Online Status Badge */}
								<div className="absolute bottom-6 right-6 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
									<div className="relative">
										<div className="w-2 h-2 bg-emerald-500 rounded-full" />
										<div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
									</div>
									<span className="text-[10px] font-black uppercase tracking-widest text-white">
										Available
									</span>
								</div>
							</div>
						</div>

						{/* Decorative floating elements */}
						<motion.div
							animate={{ y: [0, -10, 0] }}
							transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
							className="absolute -top-6 -right-6 p-4 glass-strong rounded-2xl border border-white/10 shadow-2xl hidden sm:block"
						>
							<Code2 className="w-6 h-6 text-accent" />
						</motion.div>
						<motion.div
							animate={{ y: [0, 10, 0] }}
							transition={{
								duration: 5,
								repeat: Infinity,
								ease: "easeInOut",
								delay: 1,
							}}
							className="absolute -bottom-6 -left-6 p-4 glass-strong rounded-2xl border border-white/10 shadow-2xl hidden sm:block"
						>
							<MousePointer2 className="w-6 h-6 text-purple-400" />
						</motion.div>
					</motion.div>
				</div>
			</div>
		</main>
	);
}
