import { describe, it, expect } from "vitest";
import { FORMATIONS, PITCH_THEMES } from "../constants";
import type { FormationKey } from "../types";
import {
	parseFormationString,
	validateFormationLines,
	buildCustomFormation,
} from "../utils/formation-builder";

describe("Football Formations Configuration", () => {
	it("ensures every formation has exactly 11 slots and 1 goalkeeper", () => {
		const formationKeys = Object.keys(FORMATIONS) as FormationKey[];
		expect(formationKeys.length).toBeGreaterThanOrEqual(7);

		for (const key of formationKeys) {
			const formation = FORMATIONS[key];
			expect(formation.slots).toHaveLength(11);

			const gkSlots = formation.slots.filter((s) => s.role === "GK");
			expect(gkSlots).toHaveLength(1);

			// Check all coordinates are bounded in valid pitch percentages
			for (const slot of formation.slots) {
				expect(slot.x).toBeGreaterThan(0);
				expect(slot.x).toBeLessThan(100);
				expect(slot.y).toBeGreaterThan(0);
				expect(slot.y).toBeLessThan(100);
				expect(slot.defaultNumber).toBeGreaterThanOrEqual(1);
			}
		}
	});

	it("ensures all pitch themes are configured with required properties", () => {
		const themeKeys = Object.keys(PITCH_THEMES);
		expect(themeKeys).toContain("classic-emerald");
		expect(themeKeys).toContain("night-floodlight");

		for (const key of themeKeys) {
			const theme = PITCH_THEMES[key as keyof typeof PITCH_THEMES];
			expect(theme.bgClass).toBeDefined();
			expect(theme.borderLineColor).toBeDefined();
			expect(theme.stripeColor).toBeDefined();
		}
	});
});

describe("Custom Formation Builder & Min/Max 10 Validation", () => {
	it("parses formation notation strings into numeric line arrays", () => {
		expect(parseFormationString("4-2-3-1")).toEqual([4, 2, 3, 1]);
		expect(parseFormationString("4 3 3")).toEqual([4, 3, 3]);
		expect(parseFormationString("3, 4, 2, 1")).toEqual([3, 4, 2, 1]);
		expect(parseFormationString("invalid")).toEqual([]);
	});

	it("strictly validates that outfield players must be min 10 and max 10", () => {
		// Valid cases: sum === 10
		expect(validateFormationLines([4, 3, 3]).isValid).toBe(true);
		expect(validateFormationLines([4, 2, 3, 1]).isValid).toBe(true);
		expect(validateFormationLines([4, 2, 4]).isValid).toBe(true);
		expect(validateFormationLines([3, 4, 2, 1]).isValid).toBe(true);
		expect(validateFormationLines([5, 3, 2]).isValid).toBe(true);

		// Invalid cases: sum < 10 (fails min 10 requirement)
		const underResult = validateFormationLines([4, 4, 1]); // sum 9
		expect(underResult.isValid).toBe(false);
		expect(underResult.error).toContain("Minimum required is 10");
		expect(underResult.sum).toBe(9);

		// Invalid cases: sum > 10 (fails max 10 requirement)
		const overResult = validateFormationLines([4, 4, 3]); // sum 11
		expect(overResult.isValid).toBe(false);
		expect(overResult.error).toContain("Maximum allowed is 10");
		expect(overResult.sum).toBe(11);

		// Invalid cases: lines constraints
		expect(validateFormationLines([10]).isValid).toBe(false); // only 1 line
		expect(validateFormationLines([2, 2, 2, 2, 1, 1]).isValid).toBe(false); // 6 lines > 5 max
		expect(validateFormationLines([7, 2, 1]).isValid).toBe(false); // line > 6 max
	});

	it("builds custom formation with calibrated coordinates and exactly 11 slots (1 GK + 10 outfield)", () => {
		const custom = buildCustomFormation(
			"4-2-4 Brazil Quad",
			[4, 2, 4],
			"Attacking",
		);

		expect(custom.id).toBe("4-2-4");
		expect(custom.name).toBe("4-2-4 Brazil Quad");
		expect(custom.category).toBe("Attacking");
		expect(custom.isCustom).toBe(true);
		expect(custom.slots).toHaveLength(11);

		// Goalkeeper check
		const gk = custom.slots.find((s) => s.role === "GK");
		expect(gk).toBeDefined();
		expect(gk?.x).toBe(50);
		expect(gk?.y).toBe(90);

		// Outfield checks: 4 DF, 2 MF, 4 FW
		const defenders = custom.slots.filter((s) => s.role === "DF");
		const midfielders = custom.slots.filter((s) => s.role === "MF");
		const forwards = custom.slots.filter((s) => s.role === "FW");

		expect(defenders).toHaveLength(4);
		expect(midfielders).toHaveLength(2);
		expect(forwards).toHaveLength(4);

		// Check coordinates within bounds
		for (const slot of custom.slots) {
			expect(slot.x).toBeGreaterThanOrEqual(10);
			expect(slot.x).toBeLessThanOrEqual(90);
			expect(slot.y).toBeGreaterThanOrEqual(15);
			expect(slot.y).toBeLessThanOrEqual(95);
		}
	});

	it("throws error when trying to build formation violating min/max 10", () => {
		expect(() => buildCustomFormation("Invalid", [4, 3, 2])).toThrow();
		expect(() => buildCustomFormation("Invalid", [4, 4, 3])).toThrow();
	});
});
