"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
	Activity,
	AlertTriangle,
	CheckCircle2,
	Compass,
	GitFork,
	History,
	KeyRound,
	LineChart,
	Loader2,
	Radar,
} from "lucide-react";
import BrokerDistributionView from "../broker-distribution/components/BrokerDistributionView";
import HistoricalTradeView from "../historical-trade/components/HistoricalTradeView";
import MarketDetectorView from "../market-detector/components/MarketDetectorView";
import RunningTradeChartView from "../running-trade-chart/components/RunningTradeChartView";
import SwingScreenerView from "../swing-screener/components/SwingScreenerView";
import TradeBook5MView from "../trade-book-5m/components/TradeBook5MView";
import MarketCredentialsModal from "../credentials/components/MarketCredentialsModal";
import { useMarketCredentials } from "../credentials/hooks/useMarketCredentials";

export type SwingTradeTab =
	| "historical-trade"
	| "market-detector"
	| "trade-book-5m"
	| "running-trade-chart"
	| "broker-distribution"
	| "swing-screener";

const TABS: { id: SwingTradeTab; label: string; icon: typeof History }[] = [
	{ id: "swing-screener", label: "Swing Screener Engine", icon: Compass },
	{ id: "historical-trade", label: "Historical Data Trade", icon: History },
	{ id: "market-detector", label: "Market Detector", icon: Radar },
	{ id: "trade-book-5m", label: "Trade Book 5M", icon: LineChart },
	{ id: "running-trade-chart", label: "Running Trade Chart", icon: Activity },
	{ id: "broker-distribution", label: "Broker Distribution", icon: GitFork },
];

function TabsContent() {
	const searchParams = useSearchParams();
	const tabParam = searchParams.get("tab");
	const initialTab: SwingTradeTab =
		tabParam === "historical-trade"
			? "historical-trade"
			: tabParam === "market-detector"
				? "market-detector"
				: tabParam === "trade-book-5m"
					? "trade-book-5m"
					: tabParam === "running-trade-chart"
						? "running-trade-chart"
						: tabParam === "broker-distribution"
							? "broker-distribution"
							: "swing-screener";
	const [activeTab, setActiveTab] = useState<SwingTradeTab>(initialTab);
	const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
	const { credentials, loading } = useMarketCredentials();
	const isConfigured = Boolean(credentials?.baseUrl && credentials?.token);
	const tabTrackRef = useRef<HTMLDivElement>(null);

	const switchTab = useCallback((tab: SwingTradeTab) => {
		setActiveTab(tab);
		if (typeof window !== "undefined") {
			const url = new URL(window.location.href);
			url.searchParams.set("tab", tab);
			window.history.replaceState(null, "", url.toString());
		}
	}, []);

	useEffect(() => {
		if (!tabTrackRef.current) return;
		const activeBtn = tabTrackRef.current.querySelector<HTMLElement>(
			`[data-tab-id="${activeTab}"]`,
		);
		if (activeBtn && typeof activeBtn.scrollIntoView === "function") {
			activeBtn.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "center",
			});
		}
	}, [activeTab]);

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Segmented Mode Selector Nav + Global Connection Action */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
				{/* Scrollable Single-Row Tab Track */}
				<div className="w-full lg:flex-1 lg:min-w-0 overflow-hidden">
					<nav
						ref={tabTrackRef}
						aria-label="Swing Trade Workstations"
						className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 backdrop-blur-xs rounded-2xl border border-slate-300/70 shadow-xs overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x flex-nowrap w-full lg:w-auto"
					>
						{TABS.map((tab) => {
							const isActive = activeTab === tab.id;
							const Icon = tab.icon;
							return (
								<button
									key={tab.id}
									type="button"
									aria-pressed={isActive}
									data-tab-id={tab.id}
									onClick={() => switchTab(tab.id)}
									className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-11 shrink-0 whitespace-nowrap cursor-pointer active:scale-95 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
										isActive
											? "bg-white text-slate-900 shadow-xs"
											: "text-slate-600 hover:text-slate-900"
									}`}
								>
									<Icon className="w-4 h-4 shrink-0" aria-hidden />
									<span>{tab.label}</span>
								</button>
							);
						})}
					</nav>
				</div>

				{/* Global Connection Pill Button */}
				<div className="flex items-center justify-end shrink-0">
					<button
						type="button"
						onClick={() => setCredentialsModalOpen(true)}
						className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all min-h-11 cursor-pointer shadow-xs active:scale-95 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
							isConfigured
								? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
								: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
						}`}
						aria-label="Manage Market API Credentials in Redis"
					>
						{loading ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
						) : isConfigured ? (
							<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
						) : (
							<AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
						)}
						<span>
							{loading
								? "Checking API..."
								: isConfigured
									? "Market API Connected"
									: "Configure Market API"}
						</span>
						<KeyRound className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
					</button>
				</div>
			</div>

			<MarketCredentialsModal
				isOpen={credentialsModalOpen}
				onClose={() => setCredentialsModalOpen(false)}
			/>

			{/* Tab Views */}
			{activeTab === "historical-trade" ? (
				<HistoricalTradeView />
			) : activeTab === "market-detector" ? (
				<MarketDetectorView />
			) : activeTab === "trade-book-5m" ? (
				<TradeBook5MView />
			) : activeTab === "running-trade-chart" ? (
				<RunningTradeChartView />
			) : activeTab === "broker-distribution" ? (
				<BrokerDistributionView />
			) : (
				<SwingScreenerView />
			)}
		</div>
	);
}

export default function SwingTradeTabs() {
	return (
		<Suspense
			fallback={
				<div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex items-center justify-center min-h-[300px]">
					<span className="text-xs font-semibold text-slate-400 animate-pulse">
						Loading Swing Trade Hub...
					</span>
				</div>
			}
		>
			<TabsContent />
		</Suspense>
	);
}
