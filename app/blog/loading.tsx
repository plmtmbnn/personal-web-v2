"use client";

import { Skeleton } from "@/features/shared/components/Shimmer";

/**
 * Blog List Loading Skeleton
 * Matches the BlogView layout (editorial header, floating card toolbar, 3-column floating card grid).
 */
export default function BlogListLoading() {
	return (
		<main
			className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-36 sm:pb-44 pt-24 sm:pt-32"
			role="status"
			aria-live="polite"
			aria-label="Loading blog posts"
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
				{/* Centered Hero Header Skeleton */}
				<div className="text-center max-w-3xl mx-auto space-y-3.5 pt-2 sm:pt-4 flex flex-col items-center">
					<Skeleton className="w-56 h-6 rounded-full" />
					<Skeleton className="w-72 sm:w-96 h-12 sm:h-14 rounded-2xl mt-1" />
					<Skeleton className="w-full max-w-xl h-5 rounded-full mt-2" />
				</div>

				{/* Floating Toolbar Skeleton */}
				<div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xs">
					<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
						<div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
							{[1, 2, 3, 4, 5].map((i) => (
								<Skeleton key={i} className="w-20 h-8 rounded-xl" />
							))}
						</div>
						<div className="flex items-center gap-2 w-full md:w-auto">
							<Skeleton className="w-full md:w-60 h-8 rounded-xl" />
							<Skeleton className="w-28 h-8 rounded-xl" />
						</div>
					</div>
				</div>

				{/* 3-Column Floating Card Grid Skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div
							key={i}
							className="bg-white border border-slate-200/80 rounded-[2rem] p-4 sm:p-5 shadow-xs flex flex-col justify-between"
						>
							<div>
								<Skeleton className="w-full aspect-[16/10] rounded-2xl mb-4" />
								<Skeleton className="w-24 h-3.5 rounded-md mb-2" />
								<Skeleton className="w-full h-5 rounded-lg mb-2" />
								<Skeleton className="w-4/5 h-4 rounded-md" />
							</div>
							<div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
								<Skeleton className="w-16 h-3 rounded-md" />
								<Skeleton className="w-20 h-4 rounded-md" />
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
