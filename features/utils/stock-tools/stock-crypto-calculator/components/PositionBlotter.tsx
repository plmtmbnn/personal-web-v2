"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Plus,
	Trash2,
	RotateCcw,
	Percent,
	Layers,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import type {
	AssetType,
	ConsolidatedStats,
	CurrencyCode,
	FeeConfig,
	StockUnit,
	Tranche,
	TrancheStat,
} from "../types";
import { formatCurrency, formatQuantity } from "../utils";

interface PositionBlotterProps {
	assetType: AssetType;
	stockUnit: StockUnit;
	currency: CurrencyCode;
	feeConfig: FeeConfig;
	tranches: Tranche[];
	trancheStats: TrancheStat[];
	stats: ConsolidatedStats;
	onAssetTypeChange: (type: AssetType) => void;
	onStockUnitChange: (unit: StockUnit) => void;
	onCurrencyChange: (curr: CurrencyCode) => void;
	onFeeConfigChange: (updater: (prev: FeeConfig) => FeeConfig) => void;
	onUpdateTranche: (
		id: string,
		field: "price" | "quantity" | "label",
		value: string,
	) => void;
	onAddTranche: () => void;
	onRemoveTranche: (id: string) => void;
	onReset: () => void;
}

const ALLOCATION_COLORS = [
	"bg-indigo-500",
	"bg-emerald-500",
	"bg-blue-500",
	"bg-amber-500",
	"bg-purple-500",
	"bg-sky-500",
	"bg-rose-500",
	"bg-teal-500",
];

