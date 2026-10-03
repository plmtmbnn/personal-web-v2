"use client";

import { useMemo } from "react";
import {
	AlertTriangle,
	ShieldAlert,
	CheckCircle2,
	XCircle,
	ListChecks,
	Scale,
} from "lucide-react";
import type { InvestmentCompassData } from "@/features/investment/types";

export default function TradersCheatsheet({
	data,
}: {
	data: InvestmentCompassData;
}) {
	const { dangerZone, checklist } = useMemo(() => {
		// 1. Extract Data
		const getFredLatest = (id: string) => {
			const series = data.markets.macro?.[id];
			if (!series?.data || series.data.length === 0) return null;
			return series.data[series.data.length - 1].value;
		};

		const hySpread = getFredLatest("BAMLH0A0HYM2");
		const cnnScore = data.sentiment.traditional?.fear_and_greed?.score ?? 50;
		const vixScore =
			data.sentiment.traditional?.market_volatility_vix?.score ?? 50;
		const btcDom = data.markets.cryptoGlobal?.btcDominance ?? 50;
		const dxy = data.markets.quotes.DXY?.last ?? 100;

		// 2. Capital Preservation Logic (Danger Zone)
		const dangerTriggers = [];
		if (hySpread && hySpread > 5.0) {
			dangerTriggers.push(
				`High Yield Spread is extremely elevated (${hySpread.toFixed(2)}%). Severe corporate credit stress.`,
			);
		}
		if (vixScore < 20) {
			// CNN scores VIX inversely: 0 = Extreme Volatility/Fear
			dangerTriggers.push(
				"VIX is signaling extreme panic and market illiquidity.",
			);
		}
		if (cnnScore < 15) {
			dangerTriggers.push("Broad market is in absolute capitulation.");
		}

		// 3. Weekly Tactical Checklist
		const altcoins = {
			question: "Should I buy Altcoins this week?",
			answer: btcDom > 54 ? "NO" : "YES",
			reason:
				btcDom > 54
					? `BTC Dominance is high (${btcDom.toFixed(1)}%). Liquidity is staying in Bitcoin.`
					: `BTC Dominance is dropping (${btcDom.toFixed(1)}%). Alt-season liquidity rotation is active.`,
		};

		const ihsgSwing = {
			question: "Is it safe to Swing Trade IHSG?",
			answer: dxy > 104.5 ? "NO" : "YES",
			reason:
				dxy > 104.5
					? `Strong US Dollar (DXY ${dxy.toFixed(1)}) is pulling foreign capital out of emerging markets.`
					: `US Dollar (DXY ${dxy.toFixed(1)}) is cooling, providing a tailwind for domestic equities.`,
		};

		let lumpSumAnswer = "DCA";
		let lumpSumReason = `Market sentiment is neutral (${Math.round(cnnScore)}/100). Stick to steady Dollar-Cost Averaging.`;
		if (cnnScore > 70) {
			lumpSumAnswer = "NO";
			lumpSumReason = `Market is in Extreme Greed (${Math.round(cnnScore)}/100). High risk of pullback. Take profits instead.`;
		} else if (cnnScore < 30) {
			lumpSumAnswer = "YES";
			lumpSumReason = `Market is in Extreme Fear (${Math.round(cnnScore)}/100). Generational buying window for core assets.`;
		}
		const lumpSum = {
			question: "Should I lump-sum invest today?",
			answer: lumpSumAnswer,
			reason: lumpSumReason,
		};

		const scalping = {
			question: "Should I scalp today?",
			answer: vixScore > 60 ? "NO" : "YES", // High VIX score (CNN) = Low actual VIX
			reason:
				vixScore > 60
					? "Volatility is too low (choppy/sideways). High risk of getting chopped out."
					: "Volatility is present, providing wide enough ranges for intraday setups.",
		};

		return {
			dangerZone: {
				active: dangerTriggers.length > 0,
				triggers: dangerTriggers,
			},
			checklist: [altcoins, ihsgSwing, lumpSum, scalping],
		};
	}, [data]);

	return (
		<div className="space-y-6">
			{/* --- 1. Capital Preservation (Red Alert) --- */}
			{dangerZone.active && (
				<div className="bg-rose-600 rounded-[2rem] p-5 sm:p-8 text-white shadow-xl shadow-rose-900/20 border-4 border-rose-500 animate-in fade-in slide-in-from-top-4 duration-700">
					<div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
						<div className="bg-white/20 p-2.5 sm:p-3 rounded-2xl shrink-0">
							<ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
						</div>
						<div className="min-w-0 flex-1">
							<h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
								CAPITAL PRESERVATION MODE
							</h2>
							<p className="text-xs sm:text-sm text-rose-100 font-semibold mb-3 sm:mb-4 leading-relaxed">
								The macro engine has detected severe systemic stress. Stop
								trading immediately, move to cash, and protect your capital. Do
								not attempt to catch falling knives.
							</p>
							<ul className="space-y-2 bg-rose-950/40 p-3 sm:p-4 rounded-xl border border-rose-500/50">
								{dangerZone.triggers.map((trigger, i) => (
									<li
										key={i}
										className="flex items-start gap-2 text-xs sm:text-sm font-bold text-rose-50"
									>
										<AlertTriangle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
										<span>{trigger}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
				{/* --- 2. Dynamic Weekly Checklist --- */}
				<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 flex flex-col h-full">
					<div className="flex items-center gap-3 border-b border-slate-100 pb-4 sm:pb-5 mb-4 sm:mb-5">
						<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
							<ListChecks className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
								Tactical Checklist
							</h3>
							<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
								Dynamic answers for this week
							</p>
						</div>
					</div>
					<div className="space-y-3 sm:space-y-4 flex-1">
						{checklist.map((item, i) => {
							const isYes = item.answer === "YES";
							const isNo = item.answer === "NO";
							const isNeutral = !isYes && !isNo;

							let badgeColor = "bg-slate-100 text-slate-700";
							let Icon = CheckCircle2;

							if (isYes) {
								badgeColor =
									"bg-emerald-100 text-emerald-700 border-emerald-200";
							} else if (isNo) {
								badgeColor = "bg-rose-100 text-rose-700 border-rose-200";
								Icon = XCircle;
							} else if (isNeutral) {
								badgeColor = "bg-amber-100 text-amber-700 border-amber-200";
								Icon = AlertTriangle;
							}

							return (
								<div
									key={i}
									className="flex items-start gap-2.5 sm:gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100"
								>
									<div
										className={`mt-0.5 shrink-0 ${isYes ? "text-emerald-500" : isNo ? "text-rose-500" : "text-amber-500"}`}
									>
										<Icon className="w-4 h-4 sm:w-5 sm:h-5" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex justify-between items-start gap-2 mb-1">
											<span className="text-xs sm:text-sm font-extrabold text-slate-800">
												{item.question}
											</span>
											<span
												className={`text-[10px] font-black px-2 py-0.5 rounded-lg border shrink-0 ${badgeColor}`}
											>
												{item.answer}
											</span>
										</div>
										<p className="text-[11px] sm:text-xs font-semibold text-slate-600 leading-snug">
											{item.reason}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* --- 3. Golden Rules of Discipline --- */}
				<div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl shadow-slate-900/10 p-5 sm:p-8 flex flex-col h-full text-slate-300">
					<div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 sm:pb-5 mb-4 sm:mb-5">
						<div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center shrink-0">
							<Scale className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
								The Golden Rules
							</h3>
							<p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
								Unbreakable discipline protocols
							</p>
						</div>
					</div>
					<ul className="space-y-3.5 sm:space-y-4 flex-1">
						<li className="flex items-start gap-2.5 sm:gap-3">
							<span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 mt-0.5">
								1
							</span>
							<div className="min-w-0 flex-1">
								<span className="text-white font-bold text-xs sm:text-sm block mb-0.5">
									Never average down on a losing swing trade.
								</span>
								<span className="text-[11px] sm:text-xs text-slate-400 leading-snug block">
									Cut losses quickly. Averaging down is for long-term
									investments only, not short-term setups.
								</span>
							</div>
						</li>
						<li className="flex items-start gap-3">
							<span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
								2
							</span>
							<div>
								<span className="text-white font-bold text-sm block mb-0.5">
									Respect the Macro Regime.
								</span>
								<span className="text-xs text-slate-400 leading-snug block">
									If the engine says "Restrictive" or "Defensive", cut all
									active position sizes by 50%. Do not fight the Fed.
								</span>
							</div>
						</li>
						<li className="flex items-start gap-3">
							<span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
								3
							</span>
							<div>
								<span className="text-white font-bold text-sm block mb-0.5">
									Yield Curve Inversion = Flight to Quality.
								</span>
								<span className="text-xs text-slate-400 leading-snug block">
									When inverted, avoid 2nd-liner speculative stocks. Prioritize
									Cash, BBCA, BMRI, and proven blue-chips.
								</span>
							</div>
						</li>
						<li className="flex items-start gap-3">
							<span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
								4
							</span>
							<div>
								<span className="text-white font-bold text-sm block mb-0.5">
									Do not buy into Extreme Greed.
								</span>
								<span className="text-xs text-slate-400 leading-snug block">
									If an asset pumps 20% and hits peak FOMO (Greed {">"} 75), it
									is time to sell or hold. Never buy the top.
								</span>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
