"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Wallet,
	TrendingUp,
	TrendingDown,
	Calculator,
	ArrowRightLeft,
	RotateCcw,
	ArrowLeft,
	Coins,
	Target,
	AlertCircle,
} from "lucide-react";
import Link from "next/link";

// ─── Constants & Helpers ───────────────────────────────────────────────────

const formatIDR = (value: number) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(value);
};

const formatNumber = (value: number) => {
	return new Intl.NumberFormat("id-ID").format(value);
};

// ─── Components ─────────────────────────────────────────────────────────────

/**
 * Custom Styled Numeric Input - Optimized for Light Theme
 */
function NumericInput({
	label,
	value,
	onChange,
	placeholder = "0",
	icon: Icon,
	suffix,
}: {
	label: string;
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
	icon: any;
	suffix?: string;
}) {
	const id = useMemo(
		() => `input-${label.toLowerCase().replace(/\s+/g, "-")}`,
		[label],
	);

	return (
		<div className="space-y-1.5">
			<label htmlFor={id} className="block">
				<span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">
					{label}
				</span>
				<div className="relative group">
					<div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
						<Icon className="w-5 h-5" />
					</div>
					<input
						id={id}
						type="text"
						inputMode="decimal"
						value={value}
						onChange={(e) => {
							const val = e.target.value.replace(/[^0-9.]/g, "");
							if (val === "" || /^\d*\.?\d*$/.test(val)) {
								onChange(val);
							}
						}}
						placeholder={placeholder}
						className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-12 text-slate-900 font-black placeholder:text-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all tabular-nums text-lg shadow-sm"
					/>
					{suffix && (
						<div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-300 pointer-events-none">
							{suffix}
						</div>
					)}
				</div>
			</label>
		</div>
	);
}

/**
 * Enhanced Calculator Page - Solid Productivity Pattern (Light)
 */
