"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import type { ProcessedStock } from "../../types";
import {
	fmtLots,
	fmtIDRNet,
	fmtIDRValue,
	getIdxAutoRejectionLimits,
} from "../../utils";
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

	const [activeTab, setActiveTab] = useState<
		"overview" | "fundamental" | "technical"
	>("overview");

	const reduceMotion = useReducedMotion();

	if (!stock) return null;

	const formatBillions = (val: number) => `${(val / 1e9).toFixed(1)}B`;

	const renderFundamentalTab = () => (
		<div className="space-y-6">
			<div className="grid grid-cols-2 gap-4">
				<div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
					<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
						P/E Ratio
					</p>
					<p className="text-xl font-black text-slate-900 mt-1">
						{stock.Fundamentals.PE.toFixed(2)}x
					</p>
				</div>
				<div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
					<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
						PBV
					</p>
					<p className="text-xl font-black text-slate-900 mt-1">
						{stock.Fundamentals.PBV.toFixed(2)}x
					</p>
				</div>
				<div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
					<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
						ROE
					</p>
					<p className="text-xl font-black text-slate-900 mt-1">
						{stock.Fundamentals.ROE.toFixed(1)}%
					</p>
				</div>
				<div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
					<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
						EPS
					</p>
					<p className="text-xl font-black text-slate-900 mt-1">
						{stock.Fundamentals.EPS.toLocaleString()}
					</p>
				</div>
			</div>
			<div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
				<h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4">
					Financial Health
				</h4>
				<div className="space-y-3">
					<div className="flex justify-between items-center py-2 border-b border-slate-50">
						<span className="text-xs font-bold text-slate-500">Market Cap</span>
						<span className="text-sm font-black text-slate-900">
							{fmtIDRNet(stock.MarketCap).replace(/^\+/, "")} IDR
						</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-slate-50">
						<span className="text-xs font-bold text-slate-500">
							Revenue (Sim)
						</span>
						<span className="text-sm font-black text-slate-900">
							{formatBillions(stock.Fundamentals.Revenue)} IDR
						</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-slate-50">
						<span className="text-xs font-bold text-slate-500">
							Net Income (Sim)
						</span>
						<span className="text-sm font-black text-slate-900">
							{formatBillions(stock.Fundamentals.NetIncome)} IDR
						</span>
					</div>
					<div className="flex justify-between items-center py-2">
						<span className="text-xs font-bold text-slate-500">
							Debt to Equity (DER)
						</span>
						<span className="text-sm font-black text-slate-900">
							{stock.Fundamentals.DER.toFixed(2)}x
						</span>
					</div>
				</div>
			</div>
		</div>
	);

	const renderTechnicalTab = () => {
		const limits = getIdxAutoRejectionLimits(stock.Previous);
		return (
			<div className="space-y-6">
				{/* Price Action */}
				<div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
					<h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4">
						Price Action
					</h4>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-[10px] font-bold text-slate-400 uppercase">
								High
							</p>
							<p className="text-sm font-black text-emerald-600">
								{stock.High.toLocaleString()}
							</p>
						</div>
						<div>
							<p className="text-[10px] font-bold text-slate-400 uppercase">
								Low
							</p>
							<p className="text-sm font-black text-rose-600">
								{stock.Low.toLocaleString()}
							</p>
						</div>
						<div>
							<p className="text-[10px] font-bold text-slate-400 uppercase">
								Open
							</p>
							<p className="text-sm font-black text-slate-700">
								{stock.OpenPrice.toLocaleString()}
							</p>
						</div>
						<div>
							<p className="text-[10px] font-bold text-slate-400 uppercase">
								Prev Close
							</p>
							<p className="text-sm font-black text-slate-700">
								{stock.Previous.toLocaleString()}
							</p>
						</div>
					</div>
				</div>

				{/* Auto-Rejection Price Bands */}
				<div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
							Auto-Rejection Bounds (ARA / ARB)
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
							{stock.ARARisk === "Normal" ? "Within Range" : stock.ARARisk}
						</span>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
							<p className="text-[10px] font-bold text-emerald-700 uppercase">
								ARA Limit (+{limits.araPct.toFixed(1)}%)
							</p>
							<p className="text-base font-black text-emerald-800 mt-0.5">
								{stock.ARALimitPrice.toLocaleString()} IDR
							</p>
						</div>
						<div className="bg-rose-50/60 p-3 rounded-lg border border-rose-100">
							<p className="text-[10px] font-bold text-rose-700 uppercase">
								ARB Limit ({limits.arbPct.toFixed(1)}%)
							</p>
							<p className="text-base font-black text-rose-800 mt-0.5">
								{stock.ARBLimitPrice.toLocaleString()} IDR
							</p>
						</div>
					</div>
				</div>

				{/* Microstructure & Bandarmology Telemetry */}
				<div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
					<h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
						Order Book &amp; Microstructure
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

					<div className="space-y-3 pt-2">
						<div className="flex justify-between items-center py-2 border-b border-slate-50">
							<span className="text-xs font-bold text-slate-500">
								Avg Ticket Size (Whale Proxy)
							</span>
							<span className="text-sm font-black text-slate-900">
								{fmtIDRValue(stock.AvgValuePerTx)} / trade
							</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-slate-50">
							<span className="text-xs font-bold text-slate-500">
								Non-Regular (Nego) Crossing
							</span>
							<span className="text-sm font-black text-slate-900">
								{fmtIDRValue(stock.NonRegularValue || 0)} ({stock.NegoRatio}%)
							</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="text-xs font-bold text-slate-500">
								Liquidity Tier
							</span>
							<span className="text-sm font-black text-indigo-600">
								{stock.TurnoverTier} Liquidity
							</span>
						</div>
					</div>
				</div>

				{/* Volume & Turnover */}
				<div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
					<h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4">
						Volume &amp; Turnover
					</h4>
					<div className="space-y-3">
						<div className="flex justify-between items-center py-2 border-b border-slate-50">
							<span className="text-xs font-bold text-slate-500">
								Volume (Lots)
							</span>
							<span className="text-sm font-black text-slate-900">
								{fmtLots(stock.Volume)}{" "}
								<span className="text-xs font-semibold text-slate-400">
									({stock.Volume.toLocaleString()} shares)
								</span>
							</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-slate-50">
							<span className="text-xs font-bold text-slate-500">
								Turnover (IDR)
							</span>
							<span className="text-sm font-black text-slate-900">
								{fmtIDRValue(stock.Value)}
							</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="text-xs font-bold text-slate-500">
								Trade Frequency
							</span>
							<span className="text-sm font-black text-slate-900">
								{stock.Frequency.toLocaleString()} transactions
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	};

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
					<div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-6 flex items-start justify-between">
						<div>
							<div className="flex items-center gap-3 mb-1">
								<h2 className="text-3xl font-black text-slate-900">
									{stock.StockCode}
								</h2>
								<span
									className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${stock.ChangePct > 0 ? "bg-emerald-100 text-emerald-700" : stock.ChangePct < 0 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"}`}
								>
									{stock.ChangePct > 0 ? "+" : ""}
									{stock.ChangePct.toFixed(2)}%
								</span>
							</div>
							<p className="text-sm font-bold text-slate-500">
								{stock.StockName}
							</p>
							<p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mt-2">
								{stock.Sector}
							</p>
						</div>
						<div className="flex items-center gap-2">
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

					<div className="p-6 flex-1">
						{/* Minimalist Frameless Milestone Standard: Tabs */}
						<div className="relative flex items-center border-b border-slate-200/60 pb-0.5 mb-6">
							{[
								{ id: "overview" as const, label: "Overview" },
								{ id: "fundamental" as const, label: "Fundamental" },
								{ id: "technical" as const, label: "Technical" },
							].map((tab) => {
								const isSelected = activeTab === tab.id;
								return (
									<button
										key={tab.id}
										type="button"
										onClick={() => setActiveTab(tab.id)}
										className={`relative flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center ${
											isSelected
												? "text-slate-900 font-black"
												: "text-slate-500 hover:text-slate-800"
										}`}
									>
										<span>{tab.label}</span>
										{isSelected && (
											<motion.div
												layoutId="drawerTabUnderline"
												className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-slate-900 rounded-full z-20"
												transition={{
													type: "spring",
													stiffness: 380,
													damping: 30,
												}}
											/>
										)}
									</button>
								);
							})}
						</div>

						{/* Content */}
						{activeTab === "overview" && (
							<div className="space-y-6">
								<AIInsights stock={stock} />
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
										<h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4">
											Foreign Flow
										</h4>
										<div className="flex justify-between items-center">
											<span className="text-xs font-bold text-slate-500">
												Net Foreign
											</span>
											<span
												className={`text-sm font-black ${stock.ForeignNet > 0 ? "text-emerald-600" : "text-rose-600"}`}
											>
												{fmtIDRNet(stock.ForeignNet)}
											</span>
										</div>
									</div>

									<div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
										<h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4">
											Order Book Pressure
										</h4>
										<div className="flex justify-between items-center">
											<span className="text-xs font-bold text-slate-500">
												Bid Dominance
											</span>
											<span className="text-sm font-black text-slate-900">
												{stock.BidOfferPressure}% Bids
											</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{activeTab === "fundamental" && renderFundamentalTab()}
						{activeTab === "technical" && renderTechnicalTab()}
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
