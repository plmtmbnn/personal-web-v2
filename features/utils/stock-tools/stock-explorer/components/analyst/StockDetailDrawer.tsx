"use client";

import { useEffect, useRef } from "react";
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
import { ResearchEvidence } from "./ResearchEvidence";

interface StockDetailDrawerProps {
	stock?: ProcessedStock | null;
	stockSession?: string | null;
	onClose?: () => void;
}

export default function StockDetailDrawer({
	stock: stockProp,
	stockSession = null,
	onClose: onCloseProp,
}: StockDetailDrawerProps) {
	const screener = useScreener();
	const stock = stockProp !== undefined ? stockProp : screener.selectedStock;
	const onClose = onCloseProp ?? (() => screener.setSelectedStock(null));

	const reduceMotion = useReducedMotion();
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!stock) return;
		const prevFocused = document.activeElement as HTMLElement | null;
		closeButtonRef.current?.focus();

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			prevFocused?.focus?.();
		};
	}, [stock, onClose]);

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
					role="dialog"
					aria-modal="true"
					aria-labelledby="drawer-stock-title"
					initial={reduceMotion ? false : { x: "100%" }}
					animate={{ x: 0 }}
					exit={{ x: "100%" }}
					transition={{ type: "spring", damping: 25, stiffness: 200 }}
					className="w-full max-w-xl h-full bg-white shadow-2xl overflow-y-auto flex flex-col"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 sm:px-6 py-4 sm:py-5 flex items-start justify-between gap-3">
						<div className="min-w-0">
							<div className="flex items-center gap-2 flex-wrap mb-1">
								<h2
									id="drawer-stock-title"
									className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
								>
									{stock.StockCode}
								</h2>
								<span
									className={`px-2.5 py-0.5 rounded-lg text-xs font-bold tabular-nums ${
										stock.ChangePct > 0
											? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
											: stock.ChangePct < 0
												? "bg-rose-50 text-rose-800 border border-rose-200/80"
												: "bg-slate-100 text-slate-800 border border-slate-200"
									}`}
								>
									{stock.ChangePct > 0 ? "+" : ""}
									{stock.ChangePct.toFixed(2)}%
								</span>
								<span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/80 tabular-nums">
									Score {stock.CompositeScore}
								</span>
							</div>
							<p className="text-sm font-semibold text-slate-700">
								{stock.StockName}
							</p>
							<div className="flex flex-wrap items-center gap-2 mt-1.5">
								<span className="text-xs font-bold text-indigo-700">
									{stock.Sector}
								</span>
								<span className="text-xs font-medium text-slate-600 tabular-nums">
									Cap: {fmtIDRNet(stock.MarketCap).replace(/^\+/, "")} IDR
								</span>
							</div>
						</div>
						<div className="flex items-center gap-1.5 shrink-0">
							<button
								type="button"
								onClick={() => {
									screener.openAddPickModal(stock);
								}}
								className="inline-flex min-h-11 items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs active:scale-95 cursor-pointer"
								title="Simulate pick entry price"
							>
								<BookmarkPlus className="w-4 h-4" />
								<span className="hidden sm:inline">Simulate Entry</span>
							</button>
							<a
								href={`https://finance.yahoo.com/quote/${stock.StockCode}.JK`}
								target="_blank"
								rel="noreferrer"
								aria-label={`View ${stock.StockCode} on Yahoo Finance`}
								className="min-h-11 min-w-11 inline-flex items-center justify-center text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors"
								title="View on Yahoo Finance"
							>
								<ExternalLink className="w-5 h-5" />
							</a>
							<button
								ref={closeButtonRef}
								type="button"
								onClick={onClose}
								aria-label="Close drawer"
								className="min-h-11 min-w-11 inline-flex items-center justify-center text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
								title="Close drawer"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
					</div>

					{/* Unified Single-Scroll Inspector Body */}
					<div className="p-5 sm:p-6 flex-1 space-y-5 sm:space-y-6">
						{/* 1. Quantitative Signal Synthesis & 6-Factor Strip */}
						<AIInsights stock={stock} />
						<ResearchEvidence
							key={stock.StockCode}
							symbol={stock.StockCode}
							stockSession={stockSession}
						/>

						{/* 2. Mechanical Trade Setup & Tick-Valid Risk Plan */}
						<div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
							<div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
								<div className="flex items-center gap-2.5">
									<div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shrink-0">
										<Compass className="w-4 h-4" />
									</div>
									<div>
										<h4 className="text-sm font-bold text-slate-900">
											Mechanical Trade Setup Plan
										</h4>
										<p className="text-xs font-medium text-slate-600">
											{tradePlan.setupBucket} Bucket (BEI Fraksi Tick-Rounded)
										</p>
									</div>
								</div>
								<span className="text-xs font-mono font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
									{tradePlan.netRiskRewardRatio == null
										? "Net R:R unavailable"
										: "Net R:R " +
											tradePlan.netRiskRewardRatio.toFixed(2) +
											":1"}
								</span>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								{/* Entry Zone */}
								<div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
									<span className="text-xs font-bold text-slate-600 block">
										Buy Entry Zone
									</span>
									<span className="text-sm font-bold font-mono text-slate-900 mt-1 block tabular-nums">
										{tradePlan.entryLow === tradePlan.entryHigh
											? `${tradePlan.entryHigh.toLocaleString("id-ID")}`
											: `${tradePlan.entryLow.toLocaleString("id-ID")}-${tradePlan.entryHigh.toLocaleString("id-ID")}`}
									</span>
									<span className="text-xs font-medium text-slate-600 mt-0.5 block tabular-nums">
										VWAP {vwapPrice.toLocaleString("id-ID")}
									</span>
								</div>

								{/* Stop-Loss Invalidation */}
								<div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/70">
									<div className="flex items-center gap-1 text-xs font-bold text-rose-800">
										<ShieldAlert className="w-3.5 h-3.5" />
										<span>Stop-Loss</span>
									</div>
									<span className="text-sm font-bold font-mono text-rose-900 mt-1 block tabular-nums">
										{tradePlan.stopLoss.toLocaleString("id-ID")}
									</span>
									<span className="text-xs font-semibold text-rose-700 mt-0.5 block tabular-nums">
										{tradePlan.stopLossPct.toFixed(2)}% risk
									</span>
								</div>

								{/* Targets (2R / 3R) */}
								<div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
									<div className="flex items-center gap-1 text-xs font-bold text-emerald-800">
										<Target className="w-3.5 h-3.5" />
										<span>Target 1 (2R)</span>
									</div>
									<span className="text-sm font-bold font-mono text-emerald-900 mt-1 block tabular-nums">
										{tradePlan.target1.toLocaleString("id-ID")}{" "}
										<span className="text-xs font-semibold text-emerald-700">
											(+{tradePlan.target1Pct.toFixed(1)}%)
										</span>
									</span>
									<span className="text-xs font-semibold text-emerald-800 mt-0.5 block tabular-nums">
										Target 2: {tradePlan.target2.toLocaleString("id-ID")}
									</span>
								</div>
							</div>

							<p className="text-xs font-medium text-slate-700 leading-relaxed">
								{tradePlan.setupNote}
							</p>
						</div>

						{/* 3. Multi-Session 10D Flow & Velocity Sparkbars (when available) */}
						{historySessions.length > 0 && (
							<div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
								<div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
									<div className="flex items-center gap-2.5">
										<div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
											<BarChart3 className="w-4 h-4" />
										</div>
										<div>
											<h4 className="text-sm font-bold text-slate-900">
												{historySessions.length}-Session Flow &amp; Velocity
												History
											</h4>
											<p className="text-xs font-medium text-slate-600">
												Rolling settlement ring buffer
											</p>
										</div>
									</div>
									<div className="flex items-center gap-1.5">
										{stock.RVOL !== undefined && (
											<span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-mono">
												RVOL {stock.RVOL.toFixed(1)}x
											</span>
										)}
										{stock.ForeignStreakDays !== undefined &&
											stock.ForeignStreakDays !== 0 && (
												<span
													className={`text-xs font-bold px-2 py-0.5 rounded-lg font-mono ${
														stock.ForeignStreakDays > 0
															? "bg-emerald-50 text-emerald-800 border border-emerald-200"
															: "bg-rose-50 text-rose-800 border border-rose-200"
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
										<div className="flex items-center justify-between text-xs font-semibold text-slate-600">
											<span>Foreign Net by Session</span>
											{stock.ForeignNet5D !== undefined && (
												<span
													className={
														stock.ForeignNet5D >= 0
															? "text-emerald-700 font-bold tabular-nums"
															: "text-rose-700 font-bold tabular-nums"
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
										<div className="flex items-center justify-between text-xs font-semibold text-slate-600">
											<span>Daily Turnover Velocity</span>
											{stock.High10D && stock.Low10D && (
												<span className="text-slate-700 font-mono tabular-nums">
													10D: {stock.Low10D.toLocaleString("id-ID")}-
													{stock.High10D.toLocaleString("id-ID")}
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
														title={`${sess.d}: Rp ${fmtIDRValue(sess.val)} | Close ${sess.c.toLocaleString("id-ID")}`}
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
									<h4 className="text-sm font-bold text-slate-900">
										Session Price Action &amp; Bounds
									</h4>
									<span
										className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${
											stock.ARARisk === "ARA"
												? "bg-emerald-600 text-white"
												: stock.ARARisk === "Near ARA"
													? "bg-emerald-50 text-emerald-800 border border-emerald-200"
													: stock.ARARisk === "ARB"
														? "bg-rose-600 text-white"
														: stock.ARARisk === "Near ARB"
															? "bg-rose-50 text-rose-800 border border-rose-200"
															: "bg-slate-100 text-slate-700"
										}`}
									>
										{stock.ARARisk === "Normal"
											? "Within Range"
											: stock.ARARisk}
									</span>
								</div>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
									<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
										<p className="text-xs font-semibold text-slate-600">Open</p>
										<p className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">
											{stock.OpenPrice.toLocaleString("id-ID")}
										</p>
									</div>
									<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
										<p className="text-xs font-semibold text-slate-600">High</p>
										<p className="text-sm font-bold text-emerald-700 mt-0.5 font-mono tabular-nums">
											{stock.High.toLocaleString("id-ID")}
										</p>
									</div>
									<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
										<p className="text-xs font-semibold text-slate-600">Low</p>
										<p className="text-sm font-bold text-rose-700 mt-0.5 font-mono tabular-nums">
											{stock.Low.toLocaleString("id-ID")}
										</p>
									</div>
									<div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
										<p className="text-xs font-semibold text-slate-600">
											Prev Close
										</p>
										<p className="text-sm font-bold text-slate-800 mt-0.5 font-mono tabular-nums">
											{stock.Previous.toLocaleString("id-ID")}
										</p>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
								<div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/70">
									<p className="text-xs font-bold text-emerald-800">
										ARA Ceiling (+{limits.araPct.toFixed(0)}%)
									</p>
									<p className="text-sm font-bold text-emerald-900 mt-0.5 font-mono tabular-nums">
										{stock.ARALimitPrice.toLocaleString("id-ID")} IDR
									</p>
								</div>
								<div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200/70">
									<p className="text-xs font-bold text-rose-800">
										ARB Floor ({limits.arbPct.toFixed(0)}%)
									</p>
									<p className="text-sm font-bold text-rose-900 mt-0.5 font-mono tabular-nums">
										{stock.ARBLimitPrice.toLocaleString("id-ID")} IDR
									</p>
								</div>
							</div>
						</div>

						{/* 5. Order Book Depth & Turnover Telemetry */}
						<div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
							<h4 className="text-sm font-bold text-slate-900">
								Order Book Depth &amp; Turnover Telemetry
							</h4>

							{/* Bid vs Offer Bar */}
							<div className="space-y-1.5">
								<div className="flex justify-between text-xs font-bold tabular-nums">
									<span className="text-emerald-800">
										Bid: {fmtLots(stock.BidVolume)} ({stock.BidOfferPressure}%)
									</span>
									<span className="text-rose-800">
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
								<div className="flex justify-between items-center gap-2 py-1.5 border-b border-slate-100">
									<span className="text-xs font-semibold text-slate-600">
										Session Turnover (IDR)
									</span>
									<span className="text-xs font-bold text-slate-900 font-mono tabular-nums text-right">
										Rp {fmtIDRValue(stock.Value)} ({stock.TurnoverTier} Tier)
									</span>
								</div>
								<div className="flex justify-between items-center gap-2 py-1.5 border-b border-slate-100">
									<span className="text-xs font-semibold text-slate-600">
										Volume &amp; Frequency
									</span>
									<span className="text-xs font-bold text-slate-900 font-mono tabular-nums text-right">
										{fmtLots(stock.Volume)} (
										{stock.Frequency.toLocaleString("id-ID")} tx)
									</span>
								</div>
								<div className="flex justify-between items-center gap-2 py-1.5 border-b border-slate-100">
									<span className="text-xs font-semibold text-slate-600">
										Foreign Participation
									</span>
									<span className="text-xs font-bold text-slate-900 font-mono tabular-nums text-right">
										{fmtIDRNet(stock.ForeignNet)} (
										{(stock.ForeignParticipationPct ?? 0).toFixed(1)}% of value)
									</span>
								</div>
								<div className="flex justify-between items-center gap-2 py-1.5">
									<span className="text-xs font-semibold text-slate-600">
										Non-Regular (Nego) Crossing
									</span>
									<span className="text-xs font-bold text-slate-900 font-mono tabular-nums text-right">
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
