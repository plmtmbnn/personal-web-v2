"use client";

import { Compass, ShieldCheck } from "lucide-react";
import type { ClosedTradesSummary } from "../../types";
import { fmtIDRPrice, getExitReasonBadge } from "../../stockpicks";

interface ThesisAttributionCardsProps {
	summary: ClosedTradesSummary;
}

export function ThesisAttributionCards({
	summary,
}: ThesisAttributionCardsProps) {
	if (summary.totalClosed === 0) return null;

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
			{/* Panel 1: Thesis Alpha Attribution */}
			<div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
				<div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
					<div className="flex items-center gap-2">
						<div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
							<Compass className="w-4 h-4" />
						</div>
						<div>
							<h2 className="text-sm font-bold text-slate-900">
								Investment Compass Alpha Attribution
							</h2>
							<p className="text-xs text-slate-600">
								Win rate and return broken down by core thesis
							</p>
						</div>
					</div>
					<span className="text-xs font-mono font-semibold text-slate-600">
						{summary.thesisBreakdown.length} Theses Tested
					</span>
				</div>

				<div className="space-y-3">
					{summary.thesisBreakdown.map((item) => {
						const isProfit = item.totalPlNominal >= 0;
						return (
							<div
								key={item.thesis}
								className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/50 space-y-2"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="text-xs font-bold text-slate-800">
											{item.thesis}
										</span>
										<span className="text-xs px-1.5 py-0.5 rounded-md bg-slate-200/60 font-mono text-slate-700">
											{item.count} {item.count === 1 ? "trade" : "trades"}
										</span>
									</div>
									<div className="text-right">
										<span
											className={`text-xs font-bold font-mono ${
												isProfit ? "text-emerald-700" : "text-rose-700"
											}`}
										>
											{item.totalPlNominal >= 0 ? "+" : ""}
											{fmtIDRPrice(item.totalPlNominal)}
										</span>
									</div>
								</div>

								{/* Win Rate Progress Bar */}
								<div>
									<div className="flex items-center justify-between text-xs text-slate-600 mb-1">
										<span>Win Rate</span>
										<span className="font-mono font-semibold text-slate-800">
											{item.winRate}%
										</span>
									</div>
									<div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
										<div
											className={`h-full rounded-full transition-all duration-300 ${
												item.winRate >= 50 ? "bg-emerald-500" : "bg-amber-500"
											}`}
											style={{ width: `${Math.max(4, item.winRate)}%` }}
										/>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Panel 2: Exit Discipline Breakdown */}
			<div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
				<div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
					<div className="flex items-center gap-2">
						<div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
							<ShieldCheck className="w-4 h-4" />
						</div>
						<div>
							<h2 className="text-sm font-bold text-slate-900">
								Exit Discipline & Execution Quality
							</h2>
							<p className="text-xs text-slate-600">
								Auditing adherence to profit targets vs discretionary cuts
							</p>
						</div>
					</div>
					<span className="text-xs font-mono font-semibold text-slate-600">
						{summary.totalClosed} Exits
					</span>
				</div>

				<div className="space-y-3">
					{summary.exitReasonBreakdown.map((item) => {
						const badge = getExitReasonBadge(item.reason);
						const isProfit = item.totalPlNominal >= 0;
						const pctOfTotal = Math.round(
							(item.count / summary.totalClosed) * 100,
						);

						return (
							<div
								key={item.reason}
								className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/50 space-y-2"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="text-xs font-bold text-slate-800">
											{badge.label}
										</span>
										<span className="text-xs px-1.5 py-0.5 rounded-md bg-slate-200/60 font-mono text-slate-700">
											{item.count} ({pctOfTotal}%)
										</span>
									</div>
									<div className="text-right">
										<span
											className={`text-xs font-bold font-mono ${
												isProfit ? "text-emerald-700" : "text-rose-700"
											}`}
										>
											{item.totalPlNominal >= 0 ? "+" : ""}
											{fmtIDRPrice(item.totalPlNominal)}
										</span>
									</div>
								</div>

								{/* Frequency Bar */}
								<div>
									<div className="flex items-center justify-between text-xs text-slate-600 mb-1">
										<span>Discipline Frequency</span>
										<span className="font-mono font-semibold text-slate-800">
											{pctOfTotal}% of trades
										</span>
									</div>
									<div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
										<div
											className={`h-full rounded-full transition-all duration-300 ${
												badge.tone === "emerald"
													? "bg-emerald-500"
													: badge.tone === "blue"
														? "bg-blue-500"
														: badge.tone === "rose"
															? "bg-rose-500"
															: "bg-slate-500"
											}`}
											style={{ width: `${Math.max(4, pctOfTotal)}%` }}
										/>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
