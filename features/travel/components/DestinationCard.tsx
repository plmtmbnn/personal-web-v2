"use client";

import {
	MapPin,
	Calendar,
	CheckCircle2,
	Star,
	Trash2,
	ArrowUpRight,
	Globe,
	Navigation,
} from "lucide-react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { Destination } from "../types";

type Variant = "visited" | "wishlist";

interface DestinationCardProps {
	destination: Destination;
	index: number;
	variant?: Variant;
	onSelect?: (destination: Destination) => void;
	onMarkVisited?: (id: string) => void;
	onRemove?: (id: string) => void;
	isAdmin?: boolean;
}

// Deterministic ambient tint per destination so cards differ without
// per-country logic that would be fragile. Cycles through a curated
// palette keyed by destination id mod palette length.
const WISHLIST_PALETTES = [
	{
		bg: "bg-indigo-50",
		border: "border-indigo-200/60",
		iconBg: "bg-indigo-100",
		iconText: "text-indigo-500",
		badge: "bg-indigo-100 text-indigo-700",
		accent: "text-indigo-600",
		dot: "bg-indigo-400",
	},
	{
		bg: "bg-amber-50",
		border: "border-amber-200/60",
		iconBg: "bg-amber-100",
		iconText: "text-amber-500",
		badge: "bg-amber-100 text-amber-700",
		accent: "text-amber-600",
		dot: "bg-amber-400",
	},
	{
		bg: "bg-emerald-50",
		border: "border-emerald-200/60",
		iconBg: "bg-emerald-100",
		iconText: "text-emerald-500",
		badge: "bg-emerald-100 text-emerald-700",
		accent: "text-emerald-600",
		dot: "bg-emerald-400",
	},
	{
		bg: "bg-rose-50",
		border: "border-rose-200/60",
		iconBg: "bg-rose-100",
		iconText: "text-rose-500",
		badge: "bg-rose-100 text-rose-700",
		accent: "text-rose-600",
		dot: "bg-rose-400",
	},
	{
		bg: "bg-cyan-50",
		border: "border-cyan-200/60",
		iconBg: "bg-cyan-100",
		iconText: "text-cyan-500",
		badge: "bg-cyan-100 text-cyan-700",
		accent: "text-cyan-600",
		dot: "bg-cyan-400",
	},
	{
		bg: "bg-violet-50",
		border: "border-violet-200/60",
		iconBg: "bg-violet-100",
		iconText: "text-violet-500",
		badge: "bg-violet-100 text-violet-700",
		accent: "text-violet-600",
		dot: "bg-violet-400",
	},
];

function getPalette(id: string) {
	const n = Number.parseInt(id, 10) || 0;
	return WISHLIST_PALETTES[n % WISHLIST_PALETTES.length];
}

