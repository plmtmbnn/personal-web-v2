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

interface TradeBookSummaryProps {
	total: BookTotal;
	date?: string;
}

export default function TradeBookSummary({
	total,
	date,
}: TradeBookSummaryProps) {
	const buyPct = Number.parseFloat(total.buy_percentage) || 0;
	const sellPct = Number.parseFloat(total.sell_percentage) || 0;
	const buyValPct = Number.parseFloat(total.buy_value_percentage) || 0;
	const sellValPct = Number.parseFloat(total.sell_value_percentage) || 0;
	const bmBuyPct = Number.parseFloat(total.big_money_buy_percentage) || 0;
	const bmSellPct = Number.parseFloat(total.big_money_sell_percentage) || 0;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
					Order Book Total Telemetry
				</h3>
				{date && (
					<span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">
						Date: {date}
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
							<span className="text-xs font-semibold text-slate-400">lots</span>
						</div>
					</div>
					<div className="space-y-1.5 pt-1 border-t border-slate-100">
						<div className="flex items-center justify-between text-xs">
							<span className="text-emerald-700 font-semibold flex items-center gap-1">
								<ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
								Buy {total.buy_lot || "0"}
							</span>
							<span className="font-bold text-slate-700">
								{buyPct.toFixed(1)}%
							</span>
						</div>
						<div className="flex items-center justify-between text-xs">
							<span className="text-rose-700 font-semibold flex items-center gap-1">
								<ArrowDownRight className="w-3.5 h-3.5" aria-hidden />
								Sell {total.sell_lot || "0"}
							</span>
							<span className="font-bold text-slate-700">
								{sellPct.toFixed(1)}%
							</span>
						</div>
					</div>
				</div>

				{/* Total Value Card */}
				<div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Value Split
						</span>
						<div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-700">
							<Wallet className="w-4 h-4" aria-hidden />
						</div>
					</div>
					<div>
						<div className="text-sm font-bold text-slate-900 truncate">
							Buy: {total.buy_value || "Rp 0"}
						</div>
						<div className="text-sm font-bold text-slate-500 truncate">
							Sell: {total.sell_value || "Rp 0"}
						</div>
					</div>
					<div className="space-y-1.5 pt-1 border-t border-slate-100">
						<div className="flex items-center justify-between text-xs">
							<span className="text-emerald-700 font-semibold">Buy Value</span>
							<span className="font-bold text-slate-700">
								{buyValPct.toFixed(1)}%
							</span>
						</div>
						<div className="flex items-center justify-between text-xs">
							<span className="text-rose-700 font-semibold">Sell Value</span>
							<span className="font-bold text-slate-700">
								{sellValPct.toFixed(1)}%
							</span>
						</div>
					</div>
				</div>

				{/* Big Money Footprint */}
				<div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Big Money
						</span>
						<div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-700">
							<Landmark className="w-4 h-4" aria-hidden />
						</div>
					</div>
					<div>
						<div className="text-2xl font-extrabold text-slate-900 tracking-tight">
							{(bmBuyPct + bmSellPct).toFixed(1)}%{" "}
							<span className="text-xs font-semibold text-slate-400">
								share
							</span>
						</div>
					</div>
					<div className="space-y-1.5 pt-1 border-t border-slate-100">
						<div className="flex items-center justify-between text-xs">
							<span className="text-emerald-700 font-semibold">BM Buy</span>
							<span className="font-bold text-slate-700">
								{bmBuyPct.toFixed(1)}%
							</span>
						</div>
						<div className="flex items-center justify-between text-xs">
							<span className="text-rose-700 font-semibold">BM Sell</span>
							<span className="font-bold text-slate-700">
								{bmSellPct.toFixed(1)}%
							</span>
						</div>
					</div>
				</div>

				{/* Frequency Card */}
				<div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Frequency
						</span>
						<div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700">
							<Activity className="w-4 h-4" aria-hidden />
						</div>
					</div>
					<div>
						<div className="text-2xl font-extrabold text-slate-900 tracking-tight">
							{total.total_frequency || "0"}{" "}
							<span className="text-xs font-semibold text-slate-400">
								trades
							</span>
						</div>
					</div>
					<div className="space-y-1.5 pt-1 border-t border-slate-100">
						<div className="flex items-center justify-between text-xs">
							<span className="text-emerald-700 font-semibold">Buy Freq</span>
							<span className="font-bold text-slate-700">
								{total.buy_frequency || "0"}
							</span>
						</div>
						<div className="flex items-center justify-between text-xs">
							<span className="text-rose-700 font-semibold">Sell Freq</span>
							<span className="font-bold text-slate-700">
								{total.sell_frequency || "0"}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
