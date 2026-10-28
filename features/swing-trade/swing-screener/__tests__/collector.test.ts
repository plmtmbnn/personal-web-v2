import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	executeSwingAnalysis,
	getDefaultDateRange,
	type FeedPayloads,
} from "../lib/collector";

describe("swing-screener collector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("computes a 1-year lookback default date range", () => {
		const { startDate, endDate } = getDefaultDateRange();
		expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

		const startYear = Number(startDate.split("-")[0]);
		const endYear = Number(endDate.split("-")[0]);
		expect(endYear - startYear).toBe(1);
	});

	it("builds multipart FormData and POSTs to analyze-swing endpoint", async () => {
		let capturedUrl = "";
		let capturedBody: FormData | null = null;

		const mockResponse = {
			ticker: "PWON",
			date: "2026-10-27",
			swing_score: 85,
			active_layers: 5,
		};

		vi.stubGlobal(
			"fetch",
			vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
				capturedUrl = url;
				capturedBody = init?.body as FormData;
				return {
					ok: true,
					json: async () => mockResponse,
				};
			}),
		);

		const payloads: FeedPayloads = {
			historicalCsv:
				"Date,Open,High,Low,Close,Volume\n2026-10-27,286,294,282,294,1894109",
			tradeBookJson: { book_total: { total_buy: 100 } },
			marketDetectorJson: { broker_summary: {} },
		};

		const res = await executeSwingAnalysis({
			ticker: "pwon",
			feeBuy: 0.15,
			feeSell: 0.25,
			payloads,
		});

		expect(res).toEqual(mockResponse);
		expect(capturedUrl).toBe(
			"https://peoel-screener-py.vercel.app/api/v1/analyze-swing",
		);
		expect(capturedBody).not.toBeNull();
		const body = capturedBody as unknown as FormData;
		expect(body.get("ticker")).toBe("PWON");
		expect(body.get("fee_buy")).toBe("0.15");
		expect(body.get("fee_sell")).toBe("0.25");
		expect(body.has("historical_file")).toBe(true);
		expect(body.has("trade_book_file")).toBe(true);
		expect(body.has("market_detector_file")).toBe(true);
	});

	it("throws formatted error message if backend returns non-ok status", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockImplementation(async () => {
				return {
					ok: false,
					status: 422,
					json: async () => ({ detail: "Invalid historical CSV header" }),
				};
			}),
		);

		await expect(
			executeSwingAnalysis({
				ticker: "PWON",
				payloads: {
					historicalCsv: "bad,header",
					tradeBookJson: {},
				},
			}),
		).rejects.toThrow("Invalid historical CSV header");
	});

	it("fetches historical trade data using limit: 50 and iterates over next_page", async () => {
		const calls: Array<{ page: number; limit: number; symbol: string }> = [];
		vi.stubGlobal(
			"fetch",
			vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
				const body = JSON.parse(init?.body as string);
				calls.push(body);

				if (body.page === 1) {
					return {
						ok: true,
						json: async () => ({
							data: {
								result: [
									{
										date: "2026-10-26",
										close: 284,
										change: 2,
										value: 1000,
										volume: 100,
										frequency: 10,
										foreign_buy: 50,
										foreign_sell: 20,
										net_foreign: 30,
										open: 282,
										high: 286,
										low: 280,
										average: 283,
										change_percentage: 0.7,
									},
								],
								paginate: { next_page: "2" },
							},
						}),
					};
				}

				return {
					ok: true,
					json: async () => ({
						data: {
							result: [
								{
									date: "2026-10-27",
									close: 294,
									change: 10,
									value: 2000,
									volume: 200,
									frequency: 20,
									foreign_buy: 100,
									foreign_sell: 40,
									net_foreign: 60,
									open: 286,
									high: 294,
									low: 282,
									average: 291,
									change_percentage: 3.5,
								},
							],
							paginate: { next_page: "" },
						},
					}),
				};
			}),
		);

		const { fetchHistoricalFeed } = await import("../lib/collector");
		const csv = await fetchHistoricalFeed(
			"PWON",
			"https://api.source.com",
			"token-123",
		);

		expect(calls.length).toBe(2);
		expect(calls[0]).toMatchObject({ limit: 50, page: 1, symbol: "PWON" });
		expect(calls[1]).toMatchObject({ limit: 50, page: 2, symbol: "PWON" });
		expect(csv).toContain("2026-10-26");
		expect(csv).toContain("2026-10-27");
	});
});
