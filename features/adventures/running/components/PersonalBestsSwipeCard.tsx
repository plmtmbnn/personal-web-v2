"use client";

import { useState, useCallback, useEffect } from "react";
import {
	motion,
	useMotionValue,
	useTransform,
	useReducedMotion,
	useAnimation,
} from "framer-motion";
import {
	Trophy,
	Layers,
	ChevronLeft,
	ChevronRight,
	Sparkles,
} from "lucide-react";
import { personalBests } from "../data/personal-bests";
import { SwipeCard } from "./SwipeCard";
import { DragStamps } from "./DragStamps";

const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 400;
const VISIBLE_CARDS = 3;

const getInitialIndex = () => {
	const highestIndex = personalBests.findIndex((item) => item.isHighest);
	return highestIndex >= 0 ? highestIndex : personalBests.length - 1;
};

export default function PersonalBestsSwipeCard() {
	const reduceMotion = useReducedMotion();
	const shouldReduceMotion = reduceMotion === true;

	const [topIndex, setTopIndex] = useState<number>(getInitialIndex());
	const [isAnimating, setIsAnimating] = useState(false);

	const controls = useAnimation();
	const x = useMotionValue(0);

	const rotate = useTransform(x, [-250, 0, 250], [-12, 0, 12]);
	const stampNextOpacity = useTransform(x, [10, 100], [0, 1]);
	const stampPrevOpacity = useTransform(x, [-100, -10], [1, 0]);

	const totalItems = personalBests.length;

	const flyOut = useCallback(
		async (direction: "left" | "right") => {
			if (isAnimating) return;
			setIsAnimating(true);

			const exitX = direction === "right" ? 400 : -400;
			const exitRotate = direction === "right" ? 20 : -20;
			const offset = direction === "right" ? 1 : -1;

			await controls.start({
				x: exitX,
				rotate: exitRotate,
				opacity: 0,
				transition: { duration: 0.25, ease: "easeOut" },
			});

			setTopIndex((prev) => (prev + offset + totalItems) % totalItems);

			x.set(0);
			controls.set({ x: 0, rotate: 0, opacity: 1 });

			setIsAnimating(false);
		},
		[controls, isAnimating, totalItems, x],
	);

	const handleDragEnd = useCallback(
		(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
			const { offset, velocity } = info;

			if (offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) {
				flyOut("right");
			} else if (
				offset.x < -SWIPE_THRESHOLD ||
				velocity.x < -VELOCITY_THRESHOLD
			) {
				flyOut("left");
			}
		},
		[flyOut],
	);

	// Keyboard arrow navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") flyOut("left");
			if (e.key === "ArrowRight") flyOut("right");
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [flyOut]);

	const stackSlots = Array.from({ length: VISIBLE_CARDS }, (_, slotOffset) => {
		const itemIndex = (topIndex + slotOffset) % totalItems;
		return {
			slotOffset,
			itemIndex,
			item: personalBests[itemIndex],
		};
	});

	return (
		<div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-2xl border border-slate-200/80 p-5 sm:p-7 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-5 flex flex-col relative z-10 select-none">
			<Header
				currentIndex={topIndex}
				totalItems={totalItems}
				shouldReduceMotion={shouldReduceMotion}
				onPrev={() => flyOut("left")}
				onNext={() => flyOut("right")}
				disabled={isAnimating}
			/>

			{/* Card Stack */}
			<div className="relative h-[340px] sm:h-[360px] flex items-end justify-center perspective-1000 mt-1">
				{stackSlots
					.slice()
					.reverse()
					.map(({ slotOffset, item }) => {
						const isTop = slotOffset === 0;

						return (
							<SwipeCard
								key={item.id}
								item={item}
								isTop={isTop}
								slotOffset={slotOffset}
								totalItems={totalItems}
								x={x}
								rotate={rotate}
								controls={controls}
								isAnimating={isAnimating}
								shouldReduceMotion={shouldReduceMotion}
								onDragEnd={handleDragEnd}
							>
								{isTop && !shouldReduceMotion && (
									<DragStamps
										nextOpacity={stampNextOpacity}
										prevOpacity={stampPrevOpacity}
									/>
								)}
							</SwipeCard>
						);
					})}
			</div>

			{/* Interactive Milestone Indicator Pips */}
			<div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-3">
				<div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 max-w-full">
					{personalBests.map((item, idx) => {
						const isActive = idx === topIndex;
						return (
							<button
								key={item.id}
								type="button"
								onClick={() => {
									if (!isAnimating && idx !== topIndex) {
										setTopIndex(idx);
									}
								}}
								className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
									isActive
										? `${item.badgeBg} border-current shadow-xs scale-105`
										: "bg-slate-50 text-slate-500 border-slate-200/60 hover:bg-slate-100"
								}`}
							>
								{item.distance}
							</button>
						);
					})}
				</div>

				{/* Hint caption */}
				<p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
					<Sparkles className="w-3 h-3 text-amber-500" />
					Swipe card or use arrows to navigate records
				</p>
			</div>
		</div>
	);
}

interface HeaderProps {
	currentIndex: number;
	totalItems: number;
	shouldReduceMotion: boolean;
	onPrev: () => void;
	onNext: () => void;
	disabled?: boolean;
}

function Header({
	currentIndex,
	totalItems,
	shouldReduceMotion,
	onPrev,
	onNext,
	disabled,
}: HeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<motion.div
				initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
				animate={{ opacity: 1, x: 0 }}
				className="flex items-center gap-3"
			>
				<div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
					<Trophy className="w-5 h-5 text-amber-500" />
				</div>
				<div>
					<h3 className="text-sm font-black text-slate-900 leading-tight">
						Personal Bests
					</h3>
					<p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
						Milestone Records
					</p>
				</div>
			</motion.div>

			<div className="flex items-center gap-2">
				{/* Navigation Buttons */}
				<div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
					<button
						type="button"
						onClick={onPrev}
						disabled={disabled}
						className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all active:scale-90 disabled:opacity-40 cursor-pointer shadow-xs"
						title="Previous Record"
					>
						<ChevronLeft className="w-3.5 h-3.5" />
					</button>
					<button
						type="button"
						onClick={onNext}
						disabled={disabled}
						className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all active:scale-90 disabled:opacity-40 cursor-pointer shadow-xs"
						title="Next Record"
					>
						<ChevronRight className="w-3.5 h-3.5" />
					</button>
				</div>

				<motion.span
					initial={shouldReduceMotion ? false : { opacity: 0, x: 10 }}
					animate={{ opacity: 1, x: 0 }}
					className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1 bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-xl shadow-xs tabular-nums"
				>
					<Layers className="w-3.5 h-3.5 text-slate-400" />
					{currentIndex + 1} / {totalItems}
				</motion.span>
			</div>
		</div>
	);
}
