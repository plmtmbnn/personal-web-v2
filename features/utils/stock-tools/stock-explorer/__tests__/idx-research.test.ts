import { describe, expect, it } from "vitest";
import {
	evaluateIdxResearch,
	researchOutcome,
	seriesThrough,
	type DailyBar,
	type StockResearch,
} from "../utils/idx-research";

const sessions = Array.from({ length: 410 }, (_, i) =>
	new Date(Date.UTC(2025, 0, i + 1)).toISOString().slice(0, 10),
).filter((date) => ![0, 6].includes(new Date(date).getUTCDay()));
const row = (
	session: string,
	close = 1000,
	provider: DailyBar["provider"] = "idx",
): DailyBar => ({
	session,
	close,
	symbol: "BBCA",
	provider,
	adjustment: provider === "idx" ? "observed" : "split_adjusted",
	open: close,
	low: close - 5,
	high: close + 5,
	volume: 100,
	turnover: null,
	foreign_net: null,
	discontinuity: false,
	retrieved_at: "2026-11-13T12:00:00Z",
});

describe("IDX research history", () => {
	it("requires a tightening base and breakout volume to confirm a VCP", () => {
		const dates = sessions.slice(0, 260);
		const base = [
			1000, 980, 960, 925, 890, 885, 895, 945, 970, 960, 950, 940, 927, 920,
			930, 955, 955, 965, 990,
		];
		const rising = dates.map((date, i) =>
			row(
				date,
				i < 260 - base.length ? 300 + i * 2.6 : base[i - (260 - base.length)],
			),
		);
		rising[259].volume = 200;
		const universe = [
			{
				symbol: "BBCA",
				sector: "Banking",
				close: 990,
				change: 25,
				turnover: 2e9,
			},
			{
				symbol: "BBRI",
				sector: "Banking",
				close: 1000,
				change: 0,
				turnover: 2e9,
			},
		];
		const benchmark = Object.fromEntries(dates.map((date) => [date, 1000]));
		const run = () =>
			evaluateIdxResearch(
				universe,
				{ BBCA: rising, BBRI: dates.map((date) => row(date)) },
				benchmark,
				dates[259],
			).results.BBCA;
		expect(run()).toMatchObject({
			state: "confirmed",
			pivot: 975,
			breakoutVolume: 2,
		});
		rising[259].volume = 149;
		expect(run()).toMatchObject({ state: "developing" });
	});

	it("requires consecutive benchmark sessions and never uses future candles", () => {
		const bars = sessions.map((date) => row(date));
		const through = sessions[259];
		expect(seriesThrough(bars, sessions, 260, through)).toHaveLength(260);
		expect(
			seriesThrough(
				bars.filter((bar) => bar.session !== sessions[258]),
				sessions,
				260,
				through,
			),
		).toHaveLength(1);
		bars[258].discontinuity = true;
		expect(seriesThrough(bars, sessions, 260, through)).toHaveLength(1);
	});

	it("joins the later IDX tail only at a verified matching close", () => {
		const [day1, day2, day3] = sessions;
		const bars = [
			row(day1, 995, "yahoo"),
			row(day2, 1000, "yahoo"),
			row(day2),
			row(day3, 1010),
		];
		expect(
			seriesThrough(bars, sessions, 3, day3).map((bar) => bar.close),
		).toEqual([995, 1000, 1010]);
		bars[1].close = 999;
		expect(
			seriesThrough(bars, sessions, 3, day3).map((bar) => bar.close),
		).toEqual([1000, 1010]);
	});

	it("separates breadth coverage from universe size and ranks matched returns", () => {
		const dates = sessions.slice(0, 260);
		const rising = dates.map((date, i) => row(date, 800 + i * 2));
		const flat = dates.map((date) => row(date));
		const result = evaluateIdxResearch(
			[
				{
					symbol: "BBCA",
					sector: "Banking",
					close: rising.at(-1)!.close,
					change: 2,
					turnover: 2e9,
				},
				{
					symbol: "BBRI",
					sector: "Banking",
					close: 1000,
					change: 0,
					turnover: 2e9,
				},
				{
					symbol: "TLKM",
					sector: "Infrastructure",
					close: 1000,
					change: -1,
					turnover: 2e9,
				},
			],
			{ BBCA: rising, BBRI: flat },
			Object.fromEntries(dates.map((date) => [date, 1000])),
			dates.at(-1)!,
		);
		expect(result.breadth).toMatchObject({
			total: 3,
			advancers: 1,
			decliners: 1,
			covered50: 2,
			above200: 1,
		});
		expect(result.results.BBCA.percentile).toBe(100);
		expect(result.results.TLKM.state).toBe("unavailable");
	});

	it("preserves missing outcomes and uses the stop when both levels touch", () => {
		const dates = sessions.slice(0, 21);
		const bars = dates.map((date) => row(date));
		bars[1] = { ...bars[1], low: 900, high: 1200 };
		const signal = {
			provider: "idx",
			adjustment: "observed",
			close: 1000,
			pivot: 1000,
			stop: 950,
		} as StockResearch;
		expect(
			researchOutcome(signal, bars, dates[0], dates.slice(1)),
		).toMatchObject({ forward5: 0, forward20: 0, replayExit: "stop" });
		expect(
			researchOutcome(
				signal,
				bars.filter((_, i) => i !== 3),
				dates[0],
				dates.slice(1),
			),
		).toMatchObject({ forward5: null, forward20: null, replayNetR: null });
	});
});
