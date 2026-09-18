"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
	Trophy,
	RefreshCw,
	ChevronRight,
	AlertCircle,
	Calendar,
} from "lucide-react";
import Link from "next/link";
import { getLiverpoolFixtures } from "../actions";
import type { LfcFixture } from "../types";
import NextMatchHero from "./NextMatchHero";
import FixtureSkeleton from "./FixtureSkeleton";

export default function LiverpoolView() {
	const reduceMotion = useReducedMotion();
	const [upcomingFixtures, setUpcomingFixtures] = useState<LfcFixture[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const fetchFixtures = useCallback(async (refresh = false) => {
		if (refresh) {
			setIsRefreshing(true);
		} else {
			setIsLoading(true);
		}
		setError(null);

		try {
			const res = await getLiverpoolFixtures(refresh);
			const upcoming = Array.isArray(res?.upcoming) ? res.upcoming : [];

			if (res?.error && upcoming.length === 0) {
				setError(res.error);
			} else {
				setUpcomingFixtures(upcoming);
				setLastUpdated(res?.lastUpdated || new Date().toISOString());
			}
		} catch (err) {
			console.error("Failed to load Liverpool fixtures:", err);
			setError("Failed to synchronize with fixtures API");
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, []);

	useEffect(() => {
		fetchFixtures();
	}, [fetchFixtures]);

	// Next upcoming match (first item in sorted upcoming list)
	const nextMatch = useMemo(() => {
		return upcomingFixtures.length > 0 ? upcomingFixtures[0] : null;
	}, [upcomingFixtures]);

	return (
		<main className="min-h-[100dvh] bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden overflow-y-auto flex flex-col justify-between px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-24 sm:pb-28">
			<div className="max-w-4xl lg:max-w-5xl mx-auto w-full flex-1 flex flex-col">
				{/* ── Breadcrumb & Sync Actions ─────────────────────────── */}
				<div className="flex items-center justify-between gap-3 shrink-0 py-1 mb-2 sm:mb-3">
					<div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-500 min-w-0">
						<Link
							href="/"
							className="hover:text-slate-900 transition-colors shrink-0"
						>
							Home
						</Link>
						<ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<Link
							href="/insights"
							className="hover:text-slate-900 transition-colors shrink-0"
						>
							Insights
						</Link>
						<ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span className="text-red-600 font-bold truncate flex items-center gap-1.5">
							<Trophy className="w-3.5 h-3.5 shrink-0" />
							<span>Liverpool FC</span>
						</span>
					</div>

					<div className="flex items-center gap-2 shrink-0">
						{lastUpdated && (
							<span className="text-[11px] font-medium text-slate-400 hidden sm:inline-block">
								Synced:{" "}
								{new Date(lastUpdated).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</span>
						)}
						<button
							type="button"
							onClick={() => fetchFixtures(true)}
							disabled={isLoading || isRefreshing}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition-[background-color,border-color,transform] cursor-pointer disabled:opacity-50"
							title="Refresh fixtures"
						>
							<RefreshCw
								className={`w-3 h-3 text-red-600 ${
									isRefreshing ? "animate-spin" : ""
								}`}
							/>
							<span className="hidden xs:inline">
								{isRefreshing ? "Syncing..." : "Refresh"}
							</span>
						</button>
					</div>
				</div>

				{/* ── Main Content Area ─────────────────────────────────── */}
				<div className="w-full flex-1 flex flex-col my-auto py-1 sm:py-2">
					{isLoading ? (
						<div className="w-full my-auto">
							<FixtureSkeleton />
						</div>
					) : error ? (
						<motion.div
							initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							className="text-center py-6 sm:py-8 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-3 max-w-md mx-auto w-full my-auto px-6"
						>
							<div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
								<AlertCircle className="w-6 h-6 text-amber-600" />
							</div>
							<div className="space-y-1">
								<p className="text-sm sm:text-base font-bold text-slate-900">
									Unable to Synchronize Fixtures
								</p>
								<p className="text-xs text-slate-500 font-medium px-4">
									{error}
								</p>
							</div>
							<button
								type="button"
								onClick={() => fetchFixtures()}
								className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold shadow-xs active:scale-95 transition-[background-color,transform] cursor-pointer"
							>
								Retry Connection
							</button>
						</motion.div>
					) : nextMatch ? (
						<motion.div
							initial={reduceMotion ? false : { opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.35 }}
							className="w-full my-auto"
						>
							<NextMatchHero fixture={nextMatch} />
						</motion.div>
					) : (
						<motion.div
							initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							className="text-center py-6 sm:py-8 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-3 max-w-md mx-auto w-full my-auto px-6"
						>
							<div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
								<Calendar className="w-6 h-6 text-slate-400" />
							</div>
							<p className="text-sm sm:text-base font-bold text-slate-900">
								No upcoming match scheduled
							</p>
							<p className="text-xs text-slate-500 font-medium">
								There are currently no upcoming scheduled fixtures. Check back
								soon!
							</p>
						</motion.div>
					)}
				</div>
			</div>
		</main>
	);
}
