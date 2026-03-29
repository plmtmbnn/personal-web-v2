"use client";

import React from "react";
import StockTicker from "@/components/StockTicker";
import {
	TrendingUp,
	PieChart,
	Activity,
	DollarSign,
	ArrowUpRight,
	ArrowDownLeft,
} from "lucide-react";
import PinGuard from "@/components/auth/PinGuard";

export default function InvestmentPage() {
	return (
		<PinGuard>
			<div className="min-h-screen bg-slate-50 relative overflow-hidden pb-24">
				{/* Background elements */}
				<div className="absolute inset-0 -z-10 overflow-hidden">
					<div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
					<div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
				</div>

				<StockTicker />

				<div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
					{/* Header */}
					<div className="mb-12">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
								<TrendingUp className="w-8 h-8" />
							</div>
							<div>
								<h1 className="text-4xl font-bold text-slate-900 tracking-tight">
									Investment Hub
								</h1>
								<p className="text-slate-500 font-medium">
									Real-time market insights and portfolio tracking
								</p>
							</div>
						</div>
					</div>

					{/* Dashboard Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
						{[
							{
								label: "Portfolio Value",
								value: "$124,500.00",
								change: "+12.5%",
								isPositive: true,
								icon: PieChart,
							},
							{
								label: "Monthly Returns",
								value: "$4,230.15",
								change: "+2.3%",
								isPositive: true,
								icon: Activity,
							},
							{
								label: "Total Profit",
								value: "$32,100.40",
								change: "-1.2%",
								isPositive: false,
								icon: DollarSign,
							},
						].map((stat, i) => (
							<div
								key={Number(i)}
								className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
							>
								<div className="flex justify-between items-start mb-4">
									<div className="p-2 bg-slate-50 rounded-xl text-slate-600">
										<stat.icon className="w-6 h-6" />
									</div>
									<div
										className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg ${
											stat.isPositive
												? "bg-emerald-50 text-emerald-600"
												: "bg-rose-50 text-rose-600"
										}`}
									>
										{stat.isPositive ? (
											<ArrowUpRight className="w-4 h-4" />
										) : (
											<ArrowDownLeft className="w-4 h-4" />
										)}
										{stat.change}
									</div>
								</div>
								<p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">
									{stat.label}
								</p>
								<h3 className="text-3xl font-bold text-slate-900">
									{stat.value}
								</h3>
							</div>
						))}
					</div>

					{/* Market Analysis Placeholder */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
							<h3 className="text-xl font-bold mb-6 flex items-center gap-2">
								<Activity className="w-5 h-5 text-blue-600" />
								Market Sentiment
							</h3>
							<div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50">
								<p className="text-slate-400 font-medium">
									Market Trends Visualization Coming Soon
								</p>
							</div>
						</div>

						<div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
							<h3 className="text-xl font-bold mb-6 flex items-center gap-2">
								<PieChart className="w-5 h-5 text-indigo-600" />
								Asset Allocation
							</h3>
							<div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50">
								<p className="text-slate-400 font-medium">
									Portfolio Distribution Chart Coming Soon
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</PinGuard>
	);
}
