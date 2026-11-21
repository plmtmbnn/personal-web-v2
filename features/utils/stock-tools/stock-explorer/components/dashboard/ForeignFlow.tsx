"use client";

import { useMemo } from "react";
import type { ProcessedStock } from "../../types";
import { ArrowDownRight, ArrowUpRight, Globe } from "lucide-react";
import { useScreener } from "../../context/ScreenerContext";
import { fmtLots } from "../../utils";

interface ForeignFlowProps {
	stocks: ProcessedStock[];
	onSelectStock?: (stock: ProcessedStock) => void;
}

export default function ForeignFlow({
	stocks,
	onSelectStock,
}: ForeignFlowProps) {
	const screener = useScreener();
	const handleSelect = onSelectStock || screener.setSelectedStock;

	const topBuy = useMemo(
		() => [...stocks].sort((a, b) => b.ForeignNet - a.ForeignNet).slice(0, 5),
		[stocks],
	);
	const topSell = useMemo(
		() => [...stocks].sort((a, b) => a.ForeignNet - b.ForeignNet).slice(0, 5),
		[stocks],
	);

	const formatBillions = (val: number) => {
		const isNeg = val < 0;
		const abs = Math.abs(val);
		if (abs >= 1e12) {
			return `${isNeg ? "-" : "+"}${(abs / 1e12).toFixed(2)}T`;
		}
		return `${isNeg ? "-" : "+"}${(abs / 1e9).toFixed(2)}B`;
	};

	const renderList = (
		title: string,
		icon: React.ReactNode,
		data: ProcessedStock[],
		isBuy: boolean,
	) => {
		const maxVal = Math.max(...data.map((s) => Math.abs(s.ForeignNet)), 1);

		return (
			<div className="flex-1">
				<div className="flex items-center gap-1.5 mb-3">
					{icon}
					<h4
						className={`text-xs font-bold ${
							isBuy ? "text-emerald-800" : "text-rose-800"
						}`}
					>
						{title}
					</h4>
				</div>
				<div className="space-y-2">
					{data.map((s, idx) => (
						<button
							key={s.StockCode}
							type="button"
							onClick={() => handleSelect(s)}
							title={`${s.StockCode} (${s.StockName})\nNet Foreign Value: ${formatBillions(s.ForeignNet)} IDR\nNet Foreign Volume: ${(s.ForeignNetVol / 1e6).toFixed(2)}M shares (${fmtLots(s.ForeignNetVol)})`}
							className="w-full text-left group cursor-pointer hover:bg-slate-50 p-2.5 rounded-xl transition-colors border border-transparent hover:border-slate-200/70 focus-visible:outline-2 focus-visible:outline-indigo-600"
						>
							<div className="flex justify-between items-center mb-1">
								<span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
									<span className="text-xs text-slate-600 font-semibold mr-1.5 tabular-nums">
										{idx + 1}.
									</span>
									{s.StockCode}
								</span>
								<span
									className={`text-xs font-bold tabular-nums ${
										isBuy ? "text-emerald-700" : "text-rose-700"
									}`}
								>
									{formatBillions(s.ForeignNet)}
								</span>
							</div>
							<div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
								<div
									className={`h-full ${
										isBuy ? "bg-emerald-500" : "bg-rose-500"
									} rounded-full transition-all`}
									style={{
										width: `${(Math.abs(s.ForeignNet) / maxVal) * 100}%`,
									}}
								/>
							</div>
						</button>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
			<div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
				<div className="flex items-center gap-2.5">
					<div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
						<Globe className="w-4 h-4" />
					</div>
					<div>
						<h3 className="text-sm font-bold text-slate-900 tracking-tight">
							Foreign capital flow
						</h3>
						<p className="text-xs font-medium text-slate-600">
							Institutional net inflow &amp; outflow
						</p>
					</div>
				</div>
				<span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
					Regular IDR
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				{renderList(
					"Top Inflow",
					<ArrowUpRight className="w-3.5 h-3.5 text-emerald-700" />,
					topBuy,
					true,
				)}
				{renderList(
					"Top Outflow",
					<ArrowDownRight className="w-3.5 h-3.5 text-rose-700" />,
					topSell,
					false,
				)}
			</div>
		</div>
	);
}
