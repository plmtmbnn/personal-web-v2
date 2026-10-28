import { useState } from "react";
import {
	Activity,
	AlertTriangle,
	CheckCircle2,
	Coins,
	Compass,
	Flame,
	GitFork,
	LineChart,
	Target,
	Zap,
} from "lucide-react";
import { formatCompact } from "../../market-detector/lib/format";
import type {
	PlaybookSetup,
	SelfMatchBreakdownItem,
	SwingScreenerResponse,
	TopBuyerItem,
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
		action,
	} = response;

	const [activeTab, setActiveTab] = useState<WorkstationTab>("setups");
	const [setupFilter, setSetupFilter] = useState<"all" | "ready">("all");

	const readySetupsCount =
		setups?.filter((s) => s.params?.status === "READY").length ?? 0;
	const displayedSetups =
		setups?.filter(
			(s) => setupFilter === "all" || s.params?.status === "READY",
		) ?? [];

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
		<div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
			{/* Workstation Header & Mobile-First Swipeable Tab Switcher */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
				<div>
					<h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
						<Compass className="w-5 h-5 text-slate-700 shrink-0" aria-hidden />
						<span>Microstructure Intelligence Workstation</span>
					</h3>
					<p className="text-xs text-slate-500 mt-0.5">
						Detailed quantitative order flow, participant topology, and
						structural signals
					</p>
				</div>

				{/* Mobile-first swipeable segmented tab bar */}
				<div className="w-full lg:w-auto overflow-x-auto no-scrollbar touch-pan-x -mx-1 px-1">
					<nav
						aria-label="Microstructure Workstation Tabs"
						className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/70 gap-1 min-w-max"
					>
						{tabs.map((t) => {
							const Icon = t.icon;
							const active = activeTab === t.id;

							return (
								<button
									key={t.id}
									type="button"
									onClick={() => setActiveTab(t.id)}
									className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-11 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
										active
											? "bg-white text-slate-900 shadow-xs"
											: "text-slate-600 hover:text-slate-900"
									}`}
								>
									<Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
									<span>{t.label}</span>
									{t.count !== null && (
										<span
											className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono leading-none ${
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
					</nav>
				</div>
			</div>

			{/* Tab 1: Playbook Setups */}
			{activeTab === "setups" && (
				<div className="space-y-4">
					{/* Toolbar & Filter Switcher */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
						<p className="text-slate-500 font-medium leading-relaxed">
							Ranked swing setups evaluated against VCP base structures,
							institutional cost-basis absorption, and breakout triggers.
						</p>

						<div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto shrink-0">
							<button
								type="button"
								onClick={() => setSetupFilter("all")}
								className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-9 cursor-pointer ${
									setupFilter === "all"
										? "bg-white text-slate-900 shadow-xs"
										: "text-slate-600 hover:text-slate-900"
								}`}
							>
								All Setups ({setups?.length ?? 0})
							</button>
							<button
								type="button"
								onClick={() => setSetupFilter("ready")}
								className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-9 cursor-pointer flex items-center gap-1.5 ${
									setupFilter === "ready"
										? "bg-white text-emerald-800 shadow-xs"
										: "text-slate-600 hover:text-slate-900"
								}`}
							>
								<CheckCircle2 className="w-3 h-3 text-emerald-600" />
								<span>Ready ({readySetupsCount})</span>
							</button>
						</div>
					</div>

					{/* Setups Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{displayedSetups.map((setup: PlaybookSetup) => {
							const isReady = setup.params?.status === "READY";
							const isBestSetup =
								Boolean(action?.best_setup) &&
								(setup.name
									.toLowerCase()
									.includes(action.best_setup.toLowerCase()) ||
									setup.category
										.toLowerCase()
										.includes(action.best_setup.toLowerCase()));

							return (
								<div
									key={setup.id}
									className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 relative flex flex-col justify-between ${
										isBestSetup
											? "bg-emerald-50/30 border-emerald-300 shadow-xs ring-1 ring-emerald-400/30"
											: isReady
												? "bg-emerald-50/20 border-emerald-200/90 shadow-2xs"
												: "bg-slate-50/70 border-slate-200/80"
									}`}
								>
									<div className="space-y-2">
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0">
												<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">
													{setup.category}
												</span>
												<h4 className="text-sm font-extrabold text-slate-900 leading-snug break-words">
													{setup.name}
												</h4>
											</div>
											<div className="flex flex-col items-end gap-1 shrink-0">
												{isBestSetup && (
													<span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-600 text-white shadow-2xs">
														Primary Setup
													</span>
												)}
												<span
													className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
														isReady
															? "bg-emerald-100 text-emerald-800 border border-emerald-200"
															: "bg-amber-100 text-amber-800 border border-amber-200"
													}`}
												>
													{setup.params?.status || "DEVELOPING"}
												</span>
											</div>
										</div>

										<p className="text-xs text-slate-600 font-medium leading-relaxed break-words">
											{setup.params?.strategy}
										</p>
									</div>

									<div className="space-y-2 pt-3 border-t border-slate-200/70 text-xs font-mono">
										{/* Entry Zone & Stop Loss */}
										<div className="grid grid-cols-2 gap-2">
											<div className="p-2 bg-white rounded-xl border border-slate-200/70">
												<span className="text-[10px] text-slate-500 font-sans block">
													Entry Zone
												</span>
												<span className="font-bold text-slate-900 break-words block">
													{setup.params?.entry_zone || "N/A"}
												</span>
											</div>
											<div className="p-2 bg-white rounded-xl border border-slate-200/70">
												<span className="text-[10px] text-slate-500 font-sans block">
													Stop Loss
												</span>
												<span className="font-bold text-rose-600 block">
													Rp{" "}
													{setup.params?.sl?.toLocaleString("id-ID") || "---"}
												</span>
											</div>
										</div>

										{/* Separated Milestone Targets: TP1 vs TP2 */}
										<div className="grid grid-cols-2 gap-2">
											<div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
												<span className="text-[10px] text-emerald-700 font-sans font-semibold block">
													TP1 Target
												</span>
												<span className="font-bold text-emerald-800 block">
													Rp{" "}
													{setup.params?.tp1?.toLocaleString("id-ID") || "---"}
												</span>
											</div>
											<div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
												<span className="text-[10px] text-emerald-700 font-sans font-semibold block">
													TP2 Runner
												</span>
												<span className="font-bold text-emerald-800 block">
													Rp{" "}
													{setup.params?.tp2?.toLocaleString("id-ID") || "---"}
												</span>
											</div>
										</div>

										{/* Net Risk Reward Ratio */}
										<div className="p-2 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between">
											<span className="text-[10px] text-slate-500 font-sans">
												Net RRR (Fee-Deducted)
											</span>
											<span className="font-extrabold text-slate-900">
												{setup.params?.rr_net ?? "---"}:1
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
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
							<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
								Cycle VWAP
							</span>
							<span className="text-base sm:text-lg font-mono font-extrabold text-slate-900 block truncate">
								Rp{" "}
								{Math.round(
									bandar?.bandar_summary?.cycle_vwap ?? 0,
								).toLocaleString("id-ID")}
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
								{Math.round(
									bandar?.cost_basis_map?.top3_buyer_avg_cost ?? 0,
								).toLocaleString("id-ID")}
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
								).toLocaleString("id-ID")}
							</span>
							<span className="text-[11px] text-slate-500 font-medium block font-mono">
								{bandar?.cost_basis_map?.active_hc_buyer_count ?? 0} Active Inst
								Accumulators
							</span>
						</div>

						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
							<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
								Concentration &amp; Wall
							</span>
							<span className="text-base sm:text-lg font-mono font-extrabold text-slate-900 block truncate font-mono">
								Top 3: {bandar?.bandar_summary?.top3_pct ?? 0}%
							</span>
							<span className="text-[11px] text-slate-500 font-medium block truncate">
								{bandar?.cost_basis_map?.overhead_supply_wall
									? `Supply Wall: Rp ${bandar.cost_basis_map.overhead_supply_wall.toLocaleString("id-ID")}`
									: `Top 1: ${bandar?.bandar_summary?.top1_pct ?? 0}%`}
							</span>
						</div>
					</div>

					{/* Top Buyers & Conviction Profile */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
								Top Accumulators &amp; Conviction Profile
							</span>
							{Boolean(bandar?.cost_basis_map?.trapped_legacy_count) && (
								<span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
									<AlertTriangle className="w-3 h-3 text-amber-600" />
									<span>
										{bandar?.cost_basis_map?.trapped_legacy_count} Trapped
										Legacy
									</span>
								</span>
							)}
						</div>

						{/* Mobile Stacked Cards Layout (< sm) */}
						<div className="block sm:hidden space-y-2.5">
							{bandar?.top_buyers?.map((b: TopBuyerItem) => (
								<div
									key={b.code}
									className={`p-3.5 rounded-2xl border space-y-2.5 ${
										b.is_trapped_legacy
											? "bg-rose-50/40 border-rose-200/80"
											: "bg-slate-50/70 border-slate-200/80"
									}`}
								>
									<div className="flex items-start justify-between gap-2">
										<div className="flex items-center gap-2">
											<span className="text-sm font-extrabold text-slate-900">
												{b.code}
											</span>
											{b.type && (
												<span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
													{b.type}
												</span>
											)}
										</div>
										<div className="flex flex-col items-end gap-1">
											{b.is_trapped_legacy && (
												<span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
													Trapped Legacy (&gt;25% Underwater)
												</span>
											)}
											<span
												className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
													b.behavior === "HIGH_CONVICTION_INST"
														? "bg-emerald-50 text-emerald-700 border border-emerald-200"
														: "bg-white text-slate-700 border border-slate-200"
												}`}
											>
												{b.behavior}
											</span>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-200/60">
										<div>
											<span className="text-[10px] text-slate-500 font-sans block">
												Net Lots
											</span>
											<span className="font-semibold text-slate-900">
												{formatCompact(b.net_lot)}
											</span>
										</div>
										<div>
											<span className="text-[10px] text-slate-500 font-sans block">
												Net Value
											</span>
											<span className="font-bold text-emerald-600">
												{formatCompact(b.net_val, "Rp ")}
											</span>
										</div>
										<div>
											<span className="text-[10px] text-slate-500 font-sans block">
												Avg Price
											</span>
											<span className="font-semibold text-slate-900">
												Rp {Math.round(b.avg_price).toLocaleString("id-ID")}
											</span>
										</div>
										<div>
											<span className="text-[10px] text-slate-500 font-sans block">
												Conviction
											</span>
											<span className="font-semibold text-slate-700">
												{Math.round(b.conviction_ratio * 100)}%
											</span>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Desktop Table Layout (>= sm) */}
						<div className="hidden sm:block overflow-x-auto border border-slate-200 rounded-2xl">
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
											className={`hover:bg-slate-50/70 transition-colors ${
												b.is_trapped_legacy ? "bg-rose-50/20" : ""
											}`}
										>
											<td className="py-2.5 px-3">
												<div className="flex items-center gap-2">
													<span className="font-extrabold text-slate-900">
														{b.code}
													</span>
													{b.type && (
														<span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
															{b.type}
														</span>
													)}
													{b.is_trapped_legacy && (
														<span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
															Trapped Legacy
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
												Rp {Math.round(b.avg_price).toLocaleString("id-ID")}
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
					{/* Paint-the-Tape Bull Trap Warning Banner */}
					{orderFlow?.paint_the_tape_trap && (
						<div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-start gap-3">
							<AlertTriangle
								className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
								aria-hidden
							/>
							<div className="space-y-0.5">
								<h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
									Paint-the-Tape Bull Trap Warning
								</h4>
								<p className="text-xs text-amber-800 leading-relaxed font-medium">
									Artificial price markup detected without institutional parent
									order volume backing. Retail buying is holding high ticks
									while institutional inventory remains neutral or distributing.
								</p>
							</div>
						</div>
					)}

					{/* Windows Overview */}
					<div className="space-y-3">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
							Multi-Horizon Big Money Flow Windows
						</span>

						{/* Mobile Cards (< sm) */}
						<div className="block sm:hidden space-y-2.5">
							{[
								orderFlow?.window_1d,
								orderFlow?.window_5d,
								orderFlow?.window_10d,
							]
								.filter(Boolean)
								.map((w) => (
									<div
										key={w.days}
										className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2.5"
									>
										<div className="flex items-center justify-between">
											<span className="text-xs font-extrabold text-slate-900">
												{w.days}D Window
											</span>
											<span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
												PLIR: {w.plir}
											</span>
										</div>

										<div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-200/60">
											<div>
												<span className="text-[10px] text-slate-500 font-sans block">
													Big Money Net
												</span>
												<span
													className={`font-bold ${
														w.bm_net_val >= 0
															? "text-emerald-600"
															: "text-rose-600"
													}`}
												>
													{formatCompact(w.bm_net_val, "Rp ")}
												</span>
											</div>
											<div>
												<span className="text-[10px] text-slate-500 font-sans block">
													Retail Net
												</span>
												<span
													className={`font-medium ${
														w.retail_net_val >= 0
															? "text-emerald-600"
															: "text-rose-600"
													}`}
												>
													{formatCompact(w.retail_net_val, "Rp ")}
												</span>
											</div>
											<div>
												<span className="text-[10px] text-slate-500 font-sans block">
													HAKA Buy %
												</span>
												<span className="text-slate-900 font-semibold">
													{w.haka_buy_pct}%
												</span>
											</div>
											<div>
												<span className="text-[10px] text-slate-500 font-sans block">
													BM Positive Days
												</span>
												<span className="text-slate-800 font-semibold">
													{w.bm_pos_days} / {w.days} Days
												</span>
											</div>
										</div>
									</div>
								))}
						</div>

						{/* Desktop Table (>= sm) */}
						<div className="hidden sm:block overflow-x-auto border border-slate-200 rounded-2xl">
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
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
								<span className="text-xs font-bold uppercase tracking-wider text-slate-700">
									Anchored Cumulative Delta (Since Swing Low:{" "}
									{orderFlow.anchored_from_swing_low.anchor_date})
								</span>
								<span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-600 self-start sm:self-auto">
									{orderFlow.anchored_from_swing_low.days_since_low} Days
									Elapsed
								</span>
							</div>

							<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs font-mono">
								<div>
									<span className="text-[10px] text-slate-500 font-sans block">
										Anchored VWAP
									</span>
									<span className="font-extrabold text-slate-900 block">
										Rp{" "}
										{orderFlow.anchored_from_swing_low.avwap_swing_low?.toLocaleString(
											"id-ID",
										)}
									</span>
								</div>
								<div>
									<span className="text-[10px] text-slate-500 font-sans block">
										BM Flow Since Low
									</span>
									<span
										className={`font-bold block ${
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
									<span className="font-bold text-emerald-600 block">
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
										{orderFlow.execution_regime || "NEUTRAL"}
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
					{/* Signals 4-Grid */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
						<div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1">
							<span className="text-slate-500 block font-medium">
								Fresh Dip Accumulation
							</span>
							<span
								className={`font-bold font-mono block ${
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

						<div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1">
							<span className="text-slate-500 block font-medium">
								Sustained Inst Accumulation
							</span>
							<span
								className={`font-bold font-mono block ${
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

						<div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1">
							<span className="text-slate-500 block font-medium">
								Network Topology
							</span>
							<span
								className={`font-bold font-mono truncate block ${
									network?.network_topology === "CIRCULAR_WASH_ROTATION"
										? "text-rose-600"
										: "text-slate-900"
								}`}
							>
								{network?.network_topology || "BALANCED"}
							</span>
						</div>

						<div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1">
							<span className="text-slate-500 block font-medium">
								Weighted Self-Match
							</span>
							<span
								className={`font-bold font-mono block ${
									(network?.weighted_self_match_pct ?? 0) > 15
										? "text-amber-600"
										: "text-slate-900"
								}`}
							>
								{network?.weighted_self_match_pct ?? 0}%
							</span>
						</div>
					</div>

					{/* Microstructure Warnings & Triggers Strip */}
					{(trajectory?.signals?.seller_exhaustion ||
						trajectory?.signals?.distributor_buyback ||
						trajectory?.signals?.retail_capitulation ||
						trajectory?.signals?.active_multi_day_distribution) && (
						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
							<span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
								Advanced Participant Triggers
							</span>
							<div className="flex flex-wrap gap-2 text-xs">
								{trajectory.signals.seller_exhaustion && (
									<span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5">
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
										<span>
											Seller Exhaustion
											{trajectory.signals.exhausted_seller_codes?.length > 0 &&
												` (${trajectory.signals.exhausted_seller_codes.join(", ")})`}
										</span>
									</span>
								)}

								{trajectory.signals.distributor_buyback && (
									<span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold flex items-center gap-1.5">
										<Zap className="w-3.5 h-3.5 text-indigo-600" />
										<span>Distributor Buyback Active</span>
									</span>
								)}

								{trajectory.signals.retail_capitulation && (
									<span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5">
										<Flame className="w-3.5 h-3.5 text-emerald-600" />
										<span>Retail Crowd Capitulation</span>
									</span>
								)}

								{trajectory.signals.active_multi_day_distribution && (
									<span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold flex items-center gap-1.5">
										<AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
										<span>Active Multi-Day Distribution</span>
									</span>
								)}
							</div>
						</div>
					)}

					{/* Sustained Institutional Buyers */}
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
												className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs font-mono"
											>
												<div className="flex items-center gap-2">
													<span className="font-extrabold text-slate-900 text-sm">
														{sb.code}
													</span>
													<span className="text-slate-500 text-[11px] font-sans">
														Cumulative: {formatCompact(sb.current_cum_lot)} lots
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

					{/* Self-Match & Circular Wash Rotation Breakdown */}
					{network?.self_match_breakdown &&
						network.self_match_breakdown.length > 0 && (
							<div className="space-y-3 pt-2">
								<div className="flex items-center justify-between">
									<span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
										Self-Match &amp; Wash-Trading Verification
									</span>
									<span className="text-[11px] font-medium text-slate-500">
										Multiple vs Net Volume
									</span>
								</div>

								{/* Mobile Cards (< sm) */}
								<div className="block sm:hidden space-y-2">
									{network.self_match_breakdown.map(
										(sm: SelfMatchBreakdownItem) => (
											<div
												key={sm.code}
												className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs font-mono"
											>
												<div className="flex items-center justify-between">
													<span className="font-extrabold text-slate-900 text-sm">
														{sm.code}
													</span>
													<span
														className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
															sm.self_match_pct > 20
																? "bg-rose-100 text-rose-800"
																: "bg-slate-200 text-slate-700"
														}`}
													>
														{sm.self_match_pct}% Self-Match
													</span>
												</div>
												<div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
													<div>
														<span className="text-[10px] text-slate-500 font-sans block">
															Self-Match Lots
														</span>
														<span>{formatCompact(sm.self_match_lot)}</span>
													</div>
													<div>
														<span className="text-[10px] text-slate-500 font-sans block">
															Net Lots
														</span>
														<span>{formatCompact(sm.net_lot)}</span>
													</div>
												</div>
											</div>
										),
									)}
								</div>

								{/* Desktop Table (>= sm) */}
								<div className="hidden sm:block overflow-x-auto border border-slate-200 rounded-2xl">
									<table className="w-full text-xs text-left">
										<thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
											<tr>
												<th className="py-2.5 px-3">Broker</th>
												<th className="py-2.5 px-3 text-right">
													Self-Match Lots
												</th>
												<th className="py-2.5 px-3 text-right">Self-Match %</th>
												<th className="py-2.5 px-3 text-right">
													Net Lot Position
												</th>
												<th className="py-2.5 px-3 text-right">
													Self vs Net Multiple
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-slate-100 font-mono">
											{network.self_match_breakdown.map(
												(sm: SelfMatchBreakdownItem) => (
													<tr
														key={sm.code}
														className="hover:bg-slate-50/70 transition-colors"
													>
														<td className="py-2.5 px-3 font-bold text-slate-900 font-sans">
															{sm.code}
														</td>
														<td className="py-2.5 px-3 text-right text-slate-800">
															{formatCompact(sm.self_match_lot)}
														</td>
														<td
															className={`py-2.5 px-3 text-right font-bold ${
																sm.self_match_pct > 20
																	? "text-rose-600"
																	: "text-slate-800"
															}`}
														>
															{sm.self_match_pct}%
														</td>
														<td className="py-2.5 px-3 text-right text-slate-800">
															{formatCompact(sm.net_lot)}
														</td>
														<td className="py-2.5 px-3 text-right font-bold text-slate-700">
															{sm.self_match_vs_net_multiple}x
														</td>
													</tr>
												),
											)}
										</tbody>
									</table>
								</div>
							</div>
						)}
				</div>
			)}

			{/* Tab 5: VCP & Reference Levels */}
			{activeTab === "levels" && (
				<div className="space-y-6">
					{/* Key Reference Levels */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs font-mono">
						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
							<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans block">
								Daily VWAP
							</span>
							<span className="text-base sm:text-lg font-bold text-slate-900 block truncate">
								Rp {levels?.daily_vwap?.toLocaleString("id-ID") || "---"}
							</span>
						</div>
						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
							<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans block">
								Anchored VWAP (Swing Low)
							</span>
							<span className="text-base sm:text-lg font-bold text-indigo-600 block truncate">
								Rp {levels?.avwap_swing_low?.toLocaleString("id-ID") || "---"}
							</span>
						</div>
						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
							<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans block">
								10D VPOC / Value Area
							</span>
							<span className="text-base sm:text-lg font-bold text-slate-900 block truncate">
								Rp {levels?.vpoc_10d?.toLocaleString("id-ID") || "---"}
							</span>
							<span className="text-[11px] text-slate-500 block truncate">
								VAL: {levels?.val_10d} | VAH: {levels?.vah_10d}
							</span>
						</div>
						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
							<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans block">
								Trend Regime
							</span>
							<span className="text-base sm:text-lg font-bold text-emerald-600 font-sans truncate block">
								{trendVcp?.trend_regime || "NEUTRAL"}
							</span>
							<span className="text-[11px] text-slate-500 block font-sans truncate">
								VCP: {trendVcp?.is_vcp ? "Active Base" : "Extended"}
							</span>
						</div>
					</div>

					{/* Multi-Day Value Area Migration (10D / 20D / 60D) */}
					<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
							<span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
								Multi-Day Value Area Migration &amp; VPOC Anchors
							</span>
							{levels?.va_migration && (
								<span
									className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono self-start sm:self-auto ${
										levels.va_migration === "ASCENDING_VALUE"
											? "bg-emerald-100 text-emerald-800"
											: levels.va_migration === "DESCENDING_VALUE"
												? "bg-rose-100 text-rose-800"
												: "bg-slate-200 text-slate-700"
									}`}
								>
									{levels.va_migration}
								</span>
							)}
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
							<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
								<span className="text-[10px] text-slate-500 font-sans block">
									10D Value Area
								</span>
								<div className="font-extrabold text-slate-900">
									VPOC: Rp {levels?.vpoc_10d}
								</div>
								<div className="text-[11px] text-slate-500">
									VAL {levels?.val_10d} to VAH {levels?.vah_10d}
								</div>
							</div>
							<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
								<span className="text-[10px] text-slate-500 font-sans block">
									20D Value Area
								</span>
								<div className="font-extrabold text-slate-900">
									VPOC: Rp {levels?.vpoc_20d}
								</div>
								<div className="text-[11px] text-slate-500">
									VAL {levels?.val_20d} to VAH {levels?.vah_20d}
								</div>
							</div>
							<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
								<span className="text-[10px] text-slate-500 font-sans block">
									60D Macro VPOC
								</span>
								<div className="font-extrabold text-slate-900">
									VPOC: Rp {levels?.vpoc_60d}
								</div>
								<div className="text-[11px] text-slate-500 font-sans">
									22D Low {levels?.swing_low_22d} / High{" "}
									{levels?.swing_high_22d}
								</div>
							</div>
						</div>
					</div>

					{/* VCP Contraction & Volume Profile Dynamics */}
					{trendVcp && (
						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
							<span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
								VCP Contraction &amp; Volume Profile Dry-Up
							</span>

							<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
								<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
									<span className="text-[10px] text-slate-500 font-sans block">
										VCP Ratio (5D/20D)
									</span>
									<span className="font-bold text-slate-900 block">
										{trendVcp.vcp_ratio}x
									</span>
									<span className="text-[10px] text-slate-500 font-sans block">
										{trendVcp.is_vcp ? "Contraction Valid" : "Wide Spread"}
									</span>
								</div>

								<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
									<span className="text-[10px] text-slate-500 font-sans block">
										Volume Dry-Up
									</span>
									<span className="font-bold text-slate-900 block">
										{trendVcp.vol_dryup_ratio}x
									</span>
									<span className="text-[10px] text-slate-500 font-sans block">
										{trendVcp.is_vol_dryup ? "Dry-Up Confirmed" : "High Volume"}
									</span>
								</div>

								<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
									<span className="text-[10px] text-slate-500 font-sans block">
										Red Volume Ratio
									</span>
									<span className="font-bold text-slate-900 block">
										{trendVcp.red_vol_ratio}x
									</span>
									<span className="text-[10px] text-slate-500 font-sans block">
										vs 20D Average
									</span>
								</div>

								<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
									<span className="text-[10px] text-slate-500 font-sans block">
										10D Breakout Ratio
									</span>
									<span className="font-bold text-slate-900 block">
										{trendVcp.vol_breakout_ratio}x
									</span>
									<span className="text-[10px] text-slate-500 font-sans block">
										{trendVcp.is_breakout_10d
											? "Breakout Volume"
											: "Normal Volume"}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Moving Averages */}
					<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
							Moving Averages Alignment
						</span>

						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
							<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
								<span className="text-[10px] text-slate-500 font-sans block">
									MA10 Short Trend
								</span>
								<span className="font-bold text-slate-900 block">
									Rp {movingAverages?.ma10?.toFixed(1) || "---"}
								</span>
							</div>
							<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
								<span className="text-[10px] text-slate-500 font-sans block">
									MA20 Pullback Gate
								</span>
								<span className="font-bold text-slate-900 block">
									Rp {movingAverages?.ma20?.toFixed(1) || "---"}
								</span>
								<span className="text-[10px] text-slate-500 block">
									{movingAverages?.close_vs_ma20_pct !== undefined
										? `${movingAverages.close_vs_ma20_pct > 0 ? "+" : ""}${movingAverages.close_vs_ma20_pct.toFixed(1)}% vs Close`
										: ""}
								</span>
							</div>
							<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
								<span className="text-[10px] text-slate-500 font-sans block">
									MA50 Structural
								</span>
								<span className="font-bold text-slate-900 block">
									Rp {movingAverages?.ma50?.toFixed(1) || "---"}
								</span>
								<span className="text-[10px] text-slate-500 block">
									{movingAverages?.close_vs_ma50_pct !== undefined
										? `${movingAverages.close_vs_ma50_pct > 0 ? "+" : ""}${movingAverages.close_vs_ma50_pct.toFixed(1)}% vs Close`
										: ""}
								</span>
							</div>
							<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
								<span className="text-[10px] text-slate-500 font-sans block">
									MA200 Macro Regime
								</span>
								<span className="font-bold text-slate-900 block">
									Rp {movingAverages?.ma200?.toFixed(1) || "---"}
								</span>
								<span className="text-[10px] text-slate-500 block">
									{movingAverages?.close_vs_ma200_pct !== undefined
										? `${movingAverages.close_vs_ma200_pct > 0 ? "+" : ""}${movingAverages.close_vs_ma200_pct.toFixed(1)}% vs Close`
										: ""}
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
