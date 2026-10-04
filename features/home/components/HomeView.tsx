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
		<div className="flex items-center justify-between w-full">
			<div className="flex items-center gap-3 min-w-0">
				<div className={`p-2 rounded-xl border ${color} shrink-0`}>
					<Icon className="text-sm" />
				</div>
				<div className="min-w-0">
					<p
						className={`text-[9px] font-black uppercase tracking-widest truncate ${dark ? "text-slate-400" : "text-slate-400"}`}
					>
						{label}
					</p>
					<p
						className={`text-xs font-bold truncate ${dark ? "text-white" : "text-slate-900"}`}
					>
						{value}
					</p>
				</div>
			</div>
			{href && (
				<div className="shrink-0 pl-2">
					<div
						className={`p-1.5 rounded-lg transition-colors ${dark ? "text-white/50 group-hover:text-white group-hover:bg-white/10" : "text-slate-400 group-hover:text-indigo-600 group-hover:bg-slate-100"}`}
					>
						{isExternal ? (
							<ArrowUpRight className="w-3.5 h-3.5" />
						) : (
							<ArrowRight className="w-3.5 h-3.5" />
						)}
					</div>
				</div>
			)}
		</div>
	);

	const className = `rounded-2xl border shadow-xs p-3.5 flex items-center transition-[border-color,box-shadow,transform] duration-200 group hover:shadow-sm ${dark ? "bg-slate-900 border-slate-800 hover:border-slate-700 hover:-translate-y-0.5" : "bg-white border-slate-200/80 hover:border-slate-300 hover:-translate-y-0.5"}`;

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
			<div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10 my-auto">
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
						className="flex items-center gap-4 mb-6 sm:mb-8"
					>
						<div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs shrink-0 bg-slate-100">
							<Image
								src="/profile.jpg"
								alt={AUTHOR.name}
								fill
								className="object-cover grayscale-[20%]"
								sizes="64px"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<h2 className="text-[13px] font-black uppercase tracking-widest text-slate-900">
								{AUTHOR.name}
							</h2>
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200/80 shadow-xs text-[10px] font-semibold text-slate-600 w-fit">
								<span
									className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-emerald-500" : "bg-slate-300"}`}
								/>
								{isActive ? "Active & building" : "Resting · offline"}
							</span>
						</div>
					</motion.div>

					{/* Headline */}
					<motion.h1
						variants={itemVariants}
						className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05] mb-5 sm:mb-6"
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
						className="text-sm text-slate-500 font-medium leading-relaxed mb-6 sm:mb-7 max-w-sm"
					>
						Software Engineer specializing in fintech core architecture, lending
						platforms, and scalable data solutions.
					</motion.p>

					{/* Location + time strip */}
					<motion.div
						variants={itemVariants}
						className="flex flex-col gap-2.5 mt-8"
					>
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-xs">
								<MapPin className="text-[13px] text-indigo-500" />
							</div>
							<div>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Location
								</p>
								<p className="text-xs font-bold text-slate-800">
									Toba, Indonesia · UTC+7
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-xs">
								<Clock className="text-[13px] text-indigo-500" />
							</div>
							<div className="flex items-baseline gap-2 min-w-0">
								<p className="font-mono text-xs font-bold text-slate-800 tabular-nums">
									{localTime || "--:--:--"}
								</p>
								<span className="text-[10px] font-semibold text-slate-400 truncate">
									Local time
								</span>
							</div>
						</div>
					</motion.div>
				</motion.div>

				{/* ── Right Content (Span 6) ─────────────────────────────────── */}
				<motion.div
					className="lg:col-span-6 w-full space-y-3 lg:pl-4 mt-10 lg:mt-0"
					initial={reduceMotion ? false : { opacity: 0, y: 18 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.45,
						delay: 0.1,
						ease: [0.25, 0.1, 0.25, 1],
					}}
				>
					{/* Metrics Panel */}
					<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
						<div className="flex items-center justify-between mb-4">
							<span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
								<Layers className="w-3.5 h-3.5 text-indigo-500" />
								Professional Impact
							</span>
						</div>

						<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
							<div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:bg-slate-100/80 hover:border-slate-300 transition-colors flex flex-col gap-2.5">
								<div className="p-1.5 rounded-lg w-fit bg-white border border-slate-200">
									<Briefcase className="w-3.5 h-3.5 text-slate-600" />
								</div>
								<span className="text-[10px] font-bold text-slate-700 leading-snug">
									{yearsCount}+ Years
									<br />
									Engineering
								</span>
							</div>
							<div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:bg-slate-100/80 hover:border-slate-300 transition-colors flex flex-col gap-2.5">
								<div className="p-1.5 rounded-lg w-fit bg-white border border-slate-200">
									<Activity className="w-3.5 h-3.5 text-slate-600" />
								</div>
								<span className="text-[10px] font-bold text-slate-700 leading-snug">
									{kmCount.toLocaleString()}+ Km
									<br />
									Run in {year}
								</span>
							</div>
							<div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:bg-slate-100/80 hover:border-slate-300 transition-colors flex flex-col gap-2.5 col-span-2 sm:col-span-1">
								<div className="p-1.5 rounded-lg w-fit bg-white border border-slate-200">
									<Cpu className="w-3.5 h-3.5 text-slate-600" />
								</div>
								<span className="text-[10px] font-bold text-slate-700 leading-snug">
									{fintechCount}+ Fintech
									<br />
									Systems
								</span>
							</div>
						</div>
					</div>

					{/* Direct Channels */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
