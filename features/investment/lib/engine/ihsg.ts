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

	// 1. IHSG vs 200-Day Moving Average - Weight 20
	const ma200 = sma(ihsgHistory, 200);
	if (ihsgPrice != null && ma200 != null) {
		const dist200 = distancePct(ihsgPrice, ma200);
		const isAbove = dist200 != null && dist200 >= 0;
		const score = isAbove ? 85 : 20;
		const dir = isAbove ? "bullish" : "bearish";

		factors.push({
			key: "ihsg_200ma",
			label: "IHSG vs 200-Day Moving Average",
			valueStr: `${ihsgPrice.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})} (MA: ${ma200.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})})`,
			score,
			weight: 20,
			direction: dir,
			note: isAbove
				? `Trading +${dist200?.toFixed(1)}% above the 200-day baseline. Primary structural bull trend intact.`
				: `Trading ${dist200?.toFixed(1)}% below the 200-day baseline. Primary macro downtrend.`,
			asOf: ihsgQuote?.lastTime ?? undefined,
		});
	}

	// 2. IHSG vs 50-Day Moving Average & Momentum - Weight 15
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
			weight: 15,
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

	// 3. USD/IDR Dual-Condition Matrix: Level + 50-Day MA Momentum - Weight 20
	const usdIdrQuote = data.markets.quotes.USDIDR;
	const usdIdrPrice = usdIdrQuote?.last ?? null;
	const usdIdrHistory = data.markets.history?.["IDR=X"]?.points ?? [];
	const idrMa50 = sma(usdIdrHistory, 50);

	if (usdIdrPrice != null) {
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";
		let note = "Rupiah trading within standard central bank tolerance bands.";

		const idrDist = idrMa50 != null ? distancePct(usdIdrPrice, idrMa50) : null;

		// Dual-condition evaluation: absolute level + 50-day MA momentum
		if (usdIdrPrice >= 16400) {
			// Restrictive/Stress Zone (> Rp 16.400)
			if (idrDist != null && idrDist < -0.5) {
				score = 50;
				dir = "neutral";
				note =
					"Rupiah recovering below 50D MA but remains in elevated stress territory (> Rp 16.400).";
			} else if (idrDist != null && idrDist > 0.5) {
				score = 20;
				dir = "bearish";
				note =
					"Severe Rupiah depreciation above 50D MA in stress territory (> Rp 16.400); triggers foreign capital flight.";
			} else {
				score = 25;
				dir = "bearish";
				note =
					"Rupiah remains elevated above Rp 16.400; currency headwinds pressure valuations.";
			}
		} else if (usdIdrPrice >= 15900) {
			// Watch Zone (Rp 15.900 - 16.400)
			if (idrDist != null && idrDist < -0.5) {
				score = 75;
				dir = "bullish";
				note =
					"Rupiah strengthening below 50D MA; foreign outflow pressure easing.";
			} else if (idrDist != null && idrDist > 1.0) {
				score = 30;
				dir = "bearish";
				note =
					"Rupiah weakening above 50D MA towards critical resistance bands.";
			} else {
				score = 55;
				dir = "neutral";
				note = "Rupiah consolidating within intermediate tolerance range.";
			}
		} else {
			// Favorable Zone (< Rp 15.900)
			if (idrDist != null && idrDist < -0.5) {
				score = 85;
				dir = "bullish";
				note =
					"Strong Rupiah below 50D MA provides broad macro liquidity tailwinds for IDX.";
			} else if (idrDist != null && idrDist > 1.0) {
				score = 55;
				dir = "neutral";
				note =
					"Minor Rupiah pullback within a structurally favorable exchange rate zone.";
			} else {
				score = 75;
				dir = "bullish";
				note =
					"Favorable Rupiah exchange rate (< Rp 15.900) anchors domestic market stability.";
			}
		}

		factors.push({
			key: "usdidr_trend",
			label: "USD/IDR Exchange Rate Trend",
			valueStr: `Rp ${usdIdrPrice.toLocaleString("id-ID")}`,
			score,
			weight: 20,
			direction: dir,
			note,
			asOf: usdIdrQuote?.lastTime ?? undefined,
		});
	}

	// 4. Bank Indonesia Policy Rate & Stance - Weight 15
	const biRateSeries = data.markets.macro?.IRSTCB01IDM156N?.data;
	if (biRateSeries && biRateSeries.length > 0) {
		const latestBi = biRateSeries[biRateSeries.length - 1];
		const prevBi =
			biRateSeries.length > 1 ? biRateSeries[biRateSeries.length - 2] : null;
		const rate = latestBi.value;
		const isCutting = prevBi ? rate < prevBi.value : false;
		const isHiking = prevBi ? rate > prevBi.value : false;

		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";
		let note = `Bank Indonesia policy rate steady at ${rate.toFixed(2)}%.`;

		if (isCutting) {
			score = 85;
			dir = "bullish";
			note = `Bank Indonesia cutting benchmark rate (${rate.toFixed(2)}%), stimulating credit expansion and corporate multiples.`;
		} else if (isHiking) {
			score = 25;
			dir = "bearish";
			note = `Bank Indonesia hiking benchmark rate (${rate.toFixed(2)}%) to defend Rupiah stability; tightening domestic credit.`;
		} else if (rate <= thresholds.macro.biRate.neutral) {
			score = 75;
			dir = "bullish";
			note = `Accommodative domestic rate stance (${rate.toFixed(2)}%) supportive of banking NIM and corporate growth.`;
		} else if (rate >= thresholds.macro.biRate.restrictive) {
			score = 35;
			dir = "bearish";
			note = `Restrictive domestic interest rate (${rate.toFixed(2)}%) maintained to defend FX stability.`;
		} else {
			score = 55;
			dir = "neutral";
			note = `Bank Indonesia benchmark rate steady within neutral policy corridor (${rate.toFixed(2)}%).`;
		}

		factors.push({
			key: "bi_rate",
			label: "Bank Indonesia Policy Rate",
			valueStr: `${rate.toFixed(2)}%`,
			score,
			weight: 15,
			direction: dir,
			note,
			asOf: latestBi.date,
		});

		if (rate >= thresholds.macro.biRate.restrictive) {
			contextFlags.push(`Restrictive BI Rate (${rate.toFixed(2)}%)`);
		}
	}

	// 5. Drawdown from 52-Week High - Weight 10
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

	// 6. Global Macro Liquidity Carry-in - Weight 20
	factors.push({
		key: "global_liquidity_carry",
		label: "Global Liquidity Signal Carry-In",
		valueStr: `${globalScore}/100`,
		score: globalScore,
		weight: 20,
		direction:
			globalScore >= 60 ? "bullish" : globalScore <= 40 ? "bearish" : "neutral",
		note: "Global dollar liquidity strongly dictates foreign institutional flows into IDX.",
	});

	// 7. Active Seasonality - Weight 10
	const activeSeasons = getActiveSeasonality();
	const idSeason = activeSeasons.find((s) => s.market === "ID");
	if (idSeason) {
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";

		if (idSeason.status === "Bullish Tendency") {
			score = 80;
			dir = "bullish";
		} else if (idSeason.status === "Defensive / Consolidation") {
			score = 30;
			dir = "bearish";
		} else if (idSeason.status === "Event Driven") {
			score = 65;
			dir = "bullish";
		}

		factors.push({
			key: "ihsg_seasonality",
			label: "Historical Market Seasonality",
			valueStr: idSeason.title,
			score,
			weight: 10,
			direction: dir,
			note: idSeason.description,
		});

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

	// Context Check: Foreign Institutional Net Flow
	if (data.markets.ihsgFlows?.streakDays != null) {
		const streak = data.markets.ihsgFlows.streakDays;
		contextFlags.push(
			streak > 0
				? `Foreign Capital: +${streak}D Inflow Streak`
				: `Foreign Capital: ${streak}D Outflow Streak`,
		);
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
