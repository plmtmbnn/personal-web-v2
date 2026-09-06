"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
} from "lucide-react";
import type { IDXStock, ProcessedStock, ScoreWeights } from "../types";
import { useMarketData } from "../hooks/useMarketData";

// Dashboard Components
import HeroOverview from "./dashboard/HeroOverview";
import MarketBreadth from "./dashboard/MarketBreadth";
import SectorRotation from "./dashboard/SectorRotation";
import ForeignFlow from "./dashboard/ForeignFlow";
import TopMovers from "./dashboard/TopMovers";
import OpportunityScanner from "./dashboard/OpportunityScanner";

// Charts & Table
import Heatmap from "./charts/Heatmap";
import SmartTable from "./table/SmartTable";

// Analyst Experience
import StockDetailDrawer from "./analyst/StockDetailDrawer";

const DEFAULT_WEIGHTS: ScoreWeights = {
	price: 25,
	volume: 25,
	foreign: 20,
	liquidity: 15,
	volatility: 15,
};

const STRATEGY_PRESETS = [
	{
		name: "Balanced",
		weights: DEFAULT_WEIGHTS,
	},
	{
		name: "Whale Accumulation",
		weights: {
			price: 10,
			volume: 10,
			foreign: 60,
			liquidity: 20,
			volatility: 0,
		},
	},
	{
		name: "Momentum Hunter",
		weights: {
			price: 45,
			volume: 45,
			foreign: 0,
			liquidity: 10,
			volatility: 0,
		},
	},
	{
		name: "Stability & Value",
		weights: {
			price: 10,
			volume: 10,
			foreign: 10,
			liquidity: 30,
			volatility: 40,
		},
	},
];

