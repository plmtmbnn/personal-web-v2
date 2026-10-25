"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRightLeft, LineChart, ScanSearch } from "lucide-react";
import RunningTradeView from "./RunningTradeView";
import TradeBookView from "@/features/trade-book/components/TradeBookView";
import TapeAnalyzerView from "./tape-analyzer/TapeAnalyzerView";

type ActiveTab = "running-trade" | "trade-book" | "tape-analyzer";

function TabsContent() {
	const searchParams = useSearchParams();
	const tabParam = searchParams.get("tab");
	const initialTab: ActiveTab =
		tabParam === "trade-book"
			? "trade-book"
			: tabParam === "tape-analyzer"
				? "tape-analyzer"
				: "running-trade";
	const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Segmented Mode Selector Nav */}
			<div className="flex items-center justify-center sm:justify-start">
				<div className="inline-flex p-1.5 bg-slate-200/70 backdrop-blur-xs rounded-2xl border border-slate-300/70 shadow-xs">
					<button
						type="button"
						onClick={() => setActiveTab("running-trade")}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-11 ${
							activeTab === "running-trade"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<ArrowRightLeft className="w-4 h-4" aria-hidden />
						Running Trade Retriever
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("trade-book")}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-11 ${
							activeTab === "trade-book"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<LineChart className="w-4 h-4" aria-hidden />
						Trade Book Chart
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("tape-analyzer")}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-11 ${
							activeTab === "tape-analyzer"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<ScanSearch className="w-4 h-4" aria-hidden />
						Tape Reading Analyzer
					</button>
				</div>
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
