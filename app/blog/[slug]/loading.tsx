"use client";

/**
 * Blog Detail Loading Skeleton
 * Mimics the high-fidelity layout of the actual article page.
 */
export default function BlogDetailLoading() {
	return (
		<main className="min-h-screen bg-background relative overflow-hidden pb-32">
			{/* Background Ambience */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-10%] right-[-10%] w-[70%] lg:w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
				<div
					className="absolute bottom-[-10%] left-[-10%] w-[70%] lg:w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="max-w-4xl mx-auto px-6 pt-20 sm:pt-32">
				{/* Breadcrumb Skeleton */}
				<div className="mb-8 sm:mb-12">
					<div className="flex items-center gap-2 py-2">
						<div className="w-4 h-4 bg-white/5 rounded-md animate-pulse" />
						<div className="w-24 h-3 bg-white/5 rounded-full animate-pulse" />
					</div>
				</div>

				{/* Header Skeleton */}
				<header className="space-y-8 sm:space-y-10 mb-12 sm:mb-20">
					<div className="space-y-6">
						<div className="flex flex-wrap items-center gap-3 sm:gap-4">
							<div className="w-32 h-6 bg-white/5 border border-white/10 rounded-full animate-pulse" />
							<div className="w-24 h-6 bg-white/5 border border-white/10 rounded-full animate-pulse" />
						</div>

						<div className="space-y-3">
							<div className="w-full h-12 sm:h-16 bg-white/5 rounded-2xl animate-pulse" />
							<div className="w-3/4 h-12 sm:h-16 bg-white/5 rounded-2xl animate-pulse" />
						</div>

						<div className="w-full h-20 bg-white/5 rounded-2xl animate-pulse" />
					</div>

					<div className="flex items-center gap-4 pt-8 sm:pt-10 border-t border-white/5">
						<div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
						<div className="space-y-2">
							<div className="w-24 h-3 bg-white/5 rounded-full animate-pulse" />
							<div className="w-32 h-2 bg-white/5 rounded-full animate-pulse" />
						</div>
					</div>
				</header>

				{/* Content Frame Skeleton */}
				<div className="relative">
					<div className="glass-card p-6 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl h-[600px] flex flex-col gap-6">
						<div className="w-full h-4 bg-white/5 rounded-full animate-pulse" />
						<div className="w-5/6 h-4 bg-white/5 rounded-full animate-pulse" />
						<div className="w-full h-4 bg-white/5 rounded-full animate-pulse" />
						<div className="w-4/6 h-4 bg-white/5 rounded-full animate-pulse" />
						<div className="mt-8 w-full h-48 bg-white/5 rounded-3xl animate-pulse" />
						<div className="mt-8 w-full h-4 bg-white/5 rounded-full animate-pulse" />
						<div className="w-3/4 h-4 bg-white/5 rounded-full animate-pulse" />
					</div>
				</div>
			</div>
		</main>
	);
}
