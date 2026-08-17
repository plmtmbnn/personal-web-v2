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
	const safeReduceMotion = reduceMotion !== null && reduceMotion !== undefined;
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
			initial={safeReduceMotion ? false : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				delay: Math.min(index * 0.05, 0.3),
				type: "spring",
				stiffness: 260,
				damping: 20,
			}}
			whileHover={{
				y: -4,
				transition: { type: "spring", stiffness: 400, damping: 25 },
			}}
			className="group flex flex-col justify-between bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative"
		>
			{/* Top Bar: Competition & Outcome Pill */}
			<div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
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
					<span className="text-xs font-bold text-slate-900 truncate">
						{matchData.competition?.displayName || "Match Result"}
					</span>
				</div>

				{/* Outcome Badge */}
				<div className="flex items-center gap-1.5 shrink-0">
					<span
						className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
							outcome.outcome === "win"
								? "bg-emerald-50 text-emerald-700 border border-emerald-100"
								: outcome.outcome === "draw"
									? "bg-amber-50 text-amber-700 border border-amber-100"
									: outcome.outcome === "loss"
										? "bg-rose-50 text-rose-700 border border-rose-100"
										: "bg-slate-100 text-slate-700 border border-slate-200"
						}`}
					>
						{outcome.label}
					</span>
					<span
						className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
							isHome
								? "bg-red-50 text-red-700 border border-red-100"
								: "bg-slate-100 text-slate-600 border border-slate-200"
						}`}
					>
						{isHome ? "H" : "A"}
					</span>
				</div>
			</div>

			{/* Center: Teams & Final Scores */}
			<div className="py-5 space-y-3.5">
				{/* Home Team Row */}
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 min-w-0">
						<div className="relative w-10 h-10 rounded-2xl bg-slate-50 p-2 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-xs">
							{homeLogoUrl ? (
								<Image
									src={homeLogoUrl}
									alt={matchData.homeTeam}
									width={32}
									height={32}
									className="object-contain max-h-full max-w-full"
									unoptimized
								/>
							) : (
								<Shield className="w-4 h-4 text-slate-400" />
							)}
						</div>
						<span
							className={`text-sm truncate ${
								isLiverpoolHome(matchData.homeTeam)
									? "text-red-600 font-bold"
									: "text-slate-900 font-semibold"
							}`}
						>
							{matchData.homeTeam}
						</span>
					</div>
					<span className="text-lg font-black text-slate-900 px-2">
						{homeScore}
					</span>
				</div>

				{/* Away Team Row */}
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 min-w-0">
						<div className="relative w-10 h-10 rounded-2xl bg-slate-50 p-2 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-xs">
							{awayLogoUrl ? (
								<Image
									src={awayLogoUrl}
									alt={matchData.awayTeam}
									width={32}
									height={32}
									className="object-contain max-h-full max-w-full"
									unoptimized
								/>
							) : (
								<Shield className="w-4 h-4 text-slate-400" />
							)}
						</div>
						<span
							className={`text-sm truncate ${
								isLiverpoolHome(matchData.awayTeam)
									? "text-red-600 font-bold"
									: "text-slate-900 font-semibold"
							}`}
						>
							{matchData.awayTeam}
						</span>
					</div>
					<span className="text-lg font-black text-slate-900 px-2">
						{awayScore}
					</span>
				</div>
			</div>

			{/* Match Details: Date, Stadium & Match Report Link */}
			<div className="pt-4 border-t border-slate-100 space-y-2.5">
				<div className="flex items-center justify-between text-xs text-slate-600">
					<div className="flex items-center gap-1.5 font-bold text-slate-900">
						<Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span>{dateInfo.formattedDate}</span>
					</div>
					<span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
						{dateInfo.relativeTime}
					</span>
				</div>

				<div className="flex items-center justify-between text-xs text-slate-500">
					<div className="flex items-center gap-1.5 truncate">
						<MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span className="truncate">{matchData.stadium}</span>
					</div>

					{fixture.link?.href && (
						<a
							href={fixture.link.href}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline shrink-0"
						>
							<FileText className="w-3.5 h-3.5" />
							<span>{fixture.link.label || "Report"}</span>
							<ExternalLink className="w-3 h-3" />
						</a>
					)}
				</div>
			</div>
		</motion.div>
	);
}
