"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ElementType, ReactNode } from "react";

export interface UtilHeaderProps {
	title: string;
	description?: string;
	category?: {
		label?: string;
		sublabel?: string;
		icon?: ElementType;
		color?: "indigo" | "emerald" | "sky" | "amber" | "purple" | "rose" | "blue";
	};
	icon: ElementType;
	badges?: ReactNode;
	actions?: ReactNode;
	className?: string;
}

const COLOR_MAP: Record<
	string,
	{ squircle: string; badge: string; dot: string }
> = {
	indigo: {
		squircle:
			"bg-indigo-50 border border-indigo-200/70 text-indigo-600 shadow-2xs",
		badge: "bg-indigo-50 border border-indigo-100/80 text-indigo-700",
		dot: "bg-indigo-400",
	},
	emerald: {
		squircle:
			"bg-emerald-50 border border-emerald-200/70 text-emerald-600 shadow-2xs",
		badge: "bg-emerald-50 border border-emerald-100/80 text-emerald-700",
		dot: "bg-emerald-400",
	},
	sky: {
		squircle: "bg-sky-50 border border-sky-200/70 text-sky-600 shadow-2xs",
		badge: "bg-sky-50 border border-sky-100/80 text-sky-700",
		dot: "bg-sky-400",
	},
	blue: {
		squircle: "bg-blue-50 border border-blue-200/70 text-blue-600 shadow-2xs",
		badge: "bg-blue-50 border border-blue-100/80 text-blue-700",
		dot: "bg-blue-400",
	},
	amber: {
		squircle:
			"bg-amber-50 border border-amber-200/70 text-amber-700 shadow-2xs",
		badge: "bg-amber-50 border border-amber-100/80 text-amber-800",
		dot: "bg-amber-400",
	},
	purple: {
		squircle:
			"bg-purple-50 border border-purple-200/70 text-purple-600 shadow-2xs",
		badge: "bg-purple-50 border border-purple-100/80 text-purple-700",
		dot: "bg-purple-400",
	},
	rose: {
		squircle: "bg-rose-50 border border-rose-200/70 text-rose-600 shadow-2xs",
		badge: "bg-rose-50 border border-rose-100/80 text-rose-700",
		dot: "bg-rose-400",
	},
};

export default function UtilHeader({
	title,
	description,
	category,
	icon: Icon,
	badges,
	actions,
	className = "",
}: UtilHeaderProps) {
	const reduceMotion = useReducedMotion();
	const colorTheme = category?.color || "indigo";
	const colorStyles = COLOR_MAP[colorTheme] || COLOR_MAP.indigo;

	return (
		<motion.header
			initial={reduceMotion ? false : { opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200/80 shadow-xs space-y-4 sm:space-y-5 ${className}`}
		>
			{/* ── Tier 1: Top Navigation Bar ──────────────────────────────── */}
			<div className="flex items-center justify-between gap-2.5 sm:gap-3 pb-3.5 sm:pb-4 border-b border-slate-100">
				{/* Breadcrumb Trail */}
				<nav
					aria-label="Breadcrumb"
					className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-slate-400 min-w-0"
				>
					<Link
						href="/"
						className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline shrink-0"
					>
						Home
					</Link>
					<ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
					<Link
						href="/utils"
						className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline shrink-0"
					>
						Utilities
					</Link>
					<ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
					<span className="text-slate-900 font-bold truncate max-w-[120px] sm:max-w-[240px] md:max-w-none">
						{title}
					</span>
				</nav>

				{/* Back to Utilities Return Action */}
				<Link
					href="/utils"
					className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-600 hover:text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-[background-color,color] active:scale-95 cursor-pointer !no-underline shrink-0 group"
				>
					<ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
					<span className="hidden sm:inline">Back to Utilities</span>
					<span className="sm:hidden">Back</span>
				</Link>
			</div>

			{/* ── Tier 2: Hero Visual Anchor, Title & Description ──────────── */}
			<div className="flex items-start gap-3.5 sm:gap-5">
				{/* Elevated Domain Icon Squircle */}
				<div
					className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${colorStyles.squircle} flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}
				>
					<Icon className="w-5 h-5 sm:w-7 sm:h-7" />
				</div>

				<div className="space-y-1.5 min-w-0 flex-1">
					<div className="flex flex-wrap items-center justify-between gap-2.5">
						{/* Bold Headline */}
						<h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight break-words">
							{title}
						</h1>
						{badges && (
							<div className="flex items-center gap-2 flex-wrap">{badges}</div>
						)}
					</div>

					{/* Lede Subtitle / Description */}
					{description && (
						<p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">
							{description}
						</p>
					)}
				</div>
			</div>

			{/* ── Tier 3: Action Strip (Presets, Controls, Buttons) ────────── */}
			{actions && (
				<div className="pt-3.5 sm:pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
					{actions}
				</div>
			)}
		</motion.header>
	);
}
