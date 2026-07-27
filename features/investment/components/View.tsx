"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import StockTicker from "@/features/shared/components/StockTicker";
import {
	TrendingUp,
	ChevronRight,
	Loader2,
	RefreshCw,
	Layers,
	Zap,
	Table as TableIcon,
	ShieldAlert,
	Sparkles,
	Compass,
	Flame,
} from "lucide-react";
import PinGuard from "@/features/auth/PinGuard";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { getFearAndGreedData } from "@/features/investment/actions";
import type { FearAndGreedData } from "@/features/investment/types";
import FearAndGreedGauge from "@/features/investment/components/FearAndGreedGauge";
import SentimentCard from "@/features/investment/components/SentimentCard";

type CategoryFilter =
	| "all"
	| "momentum"
	| "breadth"
	| "volatility"
	| "safe_haven";

export default function InvestmentPage() {
	const reduceMotion = useReducedMotion();
	const [marketData, setMarketData] = useState<FearAndGreedData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await getFearAndGreedData();
			if (data) {
				setMarketData(data);
			} else {
				setError("Failed to synchronize market data");
			}
		} catch {
			setError("Operational connection failure");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// All 8 sub-indices mapped with categories
	const allSubIndices = useMemo(() => {
		if (!marketData) return [];
		return [
			{
				title: "Market Momentum (S&P 500)",
				data: marketData.market_momentum_sp500,
				category: "momentum",
			},
			{
				title: "Market Momentum (S&P 125)",
				data: marketData.market_momentum_sp125,
				category: "momentum",
			},
			{
				title: "Stock Price Strength",
				data: marketData.stock_price_strength,
				category: "breadth",
			},
			{
				title: "Stock Price Breadth",
				data: marketData.stock_price_breadth,
				category: "breadth",
			},
			{
				title: "Put and Call Options",
				data: marketData.put_call_options,
				category: "volatility",
			},
			{
				title: "Market Volatility (VIX)",
				data: marketData.market_volatility_vix,
				category: "volatility",
			},
			{
				title: "Junk Bond Demand",
				data: marketData.junk_bond_demand,
				category: "safe_haven",
			},
			{
				title: "Safe Haven Demand",
				data: marketData.safe_haven_demand,
				category: "safe_haven",
			},
		];
	}, [marketData]);

	// Filtered sub-indices
	const filteredSubIndices = useMemo(() => {
		if (activeCategory === "all") return allSubIndices;
		return allSubIndices.filter((item) => item.category === activeCategory);
	}, [allSubIndices, activeCategory]);

	// Strategic Signal Callout computation based on score
	const score = marketData?.fear_and_greed?.score ?? 50;
	const strategicSignal = useMemo(() => {
		if (score < 25) {
			return {
				title: "Extreme Fear Zone",
				subtitle: "Historical Accumulation & Oversold Signals",
				description:
					"Heavy market pessimism and extreme risk aversion. Historically associated with long-term value accumulation opportunities.",
				bg: "bg-rose-900/90 text-rose-50 border-rose-700/50",
				badge: "bg-rose-500 text-white",
				icon: ShieldAlert,
			};
		}
		if (score < 45) {
			return {
				title: "Fear Zone",
				subtitle: "Risk-Off Defensive Sentiment",
				description:
					"Elevated caution across market participants. Defensive sector rotation and selective positioning recommended.",
				bg: "bg-orange-950/80 text-orange-50 border-orange-700/50",
				badge: "bg-orange-500 text-white",
				icon: Flame,
			};
		}
		if (score <= 55) {
			return {
				title: "Neutral Market Zone",
				subtitle: "Equilibrium & Balanced Momentum",
				description:
					"Market fundamentals and technicals in balance. Equities consolidating near fair value benchmarks.",
				bg: "bg-slate-900/90 text-slate-100 border-slate-700/50",
				badge: "bg-amber-500 text-slate-950 font-bold",
				icon: Compass,
			};
		}
		if (score <= 75) {
			return {
				title: "Greed Zone",
				subtitle: "Bullish Inflow & Positive Trend",
				description:
					"Strong buying momentum across broad market equities. Capital inflows surging with elevated risk appetite.",
				bg: "bg-emerald-950/80 text-emerald-50 border-emerald-700/50",
				badge: "bg-emerald-500 text-white",
				icon: TrendingUp,
			};
		}
		return {
			title: "Extreme Greed Zone",
			subtitle: "Overheated Risk Appetite & Caution Signal",
			description:
				"Heightened market euphoria and extended valuations. Increased probability of short-term volatility or pullbacks.",
			bg: "bg-teal-950/90 text-teal-50 border-teal-700/50",
			badge: "bg-teal-400 text-slate-950 font-bold",
			icon: Sparkles,
		};
	}, [score]);

	const SignalIcon = strategicSignal.icon;

	const filterOptions = [
		{ label: "All Factors", value: "all" },
		{ label: "Momentum", value: "momentum" },
		{ label: "Breadth & Strength", value: "breadth" },
		{ label: "Options & VIX", value: "volatility" },
		{ label: "Safe Havens", value: "safe_haven" },
	];

	return (
		<PinGuard>
			<main className="min-h-screen bg-slate-50/50 pb-24">
				{/* ── Structural Hero Header ───────────────────────────────────── */}
				<div className="bg-slate-900 border-b border-slate-800 mb-8 pt-8 pb-10 text-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.25em]">
									<TrendingUp className="w-4 h-4 text-indigo-400" />
									Market Intelligence Engine
								</div>
								<h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
									Fear & Greed Index
								</h1>
								<div className="flex items-center gap-2 text-xs font-medium text-slate-400">
									<Link
										href="/"
										className="hover:text-indigo-300 transition-colors"
									>
										Home
									</Link>
									<ChevronRight className="w-3 h-3 opacity-40" />
									<span className="text-slate-200">Sentiment Dashboard</span>
								</div>
							</div>

							{/* Header Actions */}
							<div className="flex flex-wrap items-center gap-3 p-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
								<Link
									href="/utils/stock-explorer"
									className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-500 transition-all shadow-md active:scale-95 cursor-pointer"
								>
									<TableIcon className="w-4 h-4" />
									<span>Stock Explorer</span>
								</Link>

								{/* Connection Status */}
								<div className="px-3.5 py-1.5 text-center border-l border-slate-700/80 hidden sm:block">
									<p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
										Sync Status
									</p>
									<div className="flex items-center justify-center gap-1.5">
										<div
											className={`w-2 h-2 rounded-full ${isLoading ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`}
										/>
										<span className="text-[10px] font-black text-white uppercase tracking-wider">
											{isLoading ? "Syncing" : "Live"}
										</span>
									</div>
								</div>

								{/* Refresh Button */}
								<button
									type="button"
									onClick={fetchData}
									disabled={isLoading}
									aria-label="Refresh market data"
									className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all disabled:opacity-30 cursor-pointer"
								>
									<RefreshCw
										className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
									/>
								</button>
							</div>
						</div>
					</div>
				</div>

				<StockTicker />

				<div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
					{/* ── Strategic Signal Callout Banner ────────────────────────── */}
					{marketData && !isLoading && !error && (
						<motion.div
							initial={reduceMotion ? false : { opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className={`p-6 sm:p-8 rounded-3xl border shadow-lg ${strategicSignal.bg} flex flex-col md:flex-row md:items-center justify-between gap-6`}
						>
							<div className="flex items-start gap-4">
								<div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
									<SignalIcon className="w-6 h-6 text-white" />
								</div>
								<div className="space-y-1">
									<div className="flex items-center gap-2 flex-wrap">
										<span
											className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest ${strategicSignal.badge}`}
										>
											{strategicSignal.title}
										</span>
										<span className="text-xs font-bold text-slate-300">
											Score: {Math.round(score)} / 100
										</span>
									</div>
									<h2 className="text-lg font-black tracking-tight text-white">
										{strategicSignal.subtitle}
									</h2>
									<p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
										{strategicSignal.description}
									</p>
								</div>
							</div>

							<Link
								href="/utils/stock-explorer"
								className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all shadow-md flex-shrink-0 cursor-pointer"
							>
								<span>Explore Market Opportunities</span>
								<ChevronRight className="w-4 h-4" />
							</Link>
						</motion.div>
					)}

					{/* ── Primary Master Gauge Visual ───────────────────────────── */}
					<div className="bg-white p-6 sm:p-10 lg:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm">
						<div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
							<h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2.5">
								<Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
								Strategic Sentiment Analysis
							</h3>
							<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
								Real-Time Aggregate
							</span>
						</div>

						<div className="min-h-[360px] flex items-center justify-center">
							{isLoading ? (
								<div className="flex flex-col items-center gap-4 py-12">
									<Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
									<p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
										Calibrating Market Pulse...
									</p>
								</div>
							) : error ? (
								<div className="text-center p-8 bg-rose-50 rounded-[2rem] border border-rose-100 max-w-md">
									<p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-2">
										{error}
									</p>
									<button
										type="button"
										onClick={fetchData}
										className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-700 transition-all cursor-pointer"
									>
										Force Re-Synchronization
									</button>
								</div>
							) : (
								marketData && (
									<motion.div
										initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
										animate={{ opacity: 1, scale: 1 }}
										className="w-full"
									>
										<FearAndGreedGauge
											score={marketData.fear_and_greed?.score ?? 50}
											rating={marketData.fear_and_greed?.rating ?? "neutral"}
											previousClose={
												marketData.fear_and_greed?.previous_close ?? 50
											}
											previous1Week={
												marketData.fear_and_greed?.previous_1_week ?? 50
											}
											previous1Month={
												marketData.fear_and_greed?.previous_1_month ?? 50
											}
											previous1Year={
												marketData.fear_and_greed?.previous_1_year ?? 50
											}
											historicalData={
												marketData.fear_and_greed_historical?.data ?? []
											}
										/>
									</motion.div>
								)
							)}
						</div>
					</div>

					{/* ── Componentized Factor Matrix Breakdown ───────────────────── */}
					<div className="space-y-6">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
									<Layers className="w-5 h-5" />
								</div>
								<div>
									<h2 className="text-xl font-black text-slate-900 tracking-tight">
										Factor Analysis Matrix
									</h2>
									<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
										8 Core Market Indicators
									</p>
								</div>
							</div>

							{/* Category Filters */}
							<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
								{filterOptions.map((opt) => (
									<button
										key={opt.value}
										type="button"
										onClick={() =>
											setActiveCategory(opt.value as CategoryFilter)
										}
										className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
											activeCategory === opt.value
												? "bg-slate-900 text-white border-slate-900 shadow-sm"
												: "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
										}`}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>

						{isLoading ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
								{[...Array(8)].map((_, i) => (
									<div
										key={String(i)}
										className="h-36 bg-white rounded-2xl border border-slate-200 animate-pulse"
									/>
								))}
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
								{filteredSubIndices.map((index, i) => (
									<SentimentCard
										key={index.title}
										title={index.title}
										score={index.data?.score ?? 50}
										rating={index.data?.rating ?? "neutral"}
										data={index.data?.data ?? []}
										delay={i * 0.03}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</main>
		</PinGuard>
	);
}
