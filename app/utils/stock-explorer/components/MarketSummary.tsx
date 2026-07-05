"use client";

import { useState } from "react";
import {
	TrendingUp,
	TrendingDown,
	Globe,
	Flame,
	DollarSign,
	ArrowRightLeft,
} from "lucide-react";
import type { ProcessedStock } from "../View";
import { fmtCompact, fmtPct } from "../utils";
import BreadthGauge from "./BreadthGauge";

interface MarketSummaryProps {
	stocks: ProcessedStock[];
	date: string;
}

const MarketSummary = ({ stocks, date: _date }: MarketSummaryProps) => {
	const [tab, setTab] = useState<"movers" | "foreign" | "volume">("movers");

	const total = stocks.length;
	const advancers = stocks.filter((s) => s.Change > 0).length;
	const decliners = stocks.filter((s) => s.Change < 0).length;
	const unchanged = total - advancers - decliners;
	const totalValue = stocks.reduce((a, s) => a + s.Value, 0);
	const totalVolume = stocks.reduce((a, s) => a + s.Volume, 0);
	const totalFrequency = stocks.reduce((a, s) => a + s.Frequency, 0);
	const totalForeignBuy = stocks.reduce((a, s) => a + (s.ForeignBuy || 0), 0);
	const totalForeignSell = stocks.reduce((a, s) => a + (s.ForeignSell || 0), 0);
	const totalForeignNet = totalForeignBuy - totalForeignSell;
	const avgChangePct =
		total > 0 ? stocks.reduce((a, s) => a + s.ChangePct, 0) / total : 0;
	const highVolCount = stocks.filter((s) => s.IsHighVolume).length;
	const fgnNetBuy = stocks.filter((s) => s.ForeignNet > 0).length;

	const topGainers = [...stocks]
		.sort((a, b) => b.ChangePct - a.ChangePct)
		.slice(0, 5);
	const topLosers = [...stocks]
		.sort((a, b) => a.ChangePct - b.ChangePct)
		.slice(0, 5);
	const topVolume = [...stocks].sort((a, b) => b.Volume - a.Volume).slice(0, 5);
	const topForeignNet = [...stocks]
		.sort((a, b) => b.ForeignNet - a.ForeignNet)
		.slice(0, 5);
	const topForeignBuy = [...stocks]
		.sort((a, b) => b.ForeignBuy - a.ForeignBuy)
		.slice(0, 5);
	const topForeignSell = [...stocks]
		.sort((a, b) => b.ForeignSell - a.ForeignSell)
		.slice(0, 5);

	const tabs = [
		{ key: "movers" as const, label: "Top Movers", icon: TrendingUp },
		{ key: "foreign" as const, label: "Foreign Flow", icon: Globe },
		{ key: "volume" as const, label: "Volume Leaders", icon: Flame },
	];

	return (
		<div className="mb-8 space-y-4">
			{/* ── Row 1: KPI Cards ── */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
				{/* Breadth */}
				<div className="col-span-2 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-6">
					<BreadthGauge
						advancers={advancers}
						decliners={decliners}
						unchanged={unchanged}
						total={total}
					/>
					<div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4 w-full">
						{[
							{ label: "Instruments", value: total, color: "text-stone-900" },
							{
								label: "Avg. Change",
								value: fmtPct(avgChangePct),
								color: avgChangePct >= 0 ? "text-emerald-600" : "text-rose-500",
							},
							{
								label: "High Vol.",
								value: highVolCount,
								color: "text-amber-600",
							},
							{
								label: "Fgn. Net Buy",
								value: fgnNetBuy,
								color: "text-sky-600",
							},
						].map(({ label, value, color }) => (
							<div key={label}>
								<p className="text-[8px] font-black uppercase tracking-[0.3em] text-stone-400 mb-0.5">
									{label}
								</p>
								<p
									className={`text-2xl font-black tabular-nums leading-tight ${color}`}
								>
									{value}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Total Value */}
				<div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
					<div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-50 rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
					<div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
						<DollarSign className="w-4 h-4" />
					</div>
					<p className="text-[8px] font-black uppercase tracking-[0.3em] text-stone-400">
						Total Value
					</p>
					<p className="text-2xl font-black text-stone-900 tabular-nums leading-tight mt-1">
						{fmtCompact(totalValue)}
					</p>
					<p className="text-[9px] font-bold text-stone-400 mt-0.5">
						IDR traded today
					</p>
					<div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5">
						<div className="flex justify-between text-[9px] font-black">
							<span className="text-stone-400 uppercase tracking-wider">
								Volume
							</span>
							<span className="text-stone-700 tabular-nums">
								{fmtCompact(totalVolume)}
							</span>
						</div>
						<div className="flex justify-between text-[9px] font-black">
							<span className="text-stone-400 uppercase tracking-wider">
								Transactions
							</span>
							<span className="text-stone-700 tabular-nums">
								{fmtCompact(totalFrequency)}
							</span>
						</div>
					</div>
				</div>

				{/* Foreign Net */}
				<div
					className={`bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden group transition-colors ${totalForeignNet >= 0 ? "border border-emerald-200 hover:border-emerald-300" : "border border-rose-200 hover:border-rose-300"}`}
				>
					<div
						className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-50 group-hover:opacity-80 transition-opacity ${totalForeignNet >= 0 ? "bg-emerald-50" : "bg-rose-50"}`}
					/>
					<div
						className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${totalForeignNet >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500"}`}
					>
						<Globe className="w-4 h-4" />
					</div>
					<p className="text-[8px] font-black uppercase tracking-[0.3em] text-stone-400">
						Foreign Net
					</p>
					<p
						className={`text-2xl font-black tabular-nums leading-tight mt-1 ${totalForeignNet >= 0 ? "text-emerald-600" : "text-rose-500"}`}
					>
						{fmtCompact(totalForeignNet)}
					</p>
					<p className="text-[9px] font-bold text-stone-400 mt-0.5">
						IDR net flow today
					</p>
					<div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5">
						<div className="flex justify-between text-[9px] font-black">
							<span className="text-stone-400 uppercase tracking-wider">
								Buy
							</span>
							<span className="text-stone-700 tabular-nums">
								{fmtCompact(totalForeignBuy)}
							</span>
						</div>
						<div className="flex justify-between text-[9px] font-black">
							<span className="text-stone-400 uppercase tracking-wider">
								Sell
							</span>
							<span className="text-stone-700 tabular-nums">
								{fmtCompact(totalForeignSell)}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* ── Row 2: Top Movers ── */}
			<div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
				<div className="flex items-center gap-4 mb-4">
					{tabs.map((t) => (
						<button
							key={t.key}
							onClick={() => setTab(t.key)}
							className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${tab === t.key ? "bg-stone-100 text-stone-900" : "text-stone-400 hover:bg-stone-50"}`}
							aria-selected={tab === t.key}
							role="tab"
						>
							<t.icon className="w-3 h-3" />
							{t.label}
						</button>
					))}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{tab === "movers" && (
						<>
							<div className="space-y-2">
								<p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
									<TrendingUp className="w-3 h-3" /> Top Gainers
								</p>
								{topGainers.map((s) => (
									<div
										key={s.StockCode}
										className="flex justify-between items-center text-xs"
									>
										<div className="flex items-center gap-2">
											<span className="font-mono font-bold">{s.StockCode}</span>
											<span className="text-stone-500">{s.StockName}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-mono">
												{s.Close.toLocaleString()}
											</span>
											<span className="font-mono text-emerald-600">
												+{s.ChangePct.toFixed(2)}%
											</span>
										</div>
									</div>
								))}
							</div>
							<div className="space-y-2">
								<p className="text-xs font-bold text-rose-500 flex items-center gap-1">
									<TrendingDown className="w-3 h-3" /> Top Losers
								</p>
								{topLosers.map((s) => (
									<div
										key={s.StockCode}
										className="flex justify-between items-center text-xs"
									>
										<div className="flex items-center gap-2">
											<span className="font-mono font-bold">{s.StockCode}</span>
											<span className="text-stone-500">{s.StockName}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-mono">
												{s.Close.toLocaleString()}
											</span>
											<span className="font-mono text-rose-500">
												{s.ChangePct.toFixed(2)}%
											</span>
										</div>
									</div>
								))}
							</div>
						</>
					)}

					{tab === "foreign" && (
						<>
							<div className="space-y-2">
								<p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
									<Globe className="w-3 h-3" /> Top Foreign Buy
								</p>
								{topForeignBuy.map((s) => (
									<div
										key={s.StockCode}
										className="flex justify-between items-center text-xs"
									>
										<div className="flex items-center gap-2">
											<span className="font-mono font-bold">{s.StockCode}</span>
											<span className="text-stone-500">{s.StockName}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-mono">
												{fmtCompact(s.ForeignBuy)}
											</span>
											<span className="font-mono text-emerald-600">
												+{s.ForeignNet > 0 ? "+" : ""}
												{fmtCompact(s.ForeignNet)}
											</span>
										</div>
									</div>
								))}
							</div>
							<div className="space-y-2">
								<p className="text-xs font-bold text-rose-500 flex items-center gap-1">
									<Globe className="w-3 h-3" /> Top Foreign Sell
								</p>
								{topForeignSell.map((s) => (
									<div
										key={s.StockCode}
										className="flex justify-between items-center text-xs"
									>
										<div className="flex items-center gap-2">
											<span className="font-mono font-bold">{s.StockCode}</span>
											<span className="text-stone-500">{s.StockName}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-mono">
												{fmtCompact(s.ForeignSell)}
											</span>
											<span className="font-mono text-rose-500">
												{fmtCompact(s.ForeignNet)}
											</span>
										</div>
									</div>
								))}
							</div>
							<div className="space-y-2">
								<p className="text-xs font-bold text-sky-600 flex items-center gap-1">
									<ArrowRightLeft className="w-3 h-3" /> Top Foreign Net
								</p>
								{topForeignNet.map((s) => (
									<div
										key={s.StockCode}
										className="flex justify-between items-center text-xs"
									>
										<div className="flex items-center gap-2">
											<span className="font-mono font-bold">{s.StockCode}</span>
											<span className="text-stone-500">{s.StockName}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-mono">
												{s.ForeignNet > 0 ? "+" : ""}
												{fmtCompact(s.ForeignNet)}
											</span>
										</div>
									</div>
								))}
							</div>
						</>
					)}

					{tab === "volume" && (
						<div className="space-y-2 md:col-span-2">
							<p className="text-xs font-bold text-amber-600 flex items-center gap-1">
								<Flame className="w-3 h-3" /> Top Volume
							</p>
							{topVolume.map((s) => (
								<div
									key={s.StockCode}
									className="flex justify-between items-center text-xs"
								>
									<div className="flex items-center gap-2">
										<span className="font-mono font-bold">{s.StockCode}</span>
										<span className="text-stone-500">{s.StockName}</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="font-mono">{fmtCompact(s.Volume)}</span>
										<span className="font-mono">
											{s.ChangePct > 0 ? "+" : ""}
											{s.ChangePct.toFixed(2)}%
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default MarketSummary;
