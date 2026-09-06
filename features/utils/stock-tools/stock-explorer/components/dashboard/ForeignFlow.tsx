"use client";

import { useMemo } from "react";
import type { ProcessedStock } from "../../types";
import { ArrowDownRight, ArrowUpRight, Globe } from "lucide-react";

interface ForeignFlowProps {
	stocks: ProcessedStock[];
	onSelectStock?: (stock: ProcessedStock) => void;
}

export default function ForeignFlow({
	stocks,
	onSelectStock,
}: ForeignFlowProps) {
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
		return `${isNeg ? "-" : "+"}${(Math.abs(val) / 1e9).toFixed(1)}B`;
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
						className={`text-[11px] font-black uppercase tracking-wider ${
							isBuy ? "text-emerald-700" : "text-rose-700"
						}`}
					>
						{title}
					</h4>
				</div>
				<div className="space-y-2.5">
					{data.map((s, idx) => (
						<div
							key={s.StockCode}
							onClick={() => onSelectStock?.(s)}
							className="group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all border border-transparent hover:border-slate-200/60"
						>
							<div className="flex justify-between items-center mb-1">
								<span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
									<span className="text-[10px] text-slate-400 font-extrabold mr-1.5">
										{idx + 1}.
									</span>
									{s.StockCode}
								</span>
								<span
									className={`text-xs font-black tabular-nums ${
										isBuy ? "text-emerald-600" : "text-rose-600"
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
						</div>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
			<div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
				<div className="flex items-center gap-2.5">
					<div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
						<Globe className="w-4 h-4" />
					</div>
					<div>
						<h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
							Foreign Capital Flow
						</h3>
						<p className="text-[10px] font-bold text-slate-400">
							Institutional Net Inflow & Outflow
						</p>
					</div>
				</div>
				<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
					IDR Net
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				{renderList(
					"Top Inflow (Accumulation)",
					<ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />,
					topBuy,
					true,
				)}
				{renderList(
					"Top Outflow (Distribution)",
					<ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />,
					topSell,
					false,
				)}
			</div>
		</div>
	);
}
