"use client";

import StockTicker from "@/components/StockTicker";
import {
	TrendingUp,
	PieChart,
	Activity,
	DollarSign,
	ArrowUpRight,
	ArrowDownLeft,
	LayoutDashboard,
	Wallet,
	BarChart3,
} from "lucide-react";
import PinGuard from "@/components/auth/PinGuard";
import { motion } from "framer-motion";

export default function InvestmentPage() {
	return (
		<PinGuard>
			<main className="min-h-screen bg-background relative overflow-hidden pb-32">
				{/* Aesthetic Background Ambience */}
				<div className="absolute inset-0 pointer-events-none -z-10">
					<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
					<div
						className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"
						style={{ animationDelay: "2s" }}
					/>
				</div>

				<StockTicker />

				<div className="max-w-7xl mx-auto px-6 py-16">
					{/* Header Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12"
					>
						<div className="space-y-4">
							<div className="flex items-center gap-3 text-blue-500 mb-2">
								<TrendingUp className="w-6 h-6" />
								<span className="text-[10px] font-black uppercase tracking-[0.4em]">
									Equity & Growth
								</span>
							</div>
							<h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground">
								Investment <span className="gradient-text">Hub</span>
							</h1>
							<p className="text-muted-foreground text-lg max-w-lg font-medium leading-relaxed">
								Private portfolio analytics and real-time market data
								orchestration.
							</p>
						</div>

						<div className="flex gap-4 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
							<div className="px-4 py-2 text-center">
								<p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
									Status
								</p>
								<div className="flex items-center gap-2">
									<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
									<span className="text-xs font-bold text-foreground">
										Market Open
									</span>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Dashboard Stats Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
						{[
							{
								label: "Portfolio Value",
								value: "$124,500.00",
								change: "+12.5%",
								isPositive: true,
								icon: Wallet,
								color: "text-blue-400",
							},
							{
								label: "Monthly Returns",
								value: "$4,230.15",
								change: "+2.3%",
								isPositive: true,
								icon: BarChart3,
								color: "text-purple-400",
							},
							{
								label: "Total Profit",
								value: "$32,100.40",
								change: "-1.2%",
								isPositive: false,
								icon: DollarSign,
								color: "text-emerald-400",
							},
						].map((stat, i) => (
							<motion.div
								key={stat.label}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.1 }}
								className="group relative"
							>
								<div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
								<div className="relative glass-card p-8 rounded-[2.5rem] border-2 border-white/5 bg-white/5 backdrop-blur-xl hover:border-accent/30 transition-all duration-500 shadow-2xl">
									<div className="flex justify-between items-start mb-8">
										<div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-muted-foreground shadow-inner group-hover:text-foreground transition-colors">
											<stat.icon className="w-6 h-6" />
										</div>
										<div
											className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
												stat.isPositive
													? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
													: "bg-rose-500/10 text-rose-500 border-rose-500/20"
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
									<p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-2">
										{stat.label}
									</p>
									<h3 className="text-3xl font-black text-foreground tracking-tighter">
										{stat.value}
									</h3>
								</div>
							</motion.div>
						))}
					</div>

					{/* Specialized Analysis Sections */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.4 }}
							className="glass-card p-10 rounded-[3rem] border-2 border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl"
						>
							<h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground mb-10 flex items-center gap-3">
								<Activity className="w-4 h-4 text-blue-500" />
								Market Sentiment
							</h3>
							<div className="h-64 flex flex-col items-center justify-center border border-white/5 rounded-[2rem] bg-black/5 relative overflow-hidden group">
								{/* Decorative Visual Skeleton */}
								<div className="absolute inset-0 flex items-end justify-around px-8 pb-8 opacity-20 group-hover:opacity-40 transition-opacity">
									{[40, 70, 45, 90, 65, 80, 30].map((h, i) => (
										<motion.div
											key={String(i)}
											initial={{ height: 0 }}
											animate={{ height: `${h}%` }}
											transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
											className="w-4 bg-blue-500 rounded-full"
										/>
									))}
								</div>
								<p className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 text-center px-10">
									Dynamic Visualization Engine <br /> Under Construction
								</p>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.5 }}
							className="glass-card p-10 rounded-[3rem] border-2 border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl"
						>
							<h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground mb-10 flex items-center gap-3">
								<PieChart className="w-4 h-4 text-purple-500" />
								Asset Allocation
							</h3>
							<div className="h-64 flex items-center justify-center border border-white/5 rounded-[2rem] bg-black/5 relative overflow-hidden group">
								{/* Decorative Visual Skeleton */}
								<div className="absolute w-40 h-40 rounded-full border-[12px] border-purple-500/10 flex items-center justify-center opacity-40 group-hover:scale-110 transition-transform duration-700">
									<div className="w-32 h-32 rounded-full border-[12px] border-purple-500/20" />
								</div>
								<p className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 text-center px-10">
									Portfolio Distribution Logic <br /> Integrating
								</p>
							</div>
						</motion.div>
					</div>
				</div>
			</main>
		</PinGuard>
	);
}
