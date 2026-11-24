import { SwingShortlistSkeleton } from "@/features/utils/stock-tools/stock-explorer/components/dashboard/SwingShortlist";

export default function StockExplorerLoading() {
	return (
		<main
			aria-label="Loading IDX Swing Scanner"
			aria-busy="true"
			className="min-h-screen bg-slate-50/80 px-4 pt-20 pb-[calc(8rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-24 lg:px-8"
		>
			<div className="mx-auto max-w-6xl space-y-4 sm:space-y-5">
				<div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-7">
					<div className="h-4 w-48 rounded bg-slate-100 motion-safe:animate-pulse" />
					<div className="flex gap-4 border-y border-slate-100 py-4">
						<div className="size-12 shrink-0 rounded-2xl bg-slate-100 motion-safe:animate-pulse" />
						<div className="min-w-0 space-y-2">
							<div className="h-8 w-64 max-w-full rounded bg-slate-200 motion-safe:animate-pulse" />
							<div className="h-4 w-72 max-w-full rounded bg-slate-100 motion-safe:animate-pulse" />
						</div>
					</div>
					<div className="h-11 w-52 rounded-xl bg-slate-100 motion-safe:animate-pulse" />
				</div>
				<div className="flex gap-2 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs">
					<div className="h-11 w-28 rounded-xl bg-slate-100 motion-safe:animate-pulse" />
					<div className="h-11 w-40 rounded-xl bg-slate-50 motion-safe:animate-pulse" />
				</div>
				<SwingShortlistSkeleton />
			</div>
		</main>
	);
}
