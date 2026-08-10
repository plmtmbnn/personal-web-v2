"use client";

import { useState, useCallback } from "react";
import {
	motion,
	useMotionValue,
	useTransform,
	useReducedMotion,
	useAnimation,
} from "framer-motion";
import {
	Trophy,
	Zap,
	Flame,
	Milestone,
	Mountain,
	Gauge,
	Route,
	Crown,
	Layers,
	ThumbsUp,
	RotateCcw,
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
		badgeBg: "bg-rose-50 text-rose-700",
		bgGlow: "from-rose-500/10 via-rose-500/5 to-transparent",
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
		badgeBg: "bg-amber-50 text-amber-700",
		bgGlow: "from-amber-500/10 via-amber-500/5 to-transparent",
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
		badgeBg: "bg-emerald-50 text-emerald-700",
		bgGlow: "from-emerald-500/10 via-emerald-500/5 to-transparent",
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
		badgeBg: "bg-blue-50 text-blue-700",
		bgGlow: "from-blue-500/10 via-blue-500/5 to-transparent",
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
		badgeBg: "bg-purple-50 text-purple-700",
		bgGlow: "from-purple-500/10 via-purple-500/5 to-transparent",
		borderAccent: "border-t-purple-500",
		isHighest: true,
	},
];

const defaultHighestIndex = personalBests.findIndex((item) => item.isHighest);
const INITIAL_TOP_INDEX =
	defaultHighestIndex >= 0 ? defaultHighestIndex : personalBests.length - 1;

