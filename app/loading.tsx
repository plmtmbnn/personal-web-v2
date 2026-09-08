import { Loader2 } from "lucide-react";

/**
 * GlobalLoading (Root Page Suspense Fallback)
 *
 * Lightweight, high-performance loading state:
 * - Server Component with 0 client JS bundle overhead
 * - Pure GPU-accelerated CSS spinner (0 main-thread re-renders)
 * - Single, clean visual cue adhering to Modern Floating Card aesthetic
 */
export default function GlobalLoading() {
	return (
		<div className="fixed inset-0 bg-slate-50/80 backdrop-blur-xs bg-dot-pattern z-[9999] flex flex-col items-center justify-center pointer-events-none select-none">
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xl shadow-slate-200/40 flex flex-col items-center gap-3.5 max-w-[240px] w-full mx-4 text-center">
				<div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
					<Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" />
				</div>
				<div className="space-y-0.5">
					<p className="text-sm font-extrabold text-slate-800 tracking-tight">
						Loading
					</p>
					<p className="text-[11px] font-medium text-slate-400">
						Preparing view...
					</p>
				</div>
			</div>
		</div>
	);
}
