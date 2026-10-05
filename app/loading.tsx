/**
 * Root Suspense Fallback
 *
 * Designed to be practically invisible as a "loading" state.
 * No spinners, no pulsing dots, no progress bars, no explicit text.
 * Just a confident, static floating monogram on a pristine canvas,
 * providing a seamless, elegant optical bridge between routes.
 */
export default function Loading() {
	return (
		<div
			className="fixed inset-0 z-50 bg-slate-50/60 backdrop-blur-md bg-dot-pattern flex items-center justify-center pointer-events-none select-none"
			aria-hidden="true"
		>
			{/* A single, quiet monogram card. Zero movement. */}
			<div className="w-12 h-12 rounded-[1.25rem] bg-white border border-slate-200/80 shadow-lg shadow-slate-200/40 flex items-center justify-center">
				<span className="text-[11px] font-black tracking-widest text-slate-400 font-mono relative left-[1px]">
					PT
				</span>
			</div>
		</div>
	);
}
