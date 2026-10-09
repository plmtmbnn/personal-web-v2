import type {
	InvestmentCompassData,
	MarketRegimeScore,
	RegimeFactor,
} from "../../types";
import type { InvestmentThresholds } from "../../config/thresholds";
import { determineState } from "./states";
import {
	sma,
	distancePct,
	maSlopePct,
	getHalvingCyclePhase,
} from "../indicators";
import { getActiveSeasonality } from "../../data/seasonality";

export function scoreCrypto(
	data: InvestmentCompassData,
	thresholds: InvestmentThresholds,
	globalRegime: MarketRegimeScore,
): MarketRegimeScore {
	const factors: RegimeFactor[] = [];
	const contextFlags: string[] = [];

	const halving = getHalvingCyclePhase();
	const activeSeasons = getActiveSeasonality();
	const cryptoSeason = activeSeasons.find((s) => s.market === "Crypto");

	// Dynamic weight calibration based on 4-year Halving Cycle phase
	let wBtc200 = 20;
	let wBtc50 = 10;
	let wStablecoins = 15;
	let wMvrv = 15;
	let wFunding = 10;
	let wFng = 10;
	let wMacro = 20;

	if (halving.monthsElapsed >= 6 && halving.monthsElapsed < 18) {
		// Parabolic / Euphoria window: Elevate contrarian exhaustion risk (funding + extreme greed + MVRV)
		wBtc200 = 20;
		wBtc50 = 5;
		wStablecoins = 15;
		wMvrv = 15;
		wFunding = 15;
		wFng = 15;
		wMacro = 15;
	} else if (halving.monthsElapsed >= 18 && halving.monthsElapsed < 30) {
		// Late-Cycle Distribution: Liquidity redemptions and valuation discount
		wBtc200 = 20;
		wBtc50 = 5;
		wStablecoins = 20;
		wMvrv = 15;
		wFunding = 10;
		wFng = 10;
		wMacro = 20;
	} else if (halving.monthsElapsed >= 30) {
		// Bear Market Floor & Reset: Structural 200D MA baseline reclaim and deep value (MVRV)
		wBtc200 = 25;
		wBtc50 = 10;
		wStablecoins = 15;
		wMvrv = 15;
		wFunding = 10;
		wFng = 10;
		wMacro = 15;
	}

	// Normalize weights down to 90 if seasonality factor is active to maintain strict 100 sum
	if (cryptoSeason) {
		const totalBase =
			wBtc200 + wBtc50 + wStablecoins + wFunding + wFng + wMacro + wMvrv;
		const ratio = 90 / totalBase;
		wBtc200 = Math.round(wBtc200 * ratio);
		wBtc50 = Math.round(wBtc50 * ratio);
		wStablecoins = Math.round(wStablecoins * ratio);
		wFunding = Math.round(wFunding * ratio);
		wFng = Math.round(wFng * ratio);
		wMvrv = Math.round(wMvrv * ratio);
		wMacro = 90 - (wBtc200 + wBtc50 + wStablecoins + wFunding + wFng + wMvrv); // Ensure exact 90
	}

	const btcQuote = data.markets.quotes.BTC;
	const btcPrice = btcQuote?.last ?? null;
	const btcDaily = data.markets.history?.["BTC-USD"]?.points ?? [];

	// 1. BTC vs 200-Day Moving Average
	const ma200 = sma(btcDaily, 200);
	if (btcPrice != null && ma200 != null) {
		const dist200 = distancePct(btcPrice, ma200);
		const isAbove = dist200 != null && dist200 >= 0;
		const score = isAbove ? 85 : 15;
		const dir = isAbove ? "bullish" : "bearish";

		factors.push({
			key: "btc_200ma",
			label: "Bitcoin vs 200-Day Moving Average",
			valueStr: `$${Math.round(btcPrice).toLocaleString("en-US")} (MA: $${Math.round(ma200).toLocaleString("en-US")})`,
			score,
			weight: wBtc200,
			direction: dir,
			note: isAbove
				? `BTC trades +${dist200?.toFixed(1)}% above 200D MA. Macro cycle structure is bullish.`
				: `BTC trades ${dist200?.toFixed(1)}% below 200D MA. Structural macro downtrend.`,
			asOf: btcQuote?.lastTime ?? undefined,
		});
	}

	// 2. BTC 50-Day MA Momentum
	const ma50 = sma(btcDaily, 50);
	const slope50 = maSlopePct(btcDaily, 50, 10);
	if (btcPrice != null && ma50 != null) {
		const dist50 = distancePct(btcPrice, ma50);
		const isAbove50 = dist50 != null && dist50 >= 0;
		const isRising = slope50 != null && slope50 > 0;

		const score = isAbove50 && isRising ? 80 : isAbove50 ? 60 : 25;
		const dir = isAbove50 ? "bullish" : "bearish";

		factors.push({
			key: "btc_50ma",
			label: "BTC Intermediate Momentum (50D MA)",
			valueStr: `${isAbove50 ? "Above" : "Below"} (${dist50 != null && dist50 > 0 ? "+" : ""}${dist50?.toFixed(1)}%)`,
			score,
			weight: wBtc50,
			direction: dir,
			note: isAbove50
				? "Intermediate momentum supportive; moving averages stacked in bullish alignment."
				: "Price struggling below 50-day average.",
			asOf: btcQuote?.lastTime ?? undefined,
		});
	}

	// 3. Stablecoin Net Issuance / Supply 30D Trend
	const flows = data.markets.cryptoFlows;
	if (flows?.stablecoin30dChangePct != null) {
		const change = flows.stablecoin30dChangePct;
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";

		if (change >= thresholds.crypto.stablecoinExpansionPct) {
			score = 85;
			dir = "bullish";
		} else if (change <= thresholds.crypto.stablecoinContractionPct) {
			score = 15;
			dir = "bearish";
		} else {
			score = 55;
			dir = "neutral";
		}

		factors.push({
			key: "stablecoin_supply",
			label: "Stablecoin 30-Day Net Liquidity Flow",
			valueStr: `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`,
			score,
			weight: wStablecoins,
			direction: dir,
			note:
				change > 0
					? `Net new fiat liquidity ($${((flows.totalStablecoinSupplyUsd ?? 0) / 1e9).toFixed(1)}B) entering crypto.`
					: "Stablecoin redemptions indicate capital fleeing digital assets.",
		});
	}

	// 4. BTC Perpetual Funding Rate
	if (flows?.btcFundingRate8hPct != null) {
		const funding = flows.btcFundingRate8hPct;
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";

		if (funding >= thresholds.crypto.fundingOverheated) {
			score = 25; // Overcrowded long = high risk of flush
			dir = "bearish";
		} else if (funding <= thresholds.crypto.fundingHeavilyNegative) {
			score = 30; // Heavy panic shorting
			dir = "bearish";
		} else {
			score = 80; // Healthy neutral funding
			dir = "bullish";
		}

		factors.push({
			key: "btc_funding",
			label: "Perpetual Swap Funding Rate (8h)",
			valueStr: `${funding >= 0 ? "+" : ""}${funding.toFixed(3)}%`,
			score,
			weight: wFunding,
			direction: dir,
			note:
				funding >= thresholds.crypto.fundingOverheated
					? "Overleveraged longs; high vulnerability to cascading squeeze."
					: "Neutral leverage environment. Organic spot-led participation.",
		});
	}

	// 5. Crypto Fear & Greed Index (Contrarian)
	const cryptoFngStr = data.sentiment.crypto?.data?.[0]?.value;
	if (cryptoFngStr) {
		const fngNum = parseInt(cryptoFngStr, 10);
		if (!Number.isNaN(fngNum)) {
			let score = 50;
			let dir: "bullish" | "bearish" | "neutral" = "neutral";
			if (fngNum <= 25) {
				score = 75; // Contrarian buying support
				dir = "bullish";
			} else if (fngNum >= 75) {
				score = 30; // Peak greed warnings
				dir = "bearish";
			} else {
				score = 55;
				dir = "neutral";
			}

			factors.push({
				key: "crypto_fng",
				label: "Crypto Fear & Greed Index",
				valueStr: `${fngNum}/100`,
				score,
				weight: wFng,
				direction: dir,
				note:
					fngNum >= 75
						? "Extreme greed. Do not chase new positions at cycle extensions."
						: fngNum <= 25
							? "Extreme fear. Asymmetric value accumulation zone for spot BTC."
							: "Neutral sentiment.",
			});
		}
	}

	// 6. On-Chain Valuation (MVRV Z-Score)
	if (data.markets.cryptoOnChain?.mvrvZScore != null) {
		const mvrv = data.markets.cryptoOnChain.mvrvZScore;
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";
		if (mvrv <= 1.0) {
			score = 85;
			dir = "bullish";
		} else if (mvrv >= 3.0) {
			score = 15;
			dir = "bearish";
		} else {
			score = 55;
			dir = "neutral";
		}

		factors.push({
			key: "crypto_mvrv",
			label: "Bitcoin MVRV Z-Score",
			valueStr: mvrv.toFixed(2),
			score,
			weight: wMvrv,
			direction: dir,
			note:
				mvrv >= 3.0
					? "Extreme valuation overheat. Generational distribution zone."
					: mvrv <= 1.0
						? "Deep value. Historically generational accumulation floor."
						: "Fair value zone. Neutral momentum.",
		});
	}

	// 7. Global Liquidity Carry-in
	if (globalRegime.state !== "insufficient") {
		factors.push({
			key: "crypto_macro_carry",
			label: "Global Macro Liquidity Carry-In",
			valueStr: `${globalRegime.score}/100`,
			score: globalRegime.score,
			weight: wMacro,
			direction:
				globalRegime.score >= 60
					? "bullish"
					: globalRegime.score <= 40
						? "bearish"
						: "neutral",
			note: "Global dollar liquidity strongly dictates high-beta risk asset flows.",
		});
	}

	// 8. Active Seasonality - Weight 10
	if (cryptoSeason) {
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";

		if (cryptoSeason.status === "Bullish Tendency") {
			score = 80;
			dir = "bullish";
		} else if (cryptoSeason.status === "Defensive / Consolidation") {
			score = 30;
			dir = "bearish";
		} else if (cryptoSeason.status === "Event Driven") {
			score = 65;
			dir = "bullish";
		}

		factors.push({
			key: "crypto_seasonality",
			label: "Historical Crypto Seasonality",
			valueStr: cryptoSeason.title,
			score,
			weight: 10,
			direction: dir,
			note: cryptoSeason.description,
		});

		contextFlags.push(`${cryptoSeason.title}`);
	}

	// Context Check: Halving Cycle Phase
	contextFlags.push(
		`Halving Month +${halving.monthsElapsed}: ${halving.phase}`,
	);

	// Context Check: BTC Dominance
	const btcDom = data.markets.cryptoGlobal?.btcDominance;
	if (btcDom != null) {
		if (btcDom >= thresholds.crypto.altcoinBtcDominanceMax) {
			contextFlags.push(
				`High BTC Dominance (${btcDom.toFixed(1)}%) — Altcoins Suppressed`,
			);
		} else {
			contextFlags.push(
				`Softening BTC Dominance (${btcDom.toFixed(1)}%) — Alt-Rotation Watch`,
			);
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

	let headline = "Crypto Markets Consolidating";
	let diagnosis =
		"BTC trading in neutral structure. Spot accumulation allowed only near major support.";

	if (state === "risk_on") {
		headline = "Crypto Macro Expansion Regime";
		diagnosis =
			"BTC trending cleanly above 200D MA with stablecoin inflows and supportive macro liquidity.";
	} else if (state === "defensive") {
		headline = "Crypto Risk-Off Regime — Reduce Exposure";
		diagnosis =
			"BTC below key trend baselines or stablecoin outflows. Hold cash/stablecoins; pause altcoins.";
	} else if (state === "stress") {
		headline = "Severe Crypto Leverage Flushing";
		diagnosis =
			"Deleveraging cascade. All active trading halted; preserve capital in cold storage.";
	}

	// Evaluate Asymmetric Cycle Extremes
	let asymmetryZone: MarketRegimeScore["asymmetryZone"] = null;
	const mvrv = data.markets.cryptoOnChain?.mvrvZScore;
	const fngScore = data.sentiment.crypto?.data?.[0]?.value
		? parseInt(data.sentiment.crypto.data[0].value, 10)
		: null;

	if (
		(mvrv != null && mvrv <= 1.0) ||
		(fngScore != null && fngScore <= 20 && mvrv != null && mvrv <= 1.25)
	) {
		asymmetryZone = {
			type: "accumulation",
			title: "Generational Asymmetry: Accumulation Zone Active",
			description:
				"Bitcoin is at a historic valuation floor (MVRV <= 1.0) alongside peak sentiment fear. Risk-reward mathematically skews heavily to multi-year spot accumulation.",
		};
	} else if (
		(mvrv != null && mvrv >= 3.0) ||
		(fngScore != null && fngScore >= 80 && mvrv != null && mvrv >= 2.5)
	) {
		asymmetryZone = {
			type: "distribution",
			title: "Cycle Distribution Alert: Macro Overheat Warning",
			description:
				"On-chain valuation is stretched into historical cycle top bands with extreme market greed. Hard profit preservation protocols active.",
		};
	}

	return {
		id: "crypto",
		title: "Crypto Market Regime",
		marketName: "Digital Assets (BTC & Majors)",
		state,
		score: compositeScore,
		coverage,
		headline,
		diagnosis,
		tone,
		factors,
		contextFlags,
		asymmetryZone,
	};
}
