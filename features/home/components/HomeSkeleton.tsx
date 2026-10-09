import { Layers, ArrowRight, Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function HomeSkeleton() {
	return (
		<main className="min-h-screen lg:h-screen lg:max-h-[100dvh] bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden overflow-y-auto lg:overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 pb-32 sm:py-24 sm:pb-36 lg:py-0 lg:pb-0">
			<div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center relative z-10 my-auto">
				{/* ── Left Content (Span 6) ─────────────────────────────────── */}
				<div className="lg:col-span-6 w-full">
					{/* Avatar & Status chip */}
					<div className="flex items-center gap-4 sm:gap-5 mb-7 sm:mb-8">
						<div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] overflow-hidden border border-slate-200/80 shadow-sm shrink-0 bg-slate-200 animate-pulse" />
						<div className="flex flex-col gap-2">
							<div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
							<div className="h-6 w-32 bg-slate-200 rounded-full animate-pulse" />
						</div>
					</div>

					{/* Headline */}
					<div className="mb-5 sm:mb-6 space-y-3">
						<div className="h-10 sm:h-12 w-3/4 bg-slate-200 rounded animate-pulse" />
						<div className="h-10 sm:h-12 w-full bg-slate-200 rounded animate-pulse" />
						<div className="h-10 sm:h-12 w-5/6 bg-slate-200 rounded animate-pulse" />
					</div>

					{/* Sub-copy */}
					<div className="space-y-2 mb-8 sm:mb-10 max-w-sm">
						<div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
						<div className="h-4 w-4/5 bg-slate-200 rounded animate-pulse" />
					</div>

					{/* Location + time strip Skeleton */}
					<div className="grid grid-cols-2 gap-3 max-w-md">
						<div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
							<div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
							<div className="min-w-0 space-y-1.5 flex-1">
								<div className="h-2.5 w-8 bg-slate-200 rounded animate-pulse" />
								<div className="h-3.5 w-16 bg-slate-200 rounded animate-pulse" />
							</div>
						</div>
						<div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
							<div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
							<div className="min-w-0 space-y-1.5 flex-1">
								<div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
								<div className="h-3.5 w-20 bg-slate-200 rounded animate-pulse" />
							</div>
						</div>
					</div>
				</div>

				{/* ── Right Content (Span 6) ─────────────────────────────────── */}
				<div className="lg:col-span-6 w-full space-y-4 lg:pl-6 mt-12 lg:mt-0">
					{/* Metrics Panel */}
					<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm p-5 sm:p-6">
						<div className="flex items-center justify-between mb-5">
							<span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
								<Layers className="w-4 h-4" />
								Professional Impact
							</span>
						</div>

						<div className="grid grid-cols-3 gap-2 sm:gap-3">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="px-2 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col items-center justify-center text-center gap-2"
								>
									<div className="w-4 h-4 bg-slate-200 rounded animate-pulse mb-1" />
									<div className="w-10 h-6 bg-slate-200 rounded animate-pulse" />
									<div className="w-12 h-2.5 bg-slate-200 rounded animate-pulse" />
								</div>
							))}
						</div>
					</div>

					{/* Direct Channels */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						{/* Channel 1 (Dark) */}
						<div className="group relative overflow-hidden rounded-2xl border p-4 flex items-center bg-slate-900 border-slate-800">
							<div className="flex items-center justify-between w-full relative z-10">
								<div className="flex items-center gap-3.5 min-w-0">
									<div className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 shrink-0">
										<ArrowRight className="w-4 h-4 text-slate-600" />
									</div>
									<div className="min-w-0 space-y-1.5 flex-1">
										<div className="w-16 h-2.5 bg-slate-700 rounded animate-pulse" />
										<div className="w-24 h-3.5 bg-slate-700 rounded animate-pulse" />
									</div>
								</div>
							</div>
						</div>
						{/* Channel 2 */}
						<div className="group relative overflow-hidden rounded-2xl border p-4 flex items-center bg-white border-slate-200/80">
							<div className="flex items-center justify-between w-full relative z-10">
								<div className="flex items-center gap-3.5 min-w-0">
									<div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 shrink-0">
										<Mail className="w-4 h-4 text-slate-300" />
									</div>
									<div className="min-w-0 space-y-1.5 flex-1">
										<div className="w-12 h-2.5 bg-slate-200 rounded animate-pulse" />
										<div className="w-20 h-3.5 bg-slate-200 rounded animate-pulse" />
									</div>
								</div>
							</div>
						</div>
						{/* Channel 3 */}
						<div className="group relative overflow-hidden rounded-2xl border p-4 flex items-center bg-white border-slate-200/80">
							<div className="flex items-center justify-between w-full relative z-10">
								<div className="flex items-center gap-3.5 min-w-0">
									<div className="p-2.5 rounded-xl border border-slate-200 bg-slate-100 shrink-0">
										<FaGithub className="w-4 h-4 text-slate-300" />
									</div>
									<div className="min-w-0 space-y-1.5 flex-1">
										<div className="w-10 h-2.5 bg-slate-200 rounded animate-pulse" />
										<div className="w-16 h-3.5 bg-slate-200 rounded animate-pulse" />
									</div>
								</div>
							</div>
						</div>
						{/* Channel 4 */}
						<div className="group relative overflow-hidden rounded-2xl border p-4 flex items-center bg-white border-slate-200/80">
							<div className="flex items-center justify-between w-full relative z-10">
								<div className="flex items-center gap-3.5 min-w-0">
									<div className="p-2.5 rounded-xl border border-blue-100 bg-blue-50 shrink-0">
										<FaLinkedin className="w-4 h-4 text-slate-300" />
									</div>
									<div className="min-w-0 space-y-1.5 flex-1">
										<div className="w-14 h-2.5 bg-slate-200 rounded animate-pulse" />
										<div className="w-24 h-3.5 bg-slate-200 rounded animate-pulse" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
