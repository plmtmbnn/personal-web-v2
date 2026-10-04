import type { RegimeState, Tone } from "../../types";
import type { InvestmentThresholds } from "../../config/thresholds";

export function determineState(
	score: number,
	coverage: number,
	thresholds: InvestmentThresholds,
): { state: RegimeState; tone: Tone } {
	if (coverage < thresholds.scoring.minCoveragePartial) {
		return { state: "insufficient", tone: "neutral" };
	}

	if (score >= thresholds.scoring.riskOnMin) {
		return { state: "risk_on", tone: "positive" };
	}
	if (score >= thresholds.scoring.selectiveMin) {
		return { state: "selective", tone: "neutral" };
	}
	if (score >= thresholds.scoring.defensiveMin) {
		return { state: "defensive", tone: "caution" };
	}
	return { state: "stress", tone: "negative" };
}

export function getStateLabel(state: RegimeState): string {
	switch (state) {
		case "risk_on":
			return "Risk-On (Supportive)";
		case "selective":
			return "Selective (Range / Mixed)";
		case "defensive":
			return "Defensive (Capital Preservation)";
		case "stress":
			return "Severe Stress (Stand Aside)";
		case "insufficient":
			return "Data Stream Degraded";
	}
}
