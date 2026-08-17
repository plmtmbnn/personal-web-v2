"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
	Calendar,
	Clock,
	MapPin,
	Tv,
	ExternalLink,
	Sparkles,
	Trophy,
	Shield,
} from "lucide-react";
import type { LfcFixtureResponse } from "../types";
import {
	getBestImageUrl,
	isLiverpoolHome,
	formatMatchDate,
	getCountdown,
	createGoogleCalendarUrl,
} from "../utils";

interface NextMatchHeroProps {
	fixture: LfcFixtureResponse;
}

export default function NextMatchHero({ fixture }: NextMatchHeroProps) {
	const { matchData } = fixture;
	const isHome = isLiverpoolHome(matchData.homeTeam);
	const dateInfo = useMemo(
		() => formatMatchDate(matchData.date),
		[matchData.date],
	);

	const [countdown, setCountdown] = useState(() =>
		getCountdown(matchData.date),
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setCountdown(getCountdown(matchData.date));
		}, 1000);
		return () => clearInterval(interval);
	}, [matchData.date]);

	const homeLogoUrl = getBestImageUrl(matchData.homeTeamLogo?.sizes);
	const awayLogoUrl = getBestImageUrl(matchData.awayTeamLogo?.sizes);
	const compLogoUrl = getBestImageUrl(matchData.competition?.logo?.sizes);

	const gCalUrl = useMemo(() => createGoogleCalendarUrl(fixture), [fixture]);

	return (
		<div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs hover:shadow-md transition-all">
			{/* Top Header Row */}
			<div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
				<div className="flex items-center gap-3">
					<span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600 text-white shadow-xs">
						<Sparkles className="w-3.5 h-3.5" /> Next Matchday
					</span>
					<span
						className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
							isHome
								? "bg-red-50 text-red-700 border border-red-100"
								: "bg-slate-100 text-slate-700 border border-slate-200"
						}`}
					>
						{isHome ? "Anfield (Home)" : "Away Fixture"}
					</span>
				</div>

				{/* Competition Tag */}
				<div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 shadow-xs">
					{compLogoUrl ? (
						<div className="relative w-4 h-4 shrink-0">
							<Image
								src={compLogoUrl}
								alt={matchData.competition?.displayName || "Competition"}
								fill
								className="object-contain"
								unoptimized
							/>
						</div>
					) : (
						<Trophy className="w-4 h-4 text-amber-500" />
					)}
					<span className="text-xs font-bold text-slate-900">
						{matchData.competition?.displayName}
					</span>
				</div>
			</div>

			{/* Match Teams & Versus Stage */}
			<div className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
				{/* Teams Clash (Left/Center Column) */}
				<div className="lg:col-span-7 flex flex-col sm:flex-row items-center justify-around gap-6">
					{/* Home Team */}
					<div className="flex flex-col items-center text-center space-y-3 flex-1">
						<div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 p-3 border border-slate-200/80 flex items-center justify-center shadow-xs hover:scale-105 transition-transform">
							{homeLogoUrl ? (
								<Image
									src={homeLogoUrl}
									alt={matchData.homeTeam}
									width={96}
									height={96}
									className="object-contain max-h-full max-w-full"
									unoptimized
								/>
							) : (
								<Shield className="w-12 h-12 text-slate-400" />
							)}
						</div>
						<div>
							<h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
								{matchData.homeTeam}
							</h3>
							<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
								Home
							</span>
						</div>
					</div>

					{/* VS Divider */}
					<div className="flex flex-col items-center justify-center px-2">
						<div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-xs font-black text-red-600 shadow-xs">
							VS
						</div>
					</div>

					{/* Away Team */}
					<div className="flex flex-col items-center text-center space-y-3 flex-1">
						<div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 p-3 border border-slate-200/80 flex items-center justify-center shadow-xs hover:scale-105 transition-transform">
							{awayLogoUrl ? (
								<Image
									src={awayLogoUrl}
									alt={matchData.awayTeam}
									width={96}
									height={96}
									className="object-contain max-h-full max-w-full"
									unoptimized
								/>
							) : (
								<Shield className="w-12 h-12 text-slate-400" />
							)}
						</div>
						<div>
							<h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
								{matchData.awayTeam}
							</h3>
							<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
								Away
							</span>
						</div>
					</div>
				</div>

				{/* Countdown & Match Info (Right Column) */}
				<div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
					{/* Live Countdown Clock */}
					{!countdown.isPassed ? (
						<div className="flex items-center gap-2 sm:gap-3 text-center">
							<div className="bg-white border border-slate-200/80 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 min-w-[58px] sm:min-w-[68px] shadow-xs">
								<span className="text-xl sm:text-2xl font-bold text-slate-900 block">
									{countdown.days}
								</span>
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
									Days
								</span>
							</div>
							<span className="text-xl font-bold text-red-600">:</span>
							<div className="bg-white border border-slate-200/80 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 min-w-[58px] sm:min-w-[68px] shadow-xs">
								<span className="text-xl sm:text-2xl font-bold text-slate-900 block">
									{String(countdown.hours).padStart(2, "0")}
								</span>
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
									Hours
								</span>
							</div>
							<span className="text-xl font-bold text-red-600">:</span>
							<div className="bg-white border border-slate-200/80 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 min-w-[58px] sm:min-w-[68px] shadow-xs">
								<span className="text-xl sm:text-2xl font-bold text-slate-900 block">
									{String(countdown.minutes).padStart(2, "0")}
								</span>
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
									Mins
								</span>
							</div>
							<span className="text-xl font-bold text-red-600">:</span>
							<div className="bg-white border border-red-200 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 min-w-[58px] sm:min-w-[68px] shadow-xs">
								<span className="text-xl sm:text-2xl font-bold text-red-600 block">
									{String(countdown.seconds).padStart(2, "0")}
								</span>
								<span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
									Secs
								</span>
							</div>
						</div>
					) : (
						<div className="px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-700 text-sm font-bold">
							Matchday In Progress / Live
						</div>
					)}

					{/* Timing Details */}
					<div className="space-y-1.5 text-center lg:text-right w-full">
						<div className="flex items-center justify-center lg:justify-end gap-2 text-sm font-bold text-slate-900">
							<Calendar className="w-4 h-4 text-red-600 shrink-0" />
							<span>{dateInfo.formattedDate}</span>
							<span className="text-slate-400">•</span>
							<Clock className="w-4 h-4 text-amber-500 shrink-0" />
							<span>{dateInfo.formattedTime}</span>
						</div>
						<div className="flex items-center justify-center lg:justify-end gap-1.5 text-xs font-semibold text-slate-500">
							<MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
							<span>{matchData.stadium}</span>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 pt-2 w-full">
						<a
							href={gCalUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs transition-all active:scale-[0.98]"
						>
							<Calendar className="w-3.5 h-3.5 text-red-600" />
							<span>Add to Calendar</span>
						</a>

						{fixture.link?.href && (
							<a
								href={fixture.link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition-all active:scale-[0.98]"
							>
								<span>{fixture.link.label || "Match Hub"}</span>
								<ExternalLink className="w-3.5 h-3.5" />
							</a>
						)}
					</div>
				</div>
			</div>

			{/* Bottom Bar: Broadcasters */}
			{fixture.broadcasters && fixture.broadcasters.length > 0 && (
				<div className="pt-4 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-xs font-bold text-slate-500">
						<Tv className="w-4 h-4 text-slate-400" />
						<span>Official Broadcasters:</span>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						{fixture.broadcasters.map((b) => (
							<span
								key={b.id || b.name}
								className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs"
							>
								{b.logo && (
									<Image
										src={b.logo}
										alt={b.name}
										width={16}
										height={16}
										className="object-contain rounded-sm w-4 h-4"
										style={{ width: "auto", height: "auto" }}
										unoptimized
									/>
								)}
								<span>{b.name}</span>
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
