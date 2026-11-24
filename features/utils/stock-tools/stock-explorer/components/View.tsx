"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
	BookmarkPlus,
	Loader2,
	Plus,
	RefreshCw,
	Settings,
	TrendingUp,
} from "lucide-react";
import UtilHeader from "@/features/utils/components/UtilHeader";
import type { MarketEvidence } from "@/services/market-data/provenance";
import { ScreenerProvider, useScreener } from "../context/ScreenerContext";
import { useMarketData } from "../hooks/useMarketData";
import type {
	CompassBridgeSummary,
	IDXStock,
	TickerHistoryRingBuffer,
} from "../types";
import type { SwingScanResponse } from "../utils/idx-research";
import StockDetailDrawer from "./analyst/StockDetailDrawer";
import SwingShortlist, {
	SwingShortlistSkeleton,
	swingSessionLabel,
} from "./dashboard/SwingShortlist";
import { CloseStockpickModal } from "./simulator/CloseStockpickModal";
import StockpickModal from "./simulator/StockpickModal";
import StockpickSimulator from "./simulator/StockpickSimulator";

interface MarketDataResponse {
	data: IDXStock[];
	tickerHistory10d?: TickerHistoryRingBuffer;
	compassBridge?: CompassBridgeSummary | null;
	metadata?: { stockEvidence?: MarketEvidence };
}

const emptyMarket: MarketDataResponse = { data: [] };
const failedScan: SwingScanResponse = {
	closeSession: null,
	openingSession: null,
	candidates: [],
	reason: "The IDX shortlist is temporarily unavailable. Refresh to try again.",
};

