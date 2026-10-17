"use client";

import { useState } from "react";
import {
	BookOpen,
	ShieldAlert,
	Scale,
	AlertOctagon,
	CheckSquare2,
	PieChart,
	TrendingUp,
	CheckCircle2,
	XCircle,
	RotateCcw,
	ShieldCheck,
} from "lucide-react";
import UtilHeader from "@/features/utils/components/UtilHeader";
import {
	RISK_RULES,
	CIRCUIT_BREAKERS,
	HARD_BANS,
	PRE_TRADE_CHECKLIST,
	RECOVERY_MATH_TABLE,
} from "@/features/investment/data/rulebook";

export default function RebuildRulebookView() {
	// ── Workstation 1: Capital Bucket Sizer State ───────────────────
	const [portfolioCapital, setPortfolioCapital] = useState<number>(100000000);
	const [monthlyExpenses, setMonthlyExpenses] = useState<number>(10000000);

	// Presets for quick portfolio scale
	const setCapitalPreset = (val: number) => setPortfolioCapital(val);

	// Calculated bucket allocations
	const emergencyReserve = monthlyExpenses * 6;
	const safeCapital = Math.round(portfolioCapital * 0.4);
	const coreCapital = Math.round(portfolioCapital * 0.45);
	const swingCapital = Math.round(portfolioCapital * 0.15);

	// Risk caps for swing trading (0.5% - 1.0% of swing bucket)
	const minRiskPerTrade = Math.round(swingCapital * 0.005);
	const maxRiskPerTrade = Math.round(swingCapital * 0.01);
	const maxSingleCoreStock = Math.round(coreCapital * 0.1);

	// ── Workstation 2: 5-Gate Pre-Trade Checklist State ─────────────
	const [completedGates, setCompletedGates] = useState<Record<string, boolean>>(
		{},
	);

	const toggleGate = (id: string) => {
		setCompletedGates((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const resetChecklist = () => setCompletedGates({});

	const checkedCount = PRE_TRADE_CHECKLIST.filter(
		(g) => completedGates[g.id],
	).length;
	const allGatesPassed = checkedCount === PRE_TRADE_CHECKLIST.length;

	// ── Workstation 3: Drawdown & Recovery Math State ───────────────
	const [lossPct, setLossPct] = useState<number>(20);
	const requiredGain =
		lossPct >= 100 ? 9999 : (1 / (1 - lossPct / 100) - 1) * 100;

	const getLossSeverity = (loss: number) => {
		if (loss <= 10) {
			return {
				label: "Normal Market Variance",
				color: "text-emerald-700 bg-emerald-50 border-emerald-200",
				desc: "Easily recovered with standard risk-reward swing setups.",
			};
		}
		if (loss <= 20) {
			return {
				label: "Standard Correction",
				color: "text-amber-700 bg-amber-50 border-amber-200",
				desc: "Requires patience and discipline. Stop-losses must be strictly respected.",
			};
		}
		if (loss <= 35) {
			return {
				label: "Severe Account Drawdown",
				color: "text-rose-700 bg-rose-50 border-rose-200",
				desc: "Circuit breakers mandatory. Cut trade frequency in half.",
			};
		}
		if (loss <= 50) {
			return {
				label: "Catastrophic Capital Impairment",
				color: "text-rose-900 bg-rose-100 border-rose-300",
				desc: "You now need a +100% gain just to return to even. Zero margin for error.",
			};
		}
		return {
			label: "Terminal Ruin Danger Zone",
			color: "text-rose-950 bg-rose-200 border-rose-400 font-black",
			desc: "Attempting to recover aggressively will guarantee total capital liquidation.",
		};
	};

	const severity = getLossSeverity(lossPct);

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			{/* Top Container */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 space-y-6 sm:space-y-8">
				{/* ── Util Header ────────────────────────────────────────────── */}
				<UtilHeader
					title="Disciplined Rebuild Rulebook"
					description="Interactive capital allocation sizer (40/45/15), 5-gate pre-trade verification checklist, and mechanical drawdown recovery calculator."
					category={{
						label: "Financial Intelligence",
						sublabel: "Risk Management Operating System",
						icon: ShieldCheck,
						color: "amber",
					}}
					icon={BookOpen}
					badges={
						<div className="flex items-center gap-2">
							<span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-md">
								Capital Preservation OS
							</span>
							<span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
								Zero Leverage • Spot Only
							</span>
						</div>
					}
				/>

				{/* ── WORKSTATION 1: Interactive Capital Bucket Sizer ────────── */}
				<section
					aria-label="Interactive Capital Bucket Sizer"
					className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6"
				>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
								<PieChart className="w-5 h-5 text-indigo-600" />
							</div>
							<div>
								<h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
									1. Interactive Capital Bucket Sizer
								</h2>
								<p className="text-xs text-slate-500 font-medium">
									40% Safe Yield • 45% Strategic Core • 15% Tactical Swing
								</p>
							</div>
						</div>
						<div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
							<span className="text-[10px] font-extrabold uppercase text-slate-400 mr-1">
								Presets:
							</span>
							{[100000000, 250000000, 500000000, 1000000000].map((preset) => (
								<button
									type="button"
									key={preset}
									onClick={() => setCapitalPreset(preset)}
									className={`px-2.5 py-1 text-[10px] font-black rounded-lg border transition-all ${
										portfolioCapital === preset
											? "bg-slate-900 text-white border-slate-900 shadow-2xs"
											: "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
									}`}
								>
									Rp{" "}
									{preset >= 1000000000
										? `${preset / 1e9}B`
										: `${preset / 1e6}M`}
								</button>
							))}
						</div>
					</div>

					{/* Inputs Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
							<label
								htmlFor="total-portfolio-capital"
								className="text-[10px] font-black uppercase text-slate-500 block"
							>
								Total Investable Capital (IDR)
							</label>
							<div className="relative">
								<span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
									Rp
								</span>
								<input
									id="total-portfolio-capital"
									type="number"
									step="10000000"
									min="1000000"
									value={portfolioCapital}
									onChange={(e) =>
										setPortfolioCapital(Number(e.target.value) || 0)
									}
									className="w-full bg-white border border-slate-200/90 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
								/>
							</div>
							<p className="text-[10px] font-semibold text-slate-500">
								Excludes your untouchable emergency reserve.
							</p>
						</div>

						<div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
							<label
								htmlFor="monthly-living-expenses"
								className="text-[10px] font-black uppercase text-slate-500 block"
							>
								Monthly Living Expenses (IDR)
							</label>
							<div className="relative">
								<span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
									Rp
								</span>
								<input
									id="monthly-living-expenses"
									type="number"
									step="1000000"
									min="1000000"
									value={monthlyExpenses}
									onChange={(e) =>
										setMonthlyExpenses(Number(e.target.value) || 0)
									}
									className="w-full bg-white border border-slate-200/90 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
								/>
							</div>
							<p className="text-[10px] font-semibold text-slate-500">
								Determines your mandatory 6-month survival baseline.
							</p>
						</div>
					</div>

					{/* 4-Bucket Allocation Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Emergency Bucket */}
						<div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between space-y-3">
							<div>
								<div className="flex items-center justify-between mb-1">
									<h3 className="text-xs font-black text-slate-900">
										Emergency Reserve
									</h3>
									<span className="text-[9px] font-black uppercase text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md">
										6-Month Cushion
									</span>
								</div>
								<div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
									Rp {emergencyReserve.toLocaleString("id-ID")}
								</div>
								<p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-2">
									Untouchable liquid bank savings. Never invested or traded.
								</p>
							</div>
							<div className="pt-2.5 border-t border-slate-200/60 text-[10px] font-semibold text-slate-500">
								Rule: Zero drawdowns allowed. Liquid instant access only.
							</div>
						</div>

						{/* Safe Yield Bucket */}
						<div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200/70 flex flex-col justify-between space-y-3">
							<div>
								<div className="flex items-center justify-between mb-1">
									<h3 className="text-xs font-black text-indigo-950">
										Safe Yield &amp; Preservation
									</h3>
									<span className="text-[10px] font-black text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md border border-indigo-200">
										40%
									</span>
								</div>
								<div className="text-lg sm:text-xl font-black text-indigo-950 font-mono">
									Rp {safeCapital.toLocaleString("id-ID")}
								</div>
								<p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-2">
									Retail SBN (ORI, SBR, ST), Term Deposits, and Physical Gold.
								</p>
							</div>
							<div className="pt-2.5 border-t border-indigo-200/60 text-[10px] font-semibold text-indigo-900">
								Role: Generates predictable real yield; reserves dry powder for
								capitulations.
							</div>
						</div>

						{/* Strategic Core Bucket */}
						<div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 flex flex-col justify-between space-y-3">
							<div>
								<div className="flex items-center justify-between mb-1">
									<h3 className="text-xs font-black text-emerald-950">
										Strategic Core Compounding
									</h3>
									<span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
										45%
									</span>
								</div>
								<div className="text-lg sm:text-xl font-black text-emerald-950 font-mono">
									Rp {coreCapital.toLocaleString("id-ID")}
								</div>
								<p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-2">
									Wide-moat blue-chips (BBCA, BMRI, ASII, ICBP) &amp; spot
									Bitcoin.
								</p>
							</div>
							<div className="pt-2.5 border-t border-emerald-200/60 text-[10px] font-semibold text-emerald-900">
								Single Stock Cap: Max Rp{" "}
								{maxSingleCoreStock.toLocaleString("id-ID")} (10%).
							</div>
						</div>

						{/* Tactical Swing Bucket */}
						<div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-200/70 flex flex-col justify-between space-y-3">
							<div>
								<div className="flex items-center justify-between mb-1">
									<h3 className="text-xs font-black text-amber-950">
										Tactical Swing Trading
									</h3>
									<span className="text-[10px] font-black text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
										15% Max
									</span>
								</div>
								<div className="text-lg sm:text-xl font-black text-amber-950 font-mono">
									Rp {swingCapital.toLocaleString("id-ID")}
								</div>
								<p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-2">
									High-focus momentum setups above 200D MA. Zero leverage.
								</p>
							</div>
							<div className="pt-2.5 border-t border-amber-200/60 text-[10px] font-semibold text-amber-900">
								Max Risk / Trade: Rp {minRiskPerTrade.toLocaleString("id-ID")} -
								Rp {maxRiskPerTrade.toLocaleString("id-ID")} (0.5% - 1.0%).
							</div>
						</div>
					</div>
				</section>

				{/* ── WORKSTATION 2: Interactive 5-Gate Pre-Trade Checklist ─── */}
				<section
					aria-label="Interactive 5-Gate Pre-Trade Checklist"
					className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6"
				>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
								<CheckSquare2 className="w-5 h-5 text-indigo-600" />
							</div>
							<div>
								<h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
									2. Pre-Trade Execution Checklist (5 Gates)
								</h2>
								<p className="text-xs text-slate-500 font-medium">
									Every single order must pass all 5 gates before clicking buy
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2 self-start sm:self-auto">
							<button
								type="button"
								onClick={resetChecklist}
								className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200/80 transition-colors shadow-2xs"
							>
								<RotateCcw className="w-3.5 h-3.5" />
								<span>Reset Gates</span>
							</button>

							<span
								className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border ${
									allGatesPassed
										? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
										: "bg-rose-50 text-rose-800 border-rose-300"
								}`}
							>
								{allGatesPassed ? (
									<>
										<CheckCircle2 className="w-4 h-4 text-emerald-600" />
										<span>5/5 Passed • Trade Authorized</span>
									</>
								) : (
									<>
										<XCircle className="w-4 h-4 text-rose-600" />
										<span>{checkedCount}/5 Passed • Trade Blocked</span>
									</>
								)}
							</span>
						</div>
					</div>

					{/* 5-Gate Checklist Cards */}
					<div className="space-y-3">
						{PRE_TRADE_CHECKLIST.map((gate, index) => {
							const isChecked = Boolean(completedGates[gate.id]);
							return (
								<button
									type="button"
									key={gate.id}
									onClick={() => toggleGate(gate.id)}
									className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
										isChecked
											? "bg-indigo-50/50 border-indigo-200/90 shadow-2xs"
											: "bg-slate-50/50 border-slate-200/70 hover:bg-slate-50"
									}`}
								>
									<div
										className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
											isChecked
												? "bg-indigo-600 text-white border-indigo-600"
												: "bg-white text-transparent border-slate-300"
										}`}
									>
										✓
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-0.5">
											<span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
												Gate {index + 1}: {gate.question}
											</span>
											<span
												className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md self-start sm:self-auto border ${
													isChecked
														? "bg-indigo-100 text-indigo-800 border-indigo-200"
														: "bg-slate-100 text-slate-500 border-slate-200"
												}`}
											>
												{isChecked ? "Verified" : "Pending"}
											</span>
										</div>
										<p className="text-xs font-semibold text-slate-500 leading-relaxed">
											Mandate: {gate.mandate}
										</p>
									</div>
								</button>
							);
						})}
					</div>

					<div
						className={`p-4 rounded-2xl border text-xs leading-relaxed transition-all ${
							allGatesPassed
								? "bg-emerald-50/70 border-emerald-200/90 text-emerald-950 font-semibold"
								: "bg-slate-50/80 border-slate-200/80 text-slate-600"
						}`}
					>
						{allGatesPassed ? (
							<div className="flex items-center gap-2 font-bold text-emerald-900">
								<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
								<span>
									All risk parameters verified. Position sizing adheres to max
									1% loss cap. Execute with defined stop-loss.
								</span>
							</div>
						) : (
							<span>
								Execution gate locked. If even a single gate fails (e.g. regime
								stress, ambiguous stop-loss, or emotional revenge state),
								standing aside in cash is your highest-alpha decision.
							</span>
						)}
					</div>
				</section>

				{/* ── WORKSTATION 3: Interactive Drawdown & Recovery Math ────── */}
				<section
					aria-label="Interactive Drawdown & Recovery Math"
					className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6"
				>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 flex items-center justify-center shrink-0 shadow-2xs">
								<TrendingUp className="w-5 h-5 text-rose-600" />
							</div>
							<div>
								<h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
									3. The Brutal Math of Drawdown Simulator
								</h2>
								<p className="text-xs text-slate-500 font-medium">
									Mathematical proof of why capital preservation is your only
									edge
								</p>
							</div>
						</div>

						<span
							className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border self-start sm:self-auto ${severity.color}`}
						>
							{severity.label}
						</span>
					</div>

					{/* Slider Control */}
					<div className="p-4 sm:p-6 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-4">
						<div className="flex items-center justify-between">
							<label
								htmlFor="drawdown-loss-slider"
								className="text-xs font-black uppercase tracking-wider text-slate-700"
							>
								Simulate Portfolio Loss Percentage:
							</label>
							<div className="flex items-baseline gap-1.5">
								<span className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
									-{lossPct}%
								</span>
								<span className="text-xs font-bold text-slate-400">
									drawdown
								</span>
							</div>
						</div>

						<input
							id="drawdown-loss-slider"
							type="range"
							min="5"
							max="90"
							step="1"
							value={lossPct}
							onChange={(e) => setLossPct(Number(e.target.value))}
							className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
						/>

						<div className="flex justify-between text-[10px] font-bold text-slate-400">
							<span>-5% (Minor)</span>
							<span>-20% (Bear)</span>
							<span>-50% (Severe)</span>
							<span>-80% (Catastrophic)</span>
							<span>-90% (Ruin)</span>
						</div>
					</div>

					{/* Output Metric Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 space-y-1">
							<span className="text-[10px] font-black uppercase text-indigo-900 block">
								Gain Required to Return to Even
							</span>
							<div className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono">
								+{requiredGain.toFixed(1)}%
							</div>
							<p className="text-xs text-slate-600 font-medium pt-1">
								{severity.desc}
							</p>
						</div>

						<div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1">
							<span className="text-[10px] font-black uppercase text-slate-500 block">
								Capital Remaining from Rp 100M Baseline
							</span>
							<div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
								Rp{" "}
								{Math.round(100000000 * (1 - lossPct / 100)).toLocaleString(
									"id-ID",
								)}
							</div>
							<p className="text-xs text-slate-500 font-medium pt-1">
								Loss amount: Rp{" "}
								{Math.round(100000000 * (lossPct / 100)).toLocaleString(
									"id-ID",
								)}
							</p>
						</div>
					</div>

					{/* Canonical Recovery Table */}
					<div className="space-y-3 pt-2">
						<h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
							Reference Recovery Matrix
						</h3>
						<div className="overflow-x-auto rounded-xl border border-slate-200/80">
							<table className="w-full text-left text-xs bg-white">
								<thead>
									<tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-black uppercase text-slate-500">
										<th className="py-2.5 px-4 w-24">Loss</th>
										<th className="py-2.5 px-4 w-32">Gain Required</th>
										<th className="py-2.5 px-4">
											Psychological &amp; Statistical Reality
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 font-semibold">
									{RECOVERY_MATH_TABLE.map((row, i) => (
										<tr
											key={i}
											className={
												row.loss === `-${lossPct}%`
													? "bg-indigo-50/70 font-black text-indigo-950"
													: row.loss === "-80%"
														? "bg-rose-50/60 text-rose-950 font-bold"
														: ""
											}
										>
											<td className="py-2.5 px-4 font-mono font-bold">
												{row.loss}
											</td>
											<td className="py-2.5 px-4 font-mono font-black text-indigo-600">
												{row.gainRequired}
											</td>
											<td className="py-2.5 px-4 text-xs text-slate-600 leading-snug">
												{row.difficulty}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</section>

				{/* ── SECTION 4: The Six Golden Rules of Trading Discipline ──── */}
				<section
					aria-label="The Six Golden Rules of Trading Discipline"
					className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6"
				>
					<div className="flex items-center gap-3 border-b border-slate-100 pb-4">
						<div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
							<Scale className="w-5 h-5 text-emerald-600" />
						</div>
						<div>
							<h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
								4. The Six Golden Rules of Trading Discipline
							</h2>
							<p className="text-xs text-slate-500 font-medium">
								Non-negotiable behavioral guardrails for surviving and
								compounding
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{RISK_RULES.map((rule) => (
							<div
								key={rule.id}
								className="p-5 rounded-2xl bg-slate-50/50 border border-slate-200/80 flex flex-col justify-between space-y-3"
							>
								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-black">
											{rule.number}
										</span>
										<span className="text-[9px] font-extrabold uppercase text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
											{rule.tag}
										</span>
									</div>
									<h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight pt-1">
										{rule.title}
									</h3>
									<span className="text-[11px] font-extrabold text-indigo-600 block">
										{rule.subtitle}
									</span>
									<p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
										{rule.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* ── SECTION 5: Mechanical Drawdown Circuit Breakers & Bans ─── */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
					{/* Circuit Breakers */}
					<section
						aria-label="Mechanical Drawdown Circuit Breakers"
						className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4 flex flex-col justify-between"
					>
						<div>
							<div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
								<AlertOctagon className="w-4 h-4 text-rose-600" />
								<h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
									5. Mechanical Drawdown Circuit Breakers
								</h2>
							</div>

							<p className="text-xs text-slate-500 font-medium leading-relaxed my-3">
								Automatic defensive downshifts. Remove emotional revenge trading
								from loss mitigation.
							</p>

							<div className="space-y-3">
								{CIRCUIT_BREAKERS.map((cb, idx) => (
									<div
										key={idx}
										className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/40 border border-rose-200/70 space-y-2 transition-colors"
									>
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
											<div className="flex items-center gap-2">
												<span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
												<h3 className="text-xs sm:text-sm font-black text-rose-950 tracking-tight">
													{cb.drawdown}
												</h3>
											</div>
											<span className="inline-flex items-center self-start sm:self-auto text-[10px] font-black text-rose-800 bg-rose-100/90 px-2.5 py-0.5 rounded-md border border-rose-200/80 shrink-0">
												{cb.action}
											</span>
										</div>
										<p className="text-xs text-slate-700 font-medium leading-relaxed pt-1.5 border-t border-rose-100/80">
											{cb.protocol}
										</p>
									</div>
								))}
							</div>
						</div>
					</section>

					{/* Hard Bans While Rebuilding */}
					<section
						aria-label="Non-Negotiable Hard Bans"
						className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4 flex flex-col justify-between"
					>
						<div>
							<div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
								<ShieldAlert className="w-4 h-4 text-rose-600" />
								<h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
									6. Non-Negotiable Hard Bans
								</h2>
							</div>

							<p className="text-xs text-slate-500 font-medium leading-relaxed my-3">
								Violating these rules invalidates your trading license. Zero
								tolerance during the rebuild.
							</p>

							<ul className="space-y-2.5">
								{HARD_BANS.map((ban, idx) => (
									<li
										key={idx}
										className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-800 p-3 sm:p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 leading-relaxed"
									>
										<div className="w-5 h-5 rounded-md bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
											✕
										</div>
										<span className="flex-1 min-w-0 pt-0.5">{ban}</span>
									</li>
								))}
							</ul>
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}
