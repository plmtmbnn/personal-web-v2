"use client";

import { MapPin, Calendar, ArrowUpRight, Mail } from "lucide-react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { Destination } from "../types";
import { formatVisitDate, getCountryCode } from "../utils/postcardCanvas";

interface DestinationCardProps {
	destination: Destination;
	index: number;
	onSelect?: (destination: Destination) => void;
}

export default function DestinationCard({
	destination,
	index,
	onSelect,
}: DestinationCardProps) {
	const reduceMotion = useReducedMotion();

	const handleClick = () => {
		onSelect?.(destination);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onSelect?.(destination);
		}
	};

	const visitedDate = formatVisitDate(destination.visitedDate);
	const countryCode = getCountryCode(destination.country);

	return (
		<motion.article
			initial={reduceMotion ? false : { opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.04, duration: 0.35 }}
			className="group flex flex-col h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-[2rem]"
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			role="button"
			tabIndex={0}
			whileHover={reduceMotion ? {} : { y: -4 }}
			aria-label={`Open 3D postcard for ${destination.name}`}
		>
			<div className="flex flex-col h-full bg-white rounded-[2rem] border border-slate-200/80 shadow-xs group-hover:border-slate-300 group-hover:shadow-md transition-[border-color,box-shadow] duration-300 overflow-hidden">
				<div className="p-2.5 pb-0">
					<div className="relative w-full aspect-4/3 overflow-hidden rounded-[1.4rem] bg-slate-100">
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

						<div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
							<span className="px-2.5 py-1 bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-xs border border-slate-200/70 inline-flex items-center gap-1.5">
								{countryCode && (
									<img
										src={`https://flagcdn.com/w40/${countryCode}.png`}
										alt=""
										aria-hidden="true"
										className="w-3.5 h-2.5 object-cover rounded-[2px] border border-slate-200/60"
									/>
								)}
								<span>{destination.country}</span>
							</span>

							<span
								className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md backdrop-blur-md border ${
									destination.type === "international"
										? "bg-slate-900/90 text-white border-slate-800"
										: "bg-indigo-50/95 text-indigo-800 border-indigo-200/80"
								}`}
							>
								{destination.type === "international" ? "Intl" : "Domestic"}
							</span>
						</div>
					</div>
				</div>

				<div className="flex flex-col flex-1 p-5 sm:p-6 pt-4">
					<div className="flex-1">
						<h2 className="text-lg font-bold tracking-tight text-slate-900 leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors duration-200">
							{destination.name}
						</h2>
						<div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
							<MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
							<span className="truncate">{destination.location}</span>
						</div>
						{destination.description && (
							<p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 font-normal">
								{destination.description}
							</p>
						)}
					</div>

					<div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
						<div className="flex items-center gap-1.5 text-slate-600 font-mono font-bold text-[11px] uppercase tracking-wider">
							<Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
							<span>{visitedDate}</span>
						</div>
						<div className="inline-flex items-center gap-1 font-bold text-slate-700 group-hover:text-indigo-600 transition-colors duration-200">
							<Mail className="w-3.5 h-3.5" />
							<span>Open Postcard</span>
							<ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
						</div>
					</div>
				</div>
			</div>
		</motion.article>
	);
}
