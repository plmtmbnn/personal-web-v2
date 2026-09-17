"use client";

export default function FixtureSkeleton() {
	return (
		<div className="animate-pulse w-full my-auto">
			<div className="rounded-3xl sm:rounded-[2rem] border border-slate-200/80 bg-white p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 sm:space-y-6">
				{/* Top bar skeleton */}
				<div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
					<div className="flex items-center gap-2">
						<div className="h-6 w-28 bg-slate-100 rounded-full" />
						<div className="h-6 w-24 bg-slate-100 rounded-full" />
					</div>
					<div className="h-6 w-32 bg-slate-100 rounded-full" />
				</div>

				{/* Clash skeleton */}
				<div className="py-2 sm:py-4 flex items-center justify-between gap-4">
					<div className="flex flex-col items-center gap-2 flex-1">
						<div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-2xl sm:rounded-3xl" />
						<div className="h-4 w-20 bg-slate-100 rounded-full" />
					</div>
					<div className="w-8 h-8 sm:w-11 sm:h-11 bg-slate-100 rounded-full shrink-0" />
					<div className="flex flex-col items-center gap-2 flex-1">
						<div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-2xl sm:rounded-3xl" />
						<div className="h-4 w-20 bg-slate-100 rounded-full" />
					</div>
				</div>

				{/* Countdown skeleton */}
				<div className="bg-slate-50 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col items-center gap-3">
					<div className="flex gap-2">
						<div className="w-12 h-10 bg-slate-100 rounded-xl" />
						<div className="w-12 h-10 bg-slate-100 rounded-xl" />
						<div className="w-12 h-10 bg-slate-100 rounded-xl" />
						<div className="w-12 h-10 bg-slate-100 rounded-xl" />
					</div>
					<div className="h-4 w-48 bg-slate-100 rounded-full" />
				</div>

				{/* Action skeleton */}
				<div className="flex items-center justify-between pt-3 border-t border-slate-100">
					<div className="h-4 w-32 bg-slate-100 rounded-full hidden sm:block" />
					<div className="h-8 w-36 bg-slate-100 rounded-full" />
				</div>
			</div>
		</div>
	);
}
