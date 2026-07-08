import { useMemo } from "react";
import type { ProcessedStock } from "../../types";

interface ForeignFlowProps {
	stocks: ProcessedStock[];
}

export default function ForeignFlow({ stocks }: ForeignFlowProps) {
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
		data: ProcessedStock[],
		isBuy: boolean,
	) => {
		const color = isBuy ? "text-emerald-600" : "text-rose-600";
		const maxVal = Math.max(...data.map((s) => Math.abs(s.ForeignNet)));

		return (
			<div className="flex-1">
				<h4
					className={`text-[10px] font-black uppercase tracking-widest mb-4 ${color}`}
				>
					{title}
				</h4>
				<div className="space-y-3">
					{data.map((s, idx) => (
						<div key={s.StockCode} className="relative">
							<div className="flex justify-between items-end mb-1 relative z-10">
								<span className="text-xs font-bold text-slate-700">
									{idx + 1}. {s.StockCode}
								</span>
								<span className={`text-[10px] font-black ${color}`}>
									{formatBillions(s.ForeignNet)}
								</span>
							</div>
							<div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
								<div
									className={`h-full ${isBuy ? "bg-emerald-400" : "bg-rose-400"} rounded-full`}
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
		<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
			<h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
				Foreign Flow Analysis
			</h3>
			<div className="flex flex-col gap-6 flex-1">
				{renderList("Top Accumulation", topBuy, true)}
				{renderList("Top Distribution", topSell, false)}
			</div>
		</div>
	);
}
