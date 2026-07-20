"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Shimmer Effect Component
 * Adds a subtle shimmer to skeleton loaders for a polished look.
 */
export function Shimmer() {
	const reduceMotion = useReducedMotion();
	return (
		<div className="absolute inset-0 overflow-hidden">
			<motion.div
				className="absolute inset-0 bg-slate-200/40"
				initial={reduceMotion ? false : { x: "-100%" }}
				animate={{ x: "100%" }}
				transition={{
					duration: 1.5,
					repeat: Infinity,
					ease: "linear",
				}}
			/>
		</div>
	);
}

/**
 * Skeleton Component with Shimmer
 * A reusable skeleton loader with built-in shimmer effect.
 * Usage: <Skeleton className="w-full h-4 rounded-full" />
 */
export function Skeleton({
	className = "",
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={`relative bg-slate-100 overflow-hidden ${className}`}
			{...props}
		>
			<Shimmer />
		</div>
	);
}
