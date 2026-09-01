"use client";

import {
	MapPin,
	Calendar,
	CheckCircle2,
	Star,
	Trash2,
	Sparkles,
	Lock,
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

const VARIANTS: Record<
	Variant,
	{
		badgeBg: string;
		badgeText: string;
		badgeBorder: string;
		badgeIcon: typeof CheckCircle2;
		label: string;
		cardBorder: string;
		accentColor: string;
	}
> = {
	visited: {
		badgeBg: "bg-emerald-50/90",
		badgeText: "text-emerald-700",
		badgeBorder: "border-emerald-200/80",
		badgeIcon: CheckCircle2,
		label: "Visited",
		cardBorder: "border-emerald-200/50 hover:border-emerald-300/80",
		accentColor: "text-emerald-600",
	},
	wishlist: {
		badgeBg: "bg-slate-900/80",
		badgeText: "text-white",
		badgeBorder: "border-slate-700/80",
		badgeIcon: Star,
		label: "Wishlist",
		cardBorder: "border-slate-200/80 hover:border-slate-300",
		accentColor: "text-slate-400",
	},
};

export default function DestinationCard({
	destination,
	index,
	variant = "visited",
	onSelect,
	onMarkVisited,
	onRemove,
	isAdmin = false,
}: DestinationCardProps) {
	const reduceMotion = useReducedMotion();
	const isVisited = variant === "visited";
	const style = VARIANTS[variant];
	const BadgeIcon = style.badgeIcon;

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
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				delay: index * 0.08,
				type: "spring",
				stiffness: 260,
				damping: 20,
			}}
			whileHover={
				isVisited
					? {
							y: -4,
							transition: { type: "spring", stiffness: 400, damping: 25 },
						}
					: undefined
			}
			className={`group bg-white border ${style.cardBorder} rounded-[2rem] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 ${
				isVisited ? "cursor-pointer active:scale-[0.98]" : "cursor-default"
			} relative`}
			onClick={handleClick}
		>
			{/* Image Container */}
			<div className="aspect-[4/3] relative overflow-hidden">
				<Image
					src={destination.imageUrl
						.replace(/w=\d+/, "w=800")
						.replace(/h=\d+/, "h=600")}
					alt={`${destination.name}, ${destination.location}, ${destination.country}`}
					fill
					className={`object-cover transition-all duration-700 ${
						isVisited
							? "group-hover:scale-110"
							: "grayscale contrast-105 brightness-95"
					}`}
					loading="lazy"
				/>

				{/* Gradient overlay */}
				<div
					className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent ${
						isVisited
							? "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
							: "opacity-30"
					}`}
				/>

				{/* Diagonal Watermark for Wishlist */}
				{!isVisited && (
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-10">
						<div className="w-[140%] py-2 bg-slate-950/65 backdrop-blur-xs border-y border-white/15 transform -rotate-12 flex items-center justify-center gap-2 shadow-xl">
							<Lock size={12} className="text-white/80 shrink-0" />
							<span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">
								Wishlist · To Unlock
							</span>
						</div>
					</div>
				)}

				{/* Status Badge */}
				<div className="absolute top-4 left-4 z-20">
					<span
						className={`flex items-center gap-1.5 px-3 py-1.5 ${style.badgeBg} ${style.badgeText} ${style.badgeBorder} text-[10px] font-black uppercase tracking-wider rounded-full border backdrop-blur-md shadow-xs`}
					>
						<BadgeIcon size={12} />
						{style.label}
					</span>
				</div>

				{/* Quick Actions (visible on hover) */}
				<div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
					{!isVisited && onMarkVisited && (
						<button
							type="button"
							onClick={handleVisitToggle}
							className="p-2 bg-white/90 backdrop-blur-md rounded-full hover:bg-slate-900 hover:text-white text-slate-700 transition-colors shadow-xs"
							title="Mark as visited"
							aria-label="Mark as visited"
						>
							<CheckCircle2 size={14} />
						</button>
					)}
					{isAdmin && onRemove && (
						<button
							type="button"
							onClick={handleRemove}
							className="p-2 bg-white/90 backdrop-blur-md rounded-full hover:bg-rose-500 hover:text-white text-slate-700 transition-colors shadow-xs"
							title="Remove destination"
							aria-label="Remove destination"
						>
							<Trash2 size={14} />
						</button>
					)}
				</div>

				{/* Postcard Hint on Card Hover (Visited only) */}
				{isVisited && (
					<div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
						<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black text-slate-800 shadow-sm">
							<Sparkles className="w-3 h-3 text-amber-500" />
							Open Postcard & Sticker
						</span>
					</div>
				)}
			</div>

			{/* Content */}
			<div className="p-5 space-y-3">
				{/* Title & Location */}
				<div>
					<h3
						className={`text-lg font-black text-slate-900 tracking-tight line-clamp-1 transition-colors ${
							isVisited
								? "group-hover:text-emerald-600"
								: "group-hover:text-slate-700"
						}`}
					>
						{destination.name}
					</h3>
					<div className="flex items-center gap-1 text-slate-400 text-xs font-bold mt-1">
						<MapPin size={12} className={style.accentColor} />
						<span className="line-clamp-1">{destination.location}</span>
						<span className="text-slate-300">·</span>
						<span>{destination.country}</span>
						<span className="text-slate-300">·</span>
						<span
							className={`uppercase tracking-wider ${
								isVisited
									? destination.type === "domestic"
										? "text-emerald-500/70"
										: "text-blue-500/70"
									: "text-slate-400"
							}`}
						>
							{destination.type}
						</span>
					</div>
				</div>

				{/* Description (Visited only - no impression or feeling yet for wishlist) */}
				{isVisited && destination.description && (
					<p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
						{destination.description}
					</p>
				)}

				{/* Footer: Date or Status */}
				<div className="pt-3 border-t border-slate-100 flex items-center justify-between">
					{isVisited && destination.visitedDate ? (
						<>
							<div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase">
								<Calendar size={12} />
								{new Date(`${destination.visitedDate}-01`).toLocaleDateString(
									"en-US",
									{
										month: "short",
										year: "numeric",
										timeZone: "UTC",
									},
								)}
							</div>
							{/* Hover action hint */}
							<span className="text-emerald-600 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
								✉ View Postcard
							</span>
						</>
					) : (
						<span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
							<Star size={11} className="text-slate-400" />
							Planned Adventure
						</span>
					)}
				</div>
			</div>
		</motion.div>
	);
}
