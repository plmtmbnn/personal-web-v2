"use client";

import { Skeleton } from "@/components/Shimmer";

/**
 * Blog Detail Loading Skeleton
 * High-fidelity skeleton matching the actual article page layout.
 */
export default function BlogDetailLoading() {
	return (
		<main
			className="min-h-screen bg-white relative overflow-x-hidden pb-32 print:overflow-visible print:pb-0"
			role="status"
			aria-live="polite"
			aria-label="Loading article"
		>
			{/* Skip to content link for keyboard navigation */}
			<a
				href="#article-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded-lg focus:shadow-lg"
			>
				Skip to article content
			</a>

			{/* Hero Section Skeleton */}
			<section className="relative w-full">
				{/* Hero Image Skeleton */}
				<div className="relative w-full h-[52vh] min-h-[420px] print:hidden rounded-none">
					<Skeleton className="h-full w-full" />
				</div>

				{/* Overlapping Header Card Skeleton */}
				<div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20 -mt-24 sm:-mt-44">
					<div className="bg-white border border-slate-200 p-7 sm:p-14 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl shadow-slate-200/60">
						{/* Breadcrumb + category skeleton */}
						<div className="flex flex-wrap items-center gap-4 mb-6">
							<Skeleton className="w-24 h-4 rounded-full" />
							<div className="w-px h-4 bg-slate-200" />
							<Skeleton className="w-16 h-4 rounded-full" />
						</div>

						{/* Title skeleton */}
						<div className="space-y-4 mb-8">
							<Skeleton className="w-full h-10 sm:h-12 rounded-xl max-w-4xl" />
							<Skeleton className="w-3/4 h-10 sm:h-12 rounded-xl max-w-2xl" />
						</div>

						{/* Description skeleton */}
						<Skeleton className="w-full h-6 rounded-xl max-w-2xl mb-8" />

						{/* Meta row skeleton */}
						<div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6 border-t border-slate-100">
							{/* Author skeleton */}
							<div className="flex items-center gap-3">
								<Skeleton className="w-10 h-10 rounded-xl" />
								<div className="space-y-2">
									<Skeleton className="w-16 h-3 rounded-full" />
									<Skeleton className="w-24 h-2 rounded-full" />
								</div>
							</div>

							<div className="hidden sm:block w-px h-10 bg-slate-200" />

							{/* Date skeleton */}
							<div className="space-y-2">
								<Skeleton className="w-12 h-3 rounded-full" />
								<Skeleton className="w-20 h-2 rounded-full" />
							</div>

							<div className="hidden sm:block w-px h-10 bg-slate-200" />

							{/* Read time skeleton */}
							<div className="space-y-2">
								<Skeleton className="w-14 h-3 rounded-full" />
								<Skeleton className="w-12 h-2 rounded-full" />
							</div>

							<div className="hidden sm:block">
								<div className="space-y-2">
									<Skeleton className="w-8 h-3 rounded-full" />
									<Skeleton className="w-10 h-2 rounded-full" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Main Content Skeleton */}
			<section className="max-w-5xl mx-auto px-4 sm:px-6 relative mt-12 sm:mt-20">
				{/* Article body skeleton */}
				<div
					id="article-content"
					className="w-full shadow-xl shadow-slate-100 print:shadow-none bg-white border border-slate-200 rounded-[2rem] p-8 sm:p-12"
					role="status"
					aria-live="polite"
				>
					{/* Content lines skeleton */}
					<div className="space-y-4">
						<Skeleton className="w-full h-4 rounded-full" />
						<Skeleton className="w-5/6 h-4 rounded-full" />
						<Skeleton className="w-full h-4 rounded-full" />
						<Skeleton className="w-4/6 h-4 rounded-full" />

						{/* Image skeleton */}
						<Skeleton className="my-8 w-full h-64 rounded-3xl" />

						{/* More content */}
						<Skeleton className="w-full h-4 rounded-full" />
						<Skeleton className="w-3/4 h-4 rounded-full" />
						<Skeleton className="w-full h-4 rounded-full" />
						<Skeleton className="w-2/3 h-4 rounded-full" />
					</div>
				</div>

				{/* Share Block Skeleton */}
				<div className="w-full max-w-2xl mx-auto mt-16 print:hidden">
					<div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 sm:p-12 flex flex-col items-center gap-6 text-center">
						<div className="space-y-2">
							<Skeleton className="w-24 h-3 rounded-full" />
							<Skeleton className="w-32 h-4 rounded-full" />
						</div>
						<Skeleton className="w-full max-w-sm h-10 rounded-xl" />
					</div>
				</div>

				{/* Related Posts Skeleton */}
				<div className="mt-16 print:hidden">
					<div className="space-y-2 mb-6">
						<Skeleton className="w-24 h-3 rounded-full" />
						<Skeleton className="w-32 h-2 rounded-full" />
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
							>
								{/* Image skeleton */}
								<Skeleton className="relative h-48 w-full" />
								{/* Content skeleton */}
								<div className="p-4 space-y-3">
									<Skeleton className="w-16 h-3 rounded-full" />
									<Skeleton className="w-full h-4 rounded-full" />
									<Skeleton className="w-3/4 h-4 rounded-full" />
									<Skeleton className="w-1/2 h-3 rounded-full" />
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Return Anchor Skeleton */}
				<div className="mt-20 flex flex-col items-center gap-3 print:hidden">
					<Skeleton className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl w-48 h-10" />
				</div>
			</section>
		</main>
	);
}
