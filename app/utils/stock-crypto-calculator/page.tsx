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
	BarChart3,
	Zap,
	CheckCircle2,
	Info,
	Layers,
} from "lucide-react";
import Link from "next/link";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ReferenceLine,
	ResponsiveContainer,
	Cell,
} from "recharts";

// ─── Constants & Helpers ───────────────────────────────────────────────────

const formatIDR = (value: number) =>
	new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);

const formatNumber = (value: number, decimals = 4) =>
	new Intl.NumberFormat("id-ID", {
		minimumFractionDigits: 0,
		maximumFractionDigits: decimals,
	}).format(value);

const formatPct = (v: number) => `${(v >= 0 ? "+" : "") + v.toFixed(2)}%`;

// ─── Quick Scenarios ───────────────────────────────────────────────────────

const SCENARIOS = [
	{
		label: "DCA Example",
		values: {
			oldPrice: "10000",
			oldQty: "500",
			newPrice: "8500",
			newQty: "500",
			marketPrice: "9000",
			targetAvg: "9200",
		},
	},
	{
		label: "Average Down",
		values: {
			oldPrice: "15000",
			oldQty: "200",
			newPrice: "10000",
			newQty: "300",
			marketPrice: "11000",
			targetAvg: "12000",
		},
	},
	{
		label: "Average Up",
		values: {
			oldPrice: "5000",
			oldQty: "1000",
			newPrice: "7000",
			newQty: "500",
			marketPrice: "7500",
			targetAvg: "6000",
		},
	},
];

// ─── Sub-components ────────────────────────────────────────────────────────

