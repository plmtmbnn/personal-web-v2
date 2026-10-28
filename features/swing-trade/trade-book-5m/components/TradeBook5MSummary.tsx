"use client";

import {
	Activity,
	ArrowDownRight,
	ArrowUpRight,
	Landmark,
	Layers,
	Wallet,
} from "lucide-react";
import type { BookTotal } from "../types";

interface TradeBook5MSummaryProps {
	total: BookTotal;
	from?: string;
	to?: string;
	date?: string;
}

export default function TradeBook5MSummary({
	total,
	from,
	to,
	date,
}: TradeBook5MSummaryProps) {
	const buyPct = Number.parseFloat(total.buy_percentage) || 0;
	const sellPct = Number.parseFloat(total.sell_percentage) || 0;
	const buyValPct = Number.parseFloat(total.buy_value_percentage) || 0;
	const sellValPct = Number.parseFloat(total.sell_value_percentage) || 0;
	const bmBuyPct = Number.parseFloat(total.big_money_buy_percentage) || 0;
	const bmSellPct = Number.parseFloat(total.big_money_sell_percentage) || 0;

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
				<h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
					Order Book Total Telemetry (5M Multi-Day)
				</h3>
				{(from || to || date) && (
					<span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60 self-start sm:self-auto">
						{from && to ? `${from} → ${to}` : `Date: ${date}`}
					</span>
				)}
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Volume / Lots Card */}
				<div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Total Volume
						</span>
						<div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-700">
							<Layers className="w-4 h-4" aria-hidden />
						</div>
					</div>
					<div>
						<div className="text-2xl font-extrabold text-slate-900 tracking-tight">
							{total.total_lot || "0"}{" "}
							<span className="text-xs font-semibold text-slate-500">lots</span>
						</div>
					</div>
					<div className="space-y-1.5 pt-1 border-t border-slate-100">
						<div className="flex items-center justify-between text-xs">
							<span className="text-emerald-700 font-bold flex items-center gap-1">
								<ArrowUpRight className="w-3.5 h-3.5" aria-hidden /> Buy{" "}
								{buyPct.toFixed(1)}%
							</span>
							<span className="text-rose-700 font-bold flex items-center gap-1">
								Sell {sellPct.toFixed(1)}%{" "}
								<ArrowDownRight className="w-3.5 h-3.5" aria-hidden />
							</span>
						</div>
						<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
							<div
								className="bg-emerald-500 h-full transition-all"
								style={{ width: `${Math.min(100, Math.max(0, buyPct))}%` }}
							/>
							<div
								className="bg-rose-500 h-full transition-all"
								style={{ width: `${Math.min(100, Math.max(0, sellPct))}%` }}
							/>
						</div>
					</div>
				</div>

				{/* Cumulative Turnover Value */}
				<div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Value Distribution
						</span>
						<div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-700">
							<Wallet className="w-4 h-4" aria-hidden />
						</div>
					</div>
					<div>
						<div className="text-lg font-extrabold text-slate-900 tracking-tight truncate">
							{total.buy_value || "Rp 0"}
						</div>
						<div className="text-xs font-medium text-slate-500">
							vs Sell: {total.sell_value || "Rp 0"}
						</div>
					</div>
					<div className="space-y-1.5 pt-1 border-t border-slate-100">
						<div className="flex items-center justify-between text-xs font-bold">
							<span className="text-emerald-700">
								Buy {buyValPct.toFixed(1)}%
							</span>
							<span className="text-rose-700">
								Sell {sellValPct.toFixed(1)}%
							</span>
						</div>
						<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
							<div
								className="bg-emerald-500 h-full transition-all"
								style={{ width: `${Math.min(100, Math.max(0, buyValPct))}%` }}
							/>
							<div
								className="bg-rose-500 h-full transition-all"
								style={{ width: `${Math.min(100, Math.max(0, sellValPct))}%` }}
							/>
						</div>
					</div>
				</div>

				{/* Big Money Concentration */}
				<div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Big Money Flow
						</span>
						<div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-700">
							<Landmark className="w-4 h-4" aria-hidden />
						</div>
					</div>
					<div>
						<div className="text-lg font-extrabold text-indigo-900 tracking-tight truncate">
							Buy {bmBuyPct.toFixed(1)}%
						</div>
						<div className="text-xs font-medium text-slate-500">
							vs Sell {bmSellPct.toFixed(1)}%
						</div>
					</div>
					<div className="space-y-1.5 pt-1 border-t border-slate-100">
						<div className="flex items-center justify-between text-xs font-bold">
							<span className="text-indigo-700">
								Value: {total.big_money_buy_value_percentage || "0%"}
							</span>
							<span className="text-slate-500">
								Sell: {total.big_money_sell_value_percentage || "0%"}
							</span>
						</div>
						<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
							<div
								className="bg-indigo-600 h-full transition-all"
								style={{ width: `${Math.min(100, Math.max(0, bmBuyPct))}%` }}
							/>
							<div
								className="bg-amber-500 h-full transition-all"
								style={{ width: `${Math.min(100, Math.max(0, bmSellPct))}%` }}
							/>
						</div>
					</div>
				</div>

				{/* Transaction Frequency */}
				<div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Order Frequency
						</span>
						<div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-700">
							<Activity className="w-4 h-4" aria-hidden />
						</div>
					</div>
					<div>
						<div className="text-2xl font-extrabold text-slate-900 tracking-tight">
							{total.total_frequency || "0"}{" "}
							<span className="text-xs font-semibold text-slate-500">tx</span>
						</div>
					</div>
					<div className="space-y-1.5 pt-1 border-t border-slate-100 text-xs text-slate-600 font-medium">
						<div className="flex items-center justify-between">
							<span>Buy Tx:</span>
							<span className="font-bold text-slate-900 font-mono">
								{total.buy_frequency || "0"}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span>Sell Tx:</span>
							<span className="font-bold text-slate-900 font-mono">
								{total.sell_frequency || "0"}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
