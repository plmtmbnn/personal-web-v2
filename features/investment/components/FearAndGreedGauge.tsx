"use client";

import { useState, useEffect, useMemo, useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, History, Clock, Activity } from "lucide-react";

interface FearAndGreedGaugeProps {
	score: number;
	rating: string;
	previousClose: number;
	previous1Week: number;
	previous1Month: number;
	previous1Year: number;
	historicalData: Array<{ x: number; y: number; rating: string }>;
}

function TrendVelocitySparkline({
	data,
}: {
	data: Array<{ x: number; y: number; rating: string }>;
}) {
	const gradientId = useId();
	const points = useMemo(() => {
		if (!data || data.length === 0) return [];
		const values = data.map((d) => d?.y ?? 0);
		const minVal = Math.min(...values);
		const maxVal = Math.max(...values);
		const range = maxVal - minVal || 10;
		const padY = 6;
		const h = 56 - padY * 2;
		const w = 240;

		return data.map((d, i) => {
			const x = (i / Math.max(data.length - 1, 1)) * w;
			const y = padY + h - ((d.y - minVal) / range) * h;
			return { x, y, val: d.y };
		});
	}, [data]);

	const { pathD, fillD } = useMemo(() => {
		if (points.length < 2) return { pathD: "", fillD: "" };
		let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
		for (let i = 0; i < points.length - 1; i++) {
			const p0 = points[i];
			const p1 = points[i + 1];
			const dx = p1.x - p0.x;
			const cp1x = p0.x + dx * 0.35;
			const cp1y = p0.y;
			const cp2x = p1.x - dx * 0.35;
			const cp2y = p1.y;
			d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
		}
		const last = points[points.length - 1];
		const fill = `${d} L ${last.x.toFixed(1)} 56 L ${points[0].x.toFixed(1)} 56 Z`;
		return { pathD: d, fillD: fill };
	}, [points]);

	if (points.length < 2) {
		return (
			<span className="text-[10px] font-bold text-slate-400">
				Trend data calibrating...
			</span>
		);
	}

	return (
		<svg
			viewBox="0 0 240 56"
			preserveAspectRatio="none"
			className="w-full h-full overflow-visible"
		>
			<defs>
				<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="rgb(79, 70, 229)" stopOpacity="0.18" />
					<stop offset="100%" stopColor="rgb(79, 70, 229)" stopOpacity="0.0" />
				</linearGradient>
			</defs>
			<path d={fillD} fill={`url(#${gradientId})`} />
			<path
				d={pathD}
				fill="none"
				stroke="rgb(79, 70, 229)"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
			/>
			{points.map((p, i) => (
				<circle
					key={i}
					cx={p.x}
					cy={p.y}
					r="2.5"
					fill="rgb(79, 70, 229)"
					stroke="#ffffff"
					strokeWidth="1.5"
				/>
			))}
		</svg>
	);
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

	// Extract the 7-day window for Trend Velocity
	const sevenDayData = useMemo(() => {
		return sortedData.length > 7 ? sortedData.slice(-7) : sortedData;
	}, [sortedData]);

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
			<div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-20">
				{/* Main Gauge Visual - RingProgress Component */}
				<div className="flex flex-col items-center flex-1">
					<div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-3 sm:mb-4">
						<RingProgress
							score={score}
							rating={rating}
							reduceMotion={Boolean(reduceMotion)}
						/>
					</div>

					<div className="text-center space-y-2.5 sm:space-y-3">
						<div className="flex items-center justify-center gap-3 sm:gap-4">
							<span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">
								{Math.round(score)}
							</span>
							<div
								className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium text-xs uppercase tracking-wider shadow-xs ${getRatingBadge(
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
				<div className="flex-1 w-full max-w-md space-y-5 sm:space-y-6">
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-slate-400">
							<History className="w-4 h-4" />
							<h4 className="text-[10px] font-black uppercase tracking-[0.3em]">
								Sentiment Timeline
							</h4>
						</div>

						<div className="grid grid-cols-2 gap-2.5 sm:gap-3">
							<div className="p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-100 transition-colors">
								<p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
									<Clock className="w-2 h-2" /> Previous Close
								</p>
								<p className="text-base sm:text-lg font-bold text-slate-700">
									{Math.round(previousClose)}
								</p>
							</div>
							<div className="p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-emerald-100 transition-colors">
								<p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
									<TrendingUp className="w-2 h-2" /> 1 Week Ago
								</p>
								<p className="text-base sm:text-lg font-bold text-slate-700">
									{Math.round(previous1Week)}
								</p>
							</div>
							<div className="p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-2xl">
								<p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">
									1 Month Ago
								</p>
								<p className="text-base sm:text-lg font-bold text-slate-700">
									{Math.round(previous1Month)}
								</p>
							</div>
							<div className="p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-2xl">
								<p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">
									1 Year Ago
								</p>
								<p className="text-base sm:text-lg font-bold text-slate-700">
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
						<div className="h-16 sm:h-20 w-full bg-slate-50/50 rounded-2xl border border-slate-100 p-2.5 sm:p-3 flex items-center justify-center">
							<TrendVelocitySparkline data={sevenDayData} />
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
