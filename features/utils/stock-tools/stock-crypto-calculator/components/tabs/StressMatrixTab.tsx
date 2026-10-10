"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";
import type { ConsolidatedStats, CurrencyCode } from "../../types";
import {
	calculateScenarioPoints,
	formatCurrency,
	formatPercent,
} from "../../utils";

interface StressMatrixTabProps {
	stats: ConsolidatedStats;
	currency: CurrencyCode;
}

export default function StressMatrixTab({
	stats,
	currency,
}: StressMatrixTabProps) {
	const hasHoldings = stats.totalUnits > 0 && stats.netAverage > 0;

	const scenarioPoints = useMemo(() => {
		if (!hasHoldings) return [];
		return calculateScenarioPoints(stats, currency);
	}, [stats, currency, hasHoldings]);

	if (!hasHoldings) {
		return (
			<div className="py-12 px-4 text-center space-y-3">
				<div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center mx-auto text-slate-400">
					<Activity className="w-6 h-6" />
				</div>
				<h4 className="text-sm font-bold text-slate-800">
					No Active Position to Simulate
				</h4>
				<p className="text-xs text-slate-500 max-w-sm mx-auto">
					Enter orders in the accumulation blotter above to simulate potential
					market shock scenarios and portfolio P&L sensitivity.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-5">
			{/* Explanation Header */}
			<div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
				<div>
					<h4 className="text-sm font-bold text-slate-900">
						P&amp;L Market Shock Sensitivity Matrix
					</h4>
					<p className="text-xs text-slate-500 mt-0.5">
						Stress test your consolidated position against upside breakouts and
						downside drawdowns.
					</p>
				</div>
				<span className="text-[11px] font-semibold text-slate-400 font-mono">
					Base Cost: {formatCurrency(stats.netAverage, currency)}
				</span>
			</div>

			{/* Full-Width Matrix Table */}
			<div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
				<table className="w-full text-left text-xs border-collapse">
					<thead>
						<tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
							<th className="py-3 px-3.5 sm:px-4 font-bold">Market Scenario</th>
							<th className="py-3 px-3.5 sm:px-4 font-bold">Simulated Price</th>
							<th className="py-3 px-3.5 sm:px-4 font-bold">Portfolio Value</th>
							<th className="py-3 px-3.5 sm:px-4 font-bold text-right">
								Unrealized P&amp;L
							</th>
							<th className="py-3 px-3.5 sm:px-4 font-bold text-right">
								Net Return
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 font-mono">
						{scenarioPoints.map((point) => {
							const isBase = point.percentDelta === 0;
							const isProfit = point.unrealizedPl > 0;

							return (
								<tr
									key={point.percentDelta}
									className={`transition-colors ${
										isBase
											? "bg-slate-100/70 font-semibold"
											: "hover:bg-slate-50/60"
									}`}
								>
									{/* Scenario Delta */}
									<td className="py-3 px-3.5 sm:px-4">
										<span
											className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${
												isBase
													? "bg-slate-200 text-slate-800"
													: isProfit
														? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
														: "bg-rose-50 text-rose-700 border border-rose-200/60"
											}`}
										>
											{formatPercent(point.percentDelta)}
										</span>
										{isBase && (
											<span className="ml-2 text-[10px] font-sans font-medium text-slate-500">
												(Current Cost Basis)
											</span>
										)}
									</td>

									{/* Simulated Price */}
									<td className="py-3 px-3.5 sm:px-4 font-semibold text-slate-900 tabular-nums">
										{formatCurrency(point.price, currency)}
									</td>

									{/* Portfolio Value */}
									<td className="py-3 px-3.5 sm:px-4 text-slate-700 tabular-nums">
										{formatCurrency(point.marketValue, currency)}
									</td>

									{/* Unrealized P&L */}
									<td
										className={`py-3 px-3.5 sm:px-4 text-right font-semibold tabular-nums ${
											isBase
												? "text-slate-500"
												: isProfit
													? "text-emerald-600"
													: "text-rose-600"
										}`}
									>
										{isBase
											? "Rp 0"
											: `${isProfit ? "+" : ""}${formatCurrency(point.unrealizedPl, currency)}`}
									</td>

									{/* Net Return % */}
									<td
										className={`py-3 px-3.5 sm:px-4 text-right font-bold tabular-nums ${
											isBase
												? "text-slate-500"
												: isProfit
													? "text-emerald-600"
													: "text-rose-600"
										}`}
									>
										{formatPercent(point.plPercent)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
