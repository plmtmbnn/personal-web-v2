import type { RegimeState } from "../types";

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
				"Standard position sizing: Risk up to 1.0% of trading bucket per setup.",
			invalidation:
				"IHSG closes below 50-day MA or USD/IDR spikes above 50-day MA on heavy volume.",
			focusSectors: [
				"Big 4 Banks (BBCA, BMRI, BBNI, BBRI)",
				"Infrastructure & Telco (TLKM)",
				"Consumer Non-Cyclical (ICBP, INDF)",
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
				"Reduced sizing: Risk max 0.5% - 0.75% of trading bucket per setup.",
			invalidation:
				"Daily breakdown below 200-day MA with foreign net selling streak.",
			focusSectors: [
				"Defensive Banks (BBCA, BMRI)",
				"Consumer Staples (ICBP)",
				"Essential Telco (TLKM)",
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
			sizing: "Active trading closed. Long-term DCA at half pace only.",
			tranchePlan:
				"Tranche 1: 25% at 200-day MA · Tranche 2: 25% at -10% drawdown · Tranche 3: 50% only after confirmed reclaim of 50-day MA.",
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
			sizing: "Trading bucket completely frozen. Zero active trades.",
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
				"Spot positions sized strictly within the core crypto cap (<= 20% total).",
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
			sizing: "Normal DCA pace for BTC/ETH spot only.",
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
			sizing: "Slow DCA (50% normal pace) into Bitcoin spot only.",
			tranchePlan:
				"Tranche 1: 25% at 200-day MA · Tranche 2: 25% at 200-week MA · Tranche 3: 50% only after weekly close back above 200-day MA.",
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
				"All active trading frozen. Pre-planned generational tranches only.",
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
