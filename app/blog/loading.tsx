"use client";

import { Skeleton } from "@/features/shared/components/Shimmer";

/**
 * Blog List Loading Skeleton
 * Matches the BlogView layout (centered header, pill toolbar, 3-column editorial grid).
 */
export default function BlogListLoading() {
	return (
		<main
			className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 pt-24 sm:pt-32"
			role="status"
			aria-live="polite"
			aria-label="Loading blog posts"
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
				{/* Centered Hero Header Skeleton */}
				<div className="text-center max-w-3xl mx-auto space-y-4 pt-2 sm:pt-4 flex flex-col items-center">
					<Skeleton className="w-72 sm:w-96 h-12 sm:h-14 rounded-2xl" />
					<Skeleton className="w-full max-w-xl h-5 rounded-full mt-2" />
				</div>

				{/* Toolbar Skeleton */}
				<div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
					<div className="flex items-center gap-2 overflow-x-auto py-1">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="w-20 h-8 rounded-full" />
						))}
					</div>
					<div className="flex items-center gap-2.5 w-full sm:w-auto">
						<Skeleton className="w-full sm:w-56 h-8 rounded-full" />
						<Skeleton className="w-24 h-8 rounded-full" />
					</div>
				</div>

				{/* 3-Column Grid Skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 sm:gap-y-16">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div key={i} className="flex flex-col h-full">
							<Skeleton className="w-full aspect-[4/3] rounded-2xl sm:rounded-[1.5rem]" />
							<div className="mt-5 sm:mt-6 space-y-3">
								<Skeleton className="w-full h-5 rounded-lg" />
								<Skeleton className="w-4/5 h-4 rounded-md" />
								<Skeleton className="w-24 h-4 rounded-md mt-2" />
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