export default function PositionBlotter({
	assetType,
	stockUnit,
	currency,
	feeConfig,
	tranches,
	trancheStats,
	stats,
	onAssetTypeChange,
	onStockUnitChange,
	onCurrencyChange,
	onFeeConfigChange,
	onUpdateTranche,
	onAddTranche,
	onRemoveTranche,
	onReset,
}: PositionBlotterProps) {
	const [showFeeSettings, setShowFeeSettings] = useState(false);

	const currencySuffix = currency === "IDR" ? "Rp" : "$";
	const unitSuffix =
		assetType === "stock"
			? stockUnit === "lots"
				? "Lots"
				: "Shares"
			: "Units";

	const handleSegmentSelect = (
		segment: "stock-lots" | "stock-shares" | "crypto",
	) => {
		if (segment === "stock-lots") {
			onAssetTypeChange("stock");
			onStockUnitChange("lots");
			onCurrencyChange("IDR");
		} else if (segment === "stock-shares") {
			onAssetTypeChange("stock");
			onStockUnitChange("shares");
		} else {
			onAssetTypeChange("crypto");
			onCurrencyChange("USD");
		}
	};

	const currentSegment =
		assetType === "crypto"
			? "crypto"
			: stockUnit === "lots"
				? "stock-lots"
				: "stock-shares";

	return (
		<div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
			{/* ── 1. Blotter Header ────────────────────────────────────────── */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
						<Layers className="w-5 h-5" />
					</div>
					<div>
						<h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
							Accumulation Blotter
						</h2>
						<p className="text-xs text-slate-500 font-medium">
							Multi-tranche execution ledger · {tranches.length} active order{" "}
							{tranches.length === 1 ? "entry" : "entries"}
						</p>
					</div>
				</div>

				{/* Currency & Fee Controls */}
				<div className="flex items-center gap-2.5 self-start sm:self-auto">
					{/* Currency Switcher */}
					<div className="flex items-center p-1 bg-slate-100 rounded-xl">
						<button
							type="button"
							onClick={() => onCurrencyChange("IDR")}
							className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
								currency === "IDR"
									? "bg-white text-slate-900 shadow-2xs font-bold"
									: "text-slate-500 hover:text-slate-900"
							}`}
						>
							IDR
						</button>
						<button
							type="button"
							onClick={() => onCurrencyChange("USD")}
							className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
								currency === "USD"
									? "bg-white text-slate-900 shadow-2xs font-bold"
									: "text-slate-500 hover:text-slate-900"
							}`}
						>
							USD
						</button>
					</div>

					{/* Fee Drawer Toggle */}
					<button
						type="button"
						onClick={() => setShowFeeSettings(!showFeeSettings)}
						className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
							feeConfig.enabled
								? "bg-emerald-50 text-emerald-800 border-emerald-200/80 font-bold"
								: "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
						}`}
					>
						<Percent className="w-3.5 h-3.5" />
						<span>{feeConfig.enabled ? "Fees Active" : "Fees Off"}</span>
						{showFeeSettings ? (
							<ChevronUp className="w-3 h-3 text-slate-400" />
						) : (
							<ChevronDown className="w-3 h-3 text-slate-400" />
						)}
					</button>
				</div>
			</div>

			{/* ── 2. Asset Class Segmented Selector ────────────────────────── */}
			<div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl max-w-lg">
				<button
					type="button"
					onClick={() => handleSegmentSelect("stock-lots")}
					className={`relative py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center ${
						currentSegment === "stock-lots"
							? "text-slate-900 font-bold"
							: "text-slate-500 hover:text-slate-800"
					}`}
				>
					{currentSegment === "stock-lots" && (
						<motion.div
							layoutId="blotter-segment-pill"
							className="absolute inset-0 bg-white rounded-xl shadow-2xs -z-10"
							transition={{ type: "spring", stiffness: 450, damping: 35 }}
						/>
					)}
					<span className="hidden sm:inline">IDX Stock (Lots)</span>
					<span className="sm:hidden truncate">IDX (Lots)</span>
				</button>

				<button
					type="button"
					onClick={() => handleSegmentSelect("stock-shares")}
					className={`relative py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center ${
						currentSegment === "stock-shares"
							? "text-slate-900 font-bold"
							: "text-slate-500 hover:text-slate-800"
					}`}
				>
					{currentSegment === "stock-shares" && (
						<motion.div
							layoutId="blotter-segment-pill"
							className="absolute inset-0 bg-white rounded-xl shadow-2xs -z-10"
							transition={{ type: "spring", stiffness: 450, damping: 35 }}
						/>
					)}
					<span className="hidden sm:inline">Equities (Shares)</span>
					<span className="sm:hidden truncate">US Shares</span>
				</button>

				<button
					type="button"
					onClick={() => handleSegmentSelect("crypto")}
					className={`relative py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center ${
						currentSegment === "crypto"
							? "text-slate-900 font-bold"
							: "text-slate-500 hover:text-slate-800"
					}`}
				>
					{currentSegment === "crypto" && (
						<motion.div
							layoutId="blotter-segment-pill"
							className="absolute inset-0 bg-white rounded-xl shadow-2xs -z-10"
							transition={{ type: "spring", stiffness: 450, damping: 35 }}
						/>
					)}
					<span className="hidden sm:inline">Crypto (Tokens)</span>
					<span className="sm:hidden truncate">Crypto</span>
				</button>
			</div>

			{/* ── 3. Collapsible Fee Configuration Drawer ─────────────────── */}
			<AnimatePresence>
				{showFeeSettings && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="overflow-hidden"
					>
						<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
								<label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
									<input
										type="checkbox"
										checked={feeConfig.enabled}
										onChange={(e) =>
											onFeeConfigChange((prev) => ({
												...prev,
												enabled: e.target.checked,
											}))
										}
										className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
									/>
									<span>
										Include broker commission &amp; exchange levies in cost
										basis
									</span>
								</label>

								{feeConfig.enabled && (
									<div className="flex items-center gap-3">
										<div className="flex items-center gap-1.5">
											<span className="text-slate-500 font-medium">
												Buy Commission:
											</span>
											<input
												type="number"
												step="0.01"
												value={feeConfig.buyFeePercent}
												onChange={(e) =>
													onFeeConfigChange((prev) => ({
														...prev,
														buyFeePercent:
															Number.parseFloat(e.target.value) || 0,
													}))
												}
												className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-semibold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
											/>
											<span className="text-slate-400 font-semibold">%</span>
										</div>
										<div className="flex items-center gap-1.5">
											<span className="text-slate-500 font-medium">
												Sell Levy:
											</span>
											<input
												type="number"
												step="0.01"
												value={feeConfig.sellFeePercent}
												onChange={(e) =>
													onFeeConfigChange((prev) => ({
														...prev,
														sellFeePercent:
															Number.parseFloat(e.target.value) || 0,
													}))
												}
												className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-semibold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
											/>
											<span className="text-slate-400 font-semibold">%</span>
										</div>
									</div>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* ── 4. Order Ledger Table (Desktop) ─────────────────────────── */}
			<div className="space-y-4">
				<div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
					<table className="w-full text-left text-xs border-collapse">
						<thead>
							<tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
								<th className="py-3 px-4 font-bold w-1/4">Order Label</th>
								<th className="py-3 px-4 font-bold w-1/5">
									Price ({currencySuffix})
								</th>
								<th className="py-3 px-4 font-bold w-1/5">
									Volume ({unitSuffix})
								</th>
								<th className="py-3 px-4 font-bold text-right">
									Subtotal Outlay
								</th>
								<th className="py-3 px-4 font-bold text-right w-24">
									Allocation
								</th>
								<th className="py-3 px-3 text-center w-12"></th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{tranches.map((tranche, index) => {
								const stat = trancheStats[index];
								return (
									<tr
										key={tranche.id}
										className="group hover:bg-slate-50/50 transition-colors"
									>
										{/* Label */}
										<td className="py-3 px-4">
											<input
												type="text"
												value={tranche.label}
												onChange={(e) =>
													onUpdateTranche(tranche.id, "label", e.target.value)
												}
												placeholder={`Order #${index + 1}`}
												className="w-full font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none transition-colors text-xs py-1"
											/>
										</td>

										{/* Price */}
										<td className="py-3 px-4">
											<input
												type="text"
												inputMode="decimal"
												value={tranche.price}
												onChange={(e) => {
													const val = e.target.value.replace(/[^0-9.]/g, "");
													if (val === "" || /^\d*\.?\d*$/.test(val)) {
														onUpdateTranche(tranche.id, "price", val);
													}
												}}
												placeholder="0"
												className="w-full bg-slate-50 group-hover:bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all tabular-nums text-xs"
											/>
										</td>

										{/* Volume */}
										<td className="py-3 px-4">
											<input
												type="text"
												inputMode="decimal"
												value={tranche.quantity}
												onChange={(e) => {
													const val = e.target.value.replace(/[^0-9.]/g, "");
													if (val === "" || /^\d*\.?\d*$/.test(val)) {
														onUpdateTranche(tranche.id, "quantity", val);
													}
												}}
												placeholder="0"
												className="w-full bg-slate-50 group-hover:bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all tabular-nums text-xs"
											/>
										</td>

										{/* Subtotal Outlay */}
										<td className="py-3 px-4 text-right">
											<span className="font-mono font-semibold text-slate-900 tabular-nums">
												{stat && stat.grossCapital > 0
													? formatCurrency(stat.totalCapital, currency)
													: "—"}
											</span>
											{stat &&
												stat.normalizedUnits > 0 &&
												assetType === "stock" &&
												stockUnit === "lots" && (
													<span className="block text-[10px] text-slate-400 font-medium">
														{formatQuantity(
															stat.normalizedUnits,
															"stock",
															"shares",
														)}{" "}
														sh
													</span>
												)}
										</td>

										{/* Allocation Weight */}
										<td className="py-3 px-4 text-right">
											<span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold tabular-nums">
												{stat ? `${stat.capitalWeight.toFixed(1)}%` : "0.0%"}
											</span>
										</td>

										{/* Remove Action */}
										<td className="py-3 px-3 text-center">
											{tranches.length > 1 && (
												<button
													type="button"
													onClick={() => onRemoveTranche(tranche.id)}
													className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
													title="Remove order"
													aria-label="Remove order"
												>
													<Trash2 className="w-3.5 h-3.5" />
												</button>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{/* Mobile Compact Card View */}
				<div className="md:hidden space-y-3">
					{tranches.map((tranche, index) => {
						const stat = trancheStats[index];
						return (
							<div
								key={tranche.id}
								className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3"
							>
								{/* Header: Label & Weight */}
								<div className="flex items-center justify-between gap-2">
									<input
										type="text"
										value={tranche.label}
										onChange={(e) =>
											onUpdateTranche(tranche.id, "label", e.target.value)
										}
										placeholder={`Order #${index + 1}`}
										className="font-semibold text-slate-900 bg-transparent border-b border-transparent focus:border-slate-900 focus:outline-none text-xs w-full max-w-[180px]"
									/>

									<div className="flex items-center gap-2 shrink-0">
										<span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono text-[10px] font-semibold tabular-nums">
											{stat ? `${stat.capitalWeight.toFixed(1)}%` : "0.0%"}
										</span>
										{tranches.length > 1 && (
											<button
												type="button"
												onClick={() => onRemoveTranche(tranche.id)}
												className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
												title="Remove order"
												aria-label="Remove order"
											>
												<Trash2 className="w-3.5 h-3.5" />
											</button>
										)}
									</div>
								</div>

								{/* Price & Volume Inputs */}
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1">
										<label
											htmlFor={`mobile-price-${tranche.id}`}
											className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 cursor-pointer"
										>
											Price ({currencySuffix})
										</label>
										<input
											id={`mobile-price-${tranche.id}`}
											type="text"
											inputMode="decimal"
											value={tranche.price}
											onChange={(e) => {
												const val = e.target.value.replace(/[^0-9.]/g, "");
												if (val === "" || /^\d*\.?\d*$/.test(val)) {
													onUpdateTranche(tranche.id, "price", val);
												}
											}}
											placeholder="0"
											className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all tabular-nums text-sm"
										/>
									</div>

									<div className="space-y-1">
										<label
											htmlFor={`mobile-vol-${tranche.id}`}
											className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 cursor-pointer"
										>
											Volume ({unitSuffix})
										</label>
										<input
											id={`mobile-vol-${tranche.id}`}
											type="text"
											inputMode="decimal"
											value={tranche.quantity}
											onChange={(e) => {
												const val = e.target.value.replace(/[^0-9.]/g, "");
												if (val === "" || /^\d*\.?\d*$/.test(val)) {
													onUpdateTranche(tranche.id, "quantity", val);
												}
											}}
											placeholder="0"
											className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all tabular-nums text-sm"
										/>
									</div>
								</div>

								{/* Subtotal Outlay */}
								{stat && stat.grossCapital > 0 && (
									<div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
										<span className="text-slate-500 font-medium">
											{assetType === "stock" && stockUnit === "lots"
												? `${formatQuantity(stat.normalizedUnits, "stock", "shares")} shares`
												: "Outlay Subtotal"}
										</span>
										<span className="font-mono font-semibold text-slate-900 tabular-nums">
											{formatCurrency(stat.totalCapital, currency)}
										</span>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* ── 5. Capital Weight Allocation Bar ─────────────────────────── */}
			{stats.totalUnits > 0 && stats.tranches.length > 0 && (
				<div className="space-y-2.5 pt-2">
					<div className="flex items-center justify-between text-xs font-semibold text-slate-600">
						<span>Capital Allocation Breakdown</span>
						<span className="text-[11px] text-slate-400 font-medium">
							{stats.tranches.length} Tranches
						</span>
					</div>

					{/* Continuous multi-segment progress bar */}
					<div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5 gap-0.5">
						{stats.tranches.map((t, i) => {
							if (t.capitalWeight <= 0) return null;
							return (
								<motion.div
									key={t.id}
									initial={{ width: 0 }}
									animate={{ width: `${t.capitalWeight}%` }}
									transition={{ duration: 0.5, ease: "easeOut" }}
									className={`h-full rounded-full ${
										ALLOCATION_COLORS[i % ALLOCATION_COLORS.length]
									}`}
									title={`${t.label}: ${t.capitalWeight.toFixed(1)}%`}
								/>
							);
						})}
					</div>

					{/* Legend */}
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
						{stats.tranches.map((t, i) => (
							<div
								key={t.id}
								className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600"
							>
								<span
									className={`w-2 h-2 rounded-full shrink-0 ${
										ALLOCATION_COLORS[i % ALLOCATION_COLORS.length]
									}`}
								/>
								<span className="font-semibold text-slate-700">
									{t.label || `Order #${i + 1}`}:
								</span>
								<span className="font-mono text-slate-500 tabular-nums shrink-0">
									{t.capitalWeight.toFixed(1)}%
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* ── 6. Bottom Actions Strip ─────────────────────────────────── */}
			<div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
				<button
					type="button"
					onClick={onAddTranche}
					disabled={tranches.length >= 8}
					className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-semibold rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
				>
					<Plus className="w-3.5 h-3.5" />
					<span>Add Order ({tranches.length}/8)</span>
				</button>

				<button
					type="button"
					onClick={onReset}
					className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 text-xs font-semibold rounded-xl transition-all active:scale-95 cursor-pointer"
					title="Clear all orders and reset"
				>
					<RotateCcw className="w-3.5 h-3.5" />
					<span>Reset Blotter</span>
				</button>
			</div>
		</div>
	);
}