export default function PersonalBestsSwipeCard() {
	const reduceMotion = useReducedMotion();
	const shouldReduceMotion = reduceMotion === true;

	const [topIndex, setTopIndex] = useState<number>(INITIAL_TOP_INDEX);
	const [isAnimating, setIsAnimating] = useState(false);

	// Framer Motion controls for imperative exit animation
	const controls = useAnimation();
	const x = useMotionValue(0);

	// Smooth tilt based on drag
	const rotate = useTransform(x, [-250, 0, 250], [-12, 0, 12]);
	// Stamp opacities
	const stampNextOpacity = useTransform(x, [10, 100], [0, 1]);
	const stampPrevOpacity = useTransform(x, [-100, -10], [1, 0]);

	const TOTAL_ITEMS = personalBests.length;

	// Imperative fly-out animation avoiding layout/state lag
	const flyOut = useCallback(
		async (direction: "left" | "right") => {
			if (isAnimating) return;
			setIsAnimating(true);

			const exitX = direction === "right" ? 400 : -400;
			const exitRotate = direction === "right" ? 20 : -20;
			const offset = direction === "right" ? 1 : -1;

			// Animate out instantly
			await controls.start({
				x: exitX,
				rotate: exitRotate,
				opacity: 0,
				transition: { duration: 0.25, ease: "easeOut" },
			});

			// Update stack state
			setTopIndex((prev) => (prev + offset + TOTAL_ITEMS) % TOTAL_ITEMS);

			// Instantly reset the top card controls (it's now the *new* top card)
			x.set(0);
			controls.set({ x: 0, rotate: 0, opacity: 1 });

			setIsAnimating(false);
		},
		[controls, isAnimating, TOTAL_ITEMS, x],
	);

	// Physics-based drag release
	const handleDragEnd = (
		_: unknown,
		info: { offset: { x: number }; velocity: { x: number } },
	) => {
		const swipeThreshold = 80;
		const velocityThreshold = 400;

		if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
			flyOut("right");
		} else if (
			info.offset.x < -swipeThreshold ||
			info.velocity.x < -velocityThreshold
		) {
			flyOut("left");
		}
	};

	// We render the top 3 cards in the deck
	const stackSlots = [0, 1, 2].map((slotOffset) => {
		const itemIndex = (topIndex + slotOffset) % TOTAL_ITEMS;
		return {
			slotOffset,
			itemIndex,
			item: personalBests[itemIndex],
		};
	});

	return (
		<div className="w-full max-w-md mx-auto bg-white/50 backdrop-blur-xl border border-slate-200/60 p-5 sm:p-7 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 flex flex-col relative z-10 select-none">
			{/* Header */}
			<div className="flex items-center justify-between">
				<motion.div
					initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex items-center gap-3"
				>
					<div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/50 shadow-inner">
						<Trophy className="w-5 h-5" />
					</div>
					<div>
						<h3 className="text-sm font-extrabold text-slate-900 leading-tight">
							Personal Bests
						</h3>
						<p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
							Milestone Records
						</p>
					</div>
				</motion.div>

				<motion.span
					initial={shouldReduceMotion ? false : { opacity: 0, x: 10 }}
					animate={{ opacity: 1, x: 0 }}
					className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-sm"
				>
					<Layers className="w-4 h-4 text-slate-400" />
					{topIndex + 1} / {TOTAL_ITEMS}
				</motion.span>
			</div>

			{/* Swipe Stack Container */}
			<div className="relative h-[340px] sm:h-[360px] flex items-end justify-center perspective-1000 mt-2">
				{stackSlots
					.slice()
					.reverse()
					.map(({ slotOffset, item }) => {
						const isTop = slotOffset === 0;

						// Under-card positioning
						const yOffset = slotOffset * -14;
						const scale = 1 - slotOffset * 0.05;
						const opacity = 1 - slotOffset * 0.15;
						const zIndex = TOTAL_ITEMS - slotOffset;

						return (
							<motion.div
								key={item.id}
								style={{
									x: isTop ? x : 0,
									rotate: isTop && !shouldReduceMotion ? rotate : 0,
									zIndex,
								}}
								animate={
									isTop && isAnimating
										? controls
										: {
												y: yOffset,
												scale,
												opacity,
											}
								}
								transition={{
									type: "spring",
									stiffness: 400,
									damping: 30,
								}}
								drag={isTop && !isAnimating ? "x" : false}
								dragConstraints={{ left: 0, right: 0 }}
								dragElastic={0.6}
								onDragEnd={isTop ? handleDragEnd : undefined}
								whileTap={
									isTop && !isAnimating ? { cursor: "grabbing" } : undefined
								}
								className={`absolute bottom-0 w-full bg-white border-x border-b border-slate-200/80 border-t-[6px] ${
									item.borderAccent
								} rounded-[2rem] p-6 sm:p-7 flex flex-col justify-between h-[320px] sm:h-[340px] ${
									isTop
										? "cursor-grab shadow-2xl shadow-slate-200/50 touch-pan-y"
										: "pointer-events-none shadow-sm"
								}`}
							>
								{/* Performance-Friendly Radial Glow (No blur filter) */}
								<div
									className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] ${item.bgGlow} pointer-events-none rounded-[2rem] opacity-70`}
								/>

								{/* Stamps (Visible during drag on Top Card) */}
								{isTop && !shouldReduceMotion && (
									<>
										<motion.div
											style={{ opacity: stampNextOpacity }}
											className="absolute top-8 left-6 z-30 pointer-events-none border-2 border-emerald-500 text-emerald-600 bg-white/95 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest -rotate-12 shadow-sm flex items-center gap-1.5 backdrop-blur-sm"
										>
											<ThumbsUp className="w-4 h-4" /> Next
										</motion.div>
										<motion.div
											style={{ opacity: stampPrevOpacity }}
											className="absolute top-8 right-6 z-30 pointer-events-none border-2 border-amber-500 text-amber-600 bg-white/95 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest rotate-12 shadow-sm flex items-center gap-1.5 backdrop-blur-sm"
										>
											<RotateCcw className="w-4 h-4" /> Prev
										</motion.div>
									</>
								)}

								{/* Card Content */}
								<div className="relative z-10 flex flex-col h-full">
									{/* Header Area */}
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-4">
											<div
												className={`w-14 h-14 rounded-2xl ${item.badgeBg} border border-white/50 flex items-center justify-center shadow-inner shrink-0`}
											>
												<item.icon className={`w-7 h-7 ${item.color}`} />
											</div>
											<div>
												{item.isHighest ? (
													<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-[10px] font-black text-amber-700 uppercase tracking-wider mb-1 ring-1 ring-amber-500/20">
														<Crown className="w-3 h-3 text-amber-500" /> Highest
														Peak
													</span>
												) : (
													<p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
														Distance Record
													</p>
												)}
												<h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
													{item.distance}
												</h4>
											</div>
										</div>
									</div>

									{/* Main Metric Area */}
									<div className="mt-auto mb-6">
										<span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
											Best Duration
										</span>
										<div className="flex items-end gap-3 flex-wrap">
											<p className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter leading-none font-mono">
												{item.time}
											</p>
											<span
												className={`mb-2 inline-flex items-center px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ring-black/5 shadow-sm ${item.badgeBg}`}
											>
												{item.badge}
											</span>
										</div>
									</div>

									{/* Footer Metrics Grid */}
									<div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-100/80">
										<div className="flex items-center gap-3">
											<div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100 shrink-0 shadow-sm">
												<Gauge className="w-4 h-4" />
											</div>
											<div className="flex flex-col">
												<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
													Pace
												</span>
												<span className="text-sm font-bold text-slate-900">
													{item.pace}
												</span>
											</div>
										</div>

										<div className="flex items-center gap-3">
											<div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100 shrink-0 shadow-sm">
												{item.elevation ? (
													<Mountain className="w-4 h-4" />
												) : (
													<Route className="w-4 h-4" />
												)}
											</div>
											<div className="flex flex-col">
												<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
													{item.elevation ? "Elevation" : "Target"}
												</span>
												<span className="text-sm font-bold text-slate-900">
													{item.elevation
														? item.elevation
														: `${item.distanceKm} km`}
												</span>
											</div>
										</div>
									</div>
								</div>
							</motion.div>
						);
					})}
			</div>
		</div>
	);
}
