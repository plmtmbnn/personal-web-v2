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
				maxExposure: "50% of Core Allocation · Zero Active Swings",
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
				maxExposure: "10% of net wealth · Hold Stablecoins",
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
				maxExposure: "Trading Frozen · Maximum Stablecoin Defense",
			};
			break;
	}

	// ── 3. Altcoin Gating Protocol ──────────────────────────────
	// Hard Gate: Altcoins are locked unless ALL 3 conditions pass:
	// 1. Crypto regime is risk_on
	// 2. BTC is above 200D MA
	// 3. BTC Dominance <= altcoinBtcDominanceMax (54%)
	const btcDom = options?.btcDominance ?? 55;
	const btcAbove200 = options?.btcAbove200Ma ?? false;
	const altcoinGatingPass =
		cryptoRegime.state === "risk_on" &&
		btcAbove200 &&
		btcDom <= thresholds.crypto.altcoinBtcDominanceMax;

	let altcoinPerms: MarketPermissions;

	if (altcoinGatingPass) {
		altcoinPerms = {
			scalp: {
				status: "selective",
				label: "Selective (Major L1s)",
				reason: "Alt-season liquidity rotation active. High-beta majors only.",
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
		};
	} else {
		let reason = "Crypto regime is not Risk-On.";
		if (btcDom > thresholds.crypto.altcoinBtcDominanceMax) {
			reason = `BTC Dominance is high (${btcDom.toFixed(1)}%). Liquidity is concentrated in Bitcoin.`;
		} else if (!btcAbove200) {
			reason = "Bitcoin is trading below its 200-Day moving average.";
		}

		altcoinPerms = {
			scalp: { status: "not_allowed", label: "Locked Out", reason },
			swing: { status: "not_allowed", label: "Locked Out", reason },
			dca: {
				status: "not_allowed",
				label: "Forbidden",
				reason: "Never DCA into downtrending altcoins.",
			},
			maxExposure: "0% (Banned in Current Regime)",
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
