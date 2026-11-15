import { describe, expect, it } from "vitest";
import {
	evaluatePaperEntry,
	modeledFill,
	netTradeRisk,
} from "../utils/paper-risk";
import type { CompassBridgeSummary } from "../types";

const permission = { status: "allowed", label: "Allowed", reason: "" } as const;
const posture: CompassBridgeSummary = {
	rawState: "risk_on",
	effectiveState: "risk_on",
	score: 70,
	headline: "",
	trendState: "risk_on",
	valuationState: "",
	maxExposurePct: 15,
	riskPerTradePct: 1,
	isTradingLocked: false,
	snapshotId: "2026-11-13T10:00:00Z",
	permissions: { core: permission, swing: permission, scalp: permission },
};
const entry = {
	entry: 1000,
	stop: 950,
	target: 1200,
	lots: 2,
	equityIdr: 5_000_000,
	current: true,
	turnover: 5e9,
	posture,
	picks: [],
};

describe("IDX paper entry", () => {
	it("models fees and adverse tick changes at price band boundaries", () => {
		expect(modeledFill(200, "sell")).toBeCloseTo(199 * 0.9975);
		expect(modeledFill(500, "buy")).toBeCloseTo(505 * 1.0015);
		expect(netTradeRisk(1000, 950, 1100)?.ratio).toBeLessThan(2);
		expect(netTradeRisk(1000, 1000, 1100)).toBeNull();
	});

	it("floors the binding capital and risk limits and never invents one lot", () => {
		const result = evaluatePaperEntry(entry);
		expect(result.failed).toEqual([]);
		expect(result.recommendedLots).toBe(7);
		expect(
			evaluatePaperEntry({ ...entry, equityIdr: 10_000 }).recommendedLots,
		).toBe(0);
		const locked = evaluatePaperEntry({
			...entry,
			posture: { ...posture, riskPerTradePct: 0, maxExposurePct: 0 },
		});
		expect(locked.recommendedLots).toBe(0);
		expect(locked.failed).toContain("size");
		expect(evaluatePaperEntry({ ...entry, current: false }).failed).toContain(
			"data",
		);
	});
});
