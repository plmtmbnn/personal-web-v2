"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
	TrendingUp,
	ChevronRight,
	RefreshCw,
	Layers,
	Zap,
	Table as TableIcon,
	ShieldAlert,
	Sparkles,
	Compass,
	Flame,
} from "lucide-react";
import Link from "next/link";
import { getFearAndGreedData } from "@/features/investment/actions";
import type { FearAndGreedData } from "@/features/investment/types";
import FearAndGreedGauge from "@/features/investment/components/FearAndGreedGauge";
import SentimentCard from "@/features/investment/components/SentimentCard";
import StockTicker from "@/features/shared/components/StockTicker";
import { Button } from "@/components/ui/Button";

type CategoryFilter =
	| "all"
	| "momentum"
	| "breadth"
	| "volatility"
	| "safe_haven";

export default function InvestmentPage() {
	const reduceMotion = useReducedMotion();
	// Initial load state - true means no data fetched yet
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [marketData, setMarketData] = useState<FearAndGreedData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		if (isInitialLoading) setIsInitialLoading(false);
		try {
			const data = await getFearAndGreedData();
			if (data) {
				setMarketData(data);
			} else {
				setError("Failed to synchronize market data");
			}
		} catch (err) {
			console.error("Fear and Greed fetch failed:", err);
			setError("Operational connection failure");
		} finally {
			setIsLoading(false);
		}
	}, [isInitialLoading]);

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
				badge: "bg-rose-500 text-rose-100",
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
				badge: "bg-orange-500 text-orange-100",
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
				badge: "bg-amber-500 text-slate-900 font-bold",
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
				badge: "bg-emerald-500 text-emerald-100",
				icon: TrendingUp,
			};
		}
		return {
			title: "Extreme Greed Zone",
			subtitle: "Overheated Risk Appetite & Caution Signal",
			description:
				"Heightened market euphoria and extended valuations. Increased probability of short-term volatility or pullbacks.",
			bg: "bg-teal-950/90 text-teal-50 border-teal-700/50",
			badge: "bg-teal-400 text-slate-900 font-bold",
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

	{
		/* ──────────────────────────────
	Loading Skeleton Components
	───────────────────────────── */
	}

	const LoadingMainGauge = () => (
		<div className="min-h-[360px] flex items-center justify-center">
			<div className="flex flex-col items-center gap-4 py-12">
				<div className="w-20 h-20 rounded-full bg-slate-200 animate-pulse" />
				<div className="flex flex-col items-center">
					<p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
						Calibrating Market Pulse...
					</p>
					<div className="h-4 bg-slate-200 animate-pulse w-48" />
				</div>
			</div>
		</div>
	);

	const LoadingFactorMatrix = () => (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{Array.from({ length: 8 }).map((_, i) => (
				<div
					key={i}
					className="h-36 bg-slate-50 rounded-2xl border border-slate-200 animate-pulse"
				/>
			))}
		</div>
	);

	{
		/* ──────────────────────────────
	Error State Component
	───────────────────────────── */
	}
	const ErrorState = () => (
		<div className="text-center p-8 bg-rose-50 rounded-[2rem] border border-rose-100 max-w-md mx-auto">
			<div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
				<ShieldAlert className="w-6 h-6 text-rose-600" />
			</div>
			<p className="text-sm font-medium text-rose-600 mb-4">
				{error || "Failed to synchronize market data"}
			</p>
			<Button
				onClick={fetchData}
				variant="default"
				size="sm"
				className="w-full"
			>
				<RefreshCw className="w-4 h-4 mr-2" /> Force Re-Synchronization
			</Button>
		</div>
	);

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 overflow-x-hidden">
			{/* ── Structural Hero Header ───────────────────────────────────── */}
			<div className="bg-slate-900 border-b border-slate-800 mb-8 pt-8 sm:pt-10 pb-10 sm:pb-12 text-white shadow-md">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
								<TrendingUp className="w-4 h-4 text-indigo-400" />
								Market Intelligence Engine
							</div>
							<h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
								Fear & Greed Index
							</h1>
							<div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
								<Link
									href="/"
									className="!text-slate-300 hover:!text-white transition-colors !no-underline"
								>
									Home
								</Link>
								<ChevronRight className="w-3 h-3 text-slate-500" />
								<span className="text-white font-extrabold">
									Sentiment Dashboard
								</span>
							</div>
						</div>

						{/* Header Actions */}
						<div className="flex flex-wrap items-center gap-3 p-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl backdrop-blur-md shadow-sm">
							<Link
								href="/utils/stock-explorer"
								className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-500 transition-all shadow-md active:scale-95 cursor-pointer !no-underline"
							>
								<TableIcon className="w-4 h-4" />
								<span>Stock Explorer</span>
							</Link>

							{/* Connection Status */}
							<div className="px-3.5 py-1.5 text-center border-l border-slate-700/80 hidden sm:block">
								<p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-0.5">
									Sync Status
								</p>
								<div className="flex items-center justify-center gap-1.5">
									<div
										className={`w-2 h-2 rounded-full ${
											isLoading && isInitialLoading
												? "bg-amber-400 animate-pulse"
												: error
													? "bg-rose-400"
													: "bg-emerald-400"
										}`}
									/>
									<span className="text-[10px] font-extrabold text-white uppercase tracking-wider">
										{isInitialLoading
											? "Calibrating"
											: isLoading
												? "Syncing"
												: error
													? "Error"
													: "Live"}
									</span>
								</div>
							</div>

							{/* Refresh Button */}
							<button
								type="button"
								onClick={fetchData}
								disabled={isLoading}
								aria-label="Refresh market data"
								className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-700/80 rounded-xl transition-all disabled:opacity-30 cursor-pointer active:scale-95"
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

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
				{/* ── Strategic Signal Callout Banner ────────────────────────── */}
				{marketData && !isLoading && !error && (
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className={`p-6 sm:p-8 rounded-3xl border shadow-lg ${strategicSignal.bg} flex flex-col md:flex-row md:items-center justify-between gap-6`}
					>
						<div className="flex items-start gap-4">
							<div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm">
								<SignalIcon className="w-6 h-6 text-white" />
							</div>
							<div className="space-y-1">
								<div className="flex items-center gap-2 flex-wrap">
									<span
										className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold ${strategicSignal.badge}`}
									>
										{strategicSignal.title}
									</span>
									<span className="text-xs font-extrabold text-slate-200">
										Score: {Math.round(score)} / 100
									</span>
								</div>
								<h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
									{strategicSignal.subtitle}
								</h2>
								<p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-3xl">
									{strategicSignal.description}
								</p>
							</div>
						</div>

						<Link
							href="/utils/stock-explorer"
							className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-900 rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-slate-100 transition-all shadow-md shrink-0 cursor-pointer active:scale-95 !no-underline"
						>
							<span>Explore Market Opportunities</span>
							<ChevronRight className="w-4 h-4" />
						</Link>
					</motion.div>
				)}

				{/* ── Primary Master Gauge Visual ───────────────────────────── */}
				<div className="bg-white p-6 sm:p-10 lg:p-12 rounded-[2.5rem] border border-slate-200/80 shadow-xl shadow-slate-200/50">
					<div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
						<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2.5">
							<Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
							Strategic Sentiment Analysis
						</h3>
						<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
							Real-Time Aggregate
						</span>
					</div>

					<div className="min-h-[360px] flex items-center justify-center">
						{isInitialLoading || isLoading ? (
							<LoadingMainGauge />
						) : error ? (
							<ErrorState />
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
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
								<Layers className="w-5 h-5" />
							</div>
							<div>
								<h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
									Factor Analysis Matrix
								</h2>
								<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
									onClick={() => setActiveCategory(opt.value as CategoryFilter)}
									className={`px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
										activeCategory === opt.value
											? "bg-slate-900 text-white border-slate-900 shadow-sm"
											: "bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
									}`}
								>
									{opt.label}
								</button>
							))}
						</div>
					</div>

					{isLoading ? (
						<LoadingFactorMatrix />
					) : filteredSubIndices.length === 0 ? (
						<div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
							<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Layers className="w-8 h-8 text-slate-400" />
							</div>
							<p className="text-sm font-semibold text-slate-600">
								No factors match your filter
							</p>
							<button
								onClick={() => setActiveCategory("all")}
								className="mt-4 text-indigo-600 font-bold text-sm hover:underline cursor-pointer"
							>
								Show All
							</button>
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
	);
}
