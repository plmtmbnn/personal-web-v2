"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	Compass,
	TrendingUp,
	Zap,
	ShieldCheck,
	AlertTriangle,
	ChevronDown,
	ChevronUp,
	Layers,
	Target,
	Bitcoin,
	Globe2,
} from "lucide-react";
import type {
	FearAndGreedData,
	CryptoFearAndGreedResponse,
	MarketRegimeClassification,
} from "@/features/investment/types";

interface MarketSituationSummaryProps {
	traditionalData: FearAndGreedData | null;
	cryptoData: CryptoFearAndGreedResponse | null;
}

export default function MarketSituationSummary({
	traditionalData,
	cryptoData,
}: MarketSituationSummaryProps) {
	const reduceMotion = useReducedMotion();
	const [showFormulaDetails, setShowFormulaDetails] = useState(false);

	// 1. Extract Scores
	const tradScore = traditionalData?.fear_and_greed?.score ?? 50;
	const tradRating = traditionalData?.fear_and_greed?.rating ?? "neutral";

	const cryptoScore = cryptoData?.data?.[0]?.value
		? Number(cryptoData.data[0].value)
		: 50;
	const cryptoRating = cryptoData?.data?.[0]?.value_classification ?? "Neutral";

	// 2. Compute Market Breadth (% of bullish indicators)
	const subIndices = useMemo(() => {
		if (!traditionalData) return [];
		return [
			traditionalData.market_momentum_sp500?.score ?? 50,
			traditionalData.market_momentum_sp125?.score ?? 50,
			traditionalData.stock_price_strength?.score ?? 50,
			traditionalData.stock_price_breadth?.score ?? 50,
			traditionalData.put_call_options?.score ?? 50,
			traditionalData.market_volatility_vix?.score ?? 50,
			traditionalData.junk_bond_demand?.score ?? 50,
			traditionalData.safe_haven_demand?.score ?? 50,
		];
	}, [traditionalData]);

	const breadthScore = useMemo(() => {
		if (!subIndices.length) return 50;
		const bullishCount = subIndices.filter((s) => s > 55).length;
		return Math.round((bullishCount / subIndices.length) * 100);
	}, [subIndices]);

	// 3. Compute Volatility Inversion Score (VIX component)
	const vixScore = traditionalData?.market_volatility_vix?.score ?? 50;

	// 4. Formula: Composite Global Liquidity & Sentiment Score
	// C_macro = 40% Trad + 25% Crypto + 20% Breadth + 15% VIX
	const compositeScore = useMemo(() => {
		const score =
			0.4 * tradScore +
			0.25 * cryptoScore +
			0.2 * breadthScore +
			0.15 * vixScore;
		return Math.round(score);
	}, [tradScore, cryptoScore, breadthScore, vixScore]);

	// 5. Sentiment Divergence (Crypto - Trad)
	const divergence = Math.round(cryptoScore - tradScore);

	// 6. Market Regime Classification
	const regime: MarketRegimeClassification = useMemo(() => {
		// Regime: Speculative Decoupling (Crypto running significantly hotter than equities)
		if (divergence >= 15 && tradScore < 50) {
			return {
				key: "speculative_decoupling",
				title: "Speculative Decoupling",
				headline: "Retail & Digital Risk Appetite Outpacing Wall Street",
				diagnosis: `Traditional equity markets are positioned cautiously in ${tradRating.toUpperCase()} (${Math.round(
					tradScore,
				)}/100), while digital assets are surging in ${cryptoRating.toUpperCase()} (${Math.round(
					cryptoScore,
				)}/100). The current spread of ${divergence > 0 ? `+${divergence}` : divergence} points signals speculative liquidity decoupling, where decentralized assets are leading retail momentum despite institutional defensive positioning.`,
				color: {
					border: "border-amber-300",
					topBar: "bg-amber-500",
					badgeBg: "bg-amber-50",
					badgeText: "text-amber-800",
					badgeBorder: "border-amber-200",
				},
				compositeScore,
				divergence,
				playbook: {
					favoredSectors: [
						"Defensive Value & Cash-Generative Blue Chips",
						"Healthcare & High-Yield Dividend Aristocrats",
						"Selective Large-Cap Crypto (with trailing stops)",
					],
					elevatedRisks: [
						"Liquidity Trap if Equities fail to confirm crypto rally",
						"Fed interest rate policy recalibration",
						"Sudden risk-off volatility spillover",
					],
					posture:
						"Barbell Allocation: 55% Defensive/Quality Equities, 25% Cash/Short Bonds, 20% Tactical Growth/Crypto.",
				},
			};
		}

		// Regime: Broad Risk-On Expansion
		if (compositeScore >= 60) {
			return {
				key: "expansion",
				title: "Broad Risk-On Expansion",
				headline: "Synchronized Liquidity & Bullish Market Breadth",
				diagnosis: `Both institutional equities (${Math.round(
					tradScore,
				)}/100) and digital assets (${Math.round(
					cryptoScore,
				)}/100) are aligned in expansive territory. Strong market breadth and subdued volatility indicate capital inflows seeking growth across risk assets.`,
				color: {
					border: "border-emerald-300",
					topBar: "bg-emerald-500",
					badgeBg: "bg-emerald-50",
					badgeText: "text-emerald-800",
					badgeBorder: "border-emerald-200",
				},
				compositeScore,
				divergence,
				playbook: {
					favoredSectors: [
						"Technology, AI Infrastructure & Semiconductor Leaders",
						"Consumer Discretionary & High-Beta Growth",
						"Decentralized Finance & Layer-1 Ecosystems",
					],
					elevatedRisks: [
						"Valuation multiple overextension",
						"Complacency in credit spreads",
					],
					posture:
						"Growth Posture: 70% Growth/Equities, 20% Crypto/Alternatives, 10% Cash Reserves.",
				},
			};
		}

		// Regime: Capitulation / Value Window
		if (compositeScore < 35) {
			return {
				key: "capitulation",
				title: "Capitulation & Oversold Value Window",
				headline: "Pervasive Market Panic & Asymmetric Long-Term Upside",
				diagnosis: `Widespread risk aversion is dominating traditional markets (${Math.round(
					tradScore,
				)}/100) and digital assets (${Math.round(
					cryptoScore,
				)}/100). Panic-driven selling historically marks favorable dollar-cost averaging entry points for multi-year capital compounding.`,
				color: {
					border: "border-rose-300",
					topBar: "bg-rose-500",
					badgeBg: "bg-rose-50",
					badgeText: "text-rose-800",
					badgeBorder: "border-rose-200",
				},
				compositeScore,
				divergence,
				playbook: {
					favoredSectors: [
						"S&P 500 & Index Dollar-Cost Averaging (DCA)",
						"Balance-Sheet Fortresses with Zero Net Debt",
						"High-Conviction Core Blue Chips",
					],
					elevatedRisks: [
						"Short-term capitulation volatility spikes",
						"Avoid panic-selling at cyclical market bottoms",
					],
					posture:
						"Aggressive Accumulation: Incrementally deploy reserves into high-quality benchmark assets.",
				},
			};
		}

		// Regime: Defensive Rotation / Consolidation (Default)
		return {
			key: "defensive_rotation",
			title: "Defensive Rotation & Consolidation",
			headline: "Risk-Off Hedging & Capital Preservation Phase",
			diagnosis: `Market participants are actively hedging equity exposures with sentiment centered in ${tradRating.toUpperCase()} (${Math.round(
				tradScore,
			)}/100). Safe haven rotation and selective capital preservation are dominating near-term market behavior.`,
			color: {
				border: "border-indigo-200/80",
				topBar: "bg-indigo-600",
				badgeBg: "bg-indigo-50",
				badgeText: "text-indigo-800",
				badgeBorder: "border-indigo-200",
			},
			compositeScore,
			divergence,
			playbook: {
				favoredSectors: [
					"Low-Beta Consumer Staples & Healthcare",
					"Treasury Bills & Short-Duration Cash Yields",
					"Energy & Strategic Infrastructure",
				],
				elevatedRisks: [
					"Over-leveraged balance sheets vulnerable to rate spikes",
					"Unprofitable tech valuations",
				],
				posture:
					"Capital Preservation: 50% Quality Value, 30% Cash/Yield, 20% Long-Term Core DCA.",
			},
		};
	}, [
		compositeScore,
		divergence,
		tradScore,
		tradRating,
		cryptoScore,
		cryptoRating,
	]);

	return (
		<section className="bg-white rounded-[2rem] sm:rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6 relative overflow-hidden">
			{/* Top Solid Accent Bar */}
			<div
				className={`absolute top-0 left-0 right-0 h-1.5 ${regime.color.topBar}`}
			/>

			{/* Section Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span
							className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${regime.color.badgeBg} ${regime.color.badgeText} ${regime.color.badgeBorder}`}
						>
							Macro Regime: {regime.title}
						</span>
						<span className="text-xs font-bold text-slate-500">
							Global Pulse Synthesis
						</span>
					</div>
					<h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
						{regime.headline}
					</h2>
				</div>

				{/* Composite Score Meter */}
				<div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 shrink-0">
					<div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-indigo-600 shadow-2xs">
						<Compass className="w-5 h-5" />
					</div>
					<div>
						<div className="flex items-baseline gap-1.5">
							<span className="text-2xl font-black text-slate-900 tracking-tight">
								{regime.compositeScore}
							</span>
							<span className="text-[10px] font-bold text-slate-400">
								/ 100
							</span>
						</div>
						<p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
							Liquidity Composite
						</p>
					</div>
				</div>
			</div>

			{/* Dual Engine Sentiment Comparison: Wall Street vs Crypto */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Wall Street Card */}
				<div className="p-4 sm:p-5 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-4">
					<div className="flex items-center gap-3.5">
						<div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
							<Globe2 className="w-5 h-5 text-indigo-600" />
						</div>
						<div>
							<span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
								Wall Street (Equities)
							</span>
							<div className="flex items-baseline gap-2 mt-0.5">
								<span className="text-2xl font-black text-slate-900">
									{Math.round(tradScore)}
								</span>
								<span className="text-xs font-extrabold text-indigo-700 capitalize">
									{tradRating}
								</span>
							</div>
						</div>
					</div>
					<div className="text-right hidden sm:block">
						<span className="text-[10px] font-semibold text-slate-400 block">
							Benchmark
						</span>
						<span className="text-xs font-bold text-slate-700">
							S&P 500 / VIX
						</span>
					</div>
				</div>

				{/* Crypto Card */}
				<div className="p-4 sm:p-5 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-4">
					<div className="flex items-center gap-3.5">
						<div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-amber-600 shadow-2xs shrink-0">
							<Bitcoin className="w-5 h-5 text-amber-500" />
						</div>
						<div>
							<span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
								Digital Assets (Crypto)
							</span>
							<div className="flex items-baseline gap-2 mt-0.5">
								<span className="text-2xl font-black text-slate-900">
									{Math.round(cryptoScore)}
								</span>
								<span className="text-xs font-extrabold text-amber-600 capitalize">
									{cryptoRating}
								</span>
							</div>
						</div>
					</div>
					<div className="text-right">
						<span
							className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
								divergence > 0
									? "bg-amber-50 text-amber-800 border-amber-200"
									: divergence < 0
										? "bg-indigo-50 text-indigo-800 border-indigo-200"
										: "bg-slate-100 text-slate-700 border-slate-200"
							}`}
						>
							Spread: {divergence > 0 ? `+${divergence}` : divergence} pts
						</span>
					</div>
				</div>
			</div>

			{/* Diagnostic Summary Narrative */}
			<div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200/60 space-y-2">
				<div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wider">
					<Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
					<span>Current Situation Diagnosis</span>
				</div>
				<p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
					{regime.diagnosis}
				</p>
			</div>

			{/* Strategic Action Playbook */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
						<Target className="w-4 h-4 text-indigo-600" />
						Actionable Market Playbook
					</h3>
					<span className="text-[10px] font-bold text-slate-400">
						Regime-Aligned Strategy
					</span>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
					{/* Favored Sectors */}
					<div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-2">
						<div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700">
							<TrendingUp className="w-4 h-4" />
							<span>Favored Positioning</span>
						</div>
						<ul className="space-y-1.5 text-xs text-slate-600 font-medium">
							{regime.playbook.favoredSectors.map((sector, i) => (
								<li key={i} className="flex items-start gap-1.5">
									<span className="text-emerald-500 font-bold">•</span>
									<span>{sector}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Elevated Risks */}
					<div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-2">
						<div className="flex items-center gap-2 text-xs font-extrabold text-rose-700">
							<AlertTriangle className="w-4 h-4" />
							<span>Key Risks & Cautions</span>
						</div>
						<ul className="space-y-1.5 text-xs text-slate-600 font-medium">
							{regime.playbook.elevatedRisks.map((risk, i) => (
								<li key={i} className="flex items-start gap-1.5">
									<span className="text-rose-500 font-bold">•</span>
									<span>{risk}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Recommended Posture */}
					<div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-2">
						<div className="flex items-center gap-2 text-xs font-extrabold text-indigo-700">
							<ShieldCheck className="w-4 h-4" />
							<span>Allocation Posture</span>
						</div>
						<p className="text-xs text-slate-600 leading-relaxed font-medium">
							{regime.playbook.posture}
						</p>
					</div>
				</div>
			</div>

			{/* Interactive Formula Methodology Drawer */}
			<div className="pt-2 border-t border-slate-100">
				<button
					type="button"
					onClick={() => setShowFormulaDetails((prev) => !prev)}
					className="flex items-center justify-between w-full text-left py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
				>
					<span className="flex items-center gap-2">
						<Layers className="w-4 h-4 text-indigo-600" />
						How the Global Liquidity Composite Formula Works
					</span>
					{showFormulaDetails ? (
						<ChevronUp className="w-4 h-4" />
					) : (
						<ChevronDown className="w-4 h-4" />
					)}
				</button>

				<AnimatePresence>
					{showFormulaDetails && (
						<motion.div
							initial={reduceMotion ? false : { opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.25 }}
							className="overflow-hidden pt-3 space-y-4"
						>
							<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
								<div className="font-mono text-[11px] font-bold text-indigo-900 bg-white p-3 rounded-xl border border-slate-200/80">
									Composite Score = (40% × Trad Equities) + (25% × Crypto
									Sentiment) + (20% × Market Breadth) + (15% × Volatility Score)
								</div>

								<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
									<div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
										<span className="text-[10px] font-bold text-slate-400 block">
											Traditional (40%)
										</span>
										<span className="font-mono font-bold text-slate-800">
											{Math.round(tradScore)} pts
										</span>
									</div>
									<div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
										<span className="text-[10px] font-bold text-slate-400 block">
											Crypto (25%)
										</span>
										<span className="font-mono font-bold text-slate-800">
											{Math.round(cryptoScore)} pts
										</span>
									</div>
									<div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
										<span className="text-[10px] font-bold text-slate-400 block">
											Breadth (20%)
										</span>
										<span className="font-mono font-bold text-slate-800">
											{breadthScore} pts
										</span>
									</div>
									<div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
										<span className="text-[10px] font-bold text-slate-400 block">
											Volatility (15%)
										</span>
										<span className="font-mono font-bold text-slate-800">
											{Math.round(vixScore)} pts
										</span>
									</div>
								</div>

								<p className="text-slate-500 leading-relaxed text-[11px]">
									By blending Wall Street institutional sentiment with real-time
									crypto liquidity and internal market breadth, this model
									avoids single-asset bias and detects whether broad market risk
									appetite is healthy, speculative, or contracting.
								</p>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</section>
	);
}
