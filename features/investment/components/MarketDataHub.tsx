"use client";

import { useState } from "react";
import {
	Activity,
	Globe,
	LineChart,
	BookOpen,
	ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { InvestmentCompassData } from "@/features/investment/types";

// Import the components we are consolidating
import FearAndGreedGauge from "@/features/investment/components/FearAndGreedGauge";
import EconomicBackdropSummary from "@/features/investment/components/EconomicBackdropSummary";
import MacroLens from "@/features/investment/components/MacroLens";
import GlobalMarkets from "@/features/investment/components/GlobalMarkets";

type TabId = "macro" | "quotes" | "narrative" | "sentiment";

export default function MarketDataHub({
	data,
}: {
	data: InvestmentCompassData;
}) {
	const [activeTab, setActiveTab] = useState<TabId>("macro");
	const reduceMotion = useReducedMotion();

	const TABS = [
		{ id: "macro", label: "Macro Lens", icon: LineChart },
		{ id: "quotes", label: "Global Quotes", icon: Globe },
		{ id: "narrative", label: "Economic Narrative", icon: BookOpen },
		{ id: "sentiment", label: "Sentiment Dials", icon: Activity },
	] as const;

	return (
		<div className="space-y-5 sm:space-y-6">
			{/* Hub Header & Navigation */}
			<div className="bg-slate-900 rounded-[2rem] p-3 sm:p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
				<div className="flex items-center gap-3 px-2 sm:px-3">
					<div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
						<Activity className="w-4 h-4" />
					</div>
					<div>
						<h3 className="text-sm font-extrabold text-white tracking-tight">
							Market Data Terminal
						</h3>
						<p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
							Raw Indicators &amp; Quotes
						</p>
					</div>
				</div>

				<div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0">
					{TABS.map((tab) => {
						const isActive = activeTab === tab.id;
						const Icon = tab.icon;
						return (
							<button
								type="button"
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 touch-manipulation cursor-pointer ${
									isActive
										? "bg-indigo-500 text-white shadow-lg shadow-indigo-900/20"
										: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800"
								}`}
							>
								<Icon className="w-3.5 h-3.5 shrink-0" />
								<span>{tab.label}</span>
								{isActive && (
									<ChevronRight className="w-3 h-3 ml-0.5 opacity-50 hidden sm:block" />
								)}
							</button>
						);
					})}
				</div>
			</div>

			{/* Tab Content Area */}
			<div className="min-h-[600px] relative">
				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						initial={reduceMotion ? false : { opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
						className="w-full"
					>
						{activeTab === "macro" && <MacroLens data={data} />}

						{activeTab === "quotes" && <GlobalMarkets data={data} />}

						{activeTab === "narrative" && (
							<EconomicBackdropSummary data={data} />
						)}

						{activeTab === "sentiment" && data.sentiment.traditional && (
							<div className="bg-white p-5 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-xs max-w-2xl mx-auto">
								<div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
									<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2.5">
										<Activity className="w-4 h-4 text-indigo-600" />
										Traditional Market Sentiment
									</h3>
								</div>
								{(() => {
									const fng = data.sentiment.traditional.fear_and_greed;
									const historical =
										data.sentiment.traditional.fear_and_greed_historical;
									return (
										<FearAndGreedGauge
											score={fng?.score ?? 50}
											rating={fng?.rating ?? "neutral"}
											previousClose={fng?.previous_close ?? 50}
											previous1Week={fng?.previous_1_week ?? 50}
											previous1Month={fng?.previous_1_month ?? 50}
											previous1Year={fng?.previous_1_year ?? 50}
											historicalData={historical?.data ?? []}
										/>
									);
								})()}
							</div>
						)}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}
