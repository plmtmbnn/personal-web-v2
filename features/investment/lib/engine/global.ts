import type {
	InvestmentCompassData,
	MarketRegimeScore,
	RegimeFactor,
} from "../../types";
import type { InvestmentThresholds } from "../../config/thresholds";
import { determineState } from "./states";
import { sahmRule } from "../indicators";

function getFredLatest(
	data: InvestmentCompassData,
	seriesId: string,
): { value: number; date: string } | null {
	const series = data.markets.macro?.[seriesId];
	if (!series?.data || series.data.length === 0) return null;
	const item = series.data[series.data.length - 1];
	return { value: item.value, date: item.date };
}

export function scoreGlobalLiquidity(
	data: InvestmentCompassData,
	thresholds: InvestmentThresholds,
): MarketRegimeScore {
	const factors: RegimeFactor[] = [];
	const contextFlags: string[] = [];

	// 1. US Dollar Index (DXY) - Weight 25
	const dxyQuote = data.markets.quotes.DXY;
	const dxyVal = dxyQuote?.last ?? null;
	if (dxyVal != null) {
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";
		if (dxyVal <= thresholds.dxy.weak) {
			score = 90;
			dir = "bullish";
		} else if (dxyVal <= thresholds.dxy.neutral) {
			score = 75;
			dir = "bullish";
		} else if (dxyVal >= thresholds.dxy.strong) {
			score = 15;
			dir = "bearish";
		} else {
			score = 45;
			dir = "neutral";
		}

		factors.push({
			key: "dxy",
			label: "US Dollar Index (DXY)",
			valueStr: dxyVal.toFixed(2),
			score,
			weight: 25,
			direction: dir,
			note:
				dxyVal >= thresholds.dxy.strong
					? `Elevated USD (${dxyVal.toFixed(1)}) acts as a liquidity headwind for Emerging Markets & Crypto.`
					: `Cooling USD (${dxyVal.toFixed(1)}) supports cross-border liquidity and risk assets.`,
			asOf: dxyQuote?.lastTime ?? undefined,
		});
	}

	// 2. High Yield Spread (Credit Risk) - Weight 25
	const hySpreadObj = getFredLatest(data, "BAMLH0A0HYM2");
	if (hySpreadObj) {
		const spread = hySpreadObj.value;
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";
		if (spread <= thresholds.hySpread.healthy) {
			score = 85;
			dir = "bullish";
		} else if (spread >= thresholds.hySpread.stress) {
			score = 10;
			dir = "bearish";
		} else {
			score = 45;
			dir = "neutral";
		}

		factors.push({
			key: "hy_spread",
			label: "US High-Yield OAS Spread",
			valueStr: `${spread.toFixed(2)}%`,
			score,
			weight: 25,
			direction: dir,
			note:
				spread >= thresholds.hySpread.stress
					? `Widening credit spread (${spread.toFixed(2)}%) signals corporate balance-sheet stress.`
					: `Tight credit spread (${spread.toFixed(2)}%) signals easy corporate refinancing.`,
			asOf: hySpreadObj.date,
		});
	}

	// 3. US 10-Year Treasury Yield - Weight 20
	const dgs10Obj = getFredLatest(data, "DGS10");
	const us10yQuote = data.markets.quotes.US10Y;
	const yield10y = dgs10Obj?.value ?? us10yQuote?.last ?? null;
	if (yield10y != null) {
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";
		if (yield10y <= thresholds.us10y.neutral) {
			score = 80;
			dir = "bullish";
		} else if (yield10y >= thresholds.us10y.stress) {
			score = 20;
			dir = "bearish";
		} else {
			score = 50;
			dir = "neutral";
		}

		factors.push({
			key: "us10y",
			label: "10-Year Treasury Yield",
			valueStr: `${yield10y.toFixed(2)}%`,
			score,
			weight: 20,
			direction: dir,
			note:
				yield10y >= thresholds.us10y.stress
					? `High risk-free rate (${yield10y.toFixed(2)}%) suppresses equity and tech multiples.`
					: `Accommodative long yields (${yield10y.toFixed(2)}%) provide a stable valuation floor.`,
			asOf: dgs10Obj?.date ?? us10yQuote?.lastTime ?? undefined,
		});
	}

	// 4. Market Volatility (VIX) - Weight 15
	const vixQuote = data.markets.quotes.VIX;
	const vixVal = vixQuote?.last ?? null;
	if (vixVal != null) {
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";
		if (vixVal <= thresholds.vix.calm) {
			score = 85;
			dir = "bullish";
		} else if (vixVal >= thresholds.vix.panic) {
			score = 10;
			dir = "bearish";
		} else {
			score = 55;
			dir = "neutral";
		}

		factors.push({
			key: "vix",
			label: "CBOE Volatility Index (VIX)",
			valueStr: vixVal.toFixed(2),
			score,
			weight: 15,
			direction: dir,
			note:
				vixVal >= thresholds.vix.panic
					? `Market volatility spike (${vixVal.toFixed(1)}) indicates sudden risk repricing.`
					: `Complacent or orderly volatility (${vixVal.toFixed(1)}).`,
			asOf: vixQuote?.lastTime ?? undefined,
		});
	}

	// 5. Fed Funds Rate - Weight 15
	const fedFundsObj = getFredLatest(data, "FEDFUNDS");
	if (fedFundsObj) {
		const rate = fedFundsObj.value;
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";
		if (rate <= 3.5) {
			score = 85;
			dir = "bullish";
		} else if (rate >= 5.0) {
			score = 30;
			dir = "bearish";
		} else {
			score = 55;
			dir = "neutral";
		}

		factors.push({
			key: "fed_funds",
			label: "Federal Funds Rate",
			valueStr: `${rate.toFixed(2)}%`,
			score,
			weight: 15,
			direction: dir,
			note:
				rate >= 5.0
					? "Restrictive policy stance keeping global borrowing costs elevated."
					: "Neutral or easing central bank monetary policy.",
			asOf: fedFundsObj.date,
		});
	}

	// Context Check: Sahm Rule
	const unrateSeries = data.markets.macro?.UNRATE?.data;
	if (unrateSeries) {
		const sahm = sahmRule(unrateSeries);
		if (sahm.triggered) {
			contextFlags.push("Sahm Rule Triggered (Recession Risk)");
		}
	}

	// Context Check: 2s10s Yield Curve
	const yieldCurve = getFredLatest(data, "T10Y2Y");
	if (yieldCurve != null) {
		if (yieldCurve.value < 0) {
			contextFlags.push("Yield Curve Inverted");
		} else if (yieldCurve.value >= 0 && yieldCurve.value <= 0.25) {
			contextFlags.push("Yield Curve Un-inverting (Late Cycle)");
		}
	}

	// Compute Weighted Composite
	const totalWeight = 100;
	const availableWeight = factors.reduce((sum, f) => sum + f.weight, 0);
	const coverage = availableWeight / totalWeight;

	const compositeScore =
		availableWeight > 0
			? Math.round(
					factors.reduce((sum, f) => sum + f.score * f.weight, 0) /
						availableWeight,
				)
			: 50;

	const { state, tone } = determineState(compositeScore, coverage, thresholds);

	let headline = "Global Liquidity Conditions Mixed";
	let diagnosis =
		"Neutral cross-currents between monetary yields and risk appetite.";

	if (state === "risk_on") {
		headline = "Accommodative Global Liquidity Environment";
		diagnosis =
			"Falling yields, benign credit spreads, and soft dollar provide strong risk-on tailwinds.";
	} else if (state === "defensive") {
		headline = "Liquidity Headwinds & Dollar Pressure";
		diagnosis =
			"Elevated yields or firm dollar tightening capital flow to emerging markets and high-beta assets.";
	} else if (state === "stress") {
		headline = "Global Macro Liquidity Squeeze";
		diagnosis =
			"Credit spreads blowing out or systemic volatility spikes force capital preservation.";
	}

	return {
		id: "global",
		title: "Global Liquidity Regime",
		marketName: "Macro & Dollar Liquidity",
		state,
		score: compositeScore,
		coverage,
		headline,
		diagnosis,
		tone,
		factors,
		contextFlags,
	};
}
