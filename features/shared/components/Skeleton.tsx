"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
	width?: string;
	height?: string;
	className?: string;
	variant?: "text" | "circle" | "rectangle" | "rounded";
	count?: number;
	animation?: boolean;
}

/**
 * Skeleton loading component for better perceived performance
 */
export function Skeleton({
	width = "100%",
	height = "1rem",
	className = "",
	variant = "text",
	count = 1,
	animation = true,
}: SkeletonProps) {
	const baseClasses = "bg-slate-100/80";

	const getVariantClasses = () => {
		switch (variant) {
			case "circle":
				return "rounded-full";
			case "rectangle":
				return "rounded";
			case "rounded":
				return "rounded-xl";
			default:
				return "rounded";
		}
	};

	const skeletonElement = (
		<div
			className={`${baseClasses} ${getVariantClasses()} ${className}`}
			style={{ width, height }}
		>
			{animation && (
				<motion.div
					className="h-full w-full bg-slate-100"
					animate={{ backgroundPosition: ["0% 0%", "-100% 0%"] }}
					transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
				/>
			)}
		</div>
	);

	if (count > 1) {
		return (
			<>
				{Array.from({ length: count }).map((_, index) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: simple list
						key={index}
						className={index < count - 1 ? "mb-2" : ""}
					>
						{skeletonElement}
					</div>
				))}
			</>
		);
	}

	return skeletonElement;
}