function NumericInput({
	label,
	value,
	onChange,
	placeholder = "0",
	icon: Icon,
	suffix,
	hint,
}: {
	label: string;
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
	icon: React.ElementType;
	suffix?: string;
	hint?: string;
}) {
	const id = `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

	return (
		<div className="space-y-1.5">
			<label htmlFor={id} className="block">
				<span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">
					{label}
				</span>
				<div className="relative group">
					<div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors duration-200">
						<Icon className="w-4 h-4" />
					</div>
					<input
						id={id}
						type="text"
						inputMode="decimal"
						value={value}
						onChange={(e) => {
							const val = e.target.value.replace(/[^0-9.]/g, "");
							if (val === "" || /^\d*\.?\d*$/.test(val)) onChange(val);
						}}
						placeholder={placeholder}
						className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-12 text-slate-900 font-bold placeholder:text-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all tabular-nums text-sm shadow-sm"
					/>
					{suffix && (
						<div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-300 pointer-events-none">
							{suffix}
						</div>
					)}
				</div>
			</label>
			{hint && (
				<p className="text-[10px] text-slate-400 ml-1 leading-relaxed">
					{hint}
				</p>
			)}
		</div>
	);
}

function SectionHeader({
	icon: Icon,
	label,
	color = "blue",
}: {
	icon: React.ElementType;
	label: string;
	color?: "blue" | "emerald" | "rose" | "violet";
}) {
	const colors = {
		blue: "bg-blue-50 text-blue-600",
		emerald: "bg-emerald-50 text-emerald-600",
		rose: "bg-rose-50 text-rose-600",
		violet: "bg-violet-50 text-violet-600",
	};
	return (
		<div className="flex items-center gap-3 mb-5">
			<div
				className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}
			>
				<Icon className="w-4 h-4" />
			</div>
			<h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
				{label}
			</h2>
		</div>
	);
}

function StatRow({
	label,
	value,
	valueClass = "text-slate-900",
}: {
	label: string;
	value: string;
	valueClass?: string;
}) {
	return (
		<div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
			<span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
				{label}
			</span>
			<span className={`text-sm font-black tabular-nums ${valueClass}`}>
				{value}
			</span>
		</div>
	);
}

// ─── Custom Recharts Tooltip ───────────────────────────────────────────────

function ScenarioTooltip({ active, payload, label }: any) {
	if (!active || !payload?.length) return null;
	const val = payload[0].value as number;
	return (
		<div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-[11px] font-black">
			<p className="text-slate-400 uppercase tracking-widest mb-1">{label}</p>
			<p className={val >= 0 ? "text-emerald-600" : "text-rose-600"}>
				P/L: {(val >= 0 ? "+" : "") + formatIDR(val)}
			</p>
		</div>
	);
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function StockCryptoCalculator() {
	// ── State ──────────────────────────────────────────────────────────────
	const [oldPrice, setOldPrice] = useState("");
	const [oldQty, setOldQty] = useState("");
	const [newPrice, setNewPrice] = useState("");
	const [newQty, setNewQty] = useState("");
	const [marketPrice, setMarketPrice] = useState("");
	const [targetAvg, setTargetAvg] = useState("");

	// ── Calculations ───────────────────────────────────────────────────────
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

		const initialWeight =
			totalInvest > 0 ? (initialInvest / totalInvest) * 100 : 0;
		const additionalWeight =
			totalInvest > 0 ? (additionalInvest / totalInvest) * 100 : 0;

		// Market P/L
		const marketValue = totalQty * mp;
		const unrealizedPL = mp > 0 ? marketValue - totalInvest : 0;
		const plPercent = totalInvest > 0 ? (unrealizedPL / totalInvest) * 100 : 0;

		// Breakeven delta
		const breakevenDiff = currentAvg > 0 && mp > 0 ? mp - currentAvg : 0;
		const breakevenPct =
			currentAvg > 0 && mp > 0 ? ((mp - currentAvg) / currentAvg) * 100 : 0;

		// Goal planning
		// (totalInvest + x*mp) / (totalQty + x) = ta  →  x = (totalInvest − ta*totalQty) / (ta − mp)
		let requiredQty = 0;
		let requiredCapital = 0;
		let verifiedAvg = 0;
		let newTotalQty = 0;
		let newTotalInvest = 0;
		let goalPossible = false;
		let goalNote = "";

		if (ta > 0 && mp > 0 && totalQty > 0) {
			const num = totalInvest - ta * totalQty;
			const den = ta - mp;
			if (Math.abs(den) < 1e-10) {
				goalNote = "Target average cannot equal market price.";
			} else {
				const x = num / den;
				if (x > 0) {
					requiredQty = x;
					requiredCapital = x * mp;
					newTotalInvest = totalInvest + requiredCapital;
					newTotalQty = totalQty + x;
					verifiedAvg = newTotalInvest / newTotalQty;
					goalPossible = true;
				} else {
					if (ta < currentAvg && mp >= ta)
						goalNote =
							"Target is below current average, but market price is above target. Need to buy lower.";
					else if (ta > currentAvg && mp <= ta)
						goalNote =
							"Target is above current average but market price is below target. Cannot average up to this target by buying.";
					else
						goalNote =
							"Target already achieved or exceeded with current holdings.";
				}
			}
		}

		// Scenario chart data — P/L at ±50% of current avg around market price
		const base = currentAvg > 0 ? currentAvg : mp > 0 ? mp : 1000;
		const scenarioData = Array.from({ length: 9 }, (_, i) => {
			const price = base * (0.5 + i * 0.125);
			const mktVal = totalQty * price;
			const pl = mktVal - totalInvest;
			return { price: formatIDR(Math.round(price)), pl: Math.round(pl) };
		});

		return {
			initialInvest,
			additionalInvest,
			totalInvest,
			totalQty,
			currentAvg,
			initialWeight,
			additionalWeight,
			unrealizedPL,
			plPercent,
			marketValue,
			breakevenDiff,
			breakevenPct,
			requiredQty,
			requiredCapital,
			verifiedAvg,
			newTotalQty,
			newTotalInvest,
			goalPossible,
			goalNote,
			scenarioData,
		};
	}, [oldPrice, oldQty, newPrice, newQty, marketPrice, targetAvg]);

	// ── Actions ────────────────────────────────────────────────────────────
	const reset = useCallback(() => {
		setOldPrice("");
		setOldQty("");
		setNewPrice("");
		setNewQty("");
		setMarketPrice("");
		setTargetAvg("");
	}, []);

	const fillScenario = useCallback((s: (typeof SCENARIOS)[number]) => {
		setOldPrice(s.values.oldPrice);
		setOldQty(s.values.oldQty);
		setNewPrice(s.values.newPrice);
		setNewQty(s.values.newQty);
		setMarketPrice(s.values.marketPrice);
		setTargetAvg(s.values.targetAvg);
	}, []);

	// ── Render ─────────────────────────────────────────────────────────────
	return (
		<main className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 selection:bg-blue-100">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 relative z-10">
				{/* ── Header ── */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
					<div className="space-y-5">
						<Link
							href="/utils"
							className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 transition-colors gap-2 group"
						>
							<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
							Operational Utilities
						</Link>
						<div className="flex items-center gap-5">
							<div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20">
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

					<div className="flex items-center gap-3 self-start">
						{/* Quick scenarios */}
						<div className="flex flex-wrap gap-2">
							{SCENARIOS.map((s) => (
								<button
									key={s.label}
									onClick={() => fillScenario(s)}
									className="px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 shadow-sm"
								>
									{s.label}
								</button>
							))}
						</div>
						<button
							onClick={reset}
							className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
						>
							<RotateCcw className="w-3.5 h-3.5" />
							Reset
						</button>
					</div>
				</div>

				{/* ── Main Grid ── */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
					{/* ── Column 1: Inputs ── */}
					<div className="lg:col-span-5 space-y-6">
						{/* Current Position */}
						<section className="p-6 sm:p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
							<SectionHeader
								icon={Wallet}
								label="Current Position"
								color="blue"
							/>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<NumericInput
									label="Average Buy Price"
									value={oldPrice}
									onChange={setOldPrice}
									icon={Coins}
									suffix="IDR"
								/>
								<NumericInput
									label="Quantity Held"
									value={oldQty}
									onChange={setOldQty}
									icon={ArrowRightLeft}
								/>
							</div>
							{/* Summary pill */}
							{parseFloat(oldPrice) > 0 && parseFloat(oldQty) > 0 && (
								<motion.div
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									className="mt-4 px-4 py-2.5 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between"
								>
									<span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
										Capital Base
									</span>
									<span className="text-sm font-black tabular-nums text-blue-700">
										{formatIDR(parseFloat(oldPrice) * parseFloat(oldQty))}
									</span>
								</motion.div>
							)}
						</section>

						{/* Planned Acquisition */}
						<section className="p-6 sm:p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
							<SectionHeader
								icon={TrendingUp}
								label="Planned Acquisition"
								color="emerald"
							/>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
							{parseFloat(newPrice) > 0 && parseFloat(newQty) > 0 && (
								<motion.div
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									className="mt-4 px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between"
								>
									<span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
										Add-on Capital
									</span>
									<span className="text-sm font-black tabular-nums text-emerald-700">
										{formatIDR(parseFloat(newPrice) * parseFloat(newQty))}
									</span>
								</motion.div>
							)}
						</section>

						{/* Goal Strategy */}
						<section className="p-6 sm:p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
							<SectionHeader icon={Target} label="Goal Strategy" color="rose" />
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
							<div className="mt-4 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
								<Info className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
								<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
									Computes the volume to buy at market price to reach your
									target cost basis.
								</p>
							</div>
						</section>
					</div>

					{/* ── Column 2: Results ── */}
					<div className="lg:col-span-7 space-y-6">
						{/* Main Avg Card */}
						<div className="p-8 sm:p-10 bg-white-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/30 relative overflow-hidden group">
							<div className="absolute -top-8 -right-8 opacity-[0.04] group-hover:rotate-12 transition-transform duration-700">
								<Calculator className="w-56 h-56 text-black" />
							</div>
							<div className="relative z-10 space-y-8">
								<div>
									<p className="text-blue-400 text-[11px] font-black uppercase tracking-[0.5em] mb-2">
										Consolidated Average
									</p>
									<h3 className="text-5xl sm:text-6xl font-black text-black tracking-tighter tabular-nums leading-none truncate">
										{formatIDR(stats.currentAvg)}
									</h3>
								</div>

								<div className="grid grid-cols-3 gap-4">
									<div>
										<p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1 !font-black">
											Total Investment
										</p>
										<p className="text-lg font-black text-black tabular-nums">
											{formatIDR(stats.totalInvest)}
										</p>
									</div>
									<div>
										<p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
											Total Quantity
										</p>
										<p className="text-lg font-black text-black tabular-nums">
											{formatNumber(stats.totalQty)}
										</p>
									</div>
									<div>
										<p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
											Capital Base
										</p>
										<p className="text-lg font-black text-black tabular-nums">
											{formatIDR(stats.initialInvest)}
										</p>
									</div>
								</div>

								{/* Distribution bar */}
								<div className="space-y-3">
									<div className="flex justify-between text-[11px] font-white uppercase tracking-widest">
										<span className="text-blue-400">
											Position {stats.initialWeight.toFixed(1)}%
										</span>
										<span className="text-emerald-400">
											Add-on {stats.additionalWeight.toFixed(1)}%
										</span>
									</div>
									<div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
										<div className="flex h-full gap-1">
											<motion.div
												className="bg-blue-500 rounded-full"
												initial={{ width: 0 }}
												animate={{ width: `${stats.initialWeight}%` }}
												transition={{ duration: 1, ease: "easeOut" }}
											/>
											<motion.div
												className="bg-emerald-500 rounded-full flex-1"
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

						{/* P/L + Action Plan */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							{/* P/L Card */}
							<motion.div
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col gap-4"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
											<BarChart3 className="w-4 h-4" />
										</div>
										<h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800">
											Unrealized P/L
										</h2>
									</div>
									{stats.unrealizedPL !== 0 && (
										<span
											className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black ${stats.unrealizedPL > 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}
										>
											{stats.unrealizedPL > 0 ? (
												<TrendingUp className="w-3 h-3" />
											) : (
												<TrendingDown className="w-3 h-3" />
											)}
											{Math.abs(stats.plPercent).toFixed(2)}%
										</span>
									)}
								</div>

								<div>
									<p
										className={`text-3xl font-black tabular-nums leading-none ${stats.unrealizedPL > 0 ? "text-emerald-600" : stats.unrealizedPL < 0 ? "text-rose-600" : "text-slate-400"}`}
									>
										{stats.unrealizedPL >= 0 ? "+" : ""}
										{formatIDR(stats.unrealizedPL)}
									</p>
									<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
										Market Valuation Delta
									</p>
								</div>

								<div className="border-t border-slate-100 pt-3 space-y-0">
									<StatRow
										label="Market Value"
										value={
											stats.marketValue > 0 ? formatIDR(stats.marketValue) : "—"
										}
									/>
									<StatRow
										label="vs Avg"
										value={
											stats.breakevenDiff !== 0
												? (stats.breakevenDiff >= 0 ? "+" : "") +
													formatIDR(stats.breakevenDiff)
												: "—"
										}
										valueClass={
											stats.breakevenDiff > 0
												? "text-emerald-600"
												: stats.breakevenDiff < 0
													? "text-rose-600"
													: "text-slate-400"
										}
									/>
									<StatRow
										label="Pct to Avg"
										value={
											stats.breakevenPct !== 0
												? formatPct(stats.breakevenPct)
												: "—"
										}
										valueClass={
											stats.breakevenPct > 0
												? "text-emerald-600"
												: stats.breakevenPct < 0
													? "text-rose-600"
													: "text-slate-400"
										}
									/>
								</div>
							</motion.div>

							{/* Action Plan Card */}
							<motion.div
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.08 }}
								className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col gap-4"
							>
								<div className="flex items-center gap-2">
									<div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
										<Zap className="w-4 h-4" />
									</div>
									<h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800">
										Action Plan
									</h2>
								</div>

								<AnimatePresence mode="wait">
									{stats.goalPossible ? (
										<motion.div
											key="possible"
											initial={{ opacity: 0, x: 8 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -8 }}
											className="flex flex-col gap-3 flex-1"
										>
											<div className="flex items-center gap-2">
												<CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
												<p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
													Plan achievable
												</p>
											</div>
											<div>
												<p className="text-3xl font-black tabular-nums text-slate-900 leading-none">
													{formatNumber(stats.requiredQty)}
												</p>
												<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
													Units to buy at market price
												</p>
											</div>
											<div className="border-t border-slate-100 pt-3 space-y-0">
												<StatRow
													label="Capital Needed"
													value={formatIDR(stats.requiredCapital)}
													valueClass="text-emerald-600"
												/>
												<StatRow
													label="Verified Avg After"
													value={formatIDR(stats.verifiedAvg)}
												/>
												<StatRow
													label="New Total Qty"
													value={formatNumber(stats.newTotalQty)}
												/>
												<StatRow
													label="New Total Invest"
													value={formatIDR(stats.newTotalInvest)}
												/>
											</div>
										</motion.div>
									) : (
										<motion.div
											key="not-possible"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="flex-1 flex items-start gap-3 text-slate-400"
										>
											<AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
											<p className="text-[10px] font-bold uppercase tracking-widest leading-loose">
												{stats.goalNote ||
													"Enter target average & market price to generate a plan."}
											</p>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						</div>

						{/* Scenario Analysis Chart */}
						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.14 }}
							className="p-6 sm:p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm"
						>
							<div className="flex items-center gap-3 mb-6">
								<div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
									<Layers className="w-4 h-4" />
								</div>
								<div>
									<h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
										Scenario Analysis
									</h2>
									<p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
										Unrealized P/L across price range
									</p>
								</div>
							</div>

							<ResponsiveContainer width="100%" height={200}>
								<BarChart
									data={stats.scenarioData}
									margin={{ top: 4, right: 0, left: 8, bottom: 4 }}
									barCategoryGap="20%"
								>
									<XAxis
										dataKey="price"
										tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }}
										axisLine={false}
										tickLine={false}
									/>
									<YAxis
										tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }}
										axisLine={false}
										tickLine={false}
										tickFormatter={(v: any) =>
											v >= 1_000_000
												? `${(v / 1_000_000).toFixed(1)}M`
												: v >= 1_000
													? `${(v / 1_000).toFixed(0)}K`
													: String(v)
										}
									/>
									<Tooltip content={<ScenarioTooltip />} />
									<ReferenceLine y={0} stroke="#e2e8f0" strokeWidth={1.5} />
									<Bar dataKey="pl" radius={[4, 4, 0, 0]}>
										{stats.scenarioData.map((entry) => (
											<Cell
												key={entry.price}
												fill={entry.pl >= 0 ? "#10b981" : "#f43f5e"}
											/>
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>

							<p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-3 text-center">
								Based on ±50% range from current average
							</p>
						</motion.div>
					</div>
				</div>
			</div>
		</main>
	);
}
