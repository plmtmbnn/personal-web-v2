"use client";

import { useEffect, useMemo, useState } from "react";
import {
	ArrowDownRight,
	ArrowUpRight,
	BarChart2,
	TrendingUp,
} from "lucide-react";
import type { TradeBookData } from "../types";

interface TradeBookChartsProps {
	data: TradeBookData;
	symbol: string;
}

interface MergedPoint {
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

export default function TradeBookCharts({
	data,
	symbol,
}: TradeBookChartsProps) {
	const [Recharts, setRecharts] = useState<Record<string, any> | null>(null);

	useEffect(() => {
		import("recharts").then((mod) => setRecharts(mod));
	}, []);

	const chartData = useMemo(() => {
		const pointsMap = new Map<string, Partial<MergedPoint>>();

		// 1. Process prices
		if (Array.isArray(data.prices)) {
			for (const p of data.prices) {
				if (!p.time) continue;
				const current = pointsMap.get(p.time) || { time: p.time };
				current.price = parseNum(p.value?.raw);
				current.priceFormatted = p.value?.formatted || String(current.price);
				pointsMap.set(p.time, current);
			}
		}

		// 2. Process net_values
		if (Array.isArray(data.net_values)) {
			for (const nv of data.net_values) {
				if (!nv.time) continue;
				const current = pointsMap.get(nv.time) || { time: nv.time };
				current.netValue = parseNum(nv.value?.raw);
				current.netValueFormatted =
					nv.value?.formatted || String(current.netValue);
				pointsMap.set(nv.time, current);
			}
		}

		// 3. Process big_money_net_values
		if (Array.isArray(data.big_money_net_values)) {
			for (const bm of data.big_money_net_values) {
				if (!bm.time) continue;
				const current = pointsMap.get(bm.time) || { time: bm.time };
				current.bmNetValue = parseNum(bm.value?.raw);
				current.bmNetValueFormatted =
					bm.value?.formatted || String(current.bmNetValue);
				pointsMap.set(bm.time, current);
			}
		}

		// 4. Process buy / sell lots
		if (Array.isArray(data.buy)) {
			for (const b of data.buy) {
				if (!b.time) continue;
				const current = pointsMap.get(b.time) || { time: b.time };
				current.buyLot = parseNum(b.lot?.raw);
				pointsMap.set(b.time, current);
			}
		}
		if (Array.isArray(data.sell)) {
			for (const s of data.sell) {
				if (!s.time) continue;
				const current = pointsMap.get(s.time) || { time: s.time };
				current.sellLot = parseNum(s.lot?.raw);
				pointsMap.set(s.time, current);
			}
		}

		// Convert map to sorted array
		const sorted = Array.from(pointsMap.values())
			.map((pt) => ({
				time: pt.time || "",
				price: pt.price ?? null,
				priceFormatted: pt.priceFormatted || "-",
				netValue: pt.netValue ?? 0,
				netValueFormatted: pt.netValueFormatted || "0",
				bmNetValue: pt.bmNetValue ?? 0,
				bmNetValueFormatted: pt.bmNetValueFormatted || "0",
				buyLot: pt.buyLot ?? 0,
				sellLot: pt.sellLot ?? 0,
			}))
			.sort((a, b) => a.time.localeCompare(b.time));

		return sorted;
	}, [data]);

	const priceExtents = useMemo(() => {
		const prices = chartData
			.map((d) => d.price)
			.filter((p): p is number => p !== null && p > 0);
		if (prices.length === 0) return { min: 0, max: 100 };
		const min = Math.min(...prices);
		const max = Math.max(...prices);
		const pad = Math.max((max - min) * 0.08, 1);
		return {
			min: Math.floor(min - pad),
			max: Math.ceil(max + pad),
		};
	}, [chartData]);

	if (!Recharts) {
		return (
			<div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex items-center justify-center min-h-[360px]">
				<span className="text-xs font-semibold text-slate-400 animate-pulse">
					Preparing charts engine...
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
		ReferenceLine,
		Cell,
	} = Recharts;

	return (
		<div className="space-y-6">
			{/* Price Chart */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-700 shrink-0">
							<TrendingUp className="w-5 h-5" aria-hidden />
						</div>
						<div>
							<h3 className="text-base font-bold text-slate-900">
								{symbol.toUpperCase()} 1-Minute Price
							</h3>
							<p className="text-xs text-slate-500">
								Intraday price action sequence ({chartData.length} checkpoints)
							</p>
						</div>
					</div>

					{chartData.length > 0 && chartData[chartData.length - 1].price && (
						<div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
							<span className="text-xs font-semibold text-slate-500">
								Latest:
							</span>
							<span className="text-sm font-extrabold text-slate-900">
								Rp {chartData[chartData.length - 1].priceFormatted}
							</span>
						</div>
					)}
				</div>

				<div className="h-64 sm:h-72 w-full pt-2">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={chartData}
							margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#f1f5f9"
							/>
							<XAxis
								dataKey="time"
								stroke="#94a3b8"
								fontSize={11}
								tickLine={false}
								axisLine={false}
								minTickGap={30}
							/>
							<YAxis
								domain={[priceExtents.min, priceExtents.max]}
								stroke="#94a3b8"
								fontSize={11}
								tickLine={false}
								axisLine={false}
								tickFormatter={(v: number) => v.toLocaleString()}
							/>
							<Tooltip
								content={({
									active,
									payload,
								}: {
									active?: boolean;
									payload?: Array<{ payload: MergedPoint }>;
								}) => {
									if (!active || !payload?.length) return null;
									const d = payload[0].payload;
									return (
										<div className="bg-white border border-slate-200 shadow-md rounded-xl p-3 text-xs space-y-1">
											<div className="font-bold text-slate-900">{d.time}</div>
											<div className="text-slate-600 flex items-center justify-between gap-3">
												<span>Price:</span>
												<span className="font-extrabold text-slate-900">
													{d.priceFormatted}
												</span>
											</div>
										</div>
									);
								}}
							/>
							<Line
								type="monotone"
								dataKey="price"
								stroke="#4f46e5"
								strokeWidth={2}
								dot={false}
								activeDot={{
									r: 4,
									stroke: "#4f46e5",
									strokeWidth: 2,
									fill: "#fff",
								}}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Net Flow & Big Money Accumulation Bar Chart */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700 shrink-0">
							<BarChart2 className="w-5 h-5" aria-hidden />
						</div>
						<div>
							<h3 className="text-base font-bold text-slate-900">
								Net Flow & Big Money Distribution
							</h3>
							<p className="text-xs text-slate-500">
								Intraday net accumulation per minute (Green: Net Inflow | Red:
								Net Outflow)
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3 text-xs font-semibold text-slate-600 self-start sm:self-auto">
						<span className="inline-flex items-center gap-1 text-emerald-700">
							<ArrowUpRight className="w-3.5 h-3.5" aria-hidden /> Inflow
						</span>
						<span className="inline-flex items-center gap-1 text-rose-700">
							<ArrowDownRight className="w-3.5 h-3.5" aria-hidden /> Outflow
						</span>
					</div>
				</div>

				<div className="h-64 sm:h-72 w-full pt-2">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={chartData}
							margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#f1f5f9"
							/>
							<XAxis
								dataKey="time"
								stroke="#94a3b8"
								fontSize={11}
								tickLine={false}
								axisLine={false}
								minTickGap={30}
							/>
							<YAxis
								stroke="#94a3b8"
								fontSize={11}
								tickLine={false}
								axisLine={false}
								tickFormatter={(v: number) => {
									if (Math.abs(v) >= 1_000_000_000)
										return `${(v / 1_000_000_000).toFixed(1)}B`;
									if (Math.abs(v) >= 1_000_000)
										return `${(v / 1_000_000).toFixed(0)}M`;
									return String(v);
								}}
							/>
							<ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="2 2" />
							<Tooltip
								content={({
									active,
									payload,
								}: {
									active?: boolean;
									payload?: Array<{ payload: MergedPoint }>;
								}) => {
									if (!active || !payload?.length) return null;
									const d = payload[0].payload;
									const isNetPositive = d.netValue >= 0;
									const isBmPositive = d.bmNetValue >= 0;
									return (
										<div className="bg-white border border-slate-200 shadow-md rounded-xl p-3 text-xs space-y-1.5 min-w-[180px]">
											<div className="font-bold text-slate-900 border-b border-slate-100 pb-1">
												{d.time}
											</div>
											<div className="flex items-center justify-between">
												<span className="text-slate-500">Net Value:</span>
												<span
													className={`font-extrabold ${isNetPositive ? "text-emerald-700" : "text-rose-700"}`}
												>
													{d.netValueFormatted}
												</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-slate-500">Big Money Net:</span>
												<span
													className={`font-extrabold ${isBmPositive ? "text-emerald-700" : "text-rose-700"}`}
												>
													{d.bmNetValueFormatted}
												</span>
											</div>
											<div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
												<span>Buy Lot: {d.buyLot.toLocaleString()}</span>
												<span>Sell Lot: {d.sellLot.toLocaleString()}</span>
											</div>
										</div>
									);
								}}
							/>
							<Bar dataKey="netValue" radius={[4, 4, 0, 0]}>
								{chartData.map((entry) => (
									<Cell
										key={`cell-${entry.time}`}
										fill={entry.netValue >= 0 ? "#10b981" : "#f43f5e"}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}
