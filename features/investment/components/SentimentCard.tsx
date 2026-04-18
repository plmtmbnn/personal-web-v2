"use client";

import React, { useMemo } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface SentimentCardProps {
	title: string;
	score: number;
	rating: string;
	data: Array<{ x: number; y: number; rating: string }>;
	delay?: number;
}

export default function SentimentCard({ title, score, rating, data, delay = 0 }: SentimentCardProps) {
	const sortedData = useMemo(() => {
		return [...data].sort((a, b) => a.x - b.x);
	}, [data]);

	const chartData = {
		labels: sortedData.map(d => ""),
		datasets: [
			{
				data: sortedData.map(d => d.y),
				fill: true,
				borderColor: 'rgb(99, 102, 241)',
				backgroundColor: 'rgba(99, 102, 241, 0.03)',
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
				backgroundColor: '#1e293b',
				padding: 8,
				titleFont: { size: 0 },
				bodyFont: { size: 9, weight: 'bold' as any },
				callbacks: {
					label: (context: any) => {
						const pointRating = sortedData[context.dataIndex]?.rating;
						return ` ${context.parsed.y} (${pointRating})`;
					}
				}
			},
		},
		scales: {
			x: { display: false },
			y: { display: false },
		},
	};

	const getRatingColor = (r: string) => {
		const lower = r.toLowerCase();
		if (lower.includes("extreme fear")) return "text-rose-600 bg-rose-50 border-rose-100";
		if (lower.includes("fear")) return "text-orange-600 bg-orange-50 border-orange-100";
		if (lower.includes("neutral")) return "text-amber-600 bg-amber-50 border-amber-100";
		if (lower.includes("extreme greed")) return "text-emerald-600 bg-emerald-50 border-emerald-100";
		if (lower.includes("greed")) return "text-green-600 bg-green-50 border-green-100";
		return "text-slate-600 bg-slate-50 border-slate-100";
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay }}
			className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all group"
		>
			<div className="space-y-3">
				<div>
					<h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors leading-tight mb-2">
						{title}
					</h4>
					<div className="flex items-center justify-between gap-2">
						<span className="text-lg font-black text-slate-900 tracking-tighter">
							{Math.round(score * 10) / 10}
						</span>
						<div className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${getRatingColor(rating)}`}>
							{rating}
						</div>
					</div>
				</div>

				<div className="h-8 w-full relative opacity-60 group-hover:opacity-100 transition-opacity">
					<Line data={chartData} options={chartOptions} />
				</div>
			</div>
		</motion.div>
	);
}
