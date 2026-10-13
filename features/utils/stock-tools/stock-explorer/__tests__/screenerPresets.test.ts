import { describe, it, expect, vi } from "vitest";

vi.mock("../actions/stockpicks", () => ({
	fetchCloudStockPicksAction: vi
		.fn()
		.mockResolvedValue({ success: true, data: [] }),
	saveCloudStockPickAction: vi.fn(),
	closeCloudStockPickAction: vi.fn(),
	deleteCloudStockPickAction: vi.fn(),
	syncCloudWatermarksAction: vi.fn(),
}));

import { STRATEGY_PRESETS, DEFAULT_WEIGHTS } from "../context/ScreenerContext";

describe("Screener Strategy Presets & Compass Linkage", () => {
	it("verifies DEFAULT_WEIGHTS sum to exactly 100", () => {
		const sum =
			DEFAULT_WEIGHTS.price +
			DEFAULT_WEIGHTS.volume +
			DEFAULT_WEIGHTS.foreign +
			DEFAULT_WEIGHTS.liquidity +
			DEFAULT_WEIGHTS.volatility;
		expect(sum).toBe(100);
	});

	it("verifies every strategy preset weights sum to exactly 100", () => {
		for (const preset of STRATEGY_PRESETS) {
			const sum =
				preset.weights.price +
				preset.weights.volume +
				preset.weights.foreign +
				preset.weights.liquidity +
				preset.weights.volatility;
			expect(sum, `Preset ${preset.name} does not sum to 100`).toBe(100);
		}
	});

	it("includes Compass-aligned strategy presets for both defensive and risk-on regimes", () => {
		const defensivePreset = STRATEGY_PRESETS.find(
			(p) => p.name === "Compass Defensive Blue-Chip",
		);
		const riskOnPreset = STRATEGY_PRESETS.find(
			(p) => p.name === "Compass Risk-On Momentum",
		);

		expect(defensivePreset).toBeDefined();
		expect(riskOnPreset).toBeDefined();

		// Defensive preset prioritizes foreign flow (45) and liquidity (30) with zero volatility
		expect(defensivePreset?.weights.foreign).toBe(45);
		expect(defensivePreset?.weights.liquidity).toBe(30);
		expect(defensivePreset?.weights.volatility).toBe(0);

		// Risk-on preset prioritizes price momentum (35) and volume (35)
		expect(riskOnPreset?.weights.price).toBe(35);
		expect(riskOnPreset?.weights.volume).toBe(35);
	});
});
