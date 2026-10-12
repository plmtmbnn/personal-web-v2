export default function MovementSkeleton() {
	return (
		<div
			className="space-y-6 sm:space-y-8"
			role="status"
			aria-live="polite"
			aria-label="Loading Movement Snacks dashboard"
		>
			{/* Top Floating Header Card Skeleton */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6 animate-pulse">
				<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-5 border-b border-slate-100">
					<div className="space-y-2.5">
						<div className="h-4 w-36 bg-slate-200 rounded-md" />
						<div className="flex items-center gap-3">
							<div className="w-11 h-11 rounded-2xl bg-slate-200" />
							<div className="space-y-1.5">
								<div className="h-7 w-64 bg-slate-200 rounded-lg" />
								<div className="h-4 w-80 bg-slate-100 rounded" />
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-10 w-32 bg-slate-200 rounded-xl" />
						<div className="h-10 w-10 bg-slate-100 rounded-xl" />
					</div>
				</div>

				{/* 4-Tile Telemetry Strip Skeleton */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2"
						>
							<div className="h-3 w-16 bg-slate-200 rounded" />
							<div className="h-6 w-24 bg-slate-200 rounded" />
						</div>
					))}
				</div>

				{/* Tab Strip Skeleton */}
				<div className="h-10 w-72 bg-slate-100 rounded-2xl" />
			</div>

			{/* Progress Card Skeleton */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6 animate-pulse">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
					<div className="flex items-center gap-5 sm:gap-6">
						<div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-200" />
						<div className="space-y-2">
							<div className="h-7 w-32 bg-slate-200 rounded" />
							<div className="h-4 w-60 bg-slate-100 rounded" />
							<div className="h-3 w-40 bg-slate-100 rounded" />
						</div>
					</div>
					<div className="flex gap-2">
						<div className="h-10 w-28 bg-slate-100 rounded-xl" />
						<div className="h-10 w-32 bg-slate-200 rounded-xl" />
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div className="h-16 bg-slate-50 rounded-2xl border border-slate-200/70" />
					<div className="h-16 bg-slate-50 rounded-2xl border border-slate-200/70" />
				</div>
			</div>

			{/* Timeline Cards Skeleton */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4 animate-pulse">
				<div className="h-6 w-40 bg-slate-200 rounded pb-2" />
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<div
						key={i}
						className="h-20 bg-slate-50 rounded-2xl border border-slate-200/80"
					/>
				))}
			</div>
		</div>
	);
}
