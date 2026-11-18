import { afterEach, describe, expect, it, vi } from "vitest";
import {
	parseBiObservations,
	parseBisPolicy,
	fetchIndonesiaMacro,
} from "../indonesia-macro";
import { fetchStablecoinSupply30d } from "../defillama";
import { registeredQuotes, quoteIsCurrent, registeredMacro } from "../registry";
import { normalizeYahooMeta } from "../yahoo";
import type { MarketQuote, MacroSeries } from "../types";

afterEach(() => {
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe("DefiLlama timestamp and baseline repair", () => {
	it("accepts Unix-second strings and uses USD values", async () => {
		const day = 86400;
		const points = Array.from({ length: 40 }, (_, i) => ({
			date: String(1791590400 + i * day),
			totalCirculating: { peggedUSD: 999 },
			totalCirculatingUSD: { peggedUSD: 100 + i },
		}));
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: true, json: async () => points }),
		);
		const result = await fetchStablecoinSupply30d({ fresh: true });
		expect(result?.totalUsd).toBe(139);
		expect(result?.change30dPct).toBeCloseTo(((139 - 109) / 109) * 100);
		expect(result?.asOf).toBe(Number(points.at(-1)!.date));
	});
	it("rejects a 30-day baseline separated by a large gap", async () => {
		const latest = 1794960000;
		const points = Array.from({ length: 40 }, (_, i) => ({
			date: latest - (i < 20 ? i : i + 20) * 86400,
			totalCirculatingUSD: { peggedUSD: 100 },
		}));
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: true, json: async () => points }),
		);
		const onError = vi.fn();
		expect(await fetchStablecoinSupply30d({ onError })).toBeNull();
		expect(onError).toHaveBeenCalledWith(expect.stringContaining("baseline"));
	});
});

describe("Indonesia source adapters", () => {
	it("reads BI chart data in chronological order and excludes future observations", () => {
		const html =
			'<input value="[[1794960000000,6,&quot;6.00 %&quot;],[1792540800000,5.75,&quot;5.75 %&quot;],[1893456000000,99,&quot;99 %&quot;]]">';
		expect(parseBiObservations(html, "2026-11-18T12:00:00Z")).toEqual([
			{ date: "2026-10-21", value: 5.75 },
			{ date: "2026-11-18", value: 6 },
		]);
	});
	it("falls back to a dated BI table and preserves CPI as YoY", () => {
		const html =
			'<table><tr><td class="text-center">September 2026</td><td>3.28 %</td></tr></table>';
		expect(parseBiObservations(html, "2026-11-18T12:00:00Z")).toEqual([
			{ date: "2026-09-01", value: 3.28 },
		]);
		expect(parseBiObservations("<html>Layout changed</html>")).toEqual([]);
	});
	it("rejects stale BIS data and compares the latest rate with prior month end", () => {
		const csv =
			"FREQ,REF_AREA,TIME_PERIOD,OBS_VALUE\nD,ID,2026-10-31,5.75\nD,ID,2026-11-17,6\nD,ID,2026-11-18,6\nD,US,2026-11-18,4\nD,ID,2026-11-19,NaN";
		expect(parseBisPolicy(csv, "2026-11-18T12:00:00Z")).toEqual([
			{ date: "2026-10-31", value: 5.75 },
			{ date: "2026-11-18", value: 6 },
		]);
		expect(parseBisPolicy(csv, "2026-12-01T12:00:00Z")).toEqual([]);
	});
	it("uses fresh BIS data only when the BI page is unusable", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-11-18T12:00:00Z"));
		vi.stubGlobal(
			"fetch",
			vi.fn(async (url: string) => ({
				ok: true,
				text: async () =>
					url.includes("stats.bis.org")
						? "FREQ,REF_AREA,TIME_PERIOD,OBS_VALUE\nD,ID,2026-10-31,5.75\nD,ID,2026-11-18,6"
						: "<html>Missing chart</html>",
			})),
		);
		const result = await fetchIndonesiaMacro({ fresh: true });
		expect(result.BI_POLICY_RATE.provider).toBe("BIS");
		expect(result.ID_CPI_YOY).toBeUndefined();
	});
});

it("removes retired quote and macro mappings and preserves full crypto timestamps", () => {
	const quote = normalizeYahooMeta(
		{ regularMarketPrice: 100, regularMarketTime: 1795003200 },
		"BTC-USD",
	)!;
	expect(quote.lastTime).toBe(new Date(1795003200000).toISOString());
	expect(quoteIsCurrent("BTC", quote, "2026-11-18T12:30:00Z")).toBe(true);
	expect(quoteIsCurrent("BTC", quote, "2026-11-19T12:30:00Z")).toBe(false);
	expect(
		Object.keys(
			registeredQuotes({ BTC: quote, RETIRED: quote } as Record<
				string,
				MarketQuote
			>),
		),
	).toEqual(["BTC"]);
	const series = { data: [{ date: "2026-11-18", value: 6 }] } as MacroSeries;
	expect(
		Object.keys(
			registeredMacro({ BI_POLICY_RATE: series, IRLTLT01IDM156N: series }),
		),
	).toEqual(["BI_POLICY_RATE"]);
});
