export default function DeviceInspectorSkeleton() {
	return (
		<main
			className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8"
			role="status"
			aria-live="polite"
			aria-label="Loading device diagnostics"
		>
			<div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8 animate-pulse">
				{/* ── Tier 1: Header Skeleton ── */}
				<div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
					<div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
						<div className="h-4 w-44 bg-slate-200 rounded-lg" />
						<div className="h-7 w-28 bg-slate-200 rounded-xl" />
					</div>
					<div className="flex items-start gap-4">
						<div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0" />
						<div className="space-y-2 flex-1">
							<div className="h-7 w-72 bg-slate-200 rounded-xl" />
							<div className="h-4 w-96 max-w-full bg-slate-200 rounded" />
						</div>
					</div>
					<div className="pt-3 border-t border-slate-100 flex items-center justify-between">
						<div className="h-8 w-56 bg-slate-200 rounded-xl" />
						<div className="h-8 w-24 bg-slate-200 rounded-xl" />
					</div>
				</div>

				{/* ── Tier 2: 4-Card Telemetry KPI Strip ── */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-3"
						>
							<div className="flex items-center justify-between">
								<div className="h-8 w-8 rounded-xl bg-slate-200" />
								<div className="h-4 w-12 bg-slate-200 rounded" />
							</div>
							<div className="space-y-1.5">
								<div className="h-3 w-20 bg-slate-200 rounded" />
								<div className="h-6 w-32 bg-slate-200 rounded-lg" />
								<div className="h-3 w-24 bg-slate-200 rounded" />
							</div>
						</div>
					))}
				</div>

				{/* ── Tier 3: Tabs Navigation Skeleton ── */}
				<div className="h-12 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center px-2 gap-2">
					<div className="h-8 w-28 bg-slate-200 rounded-xl" />
					<div className="h-8 w-32 bg-slate-200 rounded-xl" />
					<div className="h-8 w-36 bg-slate-200 rounded-xl" />
					<div className="h-8 w-28 bg-slate-200 rounded-xl" />
					<div className="h-8 w-32 bg-slate-200 rounded-xl" />
				</div>

				{/* ── Main Stage Skeleton ── */}
				<div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
					<div className="flex items-center justify-between pb-4 border-b border-slate-100">
						<div className="h-6 w-56 bg-slate-200 rounded-xl" />
						<div className="h-9 w-36 bg-slate-200 rounded-xl" />
					</div>
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						{[1, 2, 3, 4].map((j) => (
							<div
								key={j}
								className="h-28 bg-slate-100 rounded-2xl p-4 space-y-2"
							>
								<div className="h-4 w-20 bg-slate-200 rounded" />
								<div className="h-8 w-24 bg-slate-200 rounded-lg" />
							</div>
						))}
					</div>
					<div className="h-20 bg-slate-50 rounded-2xl" />
				</div>
			</div>
		</main>
	);
}
