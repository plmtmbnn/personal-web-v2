/**
 * Root Suspense Fallback (Next.js App Router Global Page Transition)
 *
 * Adheres strictly to the Brand-Monogram Loading Standard (ui-uix-guideline.md §24):
 * - Server Component with 0 client JS bundle overhead
 * - Minimalist brand monogram mark (PT) in a pure white Floating Card
 * - Soft ambient breathing halo with optical bottom-bar clearance
 * - Live emerald telemetry dot pip communicating active responsiveness
 * - Precision micro-activity indicator track with smooth scanning beam
 * - Fully non-blocking (pointer-events-none) & accessible (role="status", aria-live="polite")
 * - Zero spinners, zero explicit "Loading" text labels, zero AI-slop
 */
export default function Loading() {
	return (
		<div
			className="fixed inset-0 z-40 bg-slate-50/75 backdrop-blur-xs bg-dot-pattern flex items-center justify-center p-4 pb-24 sm:pb-28 select-none pointer-events-none"
			role="status"
			aria-live="polite"
			aria-label="Loading page"
		>
			<div className="relative flex items-center justify-center">
				{/* Soft ambient breathing halo */}
				<div className="absolute -inset-2.5 rounded-3xl bg-indigo-500/10 animate-ping opacity-35 motion-reduce:hidden" />

				{/* Elevated Floating Brand Mark Card */}
				<div className="relative w-16 h-16 sm:w-[4.25rem] sm:h-[4.25rem] rounded-[1.25rem] bg-white border border-slate-200/80 shadow-xl shadow-slate-900/5 flex flex-col items-center justify-center">
					{/* Brand Monogram */}
					<span className="text-base sm:text-lg font-black tracking-widest text-slate-900 font-mono select-none">
						PT
					</span>

					{/* Precision Micro-Activity Scanning Track */}
					<div className="w-7 h-[2px] rounded-full bg-slate-100 mt-1.5 overflow-hidden relative">
						<span className="absolute inset-y-0 w-3 rounded-full bg-slate-900 animate-scan-glide motion-reduce:animate-none" />
					</div>

					{/* Emerald Liveness Beacon */}
					<span className="absolute -top-1 -right-1 flex h-3 w-3">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
						<span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white shadow-2xs" />
					</span>
				</div>
			</div>
		</div>
	);
}
