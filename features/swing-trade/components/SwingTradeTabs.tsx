"use client";

import { Suspense, useState } from "react";
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

function TabsContent() {
	const searchParams = useSearchParams();
	const tabParam = searchParams.get("tab");
	const initialTab: SwingTradeTab =
		tabParam === "market-detector"
			? "market-detector"
			: tabParam === "trade-book-5m"
				? "trade-book-5m"
				: tabParam === "running-trade-chart"
					? "running-trade-chart"
					: tabParam === "broker-distribution"
						? "broker-distribution"
						: tabParam === "swing-screener"
							? "swing-screener"
							: "historical-trade";
	const [activeTab, setActiveTab] = useState<SwingTradeTab>(initialTab);
	const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
	const { credentials, loading } = useMarketCredentials();
	const isConfigured = Boolean(credentials?.baseUrl && credentials?.token);

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Segmented Mode Selector Nav + Global Connection Action */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
				<div className="inline-flex flex-wrap p-1.5 bg-slate-200/70 backdrop-blur-xs rounded-2xl border border-slate-300/70 shadow-xs gap-1">
					<button
						type="button"
						onClick={() => setActiveTab("historical-trade")}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
							activeTab === "historical-trade"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<History className="w-4 h-4" aria-hidden />
						<span>Historical Data Trade</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("market-detector")}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
							activeTab === "market-detector"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<Radar className="w-4 h-4" aria-hidden />
						<span>Market Detector</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("trade-book-5m")}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
							activeTab === "trade-book-5m"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<LineChart className="w-4 h-4" aria-hidden />
						<span>Trade Book 5M</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("running-trade-chart")}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
							activeTab === "running-trade-chart"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<Activity className="w-4 h-4" aria-hidden />
						<span>Running Trade Chart</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("broker-distribution")}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
							activeTab === "broker-distribution"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<GitFork className="w-4 h-4" aria-hidden />
						<span>Broker Distribution</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("swing-screener")}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
							activeTab === "swing-screener"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<Compass className="w-4 h-4" aria-hidden />
						<span>Swing Screener</span>
					</button>
				</div>

				{/* Global Connection Pill Button */}
				<button
					type="button"
					onClick={() => setCredentialsModalOpen(true)}
					className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all min-h-11 cursor-pointer shadow-xs self-start lg:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
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
