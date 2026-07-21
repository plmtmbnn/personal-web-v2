import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ExternalLink, Activity, Target, Layers } from "lucide-react";
import type { ProcessedStock } from "../../types";
import AIInsights from "./AIInsights";

interface StockDetailDrawerProps {
	stock: ProcessedStock | null;
	onClose: () => void;
}

export default function StockDetailDrawer({
	stock,
	onClose,
}: StockDetailDrawerProps) {
	const [activeTab, setActiveTab] = useState<
		"overview" | "fundamental" | "technical"
	>("overview");

	const reduceMotion = useReducedMotion();

	if (!stock) return null;

	const formatBillions = (val: number) => (val / 1e9).toFixed(1) + "B";

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

	const renderTechnicalTab = () => (
		<div className="space-y-6">
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

			<div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
				<h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4">
					Volume & Liquidity
				</h4>
				<div className="space-y-3">
					<div className="flex justify-between items-center py-2 border-b border-slate-50">
						<span className="text-xs font-bold text-slate-500">Volume</span>
						<span className="text-sm font-black text-slate-900">
							{stock.Volume.toLocaleString()}
						</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-slate-50">
						<span className="text-xs font-bold text-slate-500">
							Value (IDR)
						</span>
						<span className="text-sm font-black text-slate-900">
							{formatBillions(stock.Value)}
						</span>
					</div>
					<div className="flex justify-between items-center py-2">
						<span className="text-xs font-bold text-slate-500">Frequency</span>
						<span className="text-sm font-black text-slate-900">
							{stock.Frequency.toLocaleString()}x
						</span>
					</div>
				</div>
			</div>
		</div>
	);

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
							>
								<ExternalLink className="w-5 h-5" />
							</a>
							<button
								onClick={onClose}
								className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
					</div>

					<div className="p-6 flex-1">
						{/* Tabs */}
						<div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
							<button
								onClick={() => setActiveTab("overview")}
								className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "overview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
							>
								Overview
							</button>
							<button
								onClick={() => setActiveTab("fundamental")}
								className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "fundamental" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
							>
								Fundamental
							</button>
							<button
								onClick={() => setActiveTab("technical")}
								className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "technical" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
							>
								Technical
							</button>
						</div>

						{/* Content */}
						{activeTab === "overview" && (
							<div className="space-y-6">
								<AIInsights stock={stock} />
								<div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
									<h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4">
										Foreign Flow
									</h4>
									<div className="flex justify-between items-center">
										<span className="text-xs font-bold text-slate-500">
											Net Foreign Buy/Sell
										</span>
										<span
											className={`text-sm font-black ${stock.ForeignNet > 0 ? "text-emerald-600" : "text-rose-600"}`}
										>
											{formatBillions(stock.ForeignNet)} IDR
										</span>
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
