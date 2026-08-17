"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
	Trophy,
	RefreshCw,
	ChevronRight,
	AlertCircle,
	History,
	Sparkles,
	Clock,
} from "lucide-react";
import Link from "next/link";
import { getLiverpoolFixtures } from "../actions";
import type { LfcFixtureResponse, VenueFilter } from "../types";
import { formatMatchDate, isLiverpoolHome } from "../utils";
import NextMatchHero from "./NextMatchHero";
import FixtureCard from "./FixtureCard";
import PlayedCard from "./PlayedCard";
import FixtureFilters from "./FixtureFilters";
import FixtureSkeleton from "./FixtureSkeleton";

type ActiveTab = "upcoming" | "played";

export default function LiverpoolView() {
	const [activeTab, setActiveTab] = useState<ActiveTab>("upcoming");
	const [upcomingFixtures, setUpcomingFixtures] = useState<
		LfcFixtureResponse[]
	>([]);
	const [playedFixtures, setPlayedFixtures] = useState<LfcFixtureResponse[]>(
		[],
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Filters
	const [search, setSearch] = useState("");
	const [selectedCompetition, setSelectedCompetition] = useState("all");
	const [venue, setVenue] = useState<VenueFilter>("all");
	const [selectedMonth, setSelectedMonth] = useState("all");

	const fetchFixtures = useCallback(async (refresh = false) => {
		if (refresh) {
			setIsRefreshing(true);
		} else {
			setIsLoading(true);
		}
		setError(null);

		try {
			const res = await getLiverpoolFixtures(2026);
			const upcoming = Array.isArray(res?.upcoming)
				? res.upcoming
				: Array.isArray(
							(res as unknown as { fixtures?: LfcFixtureResponse[] })?.fixtures,
						)
					? (res as unknown as { fixtures: LfcFixtureResponse[] }).fixtures
					: [];
			const played = Array.isArray(res?.played) ? res.played : [];

			if (res?.error && upcoming.length === 0 && played.length === 0) {
				setError(res.error);
			} else {
				setUpcomingFixtures(upcoming);
				setPlayedFixtures(played);
				setLastUpdated(res?.lastUpdated || new Date().toISOString());
			}
		} catch (err) {
			console.error("Failed to load Liverpool fixtures:", err);
			setError("Failed to synchronize with Liverpool FC API");
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, []);

	useEffect(() => {
		fetchFixtures();
	}, [fetchFixtures]);

	// Current dataset based on active tab
	const currentDataset = useMemo(() => {
		const list = activeTab === "upcoming" ? upcomingFixtures : playedFixtures;
		return Array.isArray(list) ? list : [];
	}, [activeTab, upcomingFixtures, playedFixtures]);

	// Extract unique competitions for the active tab dataset
	const competitions = useMemo(() => {
		const set = new Set<string>();
		(currentDataset || []).forEach((f) => {
			if (f?.matchData?.competition?.displayName) {
				set.add(f.matchData.competition.displayName);
			}
		});
		return Array.from(set);
	}, [currentDataset]);

	// Extract unique months with counts for the active tab dataset
	const months = useMemo(() => {
		const monthMap = new Map<string, { label: string; count: number }>();
		(currentDataset || []).forEach((f) => {
			const info = formatMatchDate(f?.matchData?.date || "");
			if (info.monthKey !== "Unknown") {
				const existing = monthMap.get(info.monthKey);
				if (existing) {
					existing.count += 1;
				} else {
					monthMap.set(info.monthKey, {
						label: info.monthName,
						count: 1,
					});
				}
			}
		});
		return Array.from(monthMap.entries()).map(([key, value]) => ({
			key,
			label: value.label,
			count: value.count,
		}));
	}, [currentDataset]);

	// Filtered fixtures for current dataset
	const filteredFixtures = useMemo(() => {
		return currentDataset.filter((f) => {
			const match = f.matchData;
			if (!match) return false;

			// Venue Filter
			const isHome = isLiverpoolHome(match.homeTeam);
			if (venue === "home" && !isHome) return false;
			if (venue === "away" && isHome) return false;

			// Competition Filter
			if (
				selectedCompetition !== "all" &&
				match.competition?.displayName !== selectedCompetition
			) {
				return false;
			}

			// Month Filter
			if (selectedMonth !== "all") {
				const dateInfo = formatMatchDate(match.date);
				if (dateInfo.monthKey !== selectedMonth) return false;
			}

			// Search Filter (Opponent, Stadium, Title)
			if (search.trim()) {
				const q = search.toLowerCase().trim();
				const home = (match.homeTeam || "").toLowerCase();
				const away = (match.awayTeam || "").toLowerCase();
				const stadium = (match.stadium || "").toLowerCase();
				const title = (f.title || "").toLowerCase();
				const comp = (match.competition?.displayName || "").toLowerCase();

				const matchesSearch =
					home.includes(q) ||
					away.includes(q) ||
					stadium.includes(q) ||
					title.includes(q) ||
					comp.includes(q);

				if (!matchesSearch) return false;
			}

			return true;
		});
	}, [currentDataset, venue, selectedCompetition, selectedMonth, search]);

	// Next upcoming match (first item in upcoming list)
	const nextMatch = useMemo(() => {
		return upcomingFixtures.length > 0 ? upcomingFixtures[0] : null;
	}, [upcomingFixtures]);

	// Group filtered fixtures by month
	const groupedByMonth = useMemo(() => {
		const groups = new Map<
			string,
			{ monthName: string; list: LfcFixtureResponse[] }
		>();

		filteredFixtures.forEach((f) => {
			const info = formatMatchDate(f.matchData?.date || "");
			const key = info.monthKey;
			if (!groups.has(key)) {
				groups.set(key, {
					monthName: info.monthName,
					list: [],
				});
			}
			groups.get(key)!.list.push(f);
		});

		return Array.from(groups.entries()).map(([key, val]) => ({
			monthKey: key,
			monthName: val.monthName,
			fixtures: val.list,
		}));
	}, [filteredFixtures]);

	// Stats Calculation
	const stats = useMemo(() => {
		const totalUpcoming = upcomingFixtures.length;
		const totalPlayed = playedFixtures.length;
		const anfieldUpcoming = upcomingFixtures.filter((f) =>
			isLiverpoolHome(f.matchData?.homeTeam),
		).length;

		return { totalUpcoming, totalPlayed, anfieldUpcoming };
	}, [upcomingFixtures, playedFixtures]);

	const handleTabChange = (tab: ActiveTab) => {
		setActiveTab(tab);
		setSelectedCompetition("all");
		setVenue("all");
		setSelectedMonth("all");
		setSearch("");
	};

	return (
		<main className="min-h-screen bg-slate-50/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-32 sm:pb-36">
			{/* Hero Top Banner Section */}
			<section className="relative overflow-hidden bg-gradient-to-b from-red-950/25 via-slate-900/5 to-transparent pt-12 pb-6 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto space-y-6">
					{/* Navigation Breadcrumb & Live Refresh */}
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
							<Link
								href="/"
								className="hover:text-slate-800 dark:hover:text-white transition-colors"
							>
								Home
							</Link>
							<ChevronRight className="w-3.5 h-3.5" />
							<span className="text-slate-400">Insights</span>
							<ChevronRight className="w-3.5 h-3.5" />
							<span className="text-red-600 dark:text-red-400 font-bold">
								Liverpool FC
							</span>
						</div>

						{/* Live Sync Status & Refresh Button */}
						<div className="flex items-center gap-3">
							{lastUpdated && (
								<span className="text-[11px] font-medium text-slate-400 hidden sm:inline-block">
									Synced: {new Date(lastUpdated).toLocaleTimeString()}
								</span>
							)}
							<button
								onClick={() => fetchFixtures(true)}
								disabled={isLoading || isRefreshing}
								className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
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

					{/* Title and Stats Row */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
						<div className="space-y-2">
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20">
								<Trophy className="w-3.5 h-3.5" />
								<span>2026/27 Season Hub</span>
							</div>
							<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
								Liverpool FC <span className="text-red-600">Fixtures</span>
							</h1>
							<p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
								Official upcoming match schedule, kickoff times in local
								timezone, stadium venues, and TV broadcasters. You'll Never Walk
								Alone.
							</p>
						</div>

						{/* Quick Stats Metric Cards */}
						<div className="grid grid-cols-3 gap-2 sm:gap-3 bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm shrink-0">
							<div className="text-center px-3 py-1">
								<span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white block">
									{stats.totalUpcoming}
								</span>
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
									Upcoming
								</span>
							</div>
							<div className="text-center px-3 py-1 border-l border-slate-200 dark:border-slate-800">
								<span className="text-xl sm:text-2xl font-extrabold text-red-600 dark:text-red-400 block">
									{stats.anfieldUpcoming}
								</span>
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
									Anfield
								</span>
							</div>
							<div className="text-center px-3 py-1 border-l border-slate-200 dark:border-slate-800">
								<span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
									{stats.totalPlayed}
								</span>
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
									Played
								</span>
							</div>
						</div>
					</div>

					{/* Primary Navigation Tabs: Upcoming vs Played Results */}
					<div className="pt-2">
						<div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800">
							<button
								onClick={() => handleTabChange("upcoming")}
								className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
									activeTab === "upcoming"
										? "bg-red-600 text-white shadow-md shadow-red-600/30"
										: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
								}`}
							>
								<Clock className="w-4 h-4" />
								<span>Upcoming Matches ({upcomingFixtures.length})</span>
							</button>
							<button
								onClick={() => handleTabChange("played")}
								className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
									activeTab === "played"
										? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
										: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
								}`}
							>
								<History className="w-4 h-4" />
								<span>Played Results ({playedFixtures.length})</span>
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* Main Content Area */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 mt-4">
				{isLoading ? (
					<FixtureSkeleton />
				) : error ? (
					<div className="rounded-3xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-slate-900 p-8 text-center space-y-4 shadow-sm">
						<AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
						<div className="space-y-1">
							<h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
								Unable to synchronize fixtures
							</h3>
							<p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
								{error}
							</p>
						</div>
						<button
							onClick={() => fetchFixtures()}
							className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
						>
							Retry Synchronization
						</button>
					</div>
				) : (
					<>
						{/* Active Tab: Upcoming Fixtures */}
						{activeTab === "upcoming" && (
							<>
								{/* Next Match Hero Section */}
								{nextMatch && (
									<section className="space-y-3">
										<div className="flex items-center justify-between">
											<h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
												Immediate Next Match
											</h2>
										</div>
										<NextMatchHero fixture={nextMatch} />
									</section>
								)}

								{/* Filters Section */}
								<section className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
									<div className="flex items-center justify-between">
										<h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
											Upcoming Schedule
										</h2>
										<span className="text-xs font-bold text-slate-500">
											Showing {filteredFixtures.length} of{" "}
											{upcomingFixtures.length} matches
										</span>
									</div>

									<FixtureFilters
										search={search}
										onSearchChange={setSearch}
										selectedCompetition={selectedCompetition}
										onCompetitionChange={setSelectedCompetition}
										competitions={competitions}
										venue={venue}
										onVenueChange={setVenue}
										selectedMonth={selectedMonth}
										onMonthChange={setSelectedMonth}
										months={months}
										totalCount={upcomingFixtures.length}
									/>
								</section>

								{/* Upcoming Fixtures Grid Grouped by Month */}
								{filteredFixtures.length === 0 ? (
									<div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3 shadow-sm">
										<Sparkles className="w-10 h-10 text-red-500 mx-auto" />
										<h3 className="text-base font-extrabold text-slate-900 dark:text-white">
											No matching upcoming fixtures
										</h3>
										<p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
											No upcoming matches match your current filters. Try
											adjusting the competition, venue, or search term.
										</p>
										<button
											onClick={() => {
												setSearch("");
												setSelectedCompetition("all");
												setVenue("all");
												setSelectedMonth("all");
											}}
											className="text-xs font-bold text-red-600 dark:text-red-400 underline cursor-pointer"
										>
											Clear all filters
										</button>
									</div>
								) : (
									<div className="space-y-10">
										{groupedByMonth.map((group) => (
											<section key={group.monthKey} className="space-y-4">
												{/* Month Header Banner */}
												<div className="flex items-center gap-3 sticky top-4 z-20 py-2 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md">
													<div className="w-2.5 h-2.5 rounded-full bg-red-600" />
													<h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
														{group.monthName}
													</h3>
													<span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
														{group.fixtures.length}{" "}
														{group.fixtures.length === 1 ? "match" : "matches"}
													</span>
													<div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
												</div>

												{/* Fixture Grid */}
												<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
													{group.fixtures.map((fixture, index) => (
														<FixtureCard
															key={fixture.id}
															fixture={fixture}
															index={index}
														/>
													))}
												</div>
											</section>
										))}
									</div>
								)}
							</>
						)}

						{/* Active Tab: Played Results */}
						{activeTab === "played" && (
							<>
								{/* Filters Section for Played Results */}
								<section className="space-y-4">
									<div className="flex items-center justify-between">
										<h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
											Played Match Results
										</h2>
										<span className="text-xs font-bold text-slate-500">
											Showing {filteredFixtures.length} of{" "}
											{playedFixtures.length} completed matches
										</span>
									</div>

									<FixtureFilters
										search={search}
										onSearchChange={setSearch}
										selectedCompetition={selectedCompetition}
										onCompetitionChange={setSelectedCompetition}
										competitions={competitions}
										venue={venue}
										onVenueChange={setVenue}
										selectedMonth={selectedMonth}
										onMonthChange={setSelectedMonth}
										months={months}
										totalCount={playedFixtures.length}
									/>
								</section>

								{/* Played Results Grid */}
								{filteredFixtures.length === 0 ? (
									<div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3 shadow-sm">
										<History className="w-10 h-10 text-slate-400 mx-auto" />
										<h3 className="text-base font-extrabold text-slate-900 dark:text-white">
											No played matches found
										</h3>
										<p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
											No completed results match the current filters.
										</p>
										<button
											onClick={() => {
												setSearch("");
												setSelectedCompetition("all");
												setVenue("all");
												setSelectedMonth("all");
											}}
											className="text-xs font-bold text-red-600 dark:text-red-400 underline cursor-pointer"
										>
											Clear all filters
										</button>
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{filteredFixtures.map((fixture, index) => (
											<PlayedCard
												key={fixture.id}
												fixture={fixture}
												index={index}
											/>
										))}
									</div>
								)}
							</>
						)}
					</>
				)}
			</div>
		</main>
	);
}
