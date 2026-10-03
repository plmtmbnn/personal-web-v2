"use client";

import { useState, useCallback, useEffect } from "react";
import {
	RefreshCw,
	Compass,
	BarChart3,
	Globe,
	ShieldCheck,
	ChevronRight,
	Activity,
} from "lucide-react";
import Link from "next/link";
import { getInvestmentCompass } from "@/features/investment/actions";
import type { InvestmentCompassData } from "@/features/investment/types";

import InvestmentPrinciples from "@/features/investment/components/InvestmentPrinciples";
import EventCalendar from "@/features/investment/components/EventCalendar";
import Playbook from "./Playbook";
import TimeframeGuidelines from "./TimeframeGuidelines";
import TradersCheatsheet from "./TradersCheatsheet";
import SectorRotation from "./SectorRotation";
import MarketDeltaAlerts from "./MarketDeltaAlerts";
import MarketDataHub from "./MarketDataHub";

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

	// Extract primary signals for telemetry
	const cnnScore = data?.sentiment.traditional?.fear_and_greed?.score ?? 50;
	const cryptoScore = data?.sentiment.crypto?.data?.[0]?.value
		? parseInt(data.sentiment.crypto.data[0].value, 10)
		: 50;
	const spxQuote = data?.markets.quotes.SPX;
	const ihsgQuote = data?.markets.quotes.IHSG;

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			{/* ── Top Floating Header Card ─────────────────────────────────── */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 mb-5 sm:mb-8">
				<div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs relative overflow-hidden">
					<div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
						<Compass className="w-64 h-64" />
					</div>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative z-10">
						<div className="space-y-1.5 sm:space-y-2">
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100/80 text-emerald-700 text-xs font-bold uppercase tracking-wider max-w-full">
								<Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
								<span className="truncate">Investment Guideline</span>
								<span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
								<span className="text-[11px] font-semibold text-emerald-600 lowercase tracking-normal truncate hidden xs:inline">
									macro &amp; micro strategy
								</span>
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
								Investment Compass
							</h1>
							<div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
								<Link
									href="/"
									className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline"
								>
									Home
								</Link>
								<ChevronRight className="w-3 h-3 text-slate-400" />
								<span className="text-slate-900 font-bold">Investments</span>
							</div>
						</div>

						{/* Header Actions */}
						<div className="flex flex-wrap items-center gap-2 sm:gap-3">
							<Link
								href="/utils/stock-explorer"
								className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-700 hover:text-emerald-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer !no-underline group"
							>
								<BarChart3 className="w-4 h-4 text-emerald-600 group-hover:scale-105 transition-transform" />
								<span>Stock Explorer</span>
							</Link>

							{/* Connection Status */}
							<div className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-slate-50/80 border border-slate-200/80 rounded-xl text-center shadow-2xs flex items-center gap-2">
								<div
									className={`w-2 h-2 rounded-full ${
										isLoading
											? "bg-amber-400 animate-pulse"
											: error
												? "bg-rose-500"
												: "bg-emerald-500"
									}`}
								/>
								<span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
									{isLoading
										? "Syncing"
										: isRefreshing
											? "Refreshing"
											: error
												? "Error"
												: "Live"}
								</span>
							</div>

							<button
								type="button"
								onClick={() => fetchData(true)}
								disabled={isLoading || isRefreshing}
								className="p-2 sm:p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-slate-600 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs touch-manipulation"
							>
								<RefreshCw
									className={`w-4 h-4 ${isLoading || isRefreshing ? "animate-spin text-emerald-600" : ""}`}
								/>
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 space-y-6 sm:space-y-8">
				{/* ── Telemetry Summary Strip ─────────────────────────────────── */}
				{!isLoading && data && (
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
						<div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
							<div className="flex items-center justify-between gap-1.5 mb-2">
								<span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-wider truncate">
									Market Sentiment
								</span>
								<Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
							</div>
							<div>
								<div className="flex items-baseline gap-1.5 sm:gap-2">
									<span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
										{Math.round(cnnScore)}
									</span>
									<span className="text-[10px] sm:text-xs font-bold text-slate-400">
										/ 100
									</span>
								</div>
								<p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5 truncate">
									Traditional CNN Index
								</p>
							</div>
						</div>
						<div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
							<div className="flex items-center justify-between gap-1.5 mb-2">
								<span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-wider truncate">
									Crypto Sentiment
								</span>
								<ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
							</div>
							<div>
								<div className="flex items-baseline gap-1.5 sm:gap-2">
									<span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
										{cryptoScore}
									</span>
									<span className="text-[10px] sm:text-xs font-bold text-slate-400">
										/ 100
									</span>
								</div>
								<p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5 truncate">
									Alternative.me Index
								</p>
							</div>
						</div>
						<div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
							<div className="flex items-center justify-between gap-1.5 mb-2">
								<span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-wider truncate">
									S&P 500 (SPX)
								</span>
								<Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
							</div>
							<div>
								<div className="flex items-baseline gap-1.5 sm:gap-2">
									<span className="text-base sm:text-2xl font-black text-slate-900 tracking-tight truncate">
										{spxQuote?.last
											? spxQuote.last.toLocaleString("en-US", {
													style: "currency",
													currency: "USD",
												})
											: "---"}
									</span>
								</div>
								<p
									className={`text-[10px] sm:text-xs font-bold mt-0.5 ${
										(spxQuote?.changePct ?? 0) >= 0
											? "text-emerald-600"
											: "text-rose-600"
									}`}
								>
									{(spxQuote?.changePct ?? 0) >= 0 ? "+" : ""}
									{(spxQuote?.changePct ?? 0).toFixed(2)}%
								</p>
							</div>
						</div>
						<div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
							<div className="flex items-center justify-between gap-1.5 mb-2">
								<span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-wider truncate">
									Indonesia (IHSG)
								</span>
								<Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
							</div>
							<div>
								<div className="flex items-baseline gap-1.5 sm:gap-2">
									<span className="text-base sm:text-2xl font-black text-slate-900 tracking-tight truncate">
										{ihsgQuote?.last
											? ihsgQuote.last.toLocaleString("id-ID")
											: "---"}
									</span>
								</div>
								<p
									className={`text-[10px] sm:text-xs font-bold mt-0.5 ${
										(ihsgQuote?.changePct ?? 0) >= 0
											? "text-emerald-600"
											: "text-rose-600"
									}`}
								>
									{(ihsgQuote?.changePct ?? 0) >= 0 ? "+" : ""}
									{(ihsgQuote?.changePct ?? 0).toFixed(2)}%
								</p>
							</div>
						</div>
					</div>
				)}

				{/* ── Delta Alerts (Overnight Shifts) ──────────────────────────── */}
				{!isLoading && data && <MarketDeltaAlerts data={data} />}

				{/* ── Trader's Cheatsheet & Risk Guard ─────────────────────── */}
				{!isLoading && data && <TradersCheatsheet data={data} />}

				{/* ── Executive Summary: Actionable Playbook ─────────────────── */}
				{!isLoading && data && <Playbook data={data} />}

				{/* ── Trading Timeframes Guidelines ──────────────────────────── */}
				{!isLoading && data && <TimeframeGuidelines data={data} />}

				{/* ── Sector Rotation ────────────────────────────────────────── */}
				{!isLoading && data && <SectorRotation data={data} />}

				{/* ── Market Data Terminal (Tabbed Hub) ──────────────────────── */}
				{!isLoading && data && <MarketDataHub data={data} />}

				{/* ── Supplementary Polish (Principles & Calendar) ──────────── */}
				{!isLoading && data && (
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-6 border-t border-slate-200/80">
						<InvestmentPrinciples />
						<EventCalendar />
					</div>
				)}
			</div>
		</main>
	);
}
