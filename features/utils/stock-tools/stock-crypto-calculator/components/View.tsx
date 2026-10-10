"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, RotateCcw, Copy, Check } from "lucide-react";
import UtilHeader from "@/features/utils/components/UtilHeader";
import type {
	AssetType,
	CurrencyCode,
	FeeConfig,
	StockUnit,
	Tranche,
} from "../types";
import {
	DEFAULT_FEE_CONFIG,
	PRESET_SCENARIOS,
	calculateConsolidatedStats,
	generateShareablePlan,
} from "../utils";
import TelemetryStrip from "./TelemetryStrip";
import PositionBlotter from "./PositionBlotter";
import PositionIntelligence from "./PositionIntelligence";

const INITIAL_TRANCHES: Tranche[] = [
	{ id: "tranche-1", label: "Initial Entry", price: "9500", quantity: "50" },
	{ id: "tranche-2", label: "Dip Accumulation", price: "8800", quantity: "75" },
];

export default function StockCryptoCalculatorView() {
	// ── State ────────────────────────────────────────────────────────────────
	const [assetType, setAssetType] = useState<AssetType>("stock");
	const [stockUnit, setStockUnit] = useState<StockUnit>("lots");
	const [currency, setCurrency] = useState<CurrencyCode>("IDR");
	const [feeConfig, setFeeConfig] = useState<FeeConfig>(
		DEFAULT_FEE_CONFIG.stock,
	);

	const [tranches, setTranches] = useState<Tranche[]>(INITIAL_TRANCHES);
	const [expectedBuyPrice, setExpectedBuyPrice] = useState("");
	const [targetAveragePrice, setTargetAveragePrice] = useState("");
	const [budgetAmount, setBudgetAmount] = useState("");

	const [copied, setCopied] = useState(false);
	const [activePreset, setActivePreset] = useState<string>("IDX Bluechip Dip");

	// ── Calculations ─────────────────────────────────────────────────────────
	const stats = useMemo(
		() => calculateConsolidatedStats(tranches, assetType, stockUnit, feeConfig),
		[tranches, assetType, stockUnit, feeConfig],
	);

	// ── Tranche Handlers ─────────────────────────────────────────────────────
	const handleUpdateTranche = useCallback(
		(id: string, field: "price" | "quantity" | "label", value: string) => {
			setTranches((prev) =>
				prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
			);
		},
		[],
	);

	const handleAddTranche = useCallback(() => {
		setTranches((prev) => {
			if (prev.length >= 8) return prev;
			const nextNum = prev.length + 1;
			const lastPrice = prev[prev.length - 1]?.price || "";
			return [
				...prev,
				{
					id: `tranche-${Date.now()}`,
					label: `Order #${nextNum}`,
					price: lastPrice,
					quantity: "",
				},
			];
		});
	}, []);

	const handleRemoveTranche = useCallback((id: string) => {
		setTranches((prev) =>
			prev.length > 1 ? prev.filter((t) => t.id !== id) : prev,
		);
	}, []);

	// ── Presets & Actions ────────────────────────────────────────────────────
	const handleLoadPreset = useCallback((presetName: string) => {
		const preset = PRESET_SCENARIOS.find((p) => p.name === presetName);
		if (!preset) return;

		setActivePreset(presetName);
		setAssetType(preset.assetType);
		setCurrency(preset.currency);
		if (preset.stockUnit) setStockUnit(preset.stockUnit);
		setFeeConfig(DEFAULT_FEE_CONFIG[preset.assetType]);

		setTranches(
			preset.tranches.map((t, idx) => ({
				id: `tranche-${Date.now()}-${idx}`,
				label: t.label,
				price: t.price,
				quantity: t.quantity,
			})),
		);

		if (preset.marketPrice) setExpectedBuyPrice(preset.marketPrice);
		if (preset.targetAvg) setTargetAveragePrice(preset.targetAvg);
		if (preset.budget) setBudgetAmount(preset.budget);
	}, []);

	const handleReset = useCallback(() => {
		setActivePreset("");
		setTranches([
			{
				id: `tranche-${Date.now()}-1`,
				label: "Initial Entry",
				price: "",
				quantity: "",
			},
			{
				id: `tranche-${Date.now()}-2`,
				label: "Dip Accumulation",
				price: "",
				quantity: "",
			},
		]);
		setExpectedBuyPrice("");
		setTargetAveragePrice("");
		setBudgetAmount("");
	}, []);

	const handleCopyPlan = useCallback(() => {
		const report = generateShareablePlan(
			stats,
			assetType,
			stockUnit,
			currency,
			feeConfig,
		);
		navigator.clipboard.writeText(report);
		setCopied(true);
		setTimeout(() => setCopied(false), 2500);
	}, [stats, assetType, stockUnit, currency, feeConfig]);

	const handleAssetTypeChange = useCallback((newType: AssetType) => {
		setAssetType(newType);
		if (newType === "crypto") {
			setCurrency("USD");
			setFeeConfig(DEFAULT_FEE_CONFIG.crypto);
		} else {
			setCurrency("IDR");
			setStockUnit("lots");
			setFeeConfig(DEFAULT_FEE_CONFIG.stock);
		}
	}, []);

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36 px-3.5 sm:px-6 lg:px-8">
			{/* Floating Bottom Copy Confirmation Toast */}
			<AnimatePresence>
				{copied && (
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 16 }}
						className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold"
					>
						<Check className="w-4 h-4 text-emerald-400" />
						<span>Copied position plan to clipboard</span>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
				{/* ── Tier 1: Canonical Modern Floating Card Header ─────────── */}
				<UtilHeader
					title="Asset Averaging Calculator"
					description="Multi-lot cost basis consolidation, reverse target solver, and profit realization ladder for Indonesian stocks, US equities, and crypto."
					category={{
						label: "Financial Intelligence",
						color: "emerald",
					}}
					icon={Calculator}
					actions={
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
							{/* Presets Row: Clean horizontal track */}
							<div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto">
								<span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-0.5 shrink-0">
									Presets:
								</span>
								{PRESET_SCENARIOS.map((p) => {
									const isSelected = activePreset === p.name;
									return (
										<button
											key={p.name}
											type="button"
											onClick={() => handleLoadPreset(p.name)}
											className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0 whitespace-nowrap ${
												isSelected
													? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
													: "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
											}`}
										>
											{p.name}
										</button>
									);
								})}
							</div>

							{/* Actions: Copy & Reset */}
							<div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
								<button
									type="button"
									onClick={handleCopyPlan}
									className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs active:scale-95"
									title="Copy plan to clipboard"
								>
									{copied ? (
										<Check className="w-3.5 h-3.5 text-emerald-600" />
									) : (
										<Copy className="w-3.5 h-3.5 text-slate-500" />
									)}
									<span>{copied ? "Copied" : "Copy Plan"}</span>
								</button>
								<button
									type="button"
									onClick={handleReset}
									className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer shadow-2xs active:scale-95"
									title="Reset all fields"
								>
									<RotateCcw className="w-3.5 h-3.5" />
									<span>Reset</span>
								</button>
							</div>
						</div>
					}
				/>

				{/* ── Tier 2: Global 4-Stat Telemetry Strip ─────────────────── */}
				<TelemetryStrip
					stats={stats}
					assetType={assetType}
					stockUnit={stockUnit}
					currency={currency}
					feeEnabled={feeConfig.enabled}
				/>

				{/* ── Tier 3 (Stage 1): Full-Width Accumulation Blotter ─────── */}
				<PositionBlotter
					assetType={assetType}
					stockUnit={stockUnit}
					currency={currency}
					feeConfig={feeConfig}
					tranches={tranches}
					trancheStats={stats.tranches}
					stats={stats}
					onAssetTypeChange={handleAssetTypeChange}
					onStockUnitChange={setStockUnit}
					onCurrencyChange={setCurrency}
					onFeeConfigChange={setFeeConfig}
					onUpdateTranche={handleUpdateTranche}
					onAddTranche={handleAddTranche}
					onRemoveTranche={handleRemoveTranche}
					onReset={handleReset}
				/>

				{/* ── Tier 3 (Stage 2): Full-Width Financial Intelligence ───── */}
				<PositionIntelligence
					stats={stats}
					assetType={assetType}
					stockUnit={stockUnit}
					currency={currency}
					feeConfig={feeConfig}
					expectedBuyPrice={expectedBuyPrice}
					targetAveragePrice={targetAveragePrice}
					budgetAmount={budgetAmount}
				/>
			</div>
		</main>
	);
}
