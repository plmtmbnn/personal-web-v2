import type { CompassBridgeSummary } from "@/features/utils/stock-tools/stock-explorer/types";
import type { InvestmentCompassData } from "../types";

export function getIdxPosture(
	data: InvestmentCompassData,
): CompassBridgeSummary | null {
	const output = data.engineOutput;
	if (!output) return null;
	const regime = output.regimes.ihsg;
	const permissions = output.permissions.ihsg;
	const mandate = permissions.mandate;
	const flow = data.sources.idxFlows?.evidence?.session;
	return {
		rawState: regime.state,
		effectiveState: mandate?.state ?? regime.state,
		score: regime.score,
		headline: regime.headline,
		trendState: regime.dualAxis?.trendState ?? regime.state,
		valuationState: regime.dualAxis?.valuationState ?? "neutral",
		maxExposurePct: mandate?.maxPortfolioExposurePct ?? 0,
		riskPerTradePct: mandate?.maxRiskPerTradePct ?? 0,
		isTradingLocked: mandate?.isTradingLocked ?? true,
		streakDays:
			flow?.status === "current" ? data.markets.ihsgFlows?.streakDays : null,
		net5dIdr:
			flow?.status === "current"
				? data.markets.ihsgFlows?.netBuySell5dIdr
				: null,
		snapshotId: data.snapshotId ?? data.fetchedAt,
		computedAt: data.fetchedAt,
		session: data.markets.ihsgFlows?.asOf,
		coverage: regime.coverage,
		permissions: {
			core: permissions.dca,
			swing: permissions.swing,
			scalp: permissions.scalp,
		},
	};
}
