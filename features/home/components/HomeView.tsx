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
	Briefcase,
	Layers,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TECH_PILLS = ["Node.js", "Next.js", "Go", "PostgreSQL", "MongoDB"];

// ─── Memoized Components ───────────────────────────────────────────────────────

const TechPill = memo(({ tech }: { tech: string }) => (
	<span className="text-[11px] sm:text-xs font-semibold text-slate-600 px-3 py-1 bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm hover:text-slate-900 rounded-full transition-all duration-200 cursor-default">
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

// Memoized Stat Card component (High Contrast Floating Card Aesthetic)
interface StatCardProps {
	icon: React.ReactNode;
	value: string;
	label: string;
	sublabel?: string;
	href: string;
	badgeBgColor?: string;
	accentBorderClass?: string;
	topAccentClass?: string;
}

const StatCard = memo(
	({
		icon,
		value,
		label,
		sublabel,
		href,
		badgeBgColor = "bg-indigo-50 border-indigo-100 text-indigo-600",
		accentBorderClass = "hover:border-indigo-300 hover:ring-2 hover:ring-indigo-500/10",
		topAccentClass = "via-indigo-500",
	}: StatCardProps) => (
		<Link
			href={href}
			aria-label={`View ${label} details`}
			className={`col-span-1 bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between hover:-translate-y-1.5 shadow-xs hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 cursor-pointer group/card relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${accentBorderClass}`}
		>
			{/* Subtle top border accent line on hover */}
			<div
				className={`absolute top-0 inset-x-3.5 sm:inset-x-5 h-[2px] bg-gradient-to-r from-transparent ${topAccentClass} to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300`}
			/>

			<div className="flex justify-between items-start mb-2.5 sm:mb-3.5 relative z-10">
				<div
					className={`p-1.5 sm:p-2.5 rounded-xl border ${badgeBgColor} flex items-center justify-center group-hover/card:scale-110 group-hover/card:rotate-3 transition-transform duration-300 shadow-2xs`}
				>
					{icon}
				</div>
				<div className="p-1 rounded-full bg-slate-50 group-hover/card:bg-slate-100 transition-colors duration-200 border border-slate-100">
					<ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 group-hover/card:text-slate-900 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 transition-all duration-200" />
				</div>
			</div>

			<div className="relative z-10">
				<p className="text-xl sm:text-3xl font-extrabold tracking-tight leading-none text-slate-900 group-hover/card:text-slate-950 transition-colors">
					{value}
				</p>
				<p className="text-[11px] sm:text-xs font-bold text-slate-700 mt-1.5 sm:mt-2 truncate">
					{label}
				</p>
				{sublabel && (
					<p className="text-[9.5px] sm:text-[10px] font-semibold text-slate-500 mt-0.5 truncate hidden sm:block">
						{sublabel}
					</p>
				)}
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
		<main className="min-h-screen lg:h-screen lg:max-h-[100dvh] bg-slate-50/80 bg-dot-pattern relative flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-x-hidden overflow-y-auto lg:overflow-hidden py-20 pb-32 sm:py-24 sm:pb-36 lg:py-0 lg:pb-0">
			<div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 my-auto">
				{/* ── Right Column — Photo ── */}
				<div className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2">
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
						className="relative group cursor-pointer"
					>
						{/* Photo frame — Floating white card container */}
						<div className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-64 lg:h-64 xl:w-80 xl:h-80 rounded-[2.5rem] p-3 bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50 group-hover:shadow-2xl group-hover:shadow-slate-300/60 group-hover:scale-[1.02] transition-all duration-500">
							<div className="w-full h-full rounded-[2rem] overflow-hidden">
								<Image
									src="/profile.jpg"
									alt={`${AUTHOR.name} — Software Engineer and Distance Runner`}
									className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
									priority
									width={400}
									height={400}
								/>
							</div>
						</div>

						{/* Status badge — conditional on AUTHOR.available */}
						{AUTHOR.available && (
							<div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-full shadow-sm">
								<div className="relative">
									<div className="w-2 h-2 bg-emerald-500 rounded-full" />
									<div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
								</div>
								<span className="text-[10.5px] font-bold text-slate-700">
									Open to work
								</span>
							</div>
						)}

						{/* Tech stack pills — floating card top right */}
						<div
							className="absolute -top-3 -right-3 hidden lg:block group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
							style={{ willChange: "transform" }}
						>
							<div className="flex flex-col gap-1.5 p-2.5 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-lg shadow-slate-200/50">
								{TECH_PILLS.slice(0, 3).map((tech) => (
									<span
										key={tech}
										className="text-[9.5px] font-bold text-slate-700 px-2 py-0.5 bg-slate-50 rounded-full border border-slate-200/80"
									>
										{tech}
									</span>
								))}
							</div>
						</div>

						{/* Domain context pill — floating card bottom left */}
						<div
							className="absolute -bottom-3 -left-3 hidden lg:block group-hover:-translate-x-1 group-hover:translate-y-1 transition-transform duration-300"
							style={{ willChange: "transform" }}
						>
							<div className="p-2.5 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-lg shadow-slate-200/50">
								<div className="flex items-center gap-2 mb-1">
									<div className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
									<span className="text-[9.5px] font-bold text-slate-700">
										Fintech
									</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
									<span className="text-[9.5px] font-bold text-slate-700">
										Running
									</span>
								</div>
							</div>
						</div>
					</motion.div>
				</div>

				{/* ── Left Column — Content ── */}
				<motion.div
					className="lg:col-span-7 order-2 lg:order-1 max-w-xl mx-auto lg:mx-0 w-full"
					variants={container}
					initial={reduceMotion ? false : "hidden"}
					animate="visible"
				>
					{/* Role chip */}
					<motion.div variants={item} className="mb-3 sm:mb-4">
						<span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs">
							<span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
							{AUTHOR.role} · Fintech
						</span>
					</motion.div>

					{/* Headline */}
					<motion.h1
						variants={item}
						className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12] mb-3 sm:mb-4"
					>
						Building Scalable Fintech Systems & Enduring Code.
					</motion.h1>

					{/* Bio */}
					<motion.p
						variants={item}
						className="text-xs sm:text-base text-slate-600 max-w-xl leading-relaxed font-semibold mb-4 sm:mb-5"
					>
						Hi, I'm{" "}
						<span className="text-slate-900 font-extrabold">{AUTHOR.name}</span>
						. For over {EXPERIENCE_YEAR} years, I've designed and scaled secure
						fintech architectures. When off-duty, I train for marathons and
						trail runs, applying the same endurance to code as I do to the
						trail.
					</motion.p>

					{/* Tech stack pills */}
					<motion.div
						variants={item}
						className="flex flex-wrap gap-2 mb-4 sm:mb-5"
					>
						<TechPillsList />
					</motion.div>

					{/* Stats — Floating Cards with Semantic Accents */}
					<motion.div
						variants={item}
						className="grid grid-cols-3 gap-2.5 sm:gap-3.5 mb-4 sm:mb-6"
					>
						<StatCard
							icon={
								<Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
							}
							value={`${yearsCount}+`}
							label="Years Eng."
							sublabel="Architecture & Systems"
							href="/work-experience"
							badgeBgColor="bg-indigo-50 border-indigo-100 text-indigo-600"
							accentBorderClass="hover:border-indigo-300 hover:ring-2 hover:ring-indigo-500/10"
							topAccentClass="via-indigo-500"
						/>

						<StatCard
							icon={
								<FaRunning className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
							}
							value={`${kmCount}+`}
							label="KM / Year"
							sublabel="Marathon & Trail"
							href="/adventures/running"
							badgeBgColor="bg-emerald-50 border-emerald-100 text-emerald-600"
							accentBorderClass="hover:border-emerald-300 hover:ring-2 hover:ring-emerald-500/10"
							topAccentClass="via-emerald-500"
						/>

						<StatCard
							icon={
								<Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600" />
							}
							value={`${fintechCount}+`}
							label="Fintech Sys."
							sublabel="Core Apps & Infra"
							href="/portfolio"
							badgeBgColor="bg-cyan-50 border-cyan-100 text-cyan-600"
							accentBorderClass="hover:border-cyan-300 hover:ring-2 hover:ring-cyan-500/10"
							topAccentClass="via-cyan-500"
						/>
					</motion.div>

					{/* CTAs + Social links */}
					<motion.div
						variants={item}
						className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full"
					>
						<Link
							href="/work-experience"
							className="group/btn flex items-center justify-center gap-2.5 px-6 py-3 bg-slate-900 text-white !no-underline rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg shadow-slate-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 cursor-pointer"
						>
							<span className="text-white">Explore Work</span>
							<ArrowRight className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-1 transition-transform duration-200" />
						</Link>

						<a
							href={`mailto:${AUTHOR.email}`}
							className="group/btn flex items-center justify-center gap-2.5 px-6 py-3 bg-white border border-slate-200/80 text-slate-900 !no-underline rounded-xl font-bold text-xs uppercase tracking-wider hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all duration-200 shadow-xs hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 cursor-pointer"
						>
							<Mail className="w-3.5 h-3.5 group-hover/btn:rotate-6 transition-transform duration-200 text-slate-700" />
							<span className="text-slate-900">Get in Touch</span>
						</a>

						{/* Social icon links */}
						<div className="flex items-center justify-center gap-2 sm:ml-2 pt-1 sm:pt-0">
							<a
								href={SOCIAL_LINKS.github}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`${AUTHOR.name}'s GitHub`}
								className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl shadow-xs hover:shadow-sm hover:bg-slate-50 transition-all duration-200 !no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 cursor-pointer"
							>
								<FaGithub className="w-4 h-4" />
							</a>
							<a
								href={SOCIAL_LINKS.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`${AUTHOR.name}'s LinkedIn`}
								className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl shadow-xs hover:shadow-sm hover:bg-slate-50 transition-all duration-200 !no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 cursor-pointer"
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
