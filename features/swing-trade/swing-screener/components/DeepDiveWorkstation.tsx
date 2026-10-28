import { useState } from "react";
import { Activity, Coins, GitFork, LineChart, Target } from "lucide-react";
import { formatCompact } from "../../market-detector/lib/format";
import type {
	PlaybookSetup,
	TopBuyerItem,
	SwingScreenerResponse,
} from "../types";

interface DeepDiveWorkstationProps {
	response: SwingScreenerResponse;
}

type WorkstationTab =
	| "setups"
	| "bandar"
	| "orderflow"
	| "trajectory"
	| "levels";

export default function DeepDiveWorkstation({
	response,
}: DeepDiveWorkstationProps) {
	const {
		setups,
		bandar_structure: bandar,
		order_flow: orderFlow,
		broker_trajectory: trajectory,
		broker_network: network,
		levels,
		trend_vcp: trendVcp,
		moving_averages: movingAverages,
	} = response;

	const [activeTab, setActiveTab] = useState<WorkstationTab>("setups");

	const tabs = [
		{
			id: "setups" as const,
			label: "Playbook Setups",
			icon: Target,
			count: setups?.length ?? 0,
		},
		{
			id: "bandar" as const,
			label: "Bandar & Cost Basis",
			icon: Coins,
			count: bandar?.top_buyers?.length ?? 0,
		},
		{
			id: "orderflow" as const,
			label: "Order Flow & PLIR",
			icon: Activity,
			count: null,
		},
		{
			id: "trajectory" as const,
			label: "Trajectory & Network",
			icon: GitFork,
			count: null,
		},
		{
			id: "levels" as const,
			label: "VCP & Reference Levels",
			icon: LineChart,
			count: null,
		},
	];

	return (
		<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
			{/* Workstation Header & Tab Switcher */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
				<div>
					<h3 className="text-base font-extrabold text-slate-900">
						Microstructure Intelligence Workstation
					</h3>
					<p className="text-xs text-slate-500">
						Detailed quantitative order flow, participant topology, and
						structural signals
					</p>
				</div>

				{/* Frameless Segmented Mode Switcher */}
				<div className="inline-flex flex-wrap p-1 bg-slate-100 rounded-xl border border-slate-200/70 gap-1 self-start sm:self-auto">
					{tabs.map((t) => {
						const Icon = t.icon;
						const active = activeTab === t.id;

						return (
							<button
								key={t.id}
								type="button"
								onClick={() => setActiveTab(t.id)}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
									active
										? "bg-white text-slate-900 shadow-xs"
										: "text-slate-600 hover:text-slate-900"
								}`}
							>
								<Icon className="w-3.5 h-3.5" aria-hidden />
								<span>{t.label}</span>
								{t.count !== null && (
									<span
										className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
											active
												? "bg-slate-100 text-slate-800"
												: "bg-slate-200/70 text-slate-600"
										}`}
									>
										{t.count}
									</span>
								)}
							</button>
						);
					})}
				</div>
			</div>

			{/* Tab 1: Playbook Setups */}
			{activeTab === "setups" && (
				<div className="space-y-4">
					<div className="text-xs text-slate-500 font-medium">
						Ranked swing setups evaluated against VCP base structures,
						institutional cost-basis absorption, and breakout triggers.
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{setups?.map((setup: PlaybookSetup) => {
							const isReady = setup.params?.status === "READY";

							return (
								<div
									key={setup.id}
									className={`p-4 sm:p-5 rounded-2xl border transition-all ${
										isReady
											? "bg-emerald-50/40 border-emerald-200/90 shadow-xs"
											: "bg-slate-50/70 border-slate-200/80"
									} space-y-3`}
								>
									<div className="flex items-start justify-between gap-2">
										<div>
											<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
												{setup.category}
											</span>
											<h4 className="text-sm font-extrabold text-slate-900 leading-snug">
												{setup.name}
											</h4>
										</div>
										<span
											className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 ${
												isReady
													? "bg-emerald-100 text-emerald-800"
													: "bg-amber-100 text-amber-800"
											}`}
										>
											{setup.params?.status || "DEVELOPING"}
										</span>
									</div>

									<p className="text-xs text-slate-600 font-medium">
										{setup.params?.strategy}
									</p>

									<div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs font-mono">
										<div>
											<span className="text-[10px] text-slate-500 block">
												Entry Zone
											</span>
											<span className="font-bold text-slate-900 truncate block">
												{setup.params?.entry_zone}
											</span>
										</div>
										<div>
											<span className="text-[10px] text-slate-500 block">
												Stop Loss
											</span>
											<span className="font-bold text-rose-600">
												Rp {setup.params?.sl}
											</span>
										</div>
										<div>
											<span className="text-[10px] text-slate-500 block">
												Targets
											</span>
											<span className="font-bold text-emerald-600">
												Rp {setup.params?.tp1} / {setup.params?.tp2}
											</span>
										</div>
										<div>
											<span className="text-[10px] text-slate-500 block">
												Net RRR
											</span>
											<span className="font-bold text-slate-900">
												{setup.params?.rr_net}
											</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Tab 2: Bandar & Cost Basis */}
			{activeTab === "bandar" && (
				<div className="space-y-6">
					{/* Cost Basis Summary Strip */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
							<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
								Cycle VWAP
							</span>
							<span className="text-base sm:text-lg font-mono font-extrabold text-slate-900 block truncate">
								Rp {Math.round(bandar?.bandar_summary?.cycle_vwap ?? 0)}
							</span>
							<span className="text-[11px] text-slate-500 font-medium block">
								Verdict: {bandar?.bandar_summary?.broker_accdist || "Neutral"}
							</span>
						</div>

						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
							<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
								Top 3 Buyer Cost
							</span>
							<span className="text-base sm:text-lg font-mono font-extrabold text-emerald-600 block truncate">
								Rp{" "}
								{Math.round(bandar?.cost_basis_map?.top3_buyer_avg_cost ?? 0)}
							</span>
							<span className="text-[11px] text-slate-500 font-medium block font-mono">
								+
								{bandar?.cost_basis_map?.close_vs_inst_cost_pct?.toFixed(1) ??
									0}
								% vs Close
							</span>
						</div>

						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
							<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
								Inst Accumulator Cost
							</span>
							<span className="text-base sm:text-lg font-mono font-extrabold text-indigo-600 block truncate">
								Rp{" "}
								{Math.round(
									bandar?.cost_basis_map?.inst_accumulator_avg_cost ?? 0,
								)}
							</span>
							<span className="text-[11px] text-slate-500 font-medium block font-mono">
								{bandar?.cost_basis_map?.active_hc_buyer_count ?? 0}{" "}
								High-Conviction Buyers
							</span>
						</div>

						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
							<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
								Top 3 Concentration
							</span>
							<span className="text-base sm:text-lg font-mono font-extrabold text-slate-900 block truncate font-mono">
								{bandar?.bandar_summary?.top3_pct ?? 0}%
							</span>
							<span className="text-[11px] text-slate-500 font-medium block">
								Top 1: {bandar?.bandar_summary?.top1_pct ?? 0}%
							</span>
						</div>
					</div>

					{/* Top Buyers Table */}
					<div className="space-y-3">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
							Top Accumulators &amp; Conviction Profile
						</span>

						<div className="overflow-x-auto border border-slate-200 rounded-2xl">
							<table className="w-full text-xs text-left">
								<thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
									<tr>
										<th className="py-2.5 px-3">Broker</th>
										<th className="py-2.5 px-3 text-right">Net Lots</th>
										<th className="py-2.5 px-3 text-right">Net Value</th>
										<th className="py-2.5 px-3 text-right">Avg Price</th>
										<th className="py-2.5 px-3 text-right">Conviction</th>
										<th className="py-2.5 px-3 text-right">Behavior</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 font-mono">
									{bandar?.top_buyers?.map((b: TopBuyerItem) => (
										<tr
											key={b.code}
											className="hover:bg-slate-50/70 transition-colors"
										>
											<td className="py-2.5 px-3">
												<div className="flex items-center gap-2">
													<span className="font-extrabold text-slate-900">
														{b.code}
													</span>
													{b.type && (
														<span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
															{b.type}
														</span>
													)}
												</div>
											</td>
											<td className="py-2.5 px-3 text-right font-medium text-slate-800">
												{formatCompact(b.net_lot)}
											</td>
											<td className="py-2.5 px-3 text-right font-bold text-emerald-600">
												{formatCompact(b.net_val, "Rp ")}
											</td>
											<td className="py-2.5 px-3 text-right text-slate-900 font-semibold">
												Rp {Math.round(b.avg_price)}
											</td>
											<td className="py-2.5 px-3 text-right text-slate-700 font-semibold">
												{Math.round(b.conviction_ratio * 100)}%
											</td>
											<td className="py-2.5 px-3 text-right font-sans">
												<span
													className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
														b.behavior === "HIGH_CONVICTION_INST"
															? "bg-emerald-50 text-emerald-700 border border-emerald-200"
															: "bg-slate-100 text-slate-700"
													}`}
												>
													{b.behavior}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}

			{/* Tab 3: Order Flow & PLIR */}
			{activeTab === "orderflow" && (
				<div className="space-y-6">
					{/* Windows Overview */}
					<div className="space-y-3">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
							Multi-Horizon Big Money Flow Windows
						</span>

						<div className="overflow-x-auto border border-slate-200 rounded-2xl">
							<table className="w-full text-xs text-left">
								<thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
									<tr>
										<th className="py-2.5 px-3">Window</th>
										<th className="py-2.5 px-3 text-right">Big Money Net</th>
										<th className="py-2.5 px-3 text-right">Retail Net</th>
										<th className="py-2.5 px-3 text-right">HAKA Buy %</th>
										<th className="py-2.5 px-3 text-right">BM Positive Days</th>
										<th className="py-2.5 px-3 text-right">PLIR</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 font-mono">
									{[
										orderFlow?.window_1d,
										orderFlow?.window_5d,
										orderFlow?.window_10d,
									]
										.filter(Boolean)
										.map((w) => (
											<tr
												key={w.days}
												className="hover:bg-slate-50/70 transition-colors"
											>
												<td className="py-2.5 px-3 font-sans font-extrabold text-slate-900">
													{w.days}D Window
												</td>
												<td
													className={`py-2.5 px-3 text-right font-bold ${
														w.bm_net_val >= 0
															? "text-emerald-600"
															: "text-rose-600"
													}`}
												>
													{formatCompact(w.bm_net_val, "Rp ")}
												</td>
												<td
													className={`py-2.5 px-3 text-right font-medium ${
														w.retail_net_val >= 0
															? "text-emerald-600"
															: "text-rose-600"
													}`}
												>
													{formatCompact(w.retail_net_val, "Rp ")}
												</td>
												<td className="py-2.5 px-3 text-right text-slate-800">
													{w.haka_buy_pct}%
												</td>
												<td className="py-2.5 px-3 text-right text-slate-700 font-semibold">
													{w.bm_pos_days} / {w.days} Days
												</td>
												<td className="py-2.5 px-3 text-right font-bold text-indigo-600">
													{w.plir}
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Anchored From Swing Low */}
					{orderFlow?.anchored_from_swing_low && (
						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-xs font-bold uppercase tracking-wider text-slate-700">
									Anchored Cumulative Delta (Since Swing Low:{" "}
									{orderFlow.anchored_from_swing_low.anchor_date})
								</span>
								<span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-600">
									{orderFlow.anchored_from_swing_low.days_since_low} Days
									Elapsed
								</span>
							</div>

							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
								<div>
									<span className="text-[10px] text-slate-500 font-sans block">
										Anchored VWAP
									</span>
									<span className="font-extrabold text-slate-900">
										Rp {orderFlow.anchored_from_swing_low.avwap_swing_low}
									</span>
								</div>
								<div>
									<span className="text-[10px] text-slate-500 font-sans block">
										BM Flow Since Low
									</span>
									<span
										className={`font-bold ${
											orderFlow.anchored_from_swing_low.bm_net_val_since_low >=
											0
												? "text-emerald-600"
												: "text-rose-600"
										}`}
									>
										{formatCompact(
											orderFlow.anchored_from_swing_low.bm_net_val_since_low,
											"Rp ",
										)}
									</span>
								</div>
								<div>
									<span className="text-[10px] text-slate-500 font-sans block">
										Red-Day Absorption
									</span>
									<span className="font-bold text-emerald-600">
										{formatCompact(
											orderFlow.anchored_from_swing_low
												.red_day_bm_absorption_10d,
											"Rp ",
										)}
									</span>
								</div>
								<div>
									<span className="text-[10px] text-slate-500 font-sans block">
										Execution Regime
									</span>
									<span className="font-bold text-slate-900 font-sans truncate block">
										{orderFlow.execution_regime}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Tab 4: Trajectory & Network */}
			{activeTab === "trajectory" && (
				<div className="space-y-6">
					{/* Signals Grid */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						<div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
							<span className="text-slate-500 block font-medium">
								Fresh Dip Accumulation
							</span>
							<span
								className={`font-bold font-mono ${
									trajectory?.signals?.fresh_dip_accumulation
										? "text-emerald-600"
										: "text-slate-500"
								}`}
							>
								{trajectory?.signals?.fresh_dip_accumulation
									? "DETECTED"
									: "None"}
							</span>
						</div>

						<div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
							<span className="text-slate-500 block font-medium">
								Sustained Inst Accumulation
							</span>
							<span
								className={`font-bold font-mono ${
									trajectory?.signals?.sustained_inst_accumulation
										? "text-emerald-600"
										: "text-slate-500"
								}`}
							>
								{trajectory?.signals?.sustained_inst_accumulation
									? "CONFIRMED"
									: "None"}
							</span>
						</div>

						<div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
							<span className="text-slate-500 block font-medium">
								Network Topology
							</span>
							<span className="font-bold font-mono text-slate-900 truncate block">
								{network?.network_topology || "BALANCED"}
							</span>
						</div>

						<div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
							<span className="text-slate-500 block font-medium">
								Weighted Self-Match
							</span>
							<span className="font-bold font-mono text-slate-900">
								{network?.weighted_self_match_pct ?? 0}%
							</span>
						</div>
					</div>

					{/* Sustained Buyers Strip */}
					{trajectory?.signals?.sustained_inst_buyers &&
						trajectory.signals.sustained_inst_buyers.length > 0 && (
							<div className="space-y-2">
								<span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
									Sustained Institutional Accumulators
								</span>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{trajectory.signals.sustained_inst_buyers.map(
										(sb: {
											code: string;
											current_cum_lot: number;
											delta_10d_lot: number;
										}) => (
											<div
												key={sb.code}
												className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs font-mono"
											>
												<div className="flex items-center gap-2">
													<span className="font-extrabold text-slate-900">
														{sb.code}
													</span>
													<span className="text-slate-500 text-[11px] font-sans">
														Sustained Accumulator
													</span>
												</div>
												<span className="font-bold text-emerald-600">
													+{formatCompact(sb.delta_10d_lot)} lots (10D)
												</span>
											</div>
										),
									)}
								</div>
							</div>
						)}
				</div>
			)}

			{/* Tab 5: VCP & Reference Levels */}
			{activeTab === "levels" && (
				<div className="space-y-6">
					{/* Key Reference Levels */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs font-mono">
						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
							<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans block">
								Daily VWAP
							</span>
							<span className="text-base sm:text-lg font-bold text-slate-900">
								Rp {levels?.daily_vwap}
							</span>
						</div>
						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
							<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans block">
								Anchored VWAP (Swing Low)
							</span>
							<span className="text-base sm:text-lg font-bold text-indigo-600">
								Rp {levels?.avwap_swing_low}
							</span>
						</div>
						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
							<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans block">
								10D VPOC / Value Area
							</span>
							<span className="text-base sm:text-lg font-bold text-slate-900">
								Rp {levels?.vpoc_10d}
							</span>
							<span className="text-[11px] text-slate-500 block">
								VAL: {levels?.val_10d} | VAH: {levels?.vah_10d}
							</span>
						</div>
						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
							<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans block">
								Trend Regime
							</span>
							<span className="text-base sm:text-lg font-bold text-emerald-600 font-sans truncate block">
								{trendVcp?.trend_regime}
							</span>
							<span className="text-[11px] text-slate-500 block font-sans">
								VCP: {trendVcp?.is_vcp ? "Active Base" : "Extended"}
							</span>
						</div>
					</div>

					{/* Moving Averages */}
					<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
							Moving Averages Alignment
						</span>

						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
							<div>
								<span className="text-[10px] text-slate-500 font-sans block">
									MA10
								</span>
								<span className="font-bold text-slate-900">
									Rp {movingAverages?.ma10?.toFixed(1)}
								</span>
							</div>
							<div>
								<span className="text-[10px] text-slate-500 font-sans block">
									MA20
								</span>
								<span className="font-bold text-slate-900">
									Rp {movingAverages?.ma20?.toFixed(1)}
								</span>
							</div>
							<div>
								<span className="text-[10px] text-slate-500 font-sans block">
									MA50
								</span>
								<span className="font-bold text-slate-900">
									Rp {movingAverages?.ma50?.toFixed(1)}
								</span>
							</div>
							<div>
								<span className="text-[10px] text-slate-500 font-sans block">
									MA200
								</span>
								<span className="font-bold text-slate-900">
									Rp {movingAverages?.ma200?.toFixed(1)}
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
