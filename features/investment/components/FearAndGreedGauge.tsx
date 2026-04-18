"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Activity, History, Clock } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface FearAndGreedGaugeProps {
	score: number;
	rating: string;
	previousClose: number;
	previous1Week: number;
	previous1Month: number;
	previous1Year: number;
	historicalData: Array<{ x: number; y: number; rating: string }>;
}

export default function FearAndGreedGauge({
	score,
	rating,
	previousClose,
	previous1Week,
	previous1Month,
	previous1Year,
	historicalData,
}: FearAndGreedGaugeProps) {
	// Sort historical data
	const sortedData = useMemo(() => {
		return [...historicalData].sort((a, b) => a.x - b.x);
	}, [historicalData]);

	const getRatingColor = (r: string) => {
		const lower = r.toLowerCase();
		if (lower.includes("extreme fear")) return "text-rose-600 bg-rose-50 border-rose-100";
		if (lower.includes("fear")) return "text-orange-600 bg-orange-50 border-orange-100";
		if (lower.includes("neutral")) return "text-amber-600 bg-amber-50 border-amber-100";
		if (lower.includes("extreme greed")) return "text-emerald-600 bg-emerald-50 border-emerald-100";
		if (lower.includes("greed")) return "text-green-600 bg-green-50 border-green-100";
		return "text-slate-600 bg-slate-50 border-slate-100";
	};

	const chartData = {
		labels: sortedData.map(d => ""),
		datasets: [
			{
				data: sortedData.map(d => d.y),
				fill: true,
				borderColor: 'rgb(79, 70, 229)',
				backgroundColor: 'rgba(79, 70, 229, 0.05)',
				tension: 0.4,
				pointRadius: 0,
				borderWidth: 2,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			tooltip: { enabled: false },
		},
		scales: {
			x: { display: false },
			y: { display: false },
		},
	};

	return (
		<div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
			{/* Main Gauge Visual */}
			<div className="flex flex-col items-center flex-1">
				<div className="relative w-72 h-36 overflow-hidden mb-8">
					<div className="absolute top-0 left-0 w-72 h-72 rounded-full border-[20px] border-slate-100" />
					<div className="absolute top-0 left-0 w-72 h-72 rounded-full border-[20px] border-transparent border-t-rose-500/20 border-l-rose-500/20 -rotate-45" />
					<div className="absolute top-0 left-0 w-72 h-72 rounded-full border-[20px] border-transparent border-t-emerald-500/20 border-r-emerald-500/20 rotate-45" />

					<motion.div
						initial={{ rotate: -90 }}
						animate={{ rotate: (score / 100) * 180 - 90 }}
						transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.5 }}
						className="absolute bottom-0 left-1/2 w-2 h-32 origin-bottom -translate-x-1/2 z-20"
					>
						<div className="w-full h-full bg-slate-900 rounded-full shadow-2xl relative">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 bg-slate-900 rounded-full -mt-2" />
						</div>
					</motion.div>

					<div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-12 h-12 bg-white border-4 border-slate-200 rounded-full z-30" />
				</div>

				<div className="text-center space-y-4">
					<div className="flex items-center justify-center gap-4">
						<span className="text-7xl font-black text-slate-900 tracking-tighter">
							{Math.round(score)}
						</span>
						<div className={`px-5 py-2.5 rounded-2xl border font-black text-[11px] uppercase tracking-[0.2em] shadow-sm ${getRatingColor(rating)}`}>
							{rating}
						</div>
					</div>
					<p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
						Unified Market Pulse
					</p>
				</div>
			</div>

			{/* Integrated History Panel */}
			<div className="flex-1 w-full max-w-md space-y-8">
				<div className="space-y-4">
					<div className="flex items-center gap-3 text-slate-400">
						<History className="w-4 h-4" />
						<h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Sentiment Timeline</h4>
					</div>
					
					<div className="grid grid-cols-2 gap-4">
						<div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-indigo-100 transition-colors">
							<p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
								<Clock className="w-2.5 h-2.5" /> Previous Close
							</p>
							<p className="text-xl font-black text-slate-700">{Math.round(previousClose)}</p>
						</div>
						<div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-emerald-100 transition-colors">
							<p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
								<TrendingUp className="w-2.5 h-2.5" /> 1 Week Ago
							</p>
							<p className="text-xl font-black text-slate-700">{Math.round(previous1Week)}</p>
						</div>
						<div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl">
							<p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">1 Month Ago</p>
							<p className="text-xl font-black text-slate-700">{Math.round(previous1Month)}</p>
						</div>
						<div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl">
							<p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">1 Year Ago</p>
							<p className="text-xl font-black text-slate-700">{Math.round(previous1Year)}</p>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3 text-slate-400">
							<Activity className="w-4 h-4" />
							<h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Trend Velocity</h4>
						</div>
						<span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">7D Window</span>
					</div>
					<div className="h-24 w-full bg-slate-50/50 rounded-3xl border border-slate-100 p-4">
						<Line data={chartData} options={chartOptions} />
					</div>
				</div>
			</div>
		</div>
	);
}
