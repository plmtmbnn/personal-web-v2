import { MessageSquare } from "lucide-react";

export default function ContactLoading() {
	return (
		<main className="min-h-screen lg:h-screen lg:max-h-[100dvh] bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden overflow-y-auto lg:overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 pb-32 sm:py-24 sm:pb-36 lg:py-0 lg:pb-0">
			<div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center relative z-10 my-auto">
				{/* ── Left — Identity & Context Skeleton ────────────────────────── */}
				<div className="lg:col-span-5 w-full">
					{/* Status chip */}
					<div className="mb-6 sm:mb-8">
						<div className="h-7 w-32 bg-slate-200 rounded-full animate-pulse" />
					</div>

					{/* Headline */}
					<div className="mb-5 sm:mb-6 space-y-3">
						<div className="h-10 sm:h-14 lg:h-16 w-3/4 bg-slate-200 rounded animate-pulse" />
						<div className="h-10 sm:h-14 lg:h-16 w-full bg-slate-200 rounded animate-pulse" />
						<div className="h-10 sm:h-14 lg:h-16 w-5/6 bg-slate-200 rounded animate-pulse" />
					</div>

					{/* Sub-copy */}
					<div className="space-y-2 mb-8 sm:mb-10 max-w-sm">
						<div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
						<div className="h-4 w-4/5 bg-slate-200 rounded animate-pulse" />
					</div>

					{/* Location + time strip Skeleton */}
					<div className="flex flex-col gap-4 max-w-md">
						<div className="grid grid-cols-2 gap-3">
							<div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
								<div className="min-w-0 space-y-1.5 flex-1">
									<div className="h-2.5 w-12 bg-slate-200 rounded animate-pulse" />
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

						{/* Version pill */}
						<div className="h-3 w-40 bg-slate-200 rounded animate-pulse ml-1" />
					</div>
				</div>

				{/* ── Right — Action Panel Skeleton ──────────────────────────────── */}
				<div className="lg:col-span-7 w-full space-y-4 lg:pl-6 mt-12 lg:mt-0">
					{/* Inquiry topic selector */}
					<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm p-5 sm:p-6 mb-3">
						<div className="flex items-center justify-between mb-5">
							<span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
								<MessageSquare className="w-4 h-4" />
								Inquiry Topic
							</span>
							<div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
						</div>

						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className="p-3.5 rounded-2xl border border-slate-200/60 bg-slate-50/50 flex flex-col gap-3 h-[104px]"
								>
									<div className="w-8 h-8 rounded-xl bg-slate-200 animate-pulse" />
									<div className="space-y-1.5">
										<div className="h-2.5 w-full bg-slate-200 rounded animate-pulse" />
										<div className="h-2.5 w-2/3 bg-slate-200 rounded animate-pulse" />
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Contact channels */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between h-[74px]"
							>
								<div className="flex items-center gap-3.5 flex-1">
									<div className="w-9 h-9 rounded-xl bg-slate-200 animate-pulse shrink-0" />
									<div className="space-y-1.5 flex-1 max-w-[120px]">
										<div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
										<div className="h-3.5 w-full bg-slate-200 rounded animate-pulse" />
									</div>
								</div>
								<div className="flex items-center gap-2 pl-2">
									<div className="w-6 h-6 rounded-lg bg-slate-100 animate-pulse" />
									<div className="w-6 h-6 rounded-lg bg-slate-100 animate-pulse" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}
