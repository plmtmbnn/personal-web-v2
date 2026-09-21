import { Loader2 } from "lucide-react";

/**
 * GlobalLoading (Root Page Suspense Fallback)
 *
 * Lightweight, minimalist loading state:
 * - Server Component with 0 client JS bundle overhead
 * - Single crisp GPU-accelerated indicator (no visual clutter)
 * - Modern Floating Card standard with optical bottom-bar clearance
 */
export default function GlobalLoading() {
	return (
		<div
			className="fixed inset-0 z-40 bg-slate-50/80 backdrop-blur-xs bg-dot-pattern flex items-center justify-center p-4 pb-24 sm:pb-28 select-none pointer-events-none"
			role="status"
			aria-live="polite"
			aria-label="Loading"
		>
			<div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl shadow-slate-900/5 flex flex-col items-center gap-3 max-w-[180px] w-full text-center">
				<div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200/70 text-indigo-600 flex items-center justify-center shadow-2xs">
					<Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" />
				</div>
				<p className="text-xs font-bold text-slate-500 tracking-wider uppercase">
					Loading...
				</p>
			</div>
		</div>
	);
}
