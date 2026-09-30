"use client";

import {
	AUTHOR,
	AUTHOR_STATS,
	EXPERIENCE_YEAR,
	SOCIAL_LINKS,
} from "@/lib/shared/constants";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
	motion,
	type Variants,
	animate,
	useReducedMotion,
	useMotionValue,
	useTransform,
	useSpring,
} from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { ArrowRight, Mail, Briefcase, Activity, Layers } from "lucide-react";

// ─── Animation Variants ────────────────────────────────────────────────────────

const container: Variants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.07, delayChildren: 0.05 },
	},
};

const item: Variants = {
	hidden: { opacity: 0, y: 18 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.42, ease: [0.25, 0.1, 0.25, 1] },
	},
};

const photoVariant: Variants = {
	hidden: { opacity: 0, scale: 0.92, y: 16 },
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
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

// ─── Tilt Card ─────────────────────────────────────────────────────────────────

function TiltCard({ children }: { children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);
	const reduceMotion = useReducedMotion();

	const rawX = useMotionValue(0);
	const rawY = useMotionValue(0);

	const springConfig = { stiffness: 180, damping: 22 };
	const springX = useSpring(rawX, springConfig);
	const springY = useSpring(rawY, springConfig);

	const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
	const rotateY = useTransform(springX, [-0.5, 0.5], [-6, 6]);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (reduceMotion || !ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		rawX.set((e.clientX - rect.left) / rect.width - 0.5);
		rawY.set((e.clientY - rect.top) / rect.height - 0.5);
	};

	const handleMouseLeave = () => {
		rawX.set(0);
		rawY.set(0);
	};

	return (
		<motion.div
			ref={ref}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={
				reduceMotion ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }
			}
			className="relative cursor-default"
		>
			{children}
		</motion.div>
	);
}

// ─── Bento Stat Card ───────────────────────────────────────────────────────────

interface StatCardProps {
	icon: React.ReactNode;
	count: number;
	suffix?: string;
	label: string;
	href: string;
	accentHover: string;
	iconBgClass: string;
}

