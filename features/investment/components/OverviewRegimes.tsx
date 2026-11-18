"use client";

import { useState } from "react";
import {
	type LucideIcon,
	TrendingUp,
	TrendingDown,
	Info,
	Globe,
	Coins,
	Building,
} from "lucide-react";
import type { CompassBridgeSummary } from "@/features/utils/stock-tools/stock-explorer/types";
import type {
	InvestmentCompassData,
	MarketRegimeScore,
	RegimeFactor,
} from "../types";

export default function OverviewRegimes({
	globalRegime,
	ihsgRegime,
	cryptoRegime,
	ihsgPosture,
	previous,
	linkedSnapshot,
}: {
	globalRegime: MarketRegimeScore;
	ihsgRegime: MarketRegimeScore;
	cryptoRegime: MarketRegimeScore;
	ihsgPosture?: CompassBridgeSummary | null;
	previous?: InvestmentCompassData["previousSnapshot"];
	linkedSnapshot?: string | null;
}) {
	const [activeFactor, setActiveFactor] = useState<RegimeFactor | null>(null);

	const getStateBadge = (state: string) => {
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

	const getScoreBarColor = (score: number) => {
		if (score >= 65) return "bg-emerald-500";
		if (score >= 45) return "bg-amber-500";
		if (score >= 30) return "bg-rose-500";
		return "bg-rose-600";
	};

	const renderRegimeCard = (
		regime: MarketRegimeScore,
		Icon: LucideIcon,
		accentBorder: string,
	) => {
		const scoreChange = previous ? regime.score - previous.score : 0;
		return (
			<div
				key={regime.id}
				className={`h-full bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-7 flex flex-col ${accentBorder}`}
			>
				<div>
					{/* Header */}
					<div className="flex items-start justify-between gap-3 mb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
								<Icon className="w-5 h-5 text-slate-700" />
							</div>
							<div>
								<h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
									{regime.id === "ihsg" ? "IHSG" : "Crypto"}
								</h3>
								<p className="text-xs font-bold text-slate-500">
									{regime.marketName}
								</p>
							</div>
						</div>

						<span
							className={`px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0 ${getStateBadge(regime.state)}`}
						>
							{regime.state.replace("_", " ")}
						</span>
					</div>

					{/* Score Gauge Bar */}
					<div className="space-y-3 mb-4 py-2">
						<div className="flex items-center justify-between text-xs">
							<span className="font-bold text-slate-600 text-xs">
								Regime score
							</span>
							<div className="flex items-baseline gap-1">
								<span className="text-2xl sm:text-3xl font-bold tabular-nums text-slate-900">
									{regime.score}
								</span>
								<span className="text-xs font-bold text-slate-500">/ 100</span>
							</div>
						</div>
						<div className="h-2.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
							<div
								className={`h-full origin-left ${getScoreBarColor(regime.score)}`}
								style={{
									transform: `scaleX(${Math.min(100, Math.max(0, regime.score)) / 100})`,
								}}
							/>
						</div>
						<div className="grid grid-cols-2 gap-x-3 gap-y-1 min-[400px]:flex min-[400px]:justify-between text-xs font-semibold text-slate-500 pt-0.5">
							<span>Stress (0)</span>
							<span>Defensive (30)</span>
							<span>Selective (45)</span>
							<span>Risk-On (65+)</span>
						</div>
					</div>

					{/* Dual-Axis Trend vs Valuation Separation */}
					<p className="mb-3 text-xs text-slate-600">
						Evidence coverage: {Math.round(regime.coverage * 100)}%. This score
						is a regime indicator, not a return forecast.
					</p>
					{!!regime.missingFactors?.length && (
						<details className="mb-4 text-xs text-slate-700">
							<summary className="min-h-11 cursor-pointer py-3 font-medium focus-visible:outline-2">
								Missing evidence ({regime.missingFactors.length})
							</summary>
							<ul className="list-disc space-y-1 pl-4">
								{regime.missingFactors.map((factor) => (
									<li key={factor}>{factor.replaceAll("_", " ")}</li>
								))}
							</ul>
						</details>
					)}
					{regime.dualAxis && (
						<div className="mb-4 grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 border-y border-slate-100 py-3">
							<div className="space-y-0.5">
								<span className="text-xs font-bold text-slate-500 block">
									Trading trend
								</span>
								<div className="flex items-center gap-1.5">
									<span
										className={`text-xs font-bold px-1.5 py-0.5 rounded border ${getStateBadge(
											regime.dualAxis.trendState,
										)}`}
									>
										{regime.dualAxis.trendState.replace("_", " ")}
									</span>
									<span className="text-xs font-bold text-slate-500 tabular-nums">
										{regime.dualAxis.trendScore}
									</span>
								</div>
							</div>
							<div className="space-y-0.5">
								<span className="text-xs font-bold text-slate-500 block">
									Valuation
								</span>
								<div className="flex items-center gap-1.5">
									<span
										className={`text-xs font-bold px-1.5 py-0.5 rounded border ${
											regime.dualAxis.valuationState === "accumulation"
												? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
												: regime.dualAxis.valuationState === "distribution"
													? "bg-rose-50 text-rose-800 border-rose-200/80"
													: "bg-slate-100 text-slate-800 border-slate-200"
										}`}
									>
										{regime.dualAxis.valuationState}
									</span>
									<span className="text-xs font-bold text-slate-500 tabular-nums">
										{regime.dualAxis.valuationScore}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Diagnosis Narrative */}
					<div className="space-y-1 mb-5">
						<h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
							{regime.headline}
						</h4>
						<p className="text-xs font-medium text-slate-500 leading-relaxed">
							{regime.diagnosis}
						</p>
					</div>

					{regime.id === "ihsg" && ihsgPosture && (
						<>
							<details className="mb-4 space-y-1 border-b border-slate-200 pb-3 text-sm text-slate-700">
								<summary className="min-h-11 cursor-pointer py-3 font-semibold text-slate-900 focus-visible:outline-2">
									Trading posture:{" "}
									{ihsgPosture.effectiveState.replace("_", " ")}
								</summary>
								<p>{ihsgPosture.permissions?.swing.reason}</p>
								{ihsgPosture.session && (
									<p className="text-xs text-slate-500">
										IDX session {ihsgPosture.session}
									</p>
								)}
								{previous && (
									<p>
										Previous snapshot {previous.asOf.slice(0, 10)}:{" "}
										{previous.regime.replace("_", " ")}, {previous.score}/100.{" "}
										Score change {scoreChange > 0 ? "+" : ""}
										{scoreChange}.
									</p>
								)}
							</details>
							{linkedSnapshot && linkedSnapshot !== ihsgPosture.snapshotId && (
								<p className="text-amber-800">
									Explorer used a different snapshot. This view was computed{" "}
									{new Date(ihsgPosture.computedAt ?? "").toLocaleString(
										"en-GB",
										{ timeZone: "Asia/Jakarta" },
									)}{" "}
									WIB.
								</p>
							)}
						</>
					)}

					{/* Asymmetry Zone Callout Banner */}
					{regime.asymmetryZone && (
						<div
							className={`mb-4 p-3.5 sm:p-4 rounded-2xl border transition-colors ${
								regime.asymmetryZone.type === "accumulation"
									? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950"
									: "bg-rose-500/10 border-rose-500/30 text-rose-950"
							}`}
						>
							<div className="flex items-center gap-2 mb-1">
								<span
									className={`text-xs font-bold ${
										regime.asymmetryZone.type === "accumulation"
											? "text-emerald-800"
											: "text-rose-800"
									}`}
								>
									{regime.asymmetryZone.type === "accumulation"
										? "Accumulation zone"
										: "Distribution risk"}
								</span>
							</div>
							<p className="text-xs font-medium leading-relaxed opacity-90 pl-4">
								{regime.asymmetryZone.description}
							</p>
						</div>
					)}

					{/* Contributing Factors Pills */}
					<details className="group space-y-3 pt-1 border-t border-slate-100">
						<summary className="flex min-h-11 cursor-pointer items-center justify-between text-sm font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">
							<span>View signals ({regime.factors.length})</span>
							<span aria-hidden="true" className="text-lg group-open:rotate-45">
								+
							</span>
						</summary>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							{regime.factors.map((factor) => {
								const isBull = factor.direction === "bullish";
								const isBear = factor.direction === "bearish";
								const isSelected = activeFactor?.key === factor.key;

								return (
									<button
										key={factor.key}
										type="button"
										onClick={() => setActiveFactor(isSelected ? null : factor)}
										aria-expanded={isSelected}
										aria-controls={`factor-detail-${regime.id}`}
										className={`p-2.5 sm:p-3 rounded-xl border text-left transition-colors cursor-pointer active:scale-95 touch-manipulation ${
											isSelected
												? "ring-2 ring-slate-900 border-transparent shadow-xs"
												: ""
										} ${
											isBull
												? "bg-emerald-50/40 border-emerald-100/80 hover:bg-emerald-50"
												: isBear
													? "bg-rose-50/40 border-rose-100/80 hover:bg-rose-50"
													: "bg-slate-50 border-slate-100 hover:bg-slate-100/60"
										}`}
									>
										<div className="flex items-center justify-between gap-1 mb-0.5">
											<span className="text-xs font-bold text-slate-800 truncate">
												{factor.label}
											</span>
											{isBull ? (
												<TrendingUp className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
											) : isBear ? (
												<TrendingDown className="w-3.5 h-3.5 text-rose-700 shrink-0" />
											) : (
												<Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
											)}
										</div>
										<div className="flex items-baseline justify-between gap-1">
											<span className="text-xs font-bold text-slate-900 truncate">
												{factor.valueStr}
											</span>
											<span className="text-xs font-bold text-slate-500 shrink-0">
												Score {factor.score} ({factor.weight}%)
											</span>
										</div>
									</button>
								);
							})}
						</div>

						{/* Inline Factor Detail Card */}
						{activeFactor &&
							regime.factors.some((f) => f.key === activeFactor.key) && (
								<section
									id={`factor-detail-${regime.id}`}
									aria-label="Factor breakdown detail"
									className="mt-3 bg-white text-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs border border-slate-200/90 space-y-1.5 motion-safe:animate-in fade-in slide-in-from-top-2 duration-200"
								>
									<div className="flex items-center justify-between gap-2">
										<div className="flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:items-center">
											<span className="text-xs font-bold text-indigo-700 break-words">
												{activeFactor.label}
											</span>
											<span className="text-xs font-bold text-slate-500 break-words">
												{activeFactor.valueStr} (Score: {activeFactor.score}
												/100 | Weight: {activeFactor.weight}%)
											</span>
										</div>
										<button
											type="button"
											onClick={() => setActiveFactor(null)}
											className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2 py-0.5 bg-slate-100 hover:bg-slate-200/80 rounded-md cursor-pointer shrink-0"
										>
											Close
										</button>
									</div>
									<p className="text-xs text-slate-600 font-medium leading-relaxed">
										{activeFactor.note}
									</p>
								</section>
							)}
					</details>
				</div>

				{/* Context Flags */}
				{regime.contextFlags.length > 0 && (
					<div className="flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-slate-100">
						{regime.contextFlags.map((flag, idx) => (
							<span key={idx} className="text-slate-600 text-xs font-medium">
								{flag}
							</span>
						))}
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-bold text-slate-900">Market conditions</h2>
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
				{/* 1. IHSG Regime Card (Span 6) */}
				<div className="lg:col-span-6">
					{renderRegimeCard(
						ihsgRegime,
						Building,
						"hover:border-slate-300 transition-colors",
					)}
				</div>

				{/* 2. Crypto Regime Card (Span 6) */}
				<div className="lg:col-span-6">
					{renderRegimeCard(
						cryptoRegime,
						Coins,
						"hover:border-slate-300 transition-colors",
					)}
				</div>

				{/* 3. Global Liquidity Macro Context Strip (Span 12) */}
				<div className="lg:col-span-12">
					<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-6">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
									<Globe className="w-4 h-4" />
								</div>
								<div>
									<h3 className="text-base font-bold text-slate-900">
										Global conditions
									</h3>
									<p className="text-xs font-semibold text-slate-500">
										Dollar strength, interest rates and credit risk
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<span
									className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getStateBadge(globalRegime.state)}`}
								>
									{globalRegime.state.replace("_", " ")}
								</span>
								<div className="flex items-baseline gap-1 text-xs font-bold text-slate-800 px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg">
									<span>{globalRegime.score}</span>
									<span className="text-xs text-slate-500 font-bold">/100</span>
								</div>
							</div>
						</div>

						<p className="text-xs font-medium text-slate-600 leading-relaxed pt-3">
							{globalRegime.headline}: {globalRegime.diagnosis}
						</p>
						<p className="mt-2 text-xs text-slate-600">
							Evidence coverage: {Math.round(globalRegime.coverage * 100)}%
						</p>
						{!!globalRegime.missingFactors?.length && (
							<details className="mt-2 text-xs text-slate-700">
								<summary className="cursor-pointer py-3 font-medium focus-visible:outline-2">
									Missing evidence ({globalRegime.missingFactors.length})
								</summary>
								<ul className="list-disc space-y-1 pl-4">
									{globalRegime.missingFactors.map((factor) => (
										<li key={factor}>{factor.replaceAll("_", " ")}</li>
									))}
								</ul>
							</details>
						)}

						<div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
							{globalRegime.factors.map((f) => {
								const isSelected = activeFactor?.key === f.key;
								return (
									<button
										key={f.key}
										type="button"
										onClick={() => setActiveFactor(isSelected ? null : f)}
										aria-expanded={isSelected}
										aria-controls={`factor-detail-${globalRegime.id}`}
										className={`px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer active:scale-95 touch-manipulation ${
											isSelected
												? "bg-slate-900 text-white shadow-2xs"
												: "bg-slate-50 border border-slate-200/60 text-slate-700 hover:bg-slate-100"
										}`}
									>
										{f.label
											.replace("US High-Yield OAS Spread", "High-yield spread")
											.replace("US M2 Money Supply (YoY)", "M2 growth (YoY)")}
										:{" "}
										<strong
											className={
												isSelected ? "text-amber-300" : "text-slate-900"
											}
										>
											{f.valueStr}
										</strong>
									</button>
								);
							})}
						</div>

						{/* Inline Factor Detail for Global Macro */}
						{activeFactor &&
							globalRegime.factors.some((f) => f.key === activeFactor.key) && (
								<section
									id={`factor-detail-${globalRegime.id}`}
									aria-label="Factor breakdown detail"
									className="mt-3 bg-white text-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs border border-slate-200/90 space-y-1.5 motion-safe:animate-in fade-in slide-in-from-top-2 duration-200"
								>
									<div className="flex items-center justify-between gap-2">
										<div className="flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:items-center">
											<span className="text-xs font-bold text-indigo-700 break-words">
												{activeFactor.label}
											</span>
											<span className="text-xs font-bold text-slate-500 break-words">
												{activeFactor.valueStr} (Score: {activeFactor.score}
												/100 | Weight: {activeFactor.weight}%)
											</span>
										</div>
										<button
											type="button"
											onClick={() => setActiveFactor(null)}
											className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2 py-0.5 bg-slate-100 hover:bg-slate-200/80 rounded-md cursor-pointer shrink-0"
										>
											Close
										</button>
									</div>
									<p className="text-xs text-slate-600 font-medium leading-relaxed">
										{activeFactor.note}
									</p>
								</section>
							)}
					</div>
				</div>
			</div>
		</div>
	);
}
