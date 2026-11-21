"use client";

import {
	AUTHOR,
	AUTHOR_STATS,
	EXPERIENCE_YEAR,
	SOCIAL_LINKS,
} from "@/lib/shared/constants";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import HomeBackground from "./HomeBackground";

interface HomeProps {
	initialRunningKm: number | null;
}

export default function Home({ initialRunningKm }: HomeProps) {
	const year = new Date().getFullYear();

	return (
		<main
			id="main-content"
			className="relative isolate flex min-h-[100dvh] w-full flex-col justify-center overflow-x-clip px-5 pt-10 pb-36 -mb-28 text-slate-900 sm:px-8 sm:pt-14 sm:pb-40 sm:-mb-32 lg:h-[100dvh] lg:max-h-[100dvh] lg:overflow-hidden lg:py-0 lg:pb-20 lg:-mb-32"
		>
			<HomeBackground />

			<section
				aria-labelledby="home-heading"
				className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12"
			>
				<div className="min-w-0 flex flex-col lg:col-span-6">
					<div className="mb-6 flex items-center gap-3.5 sm:mb-7 sm:gap-4">
						<div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-slate-200/80 bg-white shadow-xs sm:h-16 sm:w-16">
							<Image
								src="/home/avatar-peoel.png"
								alt={AUTHOR.name}
								width={80}
								height={80}
								priority
								className="h-full w-full object-cover"
							/>
						</div>
						<div className="min-w-0">
							<p className="truncate text-base font-bold leading-tight text-slate-900">
								{AUTHOR.name}
							</p>
							<p className="mt-1 truncate text-sm text-slate-600">
								{AUTHOR.role}, Indonesia
							</p>
						</div>
					</div>

					<h1
						id="home-heading"
						className="max-w-[15ch] break-words text-4xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
					>
						Engineering systems by day. Miles everywhere.
					</h1>

					<p className="mt-5 max-w-[44ch] break-words text-base leading-relaxed text-slate-600 sm:mt-6 sm:text-lg">
						I build fintech core systems and lending platforms, and spend my
						mornings out running roads and trails.
					</p>

					<div className="mt-7 flex flex-wrap items-center gap-4 sm:mt-8 sm:gap-6">
						<Link
							href="/work-experience"
							className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold !text-white shadow-xs transition-colors hover:bg-slate-800 hover:!text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none"
						>
							View work experience
						</Link>
						<Link
							href="/contact"
							className="inline-flex min-h-[44px] items-center justify-center px-1 text-sm font-semibold !text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors hover:!text-slate-700 hover:decoration-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 motion-reduce:transition-none"
						>
							Contact Polma
						</Link>
					</div>
				</div>

				<div className="min-w-0 flex flex-col gap-4 lg:col-span-5 lg:col-start-8">
					<dl
						aria-label="Professional and running facts"
						className="grid grid-cols-1 divide-y divide-slate-200/70 rounded-3xl border border-slate-200/60 bg-white px-5 py-2 shadow-xs sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-0 sm:py-6"
					>
						<div className="flex items-center justify-between gap-4 py-3.5 sm:block sm:px-5 sm:py-0">
							<dd className="text-2xl font-bold tracking-tight tabular-nums text-slate-900 sm:text-3xl lg:text-4xl">
								{EXPERIENCE_YEAR}+
							</dd>
							<dt className="text-right text-xs leading-snug text-slate-500 sm:mt-2 sm:text-left sm:text-[13px]">
								Years building systems
							</dt>
						</div>

						<div className="py-3.5 sm:px-5 sm:py-0">
							<Link
								href="/adventures/running"
								className="group flex min-h-[44px] items-center justify-between gap-4 rounded-xl !text-slate-900 transition-colors hover:!text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:block sm:min-h-0"
							>
								<dd
									suppressHydrationWarning
									className="text-2xl font-bold tracking-tight tabular-nums text-slate-900 sm:text-3xl lg:text-4xl"
								>
									{initialRunningKm == null
										? "N/A"
										: initialRunningKm.toLocaleString("en-US")}
								</dd>
								<dt className="flex items-center justify-end gap-1 text-right text-xs leading-snug text-slate-500 group-hover:text-slate-800 sm:mt-2 sm:justify-start sm:text-left sm:text-[13px]">
									<span>Kilometres run in {year}</span>
									<ArrowUpRight
										aria-hidden="true"
										className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
									/>
								</dt>
							</Link>
						</div>

						<div className="flex items-center justify-between gap-4 py-3.5 sm:block sm:px-5 sm:py-0">
							<dd className="text-2xl font-bold tracking-tight tabular-nums text-slate-900 sm:text-3xl lg:text-4xl">
								{AUTHOR_STATS.fintechSystems}+
							</dd>
							<dt className="text-right text-xs leading-snug text-slate-500 sm:mt-2 sm:text-left sm:text-[13px]">
								Fintech systems
							</dt>
						</div>
					</dl>

					<div className="rounded-3xl border border-slate-200/60 bg-white p-4 shadow-xs sm:p-5">
						<nav
							aria-label="Professional profiles"
							className="grid grid-cols-2 gap-3"
						>
							<a
								href={SOCIAL_LINKS.github}
								target="_blank"
								rel="noopener noreferrer"
								className="group flex min-h-[48px] items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 text-sm font-semibold !text-slate-900 transition-colors hover:border-slate-300 hover:bg-slate-100/80 hover:!text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none"
							>
								<FaGithub aria-hidden="true" className="h-4 w-4 shrink-0" />
								<span className="truncate">GitHub</span>
								<ArrowUpRight
									aria-hidden="true"
									className="ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
								/>
							</a>
							<a
								href={SOCIAL_LINKS.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								className="group flex min-h-[48px] items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 text-sm font-semibold !text-slate-900 transition-colors hover:border-slate-300 hover:bg-slate-100/80 hover:!text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none"
							>
								<FaLinkedin aria-hidden="true" className="h-4 w-4 shrink-0" />
								<span className="truncate">LinkedIn</span>
								<ArrowUpRight
									aria-hidden="true"
									className="ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
								/>
							</a>
						</nav>
					</div>
				</div>
			</section>
		</main>
	);
}
