export interface SizingMandate {
	maxRiskPerTradePct: number;
	maxPortfolioExposurePct: number;
	cashTargetPct: number;
	isTradingLocked: boolean;
	label: string;
}

/**
 * Mathematically translates a 0-100 regime composite score into an exact execution sizing mandate.
 *
 * Tiers:
 * >= 80: High conviction trend (Risk: 1.0%, Exposure: 80%, Cash: 20%)
 * 60-79: Selective/Moderate trend (Risk: 0.5%, Exposure: 50%, Cash: 50%)
 * 40-59: Defensive/Consolidation (Risk: 0.25%, Exposure: 25%, Cash: 75%)
 * < 40: Stress/Panic (Risk: 0%, Exposure: 0%, Cash: 100%, Trading Locked)
 */
export function getSizingMandate(compositeScore: number): SizingMandate {
	if (compositeScore >= 80) {
		return {
			maxRiskPerTradePct: 1.0,
			maxPortfolioExposurePct: 80,
			cashTargetPct: 20,
			isTradingLocked: false,
			label: "Aggressive Allocation (Max 1.0% Risk)",
		};
	}

	if (compositeScore >= 60) {
		return {
			maxRiskPerTradePct: 0.5,
			maxPortfolioExposurePct: 50,
			cashTargetPct: 50,
			isTradingLocked: false,
			label: "Selective Allocation (Max 0.5% Risk)",
		};
	}

	if (compositeScore >= 40) {
		return {
			maxRiskPerTradePct: 0.25,
			maxPortfolioExposurePct: 25,
			cashTargetPct: 75,
			isTradingLocked: false,
			label: "Defensive Allocation (Max 0.25% Risk)",
		};
	}

	return {
		maxRiskPerTradePct: 0.0,
		maxPortfolioExposurePct: 0,
		cashTargetPct: 100,
		isTradingLocked: true,
		label: "TRADING LOCKED: Cash Preservation",
	};
}
