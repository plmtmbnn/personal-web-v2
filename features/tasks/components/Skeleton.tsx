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
					className="h-full w-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%]"
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
					<div key={index} className={index < count - 1 ? "mb-2" : ""}>
						{skeletonElement}
					</div>
				))}
			</>
		);
	}

	return skeletonElement;
}

/**
 * Task List Skeleton - Loading placeholder for task lists
 */
export function TaskListSkeleton() {
	return (
		<div className="space-y-3">
			{[1, 2, 3].map((i) => (
				<div
					key={i}
					className="flex items-start gap-3 sm:gap-4 p-4 bg-white border-2 border-slate-200 rounded-[1.5rem] sm:rounded-2xl shadow-sm"
				>
					{/* Drag handle */}
					<Skeleton
						width="1rem"
						height="1rem"
						variant="circle"
						className="mt-1"
					/>
					{/* Checkbox */}
					<Skeleton
						width="1.5rem"
						height="1.5rem"
						variant="circle"
						className="mt-1"
					/>
					{/* Content */}
					<div className="flex-1 min-w-0 space-y-2">
						{/* Title */}
						<Skeleton width="70%" height="1.25rem" />
						{/* Description */}
						<Skeleton width="90%" height="1rem" />
						{/* Metadata */}
						<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
							<Skeleton width="3rem" height="1rem" variant="rounded" />
							<Skeleton width="4rem" height="1rem" variant="rounded" />
						</div>
					</div>
					{/* Actions */}
					<div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
						<Skeleton width="1.5rem" height="1.5rem" variant="circle" />
						<Skeleton width="1.5rem" height="1.5rem" variant="circle" />
					</div>
				</div>
			))}
		</div>
	);
}

/**
 * Task Form Skeleton - Loading placeholder for task form
 */
export function TaskFormSkeleton() {
	return (
		<div className="bg-white border-2 border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
			{/* Header */}
			<div className="p-6 md:p-8 space-y-6">
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-2">
						<Skeleton width="6rem" height="1rem" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton width="2rem" height="2rem" variant="circle" />
						<Skeleton width="2rem" height="2rem" variant="circle" />
					</div>
				</div>

				{/* Title */}
				<div className="relative">
					<Skeleton width="60%" height="1.75rem" className="mb-2" />
				</div>

				{/* Notes */}
				<div className="pt-1">
					<div className="flex items-center justify-between mb-2">
						<Skeleton width="5rem" height="1rem" />
						<Skeleton width="4rem" height="1rem" />
					</div>
					<Skeleton width="100%" height="4rem" variant="rounded" />
				</div>

				{/* Metadata Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-4 border-t border-slate-50">
					{/* Category */}
					<div className="space-y-2">
						<Skeleton width="4rem" height="1rem" />
						<div className="flex flex-wrap gap-1.5 mb-2">
							{[1, 2, 3].map((i) => (
								<Skeleton
									key={i}
									width="3rem"
									height="1.5rem"
									variant="rounded"
								/>
							))}
						</div>
						<Skeleton width="100%" height="2.5rem" variant="rounded" />
					</div>

					{/* Due Date */}
					<div className="space-y-3">
						<Skeleton width="4rem" height="1rem" />
						<div className="flex flex-wrap gap-2">
							{[1, 2, 3].map((i) => (
								<Skeleton
									key={i}
									width="3rem"
									height="1.5rem"
									variant="rounded"
								/>
							))}
						</div>
						<Skeleton width="100%" height="2.5rem" variant="rounded" />
					</div>

					{/* Priority */}
					<div className="space-y-2">
						<Skeleton width="5rem" height="1rem" />
						<Skeleton width="100%" height="2.5rem" variant="rounded" />
					</div>

					{/* Recurrence */}
					<div className="space-y-2">
						<Skeleton width="5rem" height="1rem" />
						<Skeleton width="100%" height="2.5rem" variant="rounded" />
					</div>
				</div>
			</div>

			{/* Action Footer */}
			<div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<Skeleton width="8rem" height="1rem" />
					<Skeleton width="6rem" height="2.5rem" variant="rounded" />
				</div>
			</div>
		</div>
	);
}

/**
 * Analytics Dashboard Skeleton - Loading placeholder for analytics
 */
export function AnalyticsDashboardSkeleton() {
	return (
		<div className="space-y-6 sm:space-y-8">
			{/* General Report */}
			<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
				<div className="flex items-center justify-between mb-6">
					<Skeleton width="8rem" height="1.25rem" />
					<Skeleton width="6rem" height="1.25rem" />
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="text-center">
							<Skeleton width="100%" height="1rem" className="mb-2" />
							<Skeleton width="100%" height="1.5rem" />
						</div>
					))}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{[1, 2].map((i) => (
						<div key={i} className="space-y-3">
							<Skeleton width="100%" height="1rem" className="mb-2" />
							<div className="space-y-2">
								{[1, 2, 3].map((j) => (
									<div key={j} className="flex items-center justify-between">
										<Skeleton width="40%" height="1rem" />
										<Skeleton width="20%" height="1rem" />
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Heatmap */}
			<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
				<Skeleton width="100%" height="12rem" variant="rounded" />
			</div>
		</div>
	);
}

/**
 * Task Progress Skeleton - Loading placeholder for task progress
 */
export function TaskProgressSkeleton() {
	return (
		<div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm animate-pulse min-h-[142px]">
			<div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
				{/* Progress ring + status skeleton */}
				<div className="flex items-center gap-6 flex-shrink-0 w-full lg:w-auto">
					<div className="w-20 h-20 bg-slate-100 rounded-full flex-shrink-0" />
					<div className="space-y-2 flex-1 lg:w-48">
						<Skeleton width="6rem" height="1rem" />
						<Skeleton width="12rem" height="1.25rem" />
						<div className="flex gap-2 pt-1">
							<Skeleton width="5rem" height="1.5rem" variant="rounded" />
							<Skeleton width="5rem" height="1.5rem" variant="rounded" />
						</div>
					</div>
				</div>

				{/* Divider skeleton */}
				<div className="hidden lg:block w-px h-16 bg-slate-100 self-center" />

				{/* Metric cards skeleton */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 w-full">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="rounded-xl px-4 py-3 bg-slate-50 border border-slate-100 h-[68px] flex flex-col justify-between"
						>
							<Skeleton width="100%" height="0.75rem" className="mb-1" />
							<Skeleton width="60%" height="1.25rem" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
