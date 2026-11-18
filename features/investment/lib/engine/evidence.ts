import type { MarketRegimeScore } from "../../types";
import type { InvestmentThresholds } from "../../config/thresholds";

export const MODEL_VERSION = "4.0.0";

const expected = {
	global: [
		"dxy",
		"hy_spread",
		"us10y",
		"fed_funds",
		"m2_growth",
		"core_pce_yoy",
		"us_real_yield",
		"unrate",
		"vix",
	],
	ihsg: [
		"ihsg_200ma",
		"ihsg_50ma",
		"usdidr_trend",
		"ihsg_breadth",
		"bi_rate",
		"ihsg_drawdown",
		"ihsg_foreign_flow",
		"global_liquidity_carry",
	],
	crypto: [
		"btc_200ma",
		"btc_50ma",
		"stablecoin_supply",
		"btc_funding",
		"crypto_fng",
		"crypto_mvrv",
		"crypto_macro_carry",
	],
};

export function enforceEvidence(
	regime: MarketRegimeScore,
	thresholds: InvestmentThresholds,
	global?: MarketRegimeScore,
) {
	regime.missingFactors = expected[regime.id].filter(
		(key) => !regime.factors.some((factor) => factor.key === key),
	);
	const missing = new Set(regime.missingFactors);
	const reasons: string[] = [];
	const coreMissing =
		regime.id === "global"
			? ["dxy", "vix", "hy_spread"].some((key) => missing.has(key))
			: missing.has(regime.id === "ihsg" ? "ihsg_200ma" : "btc_200ma");
	if (coreMissing)
		reasons.push("Core price, trend, or macro evidence is missing");
	const insufficient =
		coreMissing || regime.coverage < thresholds.scoring.minCoveragePartial;
	const importantMissing =
		regime.id === "ihsg"
			? missing.has("bi_rate") || missing.has("ihsg_foreign_flow")
			: regime.id === "crypto"
				? missing.has("stablecoin_supply")
				: false;
	if (regime.coverage < thresholds.scoring.minCoverageFull)
		reasons.push("Evidence coverage is below 70%");
	if (importantMissing)
		reasons.push(
			regime.id === "ihsg"
				? "BI policy rate or IDX foreign flow is missing"
				: "Stablecoin liquidity evidence is missing",
		);
	if (global?.state === "insufficient")
		reasons.push("Global evidence is insufficient");
	if (insufficient) {
		regime.state = "insufficient";
		regime.tone = "neutral";
	} else if (reasons.length && regime.state === "risk_on") {
		regime.state = "selective";
		regime.tone = "neutral";
	}
	if (
		regime.dualAxis &&
		(insufficient ||
			(reasons.length && regime.dualAxis.trendState === "risk_on"))
	)
		regime.dualAxis.trendState = insufficient ? "insufficient" : "selective";
	if (reasons.length) {
		regime.contextFlags.push(...reasons);
		regime.headline = insufficient
			? "Insufficient current evidence"
			: `${regime.marketName}: evidence limits apply`;
		regime.diagnosis = `${reasons.join(". ")}. Diagnostic score ${regime.score}/100; coverage ${Math.round(regime.coverage * 100)}%. Existing defensive and stress restrictions remain in force.`;
	}
	return regime;
}
