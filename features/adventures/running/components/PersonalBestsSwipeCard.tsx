"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
	motion,
	AnimatePresence,
	useReducedMotion,
	type PanInfo,
} from "framer-motion";
import {
	Trophy,
	ChevronLeft,
	ChevronRight,
	Sparkles,
	Crown,
	Gauge,
	Mountain,
	Route,
	Activity,
} from "lucide-react";
import { personalBests } from "../data/personal-bests";

const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 300;

const getInitialIndex = () => {
	const highestIndex = personalBests.findIndex((item) => item.isHighest);
	return highestIndex >= 0 ? highestIndex : personalBests.length - 1;
};

// Calculate average speed in km/h from time string (HH:MM:SS or MM:SS) and distance in km
function calculateSpeed(timeStr: string, distanceKm: number): string {
	const parts = timeStr.split(":").map(Number);
	let totalMinutes = 0;
	if (parts.length === 3) {
		totalMinutes = parts[0] * 60 + parts[1] + parts[2] / 60;
	} else if (parts.length === 2) {
		totalMinutes = parts[0] + parts[1] / 60;
	}
	if (totalMinutes === 0) return "—";
	const speedKmH = (distanceKm / totalMinutes) * 60;
	return `${speedKmH.toFixed(1)} km/h`;
}