export default function StockExplorerView() {
	const [rawStocks, setRawStocks] = useState<IDXStock[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastSync, setLastSync] = useState<string | null>(null);
	const [dataSource, setDataSource] = useState<string | null>(null);

	const [selectedStock, setSelectedStock] = useState<ProcessedStock | null>(
		null,
	);

	// Watchlist, Custom Weights, and Hard Filter States
	const [watchlist, setWatchlist] = useState<string[]>([]);
	const [weights, setWeights] = useState<ScoreWeights>(DEFAULT_WEIGHTS);
	const [minScore, setMinScore] = useState<number>(0);
	const [isScorerExpanded, setIsScorerExpanded] = useState(false);

	// Load stored states from localStorage on mount
	useEffect(() => {
		const storedWeights = localStorage.getItem("idx:weights");
		if (storedWeights) {
			try {
				setWeights(JSON.parse(storedWeights));
			} catch (_e) {}
		}
		const storedWatchlist = localStorage.getItem("idx:watchlist");
		if (storedWatchlist) {
			try {
				setWatchlist(JSON.parse(storedWatchlist));
			} catch (_e) {}
		}
	}, []);

	const handleWeightChange = (key: keyof ScoreWeights, val: number) => {
		setWeights((prev) => {
			const updated = { ...prev, [key]: val };
			localStorage.setItem("idx:weights", JSON.stringify(updated));
			return updated;
		});
	};

	const applyPreset = (preset: ScoreWeights) => {
		setWeights(preset);
		localStorage.setItem("idx:weights", JSON.stringify(preset));
	};

	const resetWeights = () => {
		setWeights(DEFAULT_WEIGHTS);
		setMinScore(0);
		localStorage.setItem("idx:weights", JSON.stringify(DEFAULT_WEIGHTS));
	};

	const toggleWatchlist = (code: string) => {
		setWatchlist((prev) => {
			const updated = prev.includes(code)
				? prev.filter((c) => c !== code)
				: [...prev, code];
			localStorage.setItem("idx:watchlist", JSON.stringify(updated));
			return updated;
		});
	};

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
			if (json.source) {
				setDataSource(json.source);
			}
			if (json.metadata?.lastFetchAt) {
				setLastSync(new Date(json.metadata.lastFetchAt).toLocaleTimeString());
			} else {
				setLastSync(new Date().toLocaleTimeString());
			}
		} catch (err: any) {
			console.error("Data fetch error:", err);
			setError(err.message || "Failed to load stock data");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const { processed, marketHealth } = useMarketData(rawStocks, weights);
	const totalWeightsSum = Object.values(weights).reduce((a, b) => a + b, 0);

	// Count how many stocks pass the active minimum score threshold
	const qualifyingStocksCount = processed.filter(
		(s) => s.CompositeScore >= minScore,
	).length;
	const qualifyingPct =
		processed.length > 0
			? Math.round((qualifyingStocksCount / processed.length) * 100)
			: 0;

	// Check if active weights match a preset
	const activePresetName =
		STRATEGY_PRESETS.find(
			(p) =>
				p.weights.price === weights.price &&
				p.weights.volume === weights.volume &&
				p.weights.foreign === weights.foreign &&
				p.weights.liquidity === weights.liquidity &&
				p.weights.volatility === weights.volatility,
		)?.name || "Custom Blend";

	return (
		<div className="min-h-screen bg-slate-50/80 bg-dot-pattern relative text-slate-900 pb-36">
			{/* Airy Hero Section */}
			<section className="pt-24 sm:pt-28 pb-8 px-4 md:px-8 max-w-7xl mx-auto text-center relative">
				<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-extrabold uppercase tracking-wider mb-4 shadow-2xs">
					<TrendingUp className="w-3.5 h-3.5" />
					<span>IDX Financial Analytics Engine</span>
				</div>

				<h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3">
					Market Intelligence Explorer
				</h1>
				<p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto mb-6">
					Interactive Indonesia Stock Exchange analytics with dynamic composite
					scoring, institutional volume tracking, and market breadth
					intelligence.
				</p>

				{/* Telemetry Action Strip */}
				<div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs">
					{dataSource && (
						<span
							className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold uppercase tracking-wider text-[11px] border shadow-2xs ${
								dataSource === "idx_live"
									? "bg-emerald-50 text-emerald-700 border-emerald-200"
									: dataSource === "redis"
										? "bg-indigo-50 text-indigo-700 border-indigo-200"
										: "bg-amber-50 text-amber-700 border-amber-200"
							}`}
						>
							<span
								className={`w-1.5 h-1.5 rounded-full ${
									dataSource === "idx_live"
										? "bg-emerald-500 animate-pulse"
										: dataSource === "redis"
											? "bg-indigo-500"
											: "bg-amber-500"
								}`}
							/>
							{dataSource === "idx_live"
								? "IDX Live Direct"
								: dataSource === "redis"
									? "Redis Cache"
									: "Backup Snapshot"}
						</span>
					)}

					{rawStocks.length > 0 && (
						<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-[11px] shadow-2xs">
							<span className="font-black text-slate-900">
								{rawStocks.length}
							</span>{" "}
							Active Tickers
						</span>
					)}

					{lastSync && (
						<span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 font-semibold text-[11px] shadow-2xs">
							Sync: {lastSync}
						</span>
					)}

					<button
						onClick={fetchData}
						disabled={isLoading}
						className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
					>
						{isLoading ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
						) : (
							<RefreshCw className="w-3.5 h-3.5" />
						)}
						<span>Refresh</span>
					</button>

					<Link
						href="/utils/stock-explorer/admin"
						className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-2xs"
					>
						<Settings className="w-3.5 h-3.5 text-slate-500" />
						<span>Manage Cache</span>
					</Link>
				</div>
			</section>

			{/* Main Content Area */}
			<main className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
				{error ? (
					<div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-xs">
						<AlertCircle className="w-12 h-12 text-rose-600 mb-4" />
						<h3 className="text-xl font-black text-rose-900 mb-2">
							Terminal Feed Offline
						</h3>
						<p className="text-sm font-semibold text-rose-700 max-w-md">
							{error}
						</p>
						<button
							onClick={fetchData}
							className="mt-6 px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
						>
							Retry Connection
						</button>
					</div>
				) : isLoading && rawStocks.length === 0 ? (
					<div className="bg-white border border-slate-200/80 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-xs">
						<Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
						<h3 className="text-base font-extrabold text-slate-900">
							Initializing Market Intelligence Engine...
						</h3>
						<p className="text-xs font-medium text-slate-500 mt-1">
							Streaming real-time order summaries, foreign flows, and sector
							metrics
						</p>
					</div>
				) : (
					<>
						{/* Top KPI Cards */}
						<HeroOverview marketHealth={marketHealth} />

						{/* Top Movers Strip (Full Width) */}
						<div>
							<TopMovers stocks={processed} onSelectStock={setSelectedStock} />
						</div>

						{/* Deep Market Intelligence Matrix: Balanced 2-Column Grid */}
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
							{/* Left Column: Breadth + Sector Rotation + Foreign Flow */}
							<div className="lg:col-span-6 space-y-6">
								<MarketBreadth
									advancers={marketHealth.advancers}
									decliners={marketHealth.decliners}
									unchanged={marketHealth.unchanged}
								/>
								<SectorRotation stocks={processed} />
								<ForeignFlow
									stocks={processed}
									onSelectStock={setSelectedStock}
								/>
							</div>

							{/* Right Column: Opportunity Scanner */}
							<div className="lg:col-span-6 h-full">
								<OpportunityScanner
									stocks={processed}
									onSelectStock={setSelectedStock}
								/>
							</div>
						</div>

						{/* Market Heatmap (Full Width) */}
						<div>
							<Heatmap
								stocks={processed}
								onSelectStock={setSelectedStock}
								minScore={minScore}
							/>
						</div>

						{/* Custom Scoring Engine & Hard Filter Control Panel (Moved directly above SmartTable) */}
						<div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
							<button
								onClick={() => setIsScorerExpanded(!isScorerExpanded)}
								className="w-full p-6 sm:p-7 flex justify-between items-center bg-white hover:bg-slate-50/80 transition-colors focus:outline-none cursor-pointer border-none text-left"
							>
								<div className="flex items-center gap-3.5">
									<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
										<Sliders className="w-5 h-5" />
									</div>
									<div>
										<div className="flex items-center gap-2">
											<h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
												Custom Factor Scoring &amp; Hard Filter Engine
											</h3>
											<span className="hidden sm:inline-flex text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
												Preset: {activePresetName}
											</span>
											{minScore > 0 && (
												<span className="inline-flex text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
													Filter: Score ≥ {minScore} ({qualifyingStocksCount})
												</span>
											)}
										</div>
										<p className="text-xs font-medium text-slate-500 mt-0.5">
											Recalculate composite opportunity scores and filter out
											sub-par instruments in real time
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3 sm:gap-4">
									<span
										className={`hidden md:inline-block text-[11px] font-bold px-3 py-1 rounded-full border ${
											totalWeightsSum === 100
												? "bg-emerald-50 text-emerald-700 border-emerald-200"
												: "bg-amber-50 text-amber-700 border-amber-200"
										}`}
									>
										{totalWeightsSum === 100
											? "100% Calibrated"
											: `Weights Sum: ${totalWeightsSum}%`}
									</span>
									<div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
										{isScorerExpanded ? (
											<ChevronUp className="w-4 h-4" />
										) : (
											<ChevronDown className="w-4 h-4" />
										)}
									</div>
								</div>
							</button>

							{isScorerExpanded && (
								<div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50 space-y-6">
									{/* Presets & Reset Row */}
									<div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
										<div className="flex flex-wrap items-center gap-2">
											<span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mr-1">
												Strategies:
											</span>
											{STRATEGY_PRESETS.map((preset) => (
												<button
													key={preset.name}
													onClick={() => applyPreset(preset.weights)}
													className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer border ${
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
											onClick={resetWeights}
											className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
										>
											<RotateCcw className="w-3.5 h-3.5 text-slate-400" />
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
													<span className="text-xs font-bold uppercase tracking-wider text-slate-800">
														{slider.label}
													</span>
													<span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
														{weights[slider.key]}%
													</span>
												</div>
												<input
													type="range"
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
													className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
												/>
												<p className="text-[10px] font-medium text-slate-500">
													{slider.desc}
												</p>
											</div>
										))}
									</div>

									{/* Hard Filter Threshold Section */}
									<div className="pt-6 border-t border-slate-200/70 space-y-3">
										<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
											<div className="flex items-center gap-2">
												<Filter className="w-4 h-4 text-indigo-600" />
												<span className="text-xs font-black uppercase tracking-wider text-slate-800">
													Hard Filter: Minimum Score Threshold
												</span>
												<span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
													{minScore > 0
														? `Score ≥ ${minScore}`
														: "Disabled (Showing All)"}
												</span>
											</div>
											<span className="text-xs font-bold text-slate-500">
												<span className="text-indigo-600 font-extrabold">
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
													onClick={() => setMinScore(preset.value)}
													className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
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
												min="0"
												max="90"
												step="5"
												value={minScore}
												onChange={(e) => setMinScore(Number(e.target.value))}
												className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
											/>
											<span className="text-xs font-black text-slate-900 w-12 text-right">
												{minScore}+
											</span>
										</div>
									</div>

									{/* Warning if not summing to 100 */}
									{totalWeightsSum !== 100 && (
										<div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center gap-3 text-xs font-bold">
											<AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
											<span>
												Active factor weights sum to{" "}
												<strong>{totalWeightsSum}%</strong>. Normalizing to 100%
												is recommended for accurate composite scoring.
											</span>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Smart Screener Table (Full Width) */}
						<div>
							<SmartTable
								stocks={processed}
								onSelectStock={setSelectedStock}
								watchlist={watchlist}
								onToggleWatchlist={toggleWatchlist}
								minScore={minScore}
								onMinScoreChange={setMinScore}
							/>
						</div>
					</>
				)}
			</main>

			{/* Analyst Drawer */}
			<StockDetailDrawer
				stock={selectedStock}
				onClose={() => setSelectedStock(null)}
			/>
		</div>
	);
}
