"use client";

import { AUTHOR, AUTHOR_STATS, SOCIAL_LINKS } from "@/lib/shared/constants";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import {
	ArrowRight,
	ArrowUpRight,
	Mail,
	ChevronDown,
	Briefcase,
	Trophy,
	Layers,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TECH_PILLS = ["Node.js", "Next.js", "Go", "PostgreSQL", "MongoDB"];

// ─── Animation Variants ───────────────────────────────────────────────────────

const container: Variants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.08, delayChildren: 0.1 },
	},
};

const item: Variants = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
	},
};

// ─── Animated Counter ─────────────────────────────────────────────────────────

const useCounter = (to: number, duration = 1500) => {
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

// ─── Component ───────────────────────────────────────────────────────────────

interface HomeProps {
	initialRunningKm?: number;
}

export default function Home({
	initialRunningKm = AUTHOR_STATS.runningKmPerYear,
}: HomeProps) {
	const experienceYear = new Date().getFullYear() - AUTHOR_STATS.experienceFrom;
	const yearsCount = useCounter(experienceYear, 1500);
	const kmCount = useCounter(initialRunningKm, 2000);
	const fintechCount = useCounter(AUTHOR_STATS.fintechSystems, 1200);

	return (
		<main className="min-h-screen bg-white relative flex items-center justify-center px-6 overflow-x-hidden py-24 lg:py-0">
			{/* ── Background ── */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				{/* Base gradient — barely-there slate to white */}
				<div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-white" />
				{/* Indigo blob — top right */}
				<div className="absolute -top-[20%] -right-[10%] w-[60%] h-[65%] bg-indigo-100/60 rounded-full blur-[120px] animate-float" />
				{/* Emerald blob — bottom left */}
				<div
					className="absolute -bottom-[20%] -left-[10%] w-[55%] h-[55%] bg-emerald-100/50 rounded-full blur-[120px] animate-float"
					style={{ animationDelay: "3s" }}
				/>
			</div>

			<div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center relative z-10">
				{/* ── Right Column — Photo ── */}
				<div className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2">
					<motion.div
						initial={{ opacity: 0, scale: 0.92 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
						className="relative group cursor-pointer"
					>
						{/* Ambient glow — works on light bg via colored gradient */}
						<div className="absolute -inset-6 bg-gradient-to-tr from-indigo-200/40 via-purple-100/30 to-emerald-100/40 rounded-[3.5rem] blur-3xl group-hover:from-indigo-200/70 group-hover:to-emerald-100/70 transition-all duration-700" />

						{/* Photo frame — solid white border visible on light bg */}
						<div className="relative w-60 h-60 sm:w-80 sm:h-80 xl:w-[22rem] xl:h-[22rem] rounded-[2.5rem] sm:rounded-[3rem] p-2.5 bg-white border border-slate-200 shadow-2xl shadow-slate-200/80 group-hover:shadow-slate-300/60 group-hover:scale-[1.02] transition-all duration-700">
							<div className="w-full h-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
								<Image
									src="/profile.jpg"
									alt={`${AUTHOR.name} — Software Engineer and Distance Runner`}
									className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
									priority
									width={800}
									height={800}
								/>
							</div>

							{/* Status badge — conditional on AUTHOR.available */}
							{AUTHOR.available && (
								<div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-md">
									<div className="relative">
										<div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
										<div className="absolute inset-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
									</div>
									<span className="text-[9px] font-black uppercase tracking-widest text-slate-700">
										Open to work
									</span>
								</div>
							)}
						</div>

						{/* Tech stack pills — top right, parallax hover wrapper */}
						<div className="absolute -top-5 -right-5 hidden lg:block group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
							<motion.div
								animate={{ y: [0, -8, 0] }}
								transition={{
									duration: 5,
									repeat: Infinity,
									ease: "easeInOut",
								}}
								className="flex flex-col gap-1.5 p-3 bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-100/50"
							>
								{TECH_PILLS.slice(0, 3).map((tech) => (
									<span
										key={tech}
										className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-2 py-0.5 bg-slate-50 rounded-lg border border-slate-100"
									>
										{tech}
									</span>
								))}
							</motion.div>
						</div>

						{/* Domain context pill — bottom left, parallax hover wrapper */}
						<div className="absolute -bottom-5 -left-5 hidden lg:block group-hover:-translate-x-3 group-hover:translate-y-3 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
							<motion.div
								animate={{ y: [0, 8, 0] }}
								transition={{
									duration: 6,
									repeat: Infinity,
									ease: "easeInOut",
									delay: 2,
								}}
								className="p-3 bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-100/50"
							>
								<div className="flex items-center gap-2 mb-1">
									<div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
									<span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
										Fintech
									</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
									<span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
										Running
									</span>
								</div>
							</motion.div>
						</div>
					</motion.div>
				</div>

				{/* ── Left Column — Content ── */}
				<motion.div
					className="lg:col-span-7 order-2 lg:order-1"
					variants={container}
					initial="hidden"
					animate="visible"
				>
					{/* Role chip */}
					<motion.div variants={item} className="mb-6">
						<span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
							<span className="w-1.5 h-1.5 rounded-full bg-slate-900 inline-block" />
							{AUTHOR.role} · Fintech
						</span>
					</motion.div>

					{/* Bio */}
					<motion.p
						variants={item}
						className="text-base sm:text-lg text-slate-500 max-w-xl leading-relaxed font-medium mb-4"
					>
						Hi, I'm{" "}
						<span className="text-slate-900 font-bold">{AUTHOR.name}</span>. For
						over {experienceYear} years, I've designed and scaled secure fintech
						systems. When I'm not writing code, I'm training for marathons and
						trail runs, applying the same discipline to the miles as I do to the
						codebase.
					</motion.p>

					{/* Tech stack pills — concrete identity signal */}
					<motion.div variants={item} className="flex flex-wrap gap-2 mb-8">
						{TECH_PILLS.map((tech) => (
							<span
								key={tech}
								className="text-[10px] font-bold text-slate-400 px-2.5 py-1 bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-200 rounded-full transition-all duration-200 cursor-default"
							>
								{tech}
							</span>
						))}
					</motion.div>

					{/* Stats — 3 cards with intentionally different color treatments */}
					<motion.div
						variants={item}
						className="grid grid-cols-3 gap-3 sm:gap-4 mb-8"
					>
						{/* Years — featured dark card */}
						<Link
							href="/work-experience"
							aria-label="View work experience details"
							className="col-span-1 bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10 transition-all duration-300 cursor-pointer group/card relative overflow-hidden"
						>
							<div className="flex justify-between items-start mb-3">
								<Briefcase className="w-4 h-4 text-slate-400" />
								<ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 translate-y-1 scale-90 group-hover/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:scale-100 transition-all duration-300" />
							</div>
							<div>
								<p className="text-2xl sm:text-3xl font-black tracking-tighter leading-none !text-white">
									{yearsCount}+
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest !text-slate-400 mt-1.5">
									Years Eng.
								</p>
							</div>
						</Link>

						{/* KM Running — emerald */}
						<Link
							href="/adventures/running"
							aria-label="View running performance page"
							className="col-span-1 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-200 hover:bg-emerald-100/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100/30 transition-all duration-300 cursor-pointer group/card relative overflow-hidden"
						>
							<div className="flex justify-between items-start mb-3">
								<Trophy className="w-4 h-4 text-emerald-500" />
								<ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 opacity-0 translate-y-1 scale-90 group-hover/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:scale-100 transition-all duration-300" />
							</div>
							<div>
								<p className="text-2xl sm:text-3xl font-black tracking-tighter text-emerald-700 leading-none">
									{kmCount}+
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-emerald-650 mt-1.5">
									KM / Year
								</p>
							</div>
						</Link>

						{/* Fintech Systems — indigo */}
						<Link
							href="/portfolio"
							aria-label="View portfolio projects"
							className="col-span-1 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-indigo-200 hover:bg-indigo-100/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-100/30 transition-all duration-300 cursor-pointer group/card relative overflow-hidden"
						>
							<div className="flex justify-between items-start mb-3">
								<Layers className="w-4 h-4 text-indigo-500" />
								<ArrowUpRight className="w-3.5 h-3.5 text-indigo-600 opacity-0 translate-y-1 scale-90 group-hover/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:scale-100 transition-all duration-300" />
							</div>
							<div>
								<p className="text-2xl sm:text-3xl font-black tracking-tighter text-indigo-700 leading-none">
									{fintechCount}+
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-indigo-650 mt-1.5">
									Fintech Sys.
								</p>
							</div>
						</Link>
					</motion.div>

					{/* CTAs + Social links */}
					<motion.div
						variants={item}
						className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
					>
						<Link
							href="/work-experience"
							className="group/btn flex items-center gap-2 px-7 py-3.5 bg-slate-900 text-white !no-underline rounded-2xl font-black text-sm hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-slate-900/10"
						>
							<span className="text-white">Explore Work</span>
							<ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1.5 transition-transform duration-300" />
						</Link>

						<a
							href={`mailto:${AUTHOR.email}`}
							className="group/btn flex items-center gap-2 px-7 py-3.5 bg-white border border-slate-200 text-slate-700 !no-underline rounded-2xl font-black text-sm hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 active:scale-95 transition-all shadow-sm"
						>
							<Mail className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300 text-slate-700" />
							<span className="text-slate-700">Get in Touch</span>
						</a>

						{/* Social icon links — from SOCIAL_LINKS constant */}
						<div className="flex items-center gap-1 sm:ml-1">
							<a
								href={SOCIAL_LINKS.github}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`${AUTHOR.name}'s GitHub`}
								className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all !no-underline"
							>
								<FaGithub className="w-4 h-4" />
							</a>
							<a
								href={SOCIAL_LINKS.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`${AUTHOR.name}'s LinkedIn`}
								className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all !no-underline"
							>
								<FaLinkedin className="w-4 h-4" />
							</a>
						</div>
					</motion.div>
				</motion.div>
			</div>

			{/* Scroll indicator — subtle, only on large screens */}
			<motion.div
				className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1 text-slate-300 pointer-events-none"
				animate={{ y: [0, 6, 0] }}
				transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
			>
				<span className="text-[8px] font-black uppercase tracking-[0.2em]">
					Scroll
				</span>
				<ChevronDown className="w-3.5 h-3.5" />
			</motion.div>
		</main>
	);
}
