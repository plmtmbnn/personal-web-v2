"use client";

export default function FixtureSkeleton() {
	return (
		<div className="animate-pulse w-full max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto">
			<div className="rounded-3xl sm:rounded-[2.25rem] border border-slate-200/80 bg-white shadow-xs p-4 sm:p-5 lg:p-6 flex flex-col gap-3 sm:gap-4 lg:gap-5">
				{/* Top bar skeleton */}
				<div className="flex items-center justify-between gap-2 pb-3 sm:pb-3.5 border-b border-slate-100 shrink-0">
					<div className="flex items-center gap-1.5 sm:gap-2">
						<div className="h-6 w-24 sm:w-28 bg-slate-100 rounded-full" />
						<div className="h-6 w-20 sm:w-24 bg-slate-100 rounded-full" />
					</div>
					<div className="h-6 w-28 sm:w-36 bg-slate-100 rounded-full" />
				</div>

				{/* Title skeleton */}
				<div className="flex justify-center pt-0.5">
					<div className="h-6 sm:h-7 w-48 sm:w-64 bg-slate-100 rounded-full" />
				</div>

				{/* Clash skeleton */}
				<div className="py-0.5 sm:py-1 flex items-center justify-between gap-2.5 sm:gap-6">
					<div className="flex flex-col items-center gap-2 flex-1">
						<div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-slate-100 rounded-2xl sm:rounded-3xl" />
						<div className="h-4 w-20 bg-slate-100 rounded-full" />
					</div>
					<div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full shrink-0" />
					<div className="flex flex-col items-center gap-2 flex-1">
						<div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-slate-100 rounded-2xl sm:rounded-3xl" />
						<div className="h-4 w-20 bg-slate-100 rounded-full" />
					</div>
				</div>

				{/* Countdown skeleton */}
				<div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 flex flex-col items-center gap-2 sm:gap-2.5">
					<div className="flex items-center gap-1.5 sm:gap-2">
						<div className="w-11 sm:w-14 h-10 sm:h-12 bg-slate-100 rounded-xl sm:rounded-2xl" />
						<div className="w-11 sm:w-14 h-10 sm:h-12 bg-slate-100 rounded-xl sm:rounded-2xl" />
						<div className="w-11 sm:w-14 h-10 sm:h-12 bg-slate-100 rounded-xl sm:rounded-2xl" />
						<div className="w-11 sm:w-14 h-10 sm:h-12 bg-slate-100 rounded-xl sm:rounded-2xl" />
					</div>
					<div className="h-3.5 w-48 sm:w-64 bg-slate-100 rounded-full" />
				</div>

				{/* Action skeleton */}
				<div className="flex items-center justify-between gap-3 pt-2.5 sm:pt-3.5 border-t border-slate-100 shrink-0">
					<div className="h-4 w-32 bg-slate-100 rounded-full hidden sm:block" />
					<div className="h-9 w-full sm:w-44 bg-slate-100 rounded-full" />
				</div>
			</div>
		</div>
	);
}
