"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
	Trophy,
	RefreshCw,
	ChevronRight,
	AlertCircle,
	CheckCircle2,
	Sparkles,
	Clock,
	Calendar,
	MapPin,
	Shield,
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
	const reduceMotion = useReducedMotion();
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
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32">
				{/* ── Breadcrumb & Sync Actions ─────────────────────────── */}
				<div className="flex flex-wrap items-center justify-between gap-4 mb-8">
					<div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
						<Link href="/" className="hover:text-slate-900 transition-colors">
							Home
						</Link>
						<ChevronRight className="w-3.5 h-3.5 text-slate-400" />
						<span className="text-slate-500">Insights</span>
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
							Liverpool FC 2026/27 Matchday Hub
						</span>
					</div>

					<h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
						Fixtures & <span className="text-red-600">Results</span>
					</h1>

					<p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
						Official upcoming match schedule, kickoff times in local timezone,
						stadium venues, and TV broadcasters. You'll Never Walk Alone.
					</p>
				</motion.div>

				{/* ── Quick Stats Pills (TravelPage style) ──────────────── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="flex flex-wrap justify-center gap-3 mb-10"
				>
					<div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 rounded-full shadow-xs">
						<Calendar className="w-4 h-4 text-red-600" />
						<span className="text-xs font-bold text-slate-900">
							{stats.totalUpcoming} Upcoming Matches
						</span>
					</div>
					<div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-full">
						<MapPin className="w-4 h-4 text-red-600" />
						<span className="text-xs font-bold text-red-900">
							{stats.anfieldUpcoming} Anfield Fixtures
						</span>
					</div>
					<div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 rounded-full shadow-xs">
						<CheckCircle2 className="w-4 h-4 text-emerald-600" />
						<span className="text-xs font-bold text-slate-900">
							{stats.totalPlayed} Played Results
						</span>
					</div>
					<div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 rounded-full shadow-xs">
						<Trophy className="w-4 h-4 text-amber-500" />
						<span className="text-xs font-bold text-slate-900">
							{competitions.length} Competitions
						</span>
					</div>
				</motion.div>

				{/* ── Primary Navigation Tab Switcher ────────────────────── */}
				<div className="flex justify-center mb-12">
					<div className="inline-flex p-1.5 bg-white border border-slate-200/80 rounded-full shadow-xs gap-1.5">
						<button
							onClick={() => handleTabChange("upcoming")}
							className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
								activeTab === "upcoming"
									? "bg-red-600 text-white shadow-xs"
									: "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
							}`}
						>
							<Clock className="w-4 h-4" />
							<span>Upcoming Fixtures ({upcomingFixtures.length})</span>
						</button>
						<button
							onClick={() => handleTabChange("played")}
							className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
								activeTab === "played"
									? "bg-red-600 text-white shadow-xs"
									: "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
							}`}
						>
							<CheckCircle2 className="w-4 h-4" />
							<span>Played Results ({playedFixtures.length})</span>
						</button>
					</div>
				</div>

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
							onClick={() => fetchFixtures()}
							className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
						>
							Retry Connection
						</button>
					</div>
				) : (
					<>
						{/* ── Active Tab: Upcoming Fixtures ─────────────────── */}
						{activeTab === "upcoming" && (
							<div className="space-y-16">
								{/* Next Match Section */}
								{nextMatch && (
									<section>
										<motion.div
											initial={reduceMotion ? false : { opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.3 }}
											className="flex items-center gap-4 mb-8"
										>
											<div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
												<Sparkles className="w-5 h-5 text-red-600" />
											</div>
											<div>
												<h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
													Next Matchday
												</h2>
												<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
													Imminent Kickoff
												</p>
											</div>
											<div className="h-px flex-1 bg-slate-200/80" />
										</motion.div>

										<NextMatchHero fixture={nextMatch} />
									</section>
								)}

								{/* All Upcoming Schedule Section */}
								<section>
									<motion.div
										initial={reduceMotion ? false : { opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.4 }}
										className="flex items-center gap-4 mb-8"
									>
										<div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
											<Calendar className="w-5 h-5 text-red-600" />
										</div>
										<div>
											<h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
												Upcoming Schedule
											</h2>
											<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
												Showing {filteredFixtures.length} of{" "}
												{upcomingFixtures.length} fixtures
											</p>
										</div>
										<div className="h-px flex-1 bg-slate-200/80" />
									</motion.div>

									{/* Filters */}
									<div className="mb-8">
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
									</div>

									{/* Fixtures List */}
									{filteredFixtures.length === 0 ? (
										<div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl shadow-xs">
											<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
												<Calendar className="w-8 h-8 text-slate-400" />
											</div>
											<p className="text-sm font-bold text-slate-800 mb-2">
												No upcoming matches found
											</p>
											<p className="text-xs text-slate-500 font-medium mb-4">
												Try adjusting your search query or competition filter.
											</p>
											<button
												onClick={() => {
													setSearch("");
													setSelectedCompetition("all");
													setVenue("all");
													setSelectedMonth("all");
												}}
												className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
											>
												Clear all filters
											</button>
										</div>
									) : (
										<div className="space-y-12">
											{groupedByMonth.map((group) => (
												<div key={group.monthKey} className="space-y-6">
													<div className="flex items-center gap-3">
														<div className="w-2.5 h-2.5 rounded-full bg-red-600" />
														<h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
															{group.monthName}
														</h3>
														<span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white border border-slate-200/80 text-slate-700 shadow-xs">
															{group.fixtures.length}{" "}
															{group.fixtures.length === 1
																? "match"
																: "matches"}
														</span>
														<div className="h-px flex-1 bg-slate-200/80" />
													</div>

													<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
														{group.fixtures.map((fixture, index) => (
															<FixtureCard
																key={fixture.id}
																fixture={fixture}
																index={index}
															/>
														))}
													</div>
												</div>
											))}
										</div>
									)}
								</section>
							</div>
						)}

						{/* ── Active Tab: Played Results ────────────────────── */}
						{activeTab === "played" && (
							<section>
								<motion.div
									initial={reduceMotion ? false : { opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.3 }}
									className="flex items-center gap-4 mb-8"
								>
									<div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
										<CheckCircle2 className="w-5 h-5 text-emerald-600" />
									</div>
									<div>
										<h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
											Played Match Results
										</h2>
										<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
											{playedFixtures.length} completed matches
										</p>
									</div>
									<div className="h-px flex-1 bg-slate-200/80" />
								</motion.div>

								{/* Filters */}
								<div className="mb-8">
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
								</div>

								{/* Played Grid */}
								{filteredFixtures.length === 0 ? (
									<div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl shadow-xs">
										<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<Shield className="w-8 h-8 text-slate-400" />
										</div>
										<p className="text-sm font-bold text-slate-800 mb-2">
											No played matches found
										</p>
										<p className="text-xs text-slate-500 font-medium mb-4">
											No match results match your current search criteria.
										</p>
										<button
											onClick={() => {
												setSearch("");
												setSelectedCompetition("all");
												setVenue("all");
												setSelectedMonth("all");
											}}
											className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
										>
											Clear all filters
										</button>
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
										{filteredFixtures.map((fixture, index) => (
											<PlayedCard
												key={fixture.id}
												fixture={fixture}
												index={index}
											/>
										))}
									</div>
								)}
							</section>
						)}
					</>
				)}
			</div>
		</main>
	);
}
