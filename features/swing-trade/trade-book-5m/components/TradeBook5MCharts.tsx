"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart2, TrendingUp } from "lucide-react";
import type { TradeBook5MData } from "../types";

interface TradeBook5MChartsProps {
	data: TradeBook5MData;
	symbol: string;
}

interface MergedPoint5M {
	dateTime: string;
	date: string;
	time: string;
	price: number | null;
	priceFormatted: string;
	netValue: number;
	netValueFormatted: string;
	bmNetValue: number;
	bmNetValueFormatted: string;
	buyLot: number;
	sellLot: number;
}

function parseNum(val: unknown): number {
	if (typeof val === "number") return Number.isFinite(val) ? val : 0;
	if (typeof val === "string") {
		const cleaned = val.replace(/[^0-9.-]/g, "");
		const n = Number.parseFloat(cleaned);
		return Number.isFinite(n) ? n : 0;
	}
	return 0;
}

export default function TradeBook5MCharts({
	data,
	symbol,
}: TradeBook5MChartsProps) {
	// Dynamically import recharts to maintain edge performance
	const [Recharts, setRecharts] = useState<Record<string, any> | null>(null);

	useEffect(() => {
		import("recharts").then((mod) => setRecharts(mod));
	}, []);

	const chartData = useMemo(() => {
		const pointsMap = new Map<string, Partial<MergedPoint5M>>();

		const getKey = (date?: string, time?: string) => {
			const d = date || data.date || "";
			const t = time || "";
			return `${d} ${t}`.trim();
		};

		// 1. Process prices
		if (Array.isArray(data.prices)) {
			for (const p of data.prices) {
				const key = getKey(p.date, p.time);
				if (!key) continue;
				const current = pointsMap.get(key) || {
					dateTime: key,
					date: p.date,
					time: p.time,
				};
				current.price = parseNum(p.value?.raw);
				current.priceFormatted = p.value?.formatted || String(current.price);
				pointsMap.set(key, current);
			}
		}

		// 2. Process net_values
		if (Array.isArray(data.net_values)) {
			for (const nv of data.net_values) {
				const key = getKey(nv.date, nv.time);
				if (!key) continue;
				const current = pointsMap.get(key) || {
					dateTime: key,
					date: nv.date,
					time: nv.time,
				};
				current.netValue = parseNum(nv.value?.raw);
				current.netValueFormatted =
					nv.value?.formatted || String(current.netValue);
				pointsMap.set(key, current);
			}
		}

		// 3. Process big_money_net_values
		if (Array.isArray(data.big_money_net_values)) {
			for (const bm of data.big_money_net_values) {
				const key = getKey(bm.date, bm.time);
				if (!key) continue;
				const current = pointsMap.get(key) || {
					dateTime: key,
					date: bm.date,
					time: bm.time,
				};
				current.bmNetValue = parseNum(bm.value?.raw);
				current.bmNetValueFormatted =
					bm.value?.formatted || String(current.bmNetValue);
				pointsMap.set(key, current);
			}
		}

		// 4. Process buy / sell lots
		if (Array.isArray(data.buy)) {
			for (const b of data.buy) {
				const key = getKey(b.date, b.time);
				if (!key) continue;
				const current = pointsMap.get(key) || {
					dateTime: key,
					date: b.date,
					time: b.time,
				};
				current.buyLot = parseNum(b.lot?.raw);
				pointsMap.set(key, current);
			}
		}
		if (Array.isArray(data.sell)) {
			for (const s of data.sell) {
				const key = getKey(s.date, s.time);
				if (!key) continue;
				const current = pointsMap.get(key) || {
					dateTime: key,
					date: s.date,
					time: s.time,
				};
				current.sellLot = parseNum(s.lot?.raw);
				pointsMap.set(key, current);
			}
		}

		// Sort chronologically ascending by dateTime
		const list: MergedPoint5M[] = Array.from(pointsMap.values())
			.map((p) => ({
				dateTime: p.dateTime || "",
				date: p.date || "",
				time: p.time || "",
				price: p.price ?? null,
				priceFormatted: p.priceFormatted || "0",
				netValue: p.netValue ?? 0,
				netValueFormatted: p.netValueFormatted || "0",
				bmNetValue: p.bmNetValue ?? 0,
				bmNetValueFormatted: p.bmNetValueFormatted || "0",
				buyLot: p.buyLot ?? 0,
				sellLot: p.sellLot ?? 0,
			}))
			.sort((a, b) => a.dateTime.localeCompare(b.dateTime));

		return list;
	}, [data]);

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
		BarChart,
		Bar,
		XAxis,
		YAxis,
		Tooltip,
		CartesianGrid,
		Legend,
	} = Recharts;

	const pricesList = chartData
		.map((d) => d.price)
		.filter((p): p is number => p !== null && p > 0);
	const minPrice = pricesList.length > 0 ? Math.min(...pricesList) : 0;
	const maxPrice = pricesList.length > 0 ? Math.max(...pricesList) : 100;
	const padding = Math.max(1, Math.round((maxPrice - minPrice) * 0.05));
	const priceDomain = [
		Math.max(0, minPrice - padding),
		Math.round(maxPrice + padding),
	];

	return (
		<div className="space-y-6">
			{/* Price & Cumulative Flow Timeline Chart */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
							<TrendingUp className="w-4 h-4" aria-hidden />
						</div>
						<h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
							Price Trend &amp; Institutional Net Value Flow (5M Multi-Day)
						</h3>
					</div>
					<div className="flex items-center gap-3 text-xs font-mono font-medium text-slate-500">
						<span>{symbol}</span>
						<span className="text-slate-300">&bull;</span>
						<span>{chartData.length} intervals plotted</span>
					</div>
				</div>

				<div className="w-full h-[320px] sm:h-[380px]">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={chartData}
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
									// Format: MM/DD HH:mm for readable multi-day X-axis ticks
									const parts = val.split(" ");
									if (parts.length === 2) {
										const d = parts[0].slice(5);
										return `${d} ${parts[1]}`;
									}
									return val;
								}}
								interval="preserveStartEnd"
								minTickGap={40}
							/>
							<YAxis
								yAxisId="price"
								domain={priceDomain}
								orientation="left"
								tick={{ fontSize: 10, fill: "#0f172a", fontWeight: "bold" }}
							/>
							<YAxis
								yAxisId="flow"
								orientation="right"
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
							<Line
								yAxisId="price"
								type="monotone"
								dataKey="price"
								name="Close Price"
								stroke="#0f172a"
								strokeWidth={2}
								dot={false}
								activeDot={{ r: 4 }}
							/>
							<Line
								yAxisId="flow"
								type="monotone"
								dataKey="netValue"
								name="Net Value Flow (IDR)"
								stroke="#10b981"
								strokeWidth={1.5}
								strokeDasharray="4 4"
								dot={false}
							/>
							<Line
								yAxisId="flow"
								type="monotone"
								dataKey="bmNetValue"
								name="Big Money Flow (IDR)"
								stroke="#6366f1"
								strokeWidth={1.5}
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Buy vs Sell Volume Dynamics Chart */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
				<div className="flex items-center justify-between pb-3 border-b border-slate-100">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
							<BarChart2 className="w-4 h-4" aria-hidden />
						</div>
						<h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
							5-Minute Buy vs Sell Volume Accumulation
						</h3>
					</div>
					<span className="text-xs font-mono font-medium text-slate-500">
						Shares/Lots
					</span>
				</div>

				<div className="w-full h-[240px] sm:h-[280px]">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={chartData}
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
									if (parts.length === 2)
										return `${parts[0].slice(5)} ${parts[1]}`;
									return val;
								}}
								minTickGap={40}
							/>
							<YAxis
								tick={{ fontSize: 10, fill: "#64748b" }}
								tickFormatter={(val: number) => {
									if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
									return String(val);
								}}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "#ffffff",
									borderColor: "#e2e8f0",
									borderRadius: "1rem",
									fontSize: "11px",
								}}
							/>
							<Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
							<Bar
								dataKey="buyLot"
								name="Buy Volume (Lots)"
								fill="#10b981"
								radius={[4, 4, 0, 0]}
							/>
							<Bar
								dataKey="sellLot"
								name="Sell Volume (Lots)"
								fill="#f43f5e"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}
