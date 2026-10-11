"use client";

import { Trash2, RotateCcw, FileText } from "lucide-react";
import type { StockPickWithMetrics } from "../../types";
import {
	fmtIDRPrice,
	fmtSignedPct,
	getExitReasonBadge,
} from "../../stockpicks";

interface ClosedTradesTableProps {
	trades: StockPickWithMetrics[];
	onReopenTrade: (id: string) => void;
	onDeleteTrade: (id: string) => void;
	onViewStockDetail?: (stockCode: string) => void;
}

export function ClosedTradesTable({
	trades,
	onReopenTrade,
	onDeleteTrade,
	onViewStockDetail,
}: ClosedTradesTableProps) {
	if (trades.length === 0) {
		return (
			<div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-xs text-center space-y-3">
				<div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
					<FileText className="w-6 h-6" />
				</div>
				<h3 className="text-sm font-bold text-slate-800">
					No Closed Trades Found
				</h3>
				<p className="text-xs text-slate-400 max-w-sm mx-auto">
					No closed simulation positions match the current filters. Adjust your
					filters or close an active pick to build your trading journal.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="border-b border-slate-100 bg-slate-50/75 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
							<th className="py-3.5 px-4">Instrument & Thesis</th>
							<th className="py-3.5 px-4 text-right">Entry → Exit Price</th>
							<th className="py-3.5 px-4 text-right">Realized P/L</th>
							<th className="py-3.5 px-4 text-center">Holding Period</th>
							<th className="py-3.5 px-4 text-center">Peak & Drawdown</th>
							<th className="py-3.5 px-4">Execution Reason</th>
							<th className="py-3.5 px-4 text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 text-xs">
						{trades.map((trade) => {
							const pnlPct = trade.realizedPlPct ?? trade.unrealizedPlPct;
							const pnlNominal =
								trade.realizedPlNominal ?? trade.unrealizedPlNominal;
							const isProfit = pnlNominal >= 0;
							const exitBadge = getExitReasonBadge(trade.exitReason);
							const exitPrice = trade.closedPrice ?? trade.currentPrice;

							return (
								<tr
									key={trade.id}
									className="hover:bg-slate-50/60 transition-colors group"
								>
									{/* Instrument & Thesis */}
									<td className="py-3.5 px-4">
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => onViewStockDetail?.(trade.stockCode)}
												className="font-mono font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors cursor-pointer text-left"
											>
												{trade.stockCode}
											</button>
											<span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
												{trade.sector}
											</span>
										</div>
										<p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
											{trade.stockName}
										</p>
										<span className="inline-block mt-1 text-[10px] font-medium text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md">
											{trade.thesis || "Custom"}
										</span>
									</td>

									{/* Entry -> Exit Price */}
									<td className="py-3.5 px-4 text-right font-mono">
										<div className="text-slate-900 font-semibold">
											{fmtIDRPrice(trade.buyPrice)}{" "}
											<span className="text-slate-400 font-normal">→</span>{" "}
											{fmtIDRPrice(exitPrice)}
										</div>
										<div className="text-[11px] text-slate-400 mt-0.5">
											{trade.quantityLots} Lots (
											{(trade.quantityLots * 100).toLocaleString("id-ID")} shs)
										</div>
									</td>

									{/* Realized P/L */}
									<td className="py-3.5 px-4 text-right font-mono">
										<div
											className={`font-bold ${
												isProfit ? "text-emerald-600" : "text-rose-600"
											}`}
										>
											{pnlNominal >= 0 ? "+" : ""}
											{fmtIDRPrice(pnlNominal)}
										</div>
										<div
											className={`text-[11px] font-semibold ${
												isProfit ? "text-emerald-700" : "text-rose-700"
											}`}
										>
											{fmtSignedPct(pnlPct)}
										</div>
									</td>

									{/* Holding Period */}
									<td className="py-3.5 px-4 text-center">
										<span className="font-mono font-semibold text-slate-800">
											{trade.holdingDays}{" "}
											{trade.holdingDays === 1 ? "Day" : "Days"}
										</span>
										<div className="text-[10px] text-slate-400 mt-0.5 font-mono">
											{trade.entryDate} → {trade.closedDate || "Closed"}
										</div>
									</td>

									{/* Excursion Watermarks */}
									<td className="py-3.5 px-4 text-center font-mono text-[11px]">
										<div className="flex items-center justify-center gap-2">
											<span
												className="text-emerald-600 font-medium"
												title="Peak gain achieved"
											>
												Peak {fmtSignedPct(trade.peakGainPct)}
											</span>
											<span className="text-slate-300">|</span>
											<span
												className="text-rose-600 font-medium"
												title="Max drawdown endured"
											>
												DD {fmtSignedPct(trade.maxDrawdownPct)}
											</span>
										</div>
									</td>

									{/* Execution Reason */}
									<td className="py-3.5 px-4">
										<span
											className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
												exitBadge.tone === "emerald"
													? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
													: exitBadge.tone === "blue"
														? "bg-blue-50 text-blue-700 border-blue-200/60"
														: exitBadge.tone === "rose"
															? "bg-rose-50 text-rose-700 border-rose-200/60"
															: "bg-slate-50 text-slate-700 border-slate-200/60"
											}`}
										>
											{exitBadge.label}
										</span>
										{trade.exitNotes && (
											<p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1">
												"{trade.exitNotes}"
											</p>
										)}
									</td>

									{/* Actions */}
									<td className="py-3.5 px-4 text-right">
										<div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
											<button
												type="button"
												onClick={() => onReopenTrade(trade.id)}
												title="Reopen position back to active blotter"
												className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
											>
												<RotateCcw className="w-3.5 h-3.5" />
											</button>
											<button
												type="button"
												onClick={() => onDeleteTrade(trade.id)}
												title="Delete trade permanently"
												className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
											>
												<Trash2 className="w-3.5 h-3.5" />
											</button>
										</div>
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
