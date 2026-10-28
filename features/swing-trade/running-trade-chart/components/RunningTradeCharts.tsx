"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Users } from "lucide-react";
import type { RunningTradeChartData } from "../types";

interface RunningTradeChartsProps {
	data: RunningTradeChartData;
	symbol: string;
}

const BROKER_PALETTE = [
	"#0284c7", // Sky
	"#10b981", // Emerald
	"#f59e0b", // Amber
	"#6366f1", // Indigo
	"#ec4899", // Pink
	"#8b5cf6", // Purple
	"#14b8a6", // Teal
	"#f43f5e", // Rose
	"#84cc16", // Lime
	"#e11d48", // Crimson
];

function parseNum(val: unknown): number {
	if (typeof val === "number") return Number.isFinite(val) ? val : 0;
	if (typeof val === "string") {
		const cleaned = val.replace(/[^0-9.-]/g, "");
		const n = Number.parseFloat(cleaned);
		return Number.isFinite(n) ? n : 0;
	}
	return 0;
}

export default function RunningTradeCharts({
	data,
	symbol,
}: RunningTradeChartsProps) {
	const [Recharts, setRecharts] = useState<Record<string, any> | null>(null);
	const [selectedBrokers, setSelectedBrokers] = useState<Set<string>>(
		new Set(),
	);

	useEffect(() => {
		import("recharts").then((mod) => setRecharts(mod));
	}, []);

	// Collect unique list of all broker codes across charts
	const allBrokers = useMemo(() => {
		const set = new Set<string>();
		if (Array.isArray(data.broker_chart_data)) {
			for (const group of data.broker_chart_data) {
				if (Array.isArray(group.brokers)) {
					for (const b of group.brokers) set.add(b);
				}
				if (Array.isArray(group.charts)) {
					for (const c of group.charts) {
						if (c.broker_code) set.add(c.broker_code);
					}
				}
			}
		}
		return Array.from(set);
	}, [data.broker_chart_data]);

	// Initialize selected brokers with top 5 or all if <= 5
	useEffect(() => {
		if (allBrokers.length > 0 && selectedBrokers.size === 0) {
			setSelectedBrokers(new Set(allBrokers.slice(0, 6)));
		}
	}, [allBrokers, selectedBrokers.size]);

	const toggleBroker = (code: string) => {
		setSelectedBrokers((prev) => {
			const next = new Set(prev);
			if (next.has(code)) {
				if (next.size > 1) next.delete(code);
			} else {
				next.add(code);
			}
			return next;
		});
	};

	const toggleAllBrokers = () => {
		if (selectedBrokers.size === allBrokers.length) {
			setSelectedBrokers(new Set(allBrokers.slice(0, 3)));
		} else {
			setSelectedBrokers(new Set(allBrokers));
		}
	};

	// 1. Process Price Chart Data
	const pricePoints = useMemo(() => {
		if (!Array.isArray(data.price_chart_data)) return [];
		return data.price_chart_data.map((p) => ({
			dateTime: p.datetime_label || `${p.date} ${p.time}`.trim(),
			date: p.date,
			time: p.time,
			close: parseNum(p.value?.raw),
			closeFormatted: p.value?.formatted || "0",
			open: p.open ? parseNum(p.open.raw) : null,
			high: p.high ? parseNum(p.high.raw) : null,
			low: p.low ? parseNum(p.low.raw) : null,
		}));
	}, [data.price_chart_data]);

	// 2. Process Multi-Broker Chart Data
	const brokerPoints = useMemo(() => {
		const pointsMap = new Map<string, Record<string, any>>();

		if (Array.isArray(data.broker_chart_data)) {
			for (const group of data.broker_chart_data) {
				if (Array.isArray(group.charts)) {
					for (const item of group.charts) {
						const code = item.broker_code;
						if (!code || !Array.isArray(item.chart)) continue;

						for (const pt of item.chart) {
							const key = pt.datetime_label || `${pt.date} ${pt.time}`.trim();
							if (!key) continue;

							const curr = pointsMap.get(key) || { dateTime: key };
							curr[code] = parseNum(pt.value?.raw);
							curr[`${code}_formatted`] = pt.value?.formatted || "";
							pointsMap.set(key, curr);
						}
					}
				}
			}
		}

		return Array.from(pointsMap.values()).sort((a, b) =>
			String(a.dateTime).localeCompare(String(b.dateTime)),
		);
	}, [data.broker_chart_data]);

	if (!Recharts) {
		return (
			<div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex items-center justify-center min-h-[300px]">
				<span className="text-xs font-semibold text-slate-500 animate-pulse">
					Loading chart telemetry...
				</span>
			</div>
		);
	}

	const {
		ResponsiveContainer,
		LineChart,
		Line,
		XAxis,
		YAxis,
		Tooltip,
		CartesianGrid,
		Legend,
	} = Recharts;

	const pricesList = pricePoints
		.map((d) => d.close)
		.filter((p) => p !== null && p > 0);
	const minPrice = pricesList.length > 0 ? Math.min(...pricesList) : 0;
	const maxPrice = pricesList.length > 0 ? Math.max(...pricesList) : 100;
	const padding = Math.max(1, Math.round((maxPrice - minPrice) * 0.05));
	const priceDomain = [
		Math.max(0, minPrice - padding),
		Math.round(maxPrice + padding),
	];

	return (
		<div className="space-y-6">
			{/* Top Chart: Price Action */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
							<TrendingUp className="w-4 h-4" aria-hidden />
						</div>
						<h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
							Price Action Trend ({symbol})
						</h3>
					</div>
					<div className="flex items-center gap-3 text-xs font-mono font-medium text-slate-500">
						<span>{pricePoints.length} points plotted</span>
					</div>
				</div>

				<div className="w-full h-[300px] sm:h-[340px]">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={pricePoints}
							margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="#f1f5f9"
								vertical={false}
							/>
							<XAxis
								dataKey="dateTime"
								tick={{ fontSize: 10, fill: "#64748b" }}
								tickFormatter={(val: string) => {
									const parts = val.split(" ");
									return parts.length >= 2
										? `${parts[0].slice(5)} ${parts[1]}`
										: val;
								}}
								interval="preserveStartEnd"
								minTickGap={40}
							/>
							<YAxis
								domain={priceDomain}
								tick={{ fontSize: 10, fill: "#0f172a", fontWeight: "bold" }}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "#ffffff",
									borderColor: "#e2e8f0",
									borderRadius: "1rem",
									boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
									fontSize: "11px",
								}}
								labelFormatter={(label: string) => `Timestamp: ${label}`}
							/>
							<Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
							<Line
								type="monotone"
								dataKey="close"
								name="Close Price"
								stroke="#0f172a"
								strokeWidth={2}
								dot={false}
								activeDot={{ r: 4 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Bottom Chart: Multi-Broker Running Flow */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700">
							<Users className="w-4 h-4" aria-hidden />
						</div>
						<h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
							Broker Flow Accumulation
						</h3>
					</div>

					{/* Broker Selection Pill Filter */}
					{allBrokers.length > 0 && (
						<div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
							<button
								type="button"
								onClick={toggleAllBrokers}
								className="min-h-9 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 transition-colors cursor-pointer"
							>
								{selectedBrokers.size === allBrokers.length
									? "Show Fewer"
									: "Show All"}
							</button>
							{allBrokers.map((code, idx) => {
								const active = selectedBrokers.has(code);
								const color = BROKER_PALETTE[idx % BROKER_PALETTE.length];
								return (
									<button
										key={code}
										type="button"
										onClick={() => toggleBroker(code)}
										style={{
											borderColor: active ? color : undefined,
											backgroundColor: active ? `${color}15` : undefined,
											color: active ? color : undefined,
										}}
										className={`min-h-9 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
											active
												? "border-current"
												: "border-slate-200 bg-white text-slate-500 hover:text-slate-800"
										}`}
									>
										{code}
									</button>
								);
							})}
						</div>
					)}
				</div>

				<div className="w-full h-[320px] sm:h-[380px]">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={brokerPoints}
							margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="#f1f5f9"
								vertical={false}
							/>
							<XAxis
								dataKey="dateTime"
								tick={{ fontSize: 10, fill: "#64748b" }}
								tickFormatter={(val: string) => {
									const parts = val.split(" ");
									return parts.length >= 2
										? `${parts[0].slice(5)} ${parts[1]}`
										: val;
								}}
								minTickGap={40}
							/>
							<YAxis
								tick={{ fontSize: 10, fill: "#64748b" }}
								tickFormatter={(val: number) => {
									if (Math.abs(val) >= 1_000_000_000)
										return `${(val / 1_000_000_000).toFixed(1)}B`;
									if (Math.abs(val) >= 1_000_000)
										return `${(val / 1_000_000).toFixed(0)}M`;
									return String(val);
								}}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "#ffffff",
									borderColor: "#e2e8f0",
									borderRadius: "1rem",
									boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
									fontSize: "11px",
								}}
								labelFormatter={(label: string) => `Interval: ${label}`}
							/>
							<Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
							{allBrokers
								.filter((b) => selectedBrokers.has(b))
								.map((brokerCode) => {
									const colorIdx = allBrokers.indexOf(brokerCode);
									const stroke =
										BROKER_PALETTE[colorIdx % BROKER_PALETTE.length];
									return (
										<Line
											key={brokerCode}
											type="monotone"
											dataKey={brokerCode}
											name={`Broker ${brokerCode}`}
											stroke={stroke}
											strokeWidth={1.75}
											dot={false}
											activeDot={{ r: 4 }}
										/>
									);
								})}
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}
