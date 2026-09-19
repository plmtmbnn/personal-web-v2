"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
	Calendar,
	Clock,
	MapPin,
	Trophy,
	ShieldAlert,
	CalendarPlus,
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

interface CountdownTileProps {
	value: string;
	label: string;
	accent?: boolean;
}

function CountdownTile({ value, label, accent = false }: CountdownTileProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 min-w-[52px] sm:min-w-[62px] shadow-2xs border transition-colors ${
				accent ? "bg-red-600 border-red-500" : "bg-white border-slate-200/80"
			}`}
		>
			<span
				className={`text-lg sm:text-2xl font-black leading-tight tabular-nums ${
					accent ? "text-white" : "text-slate-900"
				}`}
			>
				{value}
			</span>
			<span
				className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest mt-0.5 ${
					accent ? "text-red-200" : "text-slate-400"
				}`}
			>
				{label}
			</span>
		</div>
	);
}

export default function NextMatchHero({ fixture }: NextMatchHeroProps) {
	const isHome = fixture.isHome;
	const dateInfo = useMemo(() => formatMatchDate(fixture.date), [fixture.date]);
	const [countdown, setCountdown] = useState(() => getCountdown(fixture.date));
	const gCalUrl = useMemo(() => createGoogleCalendarUrl(fixture), [fixture]);

	useEffect(() => {
		const interval = setInterval(() => {
			setCountdown(getCountdown(fixture.date));
		}, 1000);
		return () => clearInterval(interval);
	}, [fixture.date]);

	const isImminent =
		!countdown.isPassed && countdown.days === 0 && countdown.hours < 2;

	return (
		<div className="relative rounded-3xl sm:rounded-[2.5rem] border border-slate-200/80 bg-white shadow-xl overflow-hidden w-full max-w-xl sm:max-w-2xl mx-auto">
			{/* ── Zone A: Head Strip ─────────────────────────────────────────── */}
			<div className="flex items-center justify-between gap-2 px-4 sm:px-5 lg:px-6 pt-4 sm:pt-5 pb-3 sm:pb-3.5 border-b border-slate-100">
				{/* Domain badge pill */}
				<div className="flex items-center gap-1.5 min-w-0">
					<div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
						<Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
					</div>
					<div className="flex items-center gap-1 min-w-0">
						<span className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-wider shrink-0">
							Matchday Hub
						</span>
						<span className="text-[10px] sm:text-xs font-medium text-slate-300 shrink-0">
							•
						</span>
						<span className="text-[10px] sm:text-xs font-semibold text-slate-400 truncate">
							{fixture.competition}
							{fixture.round ? ` ${fixture.round}` : ""}
						</span>
					</div>
				</div>

				{/* Home/Away context chip */}
				<span
					className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] sm:text-[10.5px] font-extrabold uppercase tracking-widest shrink-0 ${
						isHome
							? "bg-red-50 text-red-700 border border-red-100"
							: "bg-slate-100 text-slate-500 border border-slate-200/60"
					}`}
				>
					{isHome ? (
						<>
							<span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
							Anfield
						</>
					) : (
						"Away Fixture"
					)}
				</span>
			</div>

			{/* ── Zone B: Clash Arena ────────────────────────────────────────── */}
			<div className="px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-3 sm:pb-3.5">
				{/* Team crests arena */}
				<div className="flex items-center justify-between gap-3 sm:gap-5">
					{/* Home team */}
					<div className="flex flex-col items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
						<div
							className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-3xl p-3 sm:p-4 border flex items-center justify-center shadow-xs transition-transform duration-200 hover:scale-[1.04] ${
								isHome
									? "bg-red-50/70 border-red-100"
									: "bg-slate-50 border-slate-200/80"
							}`}
						>
							{fixture.homeTeamBadge ? (
								<Image
									src={fixture.homeTeamBadge}
									alt={fixture.homeTeam}
									width={96}
									height={96}
									className="object-contain max-h-full max-w-full drop-shadow-xs"
									unoptimized
								/>
							) : (
								<ShieldAlert className="w-9 h-9 sm:w-12 sm:h-12 text-slate-300" />
							)}
						</div>
						<div className="text-center w-full">
							<p className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate leading-tight">
								{fixture.homeTeam}
							</p>
							<span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200/60">
								Home
							</span>
						</div>
					</div>

					{/* VS badge */}
					<div className="shrink-0 flex flex-col items-center gap-1">
						<div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900 flex items-center justify-center shadow-xs">
							<span className="text-[10px] sm:text-xs font-black text-white tracking-wider">
								VS
							</span>
						</div>
					</div>

					{/* Away team */}
					<div className="flex flex-col items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
						<div
							className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-3xl p-3 sm:p-4 border flex items-center justify-center shadow-xs transition-transform duration-200 hover:scale-[1.04] ${
								!isHome
									? "bg-red-50/70 border-red-100"
									: "bg-slate-50 border-slate-200/80"
							}`}
						>
							{fixture.awayTeamBadge ? (
								<Image
									src={fixture.awayTeamBadge}
									alt={fixture.awayTeam}
									width={96}
									height={96}
									className="object-contain max-h-full max-w-full drop-shadow-xs"
									unoptimized
								/>
							) : (
								<ShieldAlert className="w-9 h-9 sm:w-12 sm:h-12 text-slate-300" />
							)}
						</div>
						<div className="text-center w-full">
							<p className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate leading-tight">
								{fixture.awayTeam}
							</p>
							<span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200/60">
								Away
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* ── Zone C: Countdown + Info Tray ─────────────────────────────── */}
			<div className="mx-3 sm:mx-4 mb-3 sm:mb-4 bg-slate-50/90 border border-slate-200/60 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3">
				{/* Countdown HUD */}
				{!countdown.isPassed ? (
					<div className="flex items-center justify-center gap-2 sm:gap-2.5">
						<CountdownTile value={String(countdown.days)} label="Days" />
						<CountdownTile
							value={String(countdown.hours).padStart(2, "0")}
							label="Hours"
						/>
						<CountdownTile
							value={String(countdown.minutes).padStart(2, "0")}
							label="Mins"
						/>
						<CountdownTile
							value={String(countdown.seconds).padStart(2, "0")}
							label="Secs"
							accent={isImminent}
						/>
					</div>
				) : (
					<div className="flex items-center justify-center py-1">
						<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-xs">
							<span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
							Matchday In Progress
						</span>
					</div>
				)}

				{/* Match metadata strip */}
				<div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10.5px] sm:text-xs font-semibold">
					<div className="flex items-center gap-1.5 text-slate-900 font-bold">
						<Calendar className="w-3 h-3 text-red-600 shrink-0" />
						<span>{dateInfo.formattedDate}</span>
					</div>
					<span className="text-slate-300 hidden sm:inline">•</span>
					<div className="flex items-center gap-1.5 text-slate-900 font-bold">
						<Clock className="w-3 h-3 text-amber-500 shrink-0" />
						<span>{dateInfo.formattedTime} local</span>
					</div>
					<span className="text-slate-300 hidden sm:inline">•</span>
					<div className="flex items-center gap-1.5 text-slate-500">
						<MapPin className="w-3 h-3 text-slate-400 shrink-0" />
						<span className="truncate max-w-[160px] sm:max-w-none">
							{fixture.stadium}
						</span>
					</div>
					{dateInfo.relativeTime && (
						<>
							<span className="text-slate-300 hidden sm:inline">•</span>
							<span className="text-slate-500 font-semibold">
								{dateInfo.relativeTime}
							</span>
						</>
					)}
				</div>
			</div>

			{/* ── Footer: Motto + CTA ────────────────────────────────────────── */}
			<div className="flex items-center justify-between gap-3 px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5">
				<span className="text-[11px] sm:text-xs font-bold text-slate-300 italic hidden sm:inline">
					&ldquo;You&apos;ll Never Walk Alone&rdquo;
				</span>
				<a
					href={gCalUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 !text-white text-xs font-bold shadow-xs active:scale-95 transition-[background-color,transform] cursor-pointer !no-underline"
				>
					<CalendarPlus className="w-3.5 h-3.5 text-red-400 shrink-0" />
					<span className="!text-white font-bold">Add to Google Calendar</span>
				</a>
			</div>
		</div>
	);
}
