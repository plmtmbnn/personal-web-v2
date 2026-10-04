import { describe, it, expect } from "vitest";
import {
	sma,
	distancePct,
	maSlopePct,
	drawdownFromHigh,
	realizedVol,
	rsi,
	sahmRule,
	getHalvingCyclePhase,
} from "../indicators";

describe("Investment Indicators", () => {
	it("calculates SMA correctly", () => {
		const points = [{ c: 10 }, { c: 20 }, { c: 30 }, { c: 40 }, { c: 50 }];
		expect(sma(points, 3)).toBe(40); // (30+40+50)/3
		expect(sma(points, 5)).toBe(30); // 150/5
		expect(sma(points, 6)).toBeNull(); // not enough points
	});

	it("calculates percentage distance from MA", () => {
		expect(distancePct(110, 100)).toBe(10);
		expect(distancePct(90, 100)).toBe(-10);
		expect(distancePct(100, null)).toBeNull();
		expect(distancePct(100, 0)).toBeNull();
	});

	it("calculates MA slope", () => {
		// 15 points rising steadily
		const points = Array.from({ length: 20 }, (_, i) => ({ c: 100 + i * 2 }));
		const slope = maSlopePct(points, 5, 5);
		expect(slope).not.toBeNull();
		expect(slope!).toBeGreaterThan(0);
	});

	it("calculates drawdown from 52-week high", () => {
		expect(drawdownFromHigh(90, 100)).toBe(-10);
		expect(drawdownFromHigh(100, 100)).toBe(0);
		expect(drawdownFromHigh(110, 100)).toBe(0); // at or above high
		expect(drawdownFromHigh(null, 100)).toBeNull();
	});

	it("calculates annualized realized volatility", () => {
		const points = Array.from({ length: 40 }, (_, i) => ({
			c: 100 + Math.sin(i) * 5,
		}));
		const vol = realizedVol(points, 30);
		expect(vol).not.toBeNull();
		expect(vol!).toBeGreaterThan(0);
	});

	it("calculates RSI", () => {
		// Strictly rising price
		const rising = Array.from({ length: 20 }, (_, i) => ({ c: 100 + i * 5 }));
		expect(rsi(rising, 14)).toBe(100);

		// Flat price
		const flat = Array.from({ length: 20 }, () => ({ c: 100 }));
		expect(rsi(flat, 14)).toBe(100);
	});

	it("calculates Sahm Rule accurately", () => {
		// 20 months of unemployment data
		// baseline 4.0, then rising to 4.8
		const unrateData = [
			{ value: 4.0 },
			{ value: 4.0 },
			{ value: 4.0 },
			{ value: 4.0 },
			{ value: 4.0 },
			{ value: 4.0 },
			{ value: 4.0 },
			{ value: 4.0 },
			{ value: 4.0 },
			{ value: 4.0 },
			{ value: 4.0 },
			{ value: 4.0 },
			{ value: 4.2 },
			{ value: 4.5 },
			{ value: 4.9 },
		];

		const result = sahmRule(unrateData);
		expect(result.triggered).toBe(true);
		expect(result.value!).toBeGreaterThanOrEqual(0.5);
	});

	it("calculates halving cycle phase", () => {
		const testDate = new Date("2024-10-20");
		const cycle = getHalvingCyclePhase(testDate);
		expect(cycle.monthsElapsed).toBe(6);
		expect(cycle.phase).toContain("Euphoria");
	});
});
