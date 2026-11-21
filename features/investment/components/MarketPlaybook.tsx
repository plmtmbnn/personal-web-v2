"use client";

import {
	CheckCircle2,
	XCircle,
	ShieldAlert,
	Target,
	Layers,
	ArrowUpRight,
} from "lucide-react";
import type { MarketPlaybookScript } from "../data/playbooks";
import type { RegimeState, InvestmentCompassData } from "../types";
import { getSizingMandate } from "../lib/engine/sizing";
import { checkVolatilityExpansion } from "../lib/indicators";

import Link from "next/link";
import { DEFAULT_THRESHOLDS } from "../config/thresholds";

const getStateBadge = (state: RegimeState) => {
	switch (state) {
		case "risk_on":
			return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
		case "selective":
			return "bg-amber-50 text-amber-800 border-amber-200/80";
		case "defensive":
			return "bg-rose-50 text-rose-800 border-rose-200/80";
		case "stress":
			return "bg-rose-100 text-rose-900 border-rose-300";
		default:
			return "bg-slate-100 text-slate-800 border-slate-200";
	}
};

export default function MarketPlaybook({
	playbooks,
	compassData,
	scores: _scores,
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

		const mvrvVal =
			compassData?.markets.cryptoOnChain?.mvrvRatio ??
			compassData?.markets.cryptoOnChain?.mvrvZScore;
		if (!isIhsg && mvrvVal != null) {
			const mvrv = mvrvVal;
			if (mvrv <= DEFAULT_THRESHOLDS.crypto.mvrv.accumulation) {
				tacticalAlert = {
					color: "emerald",
					message: `Generational Spot Accumulation Triggered (MVRV: ${mvrv.toFixed(2)})`,
					action: "Deploy spot tranches aggressively. Deep cycle value zone.",
				};
			} else if (mvrv >= DEFAULT_THRESHOLDS.crypto.mvrv.overheat) {
				tacticalAlert = {
					color: "rose",
					message: `Historic Cycle Overheat (MVRV: ${mvrv.toFixed(2)})`,
					action: "De-risk heavy altcoin exposure. Move towards stablecoins.",
				};
			}
		}

		const sizingMandate = getSizingMandate(script.state);

		let volatilityAlert = null;
		const historySymbol = isIhsg ? "^JKSE" : "BTC-USD";
		const historySeries = compassData?.markets.history?.[historySymbol];
		if (historySeries && historySeries.points.length > 30) {
			const { isExpanded } = checkVolatilityExpansion(historySeries.points);
			if (isExpanded) {
				volatilityAlert = {
					message: "Expanded volatility detected",
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
				className="@container min-w-0 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 flex flex-col justify-between space-y-5"
			>
				<div className="space-y-4">
					{/* Header */}
					<div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
						<div className="min-w-0">
							<h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
								{script.market} plan
							</h3>
							<p className="text-xs text-slate-500 font-medium mt-0.5">
								{isIhsg ? "Indonesian Equities" : "Digital Assets"}
							</p>
						</div>

						<span
							className={`px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0 ${getStateBadge(
								script.state,
							)}`}
						>
							{script.state.replace("_", " ")}
						</span>
					</div>

					{/* Trading stance */}
					<div className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col @[24rem]:flex-row @[24rem]:items-center justify-between gap-2.5">
						<span className="text-xs font-bold text-slate-500 shrink-0">
							Trading stance
						</span>
						<span className="text-xs font-bold text-slate-900 @[24rem]:text-right">
							{script.posture}
						</span>
					</div>

					{/* Headline description */}
					<p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
						{script.headline}
					</p>

					{script.liveSummary && (
						<div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
							<p className="text-xs font-bold text-slate-700 leading-relaxed">
								{script.liveSummary}
							</p>
						</div>
					)}

					{script.keyLevels && script.keyLevels.length > 0 && (
						<div className="grid grid-cols-2 @[32rem]:grid-cols-4 gap-2">
							{script.keyLevels.map((lvl) => {
								const toneClasses =
									lvl.tone === "positive"
										? "bg-emerald-50/60 border-emerald-200/80 text-emerald-900"
										: lvl.tone === "caution"
											? "bg-amber-50/60 border-amber-200/80 text-amber-900"
											: lvl.tone === "negative"
												? "bg-rose-50/60 border-rose-200/80 text-rose-900"
												: "bg-slate-50 border-slate-200/80 text-slate-900";
								return (
									<div
										key={lvl.label}
										className={`min-w-0 p-3 rounded-xl border ${toneClasses}`}
									>
										<span className="text-xs font-bold block break-words">
											{lvl.label}
										</span>
										<span className="text-xs font-bold tabular-nums mt-0.5 block break-words">
											{lvl.value}
										</span>
									</div>
								);
							})}
						</div>
					)}

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
										? "text-rose-700"
										: "text-emerald-700"
								}`}
							/>
							<div className="space-y-0.5">
								<span
									className={`text-xs font-bold block ${
										tacticalAlert.color === "rose"
											? "text-rose-800"
											: "text-emerald-800"
									}`}
								>
									{tacticalAlert.message}
								</span>
								<p
									className={`text-xs font-semibold leading-relaxed ${
										tacticalAlert.color === "rose"
											? "text-rose-700"
											: "text-emerald-700"
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
							<ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-800" />
							<div className="space-y-0.5">
								<span className="text-xs font-bold block text-amber-800">
									{volatilityAlert.message}
								</span>
								<p className="text-xs font-semibold leading-relaxed text-amber-700">
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
							<div className="p-4 rounded-2xl bg-white border-2 border-rose-200/90 shadow-2xs flex flex-col items-center justify-center text-center space-y-2">
								<div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 shadow-2xs">
									<ShieldAlert className="w-5 h-5" />
								</div>
								<div>
									<h4 className="text-sm font-bold text-rose-950">
										Trading paused
									</h4>
									<p className="text-xs font-semibold text-rose-700 mt-0.5">
										Circuit breaker active. All tactical trading locked.
									</p>
								</div>
							</div>
						) : (
							<div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 border-l-4 border-l-emerald-500 space-y-2">
								<span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
									<CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
									Actions
								</span>
								<ul className="space-y-1.5 text-xs font-medium text-slate-700 leading-relaxed">
									{script.dos.map((item, idx) => (
										<li key={idx} className="leading-snug">
											{item}
										</li>
									))}
								</ul>
							</div>
						)}

						<div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 border-l-4 border-l-rose-500 space-y-2">
							<span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
								<XCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
								Avoid
							</span>
							<ul className="space-y-1.5 text-xs font-medium text-slate-700 leading-relaxed">
								{script.avoids.map((item, idx) => (
									<li key={idx} className="leading-snug">
										{item}
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Tranche Accumulation Plan (if in defensive or stress) */}
					{script.tranchePlan && (
						<div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
							<span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
								<Layers className="w-3.5 h-3.5 text-indigo-700" />
								Tranche plan
							</span>
							<p className="text-xs font-medium text-slate-700 leading-relaxed">
								{script.tranchePlan}
							</p>
						</div>
					)}

					{/* Unified Sizing & Invalidation */}
					<div className="space-y-2.5 pt-2 border-t border-slate-100">
						<div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70 space-y-2">
							<div className="flex flex-col @[28rem]:flex-row @[28rem]:items-center justify-between gap-2">
								<div className="flex flex-wrap items-center gap-2 min-w-0">
									<Target className="w-4 h-4 text-indigo-600 shrink-0" />
									<span className="text-xs font-bold text-slate-800">
										Position size
									</span>
									{sizingMandate && (
										<span className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-indigo-900 tabular-nums">
											Risk {sizingMandate.maxRiskPerTradePct}% | Exp{" "}
											{sizingMandate.maxPortfolioExposurePct}%
										</span>
									)}
								</div>
								{sizingMandate && (
									<Link
										href={`/utils/stock-crypto-calculator?risk=${sizingMandate.maxRiskPerTradePct}`}
										className="inline-flex min-h-11 items-center text-xs font-bold text-indigo-700 hover:text-indigo-900 underline underline-offset-2 shrink-0 self-start @[28rem]:self-auto cursor-pointer"
									>
										Position calculator
									</Link>
								)}
							</div>
							<p className="text-xs font-medium text-slate-700 leading-relaxed">
								{script.sizing}
							</p>
						</div>

						<div className="flex items-start gap-2.5 bg-white p-3.5 rounded-2xl border border-amber-200/80 border-l-4 border-l-amber-500">
							<ShieldAlert className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
							<div>
								<span className="text-xs font-bold text-amber-800 block">
									Reassess when
								</span>
								<span className="text-xs font-semibold text-slate-800 leading-snug">
									{script.invalidation}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Focus Sectors */}
				<div className="pt-3 border-t border-slate-100">
					<span className="text-xs font-bold text-slate-500 block mb-1.5">
						Focus
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
		<div className="space-y-4">
			{/* Playbook Header */}
			<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
				<div>
					<h2 className="text-xl font-bold text-slate-900 tracking-tight">
						Trade plans
					</h2>
					<p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
						Actions, position size and conditions to reassess.
					</p>
				</div>
				<Link
					href="/utils/rebuild-rulebook"
					className="inline-flex min-h-11 items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 text-xs font-semibold shadow-2xs transition-colors shrink-0 self-start sm:self-auto group !no-underline"
				>
					<span>Open Rulebook</span>
					<ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
				</Link>
			</div>

			{/* IHSG & Crypto Playbook Cards */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
				{renderScriptCard(playbooks.ihsg)}
				{renderScriptCard(playbooks.crypto)}
			</div>
		</div>
	);
}
