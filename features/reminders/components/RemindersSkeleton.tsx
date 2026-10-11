export default function RemindersSkeleton() {
	return (
		<main
			className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36"
			role="status"
			aria-live="polite"
			aria-label="Loading quick reminders"
		>
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
				{/* ═══════════════════════════════════════
				    TOP FLOATING HEADER CARD SKELETON
				═══════════════════════════════════════ */}
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 sm:gap-6 pb-6 border-b border-slate-100">
						<div className="flex items-start gap-4">
							<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
							<div className="space-y-2">
								<div className="h-4 w-44 bg-slate-200 rounded animate-pulse" />
								<div className="h-8 w-60 sm:w-72 bg-slate-200 rounded-xl animate-pulse" />
								<div className="h-4 w-72 sm:w-96 bg-slate-200 rounded animate-pulse" />
							</div>
						</div>

						<div className="h-10 w-32 bg-slate-100 rounded-xl animate-pulse shrink-0 self-start sm:self-center" />
					</div>

					{/* 3-Tile Telemetry Quick Strip Skeleton */}
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2"
							>
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 rounded bg-slate-200 animate-pulse" />
									<div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
								</div>
								<div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
								<div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
							</div>
						))}
					</div>
				</div>

				{/* ═══════════════════════════════════════
				    CREATION CARD SKELETON
				═══════════════════════════════════════ */}
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3.5">
							<div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
							<div className="space-y-1.5">
								<div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
								<div className="h-3.5 w-64 bg-slate-200 rounded animate-pulse" />
							</div>
						</div>
						<div className="hidden sm:block h-7 w-28 bg-slate-100 rounded-xl animate-pulse" />
					</div>

					{/* Textarea Shimmer */}
					<div className="h-28 sm:h-32 w-full bg-slate-100 rounded-2xl animate-pulse" />

					{/* Controls Row */}
					<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
						<div className="h-9 w-60 bg-slate-100 rounded-xl animate-pulse" />
						<div className="h-10 w-32 bg-slate-900/20 rounded-xl animate-pulse" />
					</div>
				</div>

				{/* ═══════════════════════════════════════
				    CONTROLS TOOLBAR SKELETON
				═══════════════════════════════════════ */}
				<div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
					<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
						<div className="flex items-center gap-2 overflow-hidden">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className="h-8 w-20 bg-slate-100 rounded-xl animate-pulse shrink-0"
								/>
							))}
						</div>
						<div className="h-9 w-full md:w-64 bg-slate-100 rounded-xl animate-pulse" />
					</div>
				</div>

				{/* ═══════════════════════════════════════
				    REMINDERS GRID SKELETON (4 Cards)
				═══════════════════════════════════════ */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between h-[210px] space-y-4 animate-pulse"
						>
							<div className="space-y-3">
								<div className="flex items-center justify-between gap-3">
									<div className="flex items-center gap-2.5">
										<div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
										<div className="space-y-1">
											<div className="h-3.5 w-20 bg-slate-200 rounded" />
											<div className="h-2.5 w-16 bg-slate-200 rounded" />
										</div>
									</div>
									<div className="h-6 w-24 bg-slate-100 rounded-xl" />
								</div>
								<div className="h-1 w-full bg-slate-100 rounded-full" />
								<div className="space-y-2 pt-1">
									<div className="h-4 w-full bg-slate-200 rounded" />
									<div className="h-4 w-3/4 bg-slate-200 rounded" />
								</div>
							</div>

							<div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
								<div className="h-7 w-24 bg-slate-100 rounded-xl" />
								<div className="flex items-center gap-1.5">
									<div className="h-7 w-24 bg-slate-100 rounded-xl" />
									<div className="w-8 h-8 rounded-xl bg-slate-100" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
