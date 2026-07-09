"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import type { IDXStock, ProcessedStock } from "../types";
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

	const { processed, marketHealth } = useMarketData(rawStocks);

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
						className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors disabled:opacity-50"
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
							className="mt-6 px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-rose-700 transition-colors"
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
						{/* Phase 2: Top Dashboard */}
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

						{/* Phase 3: Analytics & Table */}
						<div className="mt-8">
							<Heatmap stocks={processed} onSelectStock={setSelectedStock} />
						</div>

						<div className="mt-8">
							<SmartTable stocks={processed} onSelectStock={setSelectedStock} />
						</div>
					</>
				)}
			</main>

			{/* Phase 4: Analyst Drawer */}
			<StockDetailDrawer
				stock={selectedStock}
				onClose={() => setSelectedStock(null)}
			/>
		</div>
	);
}
