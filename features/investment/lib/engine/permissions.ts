import type {
	MarketRegimeScore,
	PermissionsMatrixData,
	MarketPermissions,
} from "../../types";
import type { InvestmentThresholds } from "../../config/thresholds";
import { getSizingMandate } from "./sizing";

export function derivePermissions(
	globalRegime: MarketRegimeScore,
	ihsgRegime: MarketRegimeScore,
	cryptoRegime: MarketRegimeScore,
	thresholds: InvestmentThresholds,
	options?: {
		ihsgRealizedVol?: number | null;
		btcRealizedVol?: number | null;
		btcDominance?: number | null;
		btcAbove200Ma?: boolean;
		commodityQuotes?: {
			oilBrentChangePct?: number | null;
			goldChangePct?: number | null;
			copperChangePct?: number | null;
		};
	},
): PermissionsMatrixData {
	const globalStressActive =
		globalRegime.state === "stress" || globalRegime.state === "defensive";

	const summaryNotes: string[] = [];
	if (globalRegime.state === "stress") {
		summaryNotes.push(
			"Global Macro Liquidity in stress state: cross-asset risk downgraded to capital defense.",
		);
	} else if (globalRegime.state === "defensive") {
		summaryNotes.push(
			"Global Liquidity is defensive: tactical position sizing across all markets capped.",
		);
	}

	// 1. IHSG Permissions
	let ihsgEffectiveState = ihsgRegime.state;
	if (globalStressActive && ihsgEffectiveState === "risk_on") {
		ihsgEffectiveState = "selective";
	}

	const isIhsgVolExpanded =
		options?.ihsgRealizedVol != null && options.ihsgRealizedVol > 26;
	if (isIhsgVolExpanded && ihsgEffectiveState === "risk_on") {
		ihsgEffectiveState = "selective";
		summaryNotes.push(
			"IHSG realized volatility expanded (> 26%): swing exposure capped.",
		);
	}

	let ihsgPerms: MarketPermissions;
	const ihsgMandate = getSizingMandate(ihsgEffectiveState);

	switch (ihsgEffectiveState) {
		case "risk_on":
			ihsgPerms = {
				scalp: {
					status: "allowed",
					label: "Allowed",
					reason:
						"Favorable volatility and trend structure allow active intraday setups.",
				},
				swing: {
					status: "allowed",
					label: "Allowed",
					reason:
						"Strong upward momentum above 50D and 200D MA; ride leaders with trailing stops.",
				},
				dca: {
					status: "allowed",
					label: "Normal Pace",
					reason: "Accumulate core blue-chip tranches on regular schedule.",
				},
				maxExposure:
					"15% Tactical Swing Cap (100% Active) | 45% Core Compounding",
				riskPerTrade: "Risk max 1.0% per setup",
				mandate: ihsgMandate,
			};
			break;

		case "selective":
			ihsgPerms = {
				scalp: {
					status: "selective",
					label: "Selective",
					reason: "Sideways chop risk. Scalp only high-volume liquid leaders.",
				},
				swing: {
					status: "selective",
					label: "Selective",
					reason:
						"A+ setups only above 200D MA. Reduce sizing to 0.5% risk per trade.",
				},
				dca: {
					status: "allowed",
					label: "Normal Pace",
					reason: "Continue scheduled blue-chip DCA near key support levels.",
				},
				maxExposure:
					"10% Tactical Swing Cap (Selective) | 45% Core Compounding",
				riskPerTrade: "Risk max 0.5% per setup",
				mandate: ihsgMandate,
			};
			break;

		case "defensive":
			ihsgPerms = {
				scalp: {
					status: "not_allowed",
					label: "Not Allowed",
					reason: "High chop and downside risk. Do not attempt intraday longs.",
				},
				swing: {
					status: "not_allowed",
					label: "Not Allowed",
					reason:
						"Downtrend or Rupiah pressure. Close active swings; zero new trade entries.",
				},
				dca: {
					status: "selective",
					label: "Slow (Half Pace)",
					reason:
						"Halve monthly DCA pace to preserve dry powder in SBN / cash.",
				},
				maxExposure: "0% Tactical Swings (Closed) | 55%+ Safe Preservation",
				riskPerTrade: "0% (Trading Closed)",
				mandate: ihsgMandate,
			};
			break;

		case "insufficient":
			ihsgPerms = {
				scalp: {
					status: "not_allowed",
					label: "Data Degraded",
					reason: "Data telemetry incomplete. Pause active trade entries.",
				},
				swing: {
					status: "not_allowed",
					label: "Data Degraded",
					reason: "Coverage below verification threshold. Stand aside.",
				},
				dca: {
					status: "selective",
					label: "Scheduled Only",
					reason: "Maintain pre-existing automated DCA schedules.",
				},
				maxExposure: "0% Active Risk (Data Offline)",
				riskPerTrade: "0% (Data Offline)",
				mandate: ihsgMandate,
			};
			break;

		default:
			ihsgPerms = {
				scalp: {
					status: "not_allowed",
					label: "Not Allowed",
					reason: "Systemic volatility and severe selling pressure.",
				},
				swing: {
					status: "not_allowed",
					label: "Not Allowed",
					reason:
						"Severe breakdown. Standing aside is mandatory. Cash is an active position.",
				},
				dca: {
					status: "paused",
					label: "Tranche Plan Only",
					reason:
						"Pause market orders. Deploy only predetermined tranches on multi-year support.",
				},
				maxExposure: "Trading Bucket Frozen (0% active risk)",
				riskPerTrade: "0% (Trading Frozen)",
				mandate: ihsgMandate,
			};
			break;
	}

	const ihsgValState = ihsgRegime.dualAxis?.valuationState;
	if (ihsgValState === "distribution") {
		if (
			ihsgEffectiveState === "risk_on" ||
			ihsgEffectiveState === "selective"
		) {
			ihsgPerms.dca.label = "Value Caution (Trim Highs)";
			ihsgPerms.dca.reason =
				"Valuation stretched near 52W highs (Distribution Zone). Slow fresh market DCA and rotate partial swing profits into SBN/cash.";
		}
	} else if (ihsgValState === "accumulation") {
		if (ihsgEffectiveState === "stress") {
			ihsgPerms.dca.label = "Tranche Plan (Deep Value)";
			ihsgPerms.dca.reason =
				"Pause market orders during breakdown, but valuation is in deep discount (Accumulation Zone): deploy limit tranches at predetermined support.";
		} else if (ihsgEffectiveState === "defensive") {
			ihsgPerms.dca.label = "Value Tranches (Discount)";
			ihsgPerms.dca.reason =
				"Trend is defensive while valuation is in Accumulation Zone. Scale into Tier-1 dividend blue-chips via limit tranches.";
		} else if (
			ihsgEffectiveState === "risk_on" ||
			ihsgEffectiveState === "selective"
		) {
			ihsgPerms.dca.label = "Active Value Pace";
			ihsgPerms.dca.reason =
				"Favorable valuation discount aligns with constructive trend. Accumulate core blue-chip tranches.";
		}
	}

	// 2. Crypto (BTC / ETH Majors) Permissions
	let cryptoEffectiveState = cryptoRegime.state;
	if (globalStressActive && cryptoEffectiveState === "risk_on") {
		cryptoEffectiveState = "selective";
	}

	const isBtcVolExpanded =
		options?.btcRealizedVol != null && options.btcRealizedVol > 60;
	if (isBtcVolExpanded && cryptoEffectiveState === "risk_on") {
		cryptoEffectiveState = "selective";
		summaryNotes.push(
			"Bitcoin realized volatility elevated (> 60%): swing sizing constrained.",
		);
	}

	let cryptoPerms: MarketPermissions;
	const cryptoMandate = getSizingMandate(cryptoEffectiveState);

	switch (cryptoEffectiveState) {
		case "risk_on":
			cryptoPerms = {
				scalp: {
					status: "allowed",
					label: "Allowed (Spot)",
					reason: "High volume and clear directional trend. Spot trading only.",
				},
				swing: {
					status: "allowed",
					label: "Allowed",
					reason:
						"BTC/ETH trending above 200D MA with stablecoin inflows. Trail stops.",
				},
				dca: {
					status: "allowed",
					label: "Normal Pace",
					reason: "Regular DCA into BTC/ETH cold storage.",
				},
				maxExposure: "15% Swing Allocation | 45% Core Wealth Allocation",
				riskPerTrade: "Risk max 1.0% per setup (Spot only)",
				mandate: cryptoMandate,
			};
			break;

		case "selective":
			cryptoPerms = {
				scalp: {
					status: "not_allowed",
					label: "Not Advised",
					reason:
						"Range chop and sudden leverage flushes. High risk of getting chopped out.",
				},
				swing: {
					status: "selective",
					label: "Selective (Spot Only)",
					reason:
						"Spot swing setups on BTC/ETH retests of 50D MA. Zero leverage.",
				},
				dca: {
					status: "allowed",
					label: "Normal Pace",
					reason: "Disciplined accumulation near range support.",
				},
				maxExposure: "10% Swing Allocation (Selective) | Hold Stablecoins",
				riskPerTrade: "Risk max 0.5% per setup (Strict stop)",
				mandate: cryptoMandate,
			};
			break;

		case "defensive":
			cryptoPerms = {
				scalp: {
					status: "not_allowed",
					label: "Not Allowed",
					reason: "Macro liquidity tightening or BTC losing 200D MA.",
				},
				swing: {
					status: "not_allowed",
					label: "Not Allowed",
					reason:
						"Zero active swing longs. Move dry powder to stablecoins / cash.",
				},
				dca: {
					status: "selective",
					label: "Slow (Half Pace)",
					reason: "Accumulate Bitcoin spot only at 50% normal pace.",
				},
				maxExposure: "0% Tactical Swings | Hold Stablecoins",
				riskPerTrade: "0% (Spot DCA only at deep cycle)",
				mandate: cryptoMandate,
			};
			break;

		case "insufficient":
			cryptoPerms = {
				scalp: {
					status: "not_allowed",
					label: "Data Degraded",
					reason: "Crypto flow telemetry incomplete.",
				},
				swing: {
					status: "not_allowed",
					label: "Data Degraded",
					reason: "Incomplete on-chain coverage. Stand aside.",
				},
				dca: {
					status: "selective",
					label: "Scheduled Only",
					reason: "Scheduled cold-storage spot DCA continues.",
				},
				maxExposure: "0% Active Risk (Data Offline)",
				riskPerTrade: "0% (Data Offline)",
				mandate: cryptoMandate,
			};
			break;

		default:
			cryptoPerms = {
				scalp: {
					status: "not_allowed",
					label: "Not Allowed",
					reason: "Cascading liquidation phase.",
				},
				swing: {
					status: "not_allowed",
					label: "Not Allowed",
					reason: "Do not attempt to catch falling knives.",
				},
				dca: {
					status: "paused",
					label: "Tranche Plan Only",
					reason:
						"Spot accumulation restricted to 200-week MA deep value zones.",
				},
				maxExposure: "Trading Frozen: Maximum Stablecoin Defense",
				riskPerTrade: "0% (Trading Frozen)",
				mandate: cryptoMandate,
			};
			break;
	}

	const cryptoValState = cryptoRegime.dualAxis?.valuationState;
	if (cryptoValState === "distribution") {
		if (
			cryptoEffectiveState === "risk_on" ||
			cryptoEffectiveState === "selective"
		) {
			cryptoPerms.dca.label = "Cycle Overheat (Trim)";
			cryptoPerms.dca.reason =
				"On-chain MVRV or sentiment is in Distribution Zone. Pause top-chasing DCA and scale partial profits into USDC/USDT.";
		}
	} else if (cryptoValState === "accumulation") {
		if (cryptoEffectiveState === "stress") {
			cryptoPerms.dca.label = "Tranche Plan (Deep Floor)";
			cryptoPerms.dca.reason =
				"Spot accumulation restricted to predetermined limit tranches near on-chain realized price floor (MVRV <= 1.0x).";
		} else if (cryptoEffectiveState === "defensive") {
			cryptoPerms.dca.label = "Asymmetric Value DCA";
			cryptoPerms.dca.reason =
				"Trend is risk-off, but on-chain MVRV/sentiment indicates deep value floor. Accumulate spot BTC tranches into cold storage.";
		}
	}

	// 3. Altcoin Gating Protocol
	// Hard Gate: Altcoins are locked unless BTC is above 200D MA and Dominance is below cap
	const btcDom = options?.btcDominance ?? null;
	const btcAbove200 = options?.btcAbove200Ma ?? false;

	let altcoinPerms: MarketPermissions;

	if (!btcAbove200) {
		altcoinPerms = {
			scalp: {
				status: "not_allowed",
				label: "Locked Out",
				reason: "Bitcoin is trading below its 200-Day moving average.",
			},
			swing: {
				status: "not_allowed",
				label: "Locked Out",
				reason:
					"Macro crypto structure is bearish; altcoins face severe drawdown risk.",
			},
			dca: {
				status: "not_allowed",
				label: "Forbidden",
				reason: "Never DCA into downtrending altcoins.",
			},
			maxExposure: "0% (Hard Locked Below BTC 200D MA)",
			riskPerTrade: "0% (Hard Locked)",
			mandate: getSizingMandate("defensive"),
		};
	} else if (
		btcDom != null &&
		btcDom > thresholds.crypto.altcoinBtcDominanceMax
	) {
		altcoinPerms = {
			scalp: {
				status: "not_allowed",
				label: "Locked Out",
				reason: `BTC Dominance is high (${btcDom.toFixed(1)}% > ${thresholds.crypto.altcoinBtcDominanceMax}%). Capital is concentrating in Bitcoin.`,
			},
			swing: {
				status: "not_allowed",
				label: "Locked Out",
				reason: `BTC Dominance is high (${btcDom.toFixed(1)}%). Bitcoin absorbing market liquidity; altcoins underperforming BTC.`,
			},
			dca: {
				status: "not_allowed",
				label: "Forbidden",
				reason: "Altcoins strictly non-DCA assets.",
			},
			maxExposure: "0% (Capital Concentrating in BTC)",
			riskPerTrade: "0% (Concentrated in BTC)",
			mandate: getSizingMandate("defensive"),
		};
	} else if (cryptoEffectiveState === "risk_on") {
		// Full Alt-Season expansion conditions met (respecting global downgrade)
		altcoinPerms = {
			scalp: {
				status: "selective",
				label: "Selective (Major L1s)",
				reason:
					"Alt-season liquidity rotation active. High-beta ecosystem majors only.",
			},
			swing: {
				status: "selective",
				label: "Selective (Strict Stops)",
				reason:
					"Ride confirmed relative-strength leaders. Must exit immediately if BTC wavers.",
			},
			dca: {
				status: "not_allowed",
				label: "Not Recommended",
				reason:
					"Altcoins are momentum trading vehicles, not multi-cycle DCA assets.",
			},
			maxExposure: "Hard Cap <= 3.0% of Total Wealth",
			riskPerTrade: "Risk max 0.5% per setup (Strict trailing stop)",
			mandate: {
				maxRiskPerTradePct: 0.5,
				maxPortfolioExposurePct: 3.0,
				cashTargetPct: 40.0,
				isTradingLocked: false,
				label: "Alt-Season Expansion (Max 3.0% Wealth Cap)",
				state: "risk_on",
				dcaPace: "paused",
			},
		};
	} else if (cryptoEffectiveState === "selective") {
		// BTC range consolidation with low dominance -> tactical major rotation
		altcoinPerms = {
			scalp: {
				status: "selective",
				label: "Selective (Top 10)",
				reason:
					"BTC consolidating with softening dominance. Intraday setups on liquid majors only.",
			},
			swing: {
				status: "selective",
				label: "Selective (Tight Trailing)",
				reason:
					"Tactical swings on Top-10 majors with strict breakeven stops at +1.5R.",
			},
			dca: {
				status: "not_allowed",
				label: "Forbidden",
				reason: "Never DCA into altcoins during consolidation.",
			},
			maxExposure: "Hard Cap <= 1.5% of Total Wealth (Top 10 Majors Spot Only)",
			riskPerTrade: "Risk max 0.25% per setup (Tight stop)",
			mandate: {
				maxRiskPerTradePct: 0.25,
				maxPortfolioExposurePct: 1.5,
				cashTargetPct: 45.0,
				isTradingLocked: false,
				label: "Selective Alt-Rotation (Max 1.5% Wealth Cap)",
				state: "selective",
				dcaPace: "paused",
			},
		};
	} else {
		altcoinPerms = {
			scalp: {
				status: "not_allowed",
				label: "Locked Out",
				reason: "Crypto macro regime is defensive/stress.",
			},
			swing: {
				status: "not_allowed",
				label: "Locked Out",
				reason: "Risk-off regime; preserve capital in BTC or stablecoins.",
			},
			dca: {
				status: "not_allowed",
				label: "Forbidden",
				reason: "Zero altcoin accumulation allowed in risk-off.",
			},
			maxExposure: "0% (Locked in Risk-Off)",
			riskPerTrade: "0% (Locked in Risk-Off)",
			mandate: getSizingMandate("defensive"),
		};
	}

	const ihsgSectorGates: string[] = [];
	const usdidrFactor = ihsgRegime.factors.find((f) => f.key === "usdidr_trend");
	if (usdidrFactor && usdidrFactor.direction === "bearish") {
		ihsgSectorGates.push(
			"STRICT AVOID: Heavy Importers & Consumer Retail (Weak IDR Pressure)",
		);
	} else if (usdidrFactor && usdidrFactor.direction === "bullish") {
		ihsgSectorGates.push(
			"FAVORED: Banking & Consumer Staples (Favorable IDR Liquidity)",
		);
	}

	if (
		ihsgRegime.contextFlags.some((f) =>
			f.includes("Tight Indo-US Yield Spread"),
		)
	) {
		ihsgSectorGates.push(
			"CAUTION: Rate-Sensitive Property & High-Debt Issuers (Compressed Indo-US Yield Spread)",
		);
	}

	const rotationFlag = ihsgRegime.contextFlags.find(
		(f) => f.startsWith("Rotation:") || f.startsWith("Sector Leadership:"),
	);
	if (rotationFlag) {
		ihsgSectorGates.push(
			`LIVE ROTATION: ${rotationFlag.replace(/^(Rotation|Sector Leadership):\s*/, "")}`,
		);
	}

	const breadthFactor = ihsgRegime.factors.find(
		(f) => f.key === "ihsg_breadth",
	);
	if (breadthFactor) {
		const breadthTone =
			breadthFactor.direction === "bullish"
				? "Broad Participation"
				: breadthFactor.direction === "bearish"
					? "Narrow Index Leadership"
					: "Selective Rotation";
		ihsgSectorGates.push(
			`BREADTH GATE: ${breadthFactor.valueStr} (${breadthTone})`,
		);
	}

	const oilChg = options?.commodityQuotes?.oilBrentChangePct ?? null;
	const goldChg = options?.commodityQuotes?.goldChangePct ?? null;
	const copperChg = options?.commodityQuotes?.copperChangePct ?? null;
	if (oilChg != null && oilChg >= 2.0) {
		ihsgSectorGates.push(
			`COMMODITY TAILWIND: Energy/Coal Exporters (ADRO) on Brent +${oilChg.toFixed(1)}% | Watch Logistics Cost`,
		);
	}
	if (goldChg != null && goldChg >= 1.2) {
		ihsgSectorGates.push(
			`SAFE-HAVEN BID: Precious Metals Miners (ANTM) Supported by Gold +${goldChg.toFixed(1)}%`,
		);
	} else if (copperChg != null && copperChg <= -2.0) {
		ihsgSectorGates.push(
			`COMMODITY HEADWIND: Base Metals (ANTM) Pressured by Copper ${copperChg.toFixed(1)}%`,
		);
	}

	return {
		ihsg: ihsgPerms,
		crypto: cryptoPerms,
		altcoins: altcoinPerms,
		ihsgSectorGates,
		globalStressActive,
		summaryNotes,
	};
}
