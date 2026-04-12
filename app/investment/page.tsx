"use client";

import StockTicker from "@/features/shared/components/StockTicker";
import {
	TrendingUp,
	PieChart,
	Activity,
	DollarSign,
	ArrowUpRight,
	ArrowDownLeft,
	Wallet,
	BarChart3,
	ChevronRight,
} from "lucide-react";
import PinGuard from "@/features/auth/PinGuard";
import { motion } from "framer-motion";
import Link from "next/link";

export default function InvestmentPage() {
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
									Portfolio Orchestration
								</div>
								<h1 className="text-4xl font-black text-slate-900 tracking-tight">
									Investment Hub
								</h1>
								<div className="flex items-center gap-2 text-xs font-medium text-slate-400">
									<Link
										href="/"
										className="hover:text-indigo-600 transition-colors"
									>
										Home
									</Link>
									<ChevronRight className="w-3 h-3 opacity-50" />
									<span className="text-slate-900">Capital Management</span>
								</div>
							</div>

							<div className="flex gap-4 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
								<div className="px-4 py-2 text-center border-r border-slate-200 last:border-0">
									<p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
										Market Status
									</p>
									<div className="flex items-center justify-center gap-2">
										<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
										<span className="text-xs font-black text-slate-900 uppercase">
											Live
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<StockTicker />

				<div className="max-w-7xl mx-auto px-6 py-8">
					{/* Dashboard Stats Grid - Now Solid Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
						{[
							{
								label: "Portfolio Value",
								value: "$124,500.00",
								change: "+12.5%",
								isPositive: true,
								icon: Wallet,
								color: "text-blue-600",
								bg: "bg-blue-50",
							},
							{
								label: "Monthly Returns",
								value: "$4,230.15",
								change: "+2.3%",
								isPositive: true,
								icon: BarChart3,
								color: "text-indigo-600",
								bg: "bg-indigo-50",
							},
							{
								label: "Total Profit",
								value: "$32,100.40",
								change: "-1.2%",
								isPositive: false,
								icon: DollarSign,
								color: "text-emerald-600",
								bg: "bg-emerald-50",
							},
						].map((stat, i) => (
							<motion.div
								key={stat.label}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.1 }}
								className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md group"
							>
								<div className="flex justify-between items-start mb-8">
									<div
										className={`p-4 ${stat.bg} rounded-2xl border border-transparent group-hover:border-white/50 transition-all shadow-sm`}
									>
										<stat.icon className={`w-6 h-6 ${stat.color}`} />
									</div>
									<div
										className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
											stat.isPositive
												? "bg-emerald-50 text-emerald-700 border-emerald-100"
												: "bg-rose-50 text-rose-700 border-rose-100"
										}`}
									>
										{stat.isPositive ? (
											<ArrowUpRight className="w-3.5 h-3.5" />
										) : (
											<ArrowDownLeft className="w-3.5 h-3.5" />
										)}
										{stat.change}
									</div>
								</div>
								<p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
									{stat.label}
								</p>
								<h3 className="text-3xl font-black text-slate-900 tracking-tighter">
									{stat.value}
								</h3>
							</motion.div>
						))}
					</div>

					{/* Specialized Analysis Sections - High Contrast */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
							<h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10 flex items-center gap-3">
								<Activity className="w-4 h-4 text-blue-600" />
								Market Sentiment
							</h3>
							<div className="h-64 flex flex-col items-center justify-center border border-slate-100 rounded-3xl bg-slate-50/50 relative overflow-hidden group">
								<div className="absolute inset-0 flex items-end justify-around px-10 pb-10 opacity-30 group-hover:opacity-50 transition-opacity">
									{[40, 70, 45, 90, 65, 80, 30].map((h, i) => (
										<motion.div
											key={String(i)}
											initial={{ height: 0 }}
											animate={{ height: `${h}%` }}
											transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
											className="w-4 bg-blue-600/20 rounded-full"
										/>
									))}
								</div>
								<p className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 text-center px-10 leading-loose">
									Dynamic Visualization Engine <br /> Synchronizing...
								</p>
							</div>
						</div>

						<div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
							<h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10 flex items-center gap-3">
								<PieChart className="w-4 h-4 text-indigo-600" />
								Asset Allocation
							</h3>
							<div className="h-64 flex items-center justify-center border border-slate-100 rounded-3xl bg-slate-50/50 relative overflow-hidden group">
								<div className="absolute w-40 h-40 rounded-full border-[12px] border-indigo-600/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
									<div className="w-32 h-32 rounded-full border-[12px] border-indigo-600/10" />
								</div>
								<p className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 text-center px-10 leading-loose">
									Portfolio Distribution Logic <br /> Processing...
								</p>
							</div>
						</div>
					</div>
				</div>
			</main>
		</PinGuard>
	);
}
