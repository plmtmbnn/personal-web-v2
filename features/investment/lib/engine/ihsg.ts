import type {
	InvestmentCompassData,
	MarketRegimeScore,
	RegimeFactor,
} from "../../types";
import type { InvestmentThresholds } from "../../config/thresholds";
import { determineState } from "./states";
import { sma, distancePct, maSlopePct, drawdownFromHigh } from "../indicators";
import { getActiveSeasonality } from "../../data/seasonality";

export function scoreIhsg(
	data: InvestmentCompassData,
	thresholds: InvestmentThresholds,
	globalScore: number,
): MarketRegimeScore {
	const factors: RegimeFactor[] = [];
	const contextFlags: string[] = [];

	const ihsgQuote = data.markets.quotes.JKSE ?? data.markets.quotes.IHSG;
	const ihsgPrice = ihsgQuote?.last ?? null;
	const ihsgHistory =
		data.markets.history?.["^JKSE"]?.points ??
		data.markets.history?.JKSE?.points ??
		[];

	// 1. IHSG vs 200-Day Moving Average - Weight 25
	const ma200 = sma(ihsgHistory, 200);
	if (ihsgPrice != null && ma200 != null) {
		const dist200 = distancePct(ihsgPrice, ma200);
		const isAbove = dist200 != null && dist200 >= 0;
		const score = isAbove ? 85 : 20;
		const dir = isAbove ? "bullish" : "bearish";

		factors.push({
			key: "ihsg_200ma",
			label: "IHSG vs 200-Day Moving Average",
			valueStr: `${ihsgPrice.toLocaleString("id-ID")} (MA: ${Math.round(ma200).toLocaleString("id-ID")})`,
			score,
			weight: 25,
			direction: dir,
			note: isAbove
				? `Trading +${dist200?.toFixed(1)}% above the 200-day baseline. Primary structural bull trend intact.`
				: `Trading ${dist200?.toFixed(1)}% below the 200-day baseline. Primary macro downtrend.`,
			asOf: ihsgQuote?.lastTime ?? undefined,
		});
	}

	// 2. IHSG vs 50-Day Moving Average & Momentum - Weight 20
	const ma50 = sma(ihsgHistory, 50);
	const slope50 = maSlopePct(ihsgHistory, 50, 10);
	if (ihsgPrice != null && ma50 != null) {
		const dist50 = distancePct(ihsgPrice, ma50);
		const isAbove50 = dist50 != null && dist50 >= 0;
		const isRising = slope50 != null && slope50 > 0;

		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";
		if (isAbove50 && isRising) {
			score = 85;
			dir = "bullish";
		} else if (isAbove50) {
			score = 65;
			dir = "bullish";
		} else if (isRising) {
			score = 40;
			dir = "neutral";
		} else {
			score = 25;
			dir = "bearish";
		}

		factors.push({
			key: "ihsg_50ma",
			label: "IHSG Intermediate Trend (50-Day MA)",
			valueStr: `${isAbove50 ? "Above" : "Below"} (${dist50 != null && dist50 > 0 ? "+" : ""}${dist50?.toFixed(1)}%)`,
			score,
			weight: 20,
			direction: dir,
			note:
				isAbove50 && isRising
					? "Intermediate trend is upward sloping with positive price momentum."
					: !isAbove50
						? "Price trades below intermediate average; swing rallies face resistance."
						: "Intermediate trend is flat or losing momentum.",
			asOf: ihsgQuote?.lastTime ?? undefined,
		});
	}

	// 3. USD/IDR Trend vs 50-Day MA (FX Pressure) - Weight 20
	const usdIdrQuote = data.markets.quotes.USDIDR;
	const usdIdrPrice = usdIdrQuote?.last ?? null;
	const usdIdrHistory = data.markets.history?.["IDR=X"]?.points ?? [];
	const idrMa50 = sma(usdIdrHistory, 50);

	if (usdIdrPrice != null) {
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";

		if (idrMa50 != null) {
			const idrDist = distancePct(usdIdrPrice, idrMa50);
			// Inverse: USD/IDR falling (below MA) means strong Rupiah = Bullish for stocks!
			if (idrDist != null && idrDist < -0.5) {
				score = 85;
				dir = "bullish";
			} else if (idrDist != null && idrDist > 1.0) {
				score = 25;
				dir = "bearish";
			} else {
				score = 55;
				dir = "neutral";
			}
		} else {
			// Level fallback if history not yet loaded
			if (usdIdrPrice > 16400) {
				score = 25;
				dir = "bearish";
			} else if (usdIdrPrice < 15800) {
				score = 80;
				dir = "bullish";
			} else {
				score = 50;
				dir = "neutral";
			}
		}

		factors.push({
			key: "usdidr_trend",
			label: "USD/IDR Exchange Rate Trend",
			valueStr: `Rp ${usdIdrPrice.toLocaleString("id-ID")}`,
			score,
			weight: 20,
			direction: dir,
			note:
				dir === "bearish"
					? "Rupiah depreciation triggers foreign outflows and tightens domestic liquidity."
					: dir === "bullish"
						? "Stable or strengthening Rupiah attracts foreign institutional capital into big banks."
						: "Rupiah trading within standard central bank tolerance bands.",
			asOf: usdIdrQuote?.lastTime ?? undefined,
		});
	}

	// 4. Drawdown from 52-Week High - Weight 10
	const high52 = ihsgQuote?.high52w ?? null;
	if (ihsgPrice != null && high52 != null) {
		const dd = drawdownFromHigh(ihsgPrice, high52);
		if (dd != null) {
			let score = 50;
			let dir: "bullish" | "bearish" | "neutral" = "neutral";
			if (dd > -5.0) {
				score = 85;
				dir = "bullish";
			} else if (dd > -10.0) {
				score = 70;
				dir = "bullish";
			} else if (dd > -20.0) {
				score = 40;
				dir = "neutral";
			} else {
				score = 15;
				dir = "bearish";
			}

			factors.push({
				key: "ihsg_drawdown",
				label: "Index 52-Week Drawdown",
				valueStr: `${dd.toFixed(1)}%`,
				score,
				weight: 10,
				direction: dir,
				note:
					dd <= -thresholds.ihsg.bearDrawdownPct
						? "Deep index bear drawdown (> -20%). Caution on falling knives."
						: dd <= -thresholds.ihsg.correctionDrawdownPct
							? "Moderate market correction (10-20% off highs)."
							: "Near annual highs or shallow pullback.",
				asOf: ihsgQuote?.lastTime ?? undefined,
			});
		}
	}

	// 5. Global Macro Liquidity Carry-in - Weight 25
	factors.push({
		key: "global_liquidity_carry",
		label: "Global Liquidity Signal Carry-In",
		valueStr: `${globalScore}/100`,
		score: globalScore,
		weight: 25,
		direction:
			globalScore >= 60 ? "bullish" : globalScore <= 40 ? "bearish" : "neutral",
		note: "Global dollar liquidity strongly dictates foreign institutional flows into IDX.",
	});

	// Context Check: Active Seasonality
	const activeSeasons = getActiveSeasonality();
	const idSeason = activeSeasons.find((s) => s.market === "ID");
	if (idSeason) {
		contextFlags.push(`${idSeason.title} (${idSeason.status})`);
	}

	// Context Check: Indonesia 10Y Yield
	const idYieldSeries = data.markets.macro?.IRLTLT01IDM156N?.data;
	if (idYieldSeries && idYieldSeries.length > 0) {
		const latestIdYield = idYieldSeries[idYieldSeries.length - 1].value;
		if (latestIdYield > 7.2) {
			contextFlags.push(`Elevated ID 10Y Yield (${latestIdYield.toFixed(2)}%)`);
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

	let headline = "IHSG Consolidating in Mixed Regime";
	let diagnosis =
		"Index range-bound. Focus on high-dividend blue-chips and disciplined stop-losses.";

	if (state === "risk_on") {
		headline = "IHSG Favorable Bullish Trend";
		diagnosis =
			"Index trending above key moving averages with supportive foreign and domestic liquidity.";
	} else if (state === "defensive") {
		headline = "IHSG Defensive Regime — Capital Preservation";
		diagnosis =
			"Index below intermediate averages or USD/IDR pressure. Close swing longs; hold cash/SBN.";
	} else if (state === "stress") {
		headline = "IHSG Under Heavy Selling Pressure";
		diagnosis =
			"Broad structural breakdown below 200-day baseline. Avoid dip-buying until stabilization.";
	}

	return {
		id: "ihsg",
		title: "IHSG Market Regime",
		marketName: "Indonesian Equities (IDX)",
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
