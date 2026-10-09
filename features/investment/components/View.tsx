"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
	RefreshCw,
	Compass,
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
import { getInvestmentCompass } from "@/features/investment/actions";
import type { InvestmentCompassData } from "@/features/investment/types";
import { computeCompass } from "../lib/engine/index";
import { sma } from "../lib/indicators";

import OverviewRegimes from "./OverviewRegimes";
import ScenarioSandbox from "./ScenarioSandbox";
import PermissionsMatrix from "./PermissionsMatrix";
import MarketPlaybook from "./MarketPlaybook";
import MarketDataHub from "./MarketDataHub";
import Rulebook from "./Rulebook";
import EventCalendar from "./EventCalendar";
import MarketDeltaAlerts from "./MarketDeltaAlerts";

export default function InvestmentCompassView({
	initialData,
}: {
	initialData?: InvestmentCompassData;
}) {
	const [data, setData] = useState<InvestmentCompassData | null>(
		initialData || null,
	);
	const [isLoading, setIsLoading] = useState(!initialData);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showSourcesPopover, setShowSourcesPopover] = useState(false);

	const fetchData = useCallback(async (isSilent = false) => {
		if (isSilent) setIsRefreshing(true);
		else setIsLoading(true);
		setError(null);

		try {
			const freshData = await getInvestmentCompass(true);
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

	// Compute or retrieve engineOutput once
	const engineOutput = useMemo(() => {
		if (!data) return null;
		return data.engineOutput ?? computeCompass(data);
	}, [data]);

	// Extract primary signals for telemetry
	const ihsgQuote = data?.markets.quotes.JKSE ?? data?.markets.quotes.IHSG;
	const usdIdrQuote = data?.markets.quotes.USDIDR;
	const btcQuote = data?.markets.quotes.BTC;
	const cryptoScore = data?.sentiment.crypto?.data?.[0]?.value
		? parseInt(data.sentiment.crypto.data[0].value, 10)
		: null;
	const cryptoRating =
		data?.sentiment.crypto?.data?.[0]?.value_classification ?? "Neutral";

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
		if (!data?.sources) return { label: "Syncing", color: "bg-amber-400" };
		const sources = Object.values(data.sources);
		const failed = sources.filter((s) => !s.ok);
		const stale = sources.filter((s) => s.stale);

		if (failed.length === sources.length) {
			return { label: "Offline", color: "bg-rose-500" };
		}
		if (failed.length > 0 || stale.length > 0) {
			return { label: "Partial", color: "bg-amber-500" };
		}
		return { label: "Live", color: "bg-emerald-500" };
	}, [data?.sources]);

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			{/* ── Top Floating Header Card ─────────────────────────────────── */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 mb-5 sm:mb-8">
				<div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs relative">
					{/* Clipped decorative watermark */}
					<div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
						<div className="absolute top-0 right-0 p-8 opacity-[0.03]">
							<Compass className="w-64 h-64" />
						</div>
					</div>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative z-10">
						<div className="flex-1 min-w-0">
							<nav
								aria-label="Breadcrumb"
								className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2"
							>
								<Link
									href="/"
									className="hover:text-slate-700 transition-colors !no-underline"
								>
									Home
								</Link>
								<ChevronRight className="w-3.5 h-3.5 shrink-0" />
								<span className="text-slate-900 font-bold">Investments</span>
							</nav>
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
								Investment Compass
							</h1>
							<p className="text-sm sm:text-base text-slate-500 font-medium mt-1.5 max-w-2xl leading-relaxed">
								Risk-first market intelligence, disciplined execution playbooks,
								and macroeconomic telemetry across Indonesian equities and
								crypto majors.
							</p>
						</div>

						{/* Header Actions */}
						<div className="flex flex-wrap items-center gap-2 sm:gap-3">
							<Link
								href="/utils/stock-explorer"
								className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 hover:text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer !no-underline group"
							>
								<BarChart3 className="w-4 h-4 text-slate-600 group-hover:scale-105 transition-transform" />
								<span>Stock Explorer</span>
							</Link>

							{/* Connection Status Button & Popover */}
							<div className="relative">
								<button
									type="button"
									onClick={() => setShowSourcesPopover(!showSourcesPopover)}
									className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-center shadow-2xs flex items-center gap-2 cursor-pointer transition-colors active:scale-95"
								>
									<div
										className={`w-2 h-2 rounded-full ${
											isLoading
												? "bg-amber-400 animate-pulse"
												: sourceStatusSummary.color
										}`}
									/>
									<span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
										{isLoading
											? "Syncing"
											: isRefreshing
												? "Refreshing"
												: error
													? "Error"
													: sourceStatusSummary.label}
									</span>
									<Info className="w-3 h-3 text-slate-400" />
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
										<div className="fixed inset-x-4 top-28 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-72 max-w-sm mx-auto sm:mx-0 bg-white rounded-2xl border border-slate-200/90 shadow-2xl sm:shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
											<div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
												<span className="text-xs font-black text-slate-900">
													Data Stream Sources
												</span>
												<button
													type="button"
													onClick={() => setShowSourcesPopover(false)}
													className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
												>
													<X className="w-3.5 h-3.5" />
												</button>
											</div>
											<ul className="space-y-1.5 text-xs">
												{Object.entries(data.sources).map(([key, s]) => (
													<li
														key={key}
														className="flex items-center justify-between text-slate-600"
													>
														<span className="font-semibold">{s.label}</span>
														<span
															className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
																s.ok
																	? s.stale
																		? "bg-amber-100 text-amber-800"
																		: "bg-emerald-100 text-emerald-800"
																	: "bg-rose-100 text-rose-800"
															}`}
														>
															{s.ok ? (s.stale ? "Backup" : "Live") : "Offline"}
														</span>
													</li>
												))}
											</ul>
											<div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
												Refreshed:{" "}
												{new Date(data.fetchedAt).toLocaleTimeString()}
											</div>
										</div>
									</>
								)}
							</div>

							<button
								type="button"
								onClick={() => fetchData(true)}
								disabled={isLoading || isRefreshing}
								className="p-2 sm:p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-slate-600 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs touch-manipulation"
								title="Refresh Market Telemetry"
							>
								<RefreshCw
									className={`w-4 h-4 ${isLoading || isRefreshing ? "animate-spin text-indigo-600" : ""}`}
								/>
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 space-y-6 sm:space-y-8">
				{/* ── 4-Column Primary Telemetry Strip ─────────────────────────── */}
				{!isLoading && data && (
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
						{/* 1. Indonesia IHSG */}
						<div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
							<div className="flex items-center justify-between gap-1.5 mb-2">
								<span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-wider truncate">
									Indonesia (IHSG)
								</span>
								<Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 shrink-0" />
							</div>
							<div>
								<div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:gap-2">
									<span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
										{ihsgQuote?.last
											? ihsgQuote.last.toLocaleString("en-US", {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})
											: "---"}
									</span>
									{ihsgQuote?.changePct != null && (
										<span
											className={`text-[10px] sm:text-xs font-bold ${
												ihsgQuote.changePct >= 0
													? "text-emerald-600"
													: "text-rose-600"
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
								<p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5 truncate">
									{ihsgAbove200 != null
										? ihsgAbove200
											? "Above 200D MA (Bullish)"
											: "Below 200D MA (Bearish)"
										: "IDX Composite Index"}
								</p>
							</div>
						</div>

						{/* 2. USD / IDR Exchange Rate */}
						<div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
							<div className="flex items-center justify-between gap-1.5 mb-2">
								<span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-wider truncate">
									USD / IDR (Rupiah)
								</span>
								<DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
							</div>
							<div>
								<div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:gap-2">
									<span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
										{usdIdrQuote?.last
											? `Rp ${Math.round(usdIdrQuote.last).toLocaleString("id-ID")}`
											: "---"}
									</span>
									{usdIdrQuote?.changePct != null && (
										<span
											className={`text-[10px] sm:text-xs font-bold ${
												usdIdrQuote.changePct > 0
													? "text-rose-600"
													: "text-emerald-600"
											}`}
										>
											{usdIdrQuote.changePct > 0 ? "+" : ""}
											{usdIdrQuote.changePct.toFixed(2)}%
										</span>
									)}
								</div>
								<p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5 truncate">
									{usdIdrQuote?.changePct != null
										? usdIdrQuote.changePct > 0
											? "Rupiah Weakening"
											: "Rupiah Strengthening"
										: "Bank Indonesia FX Rate"}
								</p>
							</div>
						</div>

						{/* 3. Bitcoin (BTC) Spot */}
						<div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
							<div className="flex items-center justify-between gap-1.5 mb-2">
								<span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-wider truncate">
									Bitcoin (BTC)
								</span>
								<Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
							</div>
							<div>
								<div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:gap-2">
									<span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
										{btcQuote?.last
											? `$${Math.round(btcQuote.last).toLocaleString("en-US")}`
											: "---"}
									</span>
									{btcQuote?.changePct != null && (
										<span
											className={`text-[10px] sm:text-xs font-bold ${
												btcQuote.changePct >= 0
													? "text-emerald-600"
													: "text-rose-600"
											}`}
										>
											{btcQuote.changePct >= 0 ? "+" : ""}
											{btcQuote.changePct.toFixed(2)}%
										</span>
									)}
								</div>
								<p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5 truncate">
									{btcAbove200 != null
										? btcAbove200
											? "Above 200D MA (Bullish)"
											: "Below 200D MA (Bearish)"
										: "Digital Reserve Asset"}
								</p>
							</div>
						</div>

						{/* 4. Crypto Sentiment (Alternative.me) */}
						<div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
							<div className="flex items-center justify-between gap-1.5 mb-2">
								<span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-wider truncate">
									Crypto Sentiment
								</span>
								<Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
							</div>
							<div>
								<div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:gap-2">
									<span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
										{cryptoScore ?? "---"}
									</span>
									<span className="text-[10px] sm:text-xs font-bold text-slate-400">
										/ 100
									</span>
								</div>
								<p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5 truncate">
									{cryptoRating} (Fear &amp; Greed)
								</p>
							</div>
						</div>
					</div>
				)}

				{/* ── Delta Alerts (Overnight Volatility Shifts) ──────────────── */}
				{!isLoading && data && <MarketDeltaAlerts data={data} />}

				{/* ── 1. Overview: 3 Regime Health Cards ─────────────────────── */}
				{!isLoading && engineOutput && (
					<OverviewRegimes
						globalRegime={engineOutput.regimes.global}
						ihsgRegime={engineOutput.regimes.ihsg}
						cryptoRegime={engineOutput.regimes.crypto}
					/>
				)}

				{/* ── Macro Scenario Sandbox ("What-If" Stress-Tester) ──────── */}
				{!isLoading && data && engineOutput && (
					<ScenarioSandbox data={data} liveOutput={engineOutput} />
				)}

				{/* ── 2. Cheatsheet: Unified Permissions Matrix ──────────────── */}
				{!isLoading && engineOutput && (
					<PermissionsMatrix permissions={engineOutput.permissions} />
				)}

				{/* ── 3. Execution Playbook (IHSG, Crypto, Safe Bucket) ──────── */}
				{!isLoading && engineOutput && (
					<MarketPlaybook
						playbooks={engineOutput.playbooks}
						compassData={data || undefined}
						scores={{
							ihsg: engineOutput.regimes.ihsg.score,
							crypto: engineOutput.regimes.crypto.score,
						}}
					/>
				)}

				{/* ── 4. Market Data Terminal (Consolidated Hub) ─────────────── */}
				{!isLoading && data && <MarketDataHub data={data} />}

				{/* ── 5. Disciplined Rebuild Rulebook ────────────────────────── */}
				<Rulebook />

				{/* ── 6. Upcoming Catalysts & Active Seasonality ─────────────── */}
				<EventCalendar />

				{/* Disclaimer Footer */}
				<div className="text-center pt-6 border-t border-slate-200/80">
					<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
						Personal Guideline &amp; Operating System (Not Financial Advice)
					</p>
				</div>
			</div>
		</main>
	);
}
