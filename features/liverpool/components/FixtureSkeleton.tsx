"use client";

export default function FixtureSkeleton() {
	return (
		<div className="space-y-12 animate-pulse">
			{/* Hero Skeleton */}
			<div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="space-y-3 w-full md:w-1/3">
						<div className="h-6 w-36 bg-slate-100 rounded-full" />
						<div className="h-8 w-48 bg-slate-100 rounded-xl" />
						<div className="h-4 w-40 bg-slate-100 rounded-full" />
					</div>
					<div className="flex items-center justify-center gap-6 w-full md:w-1/3">
						<div className="w-24 h-24 bg-slate-100 rounded-2xl" />
						<div className="w-10 h-10 bg-slate-100 rounded-full" />
						<div className="w-24 h-24 bg-slate-100 rounded-2xl" />
					</div>
					<div className="space-y-3 w-full md:w-1/3 flex flex-col items-center md:items-end">
						<div className="h-12 w-48 bg-slate-100 rounded-2xl" />
						<div className="h-4 w-28 bg-slate-100 rounded-full" />
					</div>
				</div>
			</div>

			{/* Filters Skeleton */}
			<div className="flex flex-wrap items-center gap-2">
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className="h-10 w-28 bg-white border border-slate-200/80 rounded-full shadow-xs"
					/>
				))}
			</div>

			{/* Fixture Grid Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<div
						key={i}
						className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-xs space-y-4"
					>
						<div className="flex items-center justify-between">
							<div className="h-5 w-24 bg-slate-100 rounded-full" />
							<div className="h-5 w-16 bg-slate-100 rounded-full" />
						</div>
						<div className="space-y-3 py-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-slate-100 rounded-2xl" />
									<div className="h-5 w-24 bg-slate-100 rounded-lg" />
								</div>
								<div className="h-4 w-8 bg-slate-100 rounded" />
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-slate-100 rounded-2xl" />
									<div className="h-5 w-24 bg-slate-100 rounded-lg" />
								</div>
								<div className="h-4 w-8 bg-slate-100 rounded" />
							</div>
						</div>
						<div className="flex items-center justify-between pt-3 border-t border-slate-100">
							<div className="h-4 w-28 bg-slate-100 rounded-full" />
							<div className="h-4 w-20 bg-slate-100 rounded-full" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
