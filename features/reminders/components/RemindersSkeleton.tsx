export default function RemindersSkeleton() {
	return (
		<main
			className="min-h-screen bg-slate-50/80 relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36"
			role="status"
			aria-live="polite"
			aria-label="Loading quick reminders"
		>
			<div className="w-full space-y-6 sm:space-y-7 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* ═══════════════════════════════════════
				    TOP FLOATING HEADER CARD SKELETON
				═══════════════════════════════════════ */}
				<div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
						<div className="flex items-start gap-3.5 sm:gap-4">
							<div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
							<div className="space-y-2">
								<div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
								<div className="h-7 w-48 bg-slate-200 rounded-xl animate-pulse" />
								<div className="h-3.5 w-64 sm:w-80 bg-slate-200 rounded animate-pulse" />
							</div>
						</div>

						<div className="flex items-center gap-2 self-start sm:self-center shrink-0">
							<div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse" />
							<div className="h-8 w-28 bg-slate-100 rounded-xl animate-pulse" />
						</div>
					</div>
				</div>

				{/* ═══════════════════════════════════════
				    INLINE QUICK-ADD COMPOSER SKELETON
				═══════════════════════════════════════ */}
				<div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-3 sm:p-4 space-y-3">
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
						<div className="h-10 flex-1 bg-slate-100 rounded-xl animate-pulse" />
						<div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse shrink-0" />
					</div>

					{/* Chips row */}
					<div className="flex items-center gap-1.5 pt-0.5">
						<div className="h-6 w-16 bg-slate-100 rounded-lg animate-pulse" />
						<div className="h-6 w-20 bg-slate-100 rounded-lg animate-pulse" />
						<div className="h-6 w-20 bg-slate-100 rounded-lg animate-pulse" />
						<div className="h-6 w-24 bg-slate-100 rounded-lg animate-pulse" />
					</div>
				</div>

				{/* ═══════════════════════════════════════
				    SEARCH BAR SKELETON
				═══════════════════════════════════════ */}
				<div className="flex items-center justify-between gap-3 px-1">
					<div className="h-8 w-56 bg-slate-100 rounded-xl animate-pulse" />
					<div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
				</div>

				{/* ═══════════════════════════════════════
				    LINEAR CHECKLIST ROWS SKELETON
				═══════════════════════════════════════ */}
				<div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
					{[1, 2, 3, 4, 5].map((i) => (
						<div
							key={i}
							className="flex items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4"
						>
							<div className="flex items-center gap-3 min-w-0 flex-1">
								<div className="w-5 h-5 rounded-full bg-slate-200 animate-pulse shrink-0" />
								<div className="space-y-1.5 flex-1 max-w-lg">
									<div
										className="h-4 bg-slate-200 rounded animate-pulse"
										style={{ width: `${60 + (i % 3) * 15}%` }}
									/>
								</div>
							</div>

							<div className="flex items-center gap-2 shrink-0">
								<div className="h-6 w-24 bg-slate-100 rounded-lg animate-pulse" />
								<div className="w-7 h-7 bg-slate-100 rounded-lg animate-pulse hidden sm:block" />
								<div className="w-7 h-7 bg-slate-100 rounded-lg animate-pulse" />
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
