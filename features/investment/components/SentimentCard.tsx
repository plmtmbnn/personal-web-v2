"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
import { Info } from "lucide-react";

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
	description?: string;
	delay?: number;
}

const FACTOR_DESCRIPTIONS: Record<string, string> = {
	"Market Momentum (S&P 500)":
		"S&P 500 vs. its 125-day moving average. Trading above signals bullish momentum.",
	"Market Momentum (S&P 125)":
		"125-day rate of change in the S&P 500 gauging multi-month trend strength.",
	"Stock Price Strength":
		"Net ratio of NYSE stocks hitting new 52-week highs versus new 52-week lows.",
	"Stock Price Breadth":
		"Trading volume in advancing vs. declining NYSE stocks via the McClellan Oscillator.",
	"Put and Call Options":
		"CBOE 5-day put/call ratio. High put volume signals fear; high call volume reflects bullish bets.",
	"Market Volatility (VIX)":
		"50-day moving average of the VIX measuring market anxiety and expected 30-day volatility.",
	"Junk Bond Demand":
		"Yield spread between junk and investment-grade bonds. Tighter spreads indicate risk tolerance.",
	"Safe Haven Demand":
		"Difference between 20-day stock returns and treasury bond returns. Stocks beating bonds signals risk-on.",
};

function FactorTooltip({ text }: { text: string }) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const handlePointerDown = (e: PointerEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("pointerdown", handlePointerDown);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [isOpen]);

	return (
		<span
			ref={containerRef}
			className="group/tip relative inline-flex items-center ml-1 align-middle"
			onMouseEnter={() => setIsOpen(true)}
			onMouseLeave={() => setIsOpen(false)}
			onClick={(e) => e.stopPropagation()}
		>
			<button
				type="button"
				aria-label="Factor information"
				aria-expanded={isOpen}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					setIsOpen((prev) => !prev);
				}}
				className="p-1 -m-1 rounded-md text-slate-400 group-hover/tip:text-slate-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 transition-colors flex items-center justify-center cursor-pointer touch-manipulation"
			>
				<Info className="w-3 h-3 shrink-0" />
			</button>
			<span
				role="tooltip"
				className={`absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 w-48 sm:w-56 p-2.5 bg-slate-900 text-white text-[11px] font-medium rounded-xl transition-all duration-150 z-50 shadow-xl border border-slate-800 leading-snug text-left normal-case tracking-normal ${
					isOpen
						? "opacity-100 pointer-events-auto visible scale-100"
						: "opacity-0 pointer-events-none invisible scale-95"
				}`}
			>
				{text}
				<span className="absolute top-full left-3 sm:left-1/2 sm:-translate-x-1/2 border-4 border-transparent border-t-slate-900" />
			</span>
		</span>
	);
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
	description,
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
					<div className="flex items-start justify-between gap-2 mb-2">
						<h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-indigo-600 transition-colors leading-tight flex items-center">
							<span>{title}</span>
							<FactorTooltip
								text={
									description ||
									FACTOR_DESCRIPTIONS[title] ||
									"Multi-factor market indicator quantifying investor positioning."
								}
							/>
						</h4>
						<div
							className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border shrink-0 ${getRatingBadge(
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
