"use client";

export default function FixtureSkeleton() {
	return (
		<div className="space-y-8 animate-pulse">
			{/* Hero Skeleton */}
			<div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-6 md:p-8">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="space-y-3 w-full md:w-1/3">
						<div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
						<div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
						<div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
					</div>
					<div className="flex items-center justify-center gap-6 w-full md:w-1/3">
						<div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
						<div className="h-6 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
						<div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
					</div>
					<div className="space-y-3 w-full md:w-1/3 flex flex-col items-center md:items-end">
						<div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
						<div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
					</div>
				</div>
			</div>

			{/* Filters Skeleton */}
			<div className="flex flex-wrap items-center gap-2">
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl"
					/>
				))}
			</div>

			{/* Fixture Grid Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<div
						key={i}
						className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 p-5 space-y-4"
					>
						<div className="flex items-center justify-between">
							<div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
							<div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
						</div>
						<div className="flex items-center justify-between py-2">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
								<div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
							</div>
							<div className="h-4 w-6 bg-slate-200 dark:bg-slate-800 rounded" />
							<div className="flex items-center gap-3">
								<div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
								<div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
							</div>
						</div>
						<div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
							<div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
							<div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
