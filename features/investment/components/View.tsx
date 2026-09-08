"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
	TrendingUp,
	TrendingDown,
	ChevronRight,
	RefreshCw,
	Layers,
	Zap,
	Table as TableIcon,
	ShieldAlert,
	Sparkles,
	Compass,
	Flame,
	ShieldCheck,
	ArrowUpDown,
	Activity,
	Clock,
	Info,
} from "lucide-react";
import Link from "next/link";
import { getCombinedMarketIntelligence } from "@/features/investment/actions";
import type {
	FearAndGreedData,
	CryptoFearAndGreedResponse,
} from "@/features/investment/types";
import FearAndGreedGauge from "@/features/investment/components/FearAndGreedGauge";
import SentimentCard from "@/features/investment/components/SentimentCard";
import MarketSituationSummary from "@/features/investment/components/MarketSituationSummary";
import StockTicker from "@/features/shared/components/StockTicker";

type CategoryFilter =
	| "all"
	| "momentum"
	| "breadth"
	| "volatility"
	| "safe_haven";

type SortMode = "default" | "highest" | "lowest";

interface SubIndexItem {
	title: string;
	data: {
		timestamp: number;
		score: number;
		rating: string;
		data: Array<{ x: number; y: number; rating: string }>;
	};
	category: "momentum" | "breadth" | "volatility" | "safe_haven";
}

/* ─────────────────────────────────────────────────────────────
   Standalone Skeleton & Error Decoupled Components
   ───────────────────────────────────────────────────────────── */

function InfoTooltip({
	text,
	position = "top",
}: {
	text: string;
	position?: "top" | "bottom";
}) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const handlePointerDown = (e: PointerEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("pointerdown", handlePointerDown);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [isOpen]);

	return (
		<span
			ref={containerRef}
			className="group/tip relative inline-flex items-center ml-1 align-middle"
			onMouseEnter={() => setIsOpen(true)}
			onMouseLeave={() => setIsOpen(false)}
			onClick={(e) => e.stopPropagation()}
		>
			<button
				type="button"
				aria-label="More information"
				aria-expanded={isOpen}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					setIsOpen((prev) => !prev);
				}}
				className="p-1 -m-1 rounded-md text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 transition-colors flex items-center justify-center cursor-pointer touch-manipulation"
			>
				<Info className="w-3.5 h-3.5 shrink-0" />
			</button>
			<span
				role="tooltip"
				className={`absolute ${
					position === "top" ? "bottom-full mb-2" : "top-full mt-2"
				} left-0 sm:left-1/2 sm:-translate-x-1/2 w-48 sm:w-56 p-2.5 bg-slate-900 text-white text-[11px] font-medium rounded-xl transition-all duration-150 z-50 shadow-xl border border-slate-800 leading-snug text-left normal-case tracking-normal ${
					isOpen
						? "opacity-100 pointer-events-auto visible scale-100"
						: "opacity-0 pointer-events-none invisible scale-95"
				}`}
			>
				{text}
				<span
					className={`absolute ${
						position === "top"
							? "top-full border-t-slate-900"
							: "bottom-full border-b-slate-900"
					} left-3 sm:left-1/2 sm:-translate-x-1/2 border-4 border-transparent`}
				/>
			</span>
		</span>
	);
}

function LoadingTelemetryStrip() {
	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<div
					key={i}
					className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3"
				>
					<div className="flex items-center justify-between">
						<div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse" />
						<div className="w-14 h-4 rounded-md bg-slate-100 animate-pulse" />
					</div>
					<div className="space-y-1.5">
						<div className="w-20 h-6 rounded-md bg-slate-200 animate-pulse" />
						<div className="w-28 h-3 rounded-md bg-slate-100 animate-pulse" />
					</div>
				</div>
			))}
		</div>
	);
}

function LoadingMainGauge() {
	return (
		<div className="min-h-[360px] flex items-center justify-center">
			<div className="flex flex-col items-center gap-4 py-12">
				<div className="w-20 h-20 rounded-full bg-slate-100 animate-pulse" />
				<div className="flex flex-col items-center space-y-1.5">
					<p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
						Calibrating Market Pulse...
					</p>
					<div className="h-4 bg-slate-100 animate-pulse w-48 rounded-md" />
				</div>
			</div>
		</div>
	);
}

