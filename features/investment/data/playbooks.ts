import type {
	InvestmentCompassData,
	MarketRegimeScore,
	PermissionsMatrixData,
	RegimeState,
} from "../types";
import {
	DEFAULT_THRESHOLDS,
	type InvestmentThresholds,
} from "../config/thresholds";
import { distancePct, sma } from "../lib/indicators";

export interface PlaybookKeyLevel {
	label: string;
	value: string;
	tone?: "positive" | "neutral" | "caution" | "negative";
}

export interface MarketPlaybookScript {
	market: "IHSG" | "Crypto";
	state: RegimeState;
	posture: string;
	headline: string;
	dos: string[];
	avoids: string[];
	sizing: string;
	tranchePlan?: string;
	invalidation: string;
	focusSectors: string[];
	liveSummary?: string;
	keyLevels?: PlaybookKeyLevel[];
}

export const PLAYBOOK_SCRIPTS: Record<
	"IHSG" | "Crypto",
	Record<RegimeState, MarketPlaybookScript>
> = {
	IHSG: {
		risk_on: {
			market: "IHSG",
			state: "risk_on",
			posture: "Aggressive Participation",
			headline: "Domestic liquidity expansion powering broad index gains.",
			dos: [
				"Ride momentum leaders above 20-day and 50-day moving averages.",
				"Trail stops behind the previous session low or swing structure.",
				"Hold winning blue-chips to target resistance levels.",
			],
			avoids: [
				"Do not take premature profits on trending leaders without an exit signal.",
				"Do not chase speculative non-LQ45 penny stocks.",
			],
			sizing:
				"Standard position sizing: Risk up to 1.0% per setup (Tactical Swing bucket <= 15%).",
			invalidation:
				"IHSG closes below 50-day MA or USD/IDR spikes above 50-day MA on heavy volume.",
			focusSectors: [
				"Big 4 Banks (BBCA, BMRI, BBNI, BBRI)",
				"New Economy & Energy Proxies (BREN, AMMN, ADRO)",
				"Consumer & Infrastructure Leaders (ICBP, ASII, TLKM)",
			],
		},
		selective: {
			market: "IHSG",
			state: "selective",
			posture: "Selective Range-Trading",
			headline: "Mixed macro currents; index consolidates near key averages.",
			dos: [
				"Wait for re-tests of confirmed 50-day MA or key horizontal support.",
				"Focus strictly on high-dividend blue-chips and cash-flow positive leaders.",
				"Lock in partial profits at +2R and move stops to breakeven.",
			],
			avoids: [
				"Do not enter breakouts that are already extended > 3 days.",
				"Avoid high-beta second-liners sensitive to rising Rupiah yields.",
			],
			sizing:
				"Reduced sizing: Risk max 0.5% per setup (Tactical Swing bucket capped at 10%).",
			invalidation:
				"Daily breakdown below 200-day MA with foreign net selling streak.",
			focusSectors: [
				"Defensive Tier-1 Banks (BBCA, BMRI)",
				"Consumer Staples (ICBP, MYOR)",
				"High-Yield Dividend Aristocrats (ADRO, ASII)",
			],
		},
		defensive: {
			market: "IHSG",
			state: "defensive",
			posture: "Capital Preservation & Cash Accumulation",
			headline:
				"Rupiah depreciation and foreign capital outflows pressure valuations.",
			dos: [
				"Close or tighten stops on all active swing trades.",
				"Build safe cash reserves in Retail SBN or liquid bank deposits.",
				"Accumulate long-term core blue-chips only via disciplined, small tranches.",
			],
			avoids: [
				"Zero new swing trade entries. Stand aside.",
				"Never average down on failing technical swing positions.",
			],
			sizing:
				"Active trading closed. Long-term DCA at half pace only. Maintain 55%+ Safe Bucket (SBN/Cash).",
			tranchePlan:
				"Tranche 1: 25% at 200-day MA | Tranche 2: 25% at -10% drawdown | Tranche 3: 50% only after confirmed reclaim of 50-day MA.",
			invalidation:
				"Sustained USD/IDR cooling below 50-day MA and IHSG reclaim of 200-day MA.",
			focusSectors: [
				"Cash / Retail SBN (ORI, SBR, ST)",
				"Dividend aristocrats on extreme dips",
			],
		},
		stress: {
			market: "IHSG",
			state: "stress",
			posture: "Severe Market Stress — Maximum Defense",
			headline:
				"Systemic sell-off and illiquidity; supports failing across sectors.",
			dos: [
				"Preserve mental and financial capital. Cash is king.",
				"Monitor historical valuation floors (P/E < 12x, P/B < 1.8x).",
				"Prepare watchlist for generational panic capitulation lows.",
			],
			avoids: [
				"Do NOT attempt to catch falling knives during high volatility.",
				"Zero new margin, zero speculative positions.",
			],
			sizing:
				"Trading bucket completely frozen. Deploy predetermined tranches only on historical valuation floors.",
			tranchePlan:
				"Reserve dry powder. Deploy core tranches only when capitulation volume spike exhausts and VIX collapses.",
			invalidation:
				"Comprehensive macro liquidity pivot: Fed rate cuts + Bank Indonesia Rupiah stabilization.",
			focusSectors: ["Liquid Cash & Bank Deposits", "Physical Gold"],
		},
		insufficient: {
			market: "IHSG",
			state: "insufficient",
			posture: "Data Telemetry Offline — Caution",
			headline:
				"Data feed coverage below threshold. Maintain baseline discipline.",
			dos: [
				"Verify live broker feeds manually.",
				"Honor pre-existing stop-losses.",
			],
			avoids: ["Do not initiate new leveraged or swing positions."],
			sizing: "No new risk.",
			invalidation: "Data stream restored.",
			focusSectors: ["Safe Assets"],
		},
	},
	Crypto: {
		risk_on: {
			market: "Crypto",
			state: "risk_on",
			posture: "Trend Participation & Major Strength",
			headline:
				"Global liquidity tailwinds and stablecoin inflows driving crypto trend.",
			dos: [
				"Ride Bitcoin and Ethereum spot momentum above the 200-day MA.",
				"Keep trailing stop-loss orders active below 4-hour market structure.",
				"Take partial profits into vertical parabolic spikes.",
			],
			avoids: [
				"Do NOT trade high-leverage perpetual contracts. Spot only.",
				"Do not allocate more than 3% into speculative altcoins.",
			],
			sizing:
				"Standard sizing: Spot swing max 1.0% risk per setup (Tactical Swing bucket <= 15%, Altcoins <= 3%).",
			invalidation:
				"BTC breakdown below the 200-day MA or sudden stablecoin supply contraction.",
			focusSectors: ["Bitcoin (BTC)", "Ethereum (ETH)", "Major L1s (SOL)"],
		},
		selective: {
			market: "Crypto",
			state: "selective",
			posture: "Consolidation & Range Defense",
			headline: "Bitcoin consolidating within high-timeframe trading range.",
			dos: [
				"Hold spot BTC/ETH majors.",
				"Focus dollar-cost averaging only near major technical range support.",
				"Watch funding rates: elevated positive funding warns of long liquidations.",
			],
			avoids: [
				"Do not chase breakout candles in a sideways chop market.",
				"Altcoins strictly locked out until confirmed BTC dominance breakdown.",
			],
			sizing:
				"Reduced sizing: Spot swing max 0.5% risk per setup (Tactical Swing capped at 10%). Normal DCA pace for BTC/ETH.",
			invalidation: "BTC loss of critical range low on expanding volume.",
			focusSectors: ["Bitcoin (BTC)", "Ethereum (ETH)"],
		},
		defensive: {
			market: "Crypto",
			state: "defensive",
			posture: "Risk Off & Capital Preservation",
			headline:
				"Macro liquidity tightening or BTC losing 200-day moving average.",
			dos: [
				"Hold stablecoin dry powder (USDC/USDT) in cold storage.",
				"Set disciplined accumulation orders only at deep cycle support levels.",
				"Cut losing speculative altcoins immediately.",
			],
			avoids: [
				"Zero new altcoin purchases under any circumstance.",
				"Never attempt to bottom-fish a leverage liquidation cascade.",
			],
			sizing:
				"Active trading closed. Slow DCA (50% normal pace) into Bitcoin spot only. Maintain 55%+ Safe/Stablecoin defense.",
			tranchePlan:
				"Tranche 1: 25% at 200-day MA | Tranche 2: 25% at 200-week MA | Tranche 3: 50% only after weekly close back above 200-day MA.",
			invalidation: "Sustained weekly reclaim of the 200-day moving average.",
			focusSectors: ["Bitcoin Spot (BTC)", "Cash / Stablecoins"],
		},
		stress: {
			market: "Crypto",
			state: "stress",
			posture: "Cascading Liquidations — Maximum Shelter",
			headline:
				"Massive deleveraging, stablecoin outflows, and macro liquidity drain.",
			dos: [
				"Protect principal. Move 80%+ of crypto allocation to stablecoins or cash.",
				"Watch the 200-week moving average for cyclical bottoming signs.",
				"Study on-chain realized price metrics for generational entry zones.",
			],
			avoids: [
				"Do NOT buy the first dip of a structural bear market.",
				"Zero leverage, zero altcoins.",
			],
			sizing:
				"All active trading frozen. Tranche buys only at multi-year valuation floors (MVRV <= 1.0).",
			tranchePlan:
				"Accumulate Bitcoin spot only at or below the 200-week moving average in 4 equal quarterly tranches.",
			invalidation:
				"Global liquidity cycle expansion + stablecoin supply expansion.",
			focusSectors: ["USDC / Cash", "Bitcoin Spot (at deep value)"],
		},
		insufficient: {
			market: "Crypto",
			state: "insufficient",
			posture: "Telemetry Degraded",
			headline: "Incomplete crypto flow telemetry. Stand by.",
			dos: ["Rely on high-timeframe spot charts only."],
			avoids: ["No active trading."],
			sizing: "No new risk.",
			invalidation: "Data stream restored.",
			focusSectors: ["Stablecoins"],
		},
	},
};

