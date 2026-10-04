/**
 * GlobalLoading (Root Page Suspense Fallback)
 *
 * Subtle, brand-aligned loading state:
 * - Server Component with 0 client JS bundle overhead
 * - Minimalist brand monogram mark floating over the textured canvas
 * - No aggressive spinners or explicit "Loading" text labels
 * - Soft ambient breathing halo with optical bottom-bar clearance
 */
export default function GlobalLoading() {
	return (
		<div
			className="fixed inset-0 z-40 bg-slate-50/70 backdrop-blur-xs bg-dot-pattern flex items-center justify-center p-4 pb-24 sm:pb-28 select-none pointer-events-none"
			role="status"
			aria-live="polite"
		>
			<div className="relative flex items-center justify-center">
				{/* Soft ambient breathing ring */}
				<div className="absolute -inset-1.5 rounded-2xl bg-indigo-500/10 animate-ping opacity-35 motion-reduce:hidden" />

				{/* Elevated Floating Brand Mark */}
				<div className="relative w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-slate-900/5 flex items-center justify-center">
					<span className="text-sm font-black tracking-tight text-slate-900 font-mono select-none">
						PT
					</span>
					<span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
						<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white" />
					</span>
				</div>
			</div>
		</div>
	);
}
