"use client";

import { useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
	Trophy,
	Zap,
	Flame,
	Milestone,
	Mountain,
	ChevronLeft,
	ChevronRight,
	Gauge,
	Route,
	Crown,
	Sparkles,
	Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PersonalBestItem {
	id: string;
	distance: string;
	distanceKm: number;
	time: string;
	pace: string;
	elevation?: string;
	badge: string;
	icon: LucideIcon;
	color: string;
	badgeBg: string;
	bgGlow: string;
	borderAccent: string;
	isHighest?: boolean;
}

export const personalBests: PersonalBestItem[] = [
	{
		id: "5k",
		distance: "5K",
		distanceKm: 5,
		time: "25:45",
		pace: "5:09/km",
		badge: "Speed Sprint",
		icon: Flame,
		color: "text-rose-500",
		badgeBg: "bg-rose-50 text-rose-700 border-rose-200/80",
		bgGlow: "from-rose-500/15 via-rose-500/5 to-transparent",
		borderAccent: "border-t-rose-500",
	},
	{
		id: "10k",
		distance: "10K",
		distanceKm: 10,
		time: "54:42",
		pace: "5:28/km",
		badge: "Tempo Benchmark",
		icon: Zap,
		color: "text-amber-500",
		badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80",
		bgGlow: "from-amber-500/15 via-amber-500/5 to-transparent",
		borderAccent: "border-t-amber-500",
	},
	{
		id: "hm",
		distance: "Half Marathon",
		distanceKm: 21.1,
		time: "2:05:37",
		pace: "5:57/km",
		badge: "Endurance Milestone",
		icon: Milestone,
		color: "text-emerald-500",
		badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
		bgGlow: "from-emerald-500/15 via-emerald-500/5 to-transparent",
		borderAccent: "border-t-emerald-500",
	},
	{
		id: "fm",
		distance: "Marathon",
		distanceKm: 42.2,
		time: "4:30:29",
		pace: "6:24/km",
		badge: "Classic 42.2K",
		icon: Trophy,
		color: "text-blue-500",
		badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80",
		bgGlow: "from-blue-500/15 via-blue-500/5 to-transparent",
		borderAccent: "border-t-blue-500",
	},
	{
		id: "ultra",
		distance: "Ultra Trail (65.9k)",
		distanceKm: 65.9,
		time: "19:40:28",
		pace: "17:55/km",
		elevation: "2,982 m",
		badge: "Pinnacle Achievement",
		icon: Mountain,
		color: "text-purple-500",
		badgeBg: "bg-purple-50 text-purple-700 border-purple-200/80",
		bgGlow: "from-purple-500/15 via-purple-500/5 to-transparent",
		borderAccent: "border-t-purple-500",
		isHighest: true,
	},
];

// Default to highest achievement item (Ultra Trail) at the top of the stack
const defaultHighestIndex = personalBests.findIndex((item) => item.isHighest);
const INITIAL_TOP_INDEX =
	defaultHighestIndex >= 0 ? defaultHighestIndex : personalBests.length - 1;

export default function PersonalBestsSwipeCard() {
	const reduceMotion = useReducedMotion();
	const safeReduceMotion = reduceMotion !== null && reduceMotion !== undefined;

	const [topIndex, setTopIndex] = useState<number>(INITIAL_TOP_INDEX);
	const [exitDirection, setExitDirection] = useState<number>(0);
	const [isSwiping, setIsSwiping] = useState(false);

	const TOTAL_ITEMS = personalBests.length;

	// Cycle stack forward (moves current top to bottom)
	const nextCard = useCallback(() => {
		if (isSwiping) return;
		setExitDirection(1);
		setIsSwiping(true);
		setTimeout(() => {
			setTopIndex((prev) => (prev + 1) % TOTAL_ITEMS);
			setIsSwiping(false);
		}, 180);
	}, [isSwiping, TOTAL_ITEMS]);

	// Cycle stack backward
	const prevCard = useCallback(() => {
		if (isSwiping) return;
		setExitDirection(-1);
		setIsSwiping(true);
		setTimeout(() => {
			setTopIndex((prev) => (prev - 1 + TOTAL_ITEMS) % TOTAL_ITEMS);
			setIsSwiping(false);
		}, 180);
	}, [isSwiping, TOTAL_ITEMS]);

	// Direct tab selection brings chosen card to top
	const selectCard = useCallback((targetIndex: number) => {
		setTopIndex(targetIndex);
	}, []);

	// Handle card drag swipe end
	const handleDragEnd = (
		_: unknown,
		info: { offset: { x: number }; velocity: { x: number } },
	) => {
		const swipeThreshold = 60;
		if (info.offset.x > swipeThreshold || info.velocity.x > 300) {
			setExitDirection(1);
			nextCard();
		} else if (info.offset.x < -swipeThreshold || info.velocity.x < -300) {
			setExitDirection(-1);
			nextCard();
		}
	};

	// Visible stack slots: top card (0), middle card (1), bottom card (2)
	const stackSlots = [0, 1, 2].map((slotOffset) => {
		const itemIndex = (topIndex + slotOffset) % TOTAL_ITEMS;
		return {
			slotOffset,
			itemIndex,
			item: personalBests[itemIndex],
		};
	});

	const nextItem = personalBests[(topIndex + 1) % TOTAL_ITEMS];

	return (
		<div className="space-y-4 select-none">
			{/* Header with Title and Stack Controls */}
			<div className="flex items-center justify-between">
				<motion.h3
					initial={safeReduceMotion ? false : { opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2"
				>
					<Trophy className="w-4 h-4 text-emerald-600" /> Personal Milestones
				</motion.h3>

				{/* Arrow Controls & Counter */}
				<div className="flex items-center gap-2">
					<span className="text-[10px] font-extrabold text-slate-400 font-mono flex items-center gap-1">
						<Layers className="w-3 h-3 text-slate-400" />
						{topIndex + 1} / {TOTAL_ITEMS}
					</span>
					<div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-xl p-0.5 shadow-xs">
						<button
							type="button"
							onClick={prevCard}
							aria-label="Previous card in stack"
							className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						<div className="w-[1px] h-3 bg-slate-200" />
						<button
							type="button"
							onClick={nextCard}
							aria-label="Next card in stack"
							className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Filter / Pill Tab Selector */}
			<div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
				{personalBests.map((item, idx) => {
					const isActive = idx === topIndex;
					return (
						<button
							type="button"
							key={item.id}
							onClick={() => selectCard(idx)}
							className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold transition-all duration-200 shrink-0 flex items-center gap-1.5 border ${
								isActive
									? "bg-slate-900 text-white border-slate-900 shadow-sm scale-[1.02]"
									: "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
							}`}
						>
							{item.isHighest && (
								<Crown
									className={`w-3 h-3 ${
										isActive ? "text-amber-400" : "text-amber-500"
									}`}
								/>
							)}
							<span>{item.distance}</span>
						</button>
					);
				})}
			</div>

			{/* 3D Card Stack Deck Container */}
			<div className="relative pt-2 pb-6 min-h-[320px] flex items-center justify-center">
				{/* Stack Deck Items rendered reversed so top card is rendered last (on top) */}
				{stackSlots
					.slice()
					.reverse()
					.map(({ slotOffset, item }) => {
						const isTop = slotOffset === 0;

						// Card Stack offset styling variables
						const yOffset = slotOffset * 14;
						const scale = 1 - slotOffset * 0.05;
						const opacity = 1 - slotOffset * 0.25;
						const zIndex = TOTAL_ITEMS - slotOffset;

						return (
							<motion.div
								key={item.id}
								layout
								initial={
									safeReduceMotion
										? false
										: { y: yOffset + 20, scale, opacity: 0 }
								}
								animate={{
									y:
										isTop && isSwiping
											? exitDirection > 0
												? -15
												: 15
											: yOffset,
									scale,
									opacity: isTop && isSwiping ? 0.3 : opacity,
									zIndex,
								}}
								transition={{
									type: "spring",
									stiffness: 320,
									damping: 26,
								}}
								drag={isTop ? "x" : false}
								dragConstraints={{ left: 0, right: 0 }}
								dragElastic={0.5}
								onDragEnd={isTop ? handleDragEnd : undefined}
								whileTap={
									isTop
										? { cursor: "grabbing", scale: scale * 0.98 }
										: undefined
								}
								className={`absolute inset-x-0 w-full overflow-hidden bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[295px] border-t-4 ${
									item.borderAccent
								} ${
									isTop
										? "cursor-grab touch-pan-y shadow-2xl"
										: "pointer-events-none shadow-md"
								}`}
								style={{
									top: 0,
								}}
							>
								{/* Background Ambient Glow */}
								<div
									className={`aria-hidden:hidden absolute -top-12 -right-12 w-48 h-48 bg-radial ${item.bgGlow} rounded-full blur-2xl pointer-events-none opacity-90`}
								/>

								{/* Card Header */}
								<div className="relative z-10 flex items-start justify-between">
									<div className="flex items-center gap-3">
										<div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs">
											<item.icon className={`w-5 h-5 ${item.color}`} />
										</div>
										<div>
											<div className="flex items-center gap-1.5">
												<p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
													Distance Record
												</p>
												{item.isHighest && (
													<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[9px] font-black text-amber-700 uppercase tracking-wider">
														<Crown className="w-2.5 h-2.5 text-amber-500" />{" "}
														Highest
													</span>
												)}
											</div>
											<h4 className="text-xl font-black text-slate-900 tracking-tight">
												{item.distance}
											</h4>
										</div>
									</div>

									<span
										className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider shadow-2xs ${item.badgeBg}`}
									>
										{item.badge}
									</span>
								</div>

								{/* Main Metric (Time) */}
								<div className="relative z-10 my-4 space-y-1">
									<span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 block">
										Best Duration
									</span>
									<p className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none font-mono">
										{item.time}
									</p>
								</div>

								{/* Sub-Metrics Grid */}
								<div className="relative z-10 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
									<div className="flex items-center gap-2.5 p-2.5 bg-slate-50/80 rounded-2xl border border-slate-100">
										<div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-2xs border border-slate-100 shrink-0">
											<Gauge className="w-4 h-4" />
										</div>
										<div>
											<span className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-400 block">
												Pace
											</span>
											<span className="text-xs font-extrabold text-slate-900 leading-none">
												{item.pace}
											</span>
										</div>
									</div>

									{item.elevation ? (
										<div className="flex items-center gap-2.5 p-2.5 bg-slate-50/80 rounded-2xl border border-slate-100">
											<div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-2xs border border-slate-100 shrink-0">
												<Mountain className="w-4 h-4" />
											</div>
											<div>
												<span className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-400 block">
													Elevation Gain
												</span>
												<span className="text-xs font-extrabold text-slate-900 leading-none">
													{item.elevation}
												</span>
											</div>
										</div>
									) : (
										<div className="flex items-center gap-2.5 p-2.5 bg-slate-50/80 rounded-2xl border border-slate-100">
											<div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-2xs border border-slate-100 shrink-0">
												<Route className="w-4 h-4" />
											</div>
											<div>
												<span className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-400 block">
													Km Target
												</span>
												<span className="text-xs font-extrabold text-slate-900 leading-none">
													{item.distanceKm} km
												</span>
											</div>
										</div>
									)}
								</div>
							</motion.div>
						);
					})}
			</div>

			{/* Stack Deck Footer Cues */}
			<div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1 pt-2">
				<span className="flex items-center gap-1 text-slate-500">
					<Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
					Drag top card left/right to pop off deck
				</span>
				<span className="text-slate-500 font-semibold">
					Underneath:{" "}
					<strong className="text-slate-800">{nextItem.distance}</strong>
				</span>
			</div>
		</div>
	);
}
