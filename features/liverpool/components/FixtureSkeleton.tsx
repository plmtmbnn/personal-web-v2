"use client";

export default function FixtureSkeleton() {
	return (
		<div className="animate-pulse w-full max-w-xl sm:max-w-2xl mx-auto">
			<div className="rounded-3xl sm:rounded-[2.5rem] border border-slate-200/80 bg-white shadow-xl overflow-hidden">
				{/* Zone A: Head strip skeleton */}
				<div className="flex items-center justify-between gap-2 px-4 sm:px-5 lg:px-6 pt-4 sm:pt-5 pb-3 sm:pb-3.5 border-b border-slate-100">
					<div className="flex items-center gap-1.5">
						<div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-slate-100" />
						<div className="h-4 w-40 sm:w-52 bg-slate-100 rounded-full" />
					</div>
					<div className="h-6 w-20 sm:w-24 bg-slate-100 rounded-full" />
				</div>

				{/* Zone B: Clash arena skeleton */}
				<div className="px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-3 sm:pb-3.5">
					{/* Crests arena */}
					<div className="flex items-center justify-between gap-3 sm:gap-5">
						{/* Home crest */}
						<div className="flex flex-col items-center gap-2 sm:gap-2.5 flex-1">
							<div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-slate-100" />
							<div className="flex flex-col items-center gap-1">
								<div className="h-3.5 w-20 sm:w-24 bg-slate-100 rounded-full" />
								<div className="h-4 w-10 bg-slate-100 rounded-full" />
							</div>
						</div>

						{/* VS badge */}
						<div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-100 shrink-0" />

						{/* Away crest */}
						<div className="flex flex-col items-center gap-2 sm:gap-2.5 flex-1">
							<div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-slate-100" />
							<div className="flex flex-col items-center gap-1">
								<div className="h-3.5 w-20 sm:w-24 bg-slate-100 rounded-full" />
								<div className="h-4 w-10 bg-slate-100 rounded-full" />
							</div>
						</div>
					</div>
				</div>

				{/* Zone C: Countdown + info tray skeleton */}
				<div className="mx-3 sm:mx-4 mb-3 sm:mb-4 bg-slate-50/90 border border-slate-200/60 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3">
					{/* Countdown tiles */}
					<div className="flex items-center justify-center gap-2 sm:gap-2.5">
						<div className="w-[52px] sm:w-[62px] h-12 sm:h-14 rounded-2xl bg-slate-100" />
						<div className="w-[52px] sm:w-[62px] h-12 sm:h-14 rounded-2xl bg-slate-100" />
						<div className="w-[52px] sm:w-[62px] h-12 sm:h-14 rounded-2xl bg-slate-100" />
						<div className="w-[52px] sm:w-[62px] h-12 sm:h-14 rounded-2xl bg-slate-100" />
					</div>

					{/* Metadata strip */}
					<div className="flex items-center justify-center gap-2">
						<div className="h-3 w-28 sm:w-32 bg-slate-100 rounded-full" />
						<div className="h-3 w-24 sm:w-28 bg-slate-100 rounded-full" />
						<div className="h-3 w-20 sm:w-24 bg-slate-100 rounded-full hidden sm:block" />
					</div>
				</div>

				{/* Footer skeleton */}
				<div className="flex items-center justify-between gap-3 px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5">
					<div className="h-3.5 w-32 bg-slate-100 rounded-full hidden sm:block" />
					<div className="h-9 w-full sm:w-44 bg-slate-100 rounded-full" />
				</div>
			</div>
		</div>
	);
}
