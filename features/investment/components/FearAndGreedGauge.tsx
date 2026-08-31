"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, History, Clock, Activity } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy-load Chart.js for performance
const ChartWrapper = dynamic(() => import("./FearAndGreedChartWrapper"), {
	ssr: false,
	loading: () => (
		<div className="w-full h-24 flex items-center justify-center">
			<div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
		</div>
	),
});

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
	const reduceMotion = useReducedMotion();
	const [mounted, setMounted] = useState(false);

	// Effect to handle DOM readiness for SVG calculations
	useEffect(() => {
		setMounted(true);
	}, []);

	// Sort historical data
	const sortedData = useMemo(() => {
		return historicalData ? [...historicalData].sort((a, b) => a.x - b.x) : [];
	}, [historicalData]);

	// Get badge style for rating
	const getRatingBadge = (r: string) => {
		const lower = r.toLowerCase();
		if (lower.includes("extreme fear"))
			return "bg-rose-50 border-rose-100 text-rose-600";
		if (lower.includes("fear"))
			return "bg-orange-50 border-orange-100 text-orange-600";
		if (lower.includes("neutral"))
			return "bg-amber-50 border-amber-100 text-amber-600";
		if (lower.includes("extreme greed"))
			return "bg-emerald-50 border-emerald-100 text-emerald-600";
		if (lower.includes("greed"))
			return "bg-green-50 border-green-100 text-green-600";
		return "bg-slate-50 border-slate-100 text-slate-600";
	};

	const chartData = {
		labels: sortedData.map(() => ""),
		datasets: [
			{
				data: sortedData.map((d) => d?.y ?? 0),
				fill: true,
				borderColor: "rgb(79, 70, 229)",
				backgroundColor: "rgba(79, 70, 229, 0.05)",
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

	if (!mounted) {
		return (
			<div className="w-full h-[360px] flex items-center justify-center">
				<div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
			</div>
		);
	}

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
			animate={{ opacity: 1, scale: 1 }}
			className="w-full"
		>
			<div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
				{/* Main Gauge Visual - RingProgress Component */}
				<div className="flex flex-col items-center flex-1">
					<div className="relative w-64 h-64 flex items-center justify-center mb-8">
						<RingProgress
							score={score}
							rating={rating}
							reduceMotion={Boolean(reduceMotion)}
						/>
					</div>

					<div className="text-center space-y-3">
						<div className="flex items-center justify-center gap-4">
							<span className="text-5xl font-black text-slate-900 tracking-tighter">
								{Math.round(score)}
							</span>
							<div
								className={`px-4 py-2 rounded-xl font-medium text-xs uppercase tracking-wider shadow-sm ${getRatingBadge(
									rating,
								)} border`}
							>
								{rating}
							</div>
						</div>
						<p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em]">
							Unified Market Pulse
						</p>
					</div>
				</div>

				{/* Integrated History Panel */}
				<div className="flex-1 w-full max-w-md space-y-6">
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-slate-400">
							<History className="w-4 h-4" />
							<h4 className="text-[10px] font-black uppercase tracking-[0.3em]">
								Sentiment Timeline
							</h4>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-100 transition-colors">
								<p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
									<Clock className="w-2 h-2" /> Previous Close
								</p>
								<p className="text-lg font-bold text-slate-700">
									{Math.round(previousClose)}
								</p>
							</div>
							<div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-emerald-100 transition-colors">
								<p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
									<TrendingUp className="w-2 h-2" /> 1 Week Ago
								</p>
								<p className="text-lg font-bold text-slate-700">
									{Math.round(previous1Week)}
								</p>
							</div>
							<div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
								<p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">
									1 Month Ago
								</p>
								<p className="text-lg font-bold text-slate-700">
									{Math.round(previous1Month)}
								</p>
							</div>
							<div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
								<p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">
									1 Year Ago
								</p>
								<p className="text-lg font-bold text-slate-700">
									{Math.round(previous1Year)}
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-slate-400">
								<Activity className="w-4 h-4" />
								<h4 className="text-[10px] font-black uppercase tracking-[0.3em]">
									Trend Velocity
								</h4>
							</div>
							<span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">
								7D Window
							</span>
						</div>
						<div className="h-20 w-full bg-slate-50/50 rounded-2xl border border-slate-100 p-3">
							<ChartWrapper data={chartData} options={chartOptions} />
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

// ──────────────────────────────
// RingProgress - SVG Gauge Visualization
// ──────────────────────────────
function RingProgress({
	score,
	reduceMotion,
}: {
	score: number;
	rating?: string;
	reduceMotion: boolean;
}) {
	const radius = 24;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (score / 100) * circumference;

	// Color mapping for the progress stroke
	const getStrokeColor = (s: number): string => {
		if (s < 25) return "#f87171"; // rose-500
		if (s < 45) return "#f97316"; // orange-500
		if (s <= 55) return "#fbbf24"; // amber-500
		if (s <= 75) return "#34d399"; // emerald-500
		return "#2dd4bf"; // teal-500
	};

	return (
		<motion.svg
			initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{
				type: "spring",
				stiffness: 350,
				damping: 30,
			}}
			className="absolute transform -rotate-90"
			width="128"
			height="128"
			viewBox="0 0 128 128"
		>
			{/* Background Circle */}
			<circle
				className="text-slate-100"
				strokeWidth={48}
				fill="none"
				r={radius}
				cx={64}
				cy={64}
			/>

			{/* Progress Arc */}
			<motion.path
				d={`M ${64 + radius} ${64} A ${radius} ${radius} 0 1 1 ${64 - radius} ${64}`}
				className="stroke-current fill-none"
				style={{ stroke: getStrokeColor(score) }}
				strokeWidth={48}
				strokeLinecap="round"
				initial={{ strokeDashoffset: circumference }}
				animate={{ strokeDashoffset: strokeDashoffset }}
				transition={{
					type: "spring",
					stiffness: 300,
					damping: 25,
				}}
			/>

			{/* Center Dot */}
			<circle className="text-white" strokeWidth={4} r={4} cx={64} cy={64} />
		</motion.svg>
	);
}
