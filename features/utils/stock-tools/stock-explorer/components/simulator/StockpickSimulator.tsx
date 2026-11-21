"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
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
		accountEquityIdr,
		setAccountEquityIdr,
	} = useScreener();

	const [searchQuery, setSearchQuery] = useState("");
	const [alertFilter, setAlertFilter] = useState<"all" | "alerts">("all");
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
			const live = liveStocksMap.get((pick.stockCode || "").toUpperCase());
			return calculatePickMetrics(pick, live);
		});
	}, [stockPicks, liveStocksMap]);

	// Overall portfolio telemetry summary
	const portfolioSummary = useMemo(() => {
		return calculatePortfolioSummary(picksWithMetrics, accountEquityIdr);
	}, [picksWithMetrics, accountEquityIdr]);

	const activeAlertCount = useMemo(() => {
		return picksWithMetrics.filter(
			(p) =>
				p.status === "active" &&
				(p.alertStatus === "stop_breached" ||
					p.alertStatus === "target_hit" ||
					p.alertStatus === "trailing_protect"),
		).length;
	}, [picksWithMetrics]);

	// Filter and sort picks for the active positions tab (strictly active open positions)
	const filteredAndSortedPicks = useMemo(() => {
		return picksWithMetrics
			.filter((pick) => {
				if (pick.status !== "active") {
					return false;
				}

				if (
					alertFilter === "alerts" &&
					pick.alertStatus !== "stop_breached" &&
					pick.alertStatus !== "target_hit" &&
					pick.alertStatus !== "trailing_protect"
				) {
					return false;
				}

				// Search filter
				if (searchQuery.trim()) {
					const query = searchQuery.toLowerCase().trim();
					const matchCode = (pick.stockCode || "")
						.toLowerCase()
						.includes(query);
					const matchName = (pick.stockName || "")
						.toLowerCase()
						.includes(query);
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
	}, [picksWithMetrics, searchQuery, alertFilter, sortOption]);

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
				<div
					role="tablist"
					aria-label="Simulator sub-views"
					className="flex flex-wrap items-center gap-2"
				>
					<button
						type="button"
						role="tab"
						aria-selected={simulatorSubTab === "active"}
						onClick={() => setSimulatorSubTab("active")}
						className={`min-h-11 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
							simulatorSubTab === "active"
								? "bg-slate-900 text-white shadow-xs"
								: "bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200/80"
						}`}
					>
						<TrendingUp className="w-3.5 h-3.5" />
						<span>Active Positions</span>
						<span
							className={`text-xs px-1.5 py-0.5 rounded-md font-mono font-bold ${
								simulatorSubTab === "active"
									? "bg-slate-800 text-slate-200"
									: "bg-slate-100 text-slate-700"
							}`}
						>
							{portfolioSummary.activePicks}
						</span>
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={simulatorSubTab === "journal"}
						onClick={() => setSimulatorSubTab("journal")}
						className={`min-h-11 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
							simulatorSubTab === "journal"
								? "bg-slate-900 text-white shadow-xs"
								: "bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200/80"
						}`}
					>
						<History className="w-3.5 h-3.5" />
						<span>Trade Journal &amp; Analytics</span>
						<span
							className={`text-xs px-1.5 py-0.5 rounded-md font-mono font-bold ${
								simulatorSubTab === "journal"
									? "bg-slate-800 text-slate-200"
									: "bg-slate-100 text-slate-700"
							}`}
						>
							{portfolioSummary.closedPicks}
						</span>
					</button>
				</div>

				{simulatorSubTab === "active" && (
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-xs font-bold text-slate-600">
							Portfolio Equity:
						</span>
						{[
							{ label: "Rp 50M", value: 50_000_000 },
							{ label: "Rp 100M", value: 100_000_000 },
							{ label: "Rp 250M", value: 250_000_000 },
							{ label: "Rp 500M", value: 500_000_000 },
						].map((eq) => (
							<button
								key={eq.value}
								type="button"
								aria-pressed={accountEquityIdr === eq.value}
								onClick={() => setAccountEquityIdr(eq.value)}
								className={`min-h-11 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer border ${
									accountEquityIdr === eq.value
										? "bg-indigo-600 text-white border-indigo-600"
										: "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50"
								}`}
							>
								{eq.label}
							</button>
						))}
					</div>
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
							{/* Left: Search input & Alert Filter Tabs */}
							<div className="flex flex-wrap items-center gap-3">
								{/* Live Search */}
								<div className="relative w-full sm:w-64">
									<Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
									<input
										type="text"
										aria-label="Search active picks or thesis"
										placeholder="Search active picks or thesis..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full min-h-11 bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
									/>
								</div>

								{/* Minimalist Frameless Milestone Standard: Open vs Alert Filter */}
								<div
									role="tablist"
									aria-label="Open position filter"
									className="relative flex items-center border-b border-slate-200/60 pb-0.5"
								>
									{[
										{
											id: "all" as const,
											label: "All Open",
											count: portfolioSummary.activePicks,
										},
										{
											id: "alerts" as const,
											label: "Action Alerts (SL/TP)",
											count: activeAlertCount,
										},
									].map((tab) => {
										const isSelected = alertFilter === tab.id;
										return (
											<button
												key={tab.id}
												type="button"
												role="tab"
												aria-selected={isSelected}
												onClick={() => setAlertFilter(tab.id)}
												className={`relative min-h-11 px-3 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
													isSelected
														? "text-slate-900 font-bold"
														: "text-slate-600 hover:text-slate-900"
												}`}
											>
												<span>{tab.label}</span>
												<span
													className={`text-xs px-1.5 py-0.5 rounded-md font-mono font-bold ${
														tab.id === "alerts" && tab.count > 0
															? "bg-rose-100 text-rose-800"
															: "bg-slate-100 text-slate-700"
													}`}
												>
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
										aria-label="Sort simulated picks"
										value={sortOption}
										onChange={(e) =>
											setSortOption(e.target.value as SortOption)
										}
										className="min-h-11 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
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
									aria-label="Export simulated picks to JSON backup"
									title="Export simulated picks to JSON backup"
									className="min-h-11 min-w-11 inline-flex items-center justify-center p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
								>
									<Download className="w-4 h-4" />
								</button>

								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									aria-label="Import stockpicks JSON backup"
									title="Import stockpicks JSON backup"
									className="min-h-11 min-w-11 inline-flex items-center justify-center p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
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
									aria-label="Refresh simulation picks from Supabase Cloud"
									title="Refresh simulation picks directly from Supabase Cloud"
									className="min-h-11 min-w-11 inline-flex items-center justify-center p-2 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
								>
									{isPicksLoading ? (
										<RefreshCw className="w-4 h-4 text-emerald-700 animate-spin" />
									) : (
										<Database className="w-4 h-4 text-emerald-700" />
									)}
								</button>

								<button
									type="button"
									onClick={resetToDemoPicks}
									aria-label="Reset to default demo picks"
									title="Reset to default demo picks (persists to cloud)"
									className="min-h-11 min-w-11 inline-flex items-center justify-center p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
								>
									<RotateCcw className="w-4 h-4" />
								</button>
							</div>
						</div>

						{cloudSyncError && (
							<div className="flex items-center justify-between bg-white border border-slate-200/80 border-l-4 border-l-amber-500 text-slate-800 text-xs px-4 py-3 rounded-2xl shadow-xs">
								<span>Supabase notice: {cloudSyncError}</span>
								<button
									type="button"
									onClick={() => refreshPicksFromCloud()}
									className="min-h-11 px-3 font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer ml-2 shrink-0"
								>
									Retry
								</button>
							</div>
						)}

						{importError && (
							<p className="text-xs text-rose-700 font-bold bg-white border border-slate-200/80 border-l-4 border-l-rose-500 p-3 rounded-2xl shadow-xs">
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
									className="min-h-11 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
								>
									Simulate First Pick
								</button>
								<button
									type="button"
									onClick={resetToDemoPicks}
									className="min-h-11 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
