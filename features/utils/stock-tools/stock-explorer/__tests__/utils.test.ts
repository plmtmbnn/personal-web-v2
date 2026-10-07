import { describe, it, expect } from "vitest";
import {
	fmtCompact,
	fmtPct,
	fmtLots,
	fmtIDRNet,
	fmtIDRValue,
	getIdxPriceTick,
	roundToIdxTick,
	getIdxAutoRejectionLimits,
	getTurnoverTier,
} from "../utils";

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

	describe("fmtLots()", () => {
		it("converts shares into IDX lots (divided by 100)", () => {
			expect(fmtLots(10000)).toBe("100 lots");
			expect(fmtLots(78500000)).toBe("785.0K lots");
			expect(fmtLots(1250000000)).toBe("12.5M lots");
		});
	});

	describe("fmtIDRNet()", () => {
		it("formats billions with + and - signs", () => {
			expect(fmtIDRNet(25400000000)).toBe("+25.4B");
			expect(fmtIDRNet(-14800000000)).toBe("-14.8B");
		});

		it("formats trillions", () => {
			expect(fmtIDRNet(1250000000000)).toBe("+1.3T");
			expect(fmtIDRNet(-2100000000000)).toBe("-2.1T");
		});

		it("formats 0 as '0'", () => {
			expect(fmtIDRNet(0)).toBe("0");
		});
	});

	describe("fmtIDRValue()", () => {
		it("formats unsigned nominal IDR amounts for turnover and transaction ticket size", () => {
			expect(fmtIDRValue(0)).toBe("0");
			expect(fmtIDRValue(45000000)).toBe("45.0M");
			expect(fmtIDRValue(1500000000)).toBe("1.50B");
			expect(fmtIDRValue(25400000000)).toBe("25.40B");
			expect(fmtIDRValue(1200000000000)).toBe("1.20T");
		});
	});

	describe("getIdxPriceTick() & roundToIdxTick()", () => {
		it("returns accurate IDX price tick based on BEI guidelines", () => {
			expect(getIdxPriceTick(150)).toBe(1);
			expect(getIdxPriceTick(350)).toBe(2);
			expect(getIdxPriceTick(1200)).toBe(5);
			expect(getIdxPriceTick(3400)).toBe(10);
			expect(getIdxPriceTick(6500)).toBe(25);
		});

		it("rounds prices correctly to nearest tick", () => {
			expect(roundToIdxTick(342, "down")).toBe(342); // tick is 2
			expect(roundToIdxTick(343, "down")).toBe(342);
			expect(roundToIdxTick(343, "up")).toBe(344);
			expect(roundToIdxTick(6103, "down")).toBe(6100); // tick is 25
			expect(roundToIdxTick(6103, "up")).toBe(6125);
		});
	});

	describe("getIdxAutoRejectionLimits()", () => {
		it("calculates symmetric Auto Rejection for 3 price tiers", () => {
			// Tier 1: <= 200 (35%)
			const tier1 = getIdxAutoRejectionLimits(100);
			expect(tier1.araPrice).toBe(135);
			expect(tier1.arbPrice).toBe(65);

			// Tier 2: 201 - 5000 (25%)
			const tier2 = getIdxAutoRejectionLimits(1000);
			expect(tier2.araPrice).toBe(1250);
			expect(tier2.arbPrice).toBe(750);

			// Tier 3: > 5000 (20%)
			const tier3 = getIdxAutoRejectionLimits(6000);
			expect(tier3.araPrice).toBe(7200);
			expect(tier3.arbPrice).toBe(4800);
		});
	});

	describe("getTurnoverTier()", () => {
		it("categorizes stocks into correct liquidity tiers", () => {
			expect(getTurnoverTier(500000000)).toBe("Illiquid");
			expect(getTurnoverTier(2000000000)).toBe("Low");
			expect(getTurnoverTier(10000000000)).toBe("Mid");
			expect(getTurnoverTier(25000000000)).toBe("High");
			expect(getTurnoverTier(80000000000)).toBe("Mega");
		});
	});
});
