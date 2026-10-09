import { ChevronRight } from "lucide-react";

export default function InvestmentLoading() {
	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			{/* ── Top Floating Header Card Skeleton ─────────────────────────────────── */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 mb-5 sm:mb-8">
				<div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs relative overflow-hidden">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative z-10">
						<div className="flex-1 min-w-0">
							<nav className="flex items-center gap-1.5 mb-2">
								<div className="h-3 w-12 bg-slate-200 rounded animate-pulse" />
								<ChevronRight className="w-3.5 h-3.5 text-slate-300" />
								<div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
							</nav>
							<div className="h-8 sm:h-10 w-64 sm:w-96 bg-slate-200 rounded-lg animate-pulse mb-3" />
							<div className="h-4 sm:h-5 w-full max-w-lg bg-slate-200 rounded animate-pulse" />
							<div className="h-4 sm:h-5 w-3/4 max-w-md bg-slate-200 rounded animate-pulse mt-1.5" />
						</div>

						{/* Header Actions */}
						<div className="flex flex-wrap items-center gap-2 sm:gap-3">
							<div className="h-9 sm:h-10 w-36 bg-slate-200 rounded-xl animate-pulse" />
							<div className="h-9 sm:h-10 w-24 bg-slate-200 rounded-xl animate-pulse" />
							<div className="h-9 sm:h-10 w-10 sm:w-11 bg-slate-200 rounded-xl animate-pulse" />
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 space-y-6 sm:space-y-8">
				{/* ── 4-Column Primary Telemetry Strip Skeleton ─────────────────────────── */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between h-28 sm:h-32"
						>
							<div className="flex items-center justify-between gap-1.5 mb-2">
								<div className="h-2.5 w-24 bg-slate-200 rounded animate-pulse" />
								<div className="h-4 w-4 bg-slate-200 rounded-full animate-pulse" />
							</div>
							<div>
								<div className="h-6 sm:h-8 w-24 bg-slate-200 rounded animate-pulse mb-1.5" />
								<div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
							</div>
						</div>
					))}
				</div>

				{/* ── Overview Regimes Skeleton ────────────────────────────────────────── */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
					<div className="lg:col-span-6 bg-white rounded-[2rem] border border-slate-200/80 p-5 sm:p-8 shadow-xs h-[420px] animate-pulse flex flex-col justify-between">
						<div>
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 rounded-xl bg-slate-200" />
								<div className="h-5 w-40 bg-slate-200 rounded" />
							</div>
							<div className="h-10 w-32 bg-slate-200 rounded-lg mb-6" />
							<div className="h-4 w-full bg-slate-200 rounded mb-2" />
							<div className="h-4 w-5/6 bg-slate-200 rounded" />
						</div>
					</div>
					<div className="lg:col-span-6 bg-white rounded-[2rem] border border-slate-200/80 p-5 sm:p-8 shadow-xs h-[420px] animate-pulse flex flex-col justify-between">
						<div>
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 rounded-xl bg-slate-200" />
								<div className="h-5 w-40 bg-slate-200 rounded" />
							</div>
							<div className="h-10 w-32 bg-slate-200 rounded-lg mb-6" />
							<div className="h-4 w-full bg-slate-200 rounded mb-2" />
							<div className="h-4 w-5/6 bg-slate-200 rounded" />
						</div>
					</div>
				</div>

				{/* ── Matrix Skeleton ────────────────────────────────────────── */}
				<div className="bg-white rounded-[2rem] border border-slate-200/80 p-5 sm:p-8 shadow-xs h-[300px] animate-pulse mt-6 sm:mt-8" />
			</div>
		</main>
	);
}