export function buildDynamicPlaybooks(
	data: InvestmentCompassData,
	regimes: {
		global: MarketRegimeScore;
		ihsg: MarketRegimeScore;
		crypto: MarketRegimeScore;
	},
	permissions: PermissionsMatrixData,
	thresholds: InvestmentThresholds = DEFAULT_THRESHOLDS,
): { ihsg: MarketPlaybookScript; crypto: MarketPlaybookScript } {
	const fmtIdx = (v: number) =>
		v.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});

	// 1. IHSG Dynamic Playbook
	const ihsgEffectiveState =
		permissions.ihsg.mandate?.state ?? regimes.ihsg.state;
	const baseIhsg =
		PLAYBOOK_SCRIPTS.IHSG[ihsgEffectiveState] ??
		PLAYBOOK_SCRIPTS.IHSG.defensive;

	const ihsgQuote = data.markets.quotes.JKSE ?? data.markets.quotes.IHSG;
	const ihsgPrice = ihsgQuote?.last ?? null;
	const ihsgHigh52 = ihsgQuote?.high52w ?? null;
	const ihsgHistory =
		data.markets.history?.["^JKSE"]?.points ??
		data.markets.history?.JKSE?.points ??
		[];
	const ihsgMa50 = sma(ihsgHistory, 50);
	const ihsgMa200 = sma(ihsgHistory, 200);
	const usdIdrPrice = data.markets.quotes.USDIDR?.last ?? null;
	const usdIdrHistory = data.markets.history?.["IDR=X"]?.points ?? [];
	const usdIdrMa50 = sma(usdIdrHistory, 50);

	const dd10Level = ihsgHigh52 != null ? ihsgHigh52 * 0.9 : null;
	const dd20Level = ihsgHigh52 != null ? ihsgHigh52 * 0.8 : null;

	const ihsgKeyLevels: PlaybookKeyLevel[] = [];
	if (ihsgMa50 != null) {
		ihsgKeyLevels.push({
			label: "50D MA Pivot",
			value: fmtIdx(ihsgMa50),
			tone: ihsgPrice != null && ihsgPrice >= ihsgMa50 ? "positive" : "caution",
		});
	}
	if (ihsgMa200 != null) {
		ihsgKeyLevels.push({
			label: "200D MA Baseline",
			value: fmtIdx(ihsgMa200),
			tone:
				ihsgPrice != null && ihsgPrice >= ihsgMa200 ? "positive" : "negative",
		});
	}
	if (dd10Level != null) {
		ihsgKeyLevels.push({
			label: "-10% Correction Floor",
			value: fmtIdx(dd10Level),
			tone: "neutral",
		});
	}
	if (usdIdrPrice != null) {
		ihsgKeyLevels.push({
			label: "USD/IDR Spot",
			value: `Rp ${usdIdrPrice.toLocaleString("id-ID")}`,
			tone:
				usdIdrPrice >= thresholds.usdIdr.stressLevel
					? "negative"
					: usdIdrPrice >= thresholds.usdIdr.watchLevel
						? "caution"
						: "positive",
		});
	}

	let ihsgTranchePlan = baseIhsg.tranchePlan;
	if (
		(ihsgEffectiveState === "defensive" || ihsgEffectiveState === "stress") &&
		(ihsgMa200 != null || dd10Level != null || ihsgMa50 != null)
	) {
		const t1 =
			ihsgMa200 != null ? `200D MA (${fmtIdx(ihsgMa200)})` : "200-day MA";
		const t2 =
			dd10Level != null
				? `-10% Drawdown (${fmtIdx(dd10Level)})`
				: "-10% drawdown";
		const t3 =
			dd20Level != null && ihsgEffectiveState === "stress"
				? `-20% Bear Floor (${fmtIdx(dd20Level)})`
				: ihsgMa50 != null
					? `50D MA Reclaim (${fmtIdx(ihsgMa50)})`
					: "confirmed 50-day MA reclaim";
		ihsgTranchePlan = `Tranche 1 (25%): ${t1} | Tranche 2 (25%): ${t2} | Tranche 3 (50%): ${t3}.`;
	}

	let ihsgInvalidation = baseIhsg.invalidation;
	if (ihsgEffectiveState === "risk_on" && ihsgMa50 != null) {
		ihsgInvalidation = `${baseIhsg.invalidation} (50D MA: ${fmtIdx(ihsgMa50)}${usdIdrMa50 != null ? `, USD/IDR 50D MA: Rp ${Math.round(usdIdrMa50).toLocaleString("id-ID")}` : ""})`;
	} else if (
		(ihsgEffectiveState === "selective" ||
			ihsgEffectiveState === "defensive") &&
		ihsgMa200 != null
	) {
		ihsgInvalidation = `${baseIhsg.invalidation} (200D MA: ${fmtIdx(ihsgMa200)}${usdIdrMa50 != null ? `, USD/IDR 50D MA: Rp ${Math.round(usdIdrMa50).toLocaleString("id-ID")}` : ""})`;
	}

	const ihsgFocusSectors = [...baseIhsg.focusSectors];
	if (
		ihsgEffectiveState !== "stress" &&
		ihsgEffectiveState !== "insufficient"
	) {
		const bellwethers = [
			{ id: "BBCA.JK", name: "BBCA" },
			{ id: "ADRO.JK", name: "ADRO" },
			{ id: "ICBP.JK", name: "ICBP" },
			{ id: "ANTM.JK", name: "ANTM" },
			{ id: "TLKM.JK", name: "TLKM" },
			{ id: "ASII.JK", name: "ASII" },
		];
		const leadersAbove50 = bellwethers
			.map((b) => {
				const pts = data.markets.history?.[b.id]?.points ?? [];
				if (pts.length === 0) return null;
				const m50 = sma(pts, 50);
				const dist = m50 ? distancePct(pts[pts.length - 1].c, m50) : null;
				return dist != null && dist >= 0
					? `${b.name} (+${dist.toFixed(1)}%)`
					: null;
			})
			.filter(Boolean) as string[];
		if (leadersAbove50.length > 0) {
			ihsgFocusSectors.push(
				`Bellwethers > 50D MA: ${leadersAbove50.slice(0, 3).join(", ")}`,
			);
		}
		const alphaPicks = data.markets.ihsgFlows?.topAlphaPicks
			?.slice(0, 3)
			.map((p) => p.code);
		if (alphaPicks && alphaPicks.length > 0) {
			ihsgFocusSectors.push(`Foreign Flow Leaders: ${alphaPicks.join(", ")}`);
		}
	}

	const ihsgLiveSummary = `Dual-Axis Stance: Trend Gate is ${ihsgEffectiveState.replace("_", " ").toUpperCase()} (${regimes.ihsg.dualAxis?.trendScore ?? regimes.ihsg.score}/100) | Valuation is ${(regimes.ihsg.dualAxis?.valuationState ?? "neutral").toUpperCase()} (${regimes.ihsg.dualAxis?.valuationScore ?? 50}/100) | DCA Pace: ${permissions.ihsg.dca.label}.`;

	// 2. Crypto Dynamic Playbook
	const cryptoEffectiveState =
		permissions.crypto.mandate?.state ?? regimes.crypto.state;
	const baseCrypto =
		PLAYBOOK_SCRIPTS.Crypto[cryptoEffectiveState] ??
		PLAYBOOK_SCRIPTS.Crypto.defensive;

	const btcPrice = data.markets.quotes.BTC?.last ?? null;
	const btcHistory = data.markets.history?.["BTC-USD"]?.points ?? [];
	const btcMa50 = sma(btcHistory, 50);
	const btcMa200 = sma(btcHistory, 200);
	const mvrvVal =
		data.markets.cryptoOnChain?.mvrvRatio ??
		data.markets.cryptoOnChain?.mvrvZScore ??
		null;
	const impliedRealizedPrice =
		btcPrice != null && mvrvVal != null && mvrvVal > 0
			? btcPrice / mvrvVal
			: null;
	const realizedFloor =
		impliedRealizedPrice != null
			? Math.round(impliedRealizedPrice * thresholds.crypto.mvrv.accumulation)
			: null;
	const overheatBand =
		impliedRealizedPrice != null
			? Math.round(impliedRealizedPrice * thresholds.crypto.mvrv.overheat)
			: null;

	const cryptoKeyLevels: PlaybookKeyLevel[] = [];
	if (btcMa50 != null) {
		cryptoKeyLevels.push({
			label: "BTC 50D MA",
			value: `$${Math.round(btcMa50).toLocaleString("en-US")}`,
			tone: btcPrice != null && btcPrice >= btcMa50 ? "positive" : "caution",
		});
	}
	if (btcMa200 != null) {
		cryptoKeyLevels.push({
			label: "BTC 200D MA",
			value: `$${Math.round(btcMa200).toLocaleString("en-US")}`,
			tone: btcPrice != null && btcPrice >= btcMa200 ? "positive" : "negative",
		});
	}
	if (realizedFloor != null) {
		cryptoKeyLevels.push({
			label: `MVRV ${thresholds.crypto.mvrv.accumulation.toFixed(1)}x Floor`,
			value: `$${realizedFloor.toLocaleString("en-US")}`,
			tone: "positive",
		});
	}
	if (overheatBand != null) {
		cryptoKeyLevels.push({
			label: `MVRV ${thresholds.crypto.mvrv.overheat.toFixed(1)}x Top`,
			value: `$${overheatBand.toLocaleString("en-US")}`,
			tone:
				mvrvVal != null && mvrvVal >= thresholds.crypto.mvrv.overheat
					? "negative"
					: "neutral",
		});
	}

	let cryptoTranchePlan = baseCrypto.tranchePlan;
	if (
		(cryptoEffectiveState === "defensive" ||
			cryptoEffectiveState === "stress") &&
		(btcMa200 != null || realizedFloor != null)
	) {
		const c1 =
			btcMa200 != null
				? `200D MA ($${Math.round(btcMa200).toLocaleString("en-US")})`
				: "200-day MA";
		const c2 =
			realizedFloor != null
				? `1.0x Realized Floor ($${realizedFloor.toLocaleString("en-US")})`
				: "200-week MA / MVRV 1.0x floor";
		const c3 =
			btcMa200 != null
				? `Weekly Reclaim > $${Math.round(btcMa200).toLocaleString("en-US")}`
				: "weekly close back above 200-day MA";
		cryptoTranchePlan = `Tranche 1 (25%): ${c1} | Tranche 2 (25%): ${c2} | Tranche 3 (50%): ${c3}.`;
	}

	let cryptoInvalidation = baseCrypto.invalidation;
	if (
		(cryptoEffectiveState === "risk_on" ||
			cryptoEffectiveState === "defensive") &&
		btcMa200 != null
	) {
		cryptoInvalidation = `${baseCrypto.invalidation} (200D MA: $${Math.round(btcMa200).toLocaleString("en-US")})`;
	} else if (cryptoEffectiveState === "selective" && btcMa50 != null) {
		cryptoInvalidation = `${baseCrypto.invalidation} (50D MA Pivot: $${Math.round(btcMa50).toLocaleString("en-US")})`;
	}

	const cryptoLiveSummary = `Dual-Axis Stance: Trend Gate is ${cryptoEffectiveState.replace("_", " ").toUpperCase()} (${regimes.crypto.dualAxis?.trendScore ?? regimes.crypto.score}/100) | On-Chain Valuation is ${(regimes.crypto.dualAxis?.valuationState ?? "neutral").toUpperCase()} (${regimes.crypto.dualAxis?.valuationScore ?? 50}/100) | DCA Pace: ${permissions.crypto.dca.label}.`;

	return {
		ihsg: {
			...baseIhsg,
			tranchePlan: ihsgTranchePlan,
			invalidation: ihsgInvalidation,
			focusSectors: ihsgFocusSectors,
			liveSummary: ihsgLiveSummary,
			keyLevels: ihsgKeyLevels.length > 0 ? ihsgKeyLevels : undefined,
		},
		crypto: {
			...baseCrypto,
			tranchePlan: cryptoTranchePlan,
			invalidation: cryptoInvalidation,
			liveSummary: cryptoLiveSummary,
			keyLevels: cryptoKeyLevels.length > 0 ? cryptoKeyLevels : undefined,
		},
	};
}
