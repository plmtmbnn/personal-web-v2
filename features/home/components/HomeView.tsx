"use client";

import {
	AUTHOR,
	AUTHOR_STATS,
	EXPERIENCE_YEAR,
	SOCIAL_LINKS,
} from "@/lib/shared/constants";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	motion,
	type Variants,
	animate,
	useReducedMotion,
} from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { ArrowRight, Mail } from "lucide-react";

// ─── Animation Variants ────────────────────────────────────────────────────────

const container: Variants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.05, delayChildren: 0 },
	},
};

const item: Variants = {
	hidden: { opacity: 0, y: 14 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] },
	},
};

// ─── Animated Counter ──────────────────────────────────────────────────────────

const useCounter = (to: number, duration = 1.5) => {
	const reduceMotion = useReducedMotion();
	const [count, setCount] = useState(reduceMotion ? to : 0);

	useEffect(() => {
		if (reduceMotion) {
			setCount(to);
			return;
		}
		const controls = animate(0, to, {
			duration,
			ease: "easeOut",
			onUpdate: (value) => setCount(Math.floor(value)),
		});
		return () => controls.stop();
	}, [to, duration, reduceMotion]);

	return count;
};

// ─── Component ────────────────────────────────────────────────────────────────

interface HomeProps {
	initialRunningKm?: number;
}

