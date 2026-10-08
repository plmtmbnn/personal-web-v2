"use client";

import {
	Briefcase,
	CheckCircle2,
	XCircle,
	ShieldAlert,
	Target,
	Layers,
	Vault,
} from "lucide-react";
import type { MarketPlaybookScript } from "../data/playbooks";
import type { RegimeState, InvestmentCompassData } from "../types";
import { getSizingMandate } from "../lib/engine/sizing";
import { checkVolatilityExpansion } from "../lib/indicators";

const getStateBadge = (state: RegimeState) => {
	switch (state) {
		case "risk_on":
			return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
		case "selective":
			return "bg-amber-50 text-amber-700 border-amber-200/80";
		case "defensive":
			return "bg-rose-50 text-rose-700 border-rose-200/80";
		case "stress":
			return "bg-rose-100 text-rose-800 border-rose-300";
		default:
			return "bg-slate-50 text-slate-700 border-slate-200/80";
	}
};

export default function MarketPlaybook({
	playbooks,
	compassData,
	scores,
}: {
	playbooks: {
		ihsg: MarketPlaybookScript;
		crypto: MarketPlaybookScript;
	};
	compassData?: InvestmentCompassData;
	scores?: { ihsg: number; crypto: number };
}) {
	const renderScriptCard = (script: MarketPlaybookScript) => {
		const isIhsg = script.market === "IHSG";
		let tacticalAlert = null;

		if (isIhsg && compassData?.markets.ihsgFlows?.streakDays != null) {
			const streak = compassData.markets.ihsgFlows.streakDays;
			if (streak <= -3) {
				tacticalAlert = {
					color: "rose",
					message: `Caution: Sustained Institutional Distribution (${streak}D Outflow Streak)`,
					action:
						"Prioritize defensive sizing and tighten stop losses immediately.",
				};
			} else if (streak >= 3) {
				tacticalAlert = {
					color: "emerald",
					message: `Institutional Accumulation Confirmed (+${streak}D Inflow Streak)`,
					action: "Favor trend-following setups and ride momentum leaders.",
				};
			}
		}

		if (!isIhsg && compassData?.markets.cryptoOnChain?.mvrvZScore != null) {
			const mvrv = compassData.markets.cryptoOnChain.mvrvZScore;
			if (mvrv < 1.0) {
				tacticalAlert = {
					color: "emerald",
					message: `Generational Spot Accumulation Triggered (MVRV: ${mvrv.toFixed(2)})`,
					action: "Deploy spot tranches aggressively. Deep cycle value zone.",
				};
			} else if (mvrv > 3.7) {
				tacticalAlert = {
					color: "rose",
					message: `Historic Cycle Overheat (MVRV: ${mvrv.toFixed(2)})`,
					action: "De-risk heavy altcoin exposure. Move towards stablecoins.",
				};
			}
		}

		const currentScore = isIhsg ? scores?.ihsg : scores?.crypto;
		const sizingMandate =
			currentScore != null ? getSizingMandate(currentScore) : null;

		let volatilityAlert = null;
		const historySymbol = isIhsg ? "^JKSE" : "BTC-USD";
		const historySeries = compassData?.markets.history?.[historySymbol];
		if (historySeries && historySeries.points.length > 30) {
			const { isExpanded } = checkVolatilityExpansion(historySeries.points);
			if (isExpanded) {
				volatilityAlert = {
					message: "EXPANDED VOLATILITY DETECTED",
					action:
						"14-day volatility exceeds 1.5x baseline. Widen stop-losses and reduce position sizing to avoid chop.",
					color: "amber",
				};
			}
		}

		const isCircuitBreakerActive = sizingMandate?.isTradingLocked ?? false;

		return (
			<div
				key={script.market}
				className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-7 flex flex-col justify-between space-y-5"
			>
				<div className="space-y-4">
					{/* Header */}
					<div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
						<div className="min-w-0">
							<h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
								{script.market} Tactical Playbook
							</h3>
							<p className="text-xs text-slate-500 font-medium mt-0.5">
								{isIhsg ? "Indonesian Equities" : "Digital Assets"}
							</p>
						</div>

						<span
							className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border shrink-0 ${getStateBadge(
								script.state,
							)}`}
						>
							{script.state.replace("_", " ")}
						</span>
					</div>

					{/* Tactical Stance */}
					<div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2.5">
						<span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
							Tactical Stance
						</span>
						<span className="text-xs font-extrabold text-slate-900 text-right">
							{script.posture}
						</span>
					</div>

					{/* Sizing Mandate Strip */}
					{sizingMandate && (
						<div className="px-3.5 py-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between gap-2.5">
							<span className="text-[10px] font-black uppercase tracking-wider text-indigo-800/70 shrink-0 flex items-center gap-1.5">
								<Target className="w-3.5 h-3.5 text-indigo-500" />
								Sizing Target
							</span>
							<span className="text-xs font-extrabold text-indigo-950 text-right font-mono">
								Risk: {sizingMandate.maxRiskPerTradePct}% | Exp:{" "}
								{sizingMandate.maxPortfolioExposurePct}%
							</span>
						</div>
					)}

					{/* Headline description */}
					<p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
						{script.headline}
					</p>

					{/* Tactical Override Alert */}
					{tacticalAlert && (
						<div
							className={`p-3.5 rounded-xl border flex items-start gap-2.5 shadow-sm ${
								tacticalAlert.color === "rose"
									? "bg-rose-50/50 border-rose-200"
									: "bg-emerald-50/50 border-emerald-200"
							}`}
						>
							<ShieldAlert
								className={`w-4 h-4 shrink-0 mt-0.5 ${
									tacticalAlert.color === "rose"
										? "text-rose-600"
										: "text-emerald-600"
								}`}
							/>
							<div className="space-y-0.5">
								<span
									className={`text-[10px] sm:text-xs font-black uppercase tracking-wider block ${
										tacticalAlert.color === "rose"
											? "text-rose-800"
											: "text-emerald-800"
									}`}
								>
									{tacticalAlert.message}
								</span>
								<p
									className={`text-[10px] sm:text-xs font-semibold leading-relaxed ${
										tacticalAlert.color === "rose"
											? "text-rose-700/80"
											: "text-emerald-700/80"
									}`}
								>
									{tacticalAlert.action}
								</p>
							</div>
						</div>
					)}

					{/* Volatility Alert */}
					{volatilityAlert && !isCircuitBreakerActive && (
						<div className="p-3.5 rounded-xl border flex items-start gap-2.5 shadow-sm bg-amber-50/50 border-amber-200">
							<ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
							<div className="space-y-0.5">
								<span className="text-[10px] sm:text-xs font-black uppercase tracking-wider block text-amber-800">
									{volatilityAlert.message}
								</span>
								<p className="text-[10px] sm:text-xs font-semibold leading-relaxed text-amber-700/80">
									{volatilityAlert.action}
								</p>
							</div>
						</div>
					)}

					{/* Dos & Avoids Grid */}
					<div
						className={`grid ${sizingMandate?.isTradingLocked ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"} gap-3 pt-2`}
					>
						{sizingMandate?.isTradingLocked ? (
							<div className="p-4 rounded-2xl bg-rose-600 border border-rose-700 shadow-inner flex flex-col items-center justify-center text-center space-y-2">
								<ShieldAlert className="w-8 h-8 text-rose-100" />
								<div>
									<h4 className="text-sm font-black tracking-wide uppercase text-white">
										No Trade Zone
									</h4>
									<p className="text-xs font-semibold text-rose-200 mt-0.5">
										Circuit breaker active. All tactical trading locked.
									</p>
								</div>
							</div>
						) : (
							<div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 space-y-2">
								<span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
									<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
									Tactical Dos
								</span>
								<ul className="space-y-1.5">
									{script.dos.map((item, idx) => (
										<li
											key={idx}
											className="text-xs font-semibold text-slate-700 flex items-start gap-1.5 leading-snug"
										>
											<span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>
						)}

						<div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100/80 space-y-2">
							<span className="text-[10px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
								<XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
								Strict Avoids
							</span>
							<ul className="space-y-1.5">
								{script.avoids.map((item, idx) => (
									<li
										key={idx}
										className="text-xs font-semibold text-slate-700 flex items-start gap-1.5 leading-snug"
									>
										<span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 shrink-0" />
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Tranche Accumulation Plan (if in defensive or stress) */}
					{script.tranchePlan && (
						<div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-1.5">
							<span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
								<Layers className="w-3.5 h-3.5 text-indigo-600" />
								Predetermined Tranche Plan
							</span>
							<p className="text-xs font-semibold text-slate-800 leading-relaxed">
								{script.tranchePlan}
							</p>
						</div>
					)}

					{/* Sizing & Invalidation */}
					<div className="space-y-2 pt-2 border-t border-slate-100">
						<div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
							<Target className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
							<div>
								<span className="text-[10px] font-extrabold uppercase text-slate-400 block">
									Position Sizing Mandate
								</span>
								<span className="text-xs font-bold text-slate-800 leading-snug">
									{script.sizing}
								</span>
							</div>
						</div>

						<div className="flex items-start gap-2.5 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
							<ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
							<div>
								<span className="text-[10px] font-extrabold uppercase text-amber-700 block">
									Thesis Invalidation Trigger
								</span>
								<span className="text-xs font-bold text-amber-950 leading-snug">
									{script.invalidation}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Focus Sectors */}
				<div className="pt-3 border-t border-slate-100">
					<span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
						Priority Focus
					</span>
					<div className="flex flex-wrap gap-1.5">
						{script.focusSectors.map((sector, idx) => (
							<span
								key={idx}
								className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
							>
								{sector}
							</span>
						))}
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Playbook Header */}
			<div className="flex items-start sm:items-center gap-3">
				<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
					<Briefcase className="w-5 h-5" />
				</div>
				<div className="min-w-0 flex-1">
					<h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
						Execution Playbook
					</h2>
					<p className="text-xs text-slate-500 font-medium leading-relaxed">
						Actionable dos, avoids, sizing, and invalidation conditions
					</p>
				</div>
			</div>

			{/* IHSG & Crypto Playbook Cards */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
				{renderScriptCard(playbooks.ihsg)}
				{renderScriptCard(playbooks.crypto)}
			</div>

			{/* Safe Bucket Preservation Anchor Card */}
			<div className="bg-white rounded-[2rem] p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
							<Vault className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
								Safe Yield &amp; Preservation Anchor (40% Target)
							</h3>
							<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
								Retail SBN, Bank Deposits, Physical Gold
							</p>
						</div>
					</div>

					<span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-black tracking-wide shrink-0 self-start sm:self-auto">
						Risk-Free Baseline
					</span>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
					<div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
						<span className="text-[10px] font-black uppercase text-amber-800 block">
							Retail SBN (ORI / SBR / ST)
						</span>
						<p className="text-slate-600 font-medium leading-relaxed">
							Sovereign guarantee backing 6.0% - 6.75% coupon yield. Provides
							dependable monthly cash flow immune to equity drawdowns.
						</p>
					</div>

					<div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
						<span className="text-[10px] font-black uppercase text-amber-800 block">
							Liquid Bank Deposits (RDN)
						</span>
						<p className="text-slate-600 font-medium leading-relaxed">
							Instant liquidity dry powder. Ready to be deployed into planned
							tranches when blue-chips reach multi-year support.
						</p>
					</div>

					<div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
						<span className="text-[10px] font-black uppercase text-amber-800 block">
							Physical Gold (LM Antam)
						</span>
						<p className="text-slate-600 font-medium leading-relaxed">
							Hedge against Rupiah depreciation and long-term fiat monetary
							debasement. Rebalance when weight exceeds 15%.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
