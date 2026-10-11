"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
	Plus,
	Search,
	Download,
	Upload,
	RotateCcw,
	BookmarkCheck,
	History,
	TrendingUp,
	Database,
	RefreshCw,
} from "lucide-react";
import type { ProcessedStock, StockPickWithMetrics } from "../../types";
import {
	calculatePickMetrics,
	calculatePortfolioSummary,
} from "../../stockpicks";
import { useScreener } from "../../context/ScreenerContext";
import SimulatorTelemetryStrip from "./SimulatorTelemetryStrip";
import StockpickCard from "./StockpickCard";
import { TradeJournalView } from "./TradeJournalView";

interface StockpickSimulatorProps {
	stocks: ProcessedStock[];
}

type StatusFilter = "all" | "active" | "closed";
type SortOption =
	| "pl-desc"
	| "pl-asc"
	| "peak-desc"
	| "drawdown-asc"
	| "recent";

export default function StockpickSimulator({
	stocks,
}: StockpickSimulatorProps) {
	const {
		stockPicks,
		isPicksLoading,
		cloudSyncError,
		refreshPicksFromCloud,
		removeStockPick,
		closeStockPick,
		reopenStockPick,
		resetPickWatermarks,
		resetToDemoPicks,
		exportPicksToJson,
		importPicksFromJson,
		openAddPickModal,
		openEditPickModal,
		openClosePickModal,
		setSelectedStock,
		simulatorSubTab,
		setSimulatorSubTab,
	} = useScreener();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
	const [sortOption, setSortOption] = useState<SortOption>("pl-desc");
	const [importError, setImportError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	// Map live stock quotes to fast lookup dictionary
	const liveStocksMap = useMemo(() => {
		const map = new Map<string, ProcessedStock>();
		for (const s of stocks) {
			map.set(s.StockCode.toUpperCase(), s);
		}
		return map;
	}, [stocks]);

	// Enrich all simulated picks with live session metrics
	const picksWithMetrics: StockPickWithMetrics[] = useMemo(() => {
		return stockPicks.map((pick) => {
			const live = liveStocksMap.get(pick.stockCode.toUpperCase());
			return calculatePickMetrics(pick, live);
		});
	}, [stockPicks, liveStocksMap]);

	// Overall portfolio telemetry summary
	const portfolioSummary = useMemo(() => {
		return calculatePortfolioSummary(picksWithMetrics);
	}, [picksWithMetrics]);

	// Filter and sort picks for the active positions tab
	const filteredAndSortedPicks = useMemo(() => {
		return picksWithMetrics
			.filter((pick) => {
				// Status filter (in active tab, only show active or all if specified)
				if (statusFilter !== "all" && pick.status !== statusFilter) {
					return false;
				}

				// Search filter
				if (searchQuery.trim()) {
					const query = searchQuery.toLowerCase().trim();
					const matchCode = pick.stockCode.toLowerCase().includes(query);
					const matchName = pick.stockName.toLowerCase().includes(query);
					const matchThesis = pick.thesis?.toLowerCase().includes(query);
					if (!matchCode && !matchName && !matchThesis) return false;
				}

				return true;
			})
			.sort((a, b) => {
				switch (sortOption) {
					case "pl-desc":
						return b.unrealizedPlPct - a.unrealizedPlPct;
					case "pl-asc":
						return a.unrealizedPlPct - b.unrealizedPlPct;
					case "peak-desc":
						return b.peakGainPct - a.peakGainPct;
					case "drawdown-asc":
						return a.maxDrawdownPct - b.maxDrawdownPct;
					case "recent":
						return b.createdAt - a.createdAt;
					default:
						return 0;
				}
			});
	}, [picksWithMetrics, searchQuery, statusFilter, sortOption]);

	// Drill down to Inspector Drawer from pick card
	const handleInspectStock = (code: string) => {
		const found = liveStocksMap.get(code.toUpperCase());
		if (found) {
			setSelectedStock(found);
		}
	};

	// Export JSON download
	const handleExport = () => {
		const json = exportPicksToJson();
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `idx_stockpicks_backup_${new Date().toISOString().split("T")[0]}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	// Import JSON file upload
	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target?.result as string;
			if (content) {
				const ok = importPicksFromJson(content);
				if (!ok) {
					setImportError("Invalid stockpicks JSON format.");
				} else {
					setImportError(null);
				}
			}
		};
		reader.readAsText(file);
	};

	const closedTradesList = useMemo(() => {
		return picksWithMetrics.filter((p) => p.status === "closed");
	}, [picksWithMetrics]);

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Simulator Sub-Tab Mode Switcher: Active Positions vs Trade Journal */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setSimulatorSubTab("active")}
						className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
							simulatorSubTab === "active"
								? "bg-slate-900 text-white shadow-xs"
								: "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60"
						}`}
					>
						<TrendingUp className="w-3.5 h-3.5" />
						<span>Active Positions</span>
						<span
							className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
								simulatorSubTab === "active"
									? "bg-slate-800 text-slate-200"
									: "bg-slate-100 text-slate-600"
							}`}
						>
							{portfolioSummary.activePicks}
						</span>
					</button>
					<button
						type="button"
						onClick={() => setSimulatorSubTab("journal")}
						className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
							simulatorSubTab === "journal"
								? "bg-slate-900 text-white shadow-xs"
								: "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60"
						}`}
					>
						<History className="w-3.5 h-3.5" />
						<span>Trade Journal & Analytics</span>
						<span
							className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
								simulatorSubTab === "journal"
									? "bg-slate-800 text-slate-200"
									: "bg-slate-100 text-slate-600"
							}`}
						>
							{portfolioSummary.closedPicks}
						</span>
					</button>
				</div>

				{simulatorSubTab === "active" && (
					<button
						type="button"
						onClick={() => openAddPickModal()}
						className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
					>
						<Plus className="w-4 h-4" />
						<span>Simulate New Pick</span>
					</button>
				)}
			</div>

			{/* Sub-View 1: Trade Journal & Analytics */}
			{simulatorSubTab === "journal" ? (
				<TradeJournalView
					closedTrades={closedTradesList}
					onReopenTrade={reopenStockPick}
					onDeleteTrade={removeStockPick}
					onViewStockDetail={handleInspectStock}
				/>
			) : (
				/* Sub-View 2: Active Positions Blotter */
				<>
					{/* Stage 1: Portfolio Telemetry Strip */}
					<SimulatorTelemetryStrip summary={portfolioSummary} />

					{/* Stage 2: Controls & Actions Bar */}
					<div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
						<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
							{/* Left: Search input & Status Tabs */}
							<div className="flex flex-wrap items-center gap-3">
								{/* Live Search */}
								<div className="relative w-full sm:w-64">
									<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
									<input
										type="text"
										placeholder="Search picks or thesis..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
									/>
								</div>

								{/* Minimalist Frameless Milestone Standard: Status Tabs */}
								<div className="relative flex items-center border-b border-slate-200/60 pb-0.5">
									{[
										{
											id: "active" as const,
											label: "Active",
											count: portfolioSummary.activePicks,
										},
										{
											id: "all" as const,
											label: "All Picks",
											count: portfolioSummary.totalPicks,
										},
										{
											id: "closed" as const,
											label: "Closed",
											count: portfolioSummary.closedPicks,
										},
									].map((tab) => {
										const isSelected = statusFilter === tab.id;
										return (
											<button
												key={tab.id}
												type="button"
												onClick={() => setStatusFilter(tab.id)}
												className={`relative px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
													isSelected
														? "text-slate-900 font-bold"
														: "text-slate-500 hover:text-slate-800"
												}`}
											>
												<span>{tab.label}</span>
												<span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono font-bold">
													{tab.count}
												</span>
												{isSelected && (
													<motion.div
														layoutId="simulatorStatusUnderline"
														className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
														transition={{
															type: "spring",
															stiffness: 500,
															damping: 35,
														}}
													/>
												)}
											</button>
										);
									})}
								</div>
							</div>

							{/* Right: Sort & Utility buttons */}
							<div className="flex flex-wrap items-center gap-2.5">
								{/* Sort Dropdown */}
								<div className="relative">
									<select
										value={sortOption}
										onChange={(e) =>
											setSortOption(e.target.value as SortOption)
										}
										className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
									>
										<option value="pl-desc">Highest P/L %</option>
										<option value="pl-asc">Lowest P/L %</option>
										<option value="peak-desc">Highest Peak Gain</option>
										<option value="drawdown-asc">Deepest Drawdown</option>
										<option value="recent">Recently Added</option>
									</select>
								</div>

								{/* Export / Import / Reset */}
								<button
									type="button"
									onClick={handleExport}
									title="Export simulated picks to JSON backup"
									className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
								>
									<Download className="w-4 h-4" />
								</button>

								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									title="Import stockpicks JSON backup"
									className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
								>
									<Upload className="w-4 h-4" />
								</button>
								<input
									ref={fileInputRef}
									type="file"
									accept=".json"
									onChange={handleFileUpload}
									className="hidden"
								/>

								{/* Supabase Cloud Refresh */}
								<button
									type="button"
									onClick={() => refreshPicksFromCloud()}
									disabled={isPicksLoading}
									title="Refresh simulation picks directly from Supabase Cloud"
									className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
								>
									{isPicksLoading ? (
										<RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
									) : (
										<Database className="w-4 h-4 text-emerald-600" />
									)}
								</button>

								<button
									type="button"
									onClick={resetToDemoPicks}
									title="Reset to default demo picks (persists to cloud)"
									className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
								>
									<RotateCcw className="w-4 h-4" />
								</button>
							</div>
						</div>

						{cloudSyncError && (
							<div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3.5 py-2.5 rounded-2xl">
								<span>Supabase notice: {cloudSyncError}</span>
								<button
									type="button"
									onClick={() => refreshPicksFromCloud()}
									className="font-bold underline hover:text-amber-950 cursor-pointer ml-2"
								>
									Retry
								</button>
							</div>
						)}

						{importError && (
							<p className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
								{importError}
							</p>
						)}
					</div>

					{/* Stage 3: Simulated Stockpick Grid */}
					{isPicksLoading ? (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs animate-pulse space-y-4"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-2xl bg-slate-200" />
											<div className="space-y-1.5">
												<div className="w-20 h-4 bg-slate-200 rounded" />
												<div className="w-32 h-3 bg-slate-200 rounded" />
											</div>
										</div>
										<div className="w-16 h-6 bg-slate-200 rounded-lg" />
									</div>
									<div className="grid grid-cols-3 gap-2 pt-2">
										<div className="h-12 bg-slate-100 rounded-xl" />
										<div className="h-12 bg-slate-100 rounded-xl" />
										<div className="h-12 bg-slate-100 rounded-xl" />
									</div>
									<div className="h-8 bg-slate-100 rounded-xl" />
								</div>
							))}
						</div>
					) : filteredAndSortedPicks.length === 0 ? (
						<div className="bg-white border border-slate-200/80 rounded-3xl p-12 sm:p-16 text-center space-y-4 shadow-xs">
							<div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-600 flex items-center justify-center mx-auto">
								<BookmarkCheck className="w-6 h-6" />
							</div>
							<div>
								<h4 className="text-base font-bold text-slate-900">
									No Simulated Stockpicks Found
								</h4>
								<p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
									{searchQuery
										? `No picks match query "${searchQuery}". Try a different ticker or clear filter.`
										: "Start testing your stock-picking ability and entry level timing based on Investment Compass research."}
								</p>
							</div>
							<div className="flex flex-wrap items-center justify-center gap-3 pt-2">
								<button
									type="button"
									onClick={() => openAddPickModal()}
									className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
								>
									Simulate First Pick
								</button>
								<button
									type="button"
									onClick={resetToDemoPicks}
									className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
								>
									Load Sample Picks
								</button>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
							{filteredAndSortedPicks.map((pick) => (
								<StockpickCard
									key={pick.id}
									pick={pick}
									onEdit={openEditPickModal}
									onDelete={removeStockPick}
									onClosePosition={closeStockPick}
									onOpenCloseModal={openClosePickModal}
									onResetWatermarks={resetPickWatermarks}
									onInspectStock={handleInspectStock}
								/>
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
}
