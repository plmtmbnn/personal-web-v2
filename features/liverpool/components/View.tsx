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
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-36 sm:pb-44">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32">
				{/* ── Breadcrumb & Sync Actions ─────────────────────────── */}
				<div className="flex flex-wrap items-center justify-between gap-4 mb-8">
					<div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
						<Link href="/" className="hover:text-slate-900 transition-colors">
							Home
						</Link>
						<ChevronRight className="w-3.5 h-3.5 text-slate-400" />
						<Link
							href="/insights"
							className="hover:text-slate-900 transition-colors"
						>
							Insights
						</Link>
						<ChevronRight className="w-3.5 h-3.5 text-slate-400" />
						<span className="text-red-600 font-bold">Liverpool FC</span>
					</div>

					<div className="flex items-center gap-3">
						{lastUpdated && (
							<span className="text-[11px] font-medium text-slate-400 hidden sm:inline-block">
								Synced: {new Date(lastUpdated).toLocaleTimeString()}
							</span>
						)}
						<button
							type="button"
							onClick={() => fetchFixtures(true)}
							disabled={isLoading || isRefreshing}
							className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
						>
							<RefreshCw
								className={`w-3.5 h-3.5 text-red-600 ${
									isRefreshing ? "animate-spin" : ""
								}`}
							/>
							<span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
						</button>
					</div>
				</div>

				{/* ── Hero Section (TravelPage style) ───────────────────── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="mb-12 text-center max-w-3xl mx-auto space-y-4"
				>
					<div>
						<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
							<Trophy className="w-4 h-4 text-red-600" />
							Liverpool FC Matchday Hub
						</span>
					</div>

					<h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
						Next <span className="text-red-600">Matchday</span>
					</h1>

					<p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
						Official upcoming match kickoff countdown, stadium venue in your
						local timezone, and 1-click calendar export. You&apos;ll Never Walk
						Alone.
					</p>
				</motion.div>

				{/* ── Main Content Area ─────────────────────────────────── */}
				{isLoading ? (
					<FixtureSkeleton />
				) : error ? (
					<div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4 max-w-md mx-auto">
						<div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
							<AlertCircle className="w-8 h-8 text-amber-600" />
						</div>
						<div className="space-y-1">
							<p className="text-base font-bold text-slate-900">
								Unable to Synchronize Fixtures
							</p>
							<p className="text-xs text-slate-500 font-medium px-4">{error}</p>
						</div>
						<button
							type="button"
							onClick={() => fetchFixtures()}
							className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
						>
							Retry Connection
						</button>
					</div>
				) : nextMatch ? (
					<NextMatchHero fixture={nextMatch} />
				) : (
					<div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4 max-w-md mx-auto">
						<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Calendar className="w-8 h-8 text-slate-400" />
						</div>
						<p className="text-base font-bold text-slate-900">
							No upcoming match scheduled
						</p>
						<p className="text-xs text-slate-500 font-medium">
							There are currently no upcoming scheduled fixtures. Check back
							soon!
						</p>
					</div>
				)}
			</div>
		</main>
	);
}
