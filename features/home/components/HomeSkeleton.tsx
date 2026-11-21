import HomeBackground from "./HomeBackground";

export default function HomeSkeleton() {
	return (
		<main
			aria-busy="true"
			aria-label="Loading homepage"
			className="relative isolate flex min-h-[100dvh] w-full flex-col justify-center overflow-x-clip px-5 pt-10 pb-36 -mb-28 sm:px-8 sm:pt-14 sm:pb-40 sm:-mb-32 lg:h-[100dvh] lg:max-h-[100dvh] lg:overflow-hidden lg:py-0 lg:pb-20 lg:-mb-32"
		>
			<HomeBackground />

			<section className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
				<div className="min-w-0 flex flex-col lg:col-span-6">
					<div className="mb-6 flex items-center gap-4 sm:mb-7">
						<div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-slate-200/80 sm:h-16 sm:w-16" />
						<div className="space-y-2">
							<div className="h-4 w-32 animate-pulse rounded-md bg-slate-200/80" />
							<div className="h-3.5 w-44 animate-pulse rounded-md bg-slate-200/70" />
						</div>
					</div>

					<div className="space-y-3">
						<div className="h-10 w-full max-w-md animate-pulse rounded-xl bg-slate-200/80 sm:h-12" />
						<div className="h-10 w-4/5 max-w-sm animate-pulse rounded-xl bg-slate-200/80 sm:h-12" />
					</div>

					<div className="mt-5 space-y-2 sm:mt-6">
						<div className="h-4 w-full max-w-md animate-pulse rounded-md bg-slate-200/70" />
						<div className="h-4 w-3/4 max-w-sm animate-pulse rounded-md bg-slate-200/70" />
					</div>

					<div className="mt-7 flex items-center gap-4 sm:mt-8">
						<div className="h-12 w-44 animate-pulse rounded-xl bg-slate-200/80" />
						<div className="h-6 w-28 animate-pulse rounded-md bg-slate-200/70" />
					</div>
				</div>

				<div className="min-w-0 flex flex-col gap-4 lg:col-span-5 lg:col-start-8">
					<div className="h-44 w-full animate-pulse rounded-3xl border border-slate-200/60 bg-white/80 sm:h-32" />
					<div className="h-20 w-full animate-pulse rounded-3xl border border-slate-200/60 bg-white/80" />
				</div>
			</section>
		</main>
	);
}
