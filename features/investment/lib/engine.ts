import type {
	InvestmentCompassData,
	EngineOutput,
	PlaybookRecommendation,
	AssetStance,
	MarketRegime,
	TimeframeGuideline,
	SectorGuidance,
} from "../types";

/**
 * Helper to get the latest value of a FRED series
 */
function getFredLatest(
	data: InvestmentCompassData,
	seriesId: string,
): number | null {
	const series = data.markets.macro?.[seriesId];
	if (!series?.data || series.data.length === 0) return null;
	return series.data[series.data.length - 1].value;
}

/**
 * Pure function to derive the advanced playbook and allocation from live market data.
 */
export function generatePlaybook(data: InvestmentCompassData): EngineOutput {
	// --- Extract Signals ---
	const cnnScore = data.sentiment.traditional?.fear_and_greed?.score ?? 50;
	const cryptoScore = data.sentiment.crypto?.data?.[0]?.value
		? parseInt(data.sentiment.crypto.data[0].value, 10)
		: 50;

	// Macro signals
	const fedFunds = getFredLatest(data, "FEDFUNDS"); // e.g. 5.33
	const dgs10 = getFredLatest(data, "DGS10"); // e.g. 4.5
	const yieldCurve = getFredLatest(data, "T10Y2Y"); // e.g. -0.3 (inverted)
	const hySpread = getFredLatest(data, "BAMLH0A0HYM2"); // e.g. 3.2

	const dxy = data.markets.quotes.DXY?.last ?? 100;

	// Calculate Regime based on composite signals
	let regime: MarketRegime;
	if (cnnScore < 35 && hySpread && hySpread > 5.0) {
		regime = {
			key: "capitulation",
			title: "Risk-Off Capitulation",
			stance: "Defensive",
			headline: "High stress and liquidity withdrawal.",
			diagnosis:
				"Credit spreads are widening and equity sentiment is extremely pessimistic.",
			tone: "negative",
			riskAppetite: 1,
			divergence: 0,
			playbook: {
				favored: ["Cash", "Bonds", "Gold"],
				risks: ["High Beta Equities", "Crypto"],
				posture: "Defensive",
			},
		};
	} else if (cnnScore > 65 && dgs10 && dgs10 < 4.5) {
		regime = {
			key: "expansion",
			title: "Goldilocks Expansion",
			stance: "Risk-On",
			headline: "Accommodative yields powering equity rallies.",
			diagnosis: "Sentiment is strong and yields are supportive of valuations.",
			tone: "positive",
			riskAppetite: 9,
			divergence: 0,
			playbook: {
				favored: ["US Equities", "Crypto"],
				risks: ["Cash"],
				posture: "Aggressive",
			},
		};
	} else if (cnnScore > 65 && dgs10 && dgs10 >= 4.5) {
		regime = {
			key: "speculative_decoupling",
			title: "Speculative Decoupling",
			stance: "Cautious Bull",
			headline: "Equities ignoring higher yields.",
			diagnosis:
				"Valuations are stretching while discount rates remain elevated. Vulnerable to shocks.",
			tone: "caution",
			riskAppetite: 7,
			divergence: 1,
			playbook: {
				favored: ["Quality Equities", "Commodities"],
				risks: ["Unprofitable Tech"],
				posture: "Tactical",
			},
		};
	} else {
		regime = {
			key: "defensive_rotation",
			title: "Range-Bound Rotation",
			stance: "Neutral",
			headline: "Markets seeking direction.",
			diagnosis:
				"Mixed macro signals lead to sector rotation rather than broad beta rallies.",
			tone: "neutral",
			riskAppetite: 5,
			divergence: 0,
			playbook: {
				favored: ["Value", "Dividend Growth"],
				risks: ["High Beta"],
				posture: "Balanced",
			},
		};
	}

	// --- Generate Recommendations ---
	const recommendations: PlaybookRecommendation[] = [];

	// 1. US Equities
	const usStance: AssetStance =
		cnnScore > 75 ? "Underweight" : cnnScore < 35 ? "Overweight" : "Neutral";
	recommendations.push({
		assetClass: "US Equities",
		stance: usStance,
		summary:
			usStance === "Overweight"
				? "Deep value opportunity amid extreme fear."
				: usStance === "Underweight"
					? "Valuations stretched, momentum exhausted."
					: "Fairly valued, stock-picker's market.",
		pros: [
			`S&P 500 sentiment score: ${Math.round(cnnScore)}/100`,
			yieldCurve && yieldCurve > 0
				? "Yield curve is normalized, supportive of banks."
				: "Earnings growth remains resilient.",
		],
		cons: [
			dgs10 && dgs10 > 4.2
				? `10Y Yield at ${dgs10.toFixed(2)}% pressures multiples.`
				: "Complacency creeping in.",
			hySpread && hySpread > 4.0
				? "Credit spreads widening, signaling corporate stress."
				: "Narrow market breadth.",
		],
		action:
			usStance === "Overweight"
				? "Aggressively DCA into SPY/QQQ."
				: usStance === "Underweight"
					? "Trim extended winners, raise cash."
					: "Maintain target weights, rebalance deviations.",
		invalidation:
			"Flip stance if 10Y yields break ±0.5% rapidly or VIX spikes > 25.",
		confidence: "High",
	});

	// 2. Europe
	recommendations.push({
		assetClass: "Europe",
		stance: "Neutral",
		summary: "Valuation discount persists but growth is sluggish.",
		pros: ["Cheaper forward P/E compared to US.", "High dividend yields."],
		cons: [
			"Lack of tech sector dominance.",
			"Macroeconomic headwinds in Germany.",
		],
		action: "Hold core positions (VGK, STOXX50), do not overweight.",
		invalidation: "ECB cuts rates significantly faster than the Fed.",
		confidence: "Medium",
	});

	// 3. Asia / IHSG
	const ihsg = data.markets.quotes.IHSG;
	const asiaStance = dxy > 104 ? "Underweight" : "Neutral";
	recommendations.push({
		assetClass: "Asia / IHSG",
		stance: asiaStance,
		summary:
			asiaStance === "Underweight"
				? "Strong USD pressuring emerging market liquidity."
				: "Commodity exports and domestic consumption providing a floor.",
		pros: [
			"Attractive demographic dividend in India & Indonesia.",
			ihsg?.changePct && ihsg.changePct > 0
				? "IHSG showing relative strength."
				: "Valuations near historical averages.",
		],
		cons: [
			`DXY at ${dxy.toFixed(2)} is a headwind for Asian FX.`,
			"China recovery remains uneven.",
		],
		action:
			asiaStance === "Underweight"
				? "Limit new exposure, favor USD-earning exporters."
				: "Selectively accumulate domestic banks and telcos.",
		invalidation: "DXY breaks down below 100, sparking an EM rally.",
		confidence: "Medium",
	});

	// 4. Crypto
	const cryptoStance =
		cryptoScore > 75
			? "Underweight"
			: cryptoScore < 30
				? "Overweight"
				: "Neutral";
	const btcDom = data.markets.cryptoGlobal?.btcDominance ?? 50;
	recommendations.push({
		assetClass: "Crypto",
		stance: cryptoStance,
		summary:
			cryptoStance === "Overweight"
				? "Asymmetric risk/reward at current fear levels."
				: cryptoStance === "Underweight"
					? "Euphoria phase, high risk of sharp leverage flush."
					: "Consolidation phase.",
		pros: [
			`Fear & Greed at ${cryptoScore}/100.`,
			btcDom > 52
				? "BTC dominance high, providing stability."
				: "Altcoins showing relative strength.",
		],
		cons: [
			"Highly correlated to Nasdaq liquidity.",
			fedFunds && fedFunds > 5.0
				? "High Fed Funds rate increases opportunity cost."
				: "Regulatory headwinds persist.",
		],
		action:
			cryptoStance === "Overweight"
				? "DCA into BTC/ETH majors."
				: cryptoStance === "Underweight"
					? "Take 20-30% profits off the table."
					: "Hold existing bags, harvest yield where safe.",
		invalidation:
			"Loss of critical technical supports (e.g. 200-DMA) on high volume.",
		confidence: "Medium",
	});

	// 5. Gold
	const goldStance = dgs10 && dgs10 > 4.5 ? "Underweight" : "Overweight";
	recommendations.push({
		assetClass: "Gold",
		stance: goldStance,
		summary: "Ultimate safe haven and fiat debasement hedge.",
		pros: [
			"Central bank accumulation continues.",
			yieldCurve && yieldCurve < 0
				? "Yield curve inversion historically precedes gold rallies."
				: "Geopolitical premium.",
		],
		cons: [
			dgs10 && dgs10 > 4.5
				? `High 10Y nominal yield (${dgs10.toFixed(2)}%) raises opportunity cost.`
				: "Lacks yield.",
			dxy > 105
				? "Strong dollar suppresses USD gold price."
				: "Retail crowding.",
		],
		action:
			"Maintain 5-10% portfolio allocation. Rebalance when outside bands.",
		invalidation: "Real yields rise above 2.5% structurally.",
		confidence: "High",
	});

	// 6. Bonds / Cash
	const bondsStance = fedFunds && fedFunds > 5.0 ? "Overweight" : "Neutral";
	recommendations.push({
		assetClass: "Bonds / Cash",
		stance: bondsStance,
		summary:
			bondsStance === "Overweight"
				? "Cash is a viable asset class with current front-end yields."
				: "Duration risk is balanced.",
		pros: [
			fedFunds
				? `Risk-free rate at ~${fedFunds.toFixed(2)}%.`
				: "Capital preservation.",
			"Optionality (dry powder) to buy equities on dips.",
		],
		cons: [
			"Inflation erodes real purchasing power.",
			"Reinvestment risk if the Fed cuts rapidly.",
		],
		action:
			bondsStance === "Overweight"
				? "Ladder short-term T-bills or hold money market funds."
				: "Extend duration slightly into 5-7 year treasuries.",
		invalidation: "Fed signals immediate emergency rate cuts.",
		confidence: "High",
	});

	// --- Calculate Allocation Posture ---
	// Base Neutral Allocation
	let equities = 60;
	let crypto = 10;
	let gold = 5;
	let cashBonds = 25;

	// Adjust based on regime
	if (regime.key === "capitulation") {
		// Capital preservation & dry powder for confirmed bottoms
		equities = 30;
		crypto = 5;
		gold = 15;
		cashBonds = 50;
	} else if (regime.key === "expansion") {
		equities = 65;
		crypto = 10;
		cashBonds = 20;
	} else if (regime.key === "speculative_decoupling") {
		// Take profits
		equities = 50;
		crypto = 5;
		gold = 10;
		cashBonds = 35;
	}

	// --- Calculate Timeframe Guidelines ---
	const vixScore =
		data.sentiment.traditional?.market_volatility_vix?.score ?? 50;
	const cryptoVol = data.markets.cryptoGlobal?.totalVolumeUsd ?? 0;

	const timeframes: TimeframeGuideline[] = [];

	// 1. Scalping (VIX score on CNN: low score = high volatility/fear; high score = low volatility/calm)
	if ((vixScore <= 55 && vixScore >= 20) || cryptoVol > 80_000_000_000) {
		timeframes.push({
			id: "scalping",
			style: "Scalping (Intraday)",
			status: "Favorable",
			reason:
				"Active volatility and strong volume provide wide intraday trading ranges.",
		});
	} else {
		timeframes.push({
			id: "scalping",
			style: "Scalping (Intraday)",
			status: "Avoid",
			reason:
				"Low volatility or erratic panic action; high risk of getting chopped out.",
		});
	}

	// 2. Swing Trade
	if (regime.key === "expansion" || regime.key === "speculative_decoupling") {
		timeframes.push({
			id: "swing",
			style: "Swing Trade (Days - Weeks)",
			status: "Favorable",
			reason:
				"Strong momentum across risk assets. Ride the trend with trailing stops.",
		});
	} else if (regime.key === "capitulation") {
		timeframes.push({
			id: "swing",
			style: "Swing Trade (Days - Weeks)",
			status: "Avoid",
			reason:
				"High risk of breaking supports. Wait for a confirmed bottom before swinging long.",
		});
	} else {
		timeframes.push({
			id: "swing",
			style: "Swing Trade (Days - Weeks)",
			status: "Selective",
			reason: `Strong USD (DXY ${dxy.toFixed(2)}) pressures IHSG. Stick to range-trading or sit out.`,
		});
	}

	// 3. Investment
	if (regime.key === "capitulation") {
		timeframes.push({
			id: "investment",
			style: "Long-Term Investment",
			status: "Favorable",
			reason:
				"Generational buying window. Deep discounts on IHSG blue-chips and Crypto majors.",
		});
	} else if (regime.key === "expansion" || cnnScore > 75) {
		timeframes.push({
			id: "investment",
			style: "Long-Term Investment",
			status: "Hold",
			reason:
				"Valuations are stretched. Pause heavy buying and build cash reserves for the next dip.",
		});
	} else {
		timeframes.push({
			id: "investment",
			style: "Long-Term Investment",
			status: "Favorable",
			reason:
				"Steady Dollar-Cost Averaging (DCA). Accumulate fundamentally strong assets.",
		});
	}

	// --- Calculate Economy Summary (Macro & Micro) ---
	const unrate = getFredLatest(data, "UNRATE");
	const breadthScore =
		data.sentiment.traditional?.stock_price_breadth?.score ?? 50;

	const macroKeynotes: string[] = [];
	let macroTone: "positive" | "negative" | "neutral" | "caution" = "neutral";
	let macroHeadline = "Mixed Macro Environment";

	if (fedFunds && fedFunds > 5.0) {
		macroKeynotes.push(
			`Restrictive Monetary Policy: High interest rates (~${fedFunds.toFixed(2)}%) constrain borrowing and economic expansion.`,
		);
		macroTone = "caution";
	} else if (fedFunds && fedFunds < 3.0) {
		macroKeynotes.push(
			`Accommodative Policy: Low rates (~${fedFunds.toFixed(2)}%) provide strong liquidity tailwinds.`,
		);
		macroTone = "positive";
	} else {
		macroKeynotes.push(
			"Neutral Monetary Policy: Rates are balanced, supporting steady growth without overheating.",
		);
	}

	if (yieldCurve && yieldCurve < 0) {
		macroKeynotes.push(
			"Yield Curve Inversion: Signals lingering recessionary risks and tight credit conditions.",
		);
	}

	if (dxy > 104) {
		macroKeynotes.push(
			`Strong US Dollar (DXY ${dxy.toFixed(2)}): Pressures emerging markets (like IHSG) and corporate foreign earnings.`,
		);
	}

	if (macroTone === "caution" && yieldCurve && yieldCurve < 0) {
		macroHeadline = "Restrictive Policy & Recession Risks";
	} else if (macroTone === "positive") {
		macroHeadline = "Supportive Liquidity & Growth";
	}

	const microKeynotes: string[] = [];
	let microTone: "positive" | "negative" | "neutral" | "caution" = "neutral";
	let microHeadline = "Balanced Corporate Fundamentals";

	if (hySpread && hySpread < 4.0) {
		microKeynotes.push(
			`Healthy Corporate Credit: Low high-yield spread (${hySpread.toFixed(2)}%) indicates businesses are easily servicing debt.`,
		);
		microTone = "positive";
	} else if (hySpread && hySpread > 5.0) {
		microKeynotes.push(
			`Corporate Stress: Elevated high-yield spread (${hySpread.toFixed(2)}%) points to rising default risks and tight lending.`,
		);
		microTone = "negative";
	}

	if (unrate && unrate > 4.5) {
		microKeynotes.push(
			`Labor Market Cooling: Unemployment at ${unrate.toFixed(1)}% may weigh on consumer discretionary spending.`,
		);
	} else if (unrate) {
		microKeynotes.push(
			`Resilient Consumer: Low unemployment (${unrate.toFixed(1)}%) continues to support strong consumer spending.`,
		);
	}

	if (breadthScore > 65) {
		microKeynotes.push(
			"Broad Market Participation: Equities rally is widespread, indicating healthy underlying earnings across sectors.",
		);
	} else if (breadthScore < 35) {
		microKeynotes.push(
			"Narrow Market Breadth: Rally depends on a few mega-cap stocks; broader corporate health may be fragile.",
		);
	}

	if (microTone === "positive" && breadthScore > 60) {
		microHeadline = "Strong Corporate Health & Participation";
	} else if (microTone === "negative") {
		microHeadline = "Deteriorating Fundamentals & Credit Stress";
	}

	const economySummary = {
		macro: {
			headline: macroHeadline,
			keynotes: macroKeynotes,
			tone: macroTone,
		},
		micro: {
			headline: microHeadline,
			keynotes: microKeynotes,
			tone: microTone,
		},
	};

	// --- Calculate Sector Rotation ---
	let sectorOverweight: string[] = [];
	let sectorUnderweight: string[] = [];
	let sectorNeutral: string[] = [];
	let sectorNarrative = "";

	if (regime.key === "expansion") {
		sectorOverweight = ["XLK", "XLY", "XLC", "XLI"];
		sectorUnderweight = ["XLU", "XLP", "XLRE"];
		sectorNeutral = ["XLF", "XLV", "XLE", "XLB"];
		sectorNarrative =
			"Pro-cyclical growth rotation. Abundant liquidity favors Tech, Consumer Discretionary, and Industrials. Avoid slow-growth yield proxies like Utilities.";
	} else if (regime.key === "capitulation") {
		sectorOverweight = ["XLU", "XLP", "XLV"];
		sectorUnderweight = ["XLK", "XLY", "XLRE", "XLI"];
		sectorNeutral = ["XLF", "XLE", "XLB", "XLC"];
		sectorNarrative =
			"Defensive flight to safety. Capital flows aggressively to Utilities, Staples, and Healthcare. High-beta and cyclical sectors face heavy distribution.";
	} else if (regime.key === "speculative_decoupling") {
		// e.g. yields > 4.5 but stocks high
		sectorOverweight = ["XLE", "XLB", "XLV", "XLF"];
		sectorUnderweight = ["XLRE", "XLU", "XLY"];
		sectorNeutral = ["XLK", "XLC", "XLP", "XLI"];
		sectorNarrative =
			"Inflation and rates are sticky. Overweight Energy and Financials. Real Estate and Utilities are highly vulnerable to elevated borrowing costs.";
	} else {
		// defensive_rotation
		sectorOverweight = ["XLV", "XLP", "XLU"];
		sectorUnderweight = ["XLK", "XLY", "XLC"];
		sectorNeutral = ["XLF", "XLE", "XLI", "XLB", "XLRE"];
		sectorNarrative =
			"Late-cycle dynamics. Quality and defensive dividends lead. Speculative growth and highly discretionary sectors should be underweighted.";
	}

	const sectorRotation: SectorGuidance = {
		overweight: sectorOverweight,
		underweight: sectorUnderweight,
		neutral: sectorNeutral,
		narrative: sectorNarrative,
	};

	return {
		regime,
		recommendations,
		allocation: {
			equities,
			crypto,
			gold,
			cashBonds,
		},
		timeframes,
		economySummary,
		sectorRotation,
	};
}

export * from "./engine/index";
