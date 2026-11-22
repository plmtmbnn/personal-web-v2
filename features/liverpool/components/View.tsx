"use client";

import { useCallback, useMemo, useState } from "react";
import {
	AlertCircle,
	CalendarDays,
	ChevronRight,
	RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { getLiverpoolFixtures } from "../actions";
import type { GetFixturesResult } from "../actions";
import { selectNextFixture } from "../utils";
import NextMatchHero from "./NextMatchHero";

export { LiverpoolSkeleton } from "./FixtureSkeleton";

export default function LiverpoolView({
	initialData,
}: {
	initialData: GetFixturesResult;
}) {
	const [fixtures, setFixtures] = useState(initialData.upcoming);
	const [lastUpdated, setLastUpdated] = useState(initialData.lastUpdated);
	const [error, setError] = useState<string | null>(initialData.error ?? null);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const nextMatch = useMemo(() => selectNextFixture(fixtures), [fixtures]);

	const refresh = useCallback(async () => {
		setIsRefreshing(true);
		setError(null);
		try {
			const result = await getLiverpoolFixtures(true);
			if (result.error) {
				setError(result.error);
				return;
			}
			setFixtures(result.upcoming);
			setLastUpdated(result.lastUpdated);
		} catch (cause) {
			console.error("Failed to refresh Liverpool fixtures:", cause);
			setError("The fixture service could not be reached.");
		} finally {
			setIsRefreshing(false);
		}
	}, []);

	const updatedAt = Number.isFinite(Date.parse(lastUpdated))
		? new Intl.DateTimeFormat("en-GB", {
				day: "numeric",
				month: "short",
				hour: "2-digit",
				minute: "2-digit",
				timeZone: "UTC",
				timeZoneName: "short",
			}).format(new Date(lastUpdated))
		: null;

	return (
		<main className="h-[100dvh] overflow-y-auto bg-slate-50/80 px-4 pb-18 pt-3 sm:px-6 sm:pb-32 sm:pt-4">
			<div className="mx-auto flex min-h-full w-full max-w-4xl flex-col">
				<header className="flex items-start justify-between gap-3 sm:gap-6">
					<div className="min-w-0">
						<nav
							aria-label="Breadcrumb"
							className="flex items-center gap-1.5 text-xs font-medium text-slate-600"
						>
							<Link
								href="/"
								className="rounded-sm hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
							>
								Home
							</Link>
							<ChevronRight
								aria-hidden="true"
								className="size-3.5 text-slate-400"
							/>
							<Link
								href="/insights"
								className="hidden rounded-sm hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:inline"
							>
								Insights
							</Link>
							<ChevronRight
								aria-hidden="true"
								className="hidden size-3.5 text-slate-400 sm:block"
							/>
							<span aria-current="page" className="text-slate-900">
								Liverpool FC
							</span>
						</nav>
						<h1 className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:mt-3 sm:text-3xl">
							<span className="sm:hidden">Next match</span>
							<span className="hidden sm:inline">Liverpool matchday</span>
						</h1>
					</div>
					<div className="flex shrink-0 flex-col items-end gap-1.5">
						<button
							type="button"
							onClick={refresh}
							disabled={isRefreshing}
							className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 shadow-xs transition-colors hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
						>
							<RefreshCw aria-hidden="true" className="size-4" />
							<span>{isRefreshing ? "Refreshing" : "Refresh"}</span>
						</button>
						{updatedAt && fixtures.length > 0 && (
							<time
								dateTime={lastUpdated}
								className="hidden text-xs text-slate-600 sm:block"
							>
								Updated {updatedAt}
							</time>
						)}
					</div>
				</header>

				<div className="flex flex-1 flex-col justify-center py-3 sm:py-4">
					{error && nextMatch && (
						<p
							role="alert"
							className="mx-auto mb-3 w-full max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
						>
							Refresh failed: {error} Showing the last available fixture.
						</p>
					)}
					{nextMatch ? (
						<NextMatchHero key={nextMatch.id} fixture={nextMatch} />
					) : (
						<section className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white px-6 py-10 text-center shadow-xs">
							{error ? (
								<AlertCircle
									aria-hidden="true"
									className="mx-auto size-9 text-amber-600"
								/>
							) : (
								<CalendarDays
									aria-hidden="true"
									className="mx-auto size-9 text-slate-500"
								/>
							)}
							<h2 className="mt-4 text-lg font-bold text-slate-900">
								{error
									? "Fixtures could not be loaded"
									: "No upcoming fixture available"}
							</h2>
							<p className="mt-2 text-sm leading-relaxed text-slate-600">
								{error
									? "The fixture service did not respond. Try refreshing to check again."
									: "The fixture feed has no scheduled match. Refresh to check for updates."}
							</p>
						</section>
					)}
				</div>
			</div>
		</main>
	);
}
