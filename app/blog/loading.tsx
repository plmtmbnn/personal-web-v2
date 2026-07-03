"use client";

import { Skeleton } from "@/components/Shimmer";

/**
 * Blog List Loading Skeleton
 * Matches the BlogView layout (sidebar + unified grid).
 */
export default function BlogListLoading() {
	return (
		<main
			className="min-h-screen bg-white relative overflow-x-hidden pb-32"
			role="status"
			aria-live="polite"
			aria-label="Loading blog posts"
		>
			{/* Aesthetic Background Ambient */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-10%] w-[80%] lg:w-[60%] h-[60%] bg-slate-100/50 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-5%] left-[-10%] w-[80%] lg:w-[60%] h-[60%] bg-blue-50/30 rounded-full blur-[120px]" />
			</div>

			<div className="max-w-7xl mx-auto px-6 pt-10 sm:pt-16">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
					{/* LEFT COLUMN: Sidebar Skeleton */}
					<aside className="lg:col-span-3 space-y-6 sticky top-8 pb-8">
						{/* Title and Description Skeleton */}
						<div className="space-y-4 w-full">
							<div className="flex items-center gap-2.5">
								<Skeleton className="w-4 h-4 rounded-md" />
								<Skeleton className="w-32 h-3 rounded-full" />
							</div>
							<div className="space-y-2">
								<Skeleton className="w-48 h-10 sm:h-12 rounded-xl" />
								<Skeleton className="w-full sm:w-64 h-4 rounded-full" />
								<Skeleton className="w-3/4 sm:w-48 h-4 rounded-full" />
							</div>
						</div>

						{/* Search & Category Filter Skeleton */}
						<div className="bg-slate-50 border border-slate-100 p-5 rounded-[2rem] space-y-5 w-full">
							{/* Search Input Skeleton */}
							<div className="relative">
								<Skeleton className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-md" />
								<Skeleton className="w-full h-10 rounded-xl" />
							</div>

							{/* Category Tabs Skeleton */}
							<div className="space-y-2">
								<Skeleton className="w-16 h-3 rounded-full" />
								<div className="flex flex-row overflow-x-auto gap-1.5 no-scrollbar pb-2">
									{[1, 2, 3, 4, 5].map((i) => (
										<Skeleton
											key={i}
											className="w-16 h-8 rounded-xl shrink-0"
										/>
									))}
								</div>
							</div>
						</div>

						{/* Archive Stats Badge Skeleton */}
						<div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl max-w-sm w-full">
							<div className="flex items-center gap-3">
								<Skeleton className="w-9 h-9 rounded-xl" />
								<div className="space-y-2">
									<Skeleton className="w-20 h-3 rounded-full" />
									<Skeleton className="w-12 h-2 rounded-full" />
								</div>
							</div>
						</div>
					</aside>

					{/* RIGHT COLUMN: Grid Skeleton */}
					<div className="lg:col-span-9 space-y-8">
						{/* Filtered Results Header Skeleton (optional) */}
						<div className="flex items-center gap-4 pt-4">
							<Skeleton className="w-32 h-3 rounded-full" />
							<Skeleton className="h-px w-full" />
						</div>

						{/* Unified Grid Skeleton */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Headline Card Skeleton (spans 2 columns) */}
							<div className="md:col-span-2">
								<div className="relative flex flex-col h-full bg-white border border-slate-200 rounded-[2rem] overflow-hidden">
									{/* Image Skeleton */}
									<Skeleton className="relative w-full h-64 sm:h-80" />
									{/* Content Skeleton */}
									<div className="flex-1 flex flex-col justify-between p-4 space-y-4">
										<div className="space-y-2.5">
											<div className="flex items-center gap-3">
												<Skeleton className="w-12 h-3 rounded-full" />
												<Skeleton className="w-10 h-3 rounded-full" />
											</div>
											<Skeleton className="w-full h-6 rounded-xl" />
											<Skeleton className="w-3/4 h-4 rounded-full" />
											<Skeleton className="w-1/2 h-4 rounded-full" />
										</div>
										<div className="pt-4 flex items-center gap-1">
											<Skeleton className="w-16 h-3 rounded-full" />
										</div>
									</div>
								</div>
							</div>

							{/* Regular Cards Skeleton */}
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className="relative flex flex-col h-full bg-white border border-slate-200 rounded-[2rem] overflow-hidden"
								>
									{/* Image Skeleton */}
									<Skeleton className="relative w-full h-48" />
									{/* Content Skeleton */}
									<div className="flex-1 flex flex-col justify-between p-4 space-y-4">
										<div className="space-y-2.5">
											<div className="flex items-center gap-3">
												<Skeleton className="w-12 h-3 rounded-full" />
												<Skeleton className="w-10 h-3 rounded-full" />
											</div>
											<Skeleton className="w-full h-5 rounded-xl" />
											<Skeleton className="w-3/4 h-3 rounded-full" />
											<Skeleton className="w-1/2 h-3 rounded-full" />
										</div>
										<div className="pt-4 flex items-center gap-1">
											<Skeleton className="w-16 h-3 rounded-full" />
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
