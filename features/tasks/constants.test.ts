import { describe, it, expect } from "vitest";
import { formatEstimatedTime } from "@/features/tasks/constants";

describe("formatEstimatedTime", () => {
	it("formats minutes under 1 hour", () => {
		expect(formatEstimatedTime(15)).toBe("15m");
		expect(formatEstimatedTime(45)).toBe("45m");
	});

	it("formats exactly 1 hour", () => {
		expect(formatEstimatedTime(60)).toBe("1h");
	});

	it("formats hours with remaining minutes", () => {
		expect(formatEstimatedTime(90)).toBe("1h 30m");
		expect(formatEstimatedTime(120)).toBe("2h");
		expect(formatEstimatedTime(150)).toBe("2h 30m");
	});

	it("handles zero minutes", () => {
		expect(formatEstimatedTime(0)).toBe("0m");
	});
});