function StockExplorerDashboard() {
	const {
		workstationTab,
		setWorkstationTab,
		weights,
		setSelectedStock,
		syncMarketDataWatermarks,
		openAddPickModal,
		isPickModalOpen,
		closePickModal,
		pickToEdit,
		stockToSimulate,
		addStockPick,
		updateStockPick,
		isCloseModalOpen,
		closeClosePickModal,
		pickToClose,
		closeStockPickWithDetails,
	} = useScreener();
	const [scan, setScan] = useState<SwingScanResponse | null>(null);
	const [market, setMarket] = useState(emptyMarket);
	const [marketLoading, setMarketLoading] = useState(false);
	const [marketError, setMarketError] = useState(false);
	const [refresh, setRefresh] = useState(0);
	const [linkedTicker, setLinkedTicker] = useState<string | null>(null);
	const openedTicker = useRef<string | null>(null);
	const isScanner = workstationTab === "screener";
	const needsMarket = !isScanner || linkedTicker !== null;

	useEffect(() => {
		const ticker = new URLSearchParams(window.location.search)
			.get("q")
			?.trim()
			.toUpperCase();
		if (ticker && /^[A-Z0-9]{1,10}$/.test(ticker)) setLinkedTicker(ticker);
		const onVisibilityChange = () => {
			if (document.visibilityState === "visible")
				setRefresh((value) => value + 1);
		};
		document.addEventListener("visibilitychange", onVisibilityChange);
		return () =>
			document.removeEventListener("visibilitychange", onVisibilityChange);
	}, []);

	useEffect(() => {
		if (!isScanner) return;
		const controller = new AbortController();
		setScan(null);
		fetch("/api/utils/stock-data?view=swing", {
			cache: "no-store",
			signal: controller.signal,
		})
			.then(async (response) => {
				if (!response.ok) throw new Error("IDX shortlist fetch failed");
				const result: SwingScanResponse = await response.json();
				if (!Array.isArray(result.candidates))
					throw new Error("Invalid IDX shortlist response");
				if (!controller.signal.aborted) setScan(result);
			})
			.catch(() => {
				if (!controller.signal.aborted) setScan(failedScan);
			});
		return () => controller.abort();
	}, [isScanner, refresh]);

	useEffect(() => {
		if (!needsMarket) return;
		const controller = new AbortController();
		setMarketLoading(true);
		setMarketError(false);
		fetch("/api/utils/stock-data", {
			cache: "no-store",
			signal: controller.signal,
		})
			.then(async (response) => {
				if (!response.ok) throw new Error("IDX market data fetch failed");
				const result: MarketDataResponse = await response.json();
				if (!Array.isArray(result.data) || !result.data.length)
					throw new Error("Invalid IDX market data");
				if (!controller.signal.aborted) setMarket(result);
			})
			.catch(() => {
				if (controller.signal.aborted) return;
				setMarket(emptyMarket);
				setMarketError(true);
			})
			.finally(() => {
				if (!controller.signal.aborted) setMarketLoading(false);
			});
		return () => controller.abort();
	}, [needsMarket, refresh]);

	const stockEvidence = market.metadata?.stockEvidence;
	const { processed } = useMarketData(
		market.data,
		weights,
		market.tickerHistory10d,
	);
	const currentQuotes = stockEvidence?.status === "current";

	useEffect(() => {
		if (currentQuotes && processed.length) syncMarketDataWatermarks(processed);
	}, [currentQuotes, processed, syncMarketDataWatermarks]);

	useEffect(() => {
		if (!linkedTicker || openedTicker.current === linkedTicker) return;
		const stock = processed.find(({ StockCode }) => StockCode === linkedTicker);
		if (!stock) return;
		openedTicker.current = linkedTicker;
		setSelectedStock(stock);
	}, [linkedTicker, processed, setSelectedStock]);

	const busy = isScanner ? scan === null : marketLoading;
	const closeSession = isScanner
		? scan?.closeSession
		: stockEvidence?.asOf?.slice(0, 10);
	return (
		<main className="min-h-screen bg-slate-50/80 px-4 pt-20 pb-[calc(8rem+env(safe-area-inset-bottom))] text-slate-900 sm:px-6 sm:pt-24 lg:px-8">
			<div className="mx-auto max-w-6xl space-y-4 sm:space-y-5">
				<UtilHeader
					title="IDX Swing Scanner"
					icon={TrendingUp}
					category={{ color: "blue" }}
					description={
						isScanner
							? "Confirmed breakouts for the next IDX open."
							: "Paper positions and trade journal."
					}
					badges={
						closeSession && (
							<div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-slate-600">
								<span>
									{scan?.openingSession || !isScanner
										? "IDX close"
										: "Last verified close"}{" "}
									<time dateTime={closeSession}>
										{swingSessionLabel(closeSession)}
									</time>
								</span>
								{isScanner && scan?.openingSession && (
									<span>
										Opening plan{" "}
										<time dateTime={scan.openingSession}>
											{swingSessionLabel(scan.openingSession)}
										</time>{" "}
										WIB
									</span>
								)}
							</div>
						)
					}
					actions={
						<>
							<button
								type="button"
								disabled={busy}
								onClick={() => setRefresh((value) => value + 1)}
								className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-3.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-50"
							>
								{busy ? (
									<Loader2
										aria-hidden="true"
										className="size-4 motion-safe:animate-spin"
									/>
								) : (
									<RefreshCw aria-hidden="true" className="size-4" />
								)}
								Refresh
							</button>
							<Link
								href="/utils/stock-explorer/admin"
								className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200/80 px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-700 !no-underline"
							>
								<Settings aria-hidden="true" className="size-4" />
								Manage data
							</Link>
						</>
					}
				/>

				<div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs">
					<div
						role="tablist"
						aria-label="Stock tools"
						className="flex flex-wrap gap-1"
					>
						{(
							[
								{ tab: "screener", label: "Scanner", icon: TrendingUp },
								{
									tab: "simulator",
									label: "Simulator & journal",
									icon: BookmarkPlus,
								},
							] as const
						).map(({ tab, label, icon: Icon }) => (
							<button
								key={tab}
								type="button"
								id={`workstation-tab-${tab}`}
								role="tab"
								aria-controls={`workstation-panel-${tab}`}
								aria-selected={workstationTab === tab}
								tabIndex={workstationTab === tab ? 0 : -1}
								onClick={() => setWorkstationTab(tab)}
								onKeyDown={(event) => {
									if (
										!["ArrowLeft", "ArrowRight", "Home", "End"].includes(
											event.key,
										)
									)
										return;
									event.preventDefault();
									const next =
										event.key === "Home" ||
										(event.key !== "End" && tab === "simulator")
											? "screener"
											: "simulator";
									setWorkstationTab(next);
									document.getElementById(`workstation-tab-${next}`)?.focus();
								}}
								className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-blue-700 ${workstationTab === tab ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
							>
								<Icon aria-hidden="true" className="size-4" />
								{label}
							</button>
						))}
					</div>
					{!isScanner && (
						<button
							type="button"
							onClick={() => openAddPickModal()}
							className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-3.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
						>
							<Plus aria-hidden="true" className="size-4" /> New pick
						</button>
					)}
				</div>

				<div
					role="tabpanel"
					id="workstation-panel-screener"
					aria-labelledby="workstation-tab-screener"
					hidden={!isScanner}
				>
					{isScanner &&
						(scan ? (
							<SwingShortlist scan={scan} />
						) : (
							<SwingShortlistSkeleton />
						))}
				</div>
				<div
					role="tabpanel"
					id="workstation-panel-simulator"
					aria-labelledby="workstation-tab-simulator"
					hidden={isScanner}
					className="space-y-4"
				>
					{!isScanner && (
						<>
							{marketError && (
								<p
									role="status"
									className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700"
								>
									IDX quotes are temporarily unavailable.
								</p>
							)}
							<StockpickSimulator stocks={currentQuotes ? processed : []} />
						</>
					)}
				</div>
			</div>

			<StockDetailDrawer
				stockSession={stockEvidence?.asOf?.slice(0, 10) ?? null}
			/>
			<StockpickModal
				isOpen={isPickModalOpen}
				onClose={closePickModal}
				pickToEdit={pickToEdit}
				stockToSimulate={stockToSimulate}
				availableStocks={processed}
				compassBridge={market.compassBridge}
				onSave={(data, request) =>
					data.id
						? updateStockPick(data.id, data, request)
						: addStockPick(data, request)
				}
			/>
			<CloseStockpickModal
				isOpen={isCloseModalOpen}
				onClose={closeClosePickModal}
				pick={pickToClose}
				onConfirmClose={closeStockPickWithDetails}
			/>
		</main>
	);
}

export default function StockExplorerView() {
	return (
		<ScreenerProvider>
			<StockExplorerDashboard />
		</ScreenerProvider>
	);
}
