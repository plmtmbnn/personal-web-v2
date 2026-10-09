"use client";

import { useState } from "react";
import {
	type Activity,
	TrendingUp,
	TrendingDown,
	Info,
	Globe,
	Coins,
	Building,
} from "lucide-react";
import type { MarketRegimeScore, RegimeFactor } from "../types";

export default function OverviewRegimes({
	globalRegime,
	ihsgRegime,
	cryptoRegime,
}: {
	globalRegime: MarketRegimeScore;
	ihsgRegime: MarketRegimeScore;
	cryptoRegime: MarketRegimeScore;
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
		Icon: typeof Activity,
		accentBorder: string,
	) => {
		return (
			<div
				key={regime.id}
				className={`bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-7 flex flex-col justify-between ${accentBorder}`}
			>
				<div>
					{/* Header */}
					<div className="flex items-start justify-between gap-3 mb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
								<Icon className="w-5 h-5 text-slate-700" />
							</div>
							<div>
								<h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
									{regime.title}
								</h3>
								<p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
									{regime.marketName}
								</p>
							</div>
						</div>

						<span
							className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border shrink-0 ${getStateBadge(regime.state)}`}
						>
							{regime.state.replace("_", " ")}
						</span>
					</div>

					{/* Asymmetry Zone Callout Banner */}
					{regime.asymmetryZone && (
						<div
							className={`mb-4 p-3.5 sm:p-4 rounded-2xl border transition-all ${
								regime.asymmetryZone.type === "accumulation"
									? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950"
									: "bg-rose-500/10 border-rose-500/30 text-rose-950"
							}`}
						>
							<div className="flex items-center gap-2 mb-1">
								<span className="relative flex h-2 w-2">
									<span
										className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
											regime.asymmetryZone.type === "accumulation"
												? "bg-emerald-500"
												: "bg-rose-500"
										}`}
									/>
									<span
										className={`relative inline-flex rounded-full h-2 w-2 ${
											regime.asymmetryZone.type === "accumulation"
												? "bg-emerald-600"
												: "bg-rose-600"
										}`}
									/>
								</span>
								<span
									className={`text-xs font-black uppercase tracking-wider ${
										regime.asymmetryZone.type === "accumulation"
											? "text-emerald-800"
											: "text-rose-800"
									}`}
								>
									{regime.asymmetryZone.title}
								</span>
							</div>
							<p className="text-[11px] sm:text-xs font-medium leading-relaxed opacity-90 pl-4">
								{regime.asymmetryZone.description}
							</p>
						</div>
					)}

					{/* Score Gauge Bar */}
					<div className="space-y-1.5 mb-4 bg-slate-50/60 p-3 sm:p-3.5 rounded-2xl border border-slate-100">
						<div className="flex items-center justify-between text-xs">
							<span className="font-extrabold text-slate-600 uppercase text-[10px] tracking-wider">
								Regime Health Score
							</span>
							<div className="flex items-baseline gap-1">
								<span className="text-base sm:text-lg font-black text-slate-900">
									{regime.score}
								</span>
								<span className="text-[10px] font-bold text-slate-400">
									/ 100
								</span>
							</div>
						</div>
						<div className="h-2.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
							<div
								className={`h-full transition-all duration-700 ${getScoreBarColor(regime.score)}`}
								style={{
									width: `${Math.min(100, Math.max(5, regime.score))}%`,
								}}
							/>
						</div>
						<div className="flex justify-between items-center text-[9px] font-semibold text-slate-400 pt-0.5">
							<span>Stress (0)</span>
							<span>Defensive (30)</span>
							<span>Selective (45)</span>
							<span>Risk-On (65+)</span>
						</div>
					</div>

					{/* Diagnosis Narrative */}
					<div className="space-y-1 mb-5">
						<h4 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug">
							{regime.headline}
						</h4>
						<p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-relaxed">
							{regime.diagnosis}
						</p>
					</div>

					{/* Contributing Factors Pills */}
					<div className="space-y-2 pt-3 border-t border-slate-100">
						<div className="flex items-center justify-between">
							<span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
								Contributing Signals ({regime.factors.length})
							</span>
							<span className="text-[9px] font-bold text-slate-400">
								Coverage: {Math.round(regime.coverage * 100)}%
							</span>
						</div>

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
										className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-95 touch-manipulation ${
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
											<span className="text-[11px] font-bold text-slate-800 truncate">
												{factor.label}
											</span>
											{isBull ? (
												<TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
											) : isBear ? (
												<TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" />
											) : (
												<Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
											)}
										</div>
										<div className="flex items-baseline justify-between gap-1">
											<span className="text-[11px] font-black text-slate-900 truncate">
												{factor.valueStr}
											</span>
											<span className="text-[9px] font-bold text-slate-400">
												Score {factor.score}
											</span>
										</div>
									</button>
								);
							})}
						</div>

						{/* Inline Factor Detail Card */}
						{activeFactor &&
							regime.factors.some((f) => f.key === activeFactor.key) && (
								<div className="mt-3 bg-slate-900 text-white rounded-2xl p-3.5 sm:p-4 shadow-lg border border-slate-800 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
									<div className="flex items-center justify-between gap-2">
										<div className="flex items-center gap-2 min-w-0">
											<span className="text-xs font-black text-amber-400 uppercase tracking-wider truncate">
												{activeFactor.label}
											</span>
											<span className="text-[10px] font-bold text-slate-400 truncate">
												{activeFactor.valueStr} (Score: {activeFactor.score}
												/100)
											</span>
										</div>
										<button
											type="button"
											onClick={() => setActiveFactor(null)}
											className="text-[10px] font-bold text-slate-300 hover:text-white px-2 py-0.5 bg-slate-800 rounded-md cursor-pointer shrink-0"
										>
											Close
										</button>
									</div>
									<p className="text-xs text-slate-300 font-medium leading-relaxed">
										{activeFactor.note}
									</p>
								</div>
							)}
					</div>
				</div>

				{/* Context Flags */}
				{regime.contextFlags.length > 0 && (
					<div className="flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-slate-100">
						{regime.contextFlags.map((flag, idx) => (
							<span
								key={idx}
								className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
							>
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
									<h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
										Global Macro &amp; Dollar Liquidity Context
									</h4>
									<p className="text-[10px] font-semibold text-slate-500">
										Overarching baseline driving cross-border liquidity and
										discount rates
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<span
									className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStateBadge(globalRegime.state)}`}
								>
									{globalRegime.state.replace("_", " ")}
								</span>
								<div className="flex items-baseline gap-1 text-xs font-black text-slate-800 px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg">
									<span>{globalRegime.score}</span>
									<span className="text-[9px] text-slate-400 font-bold">
										/100
									</span>
								</div>
							</div>
						</div>

						<p className="text-xs font-medium text-slate-600 leading-relaxed pt-3">
							{globalRegime.headline} — {globalRegime.diagnosis}
						</p>

						<div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 text-[10px] font-semibold text-slate-500">
							{globalRegime.factors.map((f) => {
								const isSelected = activeFactor?.key === f.key;
								return (
									<button
										key={f.key}
										type="button"
										onClick={() => setActiveFactor(isSelected ? null : f)}
										className={`px-2.5 py-1 rounded-lg text-left transition-all cursor-pointer active:scale-95 touch-manipulation ${
											isSelected
												? "bg-slate-900 text-white shadow-2xs"
												: "bg-slate-50 border border-slate-200/60 text-slate-700 hover:bg-slate-100"
										}`}
									>
										{f.label}:{" "}
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
								<div className="mt-3 bg-slate-900 text-white rounded-2xl p-3.5 sm:p-4 shadow-lg border border-slate-800 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
									<div className="flex items-center justify-between gap-2">
										<div className="flex items-center gap-2 min-w-0">
											<span className="text-xs font-black text-amber-400 uppercase tracking-wider truncate">
												{activeFactor.label}
											</span>
											<span className="text-[10px] font-bold text-slate-400 truncate">
												{activeFactor.valueStr} (Score: {activeFactor.score}
												/100)
											</span>
										</div>
										<button
											type="button"
											onClick={() => setActiveFactor(null)}
											className="text-[10px] font-bold text-slate-300 hover:text-white px-2 py-0.5 bg-slate-800 rounded-md cursor-pointer shrink-0"
										>
											Close
										</button>
									</div>
									<p className="text-xs text-slate-300 font-medium leading-relaxed">
										{activeFactor.note}
									</p>
								</div>
							)}
					</div>
				</div>
			</div>
		</div>
	);
}
