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
	globalRegime: MarketRegimeScore,
): MarketRegimeScore {
	const factors: RegimeFactor[] = [];
	const contextFlags: string[] = [];

	const activeSeasons = getActiveSeasonality();
	const idSeason = activeSeasons.find((s) => s.market === "ID");
	const hasSeasonality = Boolean(idSeason);
	const hasMacroCarry = globalRegime.state !== "insufficient";

	// Base weights when both Seasonality (10) and Macro Carry (15) are active:
	// MA200: 15, MA50: 10, USDIDR: 20, BI Rate: 10, Drawdown: 10, Foreign Flow: 10, Carry: 15, Seasonality: 10
	let wMa200 = 15;
	let wMa50 = 10;
	let wUsdIdr = 20;
	let wBiRate = 10;
	let wDrawdown = 10;
	let wForeignFlow = 10;
	let wCarry = hasMacroCarry ? 15 : 0;
	const wSeason = hasSeasonality ? 10 : 0;

	// Normalize base factors dynamically to ensure total potential weight is exactly 100
	const targetBase = 100 - wSeason;
	const currentBase =
		wMa200 + wMa50 + wUsdIdr + wBiRate + wDrawdown + wForeignFlow + wCarry;
	if (currentBase > 0 && currentBase !== targetBase) {
		const ratio = targetBase / currentBase;
		wMa200 = Math.round(wMa200 * ratio);
		wMa50 = Math.round(wMa50 * ratio);
		wUsdIdr = Math.round(wUsdIdr * ratio);
		wBiRate = Math.round(wBiRate * ratio);
		wDrawdown = Math.round(wDrawdown * ratio);
		wForeignFlow = Math.round(wForeignFlow * ratio);
		if (hasMacroCarry) {
			wCarry =
				targetBase -
				(wMa200 + wMa50 + wUsdIdr + wBiRate + wDrawdown + wForeignFlow);
		} else {
			const allocated =
				wMa200 + wMa50 + wUsdIdr + wBiRate + wDrawdown + wForeignFlow;
			wUsdIdr += targetBase - allocated;
		}
	}

	const ihsgQuote = data.markets.quotes.JKSE ?? data.markets.quotes.IHSG;
	const ihsgPrice = ihsgQuote?.last ?? null;
	const ihsgHistory =
		data.markets.history?.["^JKSE"]?.points ??
		data.markets.history?.JKSE?.points ??
		[];

	// 1. IHSG vs 200-Day Moving Average
	const ma200 = sma(ihsgHistory, 200);
	const maHysteresis = thresholds.technical?.maHysteresisPct ?? 1.0;

	if (ihsgPrice != null && ma200 != null) {
		const dist200 = distancePct(ihsgPrice, ma200);
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";
		let note = `Trading within consolidation buffer (±${maHysteresis}%) of the 200-day baseline.`;

		if (dist200 != null && dist200 >= maHysteresis) {
			score = 85;
			dir = "bullish";
			note = `Trading +${dist200.toFixed(1)}% above the 200-day baseline. Primary structural bull trend intact.`;
		} else if (dist200 != null && dist200 <= -maHysteresis) {
			score = 20;
			dir = "bearish";
			note = `Trading ${dist200.toFixed(1)}% below the 200-day baseline. Primary macro downtrend.`;
		}

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
			weight: wMa200,
			direction: dir,
			note,
			asOf: ihsgQuote?.lastTime ?? undefined,
		});
	}

	// 2. IHSG vs 50-Day Moving Average & Momentum - Weight 10
	const ma50 = sma(ihsgHistory, 50);
	const slope50 = maSlopePct(ihsgHistory, 50, 10);
	if (ihsgPrice != null && ma50 != null) {
		const dist50 = distancePct(ihsgPrice, ma50);
		const isAbove50 = dist50 != null && dist50 >= maHysteresis;
		const isBelow50 = dist50 != null && dist50 <= -maHysteresis;
		const isRising = slope50 != null && slope50 > 0;

		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";
		if (isAbove50 && isRising) {
			score = 85;
			dir = "bullish";
		} else if (isAbove50) {
			score = 65;
			dir = "bullish";
		} else if (isBelow50) {
			score = 25;
			dir = "bearish";
		} else if (isRising) {
			score = 55;
			dir = "neutral";
		} else {
			score = 45;
			dir = "neutral";
		}

		factors.push({
			key: "ihsg_50ma",
			label: "IHSG Intermediate Trend (50-Day MA)",
			valueStr: `${dist50 != null && dist50 >= 0 ? "Above" : "Below"} (${dist50 != null && dist50 > 0 ? "+" : ""}${dist50?.toFixed(1)}%)`,
			score,
			weight: wMa50,
			direction: dir,
			note:
				isAbove50 && isRising
					? "Intermediate trend is upward sloping with positive price momentum."
					: isBelow50
						? "Price trades below intermediate average; swing rallies face resistance."
						: "Intermediate trend is consolidating near the 50-day average.",
			asOf: ihsgQuote?.lastTime ?? undefined,
		});
	}

	// 3. USD/IDR Dual-Condition Matrix: Level + 50-Day MA Momentum
	const usdIdrQuote = data.markets.quotes.USDIDR;
	const usdIdrPrice = usdIdrQuote?.last ?? null;
	const usdIdrHistory = data.markets.history?.["IDR=X"]?.points ?? [];
	const idrMa50 = sma(usdIdrHistory, 50);

	const stressLevel = thresholds.usdIdr?.stressLevel ?? 16400;
	const watchLevel = thresholds.usdIdr?.watchLevel ?? 15900;

	if (usdIdrPrice != null) {
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";
		let note = "Rupiah trading within standard central bank tolerance bands.";

		const idrDist = idrMa50 != null ? distancePct(usdIdrPrice, idrMa50) : null;

		// Dual-condition evaluation: absolute level + 50-day MA momentum
		if (usdIdrPrice >= stressLevel) {
			// Restrictive/Stress Zone (> stressLevel)
			if (idrDist != null && idrDist < -0.5) {
				score = 50;
				dir = "neutral";
				note = `Rupiah recovering below 50D MA but remains in elevated stress territory (> Rp ${stressLevel.toLocaleString("id-ID")}).`;
			} else if (idrDist != null && idrDist > 0.5) {
				score = 20;
				dir = "bearish";
				note = `Severe Rupiah depreciation above 50D MA in stress territory (> Rp ${stressLevel.toLocaleString("id-ID")}); triggers foreign capital flight.`;
			} else {
				score = 25;
				dir = "bearish";
				note = `Rupiah remains elevated above Rp ${stressLevel.toLocaleString("id-ID")}; currency headwinds pressure valuations.`;
			}
		} else if (usdIdrPrice >= watchLevel) {
			// Watch Zone (watchLevel - stressLevel)
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
			// Favorable Zone (< watchLevel)
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
				note = `Favorable Rupiah exchange rate (< Rp ${watchLevel.toLocaleString("id-ID")}) anchors domestic market stability.`;
			}
		}

		factors.push({
			key: "usdidr_trend",
			label: "USD/IDR Exchange Rate Trend",
			valueStr: `Rp ${usdIdrPrice.toLocaleString("id-ID")}`,
			score,
			weight: wUsdIdr,
			direction: dir,
			note,
			asOf: usdIdrQuote?.lastTime ?? undefined,
		});
	}

	// 4. Bank Indonesia Policy Rate, Domestic CPI & Sovereign Yield Spread Carry
	const biRateSeries = data.markets.macro?.IRSTCB01IDM156N?.data;
	const idYieldSeries = data.markets.macro?.IRLTLT01IDM156N?.data;
	const idCpiSeries = data.markets.macro?.IDNCPIALLMINMEI?.data;
	const latestIdYield =
		idYieldSeries && idYieldSeries.length > 0
			? idYieldSeries[idYieldSeries.length - 1].value
			: null;
	const latestIdCpi =
		idCpiSeries && idCpiSeries.length > 0
			? idCpiSeries[idCpiSeries.length - 1].value
			: null;
	const us10yVal =
		data.markets.quotes.US10Y?.last ??
		data.markets.macro?.DGS10?.data?.slice(-1)[0]?.value ??
		null;
	const indoUsSpread =
		latestIdYield != null && us10yVal != null ? latestIdYield - us10yVal : null;

	if (biRateSeries && biRateSeries.length > 0) {
		const latestBi = biRateSeries[biRateSeries.length - 1];
		const prevBi =
			biRateSeries.length > 1 ? biRateSeries[biRateSeries.length - 2] : null;
		const rate = latestBi.value;
		const realBiRate = latestIdCpi != null ? rate - latestIdCpi : null;
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

		// Incorporate Domestic CPI YoY and Real Policy Rate Cushion
		if (latestIdCpi != null && realBiRate != null) {
			if (latestIdCpi > 3.5) {
				score = Math.max(15, score - 10);
				if (score <= 40) dir = "bearish";
				note += ` Domestic CPI (${latestIdCpi.toFixed(2)}% YoY) exceeds BI's 1.5%-3.5% target corridor (Real Rate: ${realBiRate >= 0 ? "+" : ""}${realBiRate.toFixed(2)}%).`;
				contextFlags.push(
					`Elevated Domestic CPI (${latestIdCpi.toFixed(2)}% > 3.5% Target)`,
				);
			} else if (latestIdCpi >= 1.5 && realBiRate >= 2.0) {
				score = Math.min(95, score + 5);
				if (score >= 60 && !isHiking) dir = "bullish";
				note += ` CPI anchored at ${latestIdCpi.toFixed(2)}% YoY within BI's 1.5%-3.5% corridor, providing a +${realBiRate.toFixed(2)}% real rate cushion.`;
			} else {
				note += ` Domestic CPI at ${latestIdCpi.toFixed(2)}% YoY (Real Rate: ${realBiRate >= 0 ? "+" : ""}${realBiRate.toFixed(2)}%).`;
			}
		}

		// Incorporate Indo-US 10Y Sovereign Yield Spread when available
		if (indoUsSpread != null) {
			if (indoUsSpread < 1.5) {
				score = Math.max(15, score - 15);
				if (score <= 40) dir = "bearish";
				note += ` Indo-US 10Y spread compressed (${indoUsSpread >= 0 ? "+" : ""}${indoUsSpread.toFixed(2)}%), signaling bond outflow risk.`;
				contextFlags.push(
					`Tight Indo-US Yield Spread (${indoUsSpread.toFixed(2)}%)`,
				);
			} else if (indoUsSpread >= 2.2) {
				score = Math.min(95, score + 8);
				note += ` Healthy Indo-US 10Y spread (+${indoUsSpread.toFixed(2)}%) cushions foreign carry.`;
			}
		}

		const spreadSuffix =
			indoUsSpread != null
				? ` (Spread: ${indoUsSpread >= 0 ? "+" : ""}${indoUsSpread.toFixed(2)}%)`
				: realBiRate != null
					? ` (Real: ${realBiRate >= 0 ? "+" : ""}${realBiRate.toFixed(2)}%)`
					: "";

		factors.push({
			key: "bi_rate",
			label: "Bank Indonesia Policy Rate & Carry",
			valueStr: `${rate.toFixed(2)}%${spreadSuffix}`,
			score,
			weight: wBiRate,
			direction: dir,
			note,
			asOf: latestBi.date,
		});

		if (rate >= thresholds.macro.biRate.restrictive) {
			contextFlags.push(`Restrictive BI Rate (${rate.toFixed(2)}%)`);
		}
	}

	// 5. Drawdown from 52-Week High
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
				weight: wDrawdown,
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

	// 6. Foreign Institutional Net Flow
	if (data.markets.ihsgFlows?.streakDays != null) {
		const streak = data.markets.ihsgFlows.streakDays;
		const net5d = data.markets.ihsgFlows.netBuySell5dIdr;
		let score = 50;
		let dir: "bullish" | "bearish" | "neutral" = "neutral";
		if (streak >= 3) {
			score = net5d != null && net5d > 0 ? 85 : 75;
			dir = "bullish";
		} else if (streak <= -3) {
			score = net5d != null && net5d < 0 ? 20 : 30;
			dir = "bearish";
		} else {
			score = 50;
			dir = "neutral";
		}

		const net5dFormatted =
			net5d != null
				? ` (${net5d >= 0 ? "+" : "-"}${
						Math.abs(net5d) >= 1e12
							? `${(Math.abs(net5d) / 1e12).toFixed(2)}T`
							: `${(Math.abs(net5d) / 1e9).toFixed(0)}B`
					} 5D)`
				: "";

		factors.push({
			key: "ihsg_foreign_flow",
			label: "Foreign Institutional Flow",
			valueStr:
				streak > 0
					? `+${streak}D Inflow${net5dFormatted}`
					: streak < 0
						? `${Math.abs(streak)}D Outflow${net5dFormatted}`
						: "Neutral",
			score,
			weight: wForeignFlow,
			direction: dir,
			note:
				streak >= 3
					? "Sustained foreign accumulation acts as a strong momentum driver."
					: streak <= -3
						? "Persistent foreign distribution adds supply overhead."
						: "Foreign capital flows lack directional conviction.",
		});
	}

	// 7. Global Macro Liquidity Carry-in
	if (hasMacroCarry) {
		factors.push({
			key: "global_liquidity_carry",
			label: "Global Liquidity Signal Carry-In",
			valueStr: `${globalRegime.score}/100`,
			score: globalRegime.score,
			weight: wCarry,
			direction:
				globalRegime.score >= 60
					? "bullish"
					: globalRegime.score <= 40
						? "bearish"
						: "neutral",
			note: "Global dollar liquidity strongly dictates foreign institutional flows into IDX.",
		});
	}

	// 8. Active Seasonality
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
			weight: wSeason,
			direction: dir,
			note: idSeason.description,
		});

		contextFlags.push(`${idSeason.title} (${idSeason.status})`);
	}

	// Context Check: Sector Rotation (Capital Flow via Bellwethers)
	const sectors = [
		{ id: "BBCA.JK", label: "Financials (BBCA)" },
		{ id: "ADRO.JK", label: "Energy (ADRO)" },
		{ id: "ICBP.JK", label: "Consumer (ICBP)" },
		{ id: "ANTM.JK", label: "Basic Materials (ANTM)" },
		{ id: "TLKM.JK", label: "Telco/Infra (TLKM)" },
		{ id: "ASII.JK", label: "Industrial/Auto (ASII)" },
	];

	const sectorPerformance = sectors
		.map((s) => {
			const history = data.markets.history?.[s.id]?.points ?? [];
			if (history.length === 0) return null;
			const price = history[history.length - 1].c;
			const ma50 = sma(history, 50);
			if (!ma50) return null;
			const dist = distancePct(price, ma50);
			return { label: s.label, dist };
		})
		.filter(Boolean) as { label: string; dist: number }[];

	if (sectorPerformance.length > 1) {
		sectorPerformance.sort((a, b) => b.dist - a.dist);
		const leader = sectorPerformance[0];
		const laggard = sectorPerformance[sectorPerformance.length - 1];
		if (leader && laggard && leader.dist > 1.5 && laggard.dist < -1.5) {
			contextFlags.push(
				`Rotation: Capital favoring ${leader.label}, exiting ${laggard.label}`,
			);
		} else if (leader && leader.dist > 3) {
			contextFlags.push(`Sector Leadership: ${leader.label} Outperforming`);
		}

		// Sector Breadth: % of bellwethers trading above their 50-day moving average
		const expandingSectors = sectorPerformance.filter((s) => s.dist >= 0);
		if (sectorPerformance.length >= 4) {
			const expandingCount = expandingSectors.length;
			const totalCount = sectorPerformance.length;
			if (expandingCount >= totalCount - 1) {
				contextFlags.push(
					`Broad Sector Expansion (${expandingCount}/${totalCount} > 50D MA)`,
				);
			} else if (expandingCount <= 1) {
				contextFlags.push(
					`Broad Sector Contraction (${totalCount - expandingCount}/${totalCount} < 50D MA)`,
				);
			}

			// Score Sector & Market Breadth as an active factor while keeping total weights = 100
			const sectorRatio = expandingCount / totalCount;
			const liqBreadth = data.markets.ihsgFlows?.liquidAdvancersPct;
			const breadthScore =
				liqBreadth != null
					? Math.round(sectorRatio * 65 + (liqBreadth / 100) * 35)
					: Math.round(sectorRatio * 90 + 5);

			const fxFactor = factors.find((f) => f.key === "usdidr_trend");
			if (fxFactor && fxFactor.weight >= 15) {
				fxFactor.weight -= 5;
				factors.push({
					key: "ihsg_breadth",
					label: "Sector & Market Breadth",
					valueStr: `${expandingCount}/${totalCount} Sectors > 50D MA${liqBreadth != null ? ` (${liqBreadth}% Adv)` : ""}`,
					score: breadthScore,
					weight: 5,
					direction:
						breadthScore >= 60
							? "bullish"
							: breadthScore <= 40
								? "bearish"
								: "neutral",
					note:
						expandingCount >= totalCount - 1
							? "Broad multi-sector participation confirms healthy index expansion."
							: expandingCount <= 1
								? "Narrow breadth divergence; index propped up by isolated weights while broad sectors lag."
								: "Selective sector rotation across primary IDX industry groups.",
				});
			}
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

	const ma200Factor = factors.find((f) => f.key === "ihsg_200ma");
	const fxFactorDiag = factors.find((f) => f.key === "usdidr_trend");
	const flowFactorDiag = factors.find((f) => f.key === "ihsg_foreign_flow");
	const liveDrivers = [
		ma200Factor ? `IHSG ${ma200Factor.valueStr}` : null,
		fxFactorDiag ? `USD/IDR ${fxFactorDiag.valueStr}` : null,
		flowFactorDiag ? `Foreign Flow ${flowFactorDiag.valueStr}` : null,
	].filter(Boolean);
	const driverSuffix =
		liveDrivers.length > 0 ? ` Live telemetry: ${liveDrivers.join(", ")}.` : "";

	let headline = "IHSG Consolidating in Mixed Regime";
	let diagnosis = `Index range-bound. Focus on high-dividend blue-chips and disciplined stop-losses.${driverSuffix}`;

	if (state === "risk_on") {
		headline = "IHSG Favorable Bullish Trend";
		diagnosis = `Index trending above key moving averages with supportive foreign and domestic liquidity.${driverSuffix}`;
	} else if (state === "defensive") {
		headline = "IHSG Defensive Regime: Capital Preservation";
		diagnosis = `Index below intermediate averages or USD/IDR pressure. Close swing longs; hold cash/SBN.${driverSuffix}`;
	} else if (state === "stress") {
		headline = "IHSG Under Heavy Selling Pressure";
		diagnosis = `Broad structural breakdown below 200-day baseline. Avoid dip-buying until stabilization.${driverSuffix}`;
	}

	// Evaluate Institutional Capital Inflow/Outflow Extremes
	let asymmetryZone: MarketRegimeScore["asymmetryZone"] = null;
	const streak = data.markets.ihsgFlows?.streakDays;
	if (streak != null && streak >= 3) {
		asymmetryZone = {
			type: "accumulation",
			title: "Institutional Inflow Surge: Foreign Accumulation Active",
			description: `Sustained foreign institutional buying (+${streak} consecutive sessions). Strong liquidity tailwinds favor core banking and commodity bellwethers.`,
		};
	} else if (streak != null && streak <= -3) {
		asymmetryZone = {
			type: "distribution",
			title: "Foreign Capital Distribution: Structural Supply Overhead",
			description: `Persistent institutional selling (${Math.abs(streak)} consecutive sessions of net foreign outflow). Defensive cash allocation advised.`,
		};
	}

	// Dual-Axis: Trend / Action Gate vs Valuation / Accumulation Pace
	const trendFactorKeys = [
		"ihsg_200ma",
		"ihsg_50ma",
		"ihsg_breadth",
		"usdidr_trend",
		"global_liquidity_carry",
	];
	const valuationFactorKeys = [
		"ihsg_drawdown",
		"ihsg_foreign_flow",
		"bi_rate",
		"ihsg_seasonality",
	];

	const trendFactors = factors.filter((f) => trendFactorKeys.includes(f.key));
	const valuationFactors = factors.filter((f) =>
		valuationFactorKeys.includes(f.key),
	);

	const trendWeight = trendFactors.reduce((sum, f) => sum + f.weight, 0);
	const trendScore =
		trendWeight > 0
			? Math.round(
					trendFactors.reduce((sum, f) => sum + f.score * f.weight, 0) /
						trendWeight,
				)
			: compositeScore;

	const valWeight = valuationFactors.reduce((sum, f) => sum + f.weight, 0);
	const valuationScore =
		valWeight > 0
			? Math.round(
					valuationFactors.reduce((sum, f) => {
						// Invert drawdown factor for valuation axis: deeper 52W discounts represent higher value attractiveness
						const effectiveScore =
							f.key === "ihsg_drawdown" ? 100 - f.score : f.score;
						return sum + effectiveScore * f.weight;
					}, 0) / valWeight,
				)
			: 50;

	const { state: trendState } = determineState(
		trendScore,
		coverage,
		thresholds,
	);

	// Decouple Valuation State from short-term foreign flow momentum:
	// Evaluate 52-week drawdown discount and valuation composite factors
	const ddFactor = factors.find((f) => f.key === "ihsg_drawdown");
	const drawdownVal = ddFactor ? parseFloat(ddFactor.valueStr) : null;
	const isDeepDiscount =
		drawdownVal != null && drawdownVal <= -thresholds.ihsg.bearDrawdownPct; // <= -20%
	const isCorrectionDiscount =
		drawdownVal != null &&
		drawdownVal <= -thresholds.ihsg.correctionDrawdownPct; // <= -10%

	let valuationState: "accumulation" | "fair" | "distribution" | "neutral" =
		"neutral";
	if (isDeepDiscount) {
		valuationState = "accumulation";
	} else if (isCorrectionDiscount) {
		valuationState = "fair";
	} else if (drawdownVal != null && drawdownVal >= -2.5 && trendScore >= 75) {
		valuationState = "distribution";
	} else if (valuationScore >= 65) {
		valuationState = "accumulation";
	} else if (valuationScore <= 35) {
		valuationState = "distribution";
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
		asymmetryZone,
		dualAxis: {
			trendState,
			valuationState,
			trendScore,
			valuationScore,
		},
	};
}