export default function PersonalBestsSwipeCard() {
	const reduceMotion = useReducedMotion();
	const shouldReduceMotion = reduceMotion === true;

	const [currentIndex, setCurrentIndex] = useState<number>(getInitialIndex());
	const [direction, setDirection] = useState<number>(0);
	const [isDragging, setIsDragging] = useState<boolean>(false);

	const totalItems = personalBests.length;
	const currentItem = personalBests[currentIndex];

	const paginate = useCallback(
		(newDirection: number) => {
			setDirection(newDirection);
			setCurrentIndex(
				(prev) => (prev + newDirection + totalItems) % totalItems,
			);
		},
		[totalItems],
	);

	const goToIndex = useCallback(
		(targetIndex: number) => {
			if (targetIndex === currentIndex) return;
			setDirection(targetIndex > currentIndex ? 1 : -1);
			setCurrentIndex(targetIndex);
		},
		[currentIndex],
	);

	const handleDragEnd = useCallback(
		(_: unknown, info: PanInfo) => {
			setIsDragging(false);
			const { offset, velocity } = info;
			if (offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) {
				paginate(1);
			} else if (
				offset.x > SWIPE_THRESHOLD ||
				velocity.x > VELOCITY_THRESHOLD
			) {
				paginate(-1);
			}
		},
		[paginate],
	);

	// Keyboard arrow navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") paginate(-1);
			if (e.key === "ArrowRight") paginate(1);
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [paginate]);

	const speedKmH = useMemo(() => {
		return calculateSpeed(currentItem.time, currentItem.distanceKm);
	}, [currentItem]);

	const slideVariants = {
		enter: (dir: number) => ({
			x: shouldReduceMotion ? 0 : dir > 0 ? 80 : -80,
			opacity: 0,
			scale: shouldReduceMotion ? 1 : 0.96,
		}),
		center: {
			x: 0,
			opacity: 1,
			scale: 1,
			transition: {
				type: "spring" as const,
				stiffness: 350,
				damping: 30,
			},
		},
		exit: (dir: number) => ({
			x: shouldReduceMotion ? 0 : dir > 0 ? -80 : 80,
			opacity: 0,
			scale: shouldReduceMotion ? 1 : 0.96,
			transition: {
				duration: 0.2,
				ease: "easeInOut" as const,
			},
		}),
	};

	return (
		<div className="w-full bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 space-y-6 select-none relative overflow-hidden">
			{/* Ambient Glowing Backdrop Accent */}
			<div
				className={`absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br ${currentItem.bgGlow} rounded-full blur-3xl pointer-events-none opacity-60 transition-all duration-700`}
			/>

			{/* ═══════════════════════════════════════
			    HEADER & MILESTONE STEPPER
			═══════════════════════════════════════ */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 pb-4 border-b border-slate-100">
				<div className="flex items-center gap-3">
					<div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
						<Trophy className="w-5 h-5 text-amber-500" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h3 className="text-base font-extrabold text-slate-900 leading-tight">
								Personal Bests
							</h3>
							<span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/60 text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">
								All-Time Records
							</span>
						</div>
						<p className="text-xs text-slate-500 font-medium">
							Key distance benchmarks & endurance milestones
						</p>
					</div>
				</div>

				{/* Arrow Controls & Index Counter */}
				<div className="flex items-center gap-2 self-end sm:self-center">
					<div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
						<button
							type="button"
							onClick={() => paginate(-1)}
							className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all active:scale-90 cursor-pointer shadow-xs"
							title="Previous Record (← Arrow Key)"
							aria-label="Previous record"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						<button
							type="button"
							onClick={() => paginate(1)}
							className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all active:scale-90 cursor-pointer shadow-xs"
							title="Next Record (→ Arrow Key)"
							aria-label="Next record"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>

					<span className="text-xs font-extrabold text-slate-700 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-xs tabular-nums">
						{currentIndex + 1} / {totalItems}
					</span>
				</div>
			</div>

			{/* ═══════════════════════════════════════
			    INTERACTIVE MILESTONE TRACK SELECTOR
			═══════════════════════════════════════ */}
			<div className="relative z-10">
				<div className="grid grid-cols-5 gap-1.5 sm:gap-2 py-1">
					{personalBests.map((item, idx) => {
						const isActive = idx === currentIndex;
						const ItemIcon = item.icon;
						const label =
							item.shortLabel || item.distance.replace(" (65.9k)", "");
						return (
							<button
								key={item.id}
								type="button"
								onClick={() => goToIndex(idx)}
								className={`group relative h-[52px] sm:h-[58px] px-1 sm:px-2 rounded-xl text-center transition-all duration-300 cursor-pointer border flex flex-col items-center justify-center gap-0.5 sm:gap-1 overflow-hidden min-w-0 ${
									isActive
										? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/15"
										: "bg-slate-50/90 text-slate-600 hover:text-slate-900 border-slate-200/70 hover:border-slate-300 hover:bg-white"
								}`}
							>
								<div className="flex items-center justify-center gap-1 w-full min-w-0">
									{item.isHighest ? (
										<Crown
											className={`w-3 h-3 shrink-0 ${isActive ? "text-amber-400" : "text-amber-500"}`}
										/>
									) : (
										<ItemIcon
											className={`w-3 h-3 shrink-0 ${isActive ? "text-white" : item.color}`}
										/>
									)}
									<span className="text-[10.5px] sm:text-[11px] font-extrabold tracking-tight truncate whitespace-nowrap">
										{label}
									</span>
								</div>
								<span
									className={`text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider truncate whitespace-nowrap ${
										isActive ? "text-slate-300" : "text-slate-400"
									}`}
								>
									{item.distanceKm} km
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* ═══════════════════════════════════════
			    MAIN SHOWCASE CARD (SWIPE / SLIDE STAGE)
			═══════════════════════════════════════ */}
			<div className="relative z-10 min-h-[290px] sm:min-h-[300px]">
				<AnimatePresence initial={false} custom={direction} mode="wait">
					<motion.div
						key={currentItem.id}
						custom={direction}
						variants={slideVariants}
						initial="enter"
						animate="center"
						exit="exit"
						drag="x"
						dragConstraints={{ left: 0, right: 0 }}
						dragElastic={0.3}
						onDragStart={() => setIsDragging(true)}
						onDragEnd={handleDragEnd}
						className={`w-full rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-white to-slate-50/70 border border-slate-200/90 shadow-sm relative overflow-hidden touch-pan-y ${
							isDragging ? "cursor-grabbing" : "cursor-grab"
						}`}
					>
						{/* Accent Top Border Line */}
						<div
							className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${currentItem.bgGlow.replace("/10", "").replace("/5", "")}`}
						/>

						{/* Top Row: Category Badge & Distance Title */}
						<div className="flex items-start justify-between gap-4 mb-6">
							<div className="flex items-center gap-3.5">
								<div
									className={`w-13 h-13 rounded-2xl ${currentItem.badgeBg} border border-white flex items-center justify-center shadow-xs shrink-0`}
								>
									<currentItem.icon
										className={`w-6 h-6 ${currentItem.color}`}
									/>
								</div>
								<div>
									<div className="flex items-center gap-2 mb-1">
										{currentItem.isHighest ? (
											<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider shadow-2xs border border-amber-200">
												<Crown className="w-3 h-3 text-amber-600" /> Pinnacle
												Achievement
											</span>
										) : (
											<span
												className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${currentItem.badgeBg} border border-current/10`}
											>
												{currentItem.badge}
											</span>
										)}
									</div>
									<h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
										{currentItem.distance}
									</h4>
								</div>
							</div>

							<div className="text-right hidden sm:block">
								<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
									Pace Split
								</span>
								<span className="text-sm font-black text-slate-700 font-mono">
									{currentItem.pace}
								</span>
							</div>
						</div>

						{/* Primary Metric: Duration */}
						<div className="mb-6 pb-6 border-b border-slate-100">
							<span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
								Official Personal Best Time
							</span>
							<div className="flex items-baseline gap-3 flex-wrap">
								<p className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none font-mono">
									{currentItem.time}
								</p>
								<span className="text-xs sm:text-sm font-bold text-slate-500">
									duration
								</span>
							</div>
						</div>

						{/* 4-Metric Grid */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
							{/* Pace */}
							<div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
								<div className="flex items-center gap-1.5 text-slate-400 mb-1">
									<Gauge className="w-3.5 h-3.5 text-emerald-600" />
									<span className="text-[10px] font-bold uppercase tracking-wider">
										Avg Pace
									</span>
								</div>
								<p className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
									{currentItem.pace}
								</p>
							</div>

							{/* Distance */}
							<div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
								<div className="flex items-center gap-1.5 text-slate-400 mb-1">
									<Route className="w-3.5 h-3.5 text-blue-600" />
									<span className="text-[10px] font-bold uppercase tracking-wider">
										Distance
									</span>
								</div>
								<p className="text-sm sm:text-base font-extrabold text-slate-900">
									{currentItem.distanceKm} km
								</p>
							</div>

							{/* Elevation / Terrain */}
							<div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
								<div className="flex items-center gap-1.5 text-slate-400 mb-1">
									<Mountain className="w-3.5 h-3.5 text-purple-600" />
									<span className="text-[10px] font-bold uppercase tracking-wider">
										Elevation
									</span>
								</div>
								<p className="text-sm sm:text-base font-extrabold text-slate-900">
									{currentItem.elevation || "Road Flat"}
								</p>
							</div>

							{/* Speed */}
							<div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
								<div className="flex items-center gap-1.5 text-slate-400 mb-1">
									<Activity className="w-3.5 h-3.5 text-rose-500" />
									<span className="text-[10px] font-bold uppercase tracking-wider">
										Avg Speed
									</span>
								</div>
								<p className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
									{speedKmH}
								</p>
							</div>
						</div>
					</motion.div>
				</AnimatePresence>
			</div>

			{/* ═══════════════════════════════════════
			    FOOTER HINT
			═══════════════════════════════════════ */}
			<div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 font-semibold relative z-10">
				<div className="flex items-center gap-1.5">
					<Sparkles className="w-3.5 h-3.5 text-amber-500" />
					<span>Swipe card, click milestones, or use ← → arrow keys</span>
				</div>

				<div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
					<span>Benchmark record</span>
				</div>
			</div>
		</div>
	);
}