export default function Home({
	initialRunningKm = AUTHOR_STATS.runningKmPerYear,
}: HomeProps) {
	const reduceMotion = useReducedMotion();
	const yearsCount = useCounter(EXPERIENCE_YEAR, 1.5);
	const kmCount = useCounter(initialRunningKm, 2.0);
	const fintechCount = useCounter(AUTHOR_STATS.fintechSystems, 1.2);
	const year = new Date().getFullYear();

	return (
		<main className="min-h-screen lg:h-screen lg:max-h-[100dvh] bg-slate-50/80 bg-dot-pattern relative flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-x-hidden overflow-y-auto lg:overflow-hidden py-20 pb-32 sm:py-24 sm:pb-36 lg:py-0 lg:pb-0">
			<div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center relative z-10 my-auto">
				{/* ── Right — Photo ─────────────────────────────────────────── */}
				<div className="lg:col-span-4 flex justify-center lg:justify-end order-1 lg:order-2">
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
						className="relative group"
					>
						<div className="relative w-60 h-60 sm:w-72 sm:h-72 lg:w-[280px] lg:h-[280px] rounded-[2.5rem] p-3 bg-white border border-slate-200/80 shadow-xs group-hover:shadow-md group-hover:scale-[1.01] transition-[transform,box-shadow] duration-500">
							<div className="w-full h-full rounded-[2rem] overflow-hidden">
								<Image
									src="/profile.jpg"
									alt={`${AUTHOR.name} — Software Engineer and Distance Runner`}
									className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-[filter] duration-500"
									priority
									width={400}
									height={400}
								/>
							</div>

							{/* Open to work — centered at bottom of frame */}
							{AUTHOR.available && (
								<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/80 rounded-full shadow-xs whitespace-nowrap">
									<div className="relative">
										<div className="w-2 h-2 bg-emerald-500 rounded-full" />
										<div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
									</div>
									<span className="text-[10.5px] font-bold text-slate-700">
										Open to work
									</span>
								</div>
							)}
						</div>
					</motion.div>
				</div>

				{/* ── Left — Content ────────────────────────────────────────── */}
				<motion.div
					className="lg:col-span-8 order-2 lg:order-1 w-full max-w-2xl mx-auto lg:mx-0"
					variants={container}
					initial={reduceMotion ? false : "hidden"}
					animate="visible"
				>
					{/* Name + role — single line, no repeat elsewhere */}
					<motion.p
						variants={item}
						className="text-xs sm:text-sm font-semibold text-slate-400 tracking-wide mb-3 sm:mb-4"
					>
						{AUTHOR.name}&nbsp;&nbsp;·&nbsp;&nbsp;{AUTHOR.role}
						&nbsp;&nbsp;·&nbsp;&nbsp;Fintech
					</motion.p>

					{/* Headline — the dominant element */}
					<motion.h1
						variants={item}
						className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-4 sm:mb-5"
					>
						Fintech systems
						<br />
						by day. Asphalt
						<br />
						by morning.
					</motion.h1>

					{/* One-sentence bio — no repeating keywords from above */}
					<motion.p
						variants={item}
						className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium mb-6 sm:mb-7 max-w-lg"
					>
						Building secure financial infrastructure that moves money reliably
						at scale — and logging every kilometer along the way.
					</motion.p>

					{/* Stat strip — inline, no cards, each number is a link */}
					<motion.div
						variants={item}
						className="flex flex-wrap items-baseline gap-x-4 gap-y-2 text-xs font-semibold text-slate-500 mb-7 sm:mb-9"
					>
						<Link
							href="/work-experience"
							className="flex items-baseline gap-1.5 hover:text-slate-800 transition-colors duration-200 !no-underline group/s"
						>
							<span className="text-slate-900 font-extrabold text-base sm:text-lg tabular-nums group-hover/s:text-indigo-600 transition-colors duration-200">
								{yearsCount}+
							</span>
							yrs engineering
						</Link>
						<span className="text-slate-200 select-none">·</span>
						<Link
							href="/adventures/running"
							className="flex items-baseline gap-1.5 hover:text-slate-800 transition-colors duration-200 !no-underline group/s"
						>
							<span className="text-slate-900 font-extrabold text-base sm:text-lg tabular-nums group-hover/s:text-emerald-600 transition-colors duration-200">
								{kmCount.toLocaleString()}+
							</span>
							km run in {year}
						</Link>
						<span className="text-slate-200 select-none">·</span>
						<Link
							href="/portfolio"
							className="flex items-baseline gap-1.5 hover:text-slate-800 transition-colors duration-200 !no-underline group/s"
						>
							<span className="text-slate-900 font-extrabold text-base sm:text-lg tabular-nums group-hover/s:text-cyan-600 transition-colors duration-200">
								{fintechCount}+
							</span>
							fintech systems
						</Link>
					</motion.div>

					{/* CTAs + social */}
					<motion.div
						variants={item}
						className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full"
					>
						<Link
							href="/work-experience"
							className="group/btn flex items-center justify-center gap-2.5 px-6 py-3 bg-slate-900 !text-white !no-underline rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95 transition-[transform,box-shadow,background-color] duration-200 shadow-xs hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 cursor-pointer"
						>
							<span>Explore Work</span>
							<ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />
						</Link>

						<Link
							href="/contact"
							className="group/btn flex items-center justify-center gap-2.5 px-6 py-3 bg-white border border-slate-200/80 !text-slate-900 !no-underline rounded-xl font-bold text-xs uppercase tracking-wider hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-[transform,box-shadow,border-color,background-color] duration-200 shadow-xs hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 cursor-pointer"
						>
							<Mail className="w-3.5 h-3.5 group-hover/btn:rotate-6 transition-transform duration-200 text-slate-700" />
							<span>Get in Touch</span>
						</Link>

						<span className="hidden sm:inline text-slate-200 select-none">
							|
						</span>

						<div className="flex items-center justify-center gap-2 pt-1 sm:pt-0">
							<a
								href={SOCIAL_LINKS.github}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`${AUTHOR.name}'s GitHub`}
								className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl shadow-xs hover:shadow-sm hover:bg-slate-50 transition-[color,box-shadow,background-color] duration-200 !no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 cursor-pointer"
							>
								<FaGithub className="w-4 h-4" />
							</a>
							<a
								href={SOCIAL_LINKS.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`${AUTHOR.name}'s LinkedIn`}
								className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl shadow-xs hover:shadow-sm hover:bg-slate-50 transition-[color,box-shadow,background-color] duration-200 !no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 cursor-pointer"
							>
								<FaLinkedin className="w-4 h-4" />
							</a>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</main>
	);
}
