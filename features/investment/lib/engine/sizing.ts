import type { RegimeState } from "../../types";

export interface SizingMandate {
	maxRiskPerTradePct: number;
	maxPortfolioExposurePct: number;
	cashTargetPct: number;
	isTradingLocked: boolean;
	label: string;
	state: RegimeState;
	dcaPace: "normal" | "half_pace" | "tranche_only" | "paused";
}

/**
 * Mathematically translates a regime state or 0-100 score into an exact execution sizing mandate
 * based on the 40% Safe / 45% Core / 15% Swing capital bucket standard.
 */
export function getSizingMandate(
	stateOrScore: RegimeState | number,
	_compositeScore?: number,
): SizingMandate {
	let state: RegimeState = "selective";

	if (typeof stateOrScore === "string") {
		state = stateOrScore;
	} else {
		const score = stateOrScore;
		if (score >= 65) state = "risk_on";
		else if (score >= 45) state = "selective";
		else if (score >= 30) state = "defensive";
		else state = "stress";
	}

	switch (state) {
		case "risk_on":
			return {
				maxRiskPerTradePct: 1.0,
				maxPortfolioExposurePct: 15.0, // 100% of 15% tactical swing bucket
				cashTargetPct: 40.0, // Baseline Safe Preservation Bucket
				isTradingLocked: false,
				label: "Aggressive Participation (Risk max 1.0% per setup)",
				state: "risk_on",
				dcaPace: "normal",
			};

		case "selective":
			return {
				maxRiskPerTradePct: 0.5,
				maxPortfolioExposurePct: 10.0, // Scaled swing cap
				cashTargetPct: 45.0,
				isTradingLocked: false,
				label: "Selective Allocation (Risk max 0.5% per setup)",
				state: "selective",
				dcaPace: "normal",
			};

		case "defensive":
			return {
				maxRiskPerTradePct: 0.0,
				maxPortfolioExposurePct: 0.0, // Swing trading closed
				cashTargetPct: 55.0,
				isTradingLocked: true,
				label: "Capital Preservation: Trading Closed (Half-Pace DCA)",
				state: "defensive",
				dcaPace: "half_pace",
			};

		case "stress":
			return {
				maxRiskPerTradePct: 0.0,
				maxPortfolioExposurePct: 0.0,
				cashTargetPct: 70.0,
				isTradingLocked: true,
				label: "TRADING FROZEN: Extreme Defense (Tranche Buy Only)",
				state: "stress",
				dcaPace: "tranche_only",
			};

		default:
			return {
				maxRiskPerTradePct: 0.0,
				maxPortfolioExposurePct: 0.0,
				cashTargetPct: 40.0,
				isTradingLocked: true,
				label: "DATA DEGRADED: Stand Aside",
				state: "insufficient",
				dcaPace: "normal",
			};
	}
}
