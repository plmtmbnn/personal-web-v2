"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
	Calendar,
	MapPin,
	Shield,
	Trophy,
	ExternalLink,
	FileText,
} from "lucide-react";
import type { LfcFixtureResponse } from "../types";
import {
	getBestImageUrl,
	isLiverpoolHome,
	formatMatchDate,
	getMatchOutcome,
} from "../utils";

interface PlayedCardProps {
	fixture: LfcFixtureResponse;
	index?: number;
}

export default function PlayedCard({ fixture, index = 0 }: PlayedCardProps) {
	const reduceMotion = useReducedMotion();
	const { matchData } = fixture;
	const isHome = isLiverpoolHome(matchData.homeTeam);
	const dateInfo = useMemo(
		() => formatMatchDate(matchData.date),
		[matchData.date],
	);
	const outcome = useMemo(() => getMatchOutcome(fixture), [fixture]);

	const homeLogoUrl = getBestImageUrl(matchData.homeTeamLogo?.sizes);
	const awayLogoUrl = getBestImageUrl(matchData.awayTeamLogo?.sizes);
	const compLogoUrl = getBestImageUrl(matchData.competition?.logo?.sizes);

	const homeScore = matchData.result?.score?.home ?? "-";
	const awayScore = matchData.result?.score?.away ?? "-";

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.25,
				delay: Math.min(index * 0.03, 0.3),
				ease: "easeOut",
			}}
			className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-5 shadow-sm hover:shadow-md transition-all"
		>
			{/* Top Bar: Competition & Outcome Pill */}
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
						{matchData.competition?.displayName || "Match Result"}
					</span>
				</div>

				{/* Outcome Badge */}
				<div className="flex items-center gap-1.5 shrink-0">
					<span
						className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
							outcome.outcome === "win"
								? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
								: outcome.outcome === "draw"
									? "bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50"
									: outcome.outcome === "loss"
										? "bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50"
										: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300"
						}`}
					>
						{outcome.label}
					</span>
					<span
						className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
							isHome
								? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300"
								: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400"
						}`}
					>
						{isHome ? "H" : "A"}
					</span>
				</div>
			</div>

			{/* Center: Teams & Final Scores */}
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
					<span className="text-base font-black text-slate-900 dark:text-white px-2">
						{homeScore}
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
					<span className="text-base font-black text-slate-900 dark:text-white px-2">
						{awayScore}
					</span>
				</div>
			</div>

			{/* Match Details: Date, Stadium & Match Report Link */}
			<div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
				<div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
					<div className="flex items-center gap-1.5 font-medium">
						<Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span>{dateInfo.formattedDate}</span>
					</div>
					<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
						{dateInfo.relativeTime}
					</span>
				</div>

				<div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
					<div className="flex items-center gap-1.5 truncate">
						<MapPin className="w-3 h-3 text-slate-400 shrink-0" />
						<span className="truncate">{matchData.stadium}</span>
					</div>

					{fixture.link?.href && (
						<a
							href={fixture.link.href}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline shrink-0"
						>
							<FileText className="w-3 h-3" />
							<span>{fixture.link.label || "Report"}</span>
							<ExternalLink className="w-2.5 h-2.5" />
						</a>
					)}
				</div>
			</div>
		</motion.div>
	);
}
