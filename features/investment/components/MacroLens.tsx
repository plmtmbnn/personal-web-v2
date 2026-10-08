"use client";

import { useMemo } from "react";
import { AreaChart } from "lucide-react";
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
		const id10y = getLatest("IRLTLT01IDM156N");
		const biRate = getLatest("IRSTCB01IDM156N");

		const sahm = sahmRule(data.markets.macro?.UNRATE?.data ?? []);

		// DXY & Indonesia from quotes
		const dxy = data.markets.quotes.DXY;
		const usdIdr = data.markets.quotes.USDIDR;
		const ihsg = data.markets.quotes.JKSE ?? data.markets.quotes.IHSG;

		const usTiles = [
			{
				label: "Fed Funds Rate",
				value: fedFunds ? `${fedFunds.value.toFixed(2)}%` : "---",
				change: fedFunds?.change,
				desc: "Central bank base interest rate.",
				isInverse: true,
				historicalMsg:
					fedFunds && fedFunds.value > 5.0
						? "Historically, rates > 5% trigger economic slowdowns within 12-18 months. Projection: Equities re-price to lower multiples."
						: undefined,
			},
			{
				label: "US CPI (YoY %)",
				value: cpi ? `${cpi.value.toFixed(1)}%` : "---",
				change: cpi?.change,
				desc: "Headline inflation year-over-year rate.",
				isInverse: true,
				historicalMsg:
					cpi && cpi.value > 3.0
						? "Sticky inflation (> 3.0%) delays Fed rate cuts, keeping discount rates elevated."
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
						? "Historically, money supply contractions drain systemic liquidity and cap multiple expansions."
						: undefined,
			},
			{
				label: "Unemployment Rate",
				value: unrate ? `${unrate.value.toFixed(1)}%` : "---",
				change: unrate?.change,
				desc: "Labor market strength.",
				isInverse: true,
				historicalMsg: sahm.triggered
					? `Sahm Rule Triggered (+${sahm.value}% above 12M low): Historically signals an active recession.`
					: undefined,
			},
			{
				label: "10Y Treasury Yield",
				value: dgs10 ? `${dgs10.value.toFixed(2)}%` : "---",
				change: dgs10?.change,
				desc: "Benchmark discount rate.",
				isInverse: true,
				historicalMsg:
					dgs10 && dgs10.value > 4.5
						? "Historically, high risk-free returns trigger equity sell-offs as capital rotates to safety."
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
						? "Historically, curve inversion precedes a recession by 6-24 months. Projection: Economic contraction risk."
						: yieldCurve && yieldCurve.value > 0 && yieldCurve.value < 0.5
							? "Historically, rapid un-inversion after a long inversion is when recessions actually begin."
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
						? "Historically signals severe credit stress. Projection: High likelihood of broad equity market drawdowns."
						: undefined,
			},
			{
				label: "US Dollar Index",
				value: dxy ? dxy.last?.toFixed(2) : "---",
				change: dxy?.changePct,
				desc: "Global liquidity proxy.",
				isInverse: true,
				historicalMsg:
					dxy?.last && dxy.last > 105
						? "Historically, a strong USD triggers liquidity crises in Emerging Markets. Projection: Headwind for IHSG & Crypto."
						: undefined,
			},
		];

		const idTiles = [
			{
				label: "USD/IDR",
				value: usdIdr ? usdIdr.last?.toLocaleString("id-ID") : "---",
				change: usdIdr?.changePct,
				desc: "Rupiah exchange rate.",
				isInverse: true, // rising = weaker IDR
				historicalMsg:
					usdIdr?.last && usdIdr.last > 16000
						? "Historically, a weak Rupiah prompts BI to hike rates, pressuring domestic equities."
						: undefined,
			},
			{
				label: "IHSG",
				value: ihsg ? ihsg.last?.toLocaleString("id-ID") : "---",
				change: ihsg?.changePct,
				desc: "Jakarta Composite Index.",
				isInverse: false,
			},
			{
				label: "Bank Indonesia Rate",
				value: biRate ? `${biRate.value.toFixed(2)}%` : "---",
				change: biRate?.change,
				desc: "Central bank benchmark policy rate.",
				isInverse: true,
				historicalMsg:
					biRate && biRate.value >= 6.0
						? "Historically, high BI rates increase borrowing costs and pressure real estate/bank lending."
						: undefined,
			},
			{
				label: "Indonesia 10Y Gov Yield",
				value: id10y ? `${id10y.value.toFixed(2)}%` : "---",
				change: id10y?.change,
				desc: "Sovereign borrowing benchmark rate.",
				isInverse: true,
			},
		];

		return { usTiles, idTiles };
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
		<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-5 sm:space-y-6">
			<div className="flex items-center gap-3 border-b border-slate-100 pb-4">
				<div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
					<AreaChart className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
						Macro Lens
					</h2>
					<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
						Global Cycle &amp; Economic Indicators
					</p>
				</div>
			</div>

			<div className="space-y-6">
				<div>
					<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
						US Macro &amp; Liquidity
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{macroTiles.usTiles.map((tile, i) => renderTile(tile, i))}
					</div>
				</div>

				<div>
					<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
						Indonesia Macro
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{macroTiles.idTiles.map((tile, i) => renderTile(tile, i))}
					</div>
				</div>
			</div>
		</div>
	);
}