function LoadingFactorMatrix() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{Array.from({ length: 8 }).map((_, i) => (
				<div
					key={i}
					className="h-36 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs animate-pulse space-y-3"
				>
					<div className="flex items-center justify-between">
						<div className="w-24 h-4 bg-slate-100 rounded" />
						<div className="w-10 h-4 bg-slate-100 rounded" />
					</div>
					<div className="w-16 h-7 bg-slate-200 rounded" />
					<div className="w-full h-12 bg-slate-50 rounded" />
				</div>
			))}
		</div>
	);
}

function InvestmentErrorState({
	error,
	onRetry,
	isRetrying,
}: {
	error: string;
	onRetry: () => void;
	isRetrying: boolean;
}) {
	return (
		<div className="text-center p-8 sm:p-10 bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-md mx-auto space-y-4">
			<div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
				<ShieldAlert className="w-6 h-6" />
			</div>
			<div className="space-y-1">
				<h3 className="text-base font-extrabold text-slate-900">
					Synchronization Failure
				</h3>
				<p className="text-xs sm:text-sm text-slate-500 font-medium">
					{error || "Unable to retrieve real-time market sentiment data."}
				</p>
			</div>
			<button
				type="button"
				onClick={onRetry}
				disabled={isRetrying}
				className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
			>
				<RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
				<span>Force Re-Synchronization</span>
			</button>
		</div>
	);
}

/* ─────────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────────── */

