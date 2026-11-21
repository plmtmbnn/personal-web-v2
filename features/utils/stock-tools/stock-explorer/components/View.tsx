"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	RefreshCw,
	AlertCircle,
	Loader2,
	Sliders,
	ChevronDown,
	ChevronUp,
	Settings,
	RotateCcw,
	TrendingUp,
	Filter,
	Coins,
	BookmarkPlus,
	Plus,
	Compass,
	ArrowUpRight,
} from "lucide-react";
import UtilHeader from "@/features/utils/components/UtilHeader";
import type {
	IDXStock,
	TickerHistoryRingBuffer,
	CompassBridgeSummary,
} from "../types";
import { fmtIDRValue } from "../utils";
import { useMarketData } from "../hooks/useMarketData";
import {
	ScreenerProvider,
	useScreener,
	STRATEGY_PRESETS,
} from "../context/ScreenerContext";

// Dashboard Components
import HeroOverview from "./dashboard/HeroOverview";
import SectorRotation from "./dashboard/SectorRotation";
import ForeignFlow from "./dashboard/ForeignFlow";
import {
	ResearchFilters,
	RESEARCH_FILTERS,
	type ResearchFilter,
} from "./dashboard/ResearchFilters";
import type { ResearchSummary } from "../utils/idx-research";
import type { MarketEvidence } from "@/services/market-data/provenance";
import OpportunityScanner from "./dashboard/OpportunityScanner";

// Charts & Table
import SmartTable from "./table/SmartTable";

// Analyst Experience & Stockpick Simulator
import StockDetailDrawer from "./analyst/StockDetailDrawer";
import StockpickSimulator from "./simulator/StockpickSimulator";
import StockpickModal from "./simulator/StockpickModal";
import { CloseStockpickModal } from "./simulator/CloseStockpickModal";

