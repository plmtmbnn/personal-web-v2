import type { ReactNode } from "react";
import { motion, type MotionValue, type useAnimation } from "framer-motion";
import type { PersonalBestItem } from "../types/personal-bests";
import { CardContent } from "./CardContent";

interface SwipeCardProps {
	item: PersonalBestItem;
	isTop: boolean;
	slotOffset: number;
	totalItems: number;
	x: MotionValue<number>;
	rotate: MotionValue<number>;
	controls: ReturnType<typeof useAnimation>;
	isAnimating: boolean;
	shouldReduceMotion: boolean;
	onDragEnd: (
		event: unknown,
		info: { offset: { x: number }; velocity: { x: number } },
	) => void;
	children?: ReactNode;
}

const CARD_Y_OFFSET = -14;
const CARD_SCALE_STEP = 0.05;
const CARD_OPACITY_STEP = 0.15;

export function SwipeCard({
	item,
	isTop,
	slotOffset,
	totalItems,
	x,
	rotate,
	controls,
	isAnimating,
	shouldReduceMotion,
	onDragEnd,
	children,
}: SwipeCardProps) {
	const yOffset = slotOffset * CARD_Y_OFFSET;
	const scale = 1 - slotOffset * CARD_SCALE_STEP;
	const opacity = 1 - slotOffset * CARD_OPACITY_STEP;
	const zIndex = totalItems - slotOffset;

	return (
		<motion.div
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
			onDragEnd={isTop ? onDragEnd : undefined}
			whileTap={isTop && !isAnimating ? { cursor: "grabbing" } : undefined}
			className={`absolute bottom-0 w-full bg-white border-x border-b border-slate-200/80 border-t-[6px] ${
				item.borderAccent
			} rounded-[2rem] p-6 sm:p-7 flex flex-col justify-between h-[320px] sm:h-[340px] ${
				isTop
					? "cursor-grab shadow-2xl shadow-slate-200/50 touch-pan-y"
					: "pointer-events-none shadow-sm"
			}`}
		>
			<div
				className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] ${item.bgGlow} pointer-events-none rounded-[2rem] opacity-70`}
			/>

			{children}

			<CardContent item={item} />
		</motion.div>
	);
}
