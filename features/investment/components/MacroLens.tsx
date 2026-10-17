"use client";

import { useMemo } from "react";
import type { InvestmentCompassData } from "@/features/investment/types";
import { sahmRule } from "../lib/indicators";

export default function MacroLens({ data }: { data: InvestmentCompassData }) {
	// Helper to extract the latest value from a FRED MacroSeries
	const getLatest = (seriesId: string) => {
		const series = data.markets.macro?.[seriesId];
		if (!series?.data || series.data.length === 0) return null;
		// FRED series are sorted ascending
		const latest = series.data[series.data.length - 1];
		const prev =
			series.data.length > 1 ? series.data[series.data.length - 2] : null;

		return {
			value: latest.value,
			date: latest.date,
			change: prev ? latest.value - prev.value : null,
		};
	};

	const macroTiles = useMemo(() => {
		const fedFunds = getLatest("FEDFUNDS");
		const cpi = getLatest("CPIAUCSL");
		const m2 = getLatest("M2SL");
		const unrate = getLatest("UNRATE");
		const dgs10 = getLatest("DGS10");
		const yieldCurve = getLatest("T10Y2Y");
		const hySpread = getLatest("BAMLH0A0HYM2");

		const sahm = sahmRule(data.markets.macro?.UNRATE?.data ?? []);

		// DXY from quotes
		const dxy = data.markets.quotes.DXY;
		const pce = getLatest("PCEPILFE");
		const dfii10 = getLatest("DFII10");
		const computedRealYieldVal =
			dgs10 && pce
				? dgs10.value - pce.value
				: dgs10 && cpi
					? dgs10.value - cpi.value
					: null;
		const realYieldVal = dfii10?.value ?? computedRealYieldVal;
		const realYieldChange =
			dfii10?.change ?? (dgs10?.change != null ? dgs10.change : null);

		const usTiles = [
			{
				label: "Fed Funds Rate",
				value: fedFunds ? `${fedFunds.value.toFixed(2)}%` : "---",
				change: fedFunds?.change,
				desc: "Central bank base policy interest rate.",
				isInverse: true,
				historicalMsg:
					fedFunds && fedFunds.value > 5.0
						? "Historically, rates > 5% trigger economic slowdowns within 12-18 months. Equities re-price to lower multiples."
						: undefined,
			},
			{
				label: "US 10Y Real Yield",
				value: realYieldVal != null ? `${realYieldVal.toFixed(2)}%` : "---",
				change: realYieldChange,
				desc: dfii10
					? "TIPS yield, true real cost of capital."
					: "Computed real cost of capital (10Y Yield - Core PCE).",
				isInverse: true,
				historicalMsg:
					realYieldVal != null && realYieldVal > 2.0
						? "Real yields > 2.0% exert heavy valuation discount compression on equities and crypto."
						: undefined,
			},
			{
				label: "10Y Treasury Yield",
				value: dgs10 ? `${dgs10.value.toFixed(2)}%` : "---",
				change: dgs10?.change,
				desc: "Benchmark discount rate for assets.",
				isInverse: true,
				historicalMsg:
					dgs10 && dgs10.value > 4.5
						? "Historically, elevated nominal yields trigger rotation out of high-beta assets into cash/paper."
						: undefined,
			},
			{
				label: "2s10s Yield Curve",
				value: yieldCurve ? `${yieldCurve.value.toFixed(2)}%` : "---",
				change: yieldCurve?.change,
				desc: "Inversion (below 0) signals recession risk.",
				isInverse: false,
				historicalMsg:
					yieldCurve && yieldCurve.value < 0
						? "Historically, curve inversion precedes a recession by 6-24 months. Economic contraction risk."
						: yieldCurve && yieldCurve.value > 0 && yieldCurve.value < 0.5
							? "Rapid un-inversion after a prolonged inversion is typically when macro slowdown shocks materialize."
							: undefined,
			},
			{
				label: "High Yield Spread",
				value: hySpread ? `${hySpread.value.toFixed(2)}%` : "---",
				change: hySpread?.change,
				desc: "Corporate credit risk appetite.",
				isInverse: true,
				historicalMsg:
					hySpread && hySpread.value > 5.0
						? "Historically signals severe credit stress and elevated default probabilities."
						: undefined,
			},
			{
				label: "US Dollar Index",
				value: dxy ? dxy.last?.toFixed(2) : "---",
				change: dxy?.changePct,
				desc: "Global liquidity transmission proxy.",
				isInverse: true,
				historicalMsg:
					dxy?.last && dxy.last > 105
						? "A strong USD drains offshore liquidity and pressures Emerging Markets and Crypto."
						: undefined,
			},
			{
				label: "US CPI (YoY %)",
				value: cpi ? `${cpi.value.toFixed(1)}%` : "---",
				change: cpi?.change,
				desc: "Headline inflation rate.",
				isInverse: true,
				historicalMsg:
					cpi && cpi.value > 3.0
						? "Sticky inflation delays central bank rate easing cycles."
						: undefined,
			},
			{
				label: "US M2 Money Supply",
				value: m2 ? `${m2.value > 0 ? "+" : ""}${m2.value.toFixed(1)}%` : "---",
				change: m2?.change,
				desc: "Broad liquidity expansion YoY rate.",
				isInverse: false,
				historicalMsg:
					m2 && m2.value < 0
						? "Money supply contraction drains systemic cash and caps multiple expansions."
						: undefined,
			},
			{
				label: "Unemployment Rate",
				value: unrate ? `${unrate.value.toFixed(1)}%` : "---",
				change: unrate?.change,
				desc: "Labor market health & Sahm rule.",
				isInverse: true,
				historicalMsg: sahm.triggered
					? `Sahm Rule Triggered (+${sahm.value}% above 12M low): Historically signals an active recession.`
					: undefined,
			},
		];

		return { usTiles };
	}, [data.markets.macro, data.markets.quotes]);

	const renderTile = (tile: any, i: number) => {
		let isBullish = false;
		let isBearish = false;

		if (tile.change && tile.change !== 0) {
			if (tile.isInverse) {
				isBullish = tile.change < 0;
				isBearish = tile.change > 0;
			} else {
				isBullish = tile.change > 0;
				isBearish = tile.change < 0;
			}
		}

		return (
			<div
				key={i}
				className="bg-slate-50/50 rounded-xl p-3.5 sm:p-4 border border-slate-100 flex flex-col justify-between"
			>
				<div>
					<div className="flex justify-between items-start mb-1.5 sm:mb-2">
						<span className="text-xs font-extrabold text-slate-800">
							{tile.label}
						</span>
					</div>
					<div className="flex items-baseline gap-2">
						<span className="text-lg sm:text-xl font-black text-slate-900 truncate">
							{tile.value}
						</span>
						{tile.change != null && (
							<span
								className={`text-[10px] font-bold shrink-0 ${
									isBullish
										? "text-emerald-600"
										: isBearish
											? "text-rose-600"
											: "text-slate-500"
								}`}
							>
								{tile.change > 0 ? "+" : ""}
								{tile.change.toFixed(2)}
							</span>
						)}
					</div>
					<p className="text-[10px] font-semibold text-slate-500 mt-1 leading-snug">
						{tile.desc}
					</p>
				</div>

				{tile.historicalMsg && (
					<div className="mt-3 pt-3 border-t border-slate-200/70">
						<div className="flex items-start gap-1.5">
							<div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1" />
							<p className="text-[10px] font-bold text-slate-600 leading-snug">
								{tile.historicalMsg}
							</p>
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{macroTiles.usTiles.map((tile, i) => renderTile(tile, i))}
			</div>
		</div>
	);
}
