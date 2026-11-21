import { ChevronRight } from "lucide-react";

export default function StockExplorerLoading() {
	return (
		<main
			aria-label="Loading Market Intelligence Explorer"
			aria-busy="true"
			className="min-h-screen bg-slate-50/80 relative pt-20 sm:pt-24 pb-[calc(8rem+env(safe-area-inset-bottom))] sm:pb-[calc(9rem+env(safe-area-inset-bottom))] px-4 sm:px-6 lg:px-8"
		>
			<div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
				{/* Header Card Skeleton */}
				<div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
					<div className="flex items-center justify-between pb-4 border-b border-slate-100">
						<div className="flex items-center gap-1.5">
							<div className="h-3 w-10 bg-slate-200 rounded motion-safe:animate-pulse" />
							<ChevronRight className="w-3 h-3 text-slate-300" />
							<div className="h-3 w-14 bg-slate-200 rounded motion-safe:animate-pulse" />
							<ChevronRight className="w-3 h-3 text-slate-300" />
							<div className="h-3 w-32 bg-slate-200 rounded motion-safe:animate-pulse" />
						</div>
						<div className="h-9 w-28 bg-slate-200 rounded-xl motion-safe:animate-pulse" />
					</div>
					<div className="flex items-start gap-4">
						<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 shrink-0 motion-safe:animate-pulse" />
						<div className="flex-1 space-y-2.5">
							<div className="h-8 w-72 max-w-full bg-slate-200 rounded-lg motion-safe:animate-pulse" />
							<div className="h-4 w-full max-w-2xl bg-slate-200 rounded motion-safe:animate-pulse" />
						</div>
					</div>
					<div className="pt-4 border-t border-slate-100 flex gap-2">
						<div className="h-11 w-28 bg-slate-200 rounded-xl motion-safe:animate-pulse" />
						<div className="h-11 w-24 bg-slate-200 rounded-xl motion-safe:animate-pulse" />
					</div>
				</div>

				{/* Workstation Switcher Skeleton */}
				<div className="h-14 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs flex items-center gap-2">
					<div className="h-11 w-40 rounded-xl bg-slate-200 motion-safe:animate-pulse" />
					<div className="h-11 w-44 rounded-xl bg-slate-100 motion-safe:animate-pulse" />
				</div>

				{/* Compass Posture Bridge Skeleton */}
				<div className="h-24 rounded-3xl border border-slate-200/80 bg-white shadow-xs motion-safe:animate-pulse" />

				{/* 4 KPI Cards Skeleton */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((item) => (
						<div
							key={item}
							className="h-36 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between"
						>
							<div className="flex justify-between items-start">
								<div className="space-y-2">
									<div className="h-3 w-28 bg-slate-200 rounded motion-safe:animate-pulse" />
									<div className="h-7 w-24 bg-slate-200 rounded-lg motion-safe:animate-pulse" />
								</div>
								<div className="w-10 h-10 rounded-xl bg-slate-200 motion-safe:animate-pulse" />
							</div>
							<div className="h-3 w-full bg-slate-100 rounded motion-safe:animate-pulse" />
						</div>
					))}
				</div>

				{/* 2-Column Intelligence Matrix Skeleton */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
					<div className="lg:col-span-6 h-80 rounded-3xl border border-slate-200/80 bg-white shadow-xs motion-safe:animate-pulse" />
					<div className="lg:col-span-6 space-y-6">
						<div className="h-44 rounded-3xl border border-slate-200/80 bg-white shadow-xs motion-safe:animate-pulse" />
						<div className="h-44 rounded-3xl border border-slate-200/80 bg-white shadow-xs motion-safe:animate-pulse" />
					</div>
				</div>

				{/* Unified Screening Unit Skeleton */}
				<div className="h-72 rounded-3xl border border-slate-200/80 bg-white shadow-xs motion-safe:animate-pulse" />
			</div>
		</main>
	);
}
