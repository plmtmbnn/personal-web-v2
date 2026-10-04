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
import {
	ArrowRight,
	ArrowUpRight,
	Mail,
	Briefcase,
	Activity,
	Layers,
	MapPin,
	Cpu,
	Clock,
} from "lucide-react";

// ─── Animation Variants ────────────────────────────────────────────────────────

const containerVariants: Variants = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 14 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.38, ease: "easeOut" },
	},
};

// ─── Animated Counter ──────────────────────────────────────────────────────────

const useCounter = (to: number, duration = 1.2) => {
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

// ─── Reusable Channel Component ────────────────────────────────────────────────

interface ChannelProps {
	icon: React.ElementType;
	label: string;
	value: string;
	color: string;
	href?: string;
	isExternal?: boolean;
	dark?: boolean;
}

function MetricChannel({
	icon: Icon,
	label,
	value,
	color,
	href,
	isExternal,
	dark,
}: ChannelProps) {
	const inner = (
		<div className="flex items-center justify-between w-full relative z-10">
			<div className="flex items-center gap-3.5 min-w-0">
				<div className={`p-2.5 rounded-xl border ${color} shrink-0`}>
					<Icon className="w-4 h-4" />
				</div>
				<div className="min-w-0">
					<p
						className={`text-[10px] font-black uppercase tracking-widest truncate ${dark ? "text-slate-400" : "text-slate-400"}`}
					>
						{label}
					</p>
					<p
						className={`text-sm font-bold truncate ${dark ? "text-white" : "text-slate-900"}`}
					>
						{value}
					</p>
				</div>
			</div>
			{href && (
				<div className="shrink-0 pl-2">
					<div
						className={`p-1.5 rounded-lg transition-transform duration-300 group-hover:translate-x-0.5 ${dark ? "text-white/50 group-hover:text-white" : "text-slate-400 group-hover:text-slate-900"}`}
					>
						{isExternal ? (
							<ArrowUpRight className="w-4 h-4" />
						) : (
							<ArrowRight className="w-4 h-4" />
						)}
					</div>
				</div>
			)}
		</div>
	);

	const className = `group relative overflow-hidden rounded-2xl border p-4 flex items-center transition-all duration-300 ${dark ? "bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-slate-900/20" : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/50"}`;

	if (href) {
		if (isExternal) {
			return (
				<a
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className={`block w-full !no-underline ${className}`}
				>
					{inner}
				</a>
			);
		}
		return (
			<Link href={href} className={`block w-full !no-underline ${className}`}>
				{inner}
			</Link>
		);
	}
	return <div className={`w-full ${className}`}>{inner}</div>;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface HomeProps {
	initialRunningKm?: number;
}

export default function Home({
	initialRunningKm = AUTHOR_STATS.runningKmPerYear,
}: HomeProps) {
	const reduceMotion = useReducedMotion();
	const yearsCount = useCounter(EXPERIENCE_YEAR, 1.2);
	const kmCount = useCounter(initialRunningKm, 1.5);
	const fintechCount = useCounter(AUTHOR_STATS.fintechSystems, 1.0);
	const year = new Date().getFullYear();

	const [localTime, setLocalTime] = useState("");
	const [isActive, setIsActive] = useState(false);

	useEffect(() => {
		const updateStatusAndClock = () => {
			const now = new Date();
			const time = new Intl.DateTimeFormat("en-US", {
				timeZone: "Asia/Jakarta",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			}).format(now);
			setLocalTime(time);

			const utcHour = now.getUTCHours();
			const jakartaHour = (utcHour + 7 + 24) % 24;
			setIsActive(jakartaHour >= 8 && jakartaHour < 22);
		};

		updateStatusAndClock();
		const timer = setInterval(updateStatusAndClock, 1000);
		return () => clearInterval(timer);
	}, []);

	return (
		<main className="min-h-screen lg:h-screen lg:max-h-[100dvh] bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden overflow-y-auto lg:overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 pb-32 sm:py-24 sm:pb-36 lg:py-0 lg:pb-0">
			<div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center relative z-10 my-auto">
				{/* ── Left Content (Span 6) ─────────────────────────────────── */}
				<motion.div
					className="lg:col-span-6 w-full"
					variants={containerVariants}
					initial={reduceMotion ? false : "hidden"}
					animate="visible"
				>
					{/* Avatar & Status chip */}
					<motion.div
						variants={itemVariants}
						className="flex items-center gap-4 sm:gap-5 mb-7 sm:mb-8"
					>
						<div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] overflow-hidden border border-slate-200/80 shadow-sm shrink-0 bg-slate-100">
							<Image
								src="/profile.jpg"
								alt={AUTHOR.name}
								fill
								className="object-cover grayscale-[15%] transition-all duration-500 hover:grayscale-0 hover:scale-105"
								sizes="(max-width: 640px) 64px, 80px"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-900">
								{AUTHOR.name}
							</h2>
							<span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-[10px] font-semibold text-slate-600 w-fit">
								<span className="relative flex h-2 w-2">
									{isActive && (
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
									)}
									<span
										className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? "bg-emerald-500" : "bg-slate-300"}`}
									></span>
								</span>
								{isActive ? "Active & building" : "Resting (offline)"}
							</span>
						</div>
					</motion.div>

					{/* Headline */}
					<motion.h1
						variants={itemVariants}
						className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-5 sm:mb-6"
					>
						Engineering
						<br />
						systems <span className="text-slate-400">by day.</span>
						<br />
						Miles <span className="text-slate-400">everywhere.</span>
					</motion.h1>

					{/* Sub-copy */}
					<motion.p
						variants={itemVariants}
						className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed mb-8 sm:mb-10 max-w-sm"
					>
						Software Engineer specializing in fintech core architecture, lending
						platforms, and scalable data solutions.
					</motion.p>

					{/* Location + time strip (Reimagined as compact cards) */}
					<motion.div
						variants={itemVariants}
						className="grid grid-cols-2 gap-3 max-w-md"
					>
						<div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
							<div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
								<MapPin className="w-3.5 h-3.5 text-indigo-500" />
							</div>
							<div className="min-w-0">
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5 truncate">
									Base
								</p>
								<p className="text-xs font-bold text-slate-800 truncate">
									Toba, ID
								</p>
							</div>
						</div>
						<div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
							<div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
								<Clock className="w-3.5 h-3.5 text-emerald-500" />
							</div>
							<div className="min-w-0">
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5 truncate">
									Local Time
								</p>
								<p className="font-mono text-xs font-bold text-slate-800 tabular-nums truncate">
									{localTime || "--:--:--"}
								</p>
							</div>
						</div>
					</motion.div>
				</motion.div>

				{/* ── Right Content (Span 6) ─────────────────────────────────── */}
				<motion.div
					className="lg:col-span-6 w-full space-y-4 lg:pl-6 mt-12 lg:mt-0"
					initial={reduceMotion ? false : { opacity: 0, y: 18 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.45,
						delay: 0.1,
						ease: [0.25, 0.1, 0.25, 1],
					}}
				>
					{/* Metrics Panel */}
					<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm p-5 sm:p-6">
						<div className="flex items-center justify-between mb-5">
							<span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
								<Layers className="w-4 h-4 text-indigo-500" />
								Professional Impact
							</span>
						</div>

						<div className="grid grid-cols-3 gap-2 sm:gap-3">
							<div className="px-2 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col items-center justify-center text-center gap-1.5 transition-colors hover:bg-slate-50">
								<Briefcase className="w-4 h-4 text-slate-400 mb-1" />
								<span className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">
									{yearsCount}+
								</span>
								<span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
									Years
								</span>
							</div>
							<div className="px-2 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col items-center justify-center text-center gap-1.5 transition-colors hover:bg-slate-50">
								<Activity className="w-4 h-4 text-slate-400 mb-1" />
								<span className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">
									{kmCount.toLocaleString()}+
								</span>
								<span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
									Km / {year}
								</span>
							</div>
							<div className="px-2 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col items-center justify-center text-center gap-1.5 transition-colors hover:bg-slate-50">
								<Cpu className="w-4 h-4 text-slate-400 mb-1" />
								<span className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">
									{fintechCount}+
								</span>
								<span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
									Systems
								</span>
							</div>
						</div>
					</div>

					{/* Direct Channels */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						<MetricChannel
							icon={ArrowRight}
							label="Explore Work"
							value="View Experience"
							color="bg-slate-800 border-slate-700 text-white"
							dark
							href="/work-experience"
						/>
						<MetricChannel
							icon={Mail}
							label="Contact"
							value="Get in Touch"
							color="bg-slate-50 border-slate-200 text-slate-600"
							href="/contact"
						/>
						<MetricChannel
							icon={FaGithub}
							label="GitHub"
							value="@plmtmbnn"
							color="bg-slate-100 border-slate-200 text-slate-700"
							href={SOCIAL_LINKS.github}
							isExternal
						/>
						<MetricChannel
							icon={FaLinkedin}
							label="LinkedIn"
							value="polma-tambunan"
							color="bg-blue-50 border-blue-100 text-blue-600"
							href={SOCIAL_LINKS.linkedin}
							isExternal
						/>
					</div>
				</motion.div>
			</div>
		</main>
	);
}
