import { describe, expect, it } from "vitest";
import { nextIdxSession } from "@/services/market-data/provenance";
import type { IDXStock } from "../types";
import type { DailyBar, StockResearch } from "../utils/idx-research";
import { netTradeRisk } from "../utils/paper-risk";
import {
	replaySwingOpening,
	summarizeOpeningReplay,
} from "../utils/swing-replay";
import { buildSwingScan } from "../utils/swing-scanner";

const dates = Array.from({ length: 263 }, (_, index) =>
	new Date(Date.UTC(2026, 0, index + 1)).toISOString().slice(0, 10),
);
const session = dates[252];
const sessions = dates.slice(0, 253);
const signal = {
	symbol: "TEST",
	state: "confirmed",
	trendLeader: true,
	close: 1010,
	pivot: 1000,
	stop: 980,
	breakoutVolume: 1.8,
} as StockResearch;
const stock = {
	StockCode: "TEST",
	Close: 1010,
	Remarks: "--MO1SD2F70300A121------------",
	Volume: 6_000_000,
	Frequency: 500,
	Bid: 1010,
	BidVolume: 2000,
	Offer: 1015,
	OfferVolume: 2000,
} as IDXStock;
const bar = (day: string, overrides: Partial<DailyBar> = {}): DailyBar => ({
	symbol: "TEST",
	session: day,
	provider: "idx",
	adjustment: "observed",
	open: 1000,
	high: 1010,
	low: 990,
	close: 1000,
	volume: 6_000_000,
	turnover: 6_000_000_000,
	foreign_net: null,
	discontinuity: false,
	retrieved_at: `${day}T12:00:00.000Z`,
	...overrides,
});
const history = sessions.map((day, index) =>
	bar(
		day,
		index === 120 ? { high: 1155 } : day === session ? { close: 1010 } : {},
	),
);

function scan(rows = history, row = stock, item = signal) {
	return buildSwingScan(
		{ session, results: { TEST: item } },
		{ TEST: rows },
		sessions,
		new Map([["TEST", row]]),
	);
}

describe("IDX opening shortlist", () => {
	it("requires an independent resistance target and the highest tick with at least 2R net", () => {
		const { candidates, missingEvidence } = scan();
		expect(missingEvidence).toBe(0);
		expect(candidates).toHaveLength(1);
		const [pick] = candidates;
		expect(pick).toMatchObject({
			entryLow: 1005,
			entryHigh: 1020,
			stop: 980,
			target: 1150,
			resistanceSession: dates[120],
		});
		expect(pick.netRAtCap).toBeGreaterThanOrEqual(2);
		expect(netTradeRisk(1025, pick.stop, pick.target)?.ratio).toBeLessThan(2);
	});

	it("uses the nearest confirmed high and skips a high with fewer than two following closes", () => {
		const rows = history.map((row, i) =>
			i === 150
				? { ...row, high: 1125 }
				: i === 251
					? { ...row, high: 1040 }
					: row,
		);
		expect(scan(rows).candidates[0]?.target).toBe(1120);
		expect(
			scan(history.map((row) => ({ ...row, high: Math.min(row.high, 1010) })))
				.candidates,
		).toEqual([]);
	});

	it("requires all twenty prior regular-market turnover observations", () => {
		const missing = history.map((row, i) =>
			i === 240
				? {
						...row,
						provider: "yahoo" as const,
						adjustment: "split_adjusted" as const,
					}
				: row,
		);
		expect(scan(missing)).toEqual({ candidates: [], missingEvidence: 1 });
		const thin = history.map((row) => ({
			...row,
			turnover: row.session === session ? 100e9 : 4.9e9,
		}));
		expect(scan(thin)).toEqual({ candidates: [], missingEvidence: 0 });
	});

	it("excludes Watchlist Board names, halted shares, and missing quotes", () => {
		expect(
			scan(history, { ...stock, Remarks: `${stock.Remarks.slice(0, -1)}X` })
				.candidates,
		).toEqual([]);
		expect(
			scan(history, { ...stock, Volume: 0, Frequency: 0 }).candidates,
		).toEqual([]);
		expect(
			scan(history, { ...stock, Offer: 0, OfferVolume: 0 }).candidates,
		).toEqual([]);
		expect(scan(history, { ...stock, Remarks: "" }).missingEvidence).toBe(1);
	});

	it("caps the ranked shortlist at five and uses liquidity to break reward ties", () => {
		const names = ["A", "B", "C", "D", "E", "F"];
		const results = Object.fromEntries(
			names.map((symbol) => [symbol, { ...signal, symbol }]),
		);
		const histories = Object.fromEntries(
			names.map((symbol, i) => [
				symbol,
				history.map((row) => ({ ...row, symbol, turnover: 5e9 + i })),
			]),
		);
		const equity = new Map(
			names.map((symbol) => [symbol, { ...stock, StockCode: symbol }]),
		);
		expect(
			buildSwingScan(
				{ session, results },
				histories,
				sessions,
				equity,
			).candidates.map(({ symbol }) => symbol),
		).toEqual(["F", "E", "D", "C", "B"]);
	});

	it("finds the opening session after published holidays and the weekend", () => {
		expect(nextIdxSession("2026-12-23")).toBe("2026-12-28");
	});
});

describe("IDX opening replay", () => {
	const next = dates.slice(-10);
	const follow = next.map((day) =>
		bar(day, { open: 1010, high: 1020, close: 1015 }),
	);
	const [pick] = scan().candidates;
	const replay = (future: DailyBar[]) =>
		replaySwingOpening(signal, pick, [...history, ...future], session, next);

	it("passes an opening gap, and treats missing follow-up prices as unverified", () => {
		expect(
			replay([{ ...follow[0], open: 1030, high: 1050 }, ...follow.slice(1)]),
		).toEqual({ state: "passed" });
		expect(replay([{ ...follow[0], open: 995 }, ...follow.slice(1)])).toEqual({
			state: "passed",
		});
		expect(replay(follow.slice(1))).toEqual({ state: "unverified" });
	});

	it("counts the stop first if the daily range reaches both exits in an unknown order", () => {
		const outcome = replay([
			{ ...follow[0], low: 975, high: 1160 },
			...follow.slice(1),
		]);
		expect(outcome).toEqual({
			state: "filled",
			date: next[0],
			exit: "stop",
			netR: -1,
		});
	});

	it("queues a stop through a locked session and marks trades still open on day ten", () => {
		const locked = bar(next[1], { open: 955, low: 955, high: 955, close: 955 });
		const unlocked = bar(next[2], {
			open: 960,
			low: 955,
			high: 985,
			close: 975,
		});
		const outcome = replay([follow[0], locked, unlocked, ...follow.slice(3)]);
		expect(outcome).toMatchObject({
			state: "filled",
			date: next[2],
			exit: "stop",
		});
		if (outcome.state === "filled") expect(outcome.netR).toBeLessThan(-1);
		const marked = replay(follow);
		expect(marked).toMatchObject({
			state: "filled",
			date: next[9],
			exit: "mark",
		});
		expect(
			summarizeOpeningReplay([
				outcome,
				marked,
				{ state: "passed" },
				{ state: "unverified" },
			]),
		).toMatchObject({ evaluated: 3, unverified: 1, fills: 2, fillRate: 2 / 3 });
	});
});
