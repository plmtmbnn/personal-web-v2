"use client";

import { motion } from "framer-motion";

/**
 * Shimmer Effect Component
 * Adds a gradient shimmer animation to skeleton loaders for a polished look.
 */
export function Shimmer() {
	return (
		<div className="absolute inset-0 overflow-hidden">
			<motion.div
				className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/70 to-transparent"
				initial={{ x: "-100%" }}
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
