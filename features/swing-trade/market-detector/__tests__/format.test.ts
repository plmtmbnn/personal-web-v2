import { describe, expect, it } from "vitest";
import { formatCompact, parseRawNum } from "../lib/format";

describe("Market Detector Format Utility", () => {
	it("parses raw numbers and strings with units or commas", () => {
		expect(parseRawNum(1500)).toBe(1500);
		expect(parseRawNum("1500000")).toBe(1500000);
		expect(parseRawNum("1,500,000")).toBe(1500000);
		expect(parseRawNum("2.5K")).toBe(2500);
		expect(parseRawNum("10.5M")).toBe(10500000);
		expect(parseRawNum("1.2B")).toBe(1200000000);
		expect(parseRawNum("3.4T")).toBe(3400000000000);
		expect(parseRawNum("")).toBe(0);
		expect(parseRawNum(null)).toBe(0);
	});

	it("formats lots into 1K, 1M, 1B, 1T notation", () => {
		expect(formatCompact(0)).toBe("0");
		expect(formatCompact(500)).toBe("500");
		expect(formatCompact(1000)).toBe("1K");
		expect(formatCompact(1500)).toBe("1.5K");
		expect(formatCompact(25000)).toBe("25K");
		expect(formatCompact(1500000)).toBe("1.5M");
		expect(formatCompact(250000000)).toBe("250M");
		expect(formatCompact(1500000000)).toBe("1.5B");
		expect(formatCompact(2400000000000)).toBe("2.4T");
	});

	it("formats value with currency prefix into 1K, 1M, 1B, 1T notation", () => {
		expect(formatCompact(0, "Rp ")).toBe("Rp 0");
		expect(formatCompact(500000, "Rp ")).toBe("Rp 500K");
		expect(formatCompact(15000000, "Rp ")).toBe("Rp 15M");
		expect(formatCompact(2500000000, "Rp ")).toBe("Rp 2.5B");
		expect(formatCompact(1200000000000, "Rp ")).toBe("Rp 1.2T");
	});

	it("handles negative numbers properly", () => {
		expect(formatCompact(-1500)).toBe("-1.5K");
		expect(formatCompact(-2500000000, "Rp ")).toBe("-Rp 2.5B");
	});

	it("correctly parses and formats scientific notation strings from exchange API", () => {
		// Net lots from DOOH API
		expect(parseRawNum("-2.151022e+06")).toBe(-2151022);
		expect(formatCompact("-2.151022e+06")).toBe("-2.2M");

		expect(parseRawNum("1.586912e+06")).toBe(1586912);
		expect(formatCompact("1.586912e+06")).toBe("1.6M");

		// Net turnover values from DOOH API
		expect(parseRawNum("-6.64396224e+10")).toBe(-66439622400);
		expect(formatCompact("-6.64396224e+10", "Rp ")).toBe("-Rp 66.4B");

		expect(parseRawNum("6.00317542e+10")).toBe(60031754200);
		expect(formatCompact("6.00317542e+10", "Rp ")).toBe("Rp 60B");

		expect(formatCompact("-1.27096145e+10", "Rp ")).toBe("-Rp 12.7B");
		expect(formatCompact("-8.136242e+09", "Rp ")).toBe("-Rp 8.1B");
		expect(formatCompact("-7.5160312e+09", "Rp ")).toBe("-Rp 7.5B");

		// Regular lot strings
		expect(formatCompact("-406939")).toBe("-407K");
		expect(formatCompact("-129555")).toBe("-130K");
		expect(formatCompact("-88785")).toBe("-88.8K");
	});
});