export default function StockCryptoCalculator() {
	// ─── State ────────────────────────────────────────────────────────────────
	const [oldPrice, setOldPrice] = useState("");
	const [oldQty, setOldQty] = useState("");
	const [newPrice, setNewPrice] = useState("");
	const [newQty, setNewQty] = useState("");
	const [marketPrice, setMarketPrice] = useState("");
	const [targetAvg, setTargetAvg] = useState("");

	// ─── Calculations ─────────────────────────────────────────────────────────
	const stats = useMemo(() => {
		const op = parseFloat(oldPrice) || 0;
		const oq = parseFloat(oldQty) || 0;
		const np = parseFloat(newPrice) || 0;
		const nq = parseFloat(newQty) || 0;
		const mp = parseFloat(marketPrice) || 0;
		const ta = parseFloat(targetAvg) || 0;

		const initialInvest = op * oq;
		const additionalInvest = np * nq;
		const totalInvest = initialInvest + additionalInvest;
		const totalQty = oq + nq;

		const currentAvg = totalQty > 0 ? totalInvest / totalQty : 0;

		// Initial vs Additional Weight
		const initialWeight =
			totalInvest > 0 ? (initialInvest / totalInvest) * 100 : 0;
		const additionalWeight =
			totalInvest > 0 ? (additionalInvest / totalInvest) * 100 : 0;

		// Market Position (Current P/L)
		const marketValue = totalQty * mp;
		const unrealizedPL = mp > 0 ? marketValue - totalInvest : 0;
		const plPercent = totalInvest > 0 ? (unrealizedPL / totalInvest) * 100 : 0;

		// Goal Planning: How much to buy at MarketPrice to reach TargetAvg?
		// Derivation: (CurrentTotalInvest + (x * MarketPrice)) / (CurrentTotalQty + x) = TargetAvg
		// => x = (CurrentTotalInvest - TargetAvg * CurrentTotalQty) / (TargetAvg - MarketPrice)
		let requiredQty = 0;
		let requiredCapital = 0;
		let goalPossible = false;
		let goalNote = "";

		if (ta > 0 && mp > 0 && totalQty > 0) {
			const numerator = totalInvest - ta * totalQty;
			const denominator = ta - mp;

			if (denominator !== 0) {
				const x = numerator / denominator;

				if (x > 0) {
					requiredQty = x;
					requiredCapital = x * mp;
					goalPossible = true;
				} else {
					// Logic check for why goal isn't possible
					if (ta < currentAvg && mp >= ta) {
						goalNote =
							"Target average is below current average, but market price is higher than target. Cannot reach target by buying.";
					} else if (ta > currentAvg && mp <= ta) {
						goalNote =
							"Target average is above current average, but market price is lower than target. Cannot reach target by buying.";
					} else {
						goalNote =
							"Target average already achieved or exceeded with current market conditions.";
					}
				}
			} else {
				goalNote = "Target price cannot equal market price.";
			}
		}

		return {
			initialInvest,
			additionalInvest,
			totalInvest,
			totalQty,
			newAvg: currentAvg,
			initialWeight,
			additionalWeight,
			unrealizedPL,
			plPercent,
			marketValue,
			requiredQty,
			requiredCapital,
			goalPossible,
			goalNote,
		};
	}, [oldPrice, oldQty, newPrice, newQty, marketPrice, targetAvg]);

	const reset = useCallback(() => {
		setOldPrice("");
		setOldQty("");
		setNewPrice("");
		setNewQty("");
		setMarketPrice("");
		setTargetAvg("");
	}, []);

	// ─── Render ───────────────────────────────────────────────────────────────

	return (
		<main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 text-slate-900 pb-20">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 relative z-10">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
					<div className="space-y-6">
						<Link
							href="/adventures/utils"
							className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 transition-colors gap-2 group"
						>
							<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
							Operational Utilities
						</Link>
						<div className="flex items-center gap-5">
							<div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 active:scale-90 transition-transform">
								<Calculator className="w-7 h-7 sm:w-8 sm:h-8" />
							</div>
							<div>
								<h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 leading-none">
									Asset <span className="text-blue-600">Averaging</span>
								</h1>
								<p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] mt-3">
									Position Strategy & Optimization
								</p>
							</div>
						</div>
					</div>

					<button
						onClick={reset}
						className="self-start flex items-center gap-2.5 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
					>
						<RotateCcw className="w-4 h-4" /> Reset Data
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
					{/* ─── Column 1: Inputs ─── */}
					<div className="lg:col-span-5 space-y-6 sm:space-y-8">
						<section className="p-6 sm:p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm space-y-8">
							<div className="space-y-6">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
										<Wallet className="w-4 h-4" />
									</div>
									<h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
										Current Position
									</h2>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
									<NumericInput
										label="Average Price"
										value={oldPrice}
										onChange={setOldPrice}
										icon={Coins}
										suffix="IDR"
									/>
									<NumericInput
										label="Quantity"
										value={oldQty}
										onChange={setOldQty}
										icon={ArrowRightLeft}
									/>
								</div>
							</div>

							<div className="h-px bg-slate-100" />

							<div className="space-y-6">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
										<TrendingUp className="w-4 h-4" />
									</div>
									<h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
										Planned Acquisition
									</h2>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
									<NumericInput
										label="Buy Price"
										value={newPrice}
										onChange={setNewPrice}
										icon={Coins}
										suffix="IDR"
									/>
									<NumericInput
										label="Buy Quantity"
										value={newQty}
										onChange={setNewQty}
										icon={ArrowRightLeft}
									/>
								</div>
							</div>
						</section>

						<section className="p-6 sm:p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm space-y-6">
							<div className="flex items-center gap-3 text-rose-600">
								<div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
									<Target className="w-4 h-4" />
								</div>
								<h2 className="text-sm font-black uppercase tracking-widest">
									Goal Strategy
								</h2>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
								<NumericInput
									label="Market Price"
									value={marketPrice}
									onChange={setMarketPrice}
									icon={TrendingUp}
									suffix="IDR"
								/>
								<NumericInput
									label="Target Average"
									value={targetAvg}
									onChange={setTargetAvg}
									icon={Target}
									suffix="IDR"
								/>
							</div>
							<div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
								<p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
									Logic: Determines the volume required at Market Price to
									adjust your overall cost to the Target Average.
								</p>
							</div>
						</section>
					</div>

					{/* ─── Column 2: Results ─── */}
					<div className="lg:col-span-7 space-y-6 sm:space-y-8">
						{/* Main Metrics Card */}
						<div className="p-8 sm:p-12 bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-900/30 relative overflow-hidden group">
							<div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
								<Calculator className="w-64 h-64 text-white" />
							</div>

							<div className="relative z-10 space-y-10 sm:space-y-14">
								<div className="space-y-3 text-center sm:text-left">
									<p className="text-blue-400 text-[11px] font-black uppercase tracking-[0.5em]">
										Consolidated Average
									</p>
									<h3 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter tabular-nums truncate leading-none py-2">
										{formatIDR(stats.newAvg)}
									</h3>
								</div>

								<div className="grid grid-cols-2 sm:grid-cols-3 gap-y-10 gap-x-8">
									<div className="space-y-1.5">
										<p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
											Total Investment
										</p>
										<p className="text-2xl font-black text-white tabular-nums leading-none">
											{formatIDR(stats.totalInvest)}
										</p>
									</div>
									<div className="space-y-1.5">
										<p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
											Total Quantity
										</p>
										<p className="text-2xl font-black text-white tabular-nums leading-none">
											{formatNumber(stats.totalQty)}
										</p>
									</div>
									<div className="space-y-1.5 col-span-2 sm:col-span-1">
										<p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
											Capital Base
										</p>
										<p className="text-2xl font-black text-white tabular-nums leading-none">
											{formatIDR(stats.initialInvest)}
										</p>
									</div>
								</div>

								{/* Distribution visualization */}
								<div className="space-y-4">
									<div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
										<span className="text-blue-400">
											Position {stats.initialWeight.toFixed(1)}%
										</span>
										<span className="text-emerald-400">
											Add-on {stats.additionalWeight.toFixed(1)}%
										</span>
									</div>
									<div className="h-5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1.5">
										<div className="flex h-full gap-1.5">
											<motion.div
												className="bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
												initial={{ width: 0 }}
												animate={{ width: `${stats.initialWeight}%` }}
												transition={{ duration: 1.2, ease: "easeOut" }}
											/>
											<motion.div
												className="bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] flex-1"
												initial={{ opacity: 0 }}
												animate={{
													opacity: stats.additionalWeight > 0 ? 1 : 0,
												}}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Operational Cards */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
							{/* Performance Card */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm space-y-6 flex flex-col justify-between"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
											<BarChart3 className="w-4 h-4" />
										</div>
										<h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800">
											Unrealized P/L
										</h2>
									</div>
									{stats.unrealizedPL !== 0 && (
										<div
											className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${
												stats.unrealizedPL > 0
													? "bg-emerald-50 text-emerald-600 border border-emerald-100"
													: "bg-rose-50 text-rose-600 border border-rose-100"
											}`}
										>
											{stats.unrealizedPL > 0 ? (
												<TrendingUp className="w-3 h-3" />
											) : (
												<TrendingDown className="w-3 h-3" />
											)}
											{Math.abs(stats.plPercent).toFixed(2)}%
										</div>
									)}
								</div>
								<div className="py-2">
									<p
										className={`text-4xl font-black tabular-nums leading-none tracking-tight ${stats.unrealizedPL >= 0 ? "text-slate-900" : "text-rose-600"}`}
									>
										{stats.unrealizedPL >= 0 ? "" : "-"}
										{formatIDR(Math.abs(stats.unrealizedPL))}
									</p>
									<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">
										Market Valuation Δ
									</p>
								</div>
								<div className="pt-5 border-t border-slate-100 flex justify-between items-center text-slate-500">
									<span className="text-[10px] font-black uppercase tracking-widest">
										Total Value
									</span>
									<span className="text-base font-black text-slate-900 tabular-nums">
										{formatIDR(stats.marketValue)}
									</span>
								</div>
							</motion.div>

							{/* Action Plan Card */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 }}
								className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm space-y-6 flex flex-col justify-between"
							>
								<div className="flex items-center gap-3 text-rose-600">
									<div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
										<Zap className="w-4 h-4" />
									</div>
									<h2 className="text-[11px] font-black uppercase tracking-widest">
										Action Plan
									</h2>
								</div>

								<div className="flex-1 min-h-[100px] flex flex-col justify-center">
									<AnimatePresence mode="wait">
										{stats.goalPossible ? (
											<motion.div
												key="possible"
												initial={{ opacity: 0, x: 10 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: -10 }}
												className="space-y-6"
											>
												<div>
													<p className="text-4xl font-black text-slate-900 tabular-nums leading-none tracking-tight">
														{formatNumber(stats.requiredQty)}
													</p>
													<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">
														Required Quantity to Buy
													</p>
												</div>
												<div className="pt-5 border-t border-slate-100 flex justify-between items-center">
													<span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
														Capital Needed
													</span>
													<span className="text-base font-black text-emerald-600 tabular-nums">
														{formatIDR(stats.requiredCapital)}
													</span>
												</div>
											</motion.div>
										) : (
											<motion.div
												key="not-possible"
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												className="space-y-3"
											>
												<div className="flex items-start gap-3 text-slate-300">
													<AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
													<p className="text-[10px] font-bold uppercase tracking-widest leading-loose">
														{stats.goalNote ||
															"Enter Target & Market Price to generate plan."}
													</p>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</motion.div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}

// ─── Add extra icons to import list above if needed ─────────────────────────
import { BarChart3, Zap } from "lucide-react";
