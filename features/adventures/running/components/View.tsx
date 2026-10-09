"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
	Activity,
	Flame,
	Mountain,
	CheckCircle,
	ShieldAlert,
	TrendingUp,
	RefreshCw,
	Search,
	SearchX,
	X,
	Clock,
	Route,
	Gauge,
	ChevronDown,
	ChevronRight,
	ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import type {
	StravaDataResult,
	StravaRunActivity,
} from "@/services/strava/service";
import dynamic from "next/dynamic";
import PersonalBestsSwipeCard from "./PersonalBestsSwipeCard";

const ActivityDetailModal = dynamic(() => import("./ActivityDetailModal"), {
	ssr: false,
});

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

export function RunningSkeleton() {
	return (
		<main
			className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden"
			role="status"
			aria-live="polite"
			aria-label="Loading running activities"
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 space-y-6 sm:space-y-8 relative z-10">
				{/* ── Modern Floating Card Header Skeleton ── */}
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
					{/* Breadcrumb Navigation */}
					<div className="flex items-center gap-1.5 mb-4">
						<div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
						<div className="w-3.5 h-3.5 bg-slate-200 rounded animate-pulse" />
						<div className="h-3 w-14 bg-slate-200 rounded animate-pulse" />
					</div>

					<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
						{/* Title block */}
						<div className="flex-1 min-w-0 space-y-2">
							<div className="h-8 sm:h-10 w-64 sm:w-96 bg-slate-200 rounded-xl animate-pulse" />
							<div className="h-4 sm:h-5 w-full max-w-xl bg-slate-200 rounded animate-pulse" />
						</div>

						{/* Telemetry Quick Strip */}
						<div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3 sm:bg-transparent sm:border-0 sm:p-0 sm:flex sm:items-center sm:gap-5 shrink-0">
							<div className="flex flex-col items-center gap-1 px-2 sm:px-0">
								<div className="h-6 sm:h-7 w-12 bg-slate-200 rounded animate-pulse" />
								<div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
							</div>
							<div className="flex flex-col items-center gap-1 px-2 sm:px-0">
								<div className="h-6 sm:h-7 w-14 bg-slate-200 rounded animate-pulse" />
								<div className="h-2.5 w-18 bg-slate-200 rounded animate-pulse" />
							</div>
							<div className="flex flex-col items-center gap-1 px-2 sm:px-0">
								<div className="h-6 sm:h-7 w-12 bg-slate-200 rounded animate-pulse" />
								<div className="h-2.5 w-14 bg-slate-200 rounded animate-pulse" />
							</div>
						</div>
					</div>
				</div>

				{/* ── Benchmarks & Live Telemetry Arena Skeleton ── */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
					{/* LEFT COLUMN: Live Volume Telemetry & Intel */}
					<div className="lg:col-span-5">
						<div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs h-full flex flex-col justify-between gap-4 animate-pulse">
							<div className="space-y-4">
								{/* Card Header */}
								<div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
									<div className="flex items-center gap-2.5">
										<div className="w-8 h-8 rounded-xl bg-slate-200 shrink-0" />
										<div className="space-y-1">
											<div className="h-4 w-32 bg-slate-200 rounded" />
											<div className="h-3 w-44 bg-slate-200 rounded" />
										</div>
									</div>
									<div className="h-6 w-24 rounded-full bg-slate-200 shrink-0" />
								</div>

								{/* Volume Metrics 2-Col Box */}
								<div className="grid grid-cols-2 divide-x divide-slate-100 py-2 bg-slate-50/80 border border-slate-200/70 rounded-2xl">
									<div className="flex flex-col items-center gap-1 px-3 py-1">
										<div className="h-7 w-16 bg-slate-200 rounded" />
										<div className="h-2.5 w-20 bg-slate-200 rounded" />
									</div>
									<div className="flex flex-col items-center gap-1 px-3 py-1">
										<div className="h-7 w-16 bg-slate-200 rounded" />
										<div className="h-2.5 w-20 bg-slate-200 rounded" />
									</div>
								</div>

								{/* Average Pace Row */}
								<div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
									<div className="w-12 h-12 rounded-full border-4 border-slate-200 shrink-0" />
									<div className="flex-1 min-w-0 flex items-center justify-between gap-3">
										<div className="space-y-1">
											<div className="h-2.5 w-20 bg-slate-200 rounded" />
											<div className="h-3 w-28 bg-slate-200 rounded" />
										</div>
										<div className="space-y-1 text-right">
											<div className="h-6 w-14 bg-slate-200 rounded ml-auto" />
											<div className="h-2.5 w-10 bg-slate-200 rounded ml-auto" />
										</div>
									</div>
								</div>

								{/* 4 Intel Metric Tiles (2x2 Grid) */}
								<div className="grid grid-cols-2 gap-2.5">
									{[1, 2, 3, 4].map((tile) => (
										<div
											key={tile}
											className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5"
										>
											<div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
											<div className="space-y-1 flex-1">
												<div className="h-2.5 w-14 bg-slate-200 rounded" />
												<div className="h-3.5 w-16 bg-slate-200 rounded" />
											</div>
										</div>
									))}
								</div>

								{/* Distance Distribution */}
								<div className="space-y-2 pt-1">
									<div className="flex justify-between">
										<div className="h-2.5 w-28 bg-slate-200 rounded" />
										<div className="h-2.5 w-12 bg-slate-200 rounded" />
									</div>
									<div className="space-y-1.5">
										{[1, 2, 3, 4].map((bar) => (
											<div key={bar} className="flex items-center gap-2">
												<div className="h-2.5 w-8 bg-slate-200 rounded" />
												<div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
													<div className="h-full bg-slate-200 rounded-full w-1/2" />
												</div>
												<div className="h-2.5 w-4 bg-slate-200 rounded" />
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Status indicator footer */}
							<div className="pt-3 border-t border-slate-100 flex items-center justify-between">
								<div className="h-3 w-28 bg-slate-200 rounded" />
								<div className="h-3 w-24 bg-slate-200 rounded" />
							</div>
						</div>
					</div>

					{/* RIGHT COLUMN: Personal Bests Showcase Skeleton */}
					<div className="lg:col-span-7">
						<div className="w-full h-full bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between animate-pulse min-h-[380px]">
							{/* Header & Controls */}
							<div className="flex items-center justify-between pb-4 border-b border-slate-100">
								<div className="flex items-center gap-3">
									<div className="w-11 h-11 rounded-2xl bg-slate-200 shrink-0" />
									<div className="space-y-1">
										<div className="h-4 w-28 bg-slate-200 rounded" />
										<div className="h-3 w-40 bg-slate-200 rounded" />
									</div>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-8 w-16 bg-slate-100 rounded-xl" />
									<div className="w-8 h-8 bg-slate-100 rounded-xl" />
								</div>
							</div>

							{/* Milestone Selector */}
							<div className="py-4">
								<div className="flex items-center justify-between pb-2 border-b border-slate-100">
									{[1, 2, 3, 4, 5].map((m) => (
										<div key={m} className="h-4 w-12 bg-slate-200 rounded" />
									))}
								</div>
							</div>

							{/* Record display */}
							<div className="flex flex-col items-center justify-center my-6 space-y-3">
								<div className="h-12 sm:h-14 w-48 sm:w-56 bg-slate-200 rounded-2xl" />
								<div className="h-5 w-24 bg-slate-200 rounded-md" />
							</div>

							{/* 3-metric strip */}
							<div className="grid grid-cols-3 divide-x divide-slate-100 pt-4 border-t border-slate-100">
								{[1, 2, 3].map((s) => (
									<div
										key={s}
										className="flex flex-col items-center gap-1.5 px-2"
									>
										<div className="w-5 h-5 rounded-full bg-slate-200" />
										<div className="h-2.5 w-10 bg-slate-200 rounded" />
										<div className="h-4 w-14 bg-slate-200 rounded" />
									</div>
								))}
							</div>

							{/* Footer */}
							<div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100">
								<div className="h-3 w-36 bg-slate-200 rounded" />
								<div className="h-5 w-24 bg-slate-200 rounded-md" />
							</div>
						</div>
					</div>
				</div>

				{/* ── Recent Activities Feed & Controls Skeleton ── */}
				<div className="space-y-5">
					{/* Activities Toolbar */}
					<div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-slate-200 animate-pulse shrink-0" />
								<div className="space-y-1">
									<div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
									<div className="h-2.5 w-24 bg-slate-200 rounded animate-pulse" />
								</div>
							</div>
							<div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse" />
						</div>

						{/* Search + Filter + Sort row */}
						<div className="border-t border-slate-100 pt-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
							<div className="h-9 w-full lg:max-w-xs bg-slate-100 rounded-xl animate-pulse" />
							<div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
								{[1, 2, 3, 4, 5].map((f) => (
									<div
										key={f}
										className="h-8 w-20 rounded-xl bg-slate-100 border border-slate-200/60 animate-pulse shrink-0"
									/>
								))}
							</div>
							<div className="h-9 w-32 bg-slate-100 rounded-xl animate-pulse" />
						</div>
					</div>

					{/* Activities Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
						{[1, 2, 3, 4, 5, 6].map((card) => (
							<div
								key={card}
								className="p-5 sm:p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col justify-between h-[210px] animate-pulse"
							>
								<div>
									{/* Top Header */}
									<div className="flex items-start justify-between gap-3 mb-4">
										<div className="flex items-center gap-3 min-w-0">
											<div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
											<div className="space-y-1 min-w-0">
												<div className="h-4 w-32 bg-slate-200 rounded" />
												<div className="h-3 w-20 bg-slate-200 rounded" />
											</div>
										</div>
										<div className="w-7 h-7 rounded-lg bg-slate-100 shrink-0" />
									</div>

									{/* 3-Metric Recessed Instrument Tray */}
									<div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 grid grid-cols-3 divide-x divide-slate-200/60">
										<div className="pr-2.5 space-y-1">
											<div className="h-2 w-10 bg-slate-200 rounded" />
											<div className="h-5 w-12 bg-slate-200 rounded" />
										</div>
										<div className="px-2.5 space-y-1">
											<div className="h-2 w-8 bg-slate-200 rounded" />
											<div className="h-5 w-12 bg-slate-200 rounded" />
										</div>
										<div className="pl-2.5 space-y-1">
											<div className="h-2 w-12 bg-slate-200 rounded" />
											<div className="h-5 w-14 bg-slate-200 rounded" />
										</div>
									</div>
								</div>

								{/* Bottom Context Strip */}
								<div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="h-5 w-14 rounded-lg bg-slate-100" />
										<div className="h-5 w-16 rounded-lg bg-slate-100" />
									</div>
									<div className="h-4 w-12 rounded bg-slate-100" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}

export default function RunningView({
	initialData,
	isAdmin = false,
	isLoading = false,
}: {
	initialData?: StravaDataResult;
	isAdmin?: boolean;
	isLoading?: boolean;
}) {
	if (isLoading) {
		return <RunningSkeleton />;
	}

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
	const safeReduceMotion = Boolean(reduceMotion);
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

	// Deep link auto-open when URL has ?activity=<id>
	useEffect(() => {
		if (!mounted) return;
		const activityId = searchParams.get("activity");
		if (activityId && rawRuns.length > 0) {
			const found = rawRuns.find((r) => String(r.id) === String(activityId));
			if (found) {
				setSelectedActivity(found);
			}
		}
	}, [searchParams, mounted, rawRuns]);

	const handleOpenActivity = (run: StravaRunActivity) => {
		setSelectedActivity(run);
		if (typeof window !== "undefined") {
			const url = new URL(window.location.href);
			url.searchParams.set("activity", String(run.id));
			window.history.replaceState({}, "", url.toString());
		}
	};

	const handleCloseActivity = () => {
		setSelectedActivity(null);
		if (typeof window !== "undefined") {
			const url = new URL(window.location.href);
			url.searchParams.delete("activity");
			const newUrl = url.pathname + (url.search ? url.search : "");
			window.history.replaceState({}, "", newUrl);
		}
	};

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

	const totalRuns = stats?.all_run_totals?.count
		? stats.all_run_totals.count.toLocaleString("en-US")
		: hasRunData
			? rawRuns.length.toLocaleString("en-US")
			: "—";

	const kmPerYear = stats?.ytd_run_totals?.distance
		? Math.round(stats.ytd_run_totals.distance / 1000).toLocaleString("en-US")
		: hasRunData
			? Math.round(
					rawRuns.reduce((acc, run) => acc + run.distance, 0) / 1000,
				).toLocaleString("en-US")
			: "—";

	const hasActiveFilters =
		searchQuery.trim() !== "" ||
		distanceFilter !== "all" ||
		sortBy !== "date-desc";

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 space-y-6 sm:space-y-8 relative z-10">
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

				{/* ── Modern Floating Card Header Standard ── */}
				<motion.div
					initial={safeReduceMotion ? false : { opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs"
				>
					{/* Breadcrumb Navigation */}
					<nav className="flex items-center gap-1.5 mb-4 text-xs font-semibold text-slate-400">
						<Link
							href="/adventures"
							className="hover:text-slate-700 transition-colors !no-underline"
						>
							Adventures
						</Link>
						<ChevronRight className="w-3.5 h-3.5 shrink-0" />
						<span className="text-slate-700">Running</span>
					</nav>

					<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
						{/* Title block */}
						<div className="flex-1 min-w-0">
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
								Running Performance
							</h1>
							<p className="text-sm sm:text-base text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
								Tracking physical limits and mental discipline. Live Strava
								telemetry, race benchmarks, and split pacing analytics.
							</p>
						</div>

						{/* Telemetry Quick Strip (Responsive: full-width 3-stat box on mobile, row on desktop) */}
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 shrink-0">
							<div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3 sm:bg-transparent sm:border-0 sm:p-0 sm:flex sm:items-center sm:gap-5">
								<div className="text-center px-2 sm:px-0">
									<p className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums font-mono">
										{totalRuns}
									</p>
									<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5 truncate">
										Total Runs
									</p>
								</div>
								<div className="text-center px-2 sm:px-0">
									<p className="text-xl sm:text-2xl font-extrabold text-emerald-600 tabular-nums font-mono">
										{kmPerYear}
									</p>
									<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5 truncate">
										KM This Year
									</p>
								</div>
								<div className="text-center px-2 sm:px-0">
									<p className="text-xl sm:text-2xl font-extrabold text-teal-600 tabular-nums font-mono">
										{avgPaceData.formatted}
									</p>
									<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5 truncate">
										Avg /km
									</p>
								</div>
							</div>

							{isAdmin && isConnected && (
								<div className="flex items-center justify-end sm:border-l sm:border-slate-100 sm:pl-4">
									<button
										type="button"
										onClick={handleLiveSync}
										disabled={isSyncing}
										className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
									>
										<RefreshCw
											className={`w-3.5 h-3.5 text-emerald-600 ${
												isSyncing ? "animate-spin" : ""
											}`}
										/>
										<span>{isSyncing ? "Syncing..." : "Sync"}</span>
									</button>
								</div>
							)}
						</div>
					</div>
				</motion.div>

				{/* ═══════════════════════════════════════
				    BENCHMARKS & LIVE TELEMETRY ARENA
				═══════════════════════════════════════ */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
					{/* LEFT COLUMN: Live Volume Telemetry & Intel */}
					<div className="lg:col-span-5">
						<motion.div
							initial={safeReduceMotion ? false : { opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs h-full flex flex-col justify-between gap-4"
						>
							<div className="space-y-4">
								{/* Card Header */}
								<div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
									<div className="flex items-center gap-2.5">
										<div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
											<Activity className="w-4 h-4" />
										</div>
										<div>
											<h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
												Training Load & Intel
											</h3>
											<p className="text-[10.5px] text-slate-500 font-medium">
												Live endurance load & session benchmarks
											</p>
										</div>
									</div>
									<span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
										<span className="relative flex h-2 w-2">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
											<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
										</span>
										Live Telemetry
									</span>
								</div>

								{/* Volume Metrics 2-Col Box */}
								<div className="grid grid-cols-2 divide-x divide-slate-100 py-1 bg-slate-50/80 border border-slate-200/70 rounded-2xl">
									<div className="text-center px-3 py-2 group">
										<p className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">
											{totalRuns}
										</p>
										<p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
											Total Activities
										</p>
									</div>
									<div className="text-center px-3 py-2 group">
										<p className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">
											{kmPerYear}
										</p>
										<p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
											KM This Year
										</p>
									</div>
								</div>

								{/* Live Average Pace Row */}
								{rawRuns.length > 0 && (
									<div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
										<div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
											<PaceRing
												pace={avgPaceData.paceMinutes}
												size={48}
												strokeWidth={4.5}
											/>
											<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
												<Gauge
													className={`w-3.5 h-3.5 ${
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
										<div className="flex-1 min-w-0 flex items-center justify-between gap-3">
											<div className="min-w-0">
												<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
													Average Pace
												</p>
												<div className="flex items-center gap-1.5 mt-0.5 text-emerald-600">
													<TrendingUp className="w-3 h-3 shrink-0" />
													<span className="text-[11px] font-semibold text-slate-600 truncate">
														Across {rawRuns.length} recent runs
													</span>
												</div>
											</div>
											<div className="text-right shrink-0">
												<p className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight">
													{avgPaceData.formatted}
												</p>
												<span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
													min/km
												</span>
											</div>
										</div>
									</div>
								)}

								{/* 4 Intel Metric Tiles (2x2 Grid) */}
								{performanceHighlights && (
									<div className="grid grid-cols-2 gap-2.5">
										<div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5">
											<div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
												<Route className="w-4 h-4" />
											</div>
											<div className="min-w-0">
												<p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate">
													Longest Run
												</p>
												<p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate font-mono">
													{performanceHighlights.maxDistanceKm} km
												</p>
											</div>
										</div>

										<div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5">
											<div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
												<Gauge className="w-4 h-4" />
											</div>
											<div className="min-w-0">
												<p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate">
													Fastest Pace
												</p>
												<p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate font-mono">
													{performanceHighlights.fastestPace}
												</p>
											</div>
										</div>

										<div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5">
											<div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
												<Mountain className="w-4 h-4" />
											</div>
											<div className="min-w-0">
												<p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate">
													Max Climb
												</p>
												<p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate font-mono">
													{performanceHighlights.maxElevationM}
												</p>
											</div>
										</div>

										<div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5">
											<div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
												<Clock className="w-4 h-4" />
											</div>
											<div className="min-w-0">
												<p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate">
													Total Time
												</p>
												<p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate font-mono">
													{performanceHighlights.totalLoggedTime}
												</p>
											</div>
										</div>
									</div>
								)}

								{/* Distance Distribution — proportional bar chart */}
								<div className="pt-2">
									<div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
										<span>Distance Distribution</span>
										<span className="text-slate-600 font-mono">
											{rawRuns.length} runs
										</span>
									</div>
									<div className="space-y-1.5">
										{(
											[
												{
													label: "<5K",
													key: "short" as const,
													color: "bg-blue-400",
												},
												{
													label: "5-10K",
													key: "mid" as const,
													color: "bg-emerald-400",
												},
												{
													label: "10-21K",
													key: "long" as const,
													color: "bg-amber-400",
												},
												{
													label: ">21K",
													key: "ultra" as const,
													color: "bg-rose-400",
												},
											] as const
										).map((cat) => {
											const pct =
												rawRuns.length > 0
													? Math.round(
															(distanceCounts[cat.key] / rawRuns.length) * 100,
														)
													: 0;
											return (
												<div key={cat.key} className="flex items-center gap-2">
													<span className="text-[9px] font-bold text-slate-400 w-8 shrink-0 text-right tabular-nums">
														{cat.label}
													</span>
													<div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
														<motion.div
															className={`h-full rounded-full ${cat.color}`}
															initial={{ width: 0 }}
															animate={{ width: `${pct}%` }}
															transition={{
																duration: 0.8,
																ease: "easeOut",
																delay: 0.2,
															}}
														/>
													</div>
													<span className="text-[9px] font-black text-slate-600 w-5 tabular-nums">
														{distanceCounts[cat.key]}
													</span>
												</div>
											);
										})}
									</div>
								</div>
							</div>

							{/* Status indicator footer */}
							<div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
								<div className="flex items-center gap-1.5">
									<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
									<span className="text-xs font-semibold text-slate-700">
										Strava Synchronized
									</span>
								</div>
								<span className="text-[10px] font-mono text-slate-400">
									Pacing Engine v2
								</span>
							</div>
						</motion.div>
					</div>

					{/* RIGHT COLUMN: Personal Bests Showcase */}
					<div className="lg:col-span-7">
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
								<Activity className="w-4 h-4" />
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
							className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:-translate-y-0.5 active:scale-95 transition-[background-color,transform,box-shadow] duration-200 shrink-0 shadow-md !no-underline relative z-10"
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
						className="space-y-5"
					>
						{/* Activities Section Header & Controls — floating card toolbar */}
						<div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
										<Activity className="w-4 h-4" />
									</div>
									<div>
										<h3 className="text-base font-extrabold text-slate-900 tracking-tight">
											Running Activities
										</h3>
										<p className="text-[10px] font-semibold text-slate-400">
											Showing {displayedRuns.length} of{" "}
											{filteredAndSortedRuns.length} activities
										</p>
									</div>
								</div>

								<button
									type="button"
									onClick={handleLiveSync}
									disabled={isSyncing}
									className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer self-start sm:self-auto"
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

							{/* Search + Filter + Sort row */}
							<div className="border-t border-slate-100 pt-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
								<div className="relative w-full lg:max-w-xs">
									<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
									<input
										type="text"
										value={searchQuery}
										onChange={(e) => handleSearchChange(e.target.value)}
										placeholder="Search runs by title or date..."
										className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-10 pr-9 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-[border-color,box-shadow]"
									/>
									{searchQuery && (
										<button
											type="button"
											onClick={() => handleSearchChange("")}
											className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
											aria-label="Clear search"
										>
											<X className="w-3.5 h-3.5" />
										</button>
									)}
								</div>

								<div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-1 px-1 touch-pan-x">
									{DISTANCE_FILTERS.map((filter) => {
										const isActive = distanceFilter === filter.id;
										return (
											<button
												key={filter.id}
												type="button"
												onClick={() => handleFilterChange(filter.id)}
												className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap cursor-pointer shrink-0 touch-manipulation ${
													isActive
														? "bg-emerald-600 text-white shadow-xs"
														: "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100"
												}`}
											>
												<span>{filter.label}</span>
												<span
													className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
														isActive
															? "bg-emerald-500 text-white"
															: "bg-slate-200/70 text-slate-600"
													}`}
												>
													{distanceCounts[filter.id]}
												</span>
											</button>
										);
									})}
								</div>

								<div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
									{hasActiveFilters && (
										<button
											type="button"
											onClick={resetFilters}
											className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all active:scale-95 shadow-xs cursor-pointer"
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
											className="appearance-none bg-white border border-slate-200/80 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-[border-color,box-shadow] shadow-xs cursor-pointer"
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
												onClick={() => handleOpenActivity(run)}
												role="button"
												tabIndex={0}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														handleOpenActivity(run);
													}
												}}
												className="p-5 sm:p-6 bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl transition-all duration-300 group flex flex-col justify-between h-full shadow-xs hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 relative overflow-hidden cursor-pointer text-left focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 active:scale-[0.99]"
											>
												{/* Top Header: Icon + Title & Date + Arrow button */}
												<div>
													<div className="flex items-start justify-between gap-3 mb-4">
														<div className="flex items-center gap-3 min-w-0">
															<div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-500 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-600 transition-colors shrink-0 shadow-2xs">
																{hasElevation &&
																run.total_elevation_gain > 50 ? (
																	<Mountain className="w-4 h-4" />
																) : (
																	<Route className="w-4 h-4" />
																)}
															</div>
															<div className="min-w-0">
																<p className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors leading-snug">
																	{run.name}
																</p>
																<p className="text-[11px] font-medium text-slate-400 tabular-nums">
																	{formattedDate}
																</p>
															</div>
														</div>

														<div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all flex items-center justify-center shrink-0">
															<ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
														</div>
													</div>

													{/* 3-Metric Recessed Instrument Tray (NO truncation, high contrast numbers) */}
													<div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 grid grid-cols-3 divide-x divide-slate-200/60 group-hover:bg-slate-50 transition-colors">
														{/* Distance */}
														<div className="pr-2.5 sm:pr-3 space-y-0.5 min-w-0">
															<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block truncate">
																Distance
															</span>
															<div className="flex items-baseline gap-0.5">
																<span className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums font-mono leading-none">
																	{distanceKm}
																</span>
																<span className="text-[10px] font-bold text-slate-400">
																	km
																</span>
															</div>
														</div>

														{/* Pace */}
														<div className="px-2.5 sm:px-3 space-y-0.5 min-w-0">
															<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block truncate">
																Pace
															</span>
															<div className="flex items-baseline gap-0.5">
																<span className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums font-mono leading-none">
																	{run.distance > 0
																		? `${paceMin}:${paceSec}`
																		: "—"}
																</span>
																<span className="text-[10px] font-bold text-slate-400">
																	/km
																</span>
															</div>
														</div>

														{/* Duration */}
														<div className="pl-2.5 sm:pl-3 space-y-0.5 min-w-0">
															<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block truncate">
																Duration
															</span>
															<div className="flex items-baseline">
																<span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums font-mono leading-none truncate">
																	{formattedDuration}
																</span>
															</div>
														</div>
													</div>
												</div>

												{/* Bottom Context Strip */}
												<div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
													<div className="flex items-center gap-2 flex-wrap min-w-0">
														{hasElevation ? (
															<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50/80 border border-emerald-100/80 text-[10px] font-bold text-emerald-700">
																<Mountain className="w-3 h-3 text-emerald-600 shrink-0" />
																<span>+{run.total_elevation_gain}m</span>
															</span>
														) : (
															<span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100/80 text-[10px] font-bold text-slate-500">
																Road
															</span>
														)}

														{hasHeartRate && (
															<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-50/80 border border-rose-100/80 text-[10px] font-bold text-rose-700">
																<Flame className="w-3 h-3 text-rose-500 shrink-0" />
																<span>
																	{Math.round(run.average_heartrate!)} bpm
																</span>
															</span>
														)}
													</div>

													<span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-wider shrink-0">
														{paceMin < 5
															? "Fast"
															: paceMin < 6
																? "Tempo"
																: "Steady"}
													</span>
												</div>
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
											className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 text-slate-800 hover:text-emerald-700 text-xs font-extrabold transition-[border-color,color,box-shadow,transform] shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
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
									<SearchX className="w-6 h-6 text-slate-400" />
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
									className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-[background-color,transform] active:scale-95 shadow-xs cursor-pointer"
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
							<Activity className="w-10 h-10 text-slate-400" />
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
								className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-[background-color,transform,box-shadow] duration-200 !no-underline"
							>
								<Activity className="w-4 h-4" />
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
								className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-[background-color,transform] active:scale-95 shadow-xs cursor-pointer"
							>
								<RefreshCw
									className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
								/>
								<span>{isSyncing ? "Syncing..." : "Retry Sync"}</span>
							</button>

							{oauthUrl && (
								<a
									href={oauthUrl}
									className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-[background-color,transform] active:scale-95 shadow-xs !no-underline"
								>
									<Activity className="w-3.5 h-3.5" />
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
						className="mt-12 text-center py-16 px-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs max-w-md mx-auto"
					>
						<div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
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
							className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-[background-color,transform] active:scale-95 cursor-pointer"
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
						className="mt-12 text-center py-20 bg-white border border-slate-200/80 rounded-3xl shadow-xs max-w-md mx-auto"
					>
						<div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
							<Activity className="w-6 h-6" />
						</div>
						<h3 className="text-base font-extrabold text-slate-900 mb-2">
							Connected & Ready!
						</h3>
						<p className="text-xs text-slate-600 font-medium max-w-md mx-auto mb-4 leading-relaxed">
							Your account is connected. Start running and activities will sync
							automatically.
						</p>
						<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
							<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
							<span>Synced with Strava</span>
						</div>
					</motion.div>
				)}
			</div>

			{/* Focused Activity Detail Modal */}
			<ActivityDetailModal
				activity={selectedActivity}
				onClose={handleCloseActivity}
			/>
		</main>
	);
}
