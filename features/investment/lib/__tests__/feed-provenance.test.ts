import { describe, expect, it } from "vitest";
import { applyMarketProvenance, currentMarketInputs } from "../provenance";
import { INSTRUMENTS } from "../../data/instruments";
import type { InvestmentCompassData } from "../../types";
import type { MarketQuote } from "@/services/market-data/types";

const now = "2026-11-18T12:00:00Z";
function fixture(): InvestmentCompassData {
	const quote = {
		last: 100,
		lastTime: now,
		source: "yahoo",
		origin: "live",
	} as MarketQuote;
	return {
		fetchedAt: now,
		sentiment: { crypto: null },
		sources: {},
		markets: {
			quotes: Object.fromEntries([
				...INSTRUMENTS.map(({ id }) => [id, quote]),
				["RETIRED", { ...quote, lastTime: "2026-10-01" }],
			]),
			macro: {},
			cryptoGlobal: null,
		},
	};
}

describe("Expected market evidence", () => {
	it("keeps September FRED monthly observations current on November 18 without changing their dates", () => {
		const data = fixture();
		for (const id of ["CPIAUCSL", "PCEPILFE", "M2SL"])
			data.markets.macro[id] = {
				id,
				name: id,
				frequency: "Daily",
				units: "Percent",
				origin: "live",
				retrievedAt: now,
				data: [{ date: "2026-09-01", value: 3 }],
			};
		applyMarketProvenance(data);
		for (const id of ["CPIAUCSL", "PCEPILFE", "M2SL"]) {
			expect(data.sources.fred.evidence?.[id]).toMatchObject({
				status: "current",
				asOf: "2026-09-01T00:00:00.000Z",
				periodEnd: "2026-09-30",
			});
			expect(currentMarketInputs(data).markets.macro[id].data[0].date).toBe(
				"2026-09-01",
			);
		}
	});
	it("still rejects expired monthly data and stale daily yields", () => {
		const data = fixture();
		data.markets.macro.CPIAUCSL = {
			id: "CPIAUCSL",
			name: "CPI",
			frequency: "Monthly",
			units: "Percent",
			retrievedAt: now,
			data: [{ date: "2026-07-01", value: 3 }],
		};
		data.markets.macro.DGS10 = {
			id: "DGS10",
			name: "10Y",
			frequency: "Daily",
			units: "Percent",
			data: [{ date: "2026-11-01", value: 4 }],
		};
		applyMarketProvenance(data);
		expect(data.sources.fred.evidence?.CPIAUCSL.status).toBe("stale");
		expect(data.sources.fred.evidence?.DGS10.status).toBe("stale");
		expect(data.sources.fred.evidence?.DGS10.periodEnd).toBeUndefined();
	});
	it("does not turn a future monthly observation into current evidence", () => {
		const data = fixture();
		data.markets.macro.CPIAUCSL = {
			id: "CPIAUCSL",
			name: "CPI",
			frequency: "Monthly",
			units: "Percent",
			data: [{ date: "2026-12-01", value: 3 }],
		};
		applyMarketProvenance(data);
		expect(data.sources.fred.evidence?.CPIAUCSL.status).toBe("invalid");
	});
	it("ignores retired quotes but counts missing registered instruments", () => {
		const data = fixture();
		applyMarketProvenance(data);
		expect(data.sources.quotes.status).toBe("current");
		expect(data.sources.quotes.evidence?.RETIRED).toBeUndefined();
		delete data.markets.quotes.BTC;
		applyMarketProvenance(data);
		expect(data.sources.quotes.status).toBe("partial");
		expect(data.sources.quotes.evidence?.BTC.status).toBe("missing");
	});
	it("distinguishes stale observations from an unavailable endpoint", () => {
		const data = fixture();
		data.markets.ihsgFlows = { asOf: "2026-11-17", origin: "cache" };
		applyMarketProvenance(data);
		expect(data.sources.idxFlows.status).toBe("stale");
		expect(data.sources.idxFlows.evidence?.session.reason).toContain(
			"2026-11-18",
		);
		expect(data.sources.defillama.status).toBe("unavailable");
		expect(currentMarketInputs(data).markets.ihsgFlows).toBeNull();
	});
	it("preserves monthly CPI periods and evaluates freshness at period end", () => {
		const data = fixture();
		data.markets.macro.ID_CPI_YOY = {
			id: "ID_CPI_YOY",
			name: "CPI YoY",
			frequency: "Monthly",
			units: "Percent",
			provider: "Bank Indonesia",
			observationPeriodEnd: "2026-09-30",
			data: [{ date: "2026-09-01", value: 3.28 }],
		};
		applyMarketProvenance(data);
		expect(data.sources.indonesiaMacro.evidence?.ID_CPI_YOY.status).toBe(
			"current",
		);
		expect(
			currentMarketInputs(data).markets.macro.ID_CPI_YOY.data[0].date,
		).toBe("2026-09-01");
	});
	it("records actual fetch failure reasons without counting missing FRED series as current", () => {
		const data = fixture();
		data.fetchFailures = { DGS10: "FRED HTTP 429" };
		applyMarketProvenance(data);
		expect(data.sources.fred.evidence?.DGS10.reason).toBe("FRED HTTP 429");
		expect(data.sources.fred.ok).toBe(false);
	});
});
