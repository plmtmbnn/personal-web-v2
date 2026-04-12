"use client";

/**
 * Blog List Loading Skeleton
 * Mimics the curated insights grid layout.
 */
export default function BlogListLoading() {
	return (
		<main className="min-h-screen bg-background relative overflow-x-hidden pb-32">
			{/* Aesthetic Background Ambience */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-10%] w-[70%] lg:w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse" />
				<div
					className="absolute bottom-[-5%] left-[-10%] w-[70%] lg:w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="max-w-6xl mx-auto px-6 pt-20 sm:pt-32">
				{/* Header Skeleton */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 sm:mb-20 border-b border-white/5 pb-12 sm:pb-16">
					<div className="space-y-4 sm:space-y-6 text-center sm:text-left">
						<div className="flex items-center justify-center sm:justify-start gap-3">
							<div className="w-5 h-5 bg-white/5 rounded-md animate-pulse" />
							<div className="w-24 h-3 bg-white/5 rounded-full animate-pulse" />
						</div>
						<div className="space-y-3">
							<div className="w-64 sm:w-96 h-10 sm:h-12 bg-white/5 rounded-2xl animate-pulse mx-auto sm:mx-0" />
						</div>
						<div className="space-y-2">
							<div className="w-full sm:w-[480px] h-4 bg-white/5 rounded-full animate-pulse mx-auto sm:mx-0" />
							<div className="w-3/4 sm:w-[320px] h-4 bg-white/5 rounded-full animate-pulse mx-auto sm:mx-0" />
						</div>
					</div>

					<div className="flex items-center self-center sm:self-auto gap-4 px-5 py-2.5 sm:px-6 sm:py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
						<div className="text-right space-y-2">
							<div className="w-8 h-4 bg-white/5 rounded-full animate-pulse ml-auto" />
							<div className="w-16 h-2 bg-white/5 rounded-full animate-pulse" />
						</div>
						<div className="w-px h-6 sm:h-8 bg-white/10" />
						<div className="w-5 h-5 bg-white/5 rounded-md animate-pulse" />
					</div>
				</div>

				{/* Blog Grid Skeleton - 3 Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-[400px] relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-white/5 border-2 border-white/10 p-6 sm:p-10 flex flex-col justify-between"
						>
							<div className="space-y-6">
								{/* Meta Info Skeleton */}
								<div className="w-32 h-6 bg-white/5 border border-white/10 rounded-full animate-pulse" />

								{/* Title & Description Skeleton */}
								<div className="space-y-4">
									<div className="w-full h-8 bg-white/5 rounded-xl animate-pulse" />
									<div className="w-5/6 h-8 bg-white/5 rounded-xl animate-pulse" />
									<div className="space-y-2 pt-4">
										<div className="w-full h-3 bg-white/5 rounded-full animate-pulse" />
										<div className="w-full h-3 bg-white/5 rounded-full animate-pulse" />
										<div className="w-2/3 h-3 bg-white/5 rounded-full animate-pulse" />
									</div>
								</div>
							</div>

							{/* Footer Skeleton */}
							<div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/5 flex items-center justify-between">
								<div className="w-24 h-3 bg-white/5 rounded-full animate-pulse" />
								<div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