export default function DestinationCard({
	destination,
	index,
	variant,
	onSelect,
	onMarkVisited,
	onRemove,
	isAdmin = false,
}: DestinationCardProps) {
	const reduceMotion = useReducedMotion();
	const isVisited = variant ? variant === "visited" : destination.isVisited;
	const palette = getPalette(destination.id);

	const handleClick = () => {
		if (isVisited && onSelect) {
			onSelect(destination);
		}
	};

	const handleVisitToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onMarkVisited && !isVisited) {
			onMarkVisited(destination.id);
		}
	};

	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onRemove) {
			onRemove(destination.id);
		}
	};

	// ── WISHLIST card — typographic vibe, no image ─────────────────────────────
	if (!isVisited) {
		return (
			<motion.article
				initial={reduceMotion ? false : { opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: index * 0.04, duration: 0.35 }}
				className="group flex flex-col h-full cursor-default"
			>
				<div
					className={`flex flex-col h-full rounded-2xl sm:rounded-[1.5rem] border ${palette.bg} ${palette.border} p-5 sm:p-6 relative overflow-hidden transition-shadow duration-300 group-hover:shadow-md`}
				>
					{/* Ambient decorative ring — purely cosmetic */}
					<div
						className={`absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 ${palette.dot} pointer-events-none`}
					/>
					<div
						className={`absolute -bottom-12 -left-6 w-40 h-40 rounded-full opacity-10 ${palette.dot} pointer-events-none`}
					/>

					{/* Header row */}
					<div className="flex items-start justify-between gap-3 relative z-10">
						<div className="flex items-center gap-2.5">
							{/* Domain icon squircle */}
							<div
								className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 bg-white/70 ${palette.border}`}
							>
								<Navigation className={`w-4.5 h-4.5 ${palette.iconText}`} />
							</div>
							<div>
								<p
									className={`text-[9px] font-black uppercase tracking-[0.1em] ${palette.accent}`}
								>
									{destination.type === "international"
										? "International"
										: "Domestic"}
								</p>
								<p className="text-[10px] font-semibold text-slate-500 leading-tight">
									{destination.country}
								</p>
							</div>
						</div>

						{/* Wishlist badge */}
						<span
							className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${palette.badge}`}
						>
							<Star className="w-2.5 h-2.5" />
							Wishlist
						</span>
					</div>

					{/* Destination name — large hero typography */}
					<div className="mt-5 relative z-10 flex-1">
						<h2 className="text-2xl sm:text-[1.75rem] font-extrabold tracking-tight text-slate-900 leading-none">
							{destination.name}
						</h2>
						<div className="flex items-center gap-1.5 mt-2">
							<MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
							<span className="text-xs font-medium text-slate-500 truncate">
								{destination.location}
							</span>
						</div>

						{destination.description && (
							<p className="mt-3.5 text-sm text-slate-600 leading-relaxed line-clamp-3 font-normal">
								{destination.description}
							</p>
						)}
					</div>

					{/* Footer */}
					<div
						className={`mt-5 pt-4 border-t border-current/10 flex items-center justify-between relative z-10`}
						style={{ borderColor: "rgba(0,0,0,0.07)" }}
					>
						<div className="flex items-center gap-1.5">
							<Globe className={`w-3.5 h-3.5 ${palette.accent}`} />
							<span className="text-[11px] font-semibold text-slate-500">
								On the radar
							</span>
						</div>

						{/* Admin actions */}
						<div className="flex items-center gap-1.5">
							{onMarkVisited && (
								<button
									type="button"
									onClick={handleVisitToggle}
									className={`p-1.5 rounded-lg bg-white/60 hover:bg-white text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border ${palette.border}`}
									title="Mark as visited"
									aria-label="Mark as visited"
								>
									<CheckCircle2 className="w-3.5 h-3.5" />
								</button>
							)}
							{isAdmin && onRemove && (
								<button
									type="button"
									onClick={handleRemove}
									className="p-1.5 rounded-lg bg-white/60 hover:bg-rose-500 hover:text-white text-slate-500 transition-colors cursor-pointer"
									title="Remove destination"
									aria-label="Remove destination"
								>
									<Trash2 className="w-3.5 h-3.5" />
								</button>
							)}
						</div>
					</div>
				</div>
			</motion.article>
		);
	}

	// ── VISITED card — rich image card ─────────────────────────────────────────
	return (
		<motion.article
			initial={reduceMotion ? false : { opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.04, duration: 0.35 }}
			className="group flex flex-col h-full cursor-pointer"
			onClick={handleClick}
		>
			{/* Top Rounded Image (Aspect 4/3) */}
			<div className="relative w-full aspect-[4/3] rounded-2xl sm:rounded-[1.5rem] overflow-hidden bg-slate-100 shadow-xs border border-slate-200/60">
				<Image
					src={destination.imageUrl
						.replace(/w=\d+/, "w=800")
						.replace(/h=\d+/, "h=600")}
					alt={`${destination.name}, ${destination.location}, ${destination.country}`}
					fill
					className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					priority={index === 0}
					loading={index === 0 ? "eager" : "lazy"}
				/>

				{/* Status + category badges */}
				<div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
					<span className="px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs border border-white/60 flex items-center gap-1.5">
						<CheckCircle2 className="w-3 h-3 text-emerald-600" />
						<span>Visited</span>
					</span>
					<span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-xs">
						{destination.type}
					</span>
				</div>

				{/* Quick admin actions */}
				{isAdmin && onRemove && (
					<div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
						<button
							type="button"
							onClick={handleRemove}
							className="p-1.5 bg-white/90 backdrop-blur-md rounded-full hover:bg-rose-500 hover:text-white text-slate-700 transition-colors shadow-xs cursor-pointer"
							title="Remove destination"
							aria-label="Remove destination"
						>
							<Trash2 className="w-3.5 h-3.5" />
						</button>
					</div>
				)}
			</div>

			{/* Card Text Content */}
			<div className="mt-5 sm:mt-6 flex-1 flex flex-col justify-between">
				<div>
					<h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-snug line-clamp-1 transition-colors group-hover:text-emerald-700">
						{destination.name}
					</h2>

					<div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-1">
						<MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span className="truncate">{destination.location}</span>
						<span>·</span>
						<span className="shrink-0">{destination.country}</span>
					</div>

					{destination.description && (
						<p className="mt-2.5 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed line-clamp-2">
							{destination.description}
						</p>
					)}
				</div>

				{/* Card Footer Action */}
				<div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs">
					<div className="flex items-center gap-1.5 text-slate-400 font-medium">
						<Calendar className="w-3.5 h-3.5 text-emerald-600" />
						<span>
							{destination.visitedDate
								? new Date(`${destination.visitedDate}-01`).toLocaleDateString(
										"en-US",
										{
											month: "short",
											year: "numeric",
											timeZone: "UTC",
										},
									)
								: "Explored"}
						</span>
					</div>

					<div className="inline-flex items-center gap-1 font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
						<span>View Postcard</span>
						<ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
					</div>
				</div>
			</div>
		</motion.article>
	);
}