export default function InvestmentPage() {
	const reduceMotion = useReducedMotion();
	const [marketData, setMarketData] = useState<FearAndGreedData | null>(null);
	const [cryptoData, setCryptoData] =
		useState<CryptoFearAndGreedResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
	const [sortMode, setSortMode] = useState<SortMode>("default");

	const fetchData = useCallback(async (isSilent = false) => {
		if (isSilent) {
			setIsRefreshing(true);
		} else {
			setIsLoading(true);
		}
		setError(null);

		try {
			const { traditional, crypto } = await getCombinedMarketIntelligence();
			if (traditional) {
				setMarketData(traditional);
			} else {
				setError("Failed to synchronize market data from CNN source");
			}

			if (crypto) {
				setCryptoData(crypto);
			}
		} catch (err) {
			console.error("Market Intelligence fetch failed:", err);
			setError("Operational connection failure");
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// All 8 sub-indices mapped with categories
	const allSubIndices: SubIndexItem[] = useMemo(() => {
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

	// Category count breakdown
	const categoryCounts = useMemo(() => {
		return {
			all: allSubIndices.length,
			momentum: allSubIndices.filter((s) => s.category === "momentum").length,
			breadth: allSubIndices.filter((s) => s.category === "breadth").length,
			volatility: allSubIndices.filter((s) => s.category === "volatility")
				.length,
			safe_haven: allSubIndices.filter((s) => s.category === "safe_haven")
				.length,
		};
	}, [allSubIndices]);

	// Filtered & Sorted sub-indices
	const displayedSubIndices = useMemo(() => {
		let list =
			activeCategory === "all"
				? allSubIndices
				: allSubIndices.filter((item) => item.category === activeCategory);

		if (sortMode === "highest") {
			list = [...list].sort(
				(a, b) => (b.data?.score ?? 0) - (a.data?.score ?? 0),
			);
		} else if (sortMode === "lowest") {
			list = [...list].sort(
				(a, b) => (a.data?.score ?? 0) - (b.data?.score ?? 0),
			);
		}

		return list;
	}, [allSubIndices, activeCategory, sortMode]);

	// Factor Alignment Metrics
	const factorMetrics = useMemo(() => {
		if (!allSubIndices.length)
			return { bullish: 0, neutral: 0, bearish: 0, ratio: "0 / 0" };
		const bullish = allSubIndices.filter(
			(item) => (item.data?.score ?? 50) > 55,
		).length;
		const neutral = allSubIndices.filter((item) => {
			const s = item.data?.score ?? 50;
			return s >= 45 && s <= 55;
		}).length;
		const bearish = allSubIndices.filter(
			(item) => (item.data?.score ?? 50) < 45,
		).length;
		return {
			bullish,
			neutral,
			bearish,
			ratio: `${bullish} Bull • ${bearish} Bear`,
		};
	}, [allSubIndices]);

	// Strategic Signal Callout computation based on score
	const score = marketData?.fear_and_greed?.score ?? 50;
	const delta7D = useMemo(() => {
		if (!marketData?.fear_and_greed?.previous_1_week) return 0;
		return Math.round(
			score - (marketData.fear_and_greed.previous_1_week ?? 50),
		);
	}, [score, marketData]);

	const strategicSignal = useMemo(() => {
		if (score < 25) {
			return {
				title: "Extreme Fear Zone",
				subtitle: "Historical Accumulation & Oversold Signals",
				description:
					"Heavy market pessimism and extreme risk aversion. Historically associated with long-term value accumulation opportunities.",
				topBarBg: "bg-rose-500",
				badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
				iconBg: "bg-rose-50 text-rose-600 border-rose-100",
				icon: ShieldAlert,
			};
		}
		if (score < 45) {
			return {
				title: "Fear Zone",
				subtitle: "Risk-Off Defensive Sentiment",
				description:
					"Elevated caution across market participants. Defensive sector rotation and selective positioning recommended.",
				topBarBg: "bg-orange-500",
				badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
				iconBg: "bg-orange-50 text-orange-600 border-orange-100",
				icon: Flame,
			};
		}
		if (score <= 55) {
			return {
				title: "Neutral Market Zone",
				subtitle: "Equilibrium & Balanced Momentum",
				description:
					"Market fundamentals and technicals in balance. Equities consolidating near fair value benchmarks.",
				topBarBg: "bg-amber-500",
				badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
				iconBg: "bg-amber-50 text-amber-600 border-amber-100",
				icon: Compass,
			};
		}
		if (score <= 75) {
			return {
				title: "Greed Zone",
				subtitle: "Bullish Inflow & Positive Trend",
				description:
					"Strong buying momentum across broad market equities. Capital inflows surging with elevated risk appetite.",
				topBarBg: "bg-emerald-500",
				badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
				iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
				icon: TrendingUp,
			};
		}
		return {
			title: "Extreme Greed Zone",
			subtitle: "Overheated Risk Appetite & Caution Signal",
			description:
				"Heightened market euphoria and extended valuations. Increased probability of short-term volatility or pullbacks.",
			topBarBg: "bg-teal-500",
			badgeBg: "bg-teal-50 text-teal-800 border-teal-200",
			iconBg: "bg-teal-50 text-teal-600 border-teal-100",
			icon: Sparkles,
		};
	}, [score]);

	const SignalIcon = strategicSignal.icon;

	const filterOptions = [
		{
			label: "All Factors",
			value: "all" as CategoryFilter,
			count: categoryCounts.all,
		},
		{
			label: "Momentum",
			value: "momentum" as CategoryFilter,
			count: categoryCounts.momentum,
		},
		{
			label: "Breadth & Strength",
			value: "breadth" as CategoryFilter,
			count: categoryCounts.breadth,
		},
		{
			label: "Options & VIX",
			value: "volatility" as CategoryFilter,
			count: categoryCounts.volatility,
		},
		{
			label: "Safe Havens",
			value: "safe_haven" as CategoryFilter,
			count: categoryCounts.safe_haven,
		},
	];

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			{/* ── Top Floating Header Card ─────────────────────────────────── */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 mb-6 sm:mb-8">
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
						<div className="space-y-1.5 sm:space-y-2">
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold uppercase tracking-wider">
								<TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
								<span>Market Intelligence Engine</span>
								<span className="w-1 h-1 rounded-full bg-indigo-400" />
								<span className="text-[11px] font-semibold text-indigo-600 lowercase tracking-normal">
									sentiment telemetry &amp; indicators
								</span>
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
								Fear &amp; Greed Index
							</h1>
							<div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
								<Link
									href="/"
									className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline"
								>
									Home
								</Link>
								<ChevronRight className="w-3 h-3 text-slate-400" />
								<span className="text-slate-900 font-bold">
									Sentiment Dashboard
								</span>
							</div>
						</div>

						{/* Header Actions */}
						<div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
							<Link
								href="/utils/stock-explorer"
								className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 text-indigo-700 hover:text-indigo-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer !no-underline group"
							>
								<TableIcon className="w-4 h-4 text-indigo-600 group-hover:scale-105 transition-transform" />
								<span>Stock Explorer</span>
							</Link>

							{/* Connection Status */}
							<div className="px-3.5 py-2 bg-slate-50/80 border border-slate-200/80 rounded-xl text-center shadow-2xs flex items-center gap-2">
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

							{/* Refresh Button */}
							<button
								type="button"
								onClick={() => fetchData(true)}
								disabled={isLoading || isRefreshing}
								aria-label="Refresh market data"
								className="p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-slate-600 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
								title="Refresh market data"
							>
								<RefreshCw
									className={`w-4 h-4 ${isLoading || isRefreshing ? "animate-spin text-indigo-600" : ""}`}
								/>
							</button>
						</div>
					</div>
				</div>
			</div>

			<StockTicker />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
				{/* ── Global Telemetry Summary Strip Pattern ──────────────────── */}
				{isLoading ? (
					<LoadingTelemetryStrip />
				) : marketData ? (
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
						{/* Telemetry 1: Current Score */}
						<div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
							<div className="flex items-center justify-between gap-2 mb-2">
								<span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center">
									Market Sentiment
									<InfoTooltip text="Aggregated 0–100 index tracking broad investor psychology from extreme fear to extreme greed." />
								</span>
								<div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
									<Activity className="w-4 h-4" />
								</div>
							</div>
							<div>
								<div className="flex items-baseline gap-2">
									<span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
										{Math.round(score)}
									</span>
									<span className="text-xs font-bold text-slate-400">
										/ 100
									</span>
								</div>
								<p className="text-xs font-extrabold text-indigo-700 capitalize mt-0.5">
									{marketData.fear_and_greed.rating}
								</p>
							</div>
						</div>

						{/* Telemetry 2: 7-Day Velocity */}
						<div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
							<div className="flex items-center justify-between gap-2 mb-2">
								<span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center">
									7-Day Velocity
									<InfoTooltip text="Net score change over the last 7 days indicating momentum acceleration or rapid cooling." />
								</span>
								<div
									className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
										delta7D >= 0
											? "bg-emerald-50 text-emerald-600 border-emerald-100"
											: "bg-rose-50 text-rose-600 border-rose-100"
									}`}
								>
									{delta7D >= 0 ? (
										<TrendingUp className="w-4 h-4" />
									) : (
										<TrendingDown className="w-4 h-4" />
									)}
								</div>
							</div>
							<div>
								<div className="flex items-baseline gap-1.5">
									<span
										className={`text-2xl sm:text-3xl font-black tracking-tight ${
											delta7D >= 0 ? "text-emerald-600" : "text-rose-600"
										}`}
									>
										{delta7D > 0 ? `+${delta7D}` : delta7D}
									</span>
									<span className="text-xs font-bold text-slate-400">pts</span>
								</div>
								<p className="text-xs font-semibold text-slate-500 mt-0.5">
									vs {Math.round(marketData.fear_and_greed.previous_1_week)} (1W
									ago)
								</p>
							</div>
						</div>

						{/* Telemetry 3: Factor Alignment */}
						<div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
							<div className="flex items-center justify-between gap-2 mb-2">
								<span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center">
									Factor Alignment
									<InfoTooltip text="Distribution of the 7 core factors in bullish (>55), neutral (45–55), or bearish (<45) zones." />
								</span>
								<div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
									<ShieldCheck className="w-4 h-4" />
								</div>
							</div>
							<div>
								<p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
									{factorMetrics.ratio}
								</p>
								<p className="text-xs font-semibold text-slate-500 mt-0.5">
									{factorMetrics.neutral} indicators neutral
								</p>
							</div>
						</div>

						{/* Telemetry 4: Historical Anchor */}
						<div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
							<div className="flex items-center justify-between gap-2 mb-2">
								<span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center">
									Historical Anchor
									<InfoTooltip text="Fear & Greed index exactly 1 year ago vs. previous close to benchmark current cycle positioning." />
								</span>
								<div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
									<Clock className="w-4 h-4" />
								</div>
							</div>
							<div>
								<div className="flex items-baseline gap-1.5">
									<span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
										{Math.round(marketData.fear_and_greed.previous_1_year)}
									</span>
									<span className="text-xs font-bold text-slate-400">
										pts (1Y)
									</span>
								</div>
								<p className="text-xs font-semibold text-slate-500 mt-0.5">
									Prev Close:{" "}
									{Math.round(marketData.fear_and_greed.previous_close)} pts
								</p>
							</div>
						</div>
					</div>
				) : null}

				{/* ── Strategic Signal Callout Banner (Revamped Floating Card) ── */}
				{marketData && !isLoading && !error && (
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 relative flex flex-col md:flex-row md:items-center justify-between gap-6"
					>
						{/* Solid Accent Top Bar */}
						<div
							className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl ${strategicSignal.topBarBg}`}
						/>

						<div className="flex items-start gap-4">
							<div
								className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${strategicSignal.iconBg}`}
							>
								<SignalIcon className="w-6 h-6" />
							</div>
							<div className="space-y-1">
								<div className="flex items-center gap-2 flex-wrap">
									<span
										className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold border ${strategicSignal.badgeBg}`}
									>
										{strategicSignal.title}
									</span>
									<span className="text-xs font-bold text-slate-500 flex items-center">
										Composite Score:{" "}
										<strong className="text-slate-900 font-black ml-1 mr-1">
											{Math.round(score)}
										</strong>{" "}
										/ 100
										<InfoTooltip
											position="bottom"
											text="Automated regime classification based on sentiment thresholds to guide risk positioning."
										/>
									</span>
								</div>
								<h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
									{strategicSignal.subtitle}
								</h2>
								<p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-3xl">
									{strategicSignal.description}
								</p>
							</div>
						</div>

						<Link
							href="/utils/stock-explorer"
							className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 !text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-xs shrink-0 cursor-pointer active:scale-95 !no-underline"
						>
							<span className="!text-white font-bold">
								Explore Stock Opportunities
							</span>
							<ChevronRight className="w-4 h-4 !text-white" />
						</Link>
					</motion.div>
				)}

				{/* ── Global Macro Situation Summary & Market Regime ───────── */}
				{(marketData || cryptoData) && !isLoading && !error && (
					<MarketSituationSummary
						traditionalData={marketData}
						cryptoData={cryptoData}
					/>
				)}

				{/* ── Primary Master Gauge Visual ───────────────────────────── */}
				<div className="bg-white p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-slate-200/80 shadow-xs">
					<div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
						<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2.5">
							<Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
							Strategic Sentiment Analysis
						</h3>
						<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
							Real-Time CNN Aggregate
						</span>
					</div>

					<div className="min-h-[360px] flex items-center justify-center">
						{isLoading ? (
							<LoadingMainGauge />
						) : error ? (
							<InvestmentErrorState
								error={error}
								onRetry={() => fetchData(false)}
								isRetrying={isLoading}
							/>
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
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
								<Layers className="w-5 h-5" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
										Factor Analysis Matrix
									</h2>
									<span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200/60">
										{displayedSubIndices.length}
									</span>
									<InfoTooltip text="7-factor quantitative model tracking momentum, breadth, volatility, credit spreads, and safe-haven flows." />
								</div>
								<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
									Core Market Indicators Breakdown
								</p>
							</div>
						</div>

						{/* Controls: Category Filters & Sort */}
						<div className="flex flex-wrap items-center gap-2">
							{/* Category Filters with Dynamic Count Pills */}
							<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
								{filterOptions.map((opt) => (
									<button
										key={opt.value}
										type="button"
										onClick={() => setActiveCategory(opt.value)}
										className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
											activeCategory === opt.value
												? "bg-slate-900 text-white border-slate-900 shadow-xs"
												: "bg-white text-slate-600 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
										}`}
									>
										<span>{opt.label}</span>
										<span
											className={`text-[10px] font-mono font-bold ${
												activeCategory === opt.value
													? "text-slate-300"
													: "text-slate-400"
											}`}
										>
											({opt.count})
										</span>
									</button>
								))}
							</div>

							{/* Sort Mode Selector */}
							<div className="flex items-center bg-white border border-slate-200/80 rounded-xl p-0.5 shadow-2xs">
								<button
									type="button"
									onClick={() => setSortMode("default")}
									className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
										sortMode === "default"
											? "bg-slate-100 text-slate-900 font-extrabold"
											: "text-slate-500 hover:text-slate-800"
									}`}
									title="Default factor order"
								>
									Default
								</button>
								<button
									type="button"
									onClick={() => setSortMode("highest")}
									className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
										sortMode === "highest"
											? "bg-slate-100 text-slate-900 font-extrabold"
											: "text-slate-500 hover:text-slate-800"
									}`}
									title="Sort by highest score (Bullish first)"
								>
									<ArrowUpDown className="w-3 h-3" />
									<span>Highest</span>
								</button>
								<button
									type="button"
									onClick={() => setSortMode("lowest")}
									className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
										sortMode === "lowest"
											? "bg-slate-100 text-slate-900 font-extrabold"
											: "text-slate-500 hover:text-slate-800"
									}`}
									title="Sort by lowest score (Bearish first)"
								>
									<ArrowUpDown className="w-3 h-3" />
									<span>Lowest</span>
								</button>
							</div>
						</div>
					</div>

					{isLoading ? (
						<LoadingFactorMatrix />
					) : displayedSubIndices.length === 0 ? (
						<div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
							<div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
								<Layers className="w-6 h-6" />
							</div>
							<div className="space-y-1">
								<p className="text-base font-extrabold text-slate-800">
									No factors match this category filter
								</p>
								<p className="text-xs text-slate-500">
									Reset category filter to inspect all 8 market indicators.
								</p>
							</div>
							<button
								type="button"
								onClick={() => setActiveCategory("all")}
								className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
							>
								Show All Factors
							</button>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							{displayedSubIndices.map((index, i) => (
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
