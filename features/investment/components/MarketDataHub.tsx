"use client";

import { useState } from "react";
import {
	Activity,
	Globe,
	LineChart,
	Building2,
	Coins,
	TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { InvestmentCompassData } from "@/features/investment/types";
import {
	sma,
	distancePct,
	drawdownFromHigh,
	getHalvingCyclePhase,
} from "../lib/indicators";

import FearAndGreedGauge from "@/features/investment/components/FearAndGreedGauge";
import MacroLens from "@/features/investment/components/MacroLens";
import GlobalMarkets from "@/features/investment/components/GlobalMarkets";

type TabId = "indonesia" | "crypto" | "macro" | "quotes" | "sentiment";

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
		{ id: "macro", label: "Global Macro", icon: LineChart },
		{ id: "quotes", label: "Global Quotes", icon: Globe },
		{ id: "sentiment", label: "Sentiment Dials", icon: Activity },
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

	// Calculate live Crypto metrics
	const btcQuote = data.markets.quotes.BTC;
	const ethQuote = data.markets.quotes.ETH;
	const btcHistory = data.markets.history?.["BTC-USD"]?.points ?? [];
	const btcMa200 = sma(btcHistory, 200);
	const flows = data.markets.cryptoFlows;
	const halving = getHalvingCyclePhase();

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

				<div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x -mx-2 px-2 sm:mx-0 sm:px-0 relative">
					{/* Continuous hairline track line */}
					<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 rounded-full" />

					{TABS.map((tab) => {
						const isActive = activeTab === tab.id;
						const Icon = tab.icon;
						return (
							<button
								type="button"
								key={tab.id}
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
			<div className="min-h-[500px] relative">
				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
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

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{/* IHSG Spot */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											IHSG Index Level
										</span>
										<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
											<span className="text-xl sm:text-2xl font-black text-slate-900">
												{ihsgPrice
													? ihsgPrice.toLocaleString("en-US", {
															minimumFractionDigits: 2,
															maximumFractionDigits: 2,
														})
													: "---"}
											</span>
											{ihsgQuote?.changePct != null && (
												<span
													className={`text-xs font-bold ${
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
										<p className="text-[11px] text-slate-500">
											52W High:{" "}
											<strong>
												{ihsgQuote?.high52w
													? ihsgQuote.high52w.toLocaleString("en-US", {
															minimumFractionDigits: 2,
															maximumFractionDigits: 2,
														})
													: "---"}
											</strong>
										</p>
									</div>

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
											Intermediate momentum &amp; swing trade baseline
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

									{/* ID 10Y Yield */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Indonesia 10Y Gov Bond Yield
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900">
												{latestIdYield != null
													? `${latestIdYield.toFixed(2)}%`
													: "6.85%"}
											</span>
										</div>
										<p className="text-[11px] text-slate-500">
											Sovereign cost of capital &amp; benchmark discount rate
										</p>
									</div>
								</div>

								{/* Sector Leadership Strip */}
								<div className="space-y-3 pt-3 border-t border-slate-100">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<TrendingUp className="w-4 h-4 text-slate-600" />
											<span className="text-xs font-black text-slate-900 tracking-tight">
												Sector Rotation Bellwethers (IDX)
											</span>
										</div>
										<span className="text-[10px] font-bold text-slate-400">
											50D Moving Average Momentum
										</span>
									</div>

									<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
											Major Cryptocurrencies, Stablecoin Flows, and Halving
											Cycle
										</p>
									</div>
									<span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
										BTC / ETH / SOL
									</span>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{/* Bitcoin */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Bitcoin (BTC) Spot
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900">
												{btcQuote?.last
													? `$${Math.round(btcQuote.last).toLocaleString("en-US")}`
													: "---"}
											</span>
											{btcQuote?.changePct != null && (
												<span
													className={`text-xs font-bold ${
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
										<p className="text-[11px] text-slate-500">
											200D MA:{" "}
											<strong>
												{btcMa200
													? `$${Math.round(btcMa200).toLocaleString("en-US")}`
													: "---"}
											</strong>
										</p>
									</div>

									{/* Ethereum */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Ethereum (ETH) Spot
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900">
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

									{/* Stablecoin Net Flow */}
									<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
										<span className="text-[10px] font-black uppercase text-slate-400 block">
											Stablecoin 30D Net Issuance
										</span>
										<div className="flex items-baseline gap-2">
											<span className="text-xl sm:text-2xl font-black text-slate-900">
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
											<span className="text-xl sm:text-2xl font-black text-slate-900">
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
											<span className="text-xl sm:text-2xl font-black text-slate-900">
												{data.markets.cryptoGlobal?.btcDominance
													? `${data.markets.cryptoGlobal.btcDominance.toFixed(1)}%`
													: "---"}
											</span>
										</div>
										<p className="text-[11px] text-slate-500">
											Altcoin gate threshold: &lt;= 54.0%
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
								</div>
							</div>
						)}

						{/* ── 3. Global Macro Tab ─────────────────────────────── */}
						{activeTab === "macro" && <MacroLens data={data} />}

						{/* ── 4. Global Quotes Tab ────────────────────────────── */}
						{activeTab === "quotes" && <GlobalMarkets data={data} />}

						{/* ── 5. Sentiment Dials Tab ──────────────────────────── */}
						{activeTab === "sentiment" && data.sentiment.traditional && (
							<div className="bg-white p-5 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-xs max-w-2xl mx-auto space-y-6">
								<div className="flex items-center justify-between border-b border-slate-100 pb-4">
									<div>
										<h4 className="text-base sm:text-lg font-black text-slate-900">
											Traditional Market Sentiment Gauge
										</h4>
										<p className="text-xs text-slate-500 font-medium">
											CNN Fear &amp; Greed Composite Index
										</p>
									</div>
								</div>

								{(() => {
									const fng = data.sentiment.traditional.fear_and_greed;
									const historical =
										data.sentiment.traditional.fear_and_greed_historical;
									return (
										<FearAndGreedGauge
											score={fng?.score ?? 50}
											rating={fng?.rating ?? "neutral"}
											previousClose={fng?.previous_close ?? 50}
											previous1Week={fng?.previous_1_week ?? 50}
											previous1Month={fng?.previous_1_month ?? 50}
											previous1Year={fng?.previous_1_year ?? 50}
											historicalData={historical?.data ?? []}
										/>
									);
								})()}
							</div>
						)}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}
