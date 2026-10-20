"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	X,
	ExternalLink,
	BookmarkPlus,
	Target,
	ShieldAlert,
	BarChart3,
	Compass,
} from "lucide-react";
import type { ProcessedStock } from "../../types";
import {
	fmtLots,
	fmtIDRNet,
	fmtIDRValue,
	getIdxAutoRejectionLimits,
} from "../../utils";
import { calculateStockTradePlan } from "../../utils/opportunityPredicates";
import { useScreener } from "../../context/ScreenerContext";
import AIInsights from "./AIInsights";

interface StockDetailDrawerProps {
	stock?: ProcessedStock | null;
	onClose?: () => void;
}

export default function StockDetailDrawer({
	stock: stockProp,
	onClose: onCloseProp,
}: StockDetailDrawerProps) {
	const screener = useScreener();
	const stock = stockProp !== undefined ? stockProp : screener.selectedStock;
	const onClose = onCloseProp ?? (() => screener.setSelectedStock(null));

	const reduceMotion = useReducedMotion();

	if (!stock) return null;

	const limits = getIdxAutoRejectionLimits(stock.Previous);
	const tradePlan = stock.TradePlan ?? calculateStockTradePlan(stock);
	const vwapPrice =
		stock.VWAP ||
		(stock.Volume > 0 ? Math.round(stock.Value / stock.Volume) : stock.Close);
	const historySessions = stock.History10D ?? [];
	const maxHistoryTurnover =
		historySessions.length > 0
			? Math.max(...historySessions.map((h) => h.val), 1)
			: 1;
	const maxHistoryAbsForeign =
		historySessions.length > 0
			? Math.max(...historySessions.map((h) => Math.abs(h.fn)), 1)
			: 1;

	return (
		<AnimatePresence>
			<motion.div
				initial={reduceMotion ? false : { opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end"
				onClick={onClose}
			>
				<motion.div
					initial={reduceMotion ? false : { x: "100%" }}
					animate={{ x: 0 }}
					exit={{ x: "100%" }}
					transition={{ type: "spring", damping: 25, stiffness: 200 }}
					className="w-full max-w-xl h-full bg-white shadow-2xl overflow-y-auto flex flex-col"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-6 py-5 flex items-start justify-between">
						<div>
							<div className="flex items-center gap-2.5 flex-wrap mb-1">
								<h2 className="text-2xl sm:text-3xl font-black text-slate-900">
									{stock.StockCode}
								</h2>
								<span
									className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
										stock.ChangePct > 0
											? "bg-emerald-100 text-emerald-700"
											: stock.ChangePct < 0
												? "bg-rose-100 text-rose-700"
												: "bg-slate-100 text-slate-700"
									}`}
								>
									{stock.ChangePct > 0 ? "+" : ""}
									{stock.ChangePct.toFixed(2)}%
								</span>
								<span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
									Score {stock.CompositeScore}
								</span>
							</div>
							<p className="text-sm font-bold text-slate-500">
								{stock.StockName}
							</p>
							<div className="flex items-center gap-2 mt-2">
								<span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
									{stock.Sector}
								</span>
								<span className="text-[10px] font-bold text-slate-400">
									Cap: {fmtIDRNet(stock.MarketCap).replace(/^\+/, "")} IDR
								</span>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => {
									screener.openAddPickModal(stock);
								}}
								className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
								title="Simulate pick entry price"
							>
								<BookmarkPlus className="w-3.5 h-3.5" />
								<span className="hidden sm:inline">Simulate Entry</span>
							</button>
							<a
								href={`https://finance.yahoo.com/quote/${stock.StockCode}.JK`}
								target="_blank"
								rel="noreferrer"
								className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
								title="View on Yahoo Finance"
							>
								<ExternalLink className="w-5 h-5" />
							</a>
							<button
								type="button"
								onClick={onClose}
								className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
								title="Close drawer"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
					</div>

					{/* Unified Single-Scroll Inspector Body */}
					<div className="p-6 flex-1 space-y-6">
						{/* 1. Quantitative Signal Synthesis & 6-Factor Strip */}
						<AIInsights stock={stock} />

						{/* 2. Mechanical Trade Setup & Tick-Valid Risk Plan */}
						<div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
							<div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
								<div className="flex items-center gap-2">
									<div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
										<Compass className="w-4 h-4" />
									</div>
									<div>
										<h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
											Mechanical Trade Setup Plan
										</h4>
										<p className="text-[10px] font-semibold text-slate-500 uppercase">
											{tradePlan.setupBucket} Bucket (BEI Fraksi Tick-Rounded)
										</p>
									</div>
								</div>
								<span className="text-[11px] font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
									RRR {tradePlan.riskRewardRatio}:1
								</span>
							</div>

							<div className="grid grid-cols-3 gap-3">
								{/* Entry Zone */}
								<div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
									<span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
										Buy Entry Zone
									</span>
									<span className="text-xs sm:text-sm font-black font-mono text-slate-900 mt-1 block">
										{tradePlan.entryLow === tradePlan.entryHigh
											? `${tradePlan.entryHigh.toLocaleString()}`
											: `${tradePlan.entryLow.toLocaleString()}-${tradePlan.entryHigh.toLocaleString()}`}
									</span>
									<span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">
										VWAP {vwapPrice.toLocaleString()}
									</span>
								</div>

								{/* Stop-Loss Invalidation */}
								<div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
									<div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-rose-700">
										<ShieldAlert className="w-3 h-3" />
										<span>Stop-Loss</span>
									</div>
									<span className="text-xs sm:text-sm font-black font-mono text-rose-800 mt-1 block">
										{tradePlan.stopLoss.toLocaleString()}
									</span>
									<span className="text-[10px] font-bold text-rose-600 mt-0.5 block">
										{tradePlan.stopLossPct.toFixed(2)}% risk
									</span>
								</div>

								{/* Targets (2R / 3R) */}
								<div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
									<div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700">
										<Target className="w-3 h-3" />
										<span>Target 1 (2R)</span>
									</div>
									<span className="text-xs sm:text-sm font-black font-mono text-emerald-800 mt-1 block">
										{tradePlan.target1.toLocaleString()}{" "}
										<span className="text-[10px] font-bold text-emerald-600">
											(+{tradePlan.target1Pct.toFixed(1)}%)
										</span>
									</span>
									<span className="text-[10px] font-bold text-emerald-700 mt-0.5 block">
										T2 (3R): {tradePlan.target2.toLocaleString()}
									</span>
								</div>
							</div>

							<p className="text-[11px] font-medium text-slate-600 leading-relaxed">
								{tradePlan.setupNote}
							</p>
						</div>

						{/* 3. Multi-Session 10D Flow & Velocity Sparkbars (when available) */}
						{historySessions.length > 0 && (
							<div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
								<div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
									<div className="flex items-center gap-2">
										<div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
											<BarChart3 className="w-4 h-4" />
										</div>
										<div>
											<h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
												{historySessions.length}-Session Flow &amp; Velocity
												History
											</h4>
											<p className="text-[10px] font-semibold text-slate-500">
												Rolling settlement ring buffer
											</p>
										</div>
									</div>
									<div className="flex items-center gap-1.5">
										{stock.RVOL !== undefined && (
											<span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
												RVOL {stock.RVOL.toFixed(1)}x
											</span>
										)}
										{stock.ForeignStreakDays !== undefined &&
											stock.ForeignStreakDays !== 0 && (
												<span
													className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md font-mono ${
														stock.ForeignStreakDays > 0
															? "bg-emerald-50 text-emerald-700 border border-emerald-200"
															: "bg-rose-50 text-rose-700 border border-rose-200"
													}`}
												>
													{stock.ForeignStreakDays > 0
														? `${stock.ForeignStreakDays}D Inflow`
														: `${Math.abs(stock.ForeignStreakDays)}D Outflow`}
												</span>
											)}
									</div>
								</div>

								{/* Mini Sparkbars for Foreign Flow & Turnover */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
											<span>Foreign Net by Session</span>
											{stock.ForeignNet5D !== undefined && (
												<span
													className={
														stock.ForeignNet5D >= 0
															? "text-emerald-600 font-black"
															: "text-rose-600 font-black"
													}
												>
													5D: {fmtIDRNet(stock.ForeignNet5D)}
												</span>
											)}
										</div>
										<div className="flex items-end gap-1 h-14 bg-slate-50 rounded-xl p-2 border border-slate-100">
											{historySessions.map((sess) => {
												const heightPct = Math.max(
													14,
													Math.round(
														(Math.abs(sess.fn) / maxHistoryAbsForeign) * 100,
													),
												);
												const isPos = sess.fn >= 0;
												return (
													<div
														key={sess.d}
														className="flex-1 h-full flex flex-col justify-end items-center"
														title={`${sess.d}: ${fmtIDRNet(sess.fn)}`}
													>
														<div
															style={{ height: `${heightPct}%` }}
															className={`w-full rounded-xs ${
																isPos ? "bg-emerald-500" : "bg-rose-500"
															}`}
														/>
													</div>
												);
											})}
										</div>
									</div>

									<div className="space-y-2">
										<div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
											<span>Daily Turnover Velocity</span>
											{stock.High10D && stock.Low10D && (
												<span className="text-slate-700 font-mono">
													10D: {stock.Low10D.toLocaleString()}-
													{stock.High10D.toLocaleString()}
												</span>
											)}
										</div>
										<div className="flex items-end gap-1 h-14 bg-slate-50 rounded-xl p-2 border border-slate-100">
											{historySessions.map((sess) => {
												const heightPct = Math.max(
													14,
													Math.round((sess.val / maxHistoryTurnover) * 100),
												);
												return (
													<div
														key={sess.d}
														className="flex-1 h-full flex flex-col justify-end items-center"
														title={`${sess.d}: Rp ${fmtIDRValue(sess.val)} | Close ${sess.c.toLocaleString()}`}
													>
														<div
															style={{ height: `${heightPct}%` }}
															className="w-full rounded-xs bg-indigo-500"
														/>
													</div>
												);
											})}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* 4. Price Action & Auto-Rejection Bounds (ARA / ARB) */}
						<div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5">
							<div>
								<div className="flex items-center justify-between mb-3">
									<h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
										Session Price Action &amp; Bounds
									</h4>
									<span
										className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
											stock.ARARisk === "ARA"
												? "bg-emerald-500 text-white"
												: stock.ARARisk === "Near ARA"
													? "bg-emerald-50 text-emerald-700 border border-emerald-200"
													: stock.ARARisk === "ARB"
														? "bg-rose-500 text-white"
														: stock.ARARisk === "Near ARB"
															? "bg-rose-50 text-rose-700 border border-rose-200"
															: "bg-slate-100 text-slate-600"
										}`}
									>
										{stock.ARARisk === "Normal"
											? "Within Range"
											: stock.ARARisk}
									</span>
								</div>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
									<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
										<p className="text-[10px] font-bold text-slate-400 uppercase">
											Open
										</p>
										<p className="text-sm font-black text-slate-800 mt-0.5 font-mono">
											{stock.OpenPrice.toLocaleString()}
										</p>
									</div>
									<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
										<p className="text-[10px] font-bold text-slate-400 uppercase">
											High
										</p>
										<p className="text-sm font-black text-emerald-600 mt-0.5 font-mono">
											{stock.High.toLocaleString()}
										</p>
									</div>
									<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
										<p className="text-[10px] font-bold text-slate-400 uppercase">
											Low
										</p>
										<p className="text-sm font-black text-rose-600 mt-0.5 font-mono">
											{stock.Low.toLocaleString()}
										</p>
									</div>
									<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
										<p className="text-[10px] font-bold text-slate-400 uppercase">
											Prev Close
										</p>
										<p className="text-sm font-black text-slate-700 mt-0.5 font-mono">
											{stock.Previous.toLocaleString()}
										</p>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
								<div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
									<p className="text-[10px] font-bold text-emerald-700 uppercase">
										ARA Ceiling (+{limits.araPct.toFixed(0)}%)
									</p>
									<p className="text-sm font-black text-emerald-800 mt-0.5 font-mono">
										{stock.ARALimitPrice.toLocaleString()} IDR
									</p>
								</div>
								<div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100">
									<p className="text-[10px] font-bold text-rose-700 uppercase">
										ARB Floor ({limits.arbPct.toFixed(0)}%)
									</p>
									<p className="text-sm font-black text-rose-800 mt-0.5 font-mono">
										{stock.ARBLimitPrice.toLocaleString()} IDR
									</p>
								</div>
							</div>
						</div>

						{/* 5. Order Book Depth & Turnover Telemetry */}
						<div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
							<h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
								Order Book Depth &amp; Turnover Telemetry
							</h4>

							{/* Bid vs Offer Bar */}
							<div className="space-y-1.5">
								<div className="flex justify-between text-xs font-bold">
									<span className="text-emerald-700">
										Bid: {fmtLots(stock.BidVolume)} ({stock.BidOfferPressure}%)
									</span>
									<span className="text-rose-700">
										Offer: {fmtLots(stock.OfferVolume)} (
										{100 - stock.BidOfferPressure}%)
									</span>
								</div>
								<div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
									<div
										style={{ width: `${stock.BidOfferPressure}%` }}
										className="bg-emerald-500 h-full"
									/>
									<div
										style={{ width: `${100 - stock.BidOfferPressure}%` }}
										className="bg-rose-500 h-full"
									/>
								</div>
							</div>

							<div className="space-y-2.5 pt-2">
								<div className="flex justify-between items-center py-1.5 border-b border-slate-50">
									<span className="text-xs font-bold text-slate-500">
										Session Turnover (IDR)
									</span>
									<span className="text-xs font-black text-slate-900 font-mono">
										Rp {fmtIDRValue(stock.Value)} ({stock.TurnoverTier} Tier)
									</span>
								</div>
								<div className="flex justify-between items-center py-1.5 border-b border-slate-50">
									<span className="text-xs font-bold text-slate-500">
										Volume &amp; Frequency
									</span>
									<span className="text-xs font-black text-slate-900 font-mono">
										{fmtLots(stock.Volume)} ({stock.Frequency.toLocaleString()}{" "}
										tx)
									</span>
								</div>
								<div className="flex justify-between items-center py-1.5 border-b border-slate-50">
									<span className="text-xs font-bold text-slate-500">
										Foreign Participation
									</span>
									<span className="text-xs font-black text-slate-900 font-mono">
										{fmtIDRNet(stock.ForeignNet)} (
										{(stock.ForeignParticipationPct ?? 0).toFixed(1)}% of value)
									</span>
								</div>
								<div className="flex justify-between items-center py-1.5">
									<span className="text-xs font-bold text-slate-500">
										Non-Regular (Nego) Crossing
									</span>
									<span className="text-xs font-black text-slate-900 font-mono">
										Rp {fmtIDRValue(stock.NonRegularValue || 0)} (
										{stock.NegoRatio}%)
									</span>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
