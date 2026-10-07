import type {
	MarketRegimeScore,
	PermissionsMatrixData,
	MarketPermissions,
} from "../../types";
import type { InvestmentThresholds } from "../../config/thresholds";

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
	},
): PermissionsMatrixData {
	const globalStressActive =
		globalRegime.state === "stress" || globalRegime.state === "defensive";

	const summaryNotes: string[] = [];
	if (globalStressActive) {
		summaryNotes.push(
			"Global Liquidity is in defensive/stress state — active position sizing across all markets capped.",
		);
	}

	// ── 1. IHSG Permissions ─────────────────────────────────────
	let ihsgEffectiveState = ihsgRegime.state;
	if (globalRegime.state === "stress" && ihsgEffectiveState === "risk_on") {
		ihsgEffectiveState = "selective";
	}

	let ihsgPerms: MarketPermissions;

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
				maxExposure: "100% of Trading Bucket (Risk max 1% per setup)",
				riskPerTrade: "Risk max 1.0% per setup",
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
						"A+ setups only above 200D MA. Reduce sizing to 0.5% - 0.75% risk per trade.",
				},
				dca: {
					status: "allowed",
					label: "Normal Pace",
					reason: "Continue scheduled blue-chip DCA near key support levels.",
				},
				maxExposure: "75% of Trading Bucket Cap",
				riskPerTrade: "Risk max 0.5% - 0.75% per setup",
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
				maxExposure: "50% of Core Allocation — Zero Active Swings",
				riskPerTrade: "0% (Swing Trading Closed)",
			};
			break;

		default:
			ihsgPerms = {
				scalp: {
					status: "not_allowed",
					label: "Not Allowed",
					reason: "Systemic volatility and selling pressure.",
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
			};
			break;
	}

	// ── 2. Crypto (BTC / ETH Majors) Permissions ────────────────
	let cryptoEffectiveState = cryptoRegime.state;
	if (globalRegime.state === "stress" && cryptoEffectiveState === "risk_on") {
		cryptoEffectiveState = "selective";
	}

	let cryptoPerms: MarketPermissions;

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
				maxExposure: "Standard Allocation (<= 20% of net wealth)",
				riskPerTrade: "Risk max 1.0% per setup (Spot only)",
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
				maxExposure: "15% of net wealth max",
				riskPerTrade: "Risk max 0.5% per setup (Strict stop)",
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
				maxExposure: "10% of net wealth — Hold Stablecoins",
				riskPerTrade: "0% (Spot DCA only at deep cycle)",
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
				maxExposure: "Trading Frozen — Maximum Stablecoin Defense",
				riskPerTrade: "0% (Trading Frozen)",
			};
			break;
	}

	// ── 3. Altcoin Gating Protocol ──────────────────────────────
	// Hard Gate: Altcoins are locked unless BTC is above 200D MA and Dominance is below cap
	const btcDom = options?.btcDominance ?? 55;
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
		};
	} else if (btcDom > thresholds.crypto.altcoinBtcDominanceMax) {
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
		};
	} else if (cryptoRegime.state === "risk_on") {
		// Full Alt-Season expansion conditions met
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
		};
	} else if (cryptoRegime.state === "selective") {
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
		};
	}

	return {
		ihsg: ihsgPerms,
		crypto: cryptoPerms,
		altcoins: altcoinPerms,
		globalStressActive,
		summaryNotes,
	};
}
