"use client";

import React, { useCallback, useEffect, useState } from "react";
import StockTicker from "@/features/shared/components/StockTicker";
import {
	TrendingUp,
	ChevronRight,
	Loader2,
	RefreshCw,
	Layers,
	Zap,
} from "lucide-react";
import PinGuard from "@/features/auth/PinGuard";
import { motion } from "framer-motion";
import Link from "next/link";
import { getFearAndGreedData } from "@/features/investment/actions";
import type { FearAndGreedData } from "@/features/investment/types";
import FearAndGreedGauge from "@/features/investment/components/FearAndGreedGauge";
import SentimentCard from "@/features/investment/components/SentimentCard";

export default function InvestmentPage() {
	const [marketData, setMarketData] = useState<FearAndGreedData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await getFearAndGreedData();
			if (data) {
				setMarketData(data);
			} else {
				setError("Failed to synchronize market data");
			}
		} catch (_err) {
			setError("Operational connection failure");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Map sub-indices for visualization
	const subIndices = marketData
		? [
				{
					title: "Market Momentum (S&P 500)",
					data: marketData.market_momentum_sp500,
				},
				{
					title: "Market Momentum (S&P 125)",
					data: marketData.market_momentum_sp125,
				},
				{
					title: "Stock Price Strength",
					data: marketData.stock_price_strength,
				},
				{ title: "Stock Price Breadth", data: marketData.stock_price_breadth },
				{ title: "Put and Call Options", data: marketData.put_call_options },
				{
					title: "Market Volatility (VIX)",
					data: marketData.market_volatility_vix,
				},
				{ title: "Junk Bond Demand", data: marketData.junk_bond_demand },
				{ title: "Safe Haven Demand", data: marketData.safe_haven_demand },
			]
		: [];

	return (
		<PinGuard>
			<main className="min-h-screen bg-slate-50/50 pb-24">
				{/* Structural Header */}
				<div className="bg-white border-b border-slate-200 mb-8 pt-12">
					<div className="max-w-7xl mx-auto px-6 py-10">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em]">
									<TrendingUp className="w-3.5 h-3.5" />
									Market Intelligence
								</div>
								<h1 className="text-4xl font-black text-slate-900 tracking-tight">
									Fear & Greed Index
								</h1>
								<div className="flex items-center gap-2 text-xs font-medium text-slate-400">
									<Link
										href="/"
										className="hover:text-indigo-600 transition-colors"
									>
										Home
									</Link>
									<ChevronRight className="w-3 h-3 opacity-50" />
									<span className="text-slate-900">Sentiment Engine</span>
								</div>
							</div>

							<div className="flex gap-4 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
								<div className="px-4 py-2 text-center border-r border-slate-200 last:border-0">
									<p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
										System Status
									</p>
									<div className="flex items-center justify-center gap-2">
										<div
											className={`w-1.5 h-1.5 rounded-full ${isLoading ? "bg-slate-300" : "bg-emerald-500 animate-pulse"}`}
										/>
										<span className="text-xs font-black text-slate-900 uppercase">
											{isLoading ? "Syncing" : "Connected"}
										</span>
									</div>
								</div>
								<button
									onClick={fetchData}
									disabled={isLoading}
									className="p-2 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-30"
								>
									<RefreshCw
										className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
									/>
								</button>
							</div>
						</div>
					</div>
				</div>

				<StockTicker />

				<div className="max-w-7xl mx-auto px-6 py-8">
					{/* Primary Visualization - Enhanced Master Gauge */}
					<div className="bg-white p-10 lg:p-12 rounded-[3rem] border border-slate-200 shadow-sm mb-12">
						<h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10 flex items-center gap-3">
							<Zap className="w-4 h-4 text-amber-500" />
							Strategic Sentiment Analysis
						</h3>

						<div className="min-h-[360px] flex items-center justify-center">
							{isLoading ? (
								<div className="flex flex-col items-center gap-4">
									<Loader2 className="w-10 h-10 text-slate-200 animate-spin" />
									<p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
										Calibrating Pulse...
									</p>
								</div>
							) : error ? (
								<div className="text-center p-8 bg-rose-50 rounded-[2rem] border border-rose-100 max-w-md">
									<p className="text-sm font-bold text-rose-600 uppercase tracking-widest">
										{error}
									</p>
									<button
										onClick={fetchData}
										className="mt-6 text-[10px] font-black uppercase text-rose-700 underline underline-offset-4"
									>
										Force Re-Synchronization
									</button>
								</div>
							) : (
								marketData && (
									<motion.div
										initial={{ opacity: 0, scale: 0.98 }}
										animate={{ opacity: 1, scale: 1 }}
										className="w-full"
									>
										<FearAndGreedGauge
											score={marketData.fear_and_greed.score}
											rating={marketData.fear_and_greed.rating}
											previousClose={marketData.fear_and_greed.previous_close}
											previous1Week={marketData.fear_and_greed.previous_1_week}
											previous1Month={
												marketData.fear_and_greed.previous_1_month
											}
											previous1Year={marketData.fear_and_greed.previous_1_year}
											historicalData={marketData.fear_and_greed_historical.data}
										/>
									</motion.div>
								)
							)}
						</div>
					</div>

					{/* Componentized Factor Breakdown - High Density */}
					<div className="space-y-8">
						<div className="flex items-center gap-6">
							<div className="h-px flex-1 bg-slate-200" />
							<h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 flex items-center gap-3">
								<Layers className="w-4 h-4" />
								Factor Analysis Matrix
							</h2>
							<div className="h-px flex-1 bg-slate-200" />
						</div>

						{isLoading ? (
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{[...Array(8)].map((_, i) => (
									<div
										key={String(i)}
										className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse"
									/>
								))}
							</div>
						) : (
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{subIndices.map((index, i) => (
									<SentimentCard
										key={index.title}
										title={index.title}
										score={index.data.score}
										rating={index.data.rating}
										data={index.data.data}
										delay={i * 0.03}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</main>
		</PinGuard>
	);
}
