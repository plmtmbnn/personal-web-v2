"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarPlus, MapPin, Shield } from "lucide-react";
import type { LfcFixture } from "../types";
import { createGoogleCalendarUrl, getCountdown } from "../utils";

function Team({
	name,
	badge,
	isLiverpool,
}: {
	name: string;
	badge?: string;
	isLiverpool: boolean;
}) {
	const [imageFailed, setImageFailed] = useState(false);

	return (
		<div className="flex min-w-0 flex-col items-center gap-3 text-center">
			<div
				className={
					isLiverpool
						? "flex size-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-2 sm:size-24 sm:p-3"
						: "flex size-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:size-24 sm:p-3"
				}
			>
				{badge && !imageFailed ? (
					<Image
						src={badge}
						alt=""
						width={96}
						height={96}
						className="max-h-full max-w-full object-contain"
						loading="eager"
						fetchPriority={isLiverpool ? "high" : "auto"}
						unoptimized
						onError={() => setImageFailed(true)}
					/>
				) : (
					<Shield aria-hidden="true" className="size-10 text-slate-400" />
				)}
			</div>
			<p className="min-w-0 max-w-full break-words text-base font-bold leading-tight text-slate-900 sm:text-xl">
				{name}
			</p>
		</div>
	);
}

function CountdownTile({ value, label }: { value: string; label: string }) {
	return (
		<div className="flex flex-col items-center justify-center gap-0.5">
			<span
				suppressHydrationWarning
				className="text-xl font-bold tabular-nums text-slate-900 sm:text-2xl"
			>
				{value}
			</span>
			<span className="text-xs text-slate-600">{label}</span>
		</div>
	);
}

export default function NextMatchHero({ fixture }: { fixture: LfcFixture }) {
	const hasKickoff = Number.isFinite(Date.parse(fixture.date));
	const [countdown, setCountdown] = useState(() => getCountdown(fixture.date));
	const [localKickoff, setLocalKickoff] = useState<string | null>(null);

	useEffect(() => {
		if (!hasKickoff) return;
		setLocalKickoff(
			new Intl.DateTimeFormat("en-GB", {
				day: "numeric",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				timeZoneName: "short",
			}).format(new Date(fixture.date)),
		);
		const interval = window.setInterval(() => {
			const next = getCountdown(fixture.date);
			setCountdown(next);
			if (next.isPassed) window.clearInterval(interval);
		}, 1000);
		return () => window.clearInterval(interval);
	}, [fixture.date, hasKickoff]);

	const utcKickoff = hasKickoff
		? new Intl.DateTimeFormat("en-GB", {
				day: "numeric",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				timeZone: "UTC",
				timeZoneName: "short",
			}).format(new Date(fixture.date))
		: null;

	return (
		<article
			aria-label={`${fixture.homeTeam} versus ${fixture.awayTeam}`}
			className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg"
		>
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3 sm:px-8 sm:py-4">
				<div className="min-w-0">
					<p className="text-sm font-semibold text-slate-900">
						{fixture.competition}
					</p>
					{fixture.round && (
						<p className="text-xs text-slate-600">{fixture.round}</p>
					)}
				</div>
				<span className="text-sm text-slate-600">
					{fixture.isHome ? "Home" : "Away"}
				</span>
			</div>

			<div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-4 py-4 sm:gap-6 sm:px-8 sm:py-6">
				<Team
					name={fixture.homeTeam}
					badge={fixture.homeTeamBadge}
					isLiverpool={fixture.isHome}
				/>
				<span className="text-sm font-semibold text-slate-500">vs</span>
				<Team
					name={fixture.awayTeam}
					badge={fixture.awayTeamBadge}
					isLiverpool={!fixture.isHome}
				/>
			</div>

			<div className="border-t border-slate-200 px-5 py-2 text-center sm:px-8 sm:py-4">
				<p className="text-sm text-slate-600">Kickoff in your local time</p>
				{hasKickoff ? (
					<time
						dateTime={fixture.date}
						className="mt-1 block min-h-8 text-xl font-bold leading-snug text-slate-900 sm:text-2xl"
					>
						{localKickoff ?? utcKickoff}
					</time>
				) : (
					<p className="mt-1 text-xl font-bold text-slate-900">
						Kickoff to be confirmed
					</p>
				)}
				<p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-slate-600">
					<MapPin aria-hidden="true" className="size-4 shrink-0" />
					<span className="min-w-0 break-words">{fixture.stadium}</span>
				</p>
			</div>

			{hasKickoff && (
				<div className="border-t border-slate-200 bg-slate-50/80 px-5 py-3 text-center sm:px-8">
					{countdown.isPassed ? (
						<p className="text-sm font-medium text-slate-700">
							Kickoff passed. Use Refresh to check the next fixture.
						</p>
					) : (
						<>
							<p className="mb-2 text-xs font-medium text-slate-600">
								Time until kickoff
							</p>
							<div className="grid grid-cols-4 divide-x divide-slate-200">
								<CountdownTile value={String(countdown.days)} label="Days" />
								<CountdownTile
									value={String(countdown.hours).padStart(2, "0")}
									label="Hours"
								/>
								<CountdownTile
									value={String(countdown.minutes).padStart(2, "0")}
									label="Minutes"
								/>
								<CountdownTile
									value={String(countdown.seconds).padStart(2, "0")}
									label="Seconds"
								/>
							</div>
						</>
					)}
				</div>
			)}

			{hasKickoff && !countdown.isPassed && (
				<div className="flex justify-center border-t border-slate-200 px-5 py-2 sm:justify-end sm:px-8 sm:py-3">
					<a
						href={createGoogleCalendarUrl(fixture)}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold !text-white transition-colors hover:bg-red-800 active:bg-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 sm:w-auto"
					>
						<CalendarPlus aria-hidden="true" className="size-4" />
						Add to Google Calendar
					</a>
				</div>
			)}
		</article>
	);
}
