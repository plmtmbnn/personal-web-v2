import {
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Clock,
	ShieldAlert,
	Workflow,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ScreenerSetup } from "../../types/tape-analyzer";

interface PlaybookSetupsCardProps {
	setups: ScreenerSetup[];
}

type FilterMode = "all" | "actionable" | "high-score";

export default function PlaybookSetupsCard({
	setups,
}: PlaybookSetupsCardProps) {
	const [filter, setFilter] = useState<FilterMode>("all");
	const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

	const toggleExpand = (id: number) => {
		setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	const actionableCount = useMemo(
		() => setups.filter((s) => s.params.actionable).length,
		[setups],
	);
	const highScoreCount = useMemo(
		() => setups.filter((s) => s.score >= 50).length,
		[setups],
	);

	// Priority sort: Actionable first, then score descending
	const sorted = useMemo(() => {
		return [...setups].sort((a, b) => {
			if (a.params.actionable && !b.params.actionable) return -1;
			if (!a.params.actionable && b.params.actionable) return 1;
			return b.score - a.score;
		});
	}, [setups]);

	const filtered = useMemo(() => {
		if (filter === "actionable") {
			return sorted.filter((s) => s.params.actionable);
		}
		if (filter === "high-score") {
			return sorted.filter((s) => s.score >= 50);
		}
		return sorted;
	}, [sorted, filter]);

	return (
		<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
			{/* Header & Filter Controls */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
				<div>
					<h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
						<Workflow className="w-4 h-4 text-slate-700" />
						Intraday Setups & Actionable Playbooks
					</h3>
					<p className="text-xs text-slate-500 mt-0.5">
						8 validated tape reading playbooks with net broker fee RRR
						calculations
					</p>
				</div>

				{/* Segmented Filter Buttons */}
				<div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto">
					<button
						type="button"
						onClick={() => setFilter("all")}
						className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-11 flex items-center justify-center ${
							filter === "all"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						All ({setups.length})
					</button>

					<button
						type="button"
						onClick={() => setFilter("actionable")}
						className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-11 flex items-center justify-center ${
							filter === "actionable"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						Actionable ({actionableCount})
					</button>

					<button
						type="button"
						onClick={() => setFilter("high-score")}
						className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-11 flex items-center justify-center ${
							filter === "high-score"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						High Score ({highScoreCount})
					</button>
				</div>
			</div>

			{/* List of Setups */}
			{filtered.length === 0 ? (
				<div className="py-12 text-center text-slate-400 text-xs">
					No setups matched the selected filter.
				</div>
			) : (
				<div className="space-y-4">
					{filtered.map((setup) => {
						const isActionable = setup.params.actionable;
						const isDanger = setup.params.status.includes("HIGH RISK");
						const isRange = setup.params.status.includes("RANGE");
						const isExpanded = expandedIds[setup.id] ?? isActionable;

						let statusBadge = "bg-slate-100 text-slate-700 border-slate-200";
						let StatusIcon = Clock;

						if (isActionable) {
							statusBadge =
								"bg-emerald-50 text-emerald-800 border-emerald-200 font-bold";
							StatusIcon = CheckCircle2;
						} else if (isDanger) {
							statusBadge =
								"bg-rose-50 text-rose-800 border-rose-200 font-bold";
							StatusIcon = ShieldAlert;
						} else if (isRange) {
							statusBadge =
								"bg-amber-50 text-amber-800 border-amber-200 font-bold";
							StatusIcon = Clock;
						}

						return (
							<div
								key={setup.id}
								className={`rounded-2xl border transition-all ${
									isActionable
										? "border-emerald-300/80 bg-emerald-50/20 shadow-xs"
										: "border-slate-200/80 bg-white"
								}`}
							>
								{/* Setup Header Row */}
								<div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
									<div className="space-y-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className="text-xs font-bold text-slate-400">
												#{setup.id}
											</span>
											<h4 className="text-sm sm:text-base font-bold text-slate-900">
												{setup.name}
											</h4>
											<span
												className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] border ${statusBadge}`}
											>
												<StatusIcon className="w-3 h-3" />
												{setup.params.status}
											</span>
										</div>
									</div>

									{/* Score & Toggle */}
									<div className="flex items-center gap-3 self-end sm:self-auto">
										<div className="text-right">
											<span className="text-xs font-medium text-slate-400 block">
												Probability
											</span>
											<span
												className={`text-sm font-bold font-mono ${
													setup.score >= 80
														? "text-emerald-700"
														: setup.score >= 50
															? "text-slate-800"
															: "text-slate-400"
												}`}
											>
												{setup.score.toFixed(1)}%
											</span>
										</div>

										<button
											type="button"
											onClick={() => toggleExpand(setup.id)}
											className="min-h-11 min-w-11 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
											aria-label={isExpanded ? "Collapse" : "Expand"}
										>
											{isExpanded ? (
												<ChevronUp className="w-5 h-5" />
											) : (
												<ChevronDown className="w-5 h-5" />
											)}
										</button>
									</div>
								</div>

								{/* Setup Parameters Grid */}
								<div className="px-4 sm:px-5 pb-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
									<div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col justify-between">
										<span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
											Entry Zone
										</span>
										<div className="font-bold text-slate-900 leading-snug break-words">
											{setup.params.entry_zone}
										</div>
									</div>

									<div className="p-3 rounded-2xl bg-rose-50/40 border border-rose-100 flex flex-col justify-between">
										<span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 block mb-1">
											Cut Loss (Stop)
										</span>
										<div className="font-bold text-rose-700 leading-snug break-words">
											{setup.params.cut_loss}
										</div>
									</div>

									<div className="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex flex-col justify-between">
										<span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 block mb-1">
											Take Profit 1 (TP1)
										</span>
										<div className="font-bold text-emerald-800 leading-snug break-words">
											{setup.params.tp1}
										</div>
									</div>

									<div className="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex flex-col justify-between">
										<span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 block mb-1">
											Take Profit 2 (TP2)
										</span>
										<div className="font-bold text-emerald-800 leading-snug break-words">
											{setup.params.tp2}
										</div>
									</div>
								</div>

								{/* Execution Governance Panel: RRR, Holding, and Trigger Rule */}
								<div className="mx-4 sm:mx-5 mb-4 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3 text-xs">
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/60">
										<div className="flex items-center gap-2">
											<Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
											<span className="font-semibold text-slate-500">
												Max Holding:
											</span>
											<span className="font-bold text-slate-900 break-words">
												{setup.params.max_holding}
											</span>
										</div>

										{setup.params.rrr && (
											<div className="flex flex-wrap items-center gap-1.5 text-slate-700">
												<span className="font-semibold text-slate-500">
													Risk/Reward:
												</span>
												<span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200/80 break-words">
													{setup.params.rrr}
												</span>
											</div>
										)}
									</div>

									<div className="space-y-1">
										<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
											Execution Trigger Rule
										</span>
										<p className="text-slate-800 font-medium leading-relaxed break-words">
											{setup.params.trigger_rule}
										</p>
									</div>
								</div>

								{/* Collapsible Checklist */}
								{isExpanded && (
									<div className="px-4 sm:px-5 pb-4 pt-1 border-t border-slate-100 space-y-3">
										{/* Conditions Met */}
										{setup.met.length > 0 && (
											<div className="space-y-1.5">
												<span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
													<CheckCircle2 className="w-3.5 h-3.5" />
													Conditions Met ({setup.met.length})
												</span>
												<div className="space-y-1 pl-1">
													{setup.met.map(([title, detail], i) => (
														<div
															key={i}
															className="text-xs text-slate-700 flex items-start gap-2"
														>
															<span className="text-emerald-500 mt-0.5">•</span>
															<div>
																<span className="font-semibold">{title}</span>
																{detail && (
																	<span className="text-slate-500 block text-[11px]">
																		{detail}
																	</span>
																)}
															</div>
														</div>
													))}
												</div>
											</div>
										)}

										{/* Conditions Pending */}
										{setup.pending.length > 0 && (
											<div className="space-y-1.5 pt-1">
												<span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
													<Clock className="w-3.5 h-3.5" />
													Conditions Pending ({setup.pending.length})
												</span>
												<div className="space-y-1 pl-1">
													{setup.pending.map(([title, detail], i) => (
														<div
															key={i}
															className="text-xs text-slate-600 flex items-start gap-2"
														>
															<span className="text-slate-400 mt-0.5">•</span>
															<div>
																<span className="font-medium">{title}</span>
																{detail && (
																	<span className="text-slate-400 block text-[11px]">
																		{detail}
																	</span>
																)}
															</div>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
