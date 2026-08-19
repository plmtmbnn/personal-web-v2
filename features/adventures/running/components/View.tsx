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
	Search,
	X,
	Award,
	Clock,
	Route,
	Sparkles,
	ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import type {
	StravaDataResult,
	StravaRunActivity,
} from "@/services/strava/service";
import PersonalBestsSwipeCard from "./PersonalBestsSwipeCard";
import ActivityDetailModal from "./ActivityDetailModal";

const PAGE_SIZE = 6;

type DistanceFilter = "all" | "short" | "mid" | "long" | "ultra";
type SortOption =
	| "date-desc"
	| "date-asc"
	| "distance-desc"
	| "pace-asc"
	| "elevation-desc";

const DISTANCE_FILTERS: { id: DistanceFilter; label: string; range: string }[] =
	[
		{ id: "all", label: "All Runs", range: "All" },
		{ id: "short", label: "Short", range: "< 5K" },
		{ id: "mid", label: "Mid", range: "5 - 10K" },
		{ id: "long", label: "Long", range: "10 - 21K" },
		{ id: "ultra", label: "Half & Beyond", range: "> 21K" },
	];

// ──────────────────────────────
// SVG Components for Visualizations
// ──────────────────────────────

function PaceRing({
	pace,
	maxPace = 8,
	size = 56,
	strokeWidth = 5,
}: {
	pace: number;
	maxPace?: number;
	size?: number;
	strokeWidth?: number;
}) {
	const radius = (size - strokeWidth * 2) / 2;
	const circumference = 2 * Math.PI * radius;
	const progress = Math.min(Math.max(pace / maxPace, 0), 1);
	const dashOffset = circumference * (1 - progress);

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			className="transform -rotate-90 shrink-0"
		>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				className="text-slate-100"
			/>
			<motion.circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeDasharray={circumference}
				initial={{
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
	const [searchQuery, setSearchQuery] = useState("");
	const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>("all");
	const [sortBy, setSortBy] = useState<SortOption>("date-desc");
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const [selectedActivity, setSelectedActivity] =
		useState<StravaRunActivity | null>(null);

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
			if (json.data?.runs === null) {
				throw new Error(
					"Could not load activities from Strava. Please reconnect your account.",
				);
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

	// Calculate derived values
	const rawRuns: StravaRunActivity[] = dataState?.runs || [];
	const stats = dataState?.stats;
	const isConfigured = dataState?.isConfigured || false;
	const hasToken = dataState?.hasToken || false;
	const showConnectPrompt = isAdmin && isConfigured && !hasToken;
	const isConnected = isConfigured && hasToken;
	const runsIsNull = dataState?.runs === null;
	const hasRunData = Array.isArray(rawRuns) && rawRuns.length > 0;
	const hasStats = stats !== null && stats !== undefined;

	const currentClientId = dataState?.clientId || initialData?.clientId;
	const currentSiteUrl = dataState?.siteUrl || initialData?.siteUrl;
	const oauthUrl =
		currentClientId && currentSiteUrl
			? `https://www.strava.com/oauth/authorize?client_id=${currentClientId}&redirect_uri=${currentSiteUrl}/api/strava/callback&response_type=code&scope=activity:read_all`
			: null;

	// Reset pagination on filter or search changes
	const handleSearchChange = (query: string) => {
		setSearchQuery(query);
		setVisibleCount(PAGE_SIZE);
	};

	const handleFilterChange = (filter: DistanceFilter) => {
		setDistanceFilter(filter);
		setVisibleCount(PAGE_SIZE);
	};

	const handleSortChange = (sort: SortOption) => {
		setSortBy(sort);
		setVisibleCount(PAGE_SIZE);
	};

	const resetFilters = () => {
		setSearchQuery("");
		setDistanceFilter("all");
		setSortBy("date-desc");
		setVisibleCount(PAGE_SIZE);
	};

	// Distance Category Counts
	const distanceCounts = useMemo(() => {
		const counts: Record<DistanceFilter, number> = {
			all: rawRuns.length,
			short: 0,
			mid: 0,
			long: 0,
			ultra: 0,
		};

		for (const run of rawRuns) {
			const km = run.distance / 1000;
			if (km < 5) counts.short++;
			else if (km <= 10) counts.mid++;
			else if (km <= 21) counts.long++;
			else counts.ultra++;
		}
		return counts;
	}, [rawRuns]);

	// Filtered and Sorted Activities
	const filteredAndSortedRuns = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();

		const filtered = rawRuns.filter((run) => {
			const km = run.distance / 1000;

			// Distance Filter
			let matchesDistance = true;
			if (distanceFilter === "short") matchesDistance = km < 5;
			else if (distanceFilter === "mid") matchesDistance = km >= 5 && km <= 10;
			else if (distanceFilter === "long") matchesDistance = km > 10 && km <= 21;
			else if (distanceFilter === "ultra") matchesDistance = km > 21;

			if (!matchesDistance) return false;

			// Search Query
			if (!q) return true;
			const formattedDate = format(
				new Date(run.start_date_local.replace(/Z$/, "")),
				"MMMM dd yyyy",
			).toLowerCase();
			return run.name.toLowerCase().includes(q) || formattedDate.includes(q);
		});

		// Sorting
		return filtered.sort((a, b) => {
			if (sortBy === "date-desc") {
				return (
					new Date(b.start_date_local).getTime() -
					new Date(a.start_date_local).getTime()
				);
			}
			if (sortBy === "date-asc") {
				return (
					new Date(a.start_date_local).getTime() -
					new Date(b.start_date_local).getTime()
				);
			}
			if (sortBy === "distance-desc") {
				return b.distance - a.distance;
			}
			if (sortBy === "pace-asc") {
				const paceA =
					a.distance > 0 ? a.moving_time / (a.distance / 1000) : 9999;
				const paceB =
					b.distance > 0 ? b.moving_time / (b.distance / 1000) : 9999;
				return paceA - paceB;
			}
			if (sortBy === "elevation-desc") {
				return b.total_elevation_gain - a.total_elevation_gain;
			}
			return 0;
		});
	}, [rawRuns, distanceFilter, searchQuery, sortBy]);

	// Paginated runs
	const displayedRuns = useMemo(() => {
		return filteredAndSortedRuns.slice(0, visibleCount);
	}, [filteredAndSortedRuns, visibleCount]);

	const hasMore = visibleCount < filteredAndSortedRuns.length;

	// Performance Highlights Analytics
	const performanceHighlights = useMemo(() => {
		if (rawRuns.length === 0) return null;

		let maxDistance = rawRuns[0];
		let minPaceSeconds =
			rawRuns[0].distance > 0
				? rawRuns[0].moving_time / (rawRuns[0].distance / 1000)
				: 9999;
		let maxElevation = rawRuns[0];
		let totalSeconds = 0;
		let totalMeters = 0;

		for (const run of rawRuns) {
			totalSeconds += run.moving_time;
			totalMeters += run.distance;

			if (run.distance > maxDistance.distance) {
				maxDistance = run;
			}
			if (run.total_elevation_gain > maxElevation.total_elevation_gain) {
				maxElevation = run;
			}

			const paceSec =
				run.distance > 0 ? run.moving_time / (run.distance / 1000) : 9999;
			if (paceSec < minPaceSeconds) {
				minPaceSeconds = paceSec;
			}
		}

		const totalHours = Math.floor(totalSeconds / 3600);
		const totalMinutes = Math.floor((totalSeconds % 3600) / 60);

		const fastMin = Math.floor(minPaceSeconds / 60);
		const fastSec = Math.floor(minPaceSeconds % 60)
			.toString()
			.padStart(2, "0");

		return {
			maxDistanceKm: (maxDistance.distance / 1000).toFixed(1),
			fastestPace: `${fastMin}:${fastSec} /km`,
			maxElevationM: `${maxElevation.total_elevation_gain} m`,
			totalLoggedTime: `${totalHours}h ${totalMinutes}m`,
			totalLoggedKm: (totalMeters / 1000).toFixed(1),
		};
	}, [rawRuns]);

	// Average Pace from recent runs
	const avgPaceData = useMemo(() => {
		if (rawRuns.length === 0) return { paceMinutes: 5.5, formatted: "5:30" };
		const totalMeters = rawRuns.reduce((acc, run) => acc + run.distance, 0);
		const totalTimeSeconds = rawRuns.reduce(
			(acc, run) => acc + run.moving_time,
			0,
		);
		const totalKm = totalMeters / 1000;
		if (totalKm === 0) return { paceMinutes: 5.5, formatted: "5:30" };
		const paceSecondsPerKm = totalTimeSeconds / totalKm;
		const paceMinutes = paceSecondsPerKm / 60;
		const min = Math.floor(paceSecondsPerKm / 60);
		const sec = Math.round(paceSecondsPerKm % 60)
			.toString()
			.padStart(2, "0");
		return {
			paceMinutes,
			formatted: `${min}:${sec}`,
		};
	}, [rawRuns]);

	if (!mounted) return null;

	const totalRuns = stats?.all_run_totals?.count
		? stats.all_run_totals.count.toLocaleString()
		: hasRunData
			? rawRuns.length.toLocaleString()
			: "—";

	const kmPerYear = stats?.ytd_run_totals?.distance
		? Math.round(stats.ytd_run_totals.distance / 1000).toLocaleString()
		: hasRunData
			? Math.round(
					rawRuns.reduce((acc, run) => acc + run.distance, 0) / 1000,
				).toLocaleString()
			: "—";

	const hasActiveFilters =
		searchQuery.trim() !== "" ||
		distanceFilter !== "all" ||
		sortBy !== "date-desc";

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
						{rawRuns.length > 0 && (
							<motion.div
								initial={safeReduceMotion ? false : { opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
								className="flex items-center gap-4 p-5 bg-white border border-slate-200/80 rounded-[1.5rem] max-w-sm shadow-xs"
							>
								<div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
									<PaceRing
										pace={avgPaceData.paceMinutes}
										size={56}
										strokeWidth={5}
									/>
									<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
										<Zap
											className={`w-4 h-4 ${
												avgPaceData.paceMinutes < 5
													? "text-emerald-500"
													: avgPaceData.paceMinutes < 6
														? "text-blue-500"
														: avgPaceData.paceMinutes < 7
															? "text-amber-500"
															: "text-rose-500"
											}`}
										/>
									</div>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
										Average Pace
									</p>
									<p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
										{avgPaceData.formatted}{" "}
										<span className="text-xs font-bold text-slate-500">
											min/km
										</span>
									</p>
									<div className="flex items-center gap-1.5 mt-1 text-emerald-600">
										<TrendingUp className="w-3.5 h-3.5 shrink-0" />
										<span className="text-[10.5px] font-semibold text-slate-600 truncate">
											Based on {rawRuns.length} recent activities
										</span>
									</div>
								</div>
							</motion.div>
						)}
					</div>

					{/* RIGHT COLUMN: Personal Bests Showcase */}
					<div className="lg:col-span-7 space-y-6">
						<PersonalBestsSwipeCard />
					</div>
				</div>

				{/* ═══════════════════════════════════════
				    RECENT PERFORMANCE ANALYTICS HIGHLIGHTS
				═══════════════════════════════════════ */}
				{hasRunData && performanceHighlights && (
					<motion.div
						initial={safeReduceMotion ? false : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.25 }}
						className="p-6 sm:p-7 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-5"
					>
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
							<div className="flex items-center gap-2.5">
								<div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
									<Award className="w-4 h-4" />
								</div>
								<div>
									<h3 className="text-base font-extrabold text-slate-900 tracking-tight">
										Recent Activity Intel
									</h3>
									<p className="text-[11px] text-slate-500 font-medium">
										Key benchmarks across your latest {rawRuns.length} synced
										sessions
									</p>
								</div>
							</div>
							<span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 self-start sm:self-auto">
								{performanceHighlights.totalLoggedKm} km total logged
							</span>
						</div>

						{/* 4 Intel Metric Cards */}
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
							<div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs">
								<div className="flex items-center gap-1.5 text-slate-500 mb-1">
									<Route className="w-3.5 h-3.5 text-blue-600" />
									<span className="text-[10px] font-bold uppercase tracking-wider">
										Longest Run
									</span>
								</div>
								<p className="text-lg sm:text-xl font-black text-slate-900">
									{performanceHighlights.maxDistanceKm}{" "}
									<span className="text-xs font-bold text-slate-500">km</span>
								</p>
							</div>

							<div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs">
								<div className="flex items-center gap-1.5 text-slate-500 mb-1">
									<Zap className="w-3.5 h-3.5 text-amber-500" />
									<span className="text-[10px] font-bold uppercase tracking-wider">
										Fastest Pace
									</span>
								</div>
								<p className="text-lg sm:text-xl font-black text-slate-900 font-mono">
									{performanceHighlights.fastestPace}
								</p>
							</div>

							<div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs">
								<div className="flex items-center gap-1.5 text-slate-500 mb-1">
									<Mountain className="w-3.5 h-3.5 text-purple-600" />
									<span className="text-[10px] font-bold uppercase tracking-wider">
										Max Climb
									</span>
								</div>
								<p className="text-lg sm:text-xl font-black text-slate-900">
									{performanceHighlights.maxElevationM}
								</p>
							</div>

							<div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs">
								<div className="flex items-center gap-1.5 text-slate-500 mb-1">
									<Clock className="w-3.5 h-3.5 text-emerald-600" />
									<span className="text-[10px] font-bold uppercase tracking-wider">
										Total Time
									</span>
								</div>
								<p className="text-lg sm:text-xl font-black text-slate-900 font-mono">
									{performanceHighlights.totalLoggedTime}
								</p>
							</div>
						</div>
					</motion.div>
				)}

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
				    RECENT ACTIVITIES FEED & CONTROLS
				═══════════════════════════════════════ */}
				{hasRunData ? (
					<motion.div
						initial={safeReduceMotion ? false : { opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="space-y-6"
					>
						{/* Activities Section Header & Controls */}
						<div className="space-y-4">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
										<Activity className="w-5 h-5" />
									</div>
									<div>
										<h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
											Running Activities
										</h3>
										<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
											Showing {displayedRuns.length} of{" "}
											{filteredAndSortedRuns.length} matching activities
										</p>
									</div>
								</div>

								{/* Live Sync Action */}
								<div className="flex items-center gap-3 self-end sm:self-center">
									<button
										type="button"
										onClick={handleLiveSync}
										disabled={isSyncing}
										className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
										title="Sync live activities from Strava"
									>
										<RefreshCw
											className={`w-3.5 h-3.5 text-emerald-600 ${
												isSyncing ? "animate-spin" : ""
											}`}
										/>
										<span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
									</button>
								</div>
							</div>

							{/* Search, Filter Pills & Sort Row */}
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
								{/* Search Input */}
								<div className="relative max-w-xs w-full">
									<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
									<input
										type="text"
										value={searchQuery}
										onChange={(e) => handleSearchChange(e.target.value)}
										placeholder="Search runs by title or date..."
										className="w-full bg-white border border-slate-200/80 rounded-xl pl-10 pr-9 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
									/>
									{searchQuery && (
										<button
											type="button"
											onClick={() => handleSearchChange("")}
											className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
											aria-label="Clear search"
										>
											<X className="w-3.5 h-3.5" />
										</button>
									)}
								</div>

								{/* Distance Filter Pills */}
								<div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
									{DISTANCE_FILTERS.map((filter) => {
										const isActive = distanceFilter === filter.id;
										return (
											<button
												key={filter.id}
												type="button"
												onClick={() => handleFilterChange(filter.id)}
												className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
													isActive
														? "bg-slate-900 text-white shadow-xs shadow-slate-900/20"
														: "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300"
												}`}
											>
												<span>{filter.label}</span>
												<span
													className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
														isActive
															? "bg-slate-800 text-slate-200"
															: "bg-slate-100 text-slate-600"
													}`}
												>
													{distanceCounts[filter.id]}
												</span>
											</button>
										);
									})}
								</div>

								{/* Sort Selector & Reset Button */}
								<div className="flex items-center gap-2 self-end md:self-auto shrink-0">
									{hasActiveFilters && (
										<button
											type="button"
											onClick={resetFilters}
											className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all shadow-xs cursor-pointer"
											title="Reset search and filters"
										>
											<X className="w-3.5 h-3.5" />
											<span>Reset</span>
										</button>
									)}
									<div className="relative">
										<select
											value={sortBy}
											onChange={(e) =>
												handleSortChange(e.target.value as SortOption)
											}
											className="appearance-none bg-white border border-slate-200/80 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs cursor-pointer"
										>
											<option value="date-desc">Newest First</option>
											<option value="date-asc">Oldest First</option>
											<option value="distance-desc">Longest Distance</option>
											<option value="pace-asc">Fastest Pace</option>
											<option value="elevation-desc">Highest Climb</option>
										</select>
										<ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
									</div>
								</div>
							</div>
						</div>

						{/* Activities Grid */}
						{displayedRuns.length > 0 ? (
							<div className="space-y-8">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
									{displayedRuns.map((run, idx) => {
										const date = new Date(
											run.start_date_local.replace(/Z$/, ""),
										);
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

										const hasElevation =
											typeof run.total_elevation_gain === "number" &&
											run.total_elevation_gain > 0;
										const hasHeartRate = Boolean(
											run.has_heartrate &&
												run.average_heartrate &&
												run.average_heartrate > 0,
										);

										return (
											<motion.div
												key={run.id}
												initial={
													safeReduceMotion ? false : { opacity: 0, y: 15 }
												}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.04 * idx, duration: 0.35 }}
												onClick={() => setSelectedActivity(run)}
												role="button"
												tabIndex={0}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														setSelectedActivity(run);
													}
												}}
												className="p-5 sm:p-6 bg-white border border-slate-200/80 hover:border-emerald-300 rounded-2xl transition-all duration-300 group flex flex-col justify-between h-full shadow-xs hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-1 relative overflow-hidden cursor-pointer text-left focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40"
											>
												<div className="space-y-4 relative z-10">
													<div className="flex justify-between items-start gap-2">
														<div className="space-y-1">
															<p className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
																{run.name}
															</p>
															<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
																<Calendar className="w-3.5 h-3.5 text-emerald-600" />
																<span>{formattedDate}</span>
															</div>
														</div>
														<a
															href={`https://www.strava.com/activities/${run.id}`}
															target="_blank"
															rel="noopener noreferrer"
															onClick={(e) => e.stopPropagation()}
															className="p-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-slate-500 transition-all duration-200 flex items-center justify-center border border-slate-200/60 cursor-pointer shrink-0 shadow-2xs"
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
																<span className="text-sm sm:text-base font-extrabold text-slate-900">
																	{distanceKm}
																</span>
																<span className="text-[9px] font-bold text-slate-500">
																	KM
																</span>
															</div>
														</div>
														<div className="space-y-0.5 border-l border-slate-100 pl-2">
															<span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">
																Pace
															</span>
															<div className="flex items-baseline gap-0.5">
																<span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
																	{formattedPace}
																</span>
															</div>
														</div>
														<div className="space-y-0.5 border-l border-slate-100 pl-2">
															<span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">
																Duration
															</span>
															<div className="flex items-baseline gap-0.5">
																<span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
																	{formattedDuration}
																</span>
															</div>
														</div>
													</div>
												</div>

												{(hasElevation || hasHeartRate) && (
													<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between relative z-10 text-xs">
														{hasElevation && (
															<div className="flex items-center gap-1.5 text-slate-600 font-bold">
																<Mountain className="w-3.5 h-3.5 text-emerald-600" />
																<span>+{run.total_elevation_gain}m climb</span>
															</div>
														)}
														{hasHeartRate && (
															<div
																className={`flex items-center gap-1 text-slate-700 font-bold ${
																	!hasElevation ? "ml-auto" : ""
																}`}
															>
																<Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
																<span>
																	{Math.round(run.average_heartrate!)} bpm
																</span>
															</div>
														)}
													</div>
												)}
											</motion.div>
										);
									})}
								</div>

								{/* Pagination / Load More */}
								<div className="text-center pt-4">
									{hasMore ? (
										<button
											type="button"
											onClick={() =>
												setVisibleCount((prev) => prev + PAGE_SIZE)
											}
											className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 text-slate-800 hover:text-emerald-700 text-xs font-extrabold transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
										>
											<span>Load More Activities</span>
											<span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
												+{filteredAndSortedRuns.length - visibleCount} remaining
											</span>
										</button>
									) : (
										<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200/60 text-[11px] font-bold text-slate-500">
											<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
											All {filteredAndSortedRuns.length} activities loaded
										</span>
									)}
								</div>
							</div>
						) : (
							/* Empty Search / Filter State (Guideline Section 9) */
							<motion.div
								initial={safeReduceMotion ? false : { opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								className="text-center py-16 px-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs max-w-md mx-auto"
							>
								<div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
									<Sparkles className="w-6 h-6 text-emerald-600" />
								</div>
								<h3 className="text-base font-extrabold text-slate-900 mb-1">
									No matching runs found
								</h3>
								<p className="text-xs text-slate-500 font-medium mb-6">
									No running activities matched your search query or selected
									distance filter.
								</p>
								<button
									type="button"
									onClick={resetFilters}
									className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
								>
									Reset Filters
								</button>
							</motion.div>
						)}
					</motion.div>
				) : !isConnected ? (
					/* 2. Not Connected / Setup Required State */
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
				) : runsIsNull ? (
					/* 3. API Sync Error State (Guideline Section 9) */
					<motion.div
						initial={safeReduceMotion ? false : { opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="mt-12 text-center py-16 px-6 bg-white border border-amber-200/80 rounded-3xl shadow-xs max-w-md mx-auto"
					>
						<div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
							<ShieldAlert className="w-6 h-6" />
						</div>
						<h3 className="text-base font-extrabold text-slate-900 mb-1">
							Unable to Load Activities
						</h3>
						<p className="text-xs text-slate-600 font-medium mb-6 leading-relaxed">
							Temporary Strava API synchronization issue. Try refreshing in a
							moment.
						</p>
						<div className="flex items-center justify-center gap-3 flex-wrap">
							<button
								type="button"
								onClick={handleLiveSync}
								disabled={isSyncing}
								className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
							>
								<RefreshCw
									className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
								/>
								<span>{isSyncing ? "Syncing..." : "Retry Sync"}</span>
							</button>

							{oauthUrl && (
								<a
									href={oauthUrl}
									className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs !no-underline"
								>
									<Zap className="w-3.5 h-3.5" />
									<span>Reconnect Strava</span>
								</a>
							)}
						</div>
					</motion.div>
				) : hasStats && stats.all_run_totals?.count > 0 ? (
					/* 4. Activities Loading / Syncing State */
					<motion.div
						initial={safeReduceMotion ? false : { opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="mt-12 text-center py-16 px-6 bg-gradient-to-br from-emerald-50/50 to-slate-50 border border-emerald-100/80 rounded-3xl shadow-xs max-w-md mx-auto"
					>
						<div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
							<Activity className="w-6 h-6 animate-pulse" />
						</div>
						<h3 className="text-base font-extrabold text-slate-900 mb-1">
							Activities Syncing...
						</h3>
						<p className="text-xs text-slate-600 font-medium mb-4">
							Your profile shows {stats.all_run_totals.count} total runs on
							Strava. Activities are syncing.
						</p>
						<button
							type="button"
							onClick={handleLiveSync}
							disabled={isSyncing}
							className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
						>
							<RefreshCw
								className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
							/>
							<span>Sync Now</span>
						</button>
					</motion.div>
				) : (
					/* 5. Connected But No Runs Logged */
					<motion.div
						initial={safeReduceMotion ? false : { opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="mt-12 text-center py-20 bg-gradient-to-br from-emerald-50/50 to-slate-50 border border-emerald-100/80 rounded-3xl shadow-sm max-w-md mx-auto"
					>
						<div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
							<Activity className="w-6 h-6" />
						</div>
						<h3 className="text-base font-extrabold text-slate-900 mb-2">
							Connected & Ready!
						</h3>
						<p className="text-xs text-slate-600 font-medium max-w-md mx-auto mb-4 leading-relaxed">
							Your account is connected. Start running and activities will sync
							automatically.
						</p>
						<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
							<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
							Synced with Strava
						</div>
					</motion.div>
				)}
			</div>

			{/* Focused Activity Detail Modal */}
			<ActivityDetailModal
				activity={selectedActivity}
				onClose={() => setSelectedActivity(null)}
			/>
		</main>
	);
}
