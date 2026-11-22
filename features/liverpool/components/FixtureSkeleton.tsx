"use client";

export default function FixtureSkeleton() {
	return (
		<div
			aria-hidden="true"
			className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg"
		>
			<div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 sm:px-8 sm:py-4">
				<div className="h-4 w-36 rounded bg-slate-200" />
				<div className="h-4 w-12 rounded bg-slate-200" />
			</div>
			<div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-4 py-4 sm:gap-6 sm:px-8 sm:py-6">
				<div className="flex flex-col items-center gap-3">
					<div className="size-16 rounded-2xl bg-slate-200 sm:size-24" />
					<div className="h-5 w-20 max-w-full rounded bg-slate-200 sm:w-28" />
				</div>
				<div className="h-4 w-5 rounded bg-slate-200" />
				<div className="flex flex-col items-center gap-3">
					<div className="size-16 rounded-2xl bg-slate-200 sm:size-24" />
					<div className="h-5 w-20 max-w-full rounded bg-slate-200 sm:w-28" />
				</div>
			</div>
			<div className="flex flex-col items-center gap-2 border-t border-slate-200 px-5 py-2 sm:py-4">
				<div className="h-4 w-36 rounded bg-slate-200" />
				<div className="h-7 w-64 max-w-full rounded bg-slate-200" />
				<div className="h-4 w-28 rounded bg-slate-200" />
			</div>
			<div className="border-t border-slate-200 bg-slate-50/80 px-5 py-3">
				<div className="mx-auto mb-2 h-3 w-28 rounded bg-slate-200" />
				<div className="grid grid-cols-4 divide-x divide-slate-200">
					{["days", "hours", "minutes", "seconds"].map((unit) => (
						<div key={unit} className="flex flex-col items-center gap-1">
							<div className="h-6 w-8 rounded bg-slate-200" />
							<div className="h-3 w-10 rounded bg-slate-200" />
						</div>
					))}
				</div>
			</div>
			<div className="flex justify-center border-t border-slate-200 px-5 py-2 sm:justify-end sm:px-8 sm:py-3">
				<div className="h-11 w-full rounded-xl bg-slate-200 sm:w-48" />
			</div>
		</div>
	);
}

export function LiverpoolSkeleton() {
	return (
		<main
			role="status"
			aria-label="Loading Liverpool FC matchday hub"
			className="h-[100dvh] overflow-y-auto bg-slate-50/80 px-4 pb-18 pt-3 sm:px-6 sm:pb-32 sm:pt-4"
		>
			<div className="mx-auto flex min-h-full w-full max-w-4xl flex-col animate-pulse motion-reduce:animate-none">
				<div
					aria-hidden="true"
					className="flex items-start justify-between gap-3"
				>
					<div>
						<div className="h-4 w-28 rounded bg-slate-200" />
						<div className="mt-2 h-7 w-36 rounded bg-slate-200 sm:mt-3 sm:h-8 sm:w-64" />
					</div>
					<div className="h-11 w-24 rounded-xl bg-slate-200" />
				</div>
				<div className="flex flex-1 flex-col justify-center py-3 sm:py-4">
					<FixtureSkeleton />
				</div>
			</div>
		</main>
	);
}
