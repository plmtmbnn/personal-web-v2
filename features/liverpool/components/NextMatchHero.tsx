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
		<div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/40 p-6 md:p-8 text-white shadow-2xl backdrop-blur-xl">
			{/* Ambient Red Glow Accents */}
			<div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
			<div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

			{/* Top Header Row */}
			<div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
				<div className="flex items-center gap-3">
					<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-red-600 text-white shadow-lg shadow-red-600/30">
						<Sparkles className="w-3.5 h-3.5" /> Next Matchday
					</span>
					<span
						className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
							isHome
								? "bg-red-500/20 text-red-300 border border-red-500/30"
								: "bg-slate-700/50 text-slate-300 border border-slate-600/40"
						}`}
					>
						{isHome ? "Anfield (Home)" : "Away Fixture"}
					</span>
				</div>

				{/* Competition Tag */}
				<div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
					{compLogoUrl ? (
						<div className="relative w-5 h-5 shrink-0">
							<Image
								src={compLogoUrl}
								alt={matchData.competition?.displayName || "Competition"}
								fill
								className="object-contain"
								unoptimized
							/>
						</div>
					) : (
						<Trophy className="w-4 h-4 text-amber-400" />
					)}
					<span className="text-xs font-bold text-slate-200">
						{matchData.competition?.displayName}
					</span>
				</div>
			</div>

			{/* Match Teams & Versus Stage */}
			<div className="relative z-10 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
				{/* Teams Clash (Left/Center Column) */}
				<div className="lg:col-span-7 flex flex-col sm:flex-row items-center justify-around gap-6">
					{/* Home Team */}
					<div className="flex flex-col items-center text-center space-y-3 flex-1">
						<div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/5 p-3 border border-white/10 flex items-center justify-center shadow-inner hover:scale-105 transition-transform">
							{homeLogoUrl ? (
								<Image
									src={homeLogoUrl}
									alt={matchData.homeTeam}
									width={96}
									height={96}
									className="object-contain max-h-full max-w-full drop-shadow-md"
									unoptimized
								/>
							) : (
								<Shield className="w-12 h-12 text-slate-400" />
							)}
						</div>
						<div>
							<h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
								{matchData.homeTeam}
							</h3>
							<span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
								Home
							</span>
						</div>
					</div>

					{/* VS Divider */}
					<div className="flex flex-col items-center justify-center px-2">
						<div className="w-10 h-10 rounded-full bg-red-600/30 border border-red-500/40 flex items-center justify-center text-xs font-black text-red-200 shadow-md">
							VS
						</div>
					</div>

					{/* Away Team */}
					<div className="flex flex-col items-center text-center space-y-3 flex-1">
						<div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/5 p-3 border border-white/10 flex items-center justify-center shadow-inner hover:scale-105 transition-transform">
							{awayLogoUrl ? (
								<Image
									src={awayLogoUrl}
									alt={matchData.awayTeam}
									width={96}
									height={96}
									className="object-contain max-h-full max-w-full drop-shadow-md"
									unoptimized
								/>
							) : (
								<Shield className="w-12 h-12 text-slate-400" />
							)}
						</div>
						<div>
							<h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
								{matchData.awayTeam}
							</h3>
							<span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
								Away
							</span>
						</div>
					</div>
				</div>

				{/* Countdown & Match Info (Right Column) */}
				<div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center space-y-5 bg-white/5 lg:bg-transparent p-5 lg:p-0 rounded-2xl border border-white/5 lg:border-none">
					{/* Live Countdown Clock */}
					{!countdown.isPassed ? (
						<div className="flex items-center gap-2 sm:gap-3 text-center">
							<div className="bg-slate-900/90 border border-white/10 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 min-w-[58px] sm:min-w-[68px] shadow-lg">
								<span className="text-xl sm:text-2xl font-black text-white block">
									{countdown.days}
								</span>
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
									Days
								</span>
							</div>
							<span className="text-xl font-bold text-red-500">:</span>
							<div className="bg-slate-900/90 border border-white/10 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 min-w-[58px] sm:min-w-[68px] shadow-lg">
								<span className="text-xl sm:text-2xl font-black text-white block">
									{String(countdown.hours).padStart(2, "0")}
								</span>
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
									Hours
								</span>
							</div>
							<span className="text-xl font-bold text-red-500">:</span>
							<div className="bg-slate-900/90 border border-white/10 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 min-w-[58px] sm:min-w-[68px] shadow-lg">
								<span className="text-xl sm:text-2xl font-black text-white block">
									{String(countdown.minutes).padStart(2, "0")}
								</span>
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
									Mins
								</span>
							</div>
							<span className="text-xl font-bold text-red-500">:</span>
							<div className="bg-slate-900/90 border border-white/10 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 min-w-[58px] sm:min-w-[68px] shadow-lg">
								<span className="text-xl sm:text-2xl font-black text-red-400 block">
									{String(countdown.seconds).padStart(2, "0")}
								</span>
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
									Secs
								</span>
							</div>
						</div>
					) : (
						<div className="px-4 py-2 rounded-xl bg-red-600/30 border border-red-500/40 text-red-200 text-sm font-black">
							Matchday In Progress / Live
						</div>
					)}

					{/* Timing Details */}
					<div className="space-y-2 text-center lg:text-right w-full">
						<div className="flex items-center justify-center lg:justify-end gap-2 text-sm font-semibold text-slate-200">
							<Calendar className="w-4 h-4 text-red-400 shrink-0" />
							<span>{dateInfo.formattedDate}</span>
							<span className="text-slate-500">•</span>
							<Clock className="w-4 h-4 text-amber-400 shrink-0" />
							<span>{dateInfo.formattedTime} (Local)</span>
						</div>
						<div className="flex items-center justify-center lg:justify-end gap-2 text-xs text-slate-400">
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
							className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all shadow-md hover:scale-102"
						>
							<Calendar className="w-3.5 h-3.5 text-amber-400" />
							<span>Add to Calendar</span>
						</a>

						{fixture.link?.href && (
							<a
								href={fixture.link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-all shadow-lg shadow-red-600/30 hover:scale-102"
							>
								<span>{fixture.link.label || "Match Hub"}</span>
								<ExternalLink className="w-3.5 h-3.5" />
							</a>
						)}
					</div>
				</div>
			</div>

			{/* Bottom Bar: Broadcasters & Status */}
			{fixture.broadcasters && fixture.broadcasters.length > 0 && (
				<div className="relative z-10 pt-4 mt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-xs font-medium text-slate-400">
						<Tv className="w-4 h-4 text-slate-400" />
						<span>Broadcasters:</span>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						{fixture.broadcasters.map((b) => (
							<span
								key={b.id || b.name}
								className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300"
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
