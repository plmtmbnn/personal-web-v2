"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Filler,
	Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Filler,
	Tooltip,
);

interface SentimentCardProps {
	title: string;
	score: number;
	rating: string;
	data: Array<{ x: number; y: number; rating: string }>;
	delay?: number;
}

// Color mapping for different sentiment levels
const CARD_COLORS = {
	rose: {
		base: "rgb(248, 113, 113)",
		tailwind: "rose",
		lightBg: "bg-rose-50",
		border: "border-rose-100",
		text: "text-rose-600",
	},
	orange: {
		base: "rgb(249, 115, 22)",
		tailwind: "orange",
		lightBg: "bg-orange-50",
		border: "border-orange-100",
		text: "text-orange-600",
	},
	amber: {
		base: "rgb(251, 191, 36)",
		tailwind: "amber",
		lightBg: "bg-amber-50",
		border: "border-amber-100",
		text: "text-amber-600",
	},
	emerald: {
		base: "rgb(52, 211, 153)",
		tailwind: "emerald",
		lightBg: "bg-emerald-50",
		border: "border-emerald-100",
		text: "text-emerald-600",
	},
	teal: {
		base: "rgb(45, 212, 191)",
		tailwind: "teal",
		lightBg: "bg-teal-50",
		border: "border-teal-100",
		text: "text-teal-600",
	},
};

export default function SentimentCard({
	title,
	score,
	rating,
	data,
	delay = 0,
}: SentimentCardProps) {
	const reduceMotion = useReducedMotion();
	const sortedData = useMemo(() => {
		return data ? [...data].sort((a, b) => a.x - b.x) : [];
	}, [data]);

	// Determine card accent color based on score
	const getCardColorKey = (s: number): keyof typeof CARD_COLORS => {
		if (s < 25) return "rose";
		if (s < 45) return "orange";
		if (s <= 55) return "amber";
		if (s <= 75) return "emerald";
		return "teal";
	};

	const colorKey = getCardColorKey(score);
	const color = CARD_COLORS[colorKey];

	// Build chart data with dynamic colors
	const chartData = {
		labels: sortedData.map(() => ""),
		datasets: [
			{
				data: sortedData.map((d) => d?.y ?? 0),
				fill: true,
				borderColor: color.base,
				backgroundColor: color.base
					.replace("rgb", "rgba")
					.replace(")", ", 0.05)"),
				tension: 0.4,
				pointRadius: 0,
				borderWidth: 1.5,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			tooltip: {
				enabled: true,
				backgroundColor: "#1e293b",
				padding: 8,
				titleFont: { size: 0 },
				bodyFont: { size: 9, weight: 700 },
				callbacks: {
					label: (context: any) => {
						const pointRating = sortedData[context.dataIndex]?.rating;
						return ` ${context.parsed.y.toFixed(1)} (${pointRating || ""})`;
					},
				},
			},
		},
		scales: {
			x: { display: false },
			y: { display: false },
		},
	};

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

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, type: "spring", stiffness: 260, damping: 16 }}
			className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all group cursor-pointer active:scale-[0.98]"
		>
			<div className="p-4 space-y-3">
				<div>
					<div className="flex items-start justify-between mb-2">
						<h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-indigo-600 transition-colors leading-tight">
							{title}
						</h4>
						<div
							className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${getRatingBadge(
								rating,
							)} `}
						>
							{rating}
						</div>
					</div>

					<div className="flex items-end gap-1">
						<span className="text-xl font-bold text-slate-900 tracking-tighter">
							{score.toFixed(1)}
						</span>
					</div>
				</div>

				{/* Micro-chart container with hover effect */}
				<div className="relative h-16 w-full opacity-70 group-hover:opacity-100 transition-opacity duration-300">
					<Line data={chartData} options={chartOptions} />
				</div>
			</div>
		</motion.div>
	);
}
