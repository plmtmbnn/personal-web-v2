"use client";
import { currentMarketInputs } from "../lib/provenance";

import { useState } from "react";
import Link from "next/link";
import {
	Activity,
	LineChart,
	Building2,
	Coins,
	TrendingUp,
	TrendingDown,
	ShieldAlert,
	Flame,
	Globe,
	ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { InvestmentCompassData } from "@/features/investment/types";
import {
	sma,
	distancePct,
	drawdownFromHigh,
	getHalvingCyclePhase,
} from "../lib/indicators";

import MacroLens from "@/features/investment/components/MacroLens";
import { DEFAULT_THRESHOLDS } from "../config/thresholds";

type TabId = "indonesia" | "crypto" | "macro";

/**
 * Formats monetary amounts in compact units (T, B, M).
 * Numbers >= 1 Trillion (1e12) are formatted in Trillions with 2 decimals (e.g. 7418.7B -> 7.42T).
 * Numbers >= 1 Billion (1e9) are formatted in Billions with 1 decimal (e.g. 450.5B).
 * Numbers >= 1 Million (1e6) are formatted in Millions with 1 decimal (e.g. 150.0M).
 */
export function formatFlowAmount(val: number): string {
	const abs = Math.abs(val);
	if (abs >= 1e12) {
		return `${(abs / 1e12).toFixed(2)}T`;
	}
	if (abs >= 1e9) {
		return `${(abs / 1e9).toFixed(1)}B`;
	}
	if (abs >= 1e6) {
		return `${(abs / 1e6).toFixed(1)}M`;
	}
	return Math.round(abs).toLocaleString("en-US");
}

export default function MarketDataHub({
	data,
}: {
	data: InvestmentCompassData;
}) {
	data = currentMarketInputs(data);
	const [activeTab, setActiveTab] = useState<TabId>("indonesia");
	const reduceMotion = useReducedMotion();

	const TABS = [
		{ id: "indonesia", label: "Indonesia", icon: Building2 },
		{ id: "crypto", label: "Crypto", icon: Coins },
		{ id: "macro", label: "Global", icon: LineChart },
	] as const;

	// Calculate live Indonesia metrics
	const ihsgQuote = data.markets.quotes.JKSE ?? data.markets.quotes.IHSG;
	const ihsgPrice = ihsgQuote?.last ?? null;
	const ihsgHistory =
		data.markets.history?.["^JKSE"]?.points ??
		data.markets.history?.JKSE?.points ??
		[];
	const ihsgMa50 = sma(ihsgHistory, 50);
	const ihsgMa200 = sma(ihsgHistory, 200);
	const ihsgDd = drawdownFromHigh(ihsgPrice, ihsgQuote?.high52w ?? null);

	const usdIdrHistory = data.markets.history?.["IDR=X"]?.points ?? [];
	const idrMa50 = sma(usdIdrHistory, 50);

	const biRateSeries = data.markets.macro?.BI_POLICY_RATE?.data;
	const latestBiRate =
		biRateSeries && biRateSeries.length > 0
			? biRateSeries[biRateSeries.length - 1].value
			: null;

	const us10yVal =
		data.markets.quotes.US10Y?.last ??
		data.markets.macro?.DGS10?.data?.slice(-1)[0]?.value ??
		null;
	const idCpiSeries = data.markets.macro?.ID_CPI_YOY?.data;
	const latestIdCpi =
		idCpiSeries && idCpiSeries.length > 0
			? idCpiSeries[idCpiSeries.length - 1].value
			: null;
	const realBiRate =
		latestBiRate != null && latestIdCpi != null
			? latestBiRate - latestIdCpi
			: null;

	const ihsgFlows = data.markets.ihsgFlows;

	const sectorBellwethers = [
		{
			symbol: "BBCA.JK",
			ticker: "BBCA",
			sector: "Financials",
			label: "Bank Central Asia",
		},
		{
			symbol: "ADRO.JK",
			ticker: "ADRO",
			sector: "Energy",
			label: "Adaro Energy",
		},
		{
			symbol: "ICBP.JK",
			ticker: "ICBP",
			sector: "Consumer",
			label: "Indofood CBP",
		},
		{
			symbol: "ANTM.JK",
			ticker: "ANTM",
			sector: "Basic Materials",
			label: "Aneka Tambang",
		},
		{
			symbol: "TLKM.JK",
			ticker: "TLKM",
			sector: "Telco/Infra",
			label: "Telkom Indonesia",
		},
		{
			symbol: "ASII.JK",
			ticker: "ASII",
			sector: "Industrial/Auto",
			label: "Astra International",
		},
	].map((item) => {
		const points = data.markets.history?.[item.symbol]?.points ?? [];
		if (points.length === 0)
			return {
				...item,
				price: null,
				ma50: null,
				dist50: null,
				changePct: null,
			};
		const price = points[points.length - 1].c;
		const prev = points.length > 1 ? points[points.length - 2].c : price;
		const changePct = prev > 0 ? ((price - prev) / prev) * 100 : 0;
		const ma50 = sma(points, 50);
		const dist50 = ma50 ? distancePct(price, ma50) : null;
		return { ...item, price, ma50, dist50, changePct };
	});

	const expandingSectorsCount = sectorBellwethers.filter(
		(s) => s.dist50 != null && s.dist50 >= 0,
	).length;
	const totalSectorsCount = sectorBellwethers.length;

	// Calculate live Crypto metrics
	const btcQuote = data.markets.quotes.BTC;
	const ethQuote = data.markets.quotes.ETH;
	const btcHistory = data.markets.history?.["BTC-USD"]?.points ?? [];
	const btcMa200 = sma(btcHistory, 200);
	const flows = data.markets.cryptoFlows;
	const mvrvRatio =
		data.markets.cryptoOnChain?.mvrvRatio ??
		data.markets.cryptoOnChain?.mvrvZScore ??
		null;
	const impliedRealizedPrice =
		btcQuote?.last != null && mvrvRatio != null && mvrvRatio > 0
			? btcQuote.last / mvrvRatio
			: null;
	const ethBtcRatio =
		btcQuote?.last != null && btcQuote.last > 0 && ethQuote?.last != null
			? ethQuote.last / btcQuote.last
			: null;
	const ethRelChange =
		ethQuote?.changePct != null && btcQuote?.changePct != null
			? ethQuote.changePct - btcQuote.changePct
			: null;
	const halving = getHalvingCyclePhase();

	const dfii10Val =
		data.markets.macro?.DFII10?.data?.slice(-1)[0]?.value ?? null;
	const pceVal =
		data.markets.macro?.PCEPILFE?.data?.slice(-1)[0]?.value ?? null;
	const usRealYield =
		dfii10Val != null
			? dfii10Val
			: us10yVal != null && pceVal != null
				? us10yVal - pceVal
				: null;

	// Regional Transmission Anchors for Tab 3
	const regionalAnchors = [
		{
			id: "SPX",
			name: "S&P 500",
			region: "US Equities",
			quote: data.markets.quotes.SPX,
			inverse: false,
		},
		{
			id: "IXIC",
			name: "Nasdaq Composite",
			region: "US Tech & Beta",
			quote: data.markets.quotes.IXIC,
			inverse: false,
		},
		{
			id: "HSI",
			name: "Hang Seng",
			region: "Hong Kong / China",
			quote: data.markets.quotes.HSI,
			inverse: false,
		},
		{
			id: "N225",
			name: "Nikkei 225",
			region: "Japan / Asia-Pacific",
			quote: data.markets.quotes.N225,
			inverse: false,
		},
		{
			id: "USDJPY",
			name: "USD / JPY",
			region: "Yen Carry Monitor",
			quote: data.markets.quotes.USDJPY,
			inverse: false,
		},
		{
			id: "DXY",
			name: "US Dollar Index",
			region: "Global Liquidity",
			quote: data.markets.quotes.DXY,
			inverse: true,
		},
		{
			id: "US10Y",
			name: "US 10Y Yield",
			region: "Discount Rate",
			quote: data.markets.quotes.US10Y,
			inverse: true,
		},
		{
			id: "VIX",
			name: "CBOE VIX",
			region: "Equity Fear Index",
			quote: data.markets.quotes.VIX,
			inverse: true,
		},
	];

	// Global Commodities Barometer
	const commodityAnchors = [
		{
			id: "OIL_BRENT",
			name: "Brent Crude",
			detail: "Energy & Fuel Subsidy",
			quote: data.markets.quotes.OIL_BRENT,
		},
		{
			id: "GOLD",
			name: "Gold Spot",
			detail: "Reserve Debasement Hedge",
			quote: data.markets.quotes.GOLD,
		},
		{
			id: "COPPER",
			name: "Copper Futures",
			detail: "Industrial Demand Barometer",
			quote: data.markets.quotes.COPPER,
		},
	];

	return (
		<div className="space-y-5 sm:space-y-6">
			{/* Tab Header Card - Minimalist Frameless Milestone Selector Standard */}
			<div className="bg-white rounded-[2rem] p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
						<Activity className="w-4 h-4" />
					</div>
					<div>
						<h2 className="text-xl font-bold text-slate-900 tracking-tight">
							Market data
						</h2>
						<p className="text-xs font-bold text-slate-500">
							Prices, flows and macro indicators
						</p>
					</div>
				</div>

				<div
					role="tablist"
					aria-label="Market data views"
					className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x -mx-2 px-2 sm:mx-0 sm:px-0 relative"
				>
					{/* Continuous hairline track line */}
					<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 rounded-full" />

					{TABS.map((tab) => {
						const isActive = activeTab === tab.id;
						const Icon = tab.icon;
						return (
							<button
								type="button"
								key={tab.id}
								id={`tab-${tab.id}`}
								role="tab"
								aria-selected={isActive}
								tabIndex={isActive ? 0 : -1}
								aria-controls={`tabpanel-${tab.id}`}
								onClick={() => setActiveTab(tab.id)}
								onKeyDown={(event) => {
									const index = TABS.findIndex((item) => item.id === tab.id);
									let next = index;
									if (event.key === "ArrowRight")
										next = (index + 1) % TABS.length;
									else if (event.key === "ArrowLeft")
										next = (index + TABS.length - 1) % TABS.length;
									else if (event.key === "Home") next = 0;
									else if (event.key === "End") next = TABS.length - 1;
									else return;
									event.preventDefault();
									setActiveTab(TABS[next].id);
									document.getElementById(`tab-${TABS[next].id}`)?.focus();
								}}
								className={`group relative pb-2.5 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-colors whitespace-nowrap active:scale-95 touch-manipulation cursor-pointer z-10 ${
									isActive
										? "text-slate-900 font-bold"
										: "text-slate-500 hover:text-slate-700 font-semibold"
								}`}
							>
								{/* Razor-thin animated sliding underline indicator */}
								{isActive && (
									<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full z-20" />
								)}
								<Icon
									className={`w-3.5 h-3.5 shrink-0 transition-transform ${
										isActive
											? "text-slate-900 scale-105"
											: "text-slate-500 group-hover:text-slate-600"
									}`}
								/>
								<span>{tab.label}</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Tab Content Area */}
			<div className="min-h-[480px] relative">
				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						id={`tabpanel-${activeTab}`}
						role="tabpanel"
						tabIndex={0}
						aria-labelledby={`tab-${activeTab}`}
						initial={reduceMotion ? false : { opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
						transition={{ duration: reduceMotion ? 0 : 0.2 }}
						className="w-full"
					>
						{activeTab === "indonesia" && (
							<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
									<div>
										<h3 className="text-base sm:text-lg font-bold text-slate-900">
											Indonesia
										</h3>
										<p className="text-xs text-slate-500 font-medium">
											IHSG, rupiah and interest rates
										</p>
									</div>
									<span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 self-start sm:self-auto">
										IDX Composite (^JKSE)
									</span>
								</div>

								{/* Domestic Market Synthesis & Action Takeaway */}
								<div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/80 space-y-1">
									<span className="text-xs font-bold text-indigo-800 block">
										Indonesia outlook
									</span>
									<p className="text-xs font-semibold text-slate-700 leading-relaxed">
										{ihsgPrice != null && ihsgMa200 != null
											? `IHSG trades ${ihsgPrice >= ihsgMa200 ? "above" : "below"} its 200D MA (${distancePct(ihsgPrice, ihsgMa200)! >= 0 ? "+" : ""}${distancePct(ihsgPrice, ihsgMa200)?.toFixed(1)}%) with ${expandingSectorsCount}/${totalSectorsCount} sector bellwethers above 50D MA.`
											: `Sector breadth stands at ${expandingSectorsCount}/${totalSectorsCount} bellwethers above 50D MA.`}{" "}
										{realBiRate != null &&
											`Real BI policy rate is ${realBiRate >= 0 ? "+" : ""}${realBiRate.toFixed(2)}%. `}
										{ihsgPrice != null &&
										ihsgMa200 != null &&
										ihsgPrice >= ihsgMa200 &&
										expandingSectorsCount >= 3
											? "Suggestion: Constructive domestic participation favors liquid Tier-1 banks and foreign inflow leaders above 50D MA."
											: (data.markets.quotes.USDIDR?.last ?? 0) >=
													DEFAULT_THRESHOLDS.usdIdr.stressLevel
												? "Suggestion: Elevated USD/IDR currency pressure warrants avoiding heavy importers and preserving SBN/cash buffers."
												: "Suggestion: Selective environment; focus on dividend blue-chips near 200D MA support and wait for foreign inflow confirmation."}
									</p>
								</div>

								{/* Foreign Institutional Flow Snapshot (if available) */}
								{ihsgFlows?.streakDays != null && (
									<div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
										<div className="flex items-center gap-3">
											<div
												className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs ${
													ihsgFlows.streakDays >= 0
														? "bg-emerald-50 text-emerald-700 border-emerald-200"
														: "bg-rose-50 text-rose-700 border-rose-200"
												}`}
											>
												{ihsgFlows.streakDays >= 0 ? (
													<Flame className="w-5 h-5 text-emerald-700" />
												) : (
													<ShieldAlert className="w-5 h-5 text-rose-700" />
												)}
											</div>
											<div>
												<span className="text-xs font-bold text-slate-500 block">
													Net Foreign Institutional Flow
												</span>
												<span className="text-sm font-bold text-slate-900">
													{ihsgFlows.streakDays >= 0
														? `+${ihsgFlows.streakDays}-Day Net Inflow Streak`
														: `${Math.abs(ihsgFlows.streakDays)}-Day Net Outflow Streak`}
												</span>
											</div>
										</div>

										<div className="flex items-center gap-3 flex-wrap self-start sm:self-auto text-xs">
											{ihsgFlows.netBuySell1dIdr != null && (
												<div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
													<span className="text-xs font-bold text-slate-500 block">
														1-Day Net
													</span>
													<span
														className={`font-bold ${
															ihsgFlows.netBuySell1dIdr > 0
																? "text-emerald-700"
																: ihsgFlows.netBuySell1dIdr < 0
																	? "text-rose-700"
																	: "text-slate-600"
														}`}
													>
														{ihsgFlows.netBuySell1dIdr > 0
															? "+"
															: ihsgFlows.netBuySell1dIdr < 0
																? "-"
																: ""}
														Rp {formatFlowAmount(ihsgFlows.netBuySell1dIdr)}
													</span>
												</div>
											)}
											{ihsgFlows.netBuySell5dIdr != null && (
												<div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
													<span className="text-xs font-bold text-slate-500 block">
														5-Day Cumulative
													</span>
													<span
														className={`font-bold ${
															ihsgFlows.netBuySell5dIdr > 0
																? "text-emerald-700"
																: ihsgFlows.netBuySell5dIdr < 0
																	? "text-rose-700"
																	: "text-slate-600"
														}`}
													>
														{ihsgFlows.netBuySell5dIdr > 0
															? "+"
															: ihsgFlows.netBuySell5dIdr < 0
																? "-"
																: ""}
														Rp {formatFlowAmount(ihsgFlows.netBuySell5dIdr)}
													</span>
												</div>
											)}
										</div>
									</div>
								)}

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
									{/* 200-Day MA Structural Baseline */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-xs font-bold text-slate-500 block">
											200-Day Moving Average
										</span>
										<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
											<span className="text-xl sm:text-2xl font-bold text-slate-900">
												{ihsgMa200
													? ihsgMa200.toLocaleString("en-US", {
															minimumFractionDigits: 2,
															maximumFractionDigits: 2,
														})
													: "---"}
											</span>
											{ihsgPrice && ihsgMa200 && (
												<span
													className={`text-xs font-bold ${
														ihsgPrice >= ihsgMa200
															? "text-emerald-700"
															: "text-rose-700"
													}`}
												>
													{distancePct(ihsgPrice, ihsgMa200)! >= 0 ? "+" : ""}
													{distancePct(ihsgPrice, ihsgMa200)?.toFixed(1)}%
												</span>
											)}
										</div>
										<p className="text-xs text-slate-500">
											50-day average:{" "}
											<strong>
												{ihsgMa50
													? ihsgMa50.toLocaleString("en-US", {
															minimumFractionDigits: 2,
															maximumFractionDigits: 2,
														})
													: "---"}
											</strong>{" "}
											| 52-week drawdown:{" "}
											<strong>
												{ihsgDd != null ? `${ihsgDd.toFixed(1)}%` : "---"}
											</strong>
										</p>
									</div>

									{/* ID 10Y Yield */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-xs font-bold text-slate-500 block">
											BI Policy Rate
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-bold text-slate-900">
												{latestBiRate != null
													? `${latestBiRate.toFixed(2)}%`
													: "---"}
											</span>
										</div>
										<p className="text-xs text-slate-500">
											Policy observation:{" "}
											<strong>
												{biRateSeries?.at(-1)?.date ?? "Unavailable"}
											</strong>{" "}
											| IDR 50D:{" "}
											<strong>
												{idrMa50
													? `Rp ${Math.round(idrMa50).toLocaleString("id-ID")}`
													: "---"}
											</strong>
										</p>
									</div>

									{/* Indo-US 10Y Yield Spread */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-xs font-bold text-slate-500 block">
											Real BI Policy Rate
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-bold text-slate-900">
												{realBiRate != null
													? `${realBiRate >= 0 ? "+" : ""}${realBiRate.toFixed(2)}%`
													: "---"}
											</span>
										</div>
										<p className="text-xs text-slate-500">
											BI rate minus CPI YoY. Sovereign yield-spread adjustment
											is unavailable and excluded from scoring.
										</p>
									</div>

									{/* Indonesia CPI YoY */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-xs font-bold text-slate-500 block">
											Indonesia CPI Inflation (YoY)
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-bold text-slate-900">
												{latestIdCpi != null
													? `${latestIdCpi.toFixed(2)}%`
													: "---"}
											</span>
											{latestIdCpi != null && (
												<span
													className={`text-xs font-bold ${
														latestIdCpi >= 1.5 && latestIdCpi <= 3.5
															? "text-emerald-700"
															: "text-amber-800"
													}`}
												>
													{latestIdCpi >= 1.5 && latestIdCpi <= 3.5
														? "In BI Target Corridor"
														: "Outside Corridor"}
												</span>
											)}
										</div>
										<p className="text-xs text-slate-500">
											Bank Indonesia Target Corridor: 1.5% - 3.5%
										</p>
									</div>
								</div>

								{/* Sector Leadership Strip */}
								<div className="space-y-3 pt-3 border-t border-slate-100">
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
										<div className="flex items-center gap-2">
											<TrendingUp className="w-4 h-4 text-slate-600" />
											<span className="text-xs font-bold text-slate-900 tracking-tight">
												Sector bellwethers
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span
												className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
													expandingSectorsCount >= 4
														? "bg-emerald-50 text-emerald-700 border-emerald-200"
														: expandingSectorsCount <= 2
															? "bg-rose-50 text-rose-700 border-rose-200"
															: "bg-slate-50 text-slate-700 border-slate-200"
												}`}
											>
												{expandingSectorsCount}/{totalSectorsCount} Sectors &gt;
												50D MA
											</span>
											<span className="text-xs font-bold text-slate-500 hidden sm:inline">
												50D MA Momentum
											</span>
										</div>
									</div>

									<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
										{sectorBellwethers.map((s) => {
											const isAbove = s.dist50 != null && s.dist50 >= 0;
											return (
												<div
													key={s.symbol}
													className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1.5"
												>
													<div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
														<span className="text-xs font-bold text-slate-900 tabular-nums">
															{s.ticker}
														</span>
														<span className="text-xs font-bold text-slate-500">
															{s.sector}
														</span>
													</div>
													<div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
														<span className="text-sm font-bold text-slate-800">
															{s.price != null
																? `Rp ${s.price.toLocaleString("id-ID")}`
																: "---"}
														</span>
														{s.changePct != null && (
															<span
																className={`text-xs font-bold ${
																	s.changePct >= 0
																		? "text-emerald-700"
																		: "text-rose-700"
																}`}
															>
																{s.changePct >= 0 ? "+" : ""}
																{s.changePct.toFixed(1)}%
															</span>
														)}
													</div>
													<div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-1 border-t border-slate-200/60 text-xs">
														<span className="text-slate-500 font-medium">
															vs 50D MA:
														</span>
														{s.dist50 != null ? (
															<span
																className={`font-bold ${
																	isAbove ? "text-emerald-700" : "text-rose-700"
																}`}
															>
																{isAbove ? "+" : ""}
																{s.dist50.toFixed(1)}%
															</span>
														) : (
															<span className="text-slate-500 font-medium">
																---
															</span>
														)}
													</div>
												</div>
											);
										})}
									</div>
								</div>

								{/* Live IDX setups to review */}
								{ihsgFlows?.topAlphaPicks &&
									ihsgFlows.topAlphaPicks.length > 0 && (
										<div className="space-y-3 pt-4 border-t border-slate-100">
											<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
												<div>
													<span className="text-xs font-bold text-slate-900 tracking-tight block">
														IDX setups to review
													</span>
													<span className="text-xs text-slate-500 font-medium">
														Liquid institutional setups filtered by VWAP
														absorption, foreign participation, and tick-valid
														R:R
													</span>
												</div>
												<Link
													href="/utils/stock-explorer"
													className="inline-flex min-h-11 shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 !text-white text-xs font-bold transition-colors self-start sm:self-auto !no-underline"
												>
													<span>Open screener</span>
													<ArrowUpRight className="w-3.5 h-3.5 !text-slate-300" />
												</Link>
											</div>

											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
												{ihsgFlows.topAlphaPicks.slice(0, 4).map((pick) => (
													<Link
														key={pick.code}
														href={`/utils/stock-explorer?q=${pick.code}`}
														className="p-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-indigo-200 hover:shadow-xs transition-colors flex flex-col justify-between gap-2.5 !no-underline group"
													>
														<div>
															<div className="flex items-center justify-between gap-2">
																<span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tabular-nums">
																	{pick.code}
																</span>
																<span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 truncate">
																	{pick.opportunity}
																</span>
															</div>
															<p className="text-xs font-medium text-slate-500 truncate mt-0.5">
																{pick.name}
															</p>
														</div>

														<div className="flex items-baseline justify-between pt-1">
															<span className="text-sm font-bold text-slate-900">
																Rp {pick.close.toLocaleString("id-ID")}
															</span>
															<span
																className={`text-xs font-bold ${
																	pick.changePct >= 0
																		? "text-emerald-700"
																		: "text-rose-700"
																}`}
															>
																{pick.changePct >= 0 ? "+" : ""}
																{pick.changePct.toFixed(2)}%
															</span>
														</div>

														<div className="pt-2 border-t border-slate-200/60 space-y-1 text-xs">
															<div className="flex justify-between text-slate-500">
																<span>Entry / Stop:</span>
																<span className="tabular-nums font-bold text-slate-700">
																	Rp {pick.close.toLocaleString("id-ID")} /{" "}
																	{pick.stopLoss.toLocaleString("id-ID")}
																</span>
															</div>
															<div className="flex justify-between text-slate-500">
																<span>
																	Target 1 ({pick.rrr.toFixed(2)} net R
																	{pick.rrr < 2 ? ", below minimum" : ""}):
																</span>
																<span className="tabular-nums font-bold text-emerald-700">
																	Rp {pick.target1.toLocaleString("id-ID")}
																</span>
															</div>
														</div>
													</Link>
												))}
											</div>
										</div>
									)}
							</div>
						)}

						{activeTab === "crypto" && (
							<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
									<div>
										<h3 className="text-base sm:text-lg font-bold text-slate-900">
											Crypto
										</h3>
										<p className="text-xs text-slate-500 font-medium">
											Bitcoin Valuation, Stablecoin Flows, and Halving Cycle
										</p>
									</div>
									<span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
										BTC / ETH Spot &amp; Derivatives
									</span>
								</div>

								{/* Crypto Market Synthesis & Action Takeaway */}
								<div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/80 space-y-1">
									<span className="text-xs font-bold text-indigo-800 block">
										Crypto outlook
									</span>
									<p className="text-xs font-semibold text-slate-700 leading-relaxed">
										{btcQuote?.last != null && btcMa200 != null
											? `BTC ($${Math.round(btcQuote.last).toLocaleString("en-US")}) trades ${btcQuote.last >= btcMa200 ? "above" : "below"} its 200D MA ($${Math.round(btcMa200).toLocaleString("en-US")}).`
											: "Monitoring Bitcoin structural 200D MA baseline."}{" "}
										{impliedRealizedPrice != null &&
											`Implied MVRV 1.0x Realized Floor sits near $${Math.round(impliedRealizedPrice * DEFAULT_THRESHOLDS.crypto.mvrv.accumulation).toLocaleString("en-US")} with ${DEFAULT_THRESHOLDS.crypto.mvrv.overheat.toFixed(1)}x Cycle Overheat at $${Math.round(impliedRealizedPrice * DEFAULT_THRESHOLDS.crypto.mvrv.overheat).toLocaleString("en-US")}. `}
										{btcQuote?.last != null &&
										btcMa200 != null &&
										btcQuote.last >= btcMa200 &&
										(flows?.stablecoin30dChangePct ?? 0) >= 0
											? "Suggestion: Spot trend and stablecoin liquidity are constructive; favor BTC/ETH spot and respect altcoin dominance gates."
											: mvrvRatio != null &&
													mvrvRatio <=
														DEFAULT_THRESHOLDS.crypto.mvrv.accumulation
												? "Suggestion: On-chain valuation is in deep value floor; deploy spot BTC cold-storage tranches while avoiding leverage."
												: "Suggestion: Defensive or range-bound conditions; keep dry powder in USDC/USDT and restrict entries to major support."}
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{/* On-Chain MVRV Z-Score / Ratio */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-xs font-bold text-slate-500 block">
											Bitcoin MVRV Valuation
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
												{mvrvRatio != null ? mvrvRatio.toFixed(2) : "---"}
											</span>
											{mvrvRatio != null && (
												<span
													className={`text-xs font-bold px-2 py-0.5 rounded ${
														mvrvRatio <=
														DEFAULT_THRESHOLDS.crypto.mvrv.accumulation
															? "bg-emerald-100 text-emerald-800"
															: mvrvRatio >=
																	DEFAULT_THRESHOLDS.crypto.mvrv.overheat
																? "bg-rose-100 text-rose-800"
																: "bg-slate-200 text-slate-700"
													}`}
												>
													{mvrvRatio <=
													DEFAULT_THRESHOLDS.crypto.mvrv.accumulation
														? "Deep Value"
														: mvrvRatio >=
																DEFAULT_THRESHOLDS.crypto.mvrv.overheat
															? "Cycle Overheat"
															: "Neutral Zone"}
												</span>
											)}
										</div>
										<p className="text-xs text-slate-500">
											{impliedRealizedPrice != null
												? `1.0x Floor: $${Math.round(impliedRealizedPrice * DEFAULT_THRESHOLDS.crypto.mvrv.accumulation).toLocaleString("en-US")} | ${DEFAULT_THRESHOLDS.crypto.mvrv.overheat.toFixed(1)}x Top: $${Math.round(impliedRealizedPrice * DEFAULT_THRESHOLDS.crypto.mvrv.overheat).toLocaleString("en-US")}`
												: `Accumulation: < ${DEFAULT_THRESHOLDS.crypto.mvrv.accumulation.toFixed(2)} | Overheat: > ${DEFAULT_THRESHOLDS.crypto.mvrv.overheat.toFixed(2)}`}
										</p>
									</div>

									{/* Stablecoin Net Flow */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-xs font-bold text-slate-500 block">
											Stablecoin 30D Net Issuance
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
												{flows?.stablecoin30dChangePct != null
													? `${flows.stablecoin30dChangePct >= 0 ? "+" : ""}${flows.stablecoin30dChangePct.toFixed(2)}%`
													: "---"}
											</span>
										</div>
										<p className="text-xs text-slate-500">
											Total:{" "}
											<strong>
												{flows?.totalStablecoinSupplyUsd
													? flows.totalStablecoinSupplyUsd >= 1e12
														? `$${(flows.totalStablecoinSupplyUsd / 1e12).toFixed(2)}T`
														: `$${(flows.totalStablecoinSupplyUsd / 1e9).toFixed(1)}B`
													: "---"}
											</strong>{" "}
											(DefiLlama)
										</p>
									</div>

									{/* BTC Funding Rate & Open Interest */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-xs font-bold text-slate-500 block">
											BTC Perp Funding Rate (8h)
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
												{flows?.btcFundingRate8hPct != null
													? `${flows.btcFundingRate8hPct >= 0 ? "+" : ""}${flows.btcFundingRate8hPct.toFixed(3)}%`
													: "---"}
											</span>
											{flows?.btcOpenInterestUsd != null &&
												flows.btcOpenInterestUsd > 0 && (
													<span className="text-xs font-bold text-slate-600 tabular-nums">
														OI: ${(flows.btcOpenInterestUsd / 1e9).toFixed(2)}B
													</span>
												)}
										</div>
										<p className="text-xs text-slate-500">
											Overheated threshold: &gt; +0.03% (OKX Perps)
										</p>
									</div>

									{/* BTC Dominance */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-xs font-bold text-slate-500 block">
											Bitcoin Dominance
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
												{data.markets.cryptoGlobal?.btcDominance
													? `${data.markets.cryptoGlobal.btcDominance.toFixed(1)}%`
													: "---"}
											</span>
										</div>
										<p className="text-xs text-slate-500">
											Altcoin gate threshold: &lt;={" "}
											{DEFAULT_THRESHOLDS.crypto.altcoinBtcDominanceMax.toFixed(
												1,
											)}
											%
										</p>
									</div>

									{/* Halving Cycle Phase */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-xs font-bold text-slate-500 block">
											Halving Cycle Position
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-base sm:text-lg font-bold text-slate-900">
												Month +{halving.monthsElapsed}
											</span>
										</div>
										<p className="text-xs text-slate-500">{halving.phase}</p>
									</div>

									{/* Ethereum & ETH/BTC Ratio */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-xs font-bold text-slate-500 block">
											Ethereum (ETH) Spot
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
												{ethQuote?.last
													? `$${Math.round(ethQuote.last).toLocaleString("en-US")}`
													: "---"}
											</span>
											{ethQuote?.changePct != null && (
												<span
													className={`text-xs font-bold ${
														ethQuote.changePct >= 0
															? "text-emerald-700"
															: "text-rose-700"
													}`}
												>
													{ethQuote.changePct >= 0 ? "+" : ""}
													{ethQuote.changePct.toFixed(2)}%
												</span>
											)}
										</div>
										<p className="text-xs text-slate-500">
											{ethBtcRatio != null
												? `ETH/BTC: ${ethBtcRatio.toFixed(4)}${ethRelChange != null ? ` (${ethRelChange >= 0 ? "+" : ""}${ethRelChange.toFixed(2)}% vs BTC)` : ""}`
												: "Smart-contract platform leader"}
										</p>
									</div>

									{/* Bitcoin 200D MA */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-xs font-bold text-slate-500 block">
											Bitcoin 200D MA Baseline
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
												{btcMa200
													? `$${Math.round(btcMa200).toLocaleString("en-US")}`
													: "---"}
											</span>
											{btcQuote?.last && btcMa200 && (
												<span
													className={`text-xs font-bold ${
														btcQuote.last >= btcMa200
															? "text-emerald-700"
															: "text-rose-700"
													}`}
												>
													{distancePct(btcQuote.last, btcMa200)! >= 0
														? "+"
														: ""}
													{distancePct(btcQuote.last, btcMa200)?.toFixed(1)}%
												</span>
											)}
										</div>
										<p className="text-xs text-slate-500">
											Macro cycle structural trend threshold
										</p>
									</div>
								</div>
							</div>
						)}

						{activeTab === "macro" && (
							<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6">
								{/* Regional Contagion & Shockwave Monitor */}
								<div className="space-y-4">
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
										<div className="flex items-center gap-2.5">
											<Globe className="w-5 h-5 text-indigo-600" />
											<div>
												<h3 className="text-base sm:text-lg font-bold text-slate-900">
													Global markets
												</h3>
												<p className="text-xs text-slate-500 font-medium">
													Overnight US and Asian session anchors affecting IHSG
													&amp; Crypto liquidity
												</p>
											</div>
										</div>
										<span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 self-start sm:self-auto">
											Contagion Monitor
										</span>
									</div>

									{/* Global Macro Synthesis & Action Takeaway */}
									<div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/80 space-y-1">
										<span className="text-xs font-bold text-indigo-800 block">
											Global outlook
										</span>
										<p className="text-xs font-semibold text-slate-700 leading-relaxed">
											{usRealYield != null
												? `US 10Y Real Yield stands at ${usRealYield >= 0 ? "+" : ""}${usRealYield.toFixed(2)}%${dfii10Val != null ? " (TIPS)" : " (Real)"}. `
												: ""}
											{data.markets.quotes.DXY?.last != null &&
												`DXY is at ${data.markets.quotes.DXY.last.toFixed(2)}${data.markets.quotes.VIX?.last != null ? ` with CBOE VIX at ${data.markets.quotes.VIX.last.toFixed(2)}` : ""}. `}
											{(data.markets.quotes.VIX?.last ?? 0) >= 25 ||
											(usRealYield ?? 0) >= 2.2
												? "Suggestion: Tight global discount rates or elevated VIX volatility restrict foreign inflows; cap swing sizing across IDX and Crypto."
												: "Suggestion: Benign global volatility and manageable real yields support cross-border risk appetite into emerging markets and digital assets."}
										</p>
									</div>

									<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
										{regionalAnchors.map((item) => {
											const changePct = item.quote?.changePct ?? null;
											const isDownSevere =
												!item.inverse && changePct != null && changePct <= -1.5;
											const isVixSpike =
												item.id === "VIX" &&
												((item.quote?.last ?? 0) >= 20 ||
													(changePct != null && changePct >= 10));

											const isWarning = isDownSevere || isVixSpike;
											const isPositive =
												item.inverse && changePct != null
													? changePct <= 0
													: changePct != null && changePct >= 0;

											return (
												<div
													key={item.id}
													className={`p-3 sm:p-3.5 rounded-2xl border transition-colors ${
														isWarning
															? "bg-rose-50/50 border-rose-200/90 shadow-2xs"
															: "bg-slate-50/60 border-slate-200/70"
													}`}
												>
													<div className="flex flex-wrap items-center justify-between gap-1 mb-1">
														<span className="min-w-0 break-words text-xs font-bold text-slate-900">
															{item.name}
														</span>
														{isWarning && (
															<span className="text-xs font-bold text-rose-700 bg-rose-100/90 px-1.5 py-0.5 rounded">
																Alert
															</span>
														)}
													</div>
													<div className="flex flex-wrap items-baseline justify-between gap-1">
														<span className="text-sm font-bold tabular-nums text-slate-900">
															{item.quote?.last != null
																? item.id === "US10Y" || item.id === "VIX"
																	? item.quote.last.toFixed(2)
																	: item.quote.last.toLocaleString("en-US", {
																			minimumFractionDigits: 1,
																			maximumFractionDigits: 2,
																		})
																: "---"}
														</span>
														{changePct != null && (
															<span
																className={`text-xs font-bold flex items-center gap-0.5 ${
																	isPositive
																		? "text-emerald-700"
																		: "text-rose-700"
																}`}
															>
																{changePct >= 0 ? (
																	<TrendingUp className="w-3 h-3" />
																) : (
																	<TrendingDown className="w-3 h-3" />
																)}
																{changePct >= 0 ? "+" : ""}
																{changePct.toFixed(2)}%
															</span>
														)}
													</div>
													<span className="text-xs font-semibold text-slate-500 block mt-1 truncate">
														{item.region}
													</span>
												</div>
											);
										})}
									</div>
								</div>

								{/* Global Commodities Barometer */}
								<div className="pt-4 border-t border-slate-100 space-y-3">
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
										<div className="flex items-center gap-2">
											<TrendingUp className="w-4 h-4 text-slate-600" />
											<h4 className="text-xs font-bold text-slate-700">
												Commodities
											</h4>
										</div>
										<span className="text-xs font-bold text-slate-500">
											Indonesian Trade Balance &amp; Inflation Drivers
										</span>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
										{commodityAnchors.map((c) => {
											const changePct = c.quote?.changePct ?? null;
											const isPositive = changePct != null && changePct >= 0;
											return (
												<div
													key={c.id}
													className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-1.5"
												>
													<div className="flex items-center justify-between">
														<span className="text-xs font-bold text-slate-900">
															{c.name}
														</span>
														<span className="text-xs font-bold text-slate-500">
															USD
														</span>
													</div>
													<div className="flex items-baseline justify-between">
														<span className="text-base sm:text-lg font-bold tabular-nums text-slate-900">
															{c.quote?.last != null
																? `$${c.quote.last.toLocaleString("en-US", {
																		minimumFractionDigits: 2,
																		maximumFractionDigits: 2,
																	})}`
																: "---"}
														</span>
														{changePct != null && (
															<span
																className={`text-xs font-bold flex items-center gap-0.5 ${
																	isPositive
																		? "text-emerald-700"
																		: "text-rose-700"
																}`}
															>
																{isPositive ? "+" : ""}
																{changePct.toFixed(2)}%
															</span>
														)}
													</div>
													<p className="text-xs font-semibold text-slate-500">
														{c.detail}
													</p>
												</div>
											);
										})}
									</div>
								</div>

								{/* Macro Liquidity Indicators */}
								<div className="pt-4 border-t border-slate-100 space-y-3">
									<div className="flex items-center justify-between">
										<h4 className="text-xs font-bold text-slate-500">
											Rates and liquidity
										</h4>
										<span className="text-xs font-bold text-slate-500">
											FRED Macro Series
										</span>
									</div>
									<MacroLens data={data} />
								</div>
							</div>
						)}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}
