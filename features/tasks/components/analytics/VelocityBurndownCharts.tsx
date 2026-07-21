"use client";

import { useState, useEffect, useTransition } from "react";
import { BarChart3, TrendingDown, Loader2 } from "lucide-react";
import { getVelocityAndBurndownData } from "../../actions/analytics";

export default function VelocityBurndownCharts() {
	const [Recharts, setRecharts] = useState<any>(null);

	useEffect(() => {
		// Load recharts dynamically to reduce bundle size
		import("recharts").then((mod) => {
			setRecharts(mod);
		});
	}, []);

	if (!Recharts) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="w-8 h-8 animate-spin text-slate-400" />
			</div>
		);
	}
	const [period, setPeriod] = useState<"week" | "month">("week");
	const [data, setData] = useState<any>(null);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		const fetchData = () => {
			startTransition(async () => {
				try {
					const res = await getVelocityAndBurndownData(period);
					setData(res);
				} catch (err) {
					console.error("Failed to fetch velocity and burndown data:", err);
				}
			});
		};
		fetchData();
	}, [period]);

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload?.length) {
			return (
				<div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl text-white text-[10px] space-y-1.5 font-sans">
					<p className="font-black text-slate-400 uppercase tracking-widest">
						{label}
					</p>
					{payload.map((pld: any) => (
						<div key={pld.name} className="flex items-center gap-2">
							<span
								className="w-1.5 h-1.5 rounded-full"
								style={{ backgroundColor: pld.color }}
							/>
							<span className="font-bold text-slate-300">{pld.name}:</span>
							<span className="font-black tabular-nums">{pld.value}</span>
						</div>
					))}
				</div>
			);
		}
		return null;
	};

	return (
		<div className="space-y-8">
			{/* Header with Control */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
				<div>
					<h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
						<BarChart3 className="w-4 h-4 text-indigo-500" />
						Execution Velocity & Burndown
					</h3>
					<p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
						Neutralization velocity vs. ideal trajectory
					</p>
				</div>

				<div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
					{(["week", "month"] as const).map((p) => (
						<button
							key={p}
							type="button"
							onClick={() => setPeriod(p)}
							className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
								period === p
									? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
									: "text-slate-400 hover:text-slate-600"
							}`}
						>
							{p === "week" ? "Last 7 Days" : "Last 30 Days"}
						</button>
					))}
				</div>
			</div>

			{isPending || !data ? (
				<div className="h-64 flex flex-col items-center justify-center gap-3 bg-slate-50/50 rounded-2xl border border-slate-100">
					<Loader2 className="w-6 h-6 animate-spin text-slate-300" />
					<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
						Loading telemetry logs...
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Velocity Chart */}
					<div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
						<div className="mb-4">
							<h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
								Operational Velocity
							</h4>
							<p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
								Objectives completed & active duration
							</p>
						</div>

						<div className="h-60 w-full">
							<Recharts.ResponsiveContainer width="100%" height="100%">
								<Recharts.BarChart
									data={data.velocity}
									margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
								>
									<defs>
										<linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
											<stop
												offset="95%"
												stopColor="#10b981"
												stopOpacity={0.2}
											/>
										</linearGradient>
									</defs>
									<Recharts.CartesianGrid
										strokeDasharray="3 3"
										vertical={false}
										stroke="#f1f5f9"
									/>
									<Recharts.XAxis
										dataKey="date"
										tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }}
										axisLine={false}
										tickLine={false}
									/>
									<Recharts.YAxis
										yAxisId="left"
										tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }}
										axisLine={false}
										tickLine={false}
										allowDecimals={false}
									/>
									<Recharts.YAxis
										yAxisId="right"
										orientation="right"
										tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }}
										axisLine={false}
										tickLine={false}
										allowDecimals={false}
									/>
									<Recharts.Tooltip
										content={<CustomTooltip />}
										cursor={{ fill: "#f8fafc" }}
									/>
									<Recharts.Legend
										verticalAlign="top"
										height={36}
										iconSize={8}
										formatter={(value: string) => (
											<span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
												{value}
											</span>
										)}
									/>
									<Recharts.Bar
										yAxisId="left"
										dataKey="completedCount"
										name="Tasks Done"
										fill="url(#colorTasks)"
										radius={[4, 4, 0, 0]}
									/>
									<Recharts.Line
										yAxisId="right"
										type="monotone"
										dataKey="effortMinutes"
										name="Effort (Min)"
										stroke="#8b5cf6"
										strokeWidth={2.5}
										dot={{ r: 3, strokeWidth: 2 }}
										activeDot={{ r: 5 }}
									/>
								</Recharts.BarChart>
							</Recharts.ResponsiveContainer>
						</div>
					</div>

					{/* Burndown Chart */}
					<div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
						<div className="mb-4">
							<h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
								<TrendingDown className="w-4 h-4 text-emerald-500" />
								Task Burndown
							</h4>
							<p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
								Burn rate vs. ideal progression target ({data.totalScope} total)
							</p>
						</div>

						<div className="h-60 w-full">
							<Recharts.ResponsiveContainer width="100%" height="100%">
								<Recharts.LineChart
									data={data.burndown}
									margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
								>
									<Recharts.CartesianGrid
										strokeDasharray="3 3"
										vertical={false}
										stroke="#f1f5f9"
									/>
									<Recharts.XAxis
										dataKey="date"
										tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }}
										axisLine={false}
										tickLine={false}
									/>
									<Recharts.YAxis
										tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }}
										axisLine={false}
										tickLine={false}
										allowDecimals={false}
									/>
									<Recharts.Tooltip content={<CustomTooltip />} />
									<Recharts.Legend
										verticalAlign="top"
										height={36}
										iconSize={8}
										formatter={(value: string) => (
											<span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
												{value}
											</span>
										)}
									/>
									<Recharts.Line
										type="monotone"
										dataKey="idealRemaining"
										name="Ideal Burn"
										stroke="#94a3b8"
										strokeDasharray="5 5"
										strokeWidth={1.5}
										dot={false}
									/>
									<Recharts.Line
										type="stepAfter"
										dataKey="actualRemaining"
										name="Actual Burn"
										stroke="#10b981"
										strokeWidth={2.5}
										dot={{ r: 4, fill: "#10b981" }}
										activeDot={{ r: 6, fill: "#10b981" }}
									/>
								</Recharts.LineChart>
							</Recharts.ResponsiveContainer>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
