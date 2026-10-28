"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRightLeft, LineChart, ScanSearch } from "lucide-react";
import RunningTradeView from "./RunningTradeView";
import TradeBookView from "@/features/trade-book/components/TradeBookView";
import TapeAnalyzerView from "./tape-analyzer/TapeAnalyzerView";

type ActiveTab = "running-trade" | "trade-book" | "tape-analyzer";

const TABS: { id: ActiveTab; label: string; icon: typeof ArrowRightLeft }[] = [
	{
		id: "tape-analyzer",
		label: "Tape Reading & Microstructure Screener",
		icon: ScanSearch,
	},
	{
		id: "running-trade",
		label: "Running Trade Retriever",
		icon: ArrowRightLeft,
	},
	{ id: "trade-book", label: "Trade Book Chart", icon: LineChart },
];

function TabsContent() {
	const searchParams = useSearchParams();
	const tabParam = searchParams.get("tab");
	const initialTab: ActiveTab =
		tabParam === "running-trade"
			? "running-trade"
			: tabParam === "trade-book"
				? "trade-book"
				: "tape-analyzer";
	const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
	const tabTrackRef = useRef<HTMLDivElement>(null);

	const switchTab = useCallback((tab: ActiveTab) => {
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
		if (activeBtn) {
			activeBtn.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "center",
			});
		}
	}, [activeTab]);

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Segmented Mode Selector Nav */}
			<div className="w-full overflow-hidden flex items-center justify-start">
				<nav
					ref={tabTrackRef}
					aria-label="Order Trade Workstations"
					className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 backdrop-blur-xs rounded-2xl border border-slate-300/70 shadow-xs overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x flex-nowrap w-full sm:w-auto"
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

			{/* Tab Views */}
			{activeTab === "running-trade" ? (
				<RunningTradeView />
			) : activeTab === "trade-book" ? (
				<TradeBookView />
			) : (
				<TapeAnalyzerView />
			)}
		</div>
	);
}

export default function OrderTradeTabs() {
	return (
		<Suspense
			fallback={
				<div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex items-center justify-center min-h-[300px]">
					<span className="text-xs font-semibold text-slate-400 animate-pulse">
						Loading Order Trade Hub...
					</span>
				</div>
			}
		>
			<TabsContent />
		</Suspense>
	);
}
