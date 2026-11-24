import { describe, expect, it } from "vitest";
import { validateStockImport } from "../validate-import";

const stock = {
	StockCode: "BBCA",
	Date: "2026-11-24T00:00:00",
	Close: 10_000,
	Volume: 1_000,
	Value: 10_000_000,
	ForeignBuy: 100,
	ForeignSell: 50,
};

describe("stock import validation", () => {
	it("accepts a complete single-session dataset", () => {
		expect(
			validateStockImport([stock, { ...stock, StockCode: "BBRI" }]),
		).toBeNull();
	});

	it("rejects empty, partial, and mixed-session records", () => {
		expect(validateStockImport([])).toMatch(/nonempty/);
		expect(validateStockImport([{ ...stock, Date: "" }])).toMatch(
			/trading date/,
		);
		expect(validateStockImport([{ ...stock, Date: "2026-02-30" }])).toMatch(
			/trading date/,
		);
		expect(validateStockImport([{ ...stock, Close: null }])).toMatch(/Close/);
		expect(
			validateStockImport([{ ...stock, Volume: Number.POSITIVE_INFINITY }]),
		).toMatch(/Volume/);
		expect(
			validateStockImport([stock, { ...stock, Date: "2026-11-23" }]),
		).toMatch(/same trading session/);
	});
});
