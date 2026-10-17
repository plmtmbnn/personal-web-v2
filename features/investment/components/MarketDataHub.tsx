"use client";

import { useState } from "react";
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

export default function MarketDataHub({
	data,
}: {
	data: InvestmentCompassData;
}) {
	const [activeTab, setActiveTab] = useState<TabId>("indonesia");
	const reduceMotion = useReducedMotion();

	const TABS = [
		{ id: "indonesia", label: "Indonesia (IDX)", icon: Building2 },
		{ id: "crypto", label: "Crypto Majors", icon: Coins },
		{ id: "macro", label: "Global Macro & Contagion", icon: LineChart },
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

	const usdIdrQuote = data.markets.quotes.USDIDR;
	const usdIdrHistory = data.markets.history?.["IDR=X"]?.points ?? [];
	const idrMa50 = sma(usdIdrHistory, 50);

	const idYieldSeries = data.markets.macro?.IRLTLT01IDM156N?.data;
	const latestIdYield =
		idYieldSeries && idYieldSeries.length > 0
			? idYieldSeries[idYieldSeries.length - 1].value
			: null;

	const biRateSeries = data.markets.macro?.IRSTCB01IDM156N?.data;
	const latestBiRate =
		biRateSeries && biRateSeries.length > 0
			? biRateSeries[biRateSeries.length - 1].value
			: null;

	const us10yVal =
		data.markets.quotes.US10Y?.last ??
		data.markets.macro?.DGS10?.data?.slice(-1)[0]?.value ??
		null;
	const yieldSpread =
		latestIdYield != null && us10yVal != null ? latestIdYield - us10yVal : null;

	const idCpiSeries = data.markets.macro?.IDNCPIALLMINMEI?.data;
	const latestIdCpi =
		idCpiSeries && idCpiSeries.length > 0
			? idCpiSeries[idCpiSeries.length - 1].value
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
	const halving = getHalvingCyclePhase();

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
						<h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
							Market Data Terminal
						</h3>
						<p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
							Telemetry &amp; Fundamental Indicators
						</p>
					</div>
				</div>

				<div
					role="tablist"
					aria-label="Market Data Terminal Views"
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
								aria-controls={`tabpanel-${tab.id}`}
								onClick={() => setActiveTab(tab.id)}
								className={`group relative pb-2.5 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-all whitespace-nowrap active:scale-95 touch-manipulation cursor-pointer z-10 ${
									isActive
										? "text-slate-900 font-black"
										: "text-slate-400 hover:text-slate-700 font-semibold"
								}`}
							>
								{/* Razor-thin animated sliding underline indicator */}
								{isActive && (
									<motion.div
										layoutId="marketDataTabIndicator"
										className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full z-20"
										transition={{ type: "spring", stiffness: 400, damping: 30 }}
									/>
								)}
								<Icon
									className={`w-3.5 h-3.5 shrink-0 transition-transform ${
										isActive
											? "text-slate-900 scale-105"
											: "text-slate-400 group-hover:text-slate-600"
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
						aria-labelledby={`tab-${activeTab}`}
						initial={reduceMotion ? false : { opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
						className="w-full"
					>
						{/* ── 1. Indonesia (IDX) Tab ──────────────────────────── */}
						{activeTab === "indonesia" && (
							<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
									<div>
										<h4 className="text-base sm:text-lg font-black text-slate-900">
											Indonesia Domestic Market Data
										</h4>
										<p className="text-xs text-slate-500 font-medium">
											Composite Index (IHSG), Currency, and Sovereign Rates
										</p>
									</div>
									<span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 self-start sm:self-auto">
										IDX Composite (^JKSE)
									</span>
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
													<Flame className="w-5 h-5 text-emerald-600" />
												) : (
													<ShieldAlert className="w-5 h-5 text-rose-600" />
												)}
											</div>
											<div>
												<span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
													Net Foreign Institutional Flow
												</span>
												<span className="text-sm font-black text-slate-900">
													{ihsgFlows.streakDays >= 0
														? `+${ihsgFlows.streakDays}-Day Net Inflow Streak`
														: `${ihsgFlows.streakDays}-Day Net Outflow Streak`}
												</span>
											</div>
										</div>

										<div className="flex items-center gap-3 flex-wrap self-start sm:self-auto text-xs">
											{ihsgFlows.netBuySell1dIdr != null && (
												<div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
													<span className="text-[9px] font-black uppercase text-slate-400 block">
														1-Day Net
													</span>
													<span
														className={`font-black ${
															ihsgFlows.netBuySell1dIdr >= 0
																? "text-emerald-600"
																: "text-rose-600"
														}`}
													>
														{ihsgFlows.netBuySell1dIdr >= 0 ? "+" : ""}Rp{" "}
														{(
															Math.abs(ihsgFlows.netBuySell1dIdr) / 1e9
														).toFixed(1)}
														B
													</span>
												</div>
											)}
											{ihsgFlows.netBuySell5dIdr != null && (
												<div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
													<span className="text-[9px] font-black uppercase text-slate-400 block">
														5-Day Cumulative
													</span>
													<span
														className={`font-black ${
															ihsgFlows.netBuySell5dIdr >= 0
																? "text-emerald-600"
																: "text-rose-600"
														}`}
													>
														{ihsgFlows.netBuySell5dIdr >= 0 ? "+" : ""}Rp{" "}
														{(
															Math.abs(ihsgFlows.netBuySell5dIdr) / 1e9
														).toFixed(1)}
														B
													</span>
												</div>
											)}
										</div>
									</div>
								)}

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{/* 200-Day MA */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											200-Day Moving Average
										</span>
										<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
											<span className="text-xl sm:text-2xl font-black text-slate-900">
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
															? "text-emerald-600"
															: "text-rose-600"
													}`}
												>
													{distancePct(ihsgPrice, ihsgMa200)! >= 0 ? "+" : ""}
													{distancePct(ihsgPrice, ihsgMa200)?.toFixed(1)}%
												</span>
											)}
										</div>
										<p className="text-[11px] text-slate-500">
											Primary long-term structural trend indicator
										</p>
									</div>

									{/* 50-Day MA */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											50-Day Moving Average
										</span>
										<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
											<span className="text-xl sm:text-2xl font-black text-slate-900">
												{ihsgMa50
													? ihsgMa50.toLocaleString("en-US", {
															minimumFractionDigits: 2,
															maximumFractionDigits: 2,
														})
													: "---"}
											</span>
											{ihsgPrice && ihsgMa50 && (
												<span
													className={`text-xs font-bold ${
														ihsgPrice >= ihsgMa50
															? "text-emerald-600"
															: "text-rose-600"
													}`}
												>
													{distancePct(ihsgPrice, ihsgMa50)! >= 0 ? "+" : ""}
													{distancePct(ihsgPrice, ihsgMa50)?.toFixed(1)}%
												</span>
											)}
										</div>
										<p className="text-[11px] text-slate-500">
											Intermediate momentum &amp; swing baseline
										</p>
									</div>

									{/* 52W Drawdown */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Drawdown from 52-Week High
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900">
												{ihsgDd != null ? `${ihsgDd.toFixed(2)}%` : "---"}
											</span>
										</div>
										<p className="text-[11px] text-slate-500">
											Bear market threshold: -20%
										</p>
									</div>

									{/* USD/IDR */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											USD/IDR Exchange Rate
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900">
												{usdIdrQuote?.last
													? `Rp ${Math.round(usdIdrQuote.last).toLocaleString("id-ID")}`
													: "---"}
											</span>
											{usdIdrQuote?.changePct != null && (
												<span
													className={`text-xs font-bold ${
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
										<p className="text-[11px] text-slate-500">
											50D MA:{" "}
											<strong>
												{idrMa50
													? `Rp ${Math.round(idrMa50).toLocaleString("id-ID")}`
													: "---"}
											</strong>
										</p>
									</div>

									{/* Bank Indonesia Rate */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Bank Indonesia Benchmark Rate
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900">
												{latestBiRate != null
													? `${latestBiRate.toFixed(2)}%`
													: "---"}
											</span>
										</div>
										<p className="text-[11px] text-slate-500">
											Domestic banking cost of funds
										</p>
									</div>

									{/* ID 10Y Yield */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Indonesia 10Y Gov Bond Yield
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900">
												{latestIdYield != null
													? `${latestIdYield.toFixed(2)}%`
													: "---"}
											</span>
										</div>
										<p className="text-[11px] text-slate-500">
											Sovereign borrowing benchmark rate
										</p>
									</div>

									{/* Indo-US 10Y Yield Spread */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Indo-US 10Y Yield Spread
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900">
												{yieldSpread != null
													? `${yieldSpread >= 0 ? "+" : ""}${yieldSpread.toFixed(2)}%`
													: "---"}
											</span>
											{yieldSpread != null && (
												<span
													className={`text-xs font-bold ${
														yieldSpread >= 2.0
															? "text-emerald-600"
															: yieldSpread >= 1.5
																? "text-amber-600"
																: "text-rose-600"
													}`}
												>
													{yieldSpread >= 2.0
														? "Healthy Carry"
														: yieldSpread >= 1.5
															? "Moderate Buffer"
															: "Compression Risk"}
												</span>
											)}
										</div>
										<p className="text-[11px] text-slate-500">
											Sovereign risk &amp; Rupiah carry premium buffer
										</p>
									</div>

									{/* Indonesia CPI YoY */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Indonesia CPI Inflation (YoY)
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900">
												{latestIdCpi != null
													? `${latestIdCpi.toFixed(2)}%`
													: "---"}
											</span>
											{latestIdCpi != null && (
												<span
													className={`text-xs font-bold ${
														latestIdCpi >= 1.5 && latestIdCpi <= 3.5
															? "text-emerald-600"
															: "text-amber-600"
													}`}
												>
													{latestIdCpi >= 1.5 && latestIdCpi <= 3.5
														? "In BI Target Corridor"
														: "Outside Corridor"}
												</span>
											)}
										</div>
										<p className="text-[11px] text-slate-500">
											Bank Indonesia Target Corridor: 1.5% - 3.5%
										</p>
									</div>
								</div>

								{/* Sector Leadership Strip */}
								<div className="space-y-3 pt-3 border-t border-slate-100">
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
										<div className="flex items-center gap-2">
											<TrendingUp className="w-4 h-4 text-slate-600" />
											<span className="text-xs font-black text-slate-900 tracking-tight">
												Sector Rotation Bellwethers (IDX)
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span
												className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border ${
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
											<span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
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
													<div className="flex items-center justify-between">
														<span className="text-xs font-black text-slate-900 font-mono">
															{s.ticker}
														</span>
														<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
															{s.sector}
														</span>
													</div>
													<div className="flex items-baseline justify-between">
														<span className="text-sm font-black text-slate-800">
															{s.price != null
																? `Rp ${s.price.toLocaleString("id-ID")}`
																: "---"}
														</span>
														{s.changePct != null && (
															<span
																className={`text-[11px] font-bold ${
																	s.changePct >= 0
																		? "text-emerald-600"
																		: "text-rose-600"
																}`}
															>
																{s.changePct >= 0 ? "+" : ""}
																{s.changePct.toFixed(1)}%
															</span>
														)}
													</div>
													<div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
														<span className="text-slate-400 font-medium">
															vs 50D MA:
														</span>
														{s.dist50 != null ? (
															<span
																className={`font-black ${
																	isAbove ? "text-emerald-700" : "text-rose-600"
																}`}
															>
																{isAbove ? "+" : ""}
																{s.dist50.toFixed(1)}%
															</span>
														) : (
															<span className="text-slate-400 font-medium">
																---
															</span>
														)}
													</div>
												</div>
											);
										})}
									</div>
								</div>
							</div>
						)}

						{/* ── 2. Crypto Majors Tab ────────────────────────────── */}
						{activeTab === "crypto" && (
							<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6">
								<div className="flex items-center justify-between border-b border-slate-100 pb-4">
									<div>
										<h4 className="text-base sm:text-lg font-black text-slate-900">
											Digital Asset Metrics &amp; Liquidity
										</h4>
										<p className="text-xs text-slate-500 font-medium">
											Bitcoin Valuation, Stablecoin Flows, and Halving Cycle
										</p>
									</div>
									<span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
										BTC / ETH Spot &amp; Derivatives
									</span>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{/* On-Chain MVRV Z-Score / Ratio */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Bitcoin MVRV Valuation
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
												{mvrvRatio != null ? mvrvRatio.toFixed(2) : "---"}
											</span>
											{mvrvRatio != null && (
												<span
													className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
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
										<p className="text-[11px] text-slate-500">
											Accumulation: &lt;{" "}
											{DEFAULT_THRESHOLDS.crypto.mvrv.accumulation.toFixed(2)} |
											Overheat: &gt;{" "}
											{DEFAULT_THRESHOLDS.crypto.mvrv.overheat.toFixed(2)}
										</p>
									</div>

									{/* Stablecoin Net Flow */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Stablecoin 30D Net Issuance
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
												{flows?.stablecoin30dChangePct != null
													? `${flows.stablecoin30dChangePct >= 0 ? "+" : ""}${flows.stablecoin30dChangePct.toFixed(2)}%`
													: "---"}
											</span>
										</div>
										<p className="text-[11px] text-slate-500">
											Total:{" "}
											<strong>
												{flows?.totalStablecoinSupplyUsd
													? `$${(flows.totalStablecoinSupplyUsd / 1e9).toFixed(1)}B`
													: "---"}
											</strong>{" "}
											(DefiLlama)
										</p>
									</div>

									{/* BTC Funding Rate */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											BTC Perp Funding Rate (8h)
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
												{flows?.btcFundingRate8hPct != null
													? `${flows.btcFundingRate8hPct >= 0 ? "+" : ""}${flows.btcFundingRate8hPct.toFixed(3)}%`
													: "---"}
											</span>
										</div>
										<p className="text-[11px] text-slate-500">
											Overheated threshold: &gt; +0.03%
										</p>
									</div>

									{/* BTC Dominance */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Bitcoin Dominance
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
												{data.markets.cryptoGlobal?.btcDominance
													? `${data.markets.cryptoGlobal.btcDominance.toFixed(1)}%`
													: "---"}
											</span>
										</div>
										<p className="text-[11px] text-slate-500">
											Altcoin gate threshold: &lt;={" "}
											{DEFAULT_THRESHOLDS.crypto.altcoinBtcDominanceMax.toFixed(
												1,
											)}
											%
										</p>
									</div>

									{/* Halving Cycle Phase */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Halving Cycle Position
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-base sm:text-lg font-black text-slate-900">
												Month +{halving.monthsElapsed}
											</span>
										</div>
										<p className="text-[11px] text-slate-500">
											{halving.phase}
										</p>
									</div>

									{/* Ethereum */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Ethereum (ETH) Spot
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
												{ethQuote?.last
													? `$${Math.round(ethQuote.last).toLocaleString("en-US")}`
													: "---"}
											</span>
											{ethQuote?.changePct != null && (
												<span
													className={`text-xs font-bold ${
														ethQuote.changePct >= 0
															? "text-emerald-600"
															: "text-rose-600"
													}`}
												>
													{ethQuote.changePct >= 0 ? "+" : ""}
													{ethQuote.changePct.toFixed(2)}%
												</span>
											)}
										</div>
										<p className="text-[11px] text-slate-500">
											Smart-contract platform leader
										</p>
									</div>

									{/* Bitcoin 200D MA */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Bitcoin 200D MA Baseline
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
												{btcMa200
													? `$${Math.round(btcMa200).toLocaleString("en-US")}`
													: "---"}
											</span>
											{btcQuote?.last && btcMa200 && (
												<span
													className={`text-xs font-bold ${
														btcQuote.last >= btcMa200
															? "text-emerald-600"
															: "text-rose-600"
													}`}
												>
													{distancePct(btcQuote.last, btcMa200)! >= 0
														? "+"
														: ""}
													{distancePct(btcQuote.last, btcMa200)?.toFixed(1)}%
												</span>
											)}
										</div>
										<p className="text-[11px] text-slate-500">
											Macro cycle structural trend threshold
										</p>
									</div>
								</div>
							</div>
						)}

						{/* ── 3. Global Macro & Regional Contagion Tab ────────── */}
						{activeTab === "macro" && (
							<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6">
								{/* Regional Contagion & Shockwave Monitor */}
								<div className="space-y-4">
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
										<div className="flex items-center gap-2.5">
											<Globe className="w-5 h-5 text-indigo-600" />
											<div>
												<h4 className="text-base sm:text-lg font-black text-slate-900">
													Regional Market Transmission Pulse
												</h4>
												<p className="text-xs text-slate-500 font-medium">
													Overnight US and Asian session anchors affecting IHSG
													&amp; Crypto liquidity
												</p>
											</div>
										</div>
										<span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 self-start sm:self-auto">
											Contagion Monitor
										</span>
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
													className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
														isWarning
															? "bg-rose-50/50 border-rose-200/90 shadow-2xs"
															: "bg-slate-50/60 border-slate-200/70"
													}`}
												>
													<div className="flex items-center justify-between gap-1 mb-1">
														<span className="text-xs font-black text-slate-900 truncate">
															{item.name}
														</span>
														{isWarning && (
															<span className="text-[9px] font-black uppercase text-rose-700 bg-rose-100/90 px-1.5 py-0.5 rounded">
																Alert
															</span>
														)}
													</div>
													<div className="flex items-baseline justify-between gap-1">
														<span className="text-sm font-black font-mono text-slate-900">
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
																className={`text-[11px] font-bold flex items-center gap-0.5 ${
																	isPositive
																		? "text-emerald-600"
																		: "text-rose-600"
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
													<span className="text-[10px] font-semibold text-slate-400 block mt-1 truncate">
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
											<h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
												Global Commodities &amp; Energy Transmission
											</h4>
										</div>
										<span className="text-[10px] font-bold text-slate-400">
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
														<span className="text-xs font-black text-slate-900">
															{c.name}
														</span>
														<span className="text-[10px] font-bold text-slate-400">
															USD
														</span>
													</div>
													<div className="flex items-baseline justify-between">
														<span className="text-base sm:text-lg font-black font-mono text-slate-900">
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
																		? "text-emerald-600"
																		: "text-rose-600"
																}`}
															>
																{isPositive ? "+" : ""}
																{changePct.toFixed(2)}%
															</span>
														)}
													</div>
													<p className="text-[10px] font-semibold text-slate-500">
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
										<h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
											Systemic Discount Rate &amp; Liquidity Signals
										</h4>
										<span className="text-[10px] font-bold text-slate-400">
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
