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
	const safeReduceMotion = reduceMotion !== null && reduceMotion !== undefined;
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
			className={`group flex flex-col justify-between bg-white border ${
				isHome ? "border-red-200/70" : "border-slate-200/80"
			} rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative`}
		>
			{/* Top Bar: Competition & Venue Tag */}
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
						{matchData.competition?.displayName || "Fixture"}
					</span>
				</div>

				<div className="flex items-center gap-1.5 shrink-0">
					<span
						className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
							isHome
								? "bg-red-50 text-red-700 border border-red-100"
								: "bg-slate-100 text-slate-700 border border-slate-200/80"
						}`}
					>
						{isHome ? "Anfield" : "Away"}
					</span>
				</div>
			</div>

			{/* Center: Teams & Crests Matchup */}
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
					<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
						Home
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
					<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
						Away
					</span>
				</div>
			</div>

			{/* Match Details: Date, Time & Stadium */}
			<div className="pt-4 border-t border-slate-100 space-y-2.5">
				<div className="flex items-center justify-between text-xs">
					<div className="flex items-center gap-1.5 font-bold text-slate-900">
						<Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
						<span>{dateInfo.formattedDate}</span>
					</div>
					<div className="flex items-center gap-1 font-bold text-slate-900">
						<Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
						<span>{dateInfo.formattedTime}</span>
					</div>
				</div>

				<div className="flex items-center justify-between text-xs text-slate-500">
					<div className="flex items-center gap-1.5 truncate">
						<MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span className="truncate">{matchData.stadium}</span>
					</div>

					{/* Relative Time pill */}
					<span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
						{dateInfo.relativeTime}
					</span>
				</div>

				{/* Broadcasters & Action Buttons */}
				<div className="pt-2 flex items-center justify-between gap-2">
					<div className="flex items-center gap-1.5 overflow-hidden">
						{fixture.broadcasters && fixture.broadcasters.length > 0 ? (
							<div className="flex items-center gap-1">
								<Tv className="w-3 h-3 text-slate-400 shrink-0" />
								<span className="text-[11px] font-semibold text-slate-500 truncate max-w-[130px]">
									{fixture.broadcasters.map((b) => b.name).join(", ")}
								</span>
							</div>
						) : (
							<span className="text-[11px] text-slate-400 italic">
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
							className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors active:scale-95 cursor-pointer shadow-xs"
						>
							<Plus className="w-3.5 h-3.5" />
						</a>
						{fixture.link?.href && (
							<a
								href={fixture.link.href}
								target="_blank"
								rel="noopener noreferrer"
								title={fixture.link.label || "Match Report"}
								className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors active:scale-95 cursor-pointer shadow-xs"
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
