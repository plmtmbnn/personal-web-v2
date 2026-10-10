"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Scale,
	ArrowUpRight,
	Calculator,
	Wallet,
	Activity,
} from "lucide-react";
import type {
	AssetType,
	ConsolidatedStats,
	CurrencyCode,
	FeeConfig,
	StockUnit,
} from "../types";
import RealizationTab from "./tabs/RealizationTab";
import TargetSolverTab from "./tabs/TargetSolverTab";
import BudgetPlannerTab from "./tabs/BudgetPlannerTab";
import StressMatrixTab from "./tabs/StressMatrixTab";

interface PositionIntelligenceProps {
	stats: ConsolidatedStats;
	assetType: AssetType;
	stockUnit: StockUnit;
	currency: CurrencyCode;
	feeConfig: FeeConfig;
	expectedBuyPrice?: string;
	targetAveragePrice?: string;
	budgetAmount?: string;
}

type TabKey = "realization" | "solver" | "budget" | "stress";

export default function PositionIntelligence({
	stats,
	assetType,
	stockUnit,
	currency,
	feeConfig,
	expectedBuyPrice = "",
	targetAveragePrice = "",
	budgetAmount = "",
}: PositionIntelligenceProps) {
	const [activeTab, setActiveTab] = useState<TabKey>("realization");

	const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
		{
			key: "realization",
			label: "Realization & Risk",
			icon: ArrowUpRight,
		},
		{
			key: "solver",
			label: "Target Average Solver",
			icon: Calculator,
		},
		{
			key: "budget",
			label: "Budget Planner",
			icon: Wallet,
		},
		{
			key: "stress",
			label: "Market Stress Matrix",
			icon: Activity,
		},
	];

	return (
		<div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
			{/* ── 1. Workstation Header ────────────────────────────────────── */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
						<Scale className="w-5 h-5" />
					</div>
					<div>
						<h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
							Financial Intelligence &amp; Solvers
						</h2>
						<p className="text-xs text-slate-500 font-medium">
							Multi-dimensional position analysis, exit modeling &amp; risk
							preservation
						</p>
					</div>
				</div>
			</div>

			{/* ── 2. Minimalist Frameless Tab Switcher ─────────────────────── */}
			<div className="border-b border-slate-100 pb-px overflow-x-auto no-scrollbar">
				<div className="flex items-center gap-1 sm:gap-2 min-w-max">
					{tabs.map((tab) => {
						const Icon = tab.icon;
						const isActive = activeTab === tab.key;
						return (
							<button
								key={tab.key}
								type="button"
								onClick={() => setActiveTab(tab.key)}
								className={`relative px-3.5 sm:px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
									isActive
										? "text-slate-950 font-bold"
										: "text-slate-500 hover:text-slate-800"
								}`}
							>
								<Icon
									className={`w-3.5 h-3.5 ${
										isActive ? "text-emerald-600" : "text-slate-400"
									}`}
								/>
								<span>{tab.label}</span>

								{isActive && (
									<motion.div
										layoutId="intel-active-tab-indicator"
										className="absolute bottom-0 inset-x-0 h-0.5 bg-slate-900 rounded-full"
										transition={{ type: "spring", stiffness: 400, damping: 30 }}
									/>
								)}
							</button>
						);
					})}
				</div>
			</div>

			{/* ── 3. Active Tab Content (100% Full-Width) ──────────────────── */}
			<div className="pt-1">
				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
					>
						{activeTab === "realization" && (
							<RealizationTab
								stats={stats}
								currency={currency}
								feeConfig={feeConfig}
							/>
						)}

						{activeTab === "solver" && (
							<TargetSolverTab
								stats={stats}
								assetType={assetType}
								stockUnit={stockUnit}
								currency={currency}
								feeConfig={feeConfig}
								initialBuyPrice={expectedBuyPrice}
								initialTargetAvg={targetAveragePrice}
							/>
						)}

						{activeTab === "budget" && (
							<BudgetPlannerTab
								stats={stats}
								assetType={assetType}
								stockUnit={stockUnit}
								currency={currency}
								feeConfig={feeConfig}
								initialBudget={budgetAmount}
								initialBuyPrice={expectedBuyPrice}
							/>
						)}

						{activeTab === "stress" && (
							<StressMatrixTab stats={stats} currency={currency} />
						)}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}
