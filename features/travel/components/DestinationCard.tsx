"use client";

import {
	MapPin,
	Calendar,
	CheckCircle2,
	ArrowUpRight,
	Map as MapIcon,
	Compass,
	Lock,
	Radio,
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
}

// High-level generalized regional archetype without leaking private itinerary
function getTeaserRegion(dest: Destination): string {
	if (dest.type === "domestic") {
		return "Domestic Archipelago";
	}
	if (
		dest.country === "United Kingdom" ||
		dest.country === "France" ||
		dest.country === "Netherlands" ||
		dest.country === "Iceland"
	) {
		return "European Horizon";
	}
	if (dest.country === "Japan" || dest.country === "China") {
		return "East Asian Corridor";
	}
	return "Southeast Asian Trail";
}

export default function DestinationCard({
	destination,
	index,
	variant,
	onSelect,
}: DestinationCardProps) {
	const reduceMotion = useReducedMotion();
	const isVisited = variant ? variant === "visited" : destination.isVisited;

	const handleClick = () => {
		if (isVisited && onSelect) {
			onSelect(destination);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			if (isVisited && onSelect) {
				e.preventDefault();
				onSelect(destination);
			}
		}
	};

	const visitedDate = destination.visitedDate
		? new Date(`${destination.visitedDate}-01`).toLocaleDateString("en-US", {
				month: "short",
				year: "numeric",
				timeZone: "UTC",
			})
		: null;

	// ── VISITED card: image-forward floating card with postcard action ──
	if (isVisited) {
		return (
			<motion.article
				initial={reduceMotion ? false : { opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: index * 0.04, duration: 0.35 }}
				className="group flex flex-col h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-[2rem]"
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				role="button"
				tabIndex={0}
				whileHover={reduceMotion ? {} : { y: -4 }}
				aria-label={`View postcard for ${destination.name}`}
			>
				<div className="flex flex-col h-full bg-white rounded-[2rem] border border-slate-200/80 shadow-xs group-hover:shadow-md transition-shadow duration-300 overflow-hidden">
					{/* Image */}
					<div className="relative w-full aspect-4/3 overflow-hidden bg-slate-100">
						<Image
							src={destination.imageUrl
								.replace(/w=\d+/, "w=800")
								.replace(/h=\d+/, "h=600")}
							alt={`${destination.name}, ${destination.location}, ${destination.country}`}
							fill
							className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
							priority={index === 0}
							loading={index === 0 ? "eager" : "lazy"}
						/>

						{/* Overlay badges */}
						<div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
							<span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs border border-white/60 flex items-center gap-1.5">
								<CheckCircle2 className="w-3 h-3 text-emerald-600" />
								Visited
							</span>
							<span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider rounded-full">
								{destination.type}
							</span>
						</div>
					</div>

					{/* Text content */}
					<div className="flex flex-col flex-1 p-5 sm:p-6">
						<div className="flex-1">
							<h2 className="text-lg font-bold tracking-tight text-slate-900 leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors duration-200">
								{destination.name}
							</h2>
							<div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400 font-medium">
								<MapPin className="w-3.5 h-3.5 shrink-0" />
								<span className="truncate">{destination.location}</span>
								<span className="shrink-0 text-slate-400">,</span>
								<span className="shrink-0">{destination.country}</span>
							</div>
							{destination.description && (
								<p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2 font-normal">
									{destination.description}
								</p>
							)}
						</div>

						{/* Footer */}
						<div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
							<div className="flex items-center gap-1.5 text-slate-400 font-medium">
								<Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
								<span>{visitedDate ?? "Explored"}</span>
							</div>
							<div className="inline-flex items-center gap-1 font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors duration-200">
								<MapIcon className="w-3.5 h-3.5" />
								<span>Postcard</span>
								<ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
							</div>
						</div>
					</div>
				</div>
			</motion.article>
		);
	}

	// ── ON THE RADAR (WISHLIST) card: classified & redacted teaser card ──
	const targetCode = `EXP-${String(index + 1).padStart(2, "0")}`;
	const regionalHint = getTeaserRegion(destination);

	return (
		<motion.article
			initial={reduceMotion ? false : { opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.04, duration: 0.35 }}
			className="group flex flex-col h-full select-none"
			whileHover={reduceMotion ? {} : { y: -3 }}
			aria-label={`Classified destination ${targetCode}`}
		>
			<div className="flex flex-col h-full bg-white rounded-[2rem] border border-slate-200/80 shadow-xs group-hover:shadow-md transition-shadow duration-300 overflow-hidden">
				{/* Atmospheric Radar Cover */}
				<div className="relative w-full aspect-4/3 overflow-hidden bg-slate-900 flex items-center justify-center">
					{/* Concentric Radar Grid Background */}
					<svg
						className="absolute inset-0 w-full h-full opacity-20"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<circle
							cx="50%"
							cy="50%"
							r="20%"
							fill="none"
							stroke="currentColor"
							strokeWidth="1"
							className="text-slate-400"
						/>
						<circle
							cx="50%"
							cy="50%"
							r="40%"
							fill="none"
							stroke="currentColor"
							strokeWidth="1"
							className="text-slate-400"
						/>
						<circle
							cx="50%"
							cy="50%"
							r="60%"
							fill="none"
							stroke="currentColor"
							strokeWidth="1"
							className="text-slate-400"
						/>
						<line
							x1="0%"
							y1="50%"
							x2="100%"
							y2="50%"
							stroke="currentColor"
							strokeWidth="0.75"
							className="text-slate-600"
						/>
						<line
							x1="50%"
							y1="0%"
							x2="50%"
							y2="100%"
							stroke="currentColor"
							strokeWidth="0.75"
							className="text-slate-600"
						/>
					</svg>

					{/* Center Radar Icon Squircle */}
					<div className="relative z-10 w-12 h-12 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-md">
						<Radio className="w-5 h-5 animate-pulse" />
					</div>

					{/* Overlay Badges */}
					<div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
						<span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-500/25 flex items-center gap-1.5 shadow-2xs">
							<Compass className="w-3 h-3 text-amber-400" />
							On the Radar
						</span>
					</div>

					<div className="absolute top-3.5 right-3.5 z-10">
						<span className="px-2 py-1 bg-slate-950/80 backdrop-blur-md text-slate-300 text-[9px] font-bold uppercase tracking-wider rounded-full border border-slate-700/60 flex items-center gap-1">
							<Lock className="w-2.5 h-2.5 text-slate-400" />
							Classified
						</span>
					</div>

					{/* Bottom Code Indicator */}
					<div className="absolute bottom-3 left-3.5 z-10">
						<span className="font-mono text-[10px] font-bold tracking-wider text-slate-300 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-800">
							{targetCode}
						</span>
					</div>
				</div>

				{/* Redacted & Confidential Content */}
				<div className="flex flex-col flex-1 p-5 sm:p-6 justify-between">
					<div className="space-y-2">
						<div>
							<h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-snug">
								{regionalHint}
							</h2>
							<div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-medium">
								<MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
								<span className="font-mono text-[11px] text-slate-500">
									Coordinates: [REDACTED]
								</span>
								<span className="text-slate-300">/</span>
								<span className="text-slate-600 font-semibold uppercase text-[10px] tracking-wide">
									{destination.type}
								</span>
							</div>
						</div>

						{/* Redacted Mission Blocks */}
						<div className="pt-2 space-y-1.5">
							<div className="h-2.5 w-4/5 bg-slate-200/80 rounded-sm" />
							<div className="h-2.5 w-3/5 bg-slate-100 rounded-sm" />
							<p className="pt-1 text-[11px] text-slate-400 font-medium italic">
								Itinerary kept offline. Revealed upon touchdown.
							</p>
						</div>
					</div>

					{/* Action Footer */}
					<div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
						<div className="flex items-center gap-1.5 text-amber-700 font-semibold text-[11px] tracking-wide">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
								<span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
							</span>
							<span>In Active Planning</span>
						</div>

						<div className="inline-flex items-center gap-1 font-medium text-slate-400 text-[11px]">
							<Lock className="w-3 h-3 text-slate-400" />
							<span>Locked</span>
						</div>
					</div>
				</div>
			</div>
		</motion.article>
	);
}
