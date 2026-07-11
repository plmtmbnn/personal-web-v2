"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle, Loader2, Sliders, ChevronDown, ChevronUp } from "lucide-react";
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

export default function StockExplorerView() {
	const [rawStocks, setRawStocks] = useState<IDXStock[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastSync, setLastSync] = useState<string | null>(null);

	const [selectedStock, setSelectedStock] = useState<ProcessedStock | null>(
		null,
	);

	// Watchlist and Custom Weights States
	const [watchlist, setWatchlist] = useState<string[]>([]);
	const [weights, setWeights] = useState<ScoreWeights>({
		price: 25,
		volume: 25,
		foreign: 20,
		liquidity: 15,
		volatility: 15,
	});
	const [isScorerExpanded, setIsScorerExpanded] = useState(false);

	// Load stored states from localStorage on mount
	useEffect(() => {
		const storedWeights = localStorage.getItem("idx:weights");
		if (storedWeights) {
			try {
				setWeights(JSON.parse(storedWeights));
			} catch (e) {}
		}
		const storedWatchlist = localStorage.getItem("idx:watchlist");
		if (storedWatchlist) {
			try {
				setWatchlist(JSON.parse(storedWatchlist));
			} catch (e) {}
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

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
			{/* Top Nav Bar */}
			<div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm px-4 py-4 md:px-8 flex justify-between items-center">
				<div>
					<h1 className="text-lg font-black text-slate-900 tracking-tight">
						Market Intelligence
					</h1>
					<p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
						Advanced Terminal
					</p>
				</div>
				<div className="flex items-center gap-4">
					{lastSync && (
						<p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
							Sync: {lastSync}
						</p>
					)}
					<button
						onClick={fetchData}
						disabled={isLoading}
						className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors disabled:opacity-50 cursor-pointer"
					>
						{isLoading ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
						) : (
							<RefreshCw className="w-3.5 h-3.5" />
						)}
						Refresh
					</button>
				</div>
			</div>

			<main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
				{error ? (
					<div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
						<AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
						<h3 className="text-lg font-black text-rose-900 mb-2">
							Terminal Offline
						</h3>
						<p className="text-sm font-medium text-rose-600 max-w-md">
							{error}
						</p>
						<button
							onClick={fetchData}
							className="mt-6 px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
						>
							Retry Connection
						</button>
					</div>
				) : isLoading && rawStocks.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-64">
						<Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
						<p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
							Initializing Terminal...
						</p>
					</div>
				) : (
					<>
						{/* Custom Scoring Engine Control Panel */}
						<div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
							<button
								onClick={() => setIsScorerExpanded(!isScorerExpanded)}
								className="w-full p-6 flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer border-none text-left"
							>
								<div className="flex items-center gap-3">
									<Sliders className="w-5 h-5 text-indigo-600" />
									<div>
										<h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
											Custom Scoring Engine
										</h3>
										<p className="text-[10px] font-bold text-slate-400 mt-1">
											Adjust parameter weights to recalculate stock opportunity scores in real time
										</p>
									</div>
								</div>
								<div className="flex items-center gap-4">
									<span className="hidden lg:inline-block text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
										Weights: {weights.price}% P / {weights.volume}% V / {weights.foreign}% F / {weights.liquidity}% L / {weights.volatility}% S
									</span>
									{isScorerExpanded ? (
										<ChevronUp className="w-4 h-4 text-slate-500" />
									) : (
										<ChevronDown className="w-4 h-4 text-slate-500" />
									)}
								</div>
							</button>

							{isScorerExpanded && (
								<div className="p-8 border-t border-slate-100 bg-white space-y-8">
									{/* Presets */}
									<div className="flex flex-wrap gap-2 items-center">
										<span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">
											Strategy Presets:
										</span>
										{[
											{
												name: "Balanced (Default)",
												weights: { price: 25, volume: 25, foreign: 20, liquidity: 15, volatility: 15 }
											},
											{
												name: "Whale Accumulation",
												weights: { price: 10, volume: 10, foreign: 60, liquidity: 20, volatility: 0 }
											},
											{
												name: "Momentum Hunter",
												weights: { price: 45, volume: 45, foreign: 0, liquidity: 10, volatility: 0 }
											},
											{
												name: "Stability & Value",
												weights: { price: 10, volume: 10, foreign: 10, liquidity: 30, volatility: 40 }
											}
										].map((preset) => (
											<button
												key={preset.name}
												onClick={() => applyPreset(preset.weights)}
												className="px-4 py-2 bg-slate-100 hover:bg-indigo-55 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none"
											>
												{preset.name}
											</button>
										))}
									</div>

									{/* Sliders Grid */}
									<div className="grid grid-cols-1 md:grid-cols-5 gap-6">
										{[
											{ label: "Price Trend", key: "price" as const, desc: "Price Change % weight" },
											{ label: "Trade Volume", key: "volume" as const, desc: "Volume velocity weight" },
											{ label: "Foreign Net Flow", key: "foreign" as const, desc: "Foreign net flows weight" },
											{ label: "Liquidity", key: "liquidity" as const, desc: "Transaction frequency weight" },
											{ label: "Volatility", key: "volatility" as const, desc: "Price stability weight" }
										].map((slider) => (
											<div key={slider.key} className="space-y-3">
												<div className="flex justify-between items-center">
													<span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
														{slider.label}
													</span>
													<span className="text-xs font-black text-indigo-600">
														{weights[slider.key]}%
													</span>
												</div>
												<input
													type="range"
													min="0"
													max="100"
													step="5"
													value={weights[slider.key]}
													onChange={(e) => handleWeightChange(slider.key, Number(e.target.value))}
													className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
												/>
												<p className="text-[9px] font-bold text-slate-400">
													{slider.desc}
												</p>
											</div>
										))}
									</div>

									{/* Warning if not summing to 100 */}
									{totalWeightsSum !== 100 && (
										<div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center gap-3 text-xs font-semibold">
											<AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
											<span>
												Warning: Active weights sum to{" "}
												<strong>
													{totalWeightsSum}%
												</strong>
												. Standardizing to 100% is recommended for accurate composite scores.
											</span>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Top Dashboard */}
						<HeroOverview marketHealth={marketHealth} />

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<div className="lg:col-span-1 space-y-6">
								<MarketBreadth
									advancers={marketHealth.advancers}
									decliners={marketHealth.decliners}
									unchanged={marketHealth.unchanged}
								/>
								<SectorRotation stocks={processed} />
								<ForeignFlow stocks={processed} />
							</div>

							<div className="lg:col-span-2 space-y-6">
								<TopMovers stocks={processed} />
								<div className="h-[400px]">
									<OpportunityScanner
										stocks={processed}
										onSelectStock={setSelectedStock}
									/>
								</div>
							</div>
						</div>

						{/* Analytics & Table */}
						<div className="mt-8">
							<Heatmap stocks={processed} onSelectStock={setSelectedStock} />
						</div>

						<div className="mt-8">
							<SmartTable
								stocks={processed}
								onSelectStock={setSelectedStock}
								watchlist={watchlist}
								onToggleWatchlist={toggleWatchlist}
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
