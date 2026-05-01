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
 * Custom Styled Numeric Input
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
	return (
		<div className="space-y-2">
			<label className="block">
				<span className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 mb-2 block">
					{label}
				</span>
				<div className="relative group">
					<div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors">
						<Icon className="w-5 h-5" />
					</div>
					<input
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
						className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white font-black placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white/10 transition-all tabular-nums"
					/>
					{suffix && (
						<div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-white/20">
							{suffix}
						</div>
					)}
				</div>
			</label>
		</div>
	);
}

/**
 * Main Calculator Page
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

		const newAvg = totalQty > 0 ? totalInvest / totalQty : 0;

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
		// Formula: x = (TargetAvg * CurrentTotalQty - CurrentTotalInvest) / (MarketPrice - TargetAvg)
		let requiredQty = 0;
		let requiredCapital = 0;
		let goalPossible = false;
		let goalNote = "";

		if (ta > 0 && mp > 0 && totalQty > 0) {
			const denominator = mp - ta;
			if (denominator !== 0) {
				const x = (ta * totalQty - totalInvest) / denominator;
				if (x > 0) {
					requiredQty = x;
					requiredCapital = x * mp;
					goalPossible = true;
				} else {
					goalNote =
						ta < newAvg
							? "Target already reached or market price is too high to lower average."
							: "Target already exceeded.";
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
			newAvg,
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
		<main className="min-h-screen bg-slate-950 relative overflow-hidden font-sans selection:bg-blue-500/30">
			{/* Aesthetic Background */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[150px]" />
				<div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 rounded-full blur-[150px]" />
				<div
					className="absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage:
							"repeating-linear-gradient(0deg, #fff 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0px, transparent 1px, transparent 40px)",
					}}
				/>
			</div>

			<div className="max-w-6xl mx-auto px-6 pt-12 pb-24 relative z-10">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
					<div className="space-y-4">
						<Link
							href="/adventures/utils"
							className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-blue-400 transition-colors gap-2 group"
						>
							<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
							Back to Utilities
						</Link>
						<div className="flex items-center gap-4">
							<div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-900/20">
								<Calculator className="w-8 h-8" />
							</div>
							<div>
								<h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white leading-none">
									Asset <span className="gradient-text">Averaging</span>
								</h1>
								<p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
									Strategic Investment Optimization
								</p>
							</div>
						</div>
					</div>

					<button
						onClick={reset}
						className="self-start md:self-center flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-95"
					>
						<RotateCcw className="w-4 h-4" /> Reset Calculator
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
					{/* ─── Column 1: Inputs ─── */}
					<div className="lg:col-span-5 space-y-8">
						<section className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] space-y-8">
							<div className="space-y-6">
								<div className="flex items-center gap-3">
									<Wallet className="w-5 h-5 text-blue-400" />
									<h2 className="text-lg font-black uppercase tracking-tighter text-white">
										Current Position
									</h2>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<NumericInput
										label="Old Avg Price"
										value={oldPrice}
										onChange={setOldPrice}
										icon={Coins}
										suffix="IDR"
									/>
									<NumericInput
										label="Old Quantity"
										value={oldQty}
										onChange={setOldQty}
										icon={ArrowRightLeft}
									/>
								</div>
							</div>

							<div className="h-px bg-white/10" />

							<div className="space-y-6">
								<div className="flex items-center gap-3">
									<TrendingUp className="w-5 h-5 text-emerald-400" />
									<h2 className="text-lg font-black uppercase tracking-tighter text-white">
										Additional Buy
									</h2>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<NumericInput
										label="New Buy Price"
										value={newPrice}
										onChange={setNewPrice}
										icon={Coins}
										suffix="IDR"
									/>
									<NumericInput
										label="New Quantity"
										value={newQty}
										onChange={setNewQty}
										icon={ArrowRightLeft}
									/>
								</div>
							</div>
						</section>

						<section className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] space-y-6">
							<div className="flex items-center gap-3">
								<Target className="w-5 h-5 text-rose-400" />
								<h2 className="text-lg font-black uppercase tracking-tighter text-white">
									Goal Planning
								</h2>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
							<p className="text-[9px] font-medium text-white/30 uppercase tracking-widest leading-relaxed">
								Calculates the required purchase quantity at current market
								price to hit your target average.
							</p>
						</section>
					</div>

					{/* ─── Column 2: Results & Visualization ─── */}
					<div className="lg:col-span-7 space-y-8">
						{/* Main Result Card */}
						<div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
							<div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
								<Calculator className="w-48 h-48 text-white" />
							</div>
							<div className="relative z-10 space-y-10">
								<div className="space-y-2">
									<p className="text-white/60 text-xs font-black uppercase tracking-[0.4em]">
										New Weighted Average
									</p>
									<h3 className="text-6xl sm:text-7xl font-black text-white tracking-tighter tabular-nums truncate">
										{formatIDR(stats.newAvg)}
									</h3>
								</div>

								<div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
									<div className="space-y-1">
										<p className="text-white/40 text-[9px] font-black uppercase tracking-widest">
											Total Investment
										</p>
										<p className="text-xl font-black text-white tabular-nums">
											{formatIDR(stats.totalInvest)}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-white/40 text-[9px] font-black uppercase tracking-widest">
											Total Quantity
										</p>
										<p className="text-xl font-black text-white tabular-nums">
											{formatNumber(stats.totalQty)}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-white/40 text-[9px] font-black uppercase tracking-widest">
											Initial Capital
										</p>
										<p className="text-xl font-black text-white tabular-nums">
											{formatIDR(stats.initialInvest)}
										</p>
									</div>
								</div>

								{/* weight visualization */}
								<div className="space-y-3">
									<div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
										<span className="text-blue-200">
											Initial {stats.initialWeight.toFixed(1)}%
										</span>
										<span className="text-emerald-200">
											Additional {stats.additionalWeight.toFixed(1)}%
										</span>
									</div>
									<div className="h-4 bg-black/20 rounded-full overflow-hidden border border-white/10 p-1">
										<div className="flex h-full gap-1">
											<motion.div
												className="bg-blue-400 rounded-l-full shadow-[0_0_15px_rgba(96,165,250,0.5)]"
												initial={{ width: 0 }}
												animate={{ width: `${stats.initialWeight}%` }}
												transition={{ duration: 1, ease: "easeOut" }}
											/>
											<motion.div
												className="bg-emerald-400 rounded-r-full shadow-[0_0_15px_rgba(52,211,153,0.5)] flex-1"
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

						{/* Secondary Result Cards */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							{/* Market Position Card */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] space-y-6"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<TrendingUp className="w-5 h-5 text-indigo-400" />
										<h2 className="text-sm font-black uppercase tracking-widest text-white">
											Market P/L
										</h2>
									</div>
									{stats.unrealizedPL !== 0 && (
										<div
											className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
												stats.unrealizedPL > 0
													? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
													: "bg-rose-500/10 border-rose-500/20 text-rose-400"
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
								<div className="space-y-1">
									<p className="text-3xl font-black text-white tabular-nums">
										{stats.unrealizedPL >= 0 ? "" : "-"}
										{formatIDR(Math.abs(stats.unrealizedPL))}
									</p>
									<p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
										Unrealized Performance
									</p>
								</div>
								<div className="pt-4 border-t border-white/10 flex justify-between items-center">
									<span className="text-[10px] font-black uppercase tracking-widest text-white/30">
										Total Value
									</span>
									<span className="text-sm font-black text-white tabular-nums">
										{formatIDR(stats.marketValue)}
									</span>
								</div>
							</motion.div>

							{/* Goal Result Card */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 }}
								className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] space-y-6 relative overflow-hidden"
							>
								<div className="flex items-center gap-3">
									<Target className="w-5 h-5 text-rose-400" />
									<h2 className="text-sm font-black uppercase tracking-widest text-white">
										Action Plan
									</h2>
								</div>

								<AnimatePresence mode="wait">
									{stats.goalPossible ? (
										<motion.div
											key="possible"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="space-y-6"
										>
											<div className="space-y-1">
												<p className="text-3xl font-black text-white tabular-nums">
													{formatNumber(stats.requiredQty)}
												</p>
												<p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
													Required Quantity to Buy
												</p>
											</div>
											<div className="pt-4 border-t border-white/10 flex flex-col gap-2">
												<div className="flex justify-between items-center">
													<span className="text-[10px] font-black uppercase tracking-widest text-white/30">
														Estimated Cost
													</span>
													<span className="text-sm font-black text-emerald-400 tabular-nums">
														{formatIDR(stats.requiredCapital)}
													</span>
												</div>
											</div>
										</motion.div>
									) : (
										<motion.div
											key="not-possible"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="h-full flex flex-col justify-center gap-3"
										>
											<div className="flex items-center gap-3 text-rose-400/50">
												<AlertCircle className="w-8 h-8 flex-shrink-0" />
												<p className="text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
													{stats.goalNote ||
														"Enter Target & Market Price to calculate plan."}
												</p>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
