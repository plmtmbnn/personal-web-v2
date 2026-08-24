import { describe, it, expect } from "vitest";
import { fmtCompact, fmtPct } from "../utils";

describe("Stock Explorer Utils", () => {
	describe("fmtCompact()", () => {
		it("formats small numbers using locale string", () => {
			expect(fmtCompact(500)).toBe("500");
			expect(fmtCompact(0)).toBe("0");
		});

		it("formats thousands as K", () => {
			expect(fmtCompact(1500)).toBe("1.5K");
			expect(fmtCompact(25000)).toBe("25.0K");
		});

		it("formats millions as M", () => {
			expect(fmtCompact(1000000)).toBe("1.0M");
			expect(fmtCompact(5250000)).toBe("5.3M");
		});

		it("formats billions as B", () => {
			expect(fmtCompact(1000000000)).toBe("1.0B");
			expect(fmtCompact(7800000000)).toBe("7.8B");
			expect(fmtCompact(7900000000)).toBe("7.9B");
		});
	});

	describe("fmtPct()", () => {
		it("formats positive numbers with a plus sign", () => {
			expect(fmtPct(2.5)).toBe("+2.50%");
			expect(fmtPct(0.1234)).toBe("+0.12%");
		});

		it("formats negative numbers with a minus sign", () => {
			expect(fmtPct(-1.45)).toBe("-1.45%");
			expect(fmtPct(-0.5)).toBe("-0.50%");
		});

		it("formats zero without sign", () => {
			expect(fmtPct(0)).toBe("0.00%");
		});
	});
});