function StockExplorerDashboard() {
	const [rawStocks, setRawStocks] = useState<IDXStock[]>([]);
	const [tickerHistory10d, setTickerHistory10d] =
		useState<TickerHistoryRingBuffer>({});
	const [compassBridge, setCompassBridge] =
		useState<CompassBridgeSummary | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [stockEvidence, setStockEvidence] = useState<MarketEvidence | null>(
		null,
	);
	const [research, setResearch] = useState<ResearchSummary | null>(null);
	const [researchFilter, setResearchFilter] = useState<ResearchFilter>("all");
	useEffect(() => {
		const query = new URLSearchParams(window.location.search).get("research");
		if (query && Object.hasOwn(RESEARCH_FILTERS, query))
			setResearchFilter(query as ResearchFilter);
	}, []);
	const selectResearch = (filter: ResearchFilter) => {
		setResearchFilter(filter);
		const url = new URL(window.location.href);
		if (filter === "all") url.searchParams.delete("research");
		else url.searchParams.set("research", filter);
		window.history.replaceState(window.history.state, "", url);
	};

	const {
		workstationTab,
		setWorkstationTab,
		stockPicks,
		addStockPick,
		updateStockPick,
		isPickModalOpen,
		closePickModal,
		pickToEdit,
		stockToSimulate,
		openAddPickModal,
		isCloseModalOpen,
		closeClosePickModal,
		pickToClose,
		closeStockPickWithDetails,
		syncMarketDataWatermarks,
		weights,
		handleWeightChange,
		applyPreset,
		applyCompassRegime,
		resetWeights,
		activePresetName,
		minScore,
		setMinScore,
		minTurnover,
		setMinTurnover,
		isScorerExpanded,
		setIsScorerExpanded,
	} = useScreener();

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/utils/stock-data", {
				cache: "no-store",
				headers: { "Cache-Control": "no-cache" },
			});
			if (!res.ok) throw new Error("Failed to fetch market data");
			const json = await res.json();

			if (!json.data || !Array.isArray(json.data) || json.data.length === 0) {
				throw new Error("No data received or invalid format");
			}

			setRawStocks(json.data);
			setTickerHistory10d(json.tickerHistory10d ?? {});
			setCompassBridge(json.compassBridge ?? null);
			setStockEvidence(json.metadata?.stockEvidence ?? null);
			setResearch(json.research ?? null);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Failed to load stock data";
			console.error("Data fetch error:", err);
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const { processed, marketHealth } = useMarketData(
		rawStocks,
		weights,
		tickerHistory10d,
	);
	const activeResearch = research?.current ? researchFilter : "all";
	const researchStocks = useMemo(() => {
		if (activeResearch === "all" || !research) return processed;
		return processed.flatMap((stock) => {
			const signal = research.signals[stock.StockCode];
			if (!signal) return [];
			if (activeResearch === "trend" && !signal.trendLeader) return [];
			if (activeResearch === "strength" && signal.relativeStrength == null)
				return [];
			if (activeResearch === "contraction" && signal.state !== "developing")
				return [];
			if (activeResearch === "breakout" && signal.state !== "confirmed")
				return [];
			return [{ ...stock, RelativeStrength: signal.relativeStrength }];
		});
	}, [activeResearch, research, processed]);

	useEffect(() => {
		if (processed.length > 0 && stockEvidence?.status === "current") {
			syncMarketDataWatermarks(processed);
		}
	}, [processed, stockEvidence, syncMarketDataWatermarks]);

	const totalWeightsSum = Object.values(weights).reduce((a, b) => a + b, 0);

	// Count how many stocks pass active score AND turnover liquidity floor
	const qualifyingStocksCount = processed.filter(
		(s) =>
			s.CompositeScore >= minScore &&
			(minTurnover === 0 || s.Value >= minTurnover),
	).length;
	const qualifyingPct =
		processed.length > 0
			? Math.round((qualifyingStocksCount / processed.length) * 100)
			: 0;

	return (
		<main className="min-h-screen bg-slate-50/80 relative text-slate-900 pt-20 sm:pt-24 pb-[calc(8rem+env(safe-area-inset-bottom))] sm:pb-[calc(9rem+env(safe-area-inset-bottom))] px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
				<UtilHeader
					title="Market Intelligence Explorer"
					description="Interactive Indonesia Stock Exchange analytics with dynamic composite scoring, institutional volume tracking, and market breadth intelligence."
					category={{
						label: "Financial Intelligence",
						color: "blue",
					}}
					icon={TrendingUp}
					badges={
						<div className="flex flex-wrap items-center gap-2">
							{stockEvidence && (
								<span className="text-xs font-medium text-slate-700">
									{stockEvidence.origin === "static"
										? "Demo data"
										: stockEvidence.asOf
											? `IDX session ${stockEvidence.asOf.slice(0, 10)}${
													stockEvidence.status === "current"
														? ""
														: ` (${stockEvidence.status})`
												}`
											: "IDX session date unavailable"}
								</span>
							)}

							{rawStocks.length > 0 && (
								<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs tabular-nums">
									<span className="text-slate-900">{rawStocks.length}</span>{" "}
									Tickers
								</span>
							)}
						</div>
					}
					actions={
						<div className="flex flex-wrap items-center gap-2">
							<button
								type="button"
								onClick={fetchData}
								disabled={isLoading}
								className="inline-flex min-h-11 items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
							>
								{isLoading ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<RefreshCw className="w-4 h-4" />
								)}
								<span>Refresh</span>
							</button>

							<Link
								href="/utils/stock-explorer/admin"
								className="inline-flex min-h-11 items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 hover:text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-xs !no-underline"
							>
								<Settings className="w-4 h-4 text-slate-600" />
								<span>Manage</span>
							</Link>
						</div>
					}
				/>

				{/* Main Content Area */}
				<div className="space-y-6 sm:space-y-8">
					{error ? (
						<div
							role="alert"
							className="bg-white border border-rose-200/90 border-l-4 border-l-rose-600 rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-xs"
						>
							<div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 flex items-center justify-center mb-4">
								<AlertCircle className="w-6 h-6" />
							</div>
							<h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">
								Terminal feed offline
							</h2>
							<p className="text-sm font-medium text-slate-600 max-w-md">
								{error}
							</p>
							<button
								type="button"
								onClick={fetchData}
								className="mt-5 inline-flex min-h-11 items-center px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
							>
								Retry connection
							</button>
						</div>
					) : isLoading && rawStocks.length === 0 ? (
						<div
							role="status"
							aria-label="Loading IDX screener"
							className="space-y-6"
						>
							<div className="h-14 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs flex items-center gap-2">
								<div className="h-11 w-40 rounded-xl bg-slate-200 motion-safe:animate-pulse" />
								<div className="h-11 w-44 rounded-xl bg-slate-100 motion-safe:animate-pulse" />
							</div>
							<div className="h-24 rounded-3xl border border-slate-200/80 bg-white shadow-xs motion-safe:animate-pulse" />
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
								{[1, 2, 3, 4].map((item) => (
									<div
										key={item}
										className="h-36 rounded-3xl border border-slate-200/80 bg-white shadow-xs motion-safe:animate-pulse"
									/>
								))}
							</div>
							<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
								<div className="lg:col-span-6 h-72 rounded-3xl border border-slate-200/80 bg-white shadow-xs motion-safe:animate-pulse" />
								<div className="lg:col-span-6 space-y-6">
									<div className="h-40 rounded-3xl border border-slate-200/80 bg-white shadow-xs motion-safe:animate-pulse" />
									<div className="h-40 rounded-3xl border border-slate-200/80 bg-white shadow-xs motion-safe:animate-pulse" />
								</div>
							</div>
							<div className="h-64 rounded-3xl border border-slate-200/80 bg-white shadow-xs motion-safe:animate-pulse" />
						</div>
					) : (
						<>
							{/* Workstation Mode Switcher: Market Screener vs Stockpick Simulator */}
							<div className="bg-white border border-slate-200/80 rounded-2xl p-1.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
								<div
									role="tablist"
									aria-label="Explorer workstations"
									className="relative flex flex-wrap items-center gap-1"
								>
									<button
										type="button"
										id="workstation-tab-screener"
										role="tab"
										aria-selected={workstationTab === "screener"}
										tabIndex={workstationTab === "screener" ? 0 : -1}
										onClick={() => setWorkstationTab("screener")}
										onKeyDown={(e) => {
											if (
												e.key === "ArrowRight" ||
												e.key === "ArrowLeft" ||
												e.key === "End"
											) {
												e.preventDefault();
												setWorkstationTab("simulator");
												document
													.getElementById("workstation-tab-simulator")
													?.focus();
											}
										}}
										className={`relative min-h-11 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
											workstationTab === "screener"
												? "text-slate-900"
												: "text-slate-600 hover:text-slate-900"
										}`}
									>
										<TrendingUp className="w-4 h-4 text-slate-600" />
										<span>Market Screener</span>
										{workstationTab === "screener" && (
											<motion.div
												layoutId="workstationActiveBackground"
												className="absolute inset-0 bg-slate-100/90 rounded-xl -z-10"
												transition={{
													type: "spring",
													stiffness: 380,
													damping: 30,
												}}
											/>
										)}
									</button>
									<button
										type="button"
										id="workstation-tab-simulator"
										role="tab"
										aria-selected={workstationTab === "simulator"}
										tabIndex={workstationTab === "simulator" ? 0 : -1}
										onClick={() => setWorkstationTab("simulator")}
										onKeyDown={(e) => {
											if (
												e.key === "ArrowLeft" ||
												e.key === "ArrowRight" ||
												e.key === "Home"
											) {
												e.preventDefault();
												setWorkstationTab("screener");
												document
													.getElementById("workstation-tab-screener")
													?.focus();
											}
										}}
										className={`relative min-h-11 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
											workstationTab === "simulator"
												? "text-slate-900"
												: "text-slate-600 hover:text-slate-900"
										}`}
									>
										<BookmarkPlus className="w-4 h-4 text-indigo-600" />
										<span>Stockpick Simulator</span>
										<span className="text-xs font-mono font-bold bg-indigo-50 border border-indigo-200/80 text-indigo-800 px-1.5 py-0.5 rounded-lg">
											{stockPicks.length}
										</span>
										{workstationTab === "simulator" && (
											<motion.div
												layoutId="workstationActiveBackground"
												className="absolute inset-0 bg-slate-100/90 rounded-xl -z-10"
												transition={{
													type: "spring",
													stiffness: 380,
													damping: 30,
												}}
											/>
										)}
									</button>
								</div>
								{workstationTab === "screener" && (
									<span className="hidden sm:inline-flex text-xs font-semibold text-slate-600 pr-3">
										IDX screener
									</span>
								)}
								{workstationTab === "simulator" && (
									<button
										type="button"
										onClick={() => openAddPickModal()}
										className="inline-flex min-h-11 items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer mr-0.5"
									>
										<Plus className="w-4 h-4" />
										<span>New Pick</span>
									</button>
								)}
							</div>

							{/* Live IHSG Investment Compass Regime & Permission Bridge */}
							{compassBridge && (
								<div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
									<div className="flex items-start sm:items-center gap-3.5">
										<div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
											<Compass className="w-5 h-5" />
										</div>
										<div>
											<div className="flex flex-wrap items-center gap-2">
												<span className="text-sm font-bold text-slate-900">
													Compass posture
												</span>
												<span
													className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
														compassBridge.effectiveState === "risk_on"
															? "bg-emerald-50 text-emerald-800 border-emerald-200"
															: compassBridge.effectiveState === "selective"
																? "bg-blue-50 text-blue-800 border-blue-200"
																: compassBridge.effectiveState === "defensive"
																	? "bg-amber-50 text-amber-800 border-amber-200"
																	: "bg-rose-50 text-rose-800 border-rose-200"
													}`}
												>
													{compassBridge.effectiveState.replace("_", " ")} (
													{compassBridge.score}/100)
												</span>
												<span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-lg font-mono tabular-nums">
													Swing:{" "}
													{compassBridge.isTradingLocked ? "Locked" : "Open"} |{" "}
													{compassBridge.riskPerTradePct}% risk/trade |{" "}
													{compassBridge.maxExposurePct}% exposure cap
												</span>
											</div>
											<p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">
												{compassBridge.permissions?.swing.reason ??
													compassBridge.headline}
											</p>
											<p className="mt-1 text-xs text-slate-600">
												{compassBridge.computedAt &&
													`Computed ${new Date(
														compassBridge.computedAt,
													).toLocaleString("en-GB", {
														timeZone: "Asia/Jakarta",
													})} WIB. `}
												{compassBridge.coverage != null &&
													`Evidence coverage ${Math.round(
														compassBridge.coverage * 100,
													)}%. `}
												{compassBridge.session &&
													`Compass IDX session ${compassBridge.session}.`}
											</p>
											{stockEvidence?.asOf &&
												compassBridge.session &&
												stockEvidence.asOf.slice(0, 10) !==
													compassBridge.session && (
													<p className="mt-1 text-xs font-semibold text-amber-800">
														Explorer data and Compass use different IDX
														sessions.
													</p>
												)}
										</div>
									</div>

									<div className="flex flex-wrap items-center gap-2 shrink-0">
										<button
											type="button"
											onClick={() =>
												applyCompassRegime(
													compassBridge.effectiveState === "insufficient"
														? "selective"
														: compassBridge.effectiveState,
												)
											}
											className="inline-flex min-h-11 items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
										>
											Sync Regime Preset
										</button>
										<Link
											href={
												compassBridge.snapshotId
													? "/investment?snapshot=" +
														encodeURIComponent(compassBridge.snapshotId)
													: "/investment"
											}
											className="inline-flex min-h-11 items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors !no-underline"
										>
											<span>Open Compass</span>
											<ArrowUpRight className="w-3.5 h-3.5" />
										</Link>
									</div>
								</div>
							)}

							{workstationTab === "simulator" ? (
								<StockpickSimulator
									stocks={stockEvidence?.status === "current" ? processed : []}
								/>
							) : (
								<>
									{/* Top KPI Cards (Integrated Market Return + Breadth, Composite Score, Foreign Flow, Turnover) */}
									<HeroOverview marketHealth={marketHealth} />

									{/* Deep Market Intelligence Matrix: Balanced 2-Column Grid */}
									<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
										{/* Left Column: Opportunity Scanner */}
										<div className="lg:col-span-6 h-full">
											{stockEvidence?.status === "current" ? (
												<OpportunityScanner
													stocks={processed}
													compassBridge={compassBridge}
												/>
											) : (
												<section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
													<h2 className="font-semibold text-slate-900">
														Opportunity scanner
													</h2>
													<p className="mt-1 text-sm text-slate-700">
														Waiting for a current IDX close.
													</p>
												</section>
											)}
										</div>

										{/* Right Column: Sector Rotation + Foreign Flow */}
										<div className="lg:col-span-6 space-y-6">
											<SectorRotation stocks={processed} />
											<ForeignFlow stocks={processed} />
										</div>
									</div>

									{/* Unified Screening Unit: IDX Research + Smart Screener Table */}
									<div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs">
										<ResearchFilters
											embedded
											research={research}
											filter={activeResearch}
											onChange={selectResearch}
										/>
										<SmartTable
											key={activeResearch}
											embedded
											stocks={researchStocks}
											researchSort={activeResearch === "strength"}
										/>
									</div>

									{/* Custom Scoring Engine & Hard Filter Control Panel */}
									<div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs">
										<button
											type="button"
											aria-expanded={isScorerExpanded}
											onClick={() => setIsScorerExpanded(!isScorerExpanded)}
											className="w-full min-h-11 p-5 sm:p-7 flex justify-between items-center bg-white hover:bg-slate-50/80 rounded-3xl transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 cursor-pointer border-none text-left"
										>
											<div className="flex items-center gap-3.5 min-w-0">
												<div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
													<Sliders className="w-5 h-5" />
												</div>
												<div className="min-w-0">
													<div className="flex flex-wrap items-center gap-2">
														<h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
															Custom Factor Scoring &amp; Hard Filter Engine
														</h3>
														<span className="hidden sm:inline-flex text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg">
															Preset: {activePresetName}
														</span>
														{minScore > 0 && (
															<span className="inline-flex text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-lg">
																Score ≥ {minScore}
															</span>
														)}
														{minTurnover > 0 && (
															<span className="inline-flex text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg">
																Turnover ≥ Rp {fmtIDRValue(minTurnover)}
															</span>
														)}
													</div>
													<p className="text-xs font-medium text-slate-600 mt-0.5">
														Recalculate composite opportunity scores and filter
														out sub-par instruments in real time
													</p>
												</div>
											</div>

											<div className="flex items-center gap-3 sm:gap-4 shrink-0">
												<span
													className={`hidden md:inline-block text-xs font-bold px-2.5 py-1 rounded-lg border ${
														totalWeightsSum === 100
															? "bg-emerald-50 text-emerald-800 border-emerald-200"
															: "bg-amber-50 text-amber-800 border-amber-200"
													}`}
												>
													{totalWeightsSum === 100
														? "100% Calibrated"
														: `Weights Sum: ${totalWeightsSum}%`}
												</span>
												<div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
													{isScorerExpanded ? (
														<ChevronUp className="w-4 h-4" />
													) : (
														<ChevronDown className="w-4 h-4" />
													)}
												</div>
											</div>
										</button>

										{isScorerExpanded && (
											<div className="p-5 sm:p-7 border-t border-slate-100 bg-slate-50/40 rounded-b-3xl space-y-6">
												{/* Presets & Reset Row */}
												<div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
													<div className="flex flex-wrap items-center gap-2">
														<span className="text-xs font-bold text-slate-600 mr-1">
															Strategies:
														</span>
														{STRATEGY_PRESETS.map((preset) => (
															<button
																key={preset.name}
																type="button"
																onClick={() => applyPreset(preset.weights)}
																className={`min-h-11 px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight transition-colors cursor-pointer border ${
																	activePresetName === preset.name
																		? "bg-slate-900 text-white border-slate-900 shadow-xs"
																		: "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700"
																}`}
															>
																{preset.name}
															</button>
														))}
													</div>

													<button
														type="button"
														onClick={resetWeights}
														className="inline-flex min-h-11 items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
													>
														<RotateCcw className="w-3.5 h-3.5 text-slate-600" />
														<span>Reset Defaults</span>
													</button>
												</div>

												{/* Range Sliders Grid */}
												<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
													{[
														{
															label: "Price Trend",
															key: "price" as const,
															desc: "Momentum & % change",
														},
														{
															label: "Trade Volume",
															key: "volume" as const,
															desc: "Volume velocity weight",
														},
														{
															label: "Foreign Flow",
															key: "foreign" as const,
															desc: "Foreign institutional flow",
														},
														{
															label: "Liquidity",
															key: "liquidity" as const,
															desc: "Trade transaction frequency",
														},
														{
															label: "Volatility",
															key: "volatility" as const,
															desc: "Price stability & range",
														},
													].map((slider) => (
														<div key={slider.key} className="space-y-2.5">
															<div className="flex justify-between items-center">
																<span className="text-xs font-bold text-slate-800">
																	{slider.label}
																</span>
																<span className="text-xs font-bold tabular-nums text-indigo-800 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
																	{weights[slider.key]}%
																</span>
															</div>
															<input
																type="range"
																aria-label={`${slider.label} weight`}
																min="0"
																max="100"
																step="5"
																value={weights[slider.key]}
																onChange={(e) =>
																	handleWeightChange(
																		slider.key,
																		Number(e.target.value),
																	)
																}
																className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
															/>
															<p className="text-xs font-medium text-slate-600">
																{slider.desc}
															</p>
														</div>
													))}
												</div>

												{/* Hard Filter Threshold Section */}
												<div className="pt-6 border-t border-slate-200/70 space-y-3">
													<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
														<div className="flex flex-wrap items-center gap-2">
															<Filter className="w-4 h-4 text-indigo-600" />
															<span className="text-xs font-bold text-slate-800">
																Hard Filter: Minimum Score Threshold
															</span>
															<span className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
																{minScore > 0
																	? `Score ≥ ${minScore}`
																	: "Disabled (Showing All)"}
															</span>
														</div>
														<span className="text-xs font-semibold text-slate-600 tabular-nums">
															<span className="text-indigo-700 font-bold">
																{qualifyingStocksCount}
															</span>{" "}
															of {processed.length} instruments qualify (
															{qualifyingPct}%)
														</span>
													</div>

													<div className="flex flex-wrap items-center gap-2">
														{[
															{ label: "Show All (0+)", value: 0 },
															{ label: "Standard (≥ 50)", value: 50 },
															{ label: "Quality (≥ 65)", value: 65 },
															{ label: "High Conviction (≥ 75)", value: 75 },
															{ label: "Alpha Elite (≥ 80)", value: 80 },
														].map((preset) => (
															<button
																key={preset.value}
																type="button"
																onClick={() => setMinScore(preset.value)}
																className={`min-h-11 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
																	minScore === preset.value
																		? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
																		: "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
																}`}
															>
																{preset.label}
															</button>
														))}
													</div>

													<div className="flex items-center gap-4 pt-1">
														<input
															type="range"
															aria-label="Minimum composite score threshold"
															min="0"
															max="90"
															step="5"
															value={minScore}
															onChange={(e) =>
																setMinScore(Number(e.target.value))
															}
															className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
														/>
														<span className="text-xs font-bold tabular-nums text-slate-900 w-12 text-right">
															{minScore}+
														</span>
													</div>
												</div>

												{/* Hard Filter Minimum Liquidity Floor Section */}
												<div className="pt-6 border-t border-slate-200/70 space-y-3">
													<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
														<div className="flex flex-wrap items-center gap-2">
															<Coins className="w-4 h-4 text-emerald-700" />
															<span className="text-xs font-bold text-slate-800">
																Hard Filter: Liquidity Floor (Turnover)
															</span>
															<span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
																{minTurnover > 0
																	? `Turnover ≥ Rp ${fmtIDRValue(minTurnover)}`
																	: "Disabled (Showing All)"}
															</span>
														</div>
														<span className="text-xs font-medium text-slate-600">
															Eliminates illiquid penny stock traps (saham tidur
															/ gorengan)
														</span>
													</div>

													<div className="flex flex-wrap items-center gap-2">
														{[
															{ label: "All (Rp 0)", value: 0 },
															{ label: "≥ Rp 1B (Active)", value: 1000000000 },
															{ label: "≥ Rp 5B (Liquid)", value: 5000000000 },
															{
																label: "≥ Rp 20B (Institutional)",
																value: 20000000000,
															},
															{
																label: "≥ Rp 50B (Mega Cap)",
																value: 50000000000,
															},
														].map((preset) => (
															<button
																key={preset.value}
																type="button"
																onClick={() => setMinTurnover(preset.value)}
																className={`min-h-11 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
																	minTurnover === preset.value
																		? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
																		: "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
																}`}
															>
																{preset.label}
															</button>
														))}
													</div>
												</div>

												{/* Warning if not summing to 100 */}
												{totalWeightsSum !== 100 && (
													<div className="p-4 bg-white border border-amber-200/90 border-l-4 border-l-amber-500 text-slate-800 rounded-2xl flex items-center gap-3 text-xs font-semibold">
														<AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
														<span>
															Active factor weights sum to{" "}
															<strong>{totalWeightsSum}%</strong>. Normalizing
															to 100% is recommended for accurate composite
															scoring.
														</span>
													</div>
												)}
											</div>
										)}
									</div>
								</>
							)}
						</>
					)}
				</div>
			</div>

			{/* Analyst Drawer */}
			<StockDetailDrawer
				stockSession={stockEvidence?.asOf?.slice(0, 10) ?? null}
			/>

			{/* Stockpick Simulator Modal */}
			<StockpickModal
				isOpen={isPickModalOpen}
				onClose={closePickModal}
				pickToEdit={pickToEdit}
				stockToSimulate={stockToSimulate}
				availableStocks={processed}
				compassBridge={compassBridge}
				onSave={(data, request) =>
					data.id
						? updateStockPick(data.id, data, request)
						: addStockPick(data, request)
				}
			/>

			{/* Close Position Modal */}
			<CloseStockpickModal
				isOpen={isCloseModalOpen}
				onClose={closeClosePickModal}
				pick={pickToClose}
				onConfirmClose={closeStockPickWithDetails}
			/>
		</main>
	);
}

export default function StockExplorerView() {
	return (
		<ScreenerProvider>
			<StockExplorerDashboard />
		</ScreenerProvider>
	);
}
