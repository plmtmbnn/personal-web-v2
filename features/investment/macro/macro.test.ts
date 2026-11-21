// @vitest-environment node
import { mkdtempSync, rmdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { assessMacro } from "./assessment";
import { syncFred } from "./fred-sync";
import { readMacroPanel } from "./read";
import {
	dateOffset,
	SERIES_IDS,
	type Observation,
	type Observations,
} from "./series";
import {
	openMacroStore,
	readObservations,
	saveSeries,
	sqliteFredStore,
	syncStatus,
} from "./store";

const asOf = "2026-11-21";
const fetchedAt = "2026-11-20T22:00:00Z";
const end = "9999-12-31";
const vintage = "2026-11-20";
const cleanup: (() => void)[] = [];
vi.mock("server-only", () => ({}));
afterEach(() => {
	for (const close of cleanup.splice(0)) close();
});

function rows(date: string, values: number[], period = 1): Observation[] {
	return values.map((value, i) => ({
		date: dateOffset(date, { months: -i * period }),
		value,
		vintageStart: vintage,
		vintageEnd: end,
		fetchedAt,
	}));
}

function evidence({
	weak = false,
	hot = false,
	flat = false,
	laborWeak = false,
} = {}): Observations {
	const prices = Array<number>(16).fill(100);
	prices[0] = hot ? 103 : 101;
	return {
		GDPC1: rows(
			"2026-07-01",
			weak ? [99, 100, 101] : flat ? [100, 100, 100] : [104, 101, 100],
			3,
		),
		INDPRO: rows(
			"2026-10-01",
			weak
				? [99, 0, 0, 100, 0, 0, 101]
				: flat
					? [100, 0, 0, 100, 0, 0, 100]
					: [104, 0, 0, 101, 0, 0, 100],
		),
		UNRATE: rows(
			"2026-10-01",
			laborWeak
				? [4.6, 4.6, 4.6, 4.1, 4.1, 4.1]
				: [4.1, 4.1, 4.1, 4.1, 4.1, 4.1],
		),
		PCEPILFE: rows("2026-09-01", prices),
		FEDFUNDS: rows("2026-10-01", [4, 4.25, 4.25, 4.5]),
		NFCI: [
			{
				date: "2026-11-13",
				value: -0.4,
				vintageStart: vintage,
				vintageEnd: end,
				fetchedAt,
			},
			{
				date: "2026-10-16",
				value: -0.5,
				vintageStart: vintage,
				vintageEnd: end,
				fetchedAt,
			},
		],
	};
}

describe("U.S. macro assessment", () => {
	it.each([
		[{}, "Expansion"],
		[{ weak: true }, "Contraction / recession risk"],
		[{ weak: true, hot: true }, "Stagflation risk"],
		[{ flat: true }, "Slowdown"],
	])("classifies %o as %s", (input, regime) => {
		expect(assessMacro(asOf, () => evidence(input)).regime).toBe(regime);
	});

	it("uses the previous vintage for recovery and keeps policy and conditions separate", () => {
		const result = assessMacro(asOf, (date) =>
			date === asOf ? evidence() : evidence({ weak: true }),
		);
		expect(result.regime).toBe("Recovery");
		expect(result.fedFundsChange).toBe(-0.5);
		expect(result.financialConditionsChange).toBeCloseTo(0.1);
		expect(result.gdp).toBeCloseTo(100 * (104 / 101 - 1));
	});

	it("includes the 0.5 point boundary and rejects stale and noncontiguous evidence", () => {
		expect(
			assessMacro(asOf, () => evidence({ laborWeak: true })).weakness,
		).toBe(1);
		const data = evidence();
		data.UNRATE?.splice(2, 1);
		expect(assessMacro(asOf, () => data).regime).toBe("Insufficient data");
		const stale = evidence();
		stale.PCEPILFE = rows("2026-06-01", Array<number>(16).fill(100));
		expect(assessMacro(asOf, () => stale).missing).toContain("PCEPILFE");
	});
});

describe("FRED vintage sync", () => {
	it("distinguishes an unsynced panel from a storage failure without creating a database", () => {
		const dir = mkdtempSync(join(tmpdir(), "macro-read-"));
		const invalid = join(dir, "invalid.sqlite");
		writeFileSync(invalid, "invalid SQLite file");
		cleanup.push(() => {
			unlinkSync(invalid);
			rmdirSync(dir);
		});
		expect(readMacroPanel(join(dir, "missing.sqlite"), asOf)).toEqual({
			state: "empty",
		});
		expect(readMacroPanel(invalid, asOf)).toEqual({ state: "error" });
	});
	it("keeps actual vintage boundaries when incremental responses clip an existing interval", () => {
		const db = openMacroStore(":memory:");
		cleanup.push(() => db.close());
		const first = {
			...rows("2026-07-01", [102], 3)[0],
			vintageStart: "2026-10-29",
		};
		const revision = { ...first, vintageStart: "2026-11-19", value: 105 };
		saveSeries(
			db,
			"GDPC1",
			"1776-07-04",
			"2026-11-18",
			"2026-11-18T12:00:00Z",
			[{ offset: 0, payload: "{}", rows: [first] }],
		);
		const page = {
			offset: 0,
			payload: "{}",
			rows: [
				{ ...first, vintageStart: "2026-11-17", vintageEnd: "2026-11-18" },
				revision,
			],
		};
		saveSeries(db, "GDPC1", "2026-11-17", "2026-11-20", fetchedAt, [page]);
		saveSeries(db, "GDPC1", "2026-11-17", "2026-11-20", fetchedAt, [page]);
		expect(readObservations(db, "2026-11-19").GDPC1?.[0]).toMatchObject({
			value: 102,
			vintageStart: "2026-10-29",
		});
		expect(readObservations(db, "2026-11-20").GDPC1?.[0].value).toBe(105);
		expect(
			db.prepare("SELECT count(*) AS count FROM observations").get()?.count,
		).toBe(2);
	});

	it("commits validated pages, retries on rate limits, and preserves an earlier series on a later failure", async () => {
		const db = openMacroStore(":memory:");
		cleanup.push(() => db.close());
		let outage = false;
		let limited = false;
		const wait = vi.fn(async () => {});
		const requests: string[] = [];
		const fetchPage = vi.fn(async (input: string | URL | Request) => {
			const url = input as URL;
			const id = url.searchParams.get("series_id");
			const offset = Number(url.searchParams.get("offset"));
			requests.push(`${id}/${offset}`);
			if (id === "GDPC1" && !limited) {
				limited = true;
				return new Response(null, {
					status: 429,
					headers: { "Retry-After": "5" },
				});
			}
			if (outage && id === "GDPC1" && offset)
				return new Response(null, { status: 503 });
			const date =
				id === "NFCI"
					? "2026-10-23"
					: id === "GDPC1"
						? "2026-07-01"
						: "2026-09-01";
			return Response.json({
				count: id === "GDPC1" ? 2 : 1,
				offset,
				observations: [
					{
						date,
						realtime_start: offset
							? "2026-11-19"
							: outage
								? "2026-11-19"
								: "2026-11-18",
						realtime_end:
							offset || outage || id !== "GDPC1" ? end : "2026-11-18",
						value: outage ? "102" : "101",
					},
				],
			});
		});
		const first = await syncFred(sqliteFredStore(db), "test-key", {
			fetchPage,
			sleep: wait,
			now: new Date(fetchedAt),
		});
		expect(first.map((row) => row.synced)).toEqual(SERIES_IDS.map(() => true));
		expect(requests.slice(0, 3)).toEqual(["GDPC1/0", "GDPC1/0", "GDPC1/1"]);
		expect(wait).toHaveBeenCalledWith(5000);
		outage = true;
		await syncFred(sqliteFredStore(db), "test-key", {
			fetchPage,
			sleep: wait,
			now: new Date("2026-11-21T22:00:00Z"),
		});
		const state = syncStatus(db).find((row) => row.seriesId === "GDPC1");
		expect(state).toMatchObject({
			cutoff: "2026-11-20",
			error: "FRED HTTP 503",
		});
		expect(readObservations(db, asOf).GDPC1?.[0].value).toBe(101);
	});
});
