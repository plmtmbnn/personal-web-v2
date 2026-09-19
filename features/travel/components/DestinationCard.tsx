"use client";

import {
	MapPin,
	Calendar,
	CheckCircle2,
	Star,
	Trash2,
	Lock,
	ArrowUpRight,
	Compass,
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

	return (
		<motion.article
			initial={reduceMotion ? false : { opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				delay: index * 0.04,
				duration: 0.35,
			}}
			className={`group flex flex-col h-full ${
				isVisited ? "cursor-pointer" : "cursor-default"
			}`}
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
					className={`object-cover transition-transform duration-500 ease-out ${
						isVisited
							? "group-hover:scale-105"
							: "grayscale contrast-105 brightness-95"
					}`}
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					priority={index === 0}
					loading={index === 0 ? "eager" : "lazy"}
				/>

				{/* Subtle Status & Category Badges */}
				<div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
					{isVisited ? (
						<span className="px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs border border-white/60 flex items-center gap-1.5">
							<CheckCircle2 className="w-3 h-3 text-emerald-600" />
							<span>Visited</span>
						</span>
					) : (
						<span className="px-3 py-1 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs flex items-center gap-1.5">
							<Star className="w-3 h-3 text-amber-400" />
							<span>Wishlist</span>
						</span>
					)}

					<span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-xs">
						{destination.type}
					</span>
				</div>

				{/* Refined Wishlist Watermark */}
				{!isVisited && (
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
						<div className="px-4 py-1.5 bg-slate-950/70 backdrop-blur-xs rounded-full border border-white/20 flex items-center gap-1.5 shadow-lg">
							<Lock className="w-3 h-3 text-white/90" />
							<span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
								Future Destination
							</span>
						</div>
					</div>
				)}

				{/* Quick Actions for Admin / Toggle (visible on hover) */}
				<div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
					{!isVisited && onMarkVisited && (
						<button
							type="button"
							onClick={handleVisitToggle}
							className="p-1.5 bg-white/90 backdrop-blur-md rounded-full hover:bg-slate-900 hover:text-white text-slate-700 transition-colors shadow-xs cursor-pointer"
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
							className="p-1.5 bg-white/90 backdrop-blur-md rounded-full hover:bg-rose-500 hover:text-white text-slate-700 transition-colors shadow-xs cursor-pointer"
							title="Remove destination"
							aria-label="Remove destination"
						>
							<Trash2 className="w-3.5 h-3.5" />
						</button>
					)}
				</div>
			</div>

			{/* Card Text Content */}
			<div className="mt-5 sm:mt-6 flex-1 flex flex-col justify-between">
				<div>
					<h2
						className={`text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-snug line-clamp-1 transition-colors ${
							isVisited
								? "group-hover:text-emerald-700"
								: "group-hover:text-slate-700"
						}`}
					>
						{destination.name}
					</h2>

					<div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-1">
						<MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span className="truncate">{destination.location}</span>
						<span>·</span>
						<span className="shrink-0">{destination.country}</span>
					</div>

					{isVisited && destination.description && (
						<p className="mt-2.5 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed line-clamp-2">
							{destination.description}
						</p>
					)}
				</div>

				{/* Card Footer Action */}
				<div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs">
					{isVisited ? (
						<>
							<div className="flex items-center gap-1.5 text-slate-400 font-medium">
								<Calendar className="w-3.5 h-3.5 text-emerald-600" />
								<span>
									{destination.visitedDate
										? new Date(
												`${destination.visitedDate}-01`,
											).toLocaleDateString("en-US", {
												month: "short",
												year: "numeric",
												timeZone: "UTC",
											})
										: "Explored"}
								</span>
							</div>

							<div className="inline-flex items-center gap-1 font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
								<span>View Postcard</span>
								<ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
							</div>
						</>
					) : (
						<div className="flex items-center justify-between w-full text-slate-400 font-medium">
							<span className="flex items-center gap-1.5">
								<Compass className="w-3.5 h-3.5 text-slate-400" />
								<span>Planned Adventure</span>
							</span>
							<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
								Wishlist
							</span>
						</div>
					)}
				</div>
			</div>
		</motion.article>
	);
}
