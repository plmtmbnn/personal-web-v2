"use client";

import { useState, useEffect } from "react";
import {
	MapPin,
	Calendar,
	CheckCircle2,
	Trash2,
	ArrowUpRight,
	Map as MapIcon,
	Compass,
	Eye,
	EyeOff,
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
	spoilerMode?: boolean;
}

export default function DestinationCard({
	destination,
	index,
	variant,
	onSelect,
	onMarkVisited,
	onRemove,
	isAdmin = false,
	spoilerMode = true,
}: DestinationCardProps) {
	const reduceMotion = useReducedMotion();
	const isVisited = variant ? variant === "visited" : destination.isVisited;
	const [revealed, setRevealed] = useState(!spoilerMode);

	useEffect(() => {
		setRevealed(!spoilerMode);
	}, [spoilerMode]);

	const handleClick = () => {
		if (isVisited && onSelect) {
			onSelect(destination);
		}
	};

	const handleToggleReveal = (e: React.MouseEvent) => {
		e.stopPropagation();
		setRevealed((prev) => !prev);
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

	const visitedDate = destination.visitedDate
		? new Date(`${destination.visitedDate}-01`).toLocaleDateString("en-US", {
				month: "short",
				year: "numeric",
				timeZone: "UTC",
			})
		: null;

	// -- VISITED card: image-forward floating card
	if (isVisited) {
		return (
			<motion.article
				initial={reduceMotion ? false : { opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: index * 0.04, duration: 0.35 }}
				className="group flex flex-col h-full cursor-pointer"
				onClick={handleClick}
				whileHover={reduceMotion ? {} : { y: -4 }}
			>
				<div className="flex flex-col h-full bg-white rounded-[2rem] border border-slate-200/80 shadow-xs group-hover:shadow-md transition-shadow duration-300 overflow-hidden">
					{/* Image */}
					<div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
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

						{/* Admin remove */}
						{isAdmin && onRemove && (
							<div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
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

					{/* Text content */}
					<div className="flex flex-col flex-1 p-5 sm:p-6">
						<div className="flex-1">
							<h2 className="text-lg font-bold tracking-tight text-slate-900 leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors duration-200">
								{destination.name}
							</h2>
							<div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400 font-medium">
								<MapPin className="w-3.5 h-3.5 shrink-0" />
								<span className="truncate">{destination.location}</span>
								<span className="shrink-0 text-slate-300">·</span>
								<span className="shrink-0">{destination.country}</span>
							</div>
							{destination.description && (
								<p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
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

	// -- WISHLIST card: clean, unified floating card with interactive spoiler mode
	return (
		<motion.article
			initial={reduceMotion ? false : { opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.04, duration: 0.35 }}
			className="group flex flex-col h-full cursor-pointer"
			onClick={() => {
				if (!revealed) {
					setRevealed(true);
				}
			}}
			whileHover={reduceMotion ? {} : { y: -4 }}
		>
			<div className="flex flex-col h-full bg-white rounded-[2rem] border border-slate-200/80 shadow-xs group-hover:shadow-md transition-shadow duration-300 overflow-hidden">
				{/* Image container with spoiler mask */}
				<div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-900">
					<Image
						src={destination.imageUrl
							.replace(/w=\d+/, "w=800")
							.replace(/h=\d+/, "h=600")}
						alt={`${destination.name}, ${destination.location}, ${destination.country}`}
						fill
						className={`object-cover transition-all duration-700 ease-out ${
							revealed
								? "blur-0 scale-100 brightness-100 group-hover:scale-[1.04]"
								: "blur-xl scale-110 brightness-[0.55]"
						}`}
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
						loading="lazy"
					/>

					{/* Overlay Badges */}
					<div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-20">
						<span className="px-2.5 py-1 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs flex items-center gap-1.5">
							<Compass className="w-3 h-3" />
							On radar
						</span>
						<span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider rounded-full">
							{destination.type}
						</span>
					</div>

					{/* Spoiler Cover Overlay */}
					{!revealed && (
						<div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 bg-slate-950/20 backdrop-blur-xs">
							<button
								type="button"
								onClick={handleToggleReveal}
								className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 text-slate-900 border border-white/80 shadow-md text-xs font-bold hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
								aria-label="Reveal destination spoiler"
							>
								<EyeOff className="w-3.5 h-3.5 text-amber-500" />
								<span>Spoiler · Reveal</span>
							</button>
							<p className="mt-2 text-[10px] font-semibold text-white/90 drop-shadow-xs">
								Click to unmask destination
							</p>
						</div>
					)}

					{/* Hide again button when revealed */}
					{revealed && spoilerMode && (
						<div className="absolute top-3.5 right-3.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								type="button"
								onClick={handleToggleReveal}
								className="p-1.5 bg-white/90 backdrop-blur-md rounded-full hover:bg-slate-900 hover:text-white text-slate-700 transition-colors shadow-xs cursor-pointer"
								title="Hide spoiler again"
								aria-label="Hide spoiler again"
							>
								<Eye className="w-3.5 h-3.5" />
							</button>
						</div>
					)}

					{/* Admin remove */}
					{isAdmin && onRemove && (
						<div className="absolute bottom-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
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

				{/* Text content */}
				<div className="flex flex-col flex-1 p-5 sm:p-6 justify-between">
					<div className="flex-1">
						<div className="flex items-start justify-between gap-2">
							<h2 className="text-lg font-bold tracking-tight text-slate-900 leading-snug group-hover:text-amber-600 transition-colors duration-200">
								{destination.name}
							</h2>
							<span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60">
								Wishlist
							</span>
						</div>

						<div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400 font-medium">
							<MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
							<span className="truncate">{destination.location}</span>
							<span className="shrink-0 text-slate-300">·</span>
							<span className="shrink-0 text-slate-500 font-semibold">
								{destination.country}
							</span>
						</div>

						{/* Description: with spoiler mask if not revealed */}
						{destination.description &&
							(revealed ? (
								<p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
									{destination.description}
								</p>
							) : (
								<button
									type="button"
									onClick={handleToggleReveal}
									className="mt-3 w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-all text-xs text-slate-400 flex items-center justify-between cursor-pointer group/desc"
								>
									<span className="inline-flex items-center gap-1.5 font-medium text-slate-500 group-hover/desc:text-slate-700">
										<EyeOff className="w-3 h-3 text-amber-500" />
										Secret bucket list note
									</span>
									<span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
										Reveal
									</span>
								</button>
							))}
					</div>

					{/* Footer */}
					<div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
						<span className="text-[11px] font-semibold text-amber-600/90">
							Planned Expedition
						</span>

						<div className="flex items-center gap-1.5">
							{onMarkVisited && (
								<button
									type="button"
									onClick={handleVisitToggle}
									className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-semibold transition-colors cursor-pointer border border-slate-200/80"
									title="Mark as visited"
									aria-label="Mark as visited"
								>
									<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
									<span>Mark Visited</span>
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</motion.article>
	);
}