function StatCard({
	icon,
	count,
	suffix = "+",
	label,
	href,
	accentHover,
	iconBgClass,
}: StatCardProps) {
	return (
		<motion.div variants={item}>
			<Link
				href={href}
				className={`group/stat block bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow] duration-300 !no-underline ${accentHover}`}
				tabIndex={0}
			>
				<div
					className={`inline-flex items-center justify-center w-8 h-8 rounded-xl mb-3 ${iconBgClass}`}
				>
					{icon}
				</div>
				<div className="flex items-baseline gap-0.5">
					<span className="text-2xl font-extrabold tabular-nums tracking-tight text-slate-900">
						{count.toLocaleString()}
					</span>
					<span className="text-sm font-bold text-slate-400">{suffix}</span>
				</div>
				<p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
					{label}
				</p>
			</Link>
		</motion.div>
	);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface HomeProps {
	initialRunningKm?: number;
}

export default function Home({
	initialRunningKm = AUTHOR_STATS.runningKmPerYear,
}: HomeProps) {
	const reduceMotion = useReducedMotion();
	const yearsCount = useCounter(EXPERIENCE_YEAR, 1.4);
	const kmCount = useCounter(initialRunningKm, 2.0);
	const fintechCount = useCounter(AUTHOR_STATS.fintechSystems, 1.2);
	const year = new Date().getFullYear();

	return (
		<main className="min-h-screen lg:h-screen lg:max-h-[100dvh] bg-slate-50/80 bg-dot-pattern relative flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-x-hidden overflow-y-auto lg:overflow-hidden py-20 pb-32 sm:py-24 sm:pb-36 lg:py-0 lg:pb-0">
			<div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center relative z-10 my-auto">
				{/* ── Right — Photo + floating chips ────────────────────────── */}
				<motion.div
					className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2"
					variants={photoVariant}
					initial={reduceMotion ? false : "hidden"}
					animate="visible"
				>
					<TiltCard>
						{/* Depth shadow layers */}
						<div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2.5rem] bg-slate-200/50 -z-10" />
						<div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-[2.5rem] bg-slate-100 border border-slate-200/50 -z-10" />

						{/* Main photo card */}
						<div className="relative w-64 h-64 sm:w-[288px] sm:h-[288px] lg:w-[300px] lg:h-[300px] rounded-[2.5rem] p-3 bg-white border border-slate-200/80 shadow-sm group/photo transition-shadow duration-500 hover:shadow-lg">
							<div className="w-full h-full rounded-[2rem] overflow-hidden">
								<Image
									src="/profile.jpg"
									alt={`${AUTHOR.name} — Software Engineer and Distance Runner`}
									className="w-full h-full object-cover grayscale-[15%] group-hover/photo:grayscale-0 group-hover/photo:scale-[1.03] transition-[filter,transform] duration-500"
									priority
									width={400}
									height={400}
									sizes="(max-width: 640px) 256px, (max-width: 1024px) 288px, 300px"
								/>
							</div>

							{/* Open to work badge — pinned bottom-center */}
							{AUTHOR.available && (
								<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/80 rounded-full shadow-xs whitespace-nowrap">
									<div className="relative flex-shrink-0">
										<div className="w-2 h-2 bg-emerald-500 rounded-full" />
										<div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
									</div>
									<span className="text-[10.5px] font-bold text-slate-700">
										Open to work
									</span>
								</div>
							)}
						</div>

						{/* Floating accent chip — top-right */}
						<div className="absolute -top-3 -right-3 flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-full px-3 py-1.5 shadow-xs">
							<Activity
								className="w-3 h-3 text-emerald-500"
								strokeWidth={2.5}
							/>
							<span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
								Runner
							</span>
						</div>

						{/* Floating accent chip — bottom-left */}
						<div className="absolute -bottom-3 -left-3 flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-full px-3 py-1.5 shadow-xs">
							<Layers className="w-3 h-3 text-indigo-500" strokeWidth={2.5} />
							<span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
								Engineering
							</span>
						</div>
					</TiltCard>
				</motion.div>

				{/* ── Left — Content ──────────────────────────────────────────── */}
				<motion.div
					className="lg:col-span-7 order-2 lg:order-1 w-full max-w-2xl mx-auto lg:mx-0"
					variants={container}
					initial={reduceMotion ? false : "hidden"}
					animate="visible"
				>
					{/* Eyebrow */}
					<motion.p
						variants={item}
						className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-[0.12em] uppercase mb-4"
					>
						{AUTHOR.name}&nbsp;&nbsp;·&nbsp;&nbsp;{AUTHOR.role}
						&nbsp;&nbsp;·&nbsp;&nbsp;Toba, ID
					</motion.p>

					{/* Headline — dominant editorial block */}
					<motion.h1
						variants={item}
						className="text-[2.6rem] sm:text-6xl lg:text-[3.9rem] font-extrabold tracking-tight text-slate-900 leading-[1.04] mb-5 sm:mb-6"
					>
						Engineering systems
						<br />
						<span className="text-slate-400">by day.</span> Miles
						<span className="text-slate-400">{" everywhere."}</span>
					</motion.h1>

					{/* Bio */}
					<motion.p
						variants={item}
						className="text-sm sm:text-[0.95rem] text-slate-500 leading-relaxed font-medium mb-7 sm:mb-8 max-w-[480px]"
					>
						Building reliable systems that scale — and logging every kilometre,
						whether it's road, trail, peak, or treadmill.
					</motion.p>

					{/* ── Bento stat grid ── */}
					<motion.div
						variants={container}
						className="grid grid-cols-3 gap-3 mb-8 sm:mb-9"
					>
						<StatCard
							icon={
								<Briefcase
									className="w-4 h-4 text-indigo-600"
									strokeWidth={2}
								/>
							}
							count={yearsCount}
							label="yrs engineering"
							href="/work-experience"
							accentHover="hover:[&_.stat-num]:text-indigo-600"
							iconBgClass="bg-indigo-50 border border-indigo-200/60"
						/>
						<StatCard
							icon={
								<Activity
									className="w-4 h-4 text-emerald-600"
									strokeWidth={2}
								/>
							}
							count={kmCount}
							label={`km in ${year}`}
							href="/adventures/running"
							accentHover="hover:[&_.stat-num]:text-emerald-600"
							iconBgClass="bg-emerald-50 border border-emerald-200/60"
						/>
						<StatCard
							icon={
								<Layers className="w-4 h-4 text-cyan-600" strokeWidth={2} />
							}
							count={fintechCount}
							label="fintech systems"
							href="/portfolio"
							accentHover="hover:[&_.stat-num]:text-cyan-600"
							iconBgClass="bg-cyan-50 border border-cyan-200/60"
						/>
					</motion.div>

					{/* ── CTAs + social ── */}
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

						<span className="hidden sm:inline text-slate-200 select-none px-1">
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
