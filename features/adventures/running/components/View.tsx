"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
	Zap,
	Activity,
	ArrowLeft,
	Flame,
	Mountain,
	Calendar,
	ExternalLink,
	CheckCircle,
	ShieldAlert,
	TrendingUp,
	RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import type { StravaDataResult } from "@/services/strava/service";
import PersonalBestsSwipeCard from "./PersonalBestsSwipeCard";

// ──────────────────────────────
// SVG Components for Visualizations
// ──────────────────────────────

function PaceRing({
	pace,
	maxPace = 8,
	size = 120,
}: {
	pace: number;
	maxPace?: number;
	size?: number;
}) {
	const radius = (size - 12) / 2;
	const circumference = 2 * Math.PI * radius;
	const progress = Math.min(pace / maxPace, 1);
	const dashOffset = circumference * (1 - progress);

	return (
		<svg width={size} height={size} className="transform -rotate-90">
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth={8}
				className="text-slate-100"
			/>
			<motion.circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				strokeWidth={8}
				strokeLinecap="round"
				initial={{
					strokeDasharray: circumference,
					strokeDashoffset: circumference,
				}}
				animate={{ strokeDashoffset: dashOffset }}
				transition={{ type: "spring", stiffness: 350, damping: 30 }}
				className={
					pace < 5
						? "text-emerald-500"
						: pace < 6
							? "text-blue-500"
							: pace < 7
								? "text-amber-500"
								: "text-rose-500"
				}
			/>
		</svg>
	);
}

// Removed unused ProgressBar component - can be restored if needed for future visualizations

