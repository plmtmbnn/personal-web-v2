"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
	Calendar,
	Clock,
	MapPin,
	Sparkles,
	Trophy,
	Shield,
} from "lucide-react";
import type { LfcFixture } from "../types";
import {
	formatMatchDate,
	getCountdown,
	createGoogleCalendarUrl,
} from "../utils";

interface NextMatchHeroProps {
	fixture: LfcFixture;
}

export default function NextMatchHero({ fixture }: NextMatchHeroProps) {
	const isHome = fixture.isHome;
	const dateInfo = useMemo(() => formatMatchDate(fixture.date), [fixture.date]);

	const [countdown, setCountdown] = useState(() => getCountdown(fixture.date));

	useEffect(() => {
		const interval = setInterval(() => {
			setCountdown(getCountdown(fixture.date));
		}, 1000);
		return () => clearInterval(interval);
	}, [fixture.date]);

	const gCalUrl = useMemo(() => createGoogleCalendarUrl(fixture), [fixture]);

	return (
		<div className="relative overflow-hidden rounded-3xl sm:rounded-[2.25rem] border border-slate-200/80 bg-white shadow-xs p-4 sm:p-6 lg:p-7 w-full max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto flex flex-col gap-3.5 sm:gap-5 lg:gap-6">
			{/* Top Header Pill Row */}
			<div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
				<div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
					<span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-xs shrink-0">
						<Sparkles className="w-3 h-3" /> Next Matchday
					</span>
					<span
						className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0 ${
							isHome
								? "bg-red-50 text-red-700 border border-red-100"
								: "bg-slate-100 text-slate-700 border border-slate-200/80"
						}`}
					>
						{isHome ? "Anfield (Home)" : "Away Fixture"}
					</span>
				</div>

				{/* Competition Tag */}
				<div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 shadow-2xs shrink-0">
					{fixture.competitionBadge ? (
						<div className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0">
							<Image
								src={fixture.competitionBadge}
								alt={fixture.competition || "Competition"}
								fill
								className="object-contain"
								unoptimized
							/>
						</div>
					) : (
						<Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
					)}
					<span className="text-[10px] sm:text-xs font-bold text-slate-800 truncate max-w-[120px] sm:max-w-[200px]">
						{fixture.competition}
						{fixture.round ? ` • ${fixture.round}` : ""}
					</span>
				</div>
			</div>

			{/* Fixture Headline */}
			<div className="text-center pt-0.5">
				<h2 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
					{fixture.homeTeam}{" "}
					<span className="text-red-600 font-bold px-1 text-sm sm:text-lg">
						vs
					</span>{" "}
					{fixture.awayTeam}
				</h2>
			</div>

			{/* Match Teams & Versus Stage */}
			<div className="py-1 sm:py-2 flex items-center justify-between gap-3 sm:gap-6">
				{/* Home Team */}
				<div className="flex flex-col items-center text-center space-y-2 flex-1 min-w-0">
					<div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl bg-slate-50/80 p-3 sm:p-4 border border-slate-200/80 flex items-center justify-center shadow-xs transition-transform hover:scale-105">
						{fixture.homeTeamBadge ? (
							<Image
								src={fixture.homeTeamBadge}
								alt={fixture.homeTeam}
								width={100}
								height={100}
								className="object-contain max-h-full max-w-full drop-shadow-xs"
								unoptimized
							/>
						) : (
							<Shield className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
						)}
					</div>
					<div className="w-full px-1">
						<h3 className="text-xs sm:text-base font-black text-slate-900 tracking-tight truncate leading-tight">
							{fixture.homeTeam}
						</h3>
						<span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200/60">
							Home
						</span>
					</div>
				</div>

				{/* VS Badge */}
				<div className="flex flex-col items-center justify-center px-1 sm:px-2 shrink-0">
					<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-xs sm:text-sm font-black text-red-600 shadow-xs">
						VS
					</div>
				</div>

				{/* Away Team */}
				<div className="flex flex-col items-center text-center space-y-2 flex-1 min-w-0">
					<div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl bg-slate-50/80 p-3 sm:p-4 border border-slate-200/80 flex items-center justify-center shadow-xs transition-transform hover:scale-105">
						{fixture.awayTeamBadge ? (
							<Image
								src={fixture.awayTeamBadge}
								alt={fixture.awayTeam}
								width={100}
								height={100}
								className="object-contain max-h-full max-w-full drop-shadow-xs"
								unoptimized
							/>
						) : (
							<Shield className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
						)}
					</div>
					<div className="w-full px-1">
						<h3 className="text-xs sm:text-base font-black text-slate-900 tracking-tight truncate leading-tight">
							{fixture.awayTeam}
						</h3>
						<span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200/60">
							Away
						</span>
					</div>
				</div>
			</div>

			{/* Countdown & Match Info Strip */}
			<div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-3 sm:p-4 space-y-2.5 sm:space-y-3">
				{!countdown.isPassed ? (
					<div className="flex items-center justify-center gap-1.5 sm:gap-2 text-center">
						<div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2 min-w-[50px] sm:min-w-[64px] shadow-2xs">
							<span className="text-base sm:text-xl font-black text-slate-900 block leading-tight">
								{countdown.days}
							</span>
							<span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
								Days
							</span>
						</div>
						<span className="text-xs sm:text-base font-bold text-red-600">
							:
						</span>
						<div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2 min-w-[50px] sm:min-w-[64px] shadow-2xs">
							<span className="text-base sm:text-xl font-black text-slate-900 block leading-tight">
								{String(countdown.hours).padStart(2, "0")}
							</span>
							<span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
								Hours
							</span>
						</div>
						<span className="text-xs sm:text-base font-bold text-red-600">
							:
						</span>
						<div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2 min-w-[50px] sm:min-w-[64px] shadow-2xs">
							<span className="text-base sm:text-xl font-black text-slate-900 block leading-tight">
								{String(countdown.minutes).padStart(2, "0")}
							</span>
							<span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
								Mins
							</span>
						</div>
						<span className="text-xs sm:text-base font-bold text-red-600">
							:
						</span>
						<div className="bg-white border border-red-200 rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2 min-w-[50px] sm:min-w-[64px] shadow-2xs">
							<span className="text-base sm:text-xl font-black text-red-600 block leading-tight">
								{String(countdown.seconds).padStart(2, "0")}
							</span>
							<span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider text-red-500">
								Secs
							</span>
						</div>
					</div>
				) : (
					<div className="text-center py-1">
						<span className="px-3.5 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-bold">
							Matchday In Progress / Imminent
						</span>
					</div>
				)}

				{/* Timing Details */}
				<div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-slate-600 text-[11px] sm:text-xs font-semibold">
					<div className="flex items-center gap-1.5 text-slate-900 font-bold">
						<Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
						<span>{dateInfo.formattedDate}</span>
					</div>
					<span className="text-slate-300 hidden sm:inline">•</span>
					<div className="flex items-center gap-1.5 text-slate-900 font-bold">
						<Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
						<span>{dateInfo.formattedTime} (Local Time)</span>
					</div>
					<span className="text-slate-300 hidden sm:inline">•</span>
					<div className="flex items-center gap-1.5 text-slate-500">
						<MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span className="truncate max-w-[180px] sm:max-w-none">
							{fixture.stadium}
						</span>
					</div>
				</div>
			</div>

			{/* Action & Motto Row */}
			<div className="flex items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-slate-100 shrink-0">
				<span className="text-[11px] sm:text-xs font-bold text-slate-400 italic hidden sm:inline">
					&ldquo;You&apos;ll Never Walk Alone&rdquo;
				</span>
				<a
					href={gCalUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 !text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer !no-underline"
				>
					<Calendar className="w-3.5 h-3.5 text-red-400 shrink-0" />
					<span className="!text-white font-bold">Add to Google Calendar</span>
				</a>
			</div>
		</div>
	);
}
