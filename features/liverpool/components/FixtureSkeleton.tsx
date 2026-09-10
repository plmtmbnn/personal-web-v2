"use client";

export default function FixtureSkeleton() {
	return (
		<div className="animate-pulse">
			{/* Hero Card Skeleton */}
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
		</div>
	);
}
