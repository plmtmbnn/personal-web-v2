import { describe, expect, it } from "vitest";

const calculatePercentage = (visited: number, total: number) => {
	return total > 0 ? Math.round((visited / total) * 100) : 0;
};

describe("StatsCard Logic", () => {
	it("should calculate correct percentage", () => {
		expect(calculatePercentage(5, 10)).toBe(50);
		expect(calculatePercentage(1, 3)).toBe(33);
	});

	it("should handle zero total", () => {
		expect(calculatePercentage(0, 0)).toBe(0);
	});

	it("should handle full completion", () => {
		expect(calculatePercentage(10, 10)).toBe(100);
	});
});