export default function RunningView({
	initialData,
	isAdmin = false,
}: {
	initialData?: StravaDataResult;
	isAdmin?: boolean;
}) {
	const [mounted, setMounted] = useState(false);
	const [dataState, setDataState] = useState<StravaDataResult | undefined>(
		initialData,
	);
	const [isSyncing, setIsSyncing] = useState(false);
	const reduceMotion = useReducedMotion();
	const safeReduceMotion = reduceMotion !== null && reduceMotion !== undefined;
	const searchParams = useSearchParams();
	const [statusMessage, setStatusMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const handleLiveSync = async () => {
		setIsSyncing(true);
		try {
			const res = await fetch("/api/strava/sync", { method: "POST" });
			const json = await res.json();
			if (!res.ok) {
				throw new Error(json.error || "Failed to sync Strava data.");
			}
			if (json.data) {
				setDataState(json.data);
			}
			setStatusMessage({
				type: "success",
				text: "Strava activities live synced successfully!",
			});
		} catch (err: any) {
			setStatusMessage({
				type: "error",
				text: err?.message || "Failed to sync Strava activities.",
			});
		} finally {
			setIsSyncing(false);
		}
	};

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (initialData) {
			setDataState(initialData);
		}
	}, [initialData]);

	useEffect(() => {
		if (!mounted) return;
		const success = searchParams.get("success");
		const error = searchParams.get("error");

		if (success === "true") {
			setStatusMessage({
				type: "success",
				text: "Strava authentication successful! Activities are now synced.",
			});
			const timer = setTimeout(() => setStatusMessage(null), 5000);
			return () => clearTimeout(timer);
		} else if (error) {
			setStatusMessage({
				type: "error",
				text: `Strava authentication failed: ${decodeURIComponent(error)}`,
			});
			const timer = setTimeout(() => setStatusMessage(null), 8000);
			return () => clearTimeout(timer);
		}
	}, [searchParams, mounted]);

	useEffect(() => {
		if (!statusMessage) return;
		const timer = setTimeout(() => setStatusMessage(null), 6000);
		return () => clearTimeout(timer);
	}, [statusMessage]);

	// Calculate derived values (must be before conditional return to maintain hook order)
	const runs = dataState?.runs || [];
	const stats = dataState?.stats;
	const isConfigured = dataState?.isConfigured || false;
	const hasToken = dataState?.hasToken || false;
	const showConnectPrompt = isAdmin && isConfigured && !hasToken;
	const isConnected = isConfigured && hasToken;
	const runsIsNull = dataState?.runs === null;
	const hasRunData = Array.isArray(runs) && runs.length > 0;
	const hasStats = stats !== null && stats !== undefined;

	// Debug logging (can be removed after verification)
	useEffect(() => {
		if (mounted) {
			console.log("🏃 Running View Debug:", {
				isConfigured,
				hasToken,
				isConnected,
				runsIsNull,
				runsLength: runs?.length,
				hasRunData,
				hasStats,
				statsYTD: stats?.ytd_run_totals?.count,
				statsAll: stats?.all_run_totals?.count,
			});
		}
	}, [
		mounted,
		isConfigured,
		hasToken,
		isConnected,
		runsIsNull,
		runs?.length,
		hasRunData,
		hasStats,
		stats,
	]);

	const currentClientId = dataState?.clientId || initialData?.clientId;
	const currentSiteUrl = dataState?.siteUrl || initialData?.siteUrl;
	const oauthUrl =
		currentClientId && currentSiteUrl
			? `https://www.strava.com/oauth/authorize?client_id=${currentClientId}&redirect_uri=${currentSiteUrl}/api/strava/callback&response_type=code&scope=activity:read_all`
			: null;

	// Calculate average pace from recent runs
	const avgPaceMinutes = useMemo(() => {
		if (runs.length === 0) return 5.5; // fallback
		const totalMeters = runs.reduce((acc, run) => acc + run.distance, 0);
		const totalTimeSeconds = runs.reduce(
			(acc, run) => acc + run.moving_time,
			0,
		);
		const totalKm = totalMeters / 1000;
		if (totalKm === 0) return 5.5;
		const pacePerKm = totalTimeSeconds / totalKm;
		return Math.round((pacePerKm / 60) * 10) / 10;
	}, [runs]);

	if (!mounted) return null;

	const totalRuns = stats?.all_run_totals?.count
		? stats.all_run_totals.count.toLocaleString()
		: hasRunData
			? runs.length.toLocaleString()
			: "—";

	const kmPerYear = stats?.ytd_run_totals?.distance
		? Math.round(stats.ytd_run_totals.distance / 1000).toLocaleString()
		: hasRunData
			? Math.round(
					runs.reduce((acc, run) => acc + run.distance, 0) / 1000,
				).toLocaleString()
			: "—";

	// Removed unused RunCardSkeleton component - can be restored if loading states are needed

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 space-y-12">
				{/* Status Banners */}
				{statusMessage && (
					<motion.div
						initial={safeReduceMotion ? false : { opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className={`p-4 rounded-2xl flex items-center gap-3 border shadow-xs ${
							statusMessage.type === "success"
								? "bg-emerald-50 border-emerald-200 text-emerald-900"
								: "bg-rose-50 border-rose-200 text-rose-900"
						}`}
					>
						{statusMessage.type === "success" ? (
							<CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
						) : (
							<ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
						)}
						<p className="text-xs font-bold leading-normal">
							{statusMessage.text}
						</p>
					</motion.div>
				)}

				{/* ═══════════════════════════════════════
				    HERO SECTION
				═══════════════════════════════════════ */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
					{/* LEFT COLUMN: Header & Quick Stats */}
					<div className="lg:col-span-5 space-y-6">
						{/* Breadcrumb */}
						<motion.div
							initial={safeReduceMotion ? false : { opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
						>
							<Link
								href="/adventures"
								className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 transition-colors gap-2 group !no-underline"
							>
								<ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
								Back to Adventures
							</Link>
						</motion.div>

						{/* Header Content */}
						<motion.div
							initial={safeReduceMotion ? false : { opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="space-y-4"
						>
							<div className="flex items-center gap-2">
								<span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200/80 text-[10px] font-bold text-slate-700 uppercase tracking-wider shadow-xs">
									<Activity className="w-3.5 h-3.5 text-emerald-600" />
									Performance Hub
								</span>
							</div>
							<h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
								Endurance <span className="text-emerald-600">Journey</span>
							</h1>
							<p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-md">
								Tracking physical limits and mental discipline. Running is the
								ultimate feedback loop for consistency and resilience in both
								engineering and life.
							</p>
						</motion.div>

						{/* Quick Stats Cards */}
						<motion.div
							initial={safeReduceMotion ? false : { opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.15 }}
							className="grid grid-cols-2 gap-4 p-6 bg-white border border-slate-200/80 rounded-[1.5rem] max-w-sm shadow-xs"
						>
							<div className="text-center py-1 group">
								<p className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
									{totalRuns}
								</p>
								<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1">
									Total Runs
								</p>
							</div>
							<div className="text-center py-1 border-l border-slate-100 group">
								<p className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
									{kmPerYear}
								</p>
								<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1">
									KM this year
								</p>
							</div>
						</motion.div>

						{/* Average Pace Ring */}
						{runs.length > 0 && (
							<motion.div
								initial={safeReduceMotion ? false : { opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
								className="flex items-center gap-4 p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs"
							>
								<div className="relative w-16 h-16">
									<PaceRing pace={avgPaceMinutes} />
									<div className="absolute inset-0 flex items-center justify-center">
										<span className="text-[10px] font-bold text-slate-500">
											km
										</span>
									</div>
								</div>
								<div className="flex-1">
									<p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
										Average Pace
									</p>
									<p className="text-lg font-extrabold text-slate-900">
										{Math.floor(avgPaceMinutes)}:
										{((avgPaceMinutes % 1) * 60).toFixed(0).padStart(2, "0")}{" "}
										min/km
									</p>
									<div className="flex items-center gap-1 mt-1 text-emerald-600">
										<TrendingUp className="w-3.5 h-3.5" />
										<span className="text-[10px] font-semibold text-slate-600">
											Based on {runs.length} recent runs
										</span>
									</div>
								</div>
							</motion.div>
						)}
					</div>

					{/* RIGHT COLUMN: Personal Bests Swipe Card */}
					<div className="lg:col-span-7 space-y-6">
						<PersonalBestsSwipeCard />
					</div>
				</div>

				{/* ═══════════════════════════════════════
				    OAUTH CONNECTION PROMPT (ADMIN / DEV)
				═══════════════════════════════════════ */}
				{showConnectPrompt && oauthUrl && (
					<motion.div
						initial={safeReduceMotion ? false : { opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ type: "spring", stiffness: 350, damping: 30 }}
						className="mt-12 p-8 bg-white border border-emerald-200 rounded-[2.5rem] max-w-xl mx-auto shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
					>
						<div className="space-y-2 text-center sm:text-left relative z-10">
							<div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-600">
								<Zap className="w-4 h-4" />
								<span className="text-[9.5px] font-bold uppercase tracking-wider">
									Strava Sync Setup
								</span>
							</div>
							<h4 className="text-lg font-extrabold text-slate-900 leading-tight">
								Connect Strava Profile
							</h4>
							<p className="text-slate-600 text-xs font-medium leading-relaxed max-w-sm">
								Your API applications settings are ready. Authorize this
								dashboard to start pulling your running achievements.
							</p>
						</div>
						<a
							href={oauthUrl}
							className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shrink-0 shadow-md !no-underline relative z-10"
						>
							Connect Account
						</a>
					</motion.div>
				)}

				{/* ═══════════════════════════════════════
					    RECENT ACTIVITIES SECTION
					═══════════════════════════════════════ */}
				{hasRunData && (
					<motion.div
						initial={safeReduceMotion ? false : { opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="mt-16 space-y-6"
					>
						<div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
									<Activity className="w-5 h-5" />
								</div>
								<div>
									<h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
										Recent Running Activities
									</h3>
									<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
										Latest {runs.length} activities from Strava
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={handleLiveSync}
									disabled={isSyncing}
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
									title="Sync live activities from Strava"
								>
									<RefreshCw
										className={`w-3.5 h-3.5 text-emerald-600 ${
											isSyncing ? "animate-spin" : ""
										}`}
									/>
									<span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
								</button>
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:block">
									Real-Time Connection
								</span>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{runs.map((run, idx) => {
								const date = new Date(run.start_date_local);
								const formattedDate = format(date, "MMM dd, yyyy");
								const distanceKm = (run.distance / 1000).toFixed(2);

								// Pace calculation
								const paceSeconds =
									run.distance > 0
										? run.moving_time / (run.distance / 1000)
										: 0;
								const paceMin = Math.floor(paceSeconds / 60);
								const paceSec = Math.floor(paceSeconds % 60)
									.toString()
									.padStart(2, "0");
								const formattedPace =
									run.distance > 0 ? `${paceMin}:${paceSec}/km` : "N/A";

								// Duration formatting
								const hrs = Math.floor(run.moving_time / 3600);
								const mins = Math.floor((run.moving_time % 3600) / 60);
								const secs = run.moving_time % 60;
								const formattedDuration =
									hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m ${secs}s`;

								return (
									<motion.div
										key={run.id}
										initial={safeReduceMotion ? false : { opacity: 0, y: 15 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.05 * idx, duration: 0.4 }}
										className="p-5 bg-white border border-slate-200/80 rounded-2xl hover:border-slate-300 transition-all duration-300 group flex flex-col justify-between h-full shadow-xs hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
									>
										<div className="space-y-4 relative z-10">
											<div className="flex justify-between items-start">
												<div className="space-y-1">
													<p className="text-sm font-extrabold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
														{run.name}
													</p>
													<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
														<Calendar className="w-3.5 h-3.5 text-indigo-600" />
														<span>{formattedDate}</span>
													</div>
												</div>
												<a
													href={`https://www.strava.com/activities/${run.id}`}
													target="_blank"
													rel="noopener noreferrer"
													className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-all duration-200 flex items-center justify-center border border-slate-200/60 cursor-pointer"
													title="View on Strava"
												>
													<ExternalLink className="w-3.5 h-3.5" />
												</a>
											</div>

											<div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
												<div className="space-y-0.5">
													<span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">
														Distance
													</span>
													<div className="flex items-baseline gap-0.5">
														<span className="text-sm font-extrabold text-slate-900">
															{distanceKm}
														</span>
														<span className="text-[8px] font-bold text-slate-500">
															KM
														</span>
													</div>
												</div>
												<div className="space-y-0.5 border-l border-slate-100 pl-2">
													<span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">
														Pace
													</span>
													<div className="flex items-baseline gap-0.5">
														<span className="text-sm font-extrabold text-slate-900">
															{formattedPace}
														</span>
													</div>
												</div>
												<div className="space-y-0.5 border-l border-slate-100 pl-2">
													<span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">
														Duration
													</span>
													<div className="flex items-baseline gap-0.5">
														<span className="text-sm font-extrabold text-slate-900">
															{formattedDuration}
														</span>
													</div>
												</div>
											</div>
										</div>

										<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between relative z-10">
											<div className="flex items-center gap-1.5">
												<Mountain className="w-3.5 h-3.5 text-emerald-600" />
												<span className="text-xs font-bold text-slate-700 leading-none">
													+{run.total_elevation_gain}m gain
												</span>
											</div>
											{run.has_heartrate && run.average_heartrate && (
												<div className="flex items-center gap-1">
													<Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
													<span className="text-xs font-bold text-slate-700 leading-none">
														{Math.round(run.average_heartrate)} bpm
													</span>
												</div>
											)}
										</div>
									</motion.div>
								);
							})}
						</div>
					</motion.div>
				)}

				{/* Not Connected State */}
				{!hasRunData && !isConnected && (
					<motion.div
						initial={safeReduceMotion ? false : { opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="mt-12 text-center py-20 bg-white border border-slate-200/80 rounded-3xl shadow-sm"
					>
						<div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-200/60">
							<Zap className="w-10 h-10 text-slate-400" />
						</div>
						<p className="text-base font-extrabold text-slate-900 mb-2">
							{isConfigured ? "Ready to Connect" : "Setup Required"}
						</p>
						<p className="text-xs text-slate-600 max-w-md mx-auto font-medium leading-relaxed mb-6">
							{isConfigured
								? "Connect your Strava account to automatically sync your running activities, track your progress, and visualize your endurance journey."
								: "Strava integration is not yet configured. Set up your API credentials to start tracking your running achievements."}
						</p>
						{showConnectPrompt && oauthUrl && (
							<a
								href={oauthUrl}
								className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 !no-underline"
							>
								<Zap className="w-4 h-4" />
								Connect Strava Account
							</a>
						)}
					</motion.div>
				)}
			</div>
		</main>
	);
}
