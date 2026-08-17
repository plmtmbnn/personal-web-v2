"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
	Calendar,
	Clock,
	MapPin,
	Tv,
	Shield,
	Trophy,
	Plus,
	ExternalLink,
} from "lucide-react";
import type { LfcFixtureResponse } from "../types";
import {
	getBestImageUrl,
	isLiverpoolHome,
	formatMatchDate,
	createGoogleCalendarUrl,
} from "../utils";

interface FixtureCardProps {
	fixture: LfcFixtureResponse;
	index?: number;
}

export default function FixtureCard({ fixture, index = 0 }: FixtureCardProps) {
	const reduceMotion = useReducedMotion();
	const { matchData } = fixture;
	const isHome = isLiverpoolHome(matchData.homeTeam);
	const dateInfo = useMemo(
		() => formatMatchDate(matchData.date),
		[matchData.date],
	);

	const homeLogoUrl = getBestImageUrl(matchData.homeTeamLogo?.sizes);
	const awayLogoUrl = getBestImageUrl(matchData.awayTeamLogo?.sizes);
	const compLogoUrl = getBestImageUrl(matchData.competition?.logo?.sizes);

	const gCalUrl = useMemo(() => createGoogleCalendarUrl(fixture), [fixture]);

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.25,
				delay: Math.min(index * 0.03, 0.3),
				ease: "easeOut",
			}}
			className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 p-5 shadow-sm hover:shadow-xl hover:border-red-500/40 dark:hover:border-red-500/40 transition-all backdrop-blur-sm"
		>
			{/* Top Bar: Competition & Venue Tag */}
			<div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
				<div className="flex items-center gap-2 min-w-0">
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
						<Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
					)}
					<span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
						{matchData.competition?.displayName || "Fixture"}
					</span>
				</div>

				<div className="flex items-center gap-1.5 shrink-0">
					<span
						className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
							isHome
								? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50"
								: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
						}`}
					>
						{isHome ? "Anfield (H)" : "Away (A)"}
					</span>
				</div>
			</div>

			{/* Center: Teams & Crests Matchup */}
			<div className="py-4 space-y-3">
				{/* Home Team Row */}
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 min-w-0">
						<div className="relative w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/80 p-1 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
							{homeLogoUrl ? (
								<Image
									src={homeLogoUrl}
									alt={matchData.homeTeam}
									width={28}
									height={28}
									className="object-contain max-h-full max-w-full"
									unoptimized
								/>
							) : (
								<Shield className="w-4 h-4 text-slate-400" />
							)}
						</div>
						<span
							className={`text-sm font-bold truncate ${
								isLiverpoolHome(matchData.homeTeam)
									? "text-red-600 dark:text-red-400 font-extrabold"
									: "text-slate-900 dark:text-slate-100"
							}`}
						>
							{matchData.homeTeam}
						</span>
					</div>
					<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
						Home
					</span>
				</div>

				{/* Away Team Row */}
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 min-w-0">
						<div className="relative w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/80 p-1 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
							{awayLogoUrl ? (
								<Image
									src={awayLogoUrl}
									alt={matchData.awayTeam}
									width={28}
									height={28}
									className="object-contain max-h-full max-w-full"
									unoptimized
								/>
							) : (
								<Shield className="w-4 h-4 text-slate-400" />
							)}
						</div>
						<span
							className={`text-sm font-bold truncate ${
								isLiverpoolHome(matchData.awayTeam)
									? "text-red-600 dark:text-red-400 font-extrabold"
									: "text-slate-900 dark:text-slate-100"
							}`}
						>
							{matchData.awayTeam}
						</span>
					</div>
					<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
						Away
					</span>
				</div>
			</div>

			{/* Match Details: Date, Time & Stadium */}
			<div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
				<div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
					<div className="flex items-center gap-1.5 font-medium">
						<Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
						<span>{dateInfo.formattedDate}</span>
					</div>
					<div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
						<Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
						<span>{dateInfo.formattedTime}</span>
					</div>
				</div>

				<div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
					<div className="flex items-center gap-1.5 truncate">
						<MapPin className="w-3 h-3 text-slate-400 shrink-0" />
						<span className="truncate">{matchData.stadium}</span>
					</div>

					{/* Relative Time pill */}
					<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
						{dateInfo.relativeTime}
					</span>
				</div>

				{/* Broadcasters & Action Buttons */}
				<div className="pt-2 flex items-center justify-between gap-2">
					<div className="flex items-center gap-1.5 overflow-hidden">
						{fixture.broadcasters && fixture.broadcasters.length > 0 ? (
							<div className="flex items-center gap-1">
								<Tv className="w-3 h-3 text-slate-400 shrink-0" />
								<span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
									{fixture.broadcasters.map((b) => b.name).join(", ")}
								</span>
							</div>
						) : (
							<span className="text-[10px] text-slate-400 italic">
								Broadcast TBC
							</span>
						)}
					</div>

					<div className="flex items-center gap-1.5 shrink-0">
						<a
							href={gCalUrl}
							target="_blank"
							rel="noopener noreferrer"
							title="Add match to Google Calendar"
							className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
						>
							<Plus className="w-3.5 h-3.5" />
						</a>
						{fixture.link?.href && (
							<a
								href={fixture.link.href}
								target="_blank"
								rel="noopener noreferrer"
								title={fixture.link.label || "Match Report"}
								className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
							>
								<ExternalLink className="w-3.5 h-3.5" />
							</a>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	);
}
