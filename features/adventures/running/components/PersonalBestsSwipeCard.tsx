"use client";

import { useState, useCallback } from "react";
import {
	motion,
	useMotionValue,
	useTransform,
	useReducedMotion,
	useAnimation,
} from "framer-motion";
import { Trophy, Layers } from "lucide-react";
import type { PersonalBestItem } from "../types/personal-bests";
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

	const stackSlots = Array.from({ length: VISIBLE_CARDS }, (_, slotOffset) => {
		const itemIndex = (topIndex + slotOffset) % totalItems;
		return {
			slotOffset,
			itemIndex,
			item: personalBests[itemIndex],
		};
	});

	return (
		<div className="w-full max-w-md mx-auto bg-white/50 backdrop-blur-xl border border-slate-200/60 p-5 sm:p-7 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 flex flex-col relative z-10 select-none">
			<Header
				currentIndex={topIndex}
				totalItems={totalItems}
				shouldReduceMotion={shouldReduceMotion}
			/>

			<div className="relative h-[340px] sm:h-[360px] flex items-end justify-center perspective-1000 mt-2">
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
		</div>
	);
}

interface HeaderProps {
	currentIndex: number;
	totalItems: number;
	shouldReduceMotion: boolean;
}

function Header({ currentIndex, totalItems, shouldReduceMotion }: HeaderProps) {
	return (
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
				{currentIndex + 1} / {totalItems}
			</motion.span>
		</div>
	);
}
