"use client";

import {
	AUTHOR,
	AUTHOR_STATS,
	EXPERIENCE_YEAR,
	SOCIAL_LINKS,
} from "@/lib/shared/constants";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, memo } from "react";
import {
	motion,
	type Variants,
	animate,
	useReducedMotion,
} from "framer-motion";
import { FaGithub, FaLinkedin, FaRunning } from "react-icons/fa";
import {
	ArrowRight,
	ArrowUpRight,
	Mail,
	ChevronDown,
	Briefcase,
	Layers,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TECH_PILLS = ["Node.js", "Next.js", "Go", "PostgreSQL", "MongoDB"];

// ─── Memoized Components ───────────────────────────────────────────────────────

const TechPill = memo(({ tech }: { tech: string }) => (
	<span className="text-[10px] font-bold text-slate-400 px-2.5 py-1 bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-200 rounded-full transition-all duration-200 cursor-default">
		{tech}
	</span>
));

TechPill.displayName = "TechPill";

const TechPillsList = memo(() => (
	<>
		{TECH_PILLS.map((tech) => (
			<TechPill key={tech} tech={tech} />
		))}
	</>
));

TechPillsList.displayName = "TechPillsList";

// Memoized Stat Card component
interface StatCardProps {
	icon: React.ReactNode;
	value: string;
	label: string;
	href: string;
	bgColor: string;
	borderColor: string;
	hoverBgColor: string;
	hoverBorderColor: string;
	shadowColor: string;
	textColorClass: string;
	iconColorClass: string;
	labelTextColorClass: string;
}

const StatCard = memo(
	({
		icon,
		value,
		label,
		href,
		bgColor,
		borderColor,
		hoverBgColor,
		hoverBorderColor,
		shadowColor,
		textColorClass,
		iconColorClass,
		labelTextColorClass,
	}: StatCardProps) => (
		<Link
			href={href}
			aria-label={`View ${label} details`}
			className={`col-span-1 ${bgColor} ${borderColor} rounded-2xl p-4 sm:p-5 flex flex-col justify-between ${hoverBorderColor} ${hoverBgColor} hover:-translate-y-0.5 hover:shadow-md ${shadowColor} transition-all duration-200 cursor-pointer group/card relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2`}
		>
			<div className="flex justify-between items-start mb-3">
				{icon}
				<ArrowUpRight
					className={`w-3.5 h-3.5 ${iconColorClass} opacity-0 group-hover/card:opacity-100 transition-opacity duration-200`}
				/>
			</div>
			<div>
				<p
					className={`text-2xl sm:text-3xl font-black tracking-tighter leading-none ${textColorClass}`}
				>
					{value}
				</p>
				<p
					className={`text-[9px] font-black uppercase tracking-widest ${labelTextColorClass} mt-1.5`}
				>
					{label}
				</p>
			</div>
		</Link>
	),
);

StatCard.displayName = "StatCard";

// ─── Animation Variants ───────────────────────────────────────────────────────

const container: Variants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.04, delayChildren: 0 },
	},
};

const item: Variants = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
	},
};

