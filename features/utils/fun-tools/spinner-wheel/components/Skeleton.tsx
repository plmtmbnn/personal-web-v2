export default function SpinnerWheelSkeleton() {
	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 space-y-6 sm:space-y-8 relative z-10">
				{/* Header Skeleton */}
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
					<div className="flex items-center justify-between pb-4 border-b border-slate-100">
						<div className="h-4 w-48 bg-slate-100 rounded-lg animate-pulse" />
						<div className="h-8 w-32 bg-slate-100 rounded-xl animate-pulse" />
					</div>
					<div className="flex items-start gap-4">
						<div className="w-12 h-12 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
						<div className="space-y-2 flex-1">
							<div className="h-7 w-44 bg-slate-200 rounded-xl animate-pulse" />
							<div className="h-4 w-96 max-w-full bg-slate-100 rounded-lg animate-pulse" />
						</div>
					</div>
				</div>

				{/* Main Workstation 2-Column Skeleton */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
					{/* Wheel Stage Skeleton (7 cols) */}
					<div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col items-center justify-between min-h-[540px] space-y-6">
						{/* Top Telemetry Strip */}
						<div className="w-full flex items-center justify-between pb-4 border-b border-slate-100">
							<div className="h-6 w-24 bg-slate-100 rounded-xl animate-pulse" />
							<div className="h-6 w-28 bg-slate-100 rounded-xl animate-pulse" />
						</div>

						{/* Wheel Circular Skeleton */}
						<div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-slate-100 flex items-center justify-center animate-pulse bg-slate-50">
							<div className="w-20 h-20 rounded-full bg-slate-200" />
						</div>

						{/* Spin Trigger Bar */}
						<div className="w-full max-w-sm h-12 bg-slate-200 rounded-2xl animate-pulse" />
					</div>

					{/* Control Console Skeleton (5 cols) */}
					<div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
						{/* Entries Input Skeleton */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="h-4 w-28 bg-slate-200 rounded-lg animate-pulse" />
								<div className="h-6 w-20 bg-slate-100 rounded-lg animate-pulse" />
							</div>
							<div className="h-40 w-full bg-slate-100 rounded-2xl animate-pulse" />
						</div>

						{/* Presets Skeleton */}
						<div className="space-y-2 pt-2 border-t border-slate-100">
							<div className="h-4 w-28 bg-slate-200 rounded-lg animate-pulse" />
							<div className="flex flex-wrap gap-2">
								<div className="h-7 w-24 bg-slate-100 rounded-xl animate-pulse" />
								<div className="h-7 w-28 bg-slate-100 rounded-xl animate-pulse" />
								<div className="h-7 w-20 bg-slate-100 rounded-xl animate-pulse" />
							</div>
						</div>

						{/* Color Palette Skeleton */}
						<div className="space-y-2 pt-2 border-t border-slate-100">
							<div className="h-4 w-28 bg-slate-200 rounded-lg animate-pulse" />
							<div className="grid grid-cols-3 gap-2">
								<div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
								<div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
								<div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
