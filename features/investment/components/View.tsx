"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
	RefreshCw,
	BarChart3,
	ChevronRight,
	Activity,
	Coins,
	Building2,
	DollarSign,
	Info,
	X,
} from "lucide-react";
import Link from "next/link";
import { refreshInvestmentCompass } from "@/features/investment/server-actions";
import type { InvestmentCompassData } from "@/features/investment/types";
import { computeCompass } from "../lib/engine/index";
import { sma } from "../lib/indicators";
import styles from "./InvestmentCompass.module.css";

import OverviewRegimes from "./OverviewRegimes";
import { getIdxPosture } from "../lib/idx-posture";
import ScenarioSandbox from "./ScenarioSandbox";
import PermissionsMatrix from "./PermissionsMatrix";
import MarketPlaybook from "./MarketPlaybook";
import MarketDataHub from "./MarketDataHub";
import EventCalendar from "./EventCalendar";
import MarketDeltaAlerts from "./MarketDeltaAlerts";

export default function InvestmentCompassView({
	initialData,
	macroPanel,
}: {
	initialData?: InvestmentCompassData;
	macroPanel?: React.ReactNode;
}) {
	const [data, setData] = useState<InvestmentCompassData | null>(
		initialData || null,
	);
	const [isLoading, setIsLoading] = useState(!initialData);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showSourcesPopover, setShowSourcesPopover] = useState(false);
	const sourcesTrigger = useRef<HTMLButtonElement>(null);
	const sourcesPanel = useRef<HTMLDivElement>(null);

	const fetchData = useCallback(async (isSilent = false) => {
		if (isSilent) setIsRefreshing(true);
		else setIsLoading(true);
		setError(null);

		try {
			const freshData = await refreshInvestmentCompass();
			setData(freshData);
		} catch (err) {
			console.error("Compass fetch failed:", err);
			setError("Failed to retrieve investment compass data.");
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, []);

	useEffect(() => {
		if (!initialData) fetchData();
	}, [fetchData, initialData]);

	// Handle Escape key to dismiss sources popover
	useEffect(() => {
		if (!showSourcesPopover) return;
		sourcesPanel.current?.querySelector<HTMLButtonElement>("button")?.focus();
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setShowSourcesPopover(false);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			sourcesTrigger.current?.focus();
		};
	}, [showSourcesPopover]);

	// Compute or retrieve engineOutput once
	const engineOutput = useMemo(() => {
		if (!data) return null;
		return data.engineOutput ?? computeCompass(data);
	}, [data]);

	const [linkedSnapshot, setLinkedSnapshot] = useState<string | null>(null);
	useEffect(() => {
		const id = new URLSearchParams(window.location.search).get("snapshot");
		if (id && Number.isFinite(Date.parse(id))) setLinkedSnapshot(id);
	}, []);
	const posture = data ? getIdxPosture(data) : null;

	// Extract primary signals for telemetry
	const ihsgQuote = data?.markets.quotes.JKSE ?? data?.markets.quotes.IHSG;
	const usdIdrQuote = data?.markets.quotes.USDIDR;
	const btcQuote = data?.markets.quotes.BTC;
	const cryptoScore = data?.sentiment.crypto?.data?.[0]?.value
		? parseInt(data.sentiment.crypto.data[0].value, 10)
		: null;
	const cryptoRating =
		data?.sentiment.crypto?.data?.[0]?.value_classification ?? "Unavailable";

	// Moving averages for telemetry status
	const ihsgHistory =
		data?.markets.history?.["^JKSE"]?.points ??
		data?.markets.history?.JKSE?.points ??
		[];
	const ihsgMa200 = sma(ihsgHistory, 200);
	const ihsgAbove200 =
		ihsgQuote?.last && ihsgMa200 ? ihsgQuote.last >= ihsgMa200 : null;

	const btcHistory = data?.markets.history?.["BTC-USD"]?.points ?? [];
	const btcMa200 = sma(btcHistory, 200);
	const btcAbove200 =
		btcQuote?.last && btcMa200 ? btcQuote.last >= btcMa200 : null;

	// Overall source connection status
	const sourceStatusSummary = useMemo(() => {
		if (!data?.sources) return { label: "Syncing" };
		const sources = Object.values(data.sources);
		const failed = sources.filter((s) => !s.ok);
		const stale = sources.filter((s) => s.stale);

		if (failed.length === sources.length) {
			return { label: "Offline" };
		}
		if (failed.length > 0 || stale.length > 0) {
			return { label: "Partial" };
		}
		return { label: "Current" };
	}, [data?.sources]);

	return (
		<main
			className={`${styles.screen} min-h-screen bg-slate-50/80 relative pb-[calc(8rem+env(safe-area-inset-bottom))] sm:pb-[calc(9rem+env(safe-area-inset-bottom))] overflow-x-clip`}
		>
			{/* Top Floating Header Card */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 mb-5 sm:mb-6">
				<div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs relative">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative z-10">
						<div className="flex-1 min-w-0">
							<nav
								aria-label="Breadcrumb"
								className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2"
							>
								<Link
									href="/"
									className="inline-flex min-h-11 items-center hover:text-slate-700 transition-colors !no-underline"
								>
									Home
								</Link>
								<ChevronRight className="w-3.5 h-3.5 shrink-0" />
								<span className="text-slate-900 font-bold">Investments</span>
							</nav>
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
								Investment Compass
							</h1>
							<p className="text-sm sm:text-base text-slate-500 font-medium mt-1.5 max-w-2xl leading-relaxed">
								Market conditions and trading limits for Indonesian stocks and
								crypto.
							</p>
							{data && (
								<p className="mt-2 text-xs tabular-nums text-slate-500">
									Updated{" "}
									{new Date(data.fetchedAt).toLocaleString("en-GB", {
										timeZone: "Asia/Jakarta",
									})}{" "}
									WIB
								</p>
							)}
						</div>

						{/* Header Actions */}
						<div className="flex flex-wrap items-center gap-2 sm:gap-3">
							<Link
								href="/utils/stock-explorer"
								aria-label="Open Stock Explorer"
								className="inline-flex min-h-11 items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 hover:text-slate-950 font-semibold text-xs rounded-xl shadow-2xs transition-colors active:scale-95 cursor-pointer !no-underline group"
							>
								<BarChart3 className="w-4 h-4 text-slate-600 group-hover:scale-105 transition-transform" />
								<span>Find stocks</span>
							</Link>

							<div className="flex items-center gap-2">
								{/* Connection Status Button & Popover */}
								<div className="relative">
									<button
										type="button"
										ref={sourcesTrigger}
										disabled={!data?.sources}
										aria-expanded={showSourcesPopover}
										aria-controls="investment-sources"
										aria-haspopup="dialog"
										onClick={() => setShowSourcesPopover(!showSourcesPopover)}
										className="min-h-11 px-3 sm:px-3.5 py-2 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-center shadow-2xs flex items-center gap-2 cursor-pointer transition-colors active:scale-95"
									>
										<span
											role="status"
											className="text-xs font-bold text-slate-700"
										>
											Sources:{" "}
											{isLoading
												? "Syncing"
												: isRefreshing
													? "Refreshing"
													: error
														? "Error"
														: sourceStatusSummary.label}
										</span>
										<Info className="w-3.5 h-3.5 text-slate-500" />
									</button>

									{/* Sources Popover */}
									{showSourcesPopover && data?.sources && (
										<>
											{/* Backdrop overlay for dismissing */}
											<div
												role="presentation"
												aria-hidden="true"
												className="fixed inset-0 z-40 bg-slate-900/10 sm:bg-transparent cursor-default"
												onClick={() => setShowSourcesPopover(false)}
											/>
											<div
												id="investment-sources"
												ref={sourcesPanel}
												role="dialog"
												aria-label="Data sources"
												className="fixed inset-x-4 top-28 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-sm max-h-[calc(100dvh-9rem)] overflow-y-auto mx-auto sm:mx-0 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-4 z-50"
											>
												<div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
													<span className="text-xs font-bold text-slate-900">
														Data sources
													</span>
													<button
														type="button"
														aria-label="Close data sources"
														onClick={() => setShowSourcesPopover(false)}
														className="min-h-11 min-w-11 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
													>
														<X className="w-3.5 h-3.5" />
													</button>
												</div>
												<ul className="max-h-[55dvh] space-y-1.5 overflow-y-auto text-xs">
													<li className="py-2 text-slate-600">
														Model {engineOutput?.modelVersion ?? "legacy"}.
														Evaluated{" "}
														{engineOutput?.evaluatedAt
															? new Date(
																	engineOutput.evaluatedAt,
																).toLocaleString("en-GB", {
																	timeZone: "Asia/Jakarta",
																})
															: "time unavailable"}{" "}
														WIB.
													</li>
													{Object.entries(data.sources).map(([key, source]) => (
														<li
															key={key}
															className="border-b border-slate-100 text-slate-700"
														>
															<details>
																<summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 font-medium focus-visible:outline-2 focus-visible:outline-indigo-600">
																	<span>{source.label}</span>
																	<span>
																		{source.status === "stale"
																			? "Stale"
																			: source.ok
																				? source.stale
																					? "Partial"
																					: "Current"
																				: "Unavailable"}
																	</span>
																</summary>
																<ul className="max-h-40 space-y-2 overflow-auto pb-2">
																	{Object.entries(source.evidence ?? {}).map(
																		([id, item]) => (
																			<li key={id}>
																				<p>
																					{id}: {item.provider}, {item.origin},{" "}
																					{item.status}
																				</p>
																				{item.reason && <p>{item.reason}</p>}
																				{item.periodEnd && (
																					<p>
																						Monthly period ends {item.periodEnd}
																						. Freshness uses this date.
																					</p>
																				)}
																				<p>
																					{item.asOf
																						? `Observed ${item.asOf.slice(0, 10)}`
																						: "Observation date unknown"}
																				</p>
																				{item.retrievedAt && (
																					<p>
																						Retrieved{" "}
																						{new Date(
																							item.retrievedAt,
																						).toLocaleString("en-GB", {
																							timeZone: "Asia/Jakarta",
																						})}{" "}
																						WIB
																					</p>
																				)}
																			</li>
																		),
																	)}
																</ul>
															</details>
														</li>
													))}
												</ul>
												<div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
													Computed{" "}
													{new Date(data.fetchedAt).toLocaleString("en-GB", {
														timeZone: "Asia/Jakarta",
													})}{" "}
													WIB
												</div>
											</div>
										</>
									)}
								</div>

								<button
									type="button"
									onClick={() => fetchData(true)}
									disabled={isLoading || isRefreshing}
									className="min-h-11 min-w-11 inline-flex items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-slate-600 hover:text-slate-900 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs touch-manipulation"
									aria-label="Refresh market data"
									title="Refresh market data"
								>
									<RefreshCw
										className={`w-4 h-4 ${isLoading || isRefreshing ? "motion-safe:animate-spin text-indigo-600" : ""}`}
									/>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 space-y-6 sm:space-y-8">
				{error && (
					<div
						role="alert"
						className="rounded-3xl border border-rose-200 border-l-4 border-l-rose-600 bg-white p-5 text-sm text-rose-900 shadow-xs"
					>
						<p>
							{error}{" "}
							{data
								? "Showing the last loaded data."
								: "Try refreshing the page data."}
						</p>
						<button
							type="button"
							onClick={() => fetchData(true)}
							disabled={isRefreshing}
							className="mt-2 min-h-11 font-semibold underline disabled:opacity-50"
						>
							Retry
						</button>
					</div>
				)}
				{isLoading && (
					<div
						role="status"
						aria-label="Loading market data"
						className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
					>
						{[1, 2, 3, 4].map((item) => (
							<div
								key={item}
								className="h-28 rounded-2xl border border-slate-200/80 bg-white motion-safe:animate-pulse"
							/>
						))}
					</div>
				)}
				{/* 4-Column Primary Telemetry Strip */}
				{!isLoading && data && (
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
						{/* 1. Indonesia IHSG */}
						<div className="h-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-2">
							<div className="flex items-center justify-between gap-1.5">
								<span className="text-xs font-bold text-slate-500 truncate">
									IHSG
								</span>
								<Building2 className="w-4 h-4 text-slate-700 shrink-0" />
							</div>
							<div>
								<div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:gap-2">
									<span className="text-lg sm:text-2xl font-bold tabular-nums text-slate-900 tracking-tight truncate">
										{ihsgQuote?.last
											? ihsgQuote.last.toLocaleString("en-US", {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})
											: "---"}
									</span>
									{ihsgQuote?.changePct != null && (
										<span
											className={`text-xs font-bold tabular-nums ${
												ihsgQuote.changePct >= 0
													? "text-emerald-700"
													: "text-rose-700"
											}`}
										>
											{ihsgQuote.change != null && (
												<span className="mr-1">
													{ihsgQuote.change >= 0 ? "+" : ""}
													{ihsgQuote.change.toFixed(1)}
												</span>
											)}
											({ihsgQuote.changePct >= 0 ? "+" : ""}
											{ihsgQuote.changePct.toFixed(2)}%)
										</span>
									)}
								</div>
								<p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
									{ihsgAbove200 != null
										? ihsgAbove200
											? "Above 200-day average"
											: "Below 200-day average"
										: "IDX Composite Index"}
								</p>
							</div>
						</div>

						{/* 2. USD / IDR Exchange Rate */}
						<div className="h-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-2">
							<div className="flex items-center justify-between gap-1.5">
								<span className="text-xs font-bold text-slate-500 truncate">
									USD / IDR
								</span>
								<DollarSign className="w-4 h-4 text-emerald-700 shrink-0" />
							</div>
							<div>
								<div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:gap-2">
									<span className="text-lg sm:text-2xl font-bold tabular-nums text-slate-900 tracking-tight truncate">
										{usdIdrQuote?.last
											? `Rp ${Math.round(usdIdrQuote.last).toLocaleString("id-ID")}`
											: "---"}
									</span>
									{usdIdrQuote?.changePct != null && (
										<span
											className={`text-xs font-bold tabular-nums ${
												usdIdrQuote.changePct > 0
													? "text-rose-700"
													: "text-emerald-700"
											}`}
										>
											{usdIdrQuote.changePct > 0 ? "+" : ""}
											{usdIdrQuote.changePct.toFixed(2)}%
										</span>
									)}
								</div>
								<p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
									{usdIdrQuote?.changePct != null
										? usdIdrQuote.changePct > 0
											? "Rupiah Weakening"
											: "Rupiah Strengthening"
										: "Bank Indonesia FX Rate"}
								</p>
							</div>
						</div>

						{/* 3. Bitcoin (BTC) Spot */}
						<div className="h-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-2">
							<div className="flex items-center justify-between gap-1.5">
								<span className="text-xs font-bold text-slate-500 truncate">
									Bitcoin
								</span>
								<Coins className="w-4 h-4 text-amber-600 shrink-0" />
							</div>
							<div>
								<div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:gap-2">
									<span className="text-lg sm:text-2xl font-bold tabular-nums text-slate-900 tracking-tight truncate">
										{btcQuote?.last
											? `$${Math.round(btcQuote.last).toLocaleString("en-US")}`
											: "---"}
									</span>
									{btcQuote?.changePct != null && (
										<span
											className={`text-xs font-bold tabular-nums ${
												btcQuote.changePct >= 0
													? "text-emerald-700"
													: "text-rose-700"
											}`}
										>
											{btcQuote.changePct >= 0 ? "+" : ""}
											{btcQuote.changePct.toFixed(2)}%
										</span>
									)}
								</div>
								<p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
									{btcAbove200 != null
										? btcAbove200
											? "Above 200-day average"
											: "Below 200-day average"
										: "Digital Reserve Asset"}
								</p>
							</div>
						</div>

						{/* 4. Crypto Sentiment (Alternative.me) */}
						<div className="h-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-2">
							<div className="flex items-center justify-between gap-1.5">
								<span className="text-xs font-bold text-slate-500 truncate">
									Fear &amp; greed
								</span>
								<Activity className="w-4 h-4 text-indigo-600 shrink-0" />
							</div>
							<div>
								<div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:gap-2">
									<span className="text-lg sm:text-2xl font-bold tabular-nums text-slate-900 tracking-tight">
										{cryptoScore ?? "---"}
									</span>
									<span className="text-xs font-bold text-slate-500">
										/ 100
									</span>
								</div>
								<p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
									{cryptoRating}
								</p>
							</div>
						</div>
					</div>
				)}

				{!isLoading && data && (
					<nav
						aria-label="Investment sections"
						className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
					>
						{[
							["conditions", "Market conditions"],
							["permissions", "Trading limits"],
							["plans", "Trade plans"],
							["scenarios", "Scenario test"],
							["market-data", "Market data"],
							["calendar", "Calendar"],
						].map(([id, label]) => (
							<a
								key={id}
								href={`#${id}`}
								className="inline-flex min-h-11 shrink-0 items-center px-3.5 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-950 shadow-2xs transition-colors whitespace-nowrap !no-underline"
							>
								{label}
							</a>
						))}
					</nav>
				)}

				{/* Delta Alerts (Overnight Volatility Shifts) */}
				{!isLoading && data && (
					<MarketDeltaAlerts data={data} alerts={engineOutput?.alerts} />
				)}

				{/* 1. Overview: 3 Regime Health Cards */}
				{!isLoading && engineOutput && (
					<section
						id="conditions"
						aria-label="Market conditions"
						className="scroll-mt-24"
					>
						<OverviewRegimes
							globalRegime={engineOutput.regimes.global}
							ihsgRegime={engineOutput.regimes.ihsg}
							cryptoRegime={engineOutput.regimes.crypto}
							ihsgPosture={posture}
							previous={data?.previousSnapshot}
							linkedSnapshot={linkedSnapshot}
						/>
					</section>
				)}

				{macroPanel}

				{/* 2. Cheatsheet: Unified Permissions Matrix */}
				{!isLoading && engineOutput && (
					<section
						id="permissions"
						aria-label="Trading limits"
						className="scroll-mt-24"
					>
						<PermissionsMatrix permissions={engineOutput.permissions} />
					</section>
				)}

				{/* 3. Execution Playbook (IHSG & Crypto Tactical Scripts) */}
				{!isLoading && engineOutput && (
					<section id="plans" aria-label="Trade plans" className="scroll-mt-24">
						<MarketPlaybook
							playbooks={engineOutput.playbooks}
							compassData={data || undefined}
							scores={{
								ihsg: engineOutput.regimes.ihsg.score,
								crypto: engineOutput.regimes.crypto.score,
							}}
						/>
					</section>
				)}

				{/* 4. Macro Scenario Sandbox ("What-If" Stress-Tester) */}
				{!isLoading && data && engineOutput && (
					<section
						id="scenarios"
						aria-label="Scenario test"
						className="scroll-mt-24"
					>
						<ScenarioSandbox data={data} liveOutput={engineOutput} />
					</section>
				)}

				{/* 5. Market Data Terminal (Consolidated 3-Tab Hub) */}
				{!isLoading && data && (
					<section
						id="market-data"
						aria-label="Market data"
						className="scroll-mt-24"
					>
						<MarketDataHub data={data} />
					</section>
				)}

				{/* 6. Upcoming Catalysts & Active Seasonality */}
				<section
					id="calendar"
					aria-label="Market calendar"
					className="scroll-mt-24"
				>
					<EventCalendar />
				</section>

				{/* Disclaimer Footer */}
				<div className="text-center pt-6 border-t border-slate-200/80">
					<p className="text-xs font-medium text-slate-600">
						Personal Guideline &amp; Operating System (Not Financial Advice)
					</p>
				</div>
			</div>
		</main>
	);
}
