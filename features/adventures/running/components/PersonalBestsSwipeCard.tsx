"use client";

import { useState, useCallback } from "react";
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
	Crown,
	Gauge,
	Mountain,
	Route,
	Copy,
	Check,
} from "lucide-react";
import { personalBests } from "../data/personal-bests";

const SWIPE_THRESHOLD = 40;
const VELOCITY_THRESHOLD = 250;

const getInitialIndex = () => {
	const highestIndex = personalBests.findIndex((item) => item.isHighest);
	return highestIndex >= 0 ? highestIndex : personalBests.length - 1;
};

export default function PersonalBestsSwipeCard() {
	const reduceMotion = useReducedMotion();
	const shouldReduceMotion = Boolean(reduceMotion);

	const [currentIndex, setCurrentIndex] = useState<number>(getInitialIndex());
	const [direction, setDirection] = useState<number>(0);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [copied, setCopied] = useState<boolean>(false);

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

	const handleCopyRecord = useCallback(async () => {
		const summary = `Personal Best Record: ${currentItem.distance}\nTime: ${currentItem.time}\nPace: ${currentItem.pace}\nDistance: ${currentItem.distanceKm} km\nElevation: ${currentItem.elevation || "Flat"}`;
		try {
			await navigator.clipboard.writeText(summary);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			/* clipboard unavailable */
		}
	}, [currentItem]);

	const slideVariants = {
		enter: (dir: number) => ({
			x: shouldReduceMotion ? 0 : dir > 0 ? 40 : -40,
			opacity: 0,
			scale: shouldReduceMotion ? 1 : 0.98,
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
			x: shouldReduceMotion ? 0 : dir > 0 ? -40 : 40,
			opacity: 0,
			scale: shouldReduceMotion ? 1 : 0.98,
			transition: {
				duration: 0.16,
				ease: "easeInOut" as const,
			},
		}),
	};

	return (
		<section
			className="w-full h-full bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs select-none relative overflow-hidden flex flex-col justify-between group focus-visible:outline-2 focus-visible:outline-emerald-600"
			aria-label="Personal best records. Use left and right arrow keys to change records."
			onKeyDown={(event) => {
				if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
					event.preventDefault();
					paginate(event.key === "ArrowLeft" ? -1 : 1);
				}
			}}
		>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-20 pb-4 border-b border-slate-100">
				<div className="flex items-center gap-3">
					<div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
						<Trophy className="w-5 h-5 text-amber-500" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h3 className="text-base font-black text-slate-900 tracking-tight leading-tight">
								Personal Bests
							</h3>
							<span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/70 text-[10px] font-black text-amber-700 uppercase tracking-wider">
								All-Time
							</span>
						</div>
						<p className="text-xs text-slate-500 font-medium">
							Saved distance benchmarks and endurance records
						</p>
					</div>
				</div>

				{/* Controls */}
				<div className="flex items-center gap-2 self-end sm:self-center">
					<div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
						<button
							type="button"
							onClick={() => paginate(-1)}
							className="min-w-11 min-h-11 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all active:scale-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600"
							title="Previous Record"
							aria-label="Previous record"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						<button
							type="button"
							onClick={() => paginate(1)}
							className="min-w-11 min-h-11 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all active:scale-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600"
							title="Next Record"
							aria-label="Next record"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
					<button
						type="button"
						onClick={handleCopyRecord}
						className="min-w-11 min-h-11 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-white rounded-xl border border-slate-200/60 transition-all cursor-pointer active:scale-90 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-emerald-600"
						title="Copy Record Summary"
						aria-label="Copy record summary"
					>
						{copied ? (
							<Check className="w-4 h-4 text-emerald-600" />
						) : (
							<Copy className="w-4 h-4" />
						)}
					</button>
				</div>
			</div>

			{/* Milestone selector */}
			<div className="relative z-20 pt-4 pb-2">
				<div className="flex items-center justify-between w-full relative">
					{/* Subtle track background */}
					<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 rounded-full" />

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
								className={`group relative min-h-11 pb-2 sm:pb-3 px-2 sm:px-4 flex flex-col items-center justify-center transition-[color,transform] duration-300 cursor-pointer active:scale-90 touch-manipulation z-10 focus-visible:outline-2 focus-visible:outline-emerald-600 ${
									isActive
										? "text-slate-900 font-black"
										: "text-slate-600 hover:text-slate-900 font-bold"
								}`}
							>
								{/* Active animated indicator */}
								{isActive && (
									<motion.div
										layoutId="activeMilestoneIndicatorLight"
										className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full z-20"
										transition={{ type: "spring", stiffness: 400, damping: 30 }}
									/>
								)}
								<div className="flex items-center justify-center gap-1.5 sm:gap-2">
									{item.isHighest ? (
										<Crown
											className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-all duration-300 ${isActive ? "text-amber-500 scale-110" : "text-slate-600 group-hover:text-amber-500/70"}`}
										/>
									) : (
										<ItemIcon
											className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-all duration-300 ${isActive ? `${item.color} scale-110` : "text-slate-600 group-hover:text-slate-500"}`}
										/>
									)}
									<span
										className={`text-[11px] sm:text-xs tracking-wide transition-all duration-300 ${isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}
									>
										{label}
									</span>
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{/* Record display */}
			<div className="relative z-10 flex-1 flex flex-col justify-center min-h-[220px] w-full">
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
						dragElastic={0.2}
						onDragStart={() => setIsDragging(true)}
						onDragEnd={handleDragEnd}
						className={`w-full flex flex-col justify-center py-4 ${
							isDragging ? "cursor-grabbing" : "cursor-grab"
						}`}
					>
						{/* Clean Typographic Display */}
						<div className="flex flex-col items-center justify-center text-center mb-6">
							<h4 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter leading-none font-mono mb-3">
								{currentItem.time}
							</h4>
							<div className="flex items-center gap-2">
								<span className="px-3 py-1 bg-slate-100 rounded-md text-xs font-black text-slate-700 border border-slate-200/80 tracking-widest uppercase">
									{currentItem.distance}
								</span>
								<span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
									Chip Time
								</span>
							</div>
						</div>

						{/* Clean 3-Metric Strip */}
						<div className="grid grid-cols-3 gap-0 pt-4 border-t border-slate-100 relative">
							{/* Pace */}
							<div className="flex flex-col items-center justify-center text-center group/metric px-2">
								<Gauge className="w-5 h-5 text-emerald-500 mb-1.5 group-hover/metric:scale-110 transition-transform" />
								<span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
									Pace
								</span>
								<span className="text-sm sm:text-base font-black text-slate-800 font-mono tracking-tight">
									{currentItem.pace}
								</span>
							</div>

							{/* Distance */}
							<div className="flex flex-col items-center justify-center text-center group/metric px-2 border-l border-slate-100">
								<Route className="w-5 h-5 text-blue-500 mb-1.5 group-hover/metric:scale-110 transition-transform" />
								<span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
									Dist
								</span>
								<span className="text-sm sm:text-base font-black text-slate-800 font-mono tracking-tight">
									{currentItem.distanceKm}k
								</span>
							</div>

							{/* Elevation */}
							<div className="flex flex-col items-center justify-center text-center group/metric px-2 border-l border-slate-100">
								<Mountain className="w-5 h-5 text-purple-500 mb-1.5 group-hover/metric:scale-110 transition-transform" />
								<span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
									Elev
								</span>
								<span className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
									{currentItem.elevation || "Flat"}
								</span>
							</div>
						</div>
					</motion.div>
				</AnimatePresence>
			</div>

			<div className="pt-3 mt-1 border-t border-slate-100 text-xs text-slate-600">
				Swipe or focus a record control and use the left and right arrow keys.
			</div>
		</section>
	);
}