// ─── Animated Counter ─────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

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

	return (
		<main className="min-h-screen bg-white relative flex items-center justify-center px-6 overflow-x-hidden py-24 lg:py-0">
			<div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center relative z-10">
				{/* ── Right Column — Photo ── */}
				<div className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2">
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
						className="relative group cursor-pointer"
					>
						{/* Photo frame — solid white border visible on light bg */}
						<div className="relative w-60 h-60 sm:w-80 sm:h-80 xl:w-[22rem] xl:h-[22rem] rounded-[2.5rem] sm:rounded-[3rem] p-2.5 bg-white border border-slate-200 shadow-2xl shadow-slate-200/80 group-hover:shadow-slate-300/60 group-hover:scale-[1.02] transition-all duration-500">
							<div className="w-full h-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
								<Image
									src="/profile.jpg"
									alt={`${AUTHOR.name} — Software Engineer and Distance Runner`}
									className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
									priority
									width={400}
									height={400}
								/>
							</div>
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
						{/* Tech stack pills — top right, simplified */}
						<div
							className="absolute -top-5 -right-5 hidden lg:block group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300"
							style={{ willChange: "transform" }}
						>
							<div className="flex flex-col gap-1.5 p-3 bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-100/50">
								{TECH_PILLS.slice(0, 3).map((tech) => (
									<span
										key={tech}
										className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-2 py-0.5 bg-slate-50 rounded-lg border border-slate-100"
									>
										{tech}
									</span>
								))}
							</div>
						</div>

						{/* Domain context pill — bottom left, simplified */}
						<div
							className="absolute -bottom-5 -left-5 hidden lg:block group-hover:-translate-x-2 group-hover:translate-y-2 transition-transform duration-300"
							style={{ willChange: "transform" }}
						>
							<div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-100/50">
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
							</div>
						</div>
					</motion.div>
				</div>

				{/* ── Left Column — Content ── */}
				<motion.div
					className="lg:col-span-7 order-2 lg:order-1"
					variants={container}
					initial={reduceMotion ? false : "hidden"}
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
						over {EXPERIENCE_YEAR} years, I've designed and scaled secure
						fintech systems. When I'm not writing code, I'm training for
						marathons and trail runs, applying the same discipline to the miles
						as I do to the codebase.
					</motion.p>

					{/* Tech stack pills — concrete identity signal */}
					<motion.div variants={item} className="flex flex-wrap gap-2 mb-8">
						<TechPillsList />
					</motion.div>

					{/* Stats — 3 cards with intentionally different color treatments */}
					<motion.div
						variants={item}
						className="grid grid-cols-3 gap-3 sm:gap-4 mb-8"
					>
						<StatCard
							icon={<Briefcase className="w-4 h-4 text-slate-500" />}
							value={`${yearsCount}+`}
							label="Years Eng."
							href="/work-experience"
							bgColor="bg-slate-50"
							borderColor="border border-slate-100"
							hoverBgColor="hover:bg-slate-100/50"
							hoverBorderColor="hover:border-slate-200"
							shadowColor="hover:shadow-slate-100/30"
							textColorClass="text-slate-700"
							iconColorClass="text-slate-600"
							labelTextColorClass="text-slate-600"
						/>

						<StatCard
							icon={<FaRunning className="w-4 h-4 text-emerald-500" />}
							value={`${kmCount}+`}
							label="KM this year"
							href="/adventures/running"
							bgColor="bg-emerald-50"
							borderColor="border border-emerald-100"
							hoverBgColor="hover:bg-emerald-100/50"
							hoverBorderColor="hover:border-emerald-200"
							shadowColor="hover:shadow-emerald-100/30"
							textColorClass="text-emerald-700"
							iconColorClass="text-emerald-600"
							labelTextColorClass="text-emerald-600"
						/>

						<StatCard
							icon={<Layers className="w-4 h-4 text-indigo-500" />}
							value={`${fintechCount}+`}
							label="Fintech Sys."
							href="/portfolio"
							bgColor="bg-indigo-50"
							borderColor="border border-indigo-100"
							hoverBgColor="hover:bg-indigo-100/50"
							hoverBorderColor="hover:border-indigo-200"
							shadowColor="hover:shadow-indigo-100/30"
							textColorClass="text-indigo-700"
							iconColorClass="text-indigo-600"
							labelTextColorClass="text-indigo-600"
						/>
					</motion.div>

					{/* CTAs + Social links */}
					<motion.div
						variants={item}
						className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
					>
						<Link
							href="/work-experience"
							className="group/btn flex items-center gap-2 px-7 py-3.5 bg-slate-900 text-white !no-underline rounded-2xl font-black text-sm hover:bg-slate-800 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-slate-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
						>
							<span className="text-white">Explore Work</span>
							<ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform duration-200" />
						</Link>

						<a
							href={`mailto:${AUTHOR.email}`}
							className="group/btn flex items-center gap-2 px-7 py-3.5 bg-white border border-slate-200 text-slate-700 !no-underline rounded-2xl font-black text-sm hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
						>
							<Mail className="w-4 h-4 group-hover/btn:rotate-6 transition-transform duration-200 text-slate-700" />
							<span className="text-slate-700">Get in Touch</span>
						</a>

						{/* Social icon links — from SOCIAL_LINKS constant */}
						<div className="flex items-center gap-1 sm:ml-1">
							<a
								href={SOCIAL_LINKS.github}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`${AUTHOR.name}'s GitHub`}
								className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors duration-200 !no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
							>
								<FaGithub className="w-4 h-4" />
							</a>
							<a
								href={SOCIAL_LINKS.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`${AUTHOR.name}'s LinkedIn`}
								className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors duration-200 !no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
							>
								<FaLinkedin className="w-4 h-4" />
							</a>
						</div>
					</motion.div>
				</motion.div>
			</div>

			{/* Scroll indicator — subtle, only on large screens */}
			<div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1 text-slate-300 pointer-events-none">
				<span className="text-[8px] font-black uppercase tracking-[0.2em]">
					Scroll
				</span>
				<ChevronDown className="w-3.5 h-3.5" />
			</div>
		</main>
	);
}
