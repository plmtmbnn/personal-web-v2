"use client";

import { useMemo } from "react";
import { PieChart, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import type { InvestmentCompassData } from "@/features/investment/types";
import { generatePlaybook } from "@/features/investment/lib/engine";
import { INSTRUMENT_BY_ID } from "@/features/investment/data/instruments";

export default function SectorRotation({
	data,
}: {
	data: InvestmentCompassData;
}) {
	const { sectorRotation } = useMemo(() => generatePlaybook(data), [data]);

	const getSectorProxy = (id: string) => {
		switch (id) {
			case "XLK":
				return { text: "Proxy: Crypto Majors", type: "bullish" };
			case "XLE":
				return { text: "Proxy: IHSG Energy (ADRO, MEDC)", type: "bullish" };
			case "XLF":
				return { text: "Proxy: IHSG Banks (BBCA, BMRI)", type: "bullish" };
			case "XLB":
				return { text: "Proxy: IHSG Metals (INCO, MDKA)", type: "bullish" };
			case "XLU":
			case "XLP":
				return { text: "DANGER: Move to Cash/Defensives", type: "bearish" };
			case "XLY":
				return { text: "Bullish: Strong Consumer", type: "bullish" };
			default:
				return null;
		}
	};

	const renderSectorPill = (id: string, isOverweight: boolean) => {
		const inst = INSTRUMENT_BY_ID[id];
		if (!inst) return null;

		const quote = data.markets.quotes[id];
		const changePct = quote?.changePct ?? 0;
		const isPositive = changePct >= 0;
		const proxy = getSectorProxy(id);

		return (
			<div
				key={id}
				className={`flex flex-col p-3 rounded-xl border ${
					isOverweight
						? "bg-emerald-50/50 border-emerald-100"
						: "bg-rose-50/50 border-rose-100"
				}`}
			>
				<div className="flex items-center justify-between gap-2 mb-2">
					<div className="flex items-center gap-1.5 min-w-0 flex-1">
						<span className="text-xs font-black text-slate-800 tracking-tight truncate">
							{inst.label}
						</span>
						<span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">
							{inst.id}
						</span>
					</div>
					<div
						className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-white shadow-2xs shrink-0 ${
							isPositive ? "text-emerald-600" : "text-rose-600"
						}`}
					>
						{isPositive ? (
							<TrendingUp className="w-3 h-3" />
						) : (
							<TrendingDown className="w-3 h-3" />
						)}
						{isPositive ? "+" : ""}
						{changePct.toFixed(2)}%
					</div>
				</div>

				{proxy && (
					<div className="flex items-center gap-1.5 mt-1 flex-wrap">
						<ArrowRight
							className={`w-3 h-3 shrink-0 ${proxy.type === "bearish" ? "text-rose-500" : "text-sky-500"}`}
						/>
						<span
							className={`text-[10px] font-extrabold uppercase tracking-wider ${proxy.type === "bearish" ? "text-rose-600 bg-rose-100/50" : "text-sky-600 bg-sky-100/50"} px-2 py-0.5 rounded break-words max-w-full`}
						>
							{proxy.text}
						</span>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-5 sm:space-y-6">
			<div className="flex items-center gap-3 border-b border-slate-100 pb-4">
				<div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
					<PieChart className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
						Sector Rotation
					</h2>
					<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
						Regime-based US ETF Allocations
					</p>
				</div>
			</div>

			<div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/70">
				<div className="flex items-start gap-2.5">
					<ArrowRight className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
					<p className="text-xs font-bold text-slate-700 leading-relaxed">
						{sectorRotation.narrative}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Overweight */}
				<div className="space-y-3">
					<h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 inline-block mb-1">
						Overweight / Watch
					</h3>
					<div className="space-y-2">
						{sectorRotation.overweight.map((id) => renderSectorPill(id, true))}
					</div>
				</div>

				{/* Underweight */}
				<div className="space-y-3">
					<h3 className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 inline-block mb-1">
						Underweight / Avoid
					</h3>
					<div className="space-y-2">
						{sectorRotation.underweight.map((id) =>
							renderSectorPill(id, false),
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
