import { z } from "zod";
import { modeledFill } from "./paper-risk";
import { getIdxPriceTick, roundToIdxTick } from "../utils";

export const IDX_RESEARCH_VERSION = "idx-vcp-1";
export const UPSTREAM_REVISION = "13079ab4456fada368f0f579643d2ef104efb8f0";

export const dailyBarSchema = z
	.object({
		symbol: z.string().regex(/^[A-Z0-9]{1,10}$/),
		session: z.iso.date(),
		provider: z.enum(["idx", "yahoo"]),
		adjustment: z.enum(["observed", "split_adjusted"]),
		open: z.number().positive(),
		high: z.number().positive(),
		low: z.number().positive(),
		close: z.number().positive(),
		volume: z.number().nonnegative(),
		turnover: z.number().nonnegative().nullable(),
		foreign_net: z.number().nullable(),
		discontinuity: z.boolean(),
		retrieved_at: z.iso.datetime({ offset: true }),
	})
	.refine(
		(b) =>
			b.low <= Math.min(b.open, b.close) && b.high >= Math.max(b.open, b.close),
	);
export type DailyBar = z.infer<typeof dailyBarSchema>;

const criterion = z.enum(["pass", "fail", "unavailable"]);
export const researchStates = z.enum([
	"unavailable",
	"no_setup",
	"developing",
	"confirmed",
	"extended",
	"damaged",
]);
export const stockResearchSchema = z.object({
	symbol: z.string(),
	sector: z.string(),
	state: researchStates,
	reason: z.string(),
	trendLeader: z.boolean(),
	sessions: z.number().int().nonnegative(),
	provider: dailyBarSchema.shape.provider.nullable(),
	adjustment: dailyBarSchema.shape.adjustment.nullable(),
	verifiedOverlap: z.boolean().default(false),
	retrievedAt: dailyBarSchema.shape.retrieved_at.nullable(),
	close: z.number().positive().nullable(),
	sma50: z.number().positive().nullable(),
	sma150: z.number().positive().nullable(),
	sma200: z.number().positive().nullable(),
	slope200Pct: z.number().nullable(),
	rangePositionPct: z.number().nullable(),
	relativeStrength: z.number().nullable(),
	percentile: z.number().nullable(),
	criteria: z.record(z.string(), criterion),
	contractions: z.array(z.number()),
	pivot: z.number().nullable(),
	stop: z.number().nullable(),
	volumeDryUp: z.number().nullable(),
	breakoutVolume: z.number().nullable(),
});
export type StockResearch = z.infer<typeof stockResearchSchema>;

export const breadthSchema = z.object({
	advancers: z.number().int().nonnegative(),
	decliners: z.number().int().nonnegative(),
	unchanged: z.number().int().nonnegative(),
	above50: z.number().int().nonnegative(),
	covered50: z.number().int().nonnegative(),
	above200: z.number().int().nonnegative(),
	covered200: z.number().int().nonnegative(),
	total: z.number().int().nonnegative(),
});
export const researchSnapshotSchema = z.object({
	session: z.iso.date(),
	version: z.literal(IDX_RESEARCH_VERSION),
	results: z.record(z.string(), stockResearchSchema),
	breadth: breadthSchema.extend({
		sectors: z.record(z.string(), breadthSchema),
	}),
});
export type ResearchSnapshot = z.infer<typeof researchSnapshotSchema>;
export type ResearchSummary = Pick<
	ResearchSnapshot,
	"session" | "version" | "breadth"
> & {
	current: boolean;
	signals: Record<
		string,
		Pick<StockResearch, "state" | "trendLeader" | "relativeStrength">
	>;
};

type BarsBySymbol = Record<string, DailyBar[]>;
export type ResearchInstrument = {
	symbol: string;
	sector: string;
	close: number;
	change: number;
	turnover: number;
};

const mean = (values: number[]) =>
	values.reduce((sum, value) => sum + value, 0) / values.length;
const pct = (to: number, from: number) => (to / from - 1) * 100;

export function seriesThrough(
	rows: DailyBar[],
	sessions: string[],
	minBars: number,
	asOf: string,
): DailyBar[] {
	const expected = sessions.filter((date) => date <= asOf).slice(-minBars);
	const walk = (byDate: Map<string, DailyBar>, allowJoin = false) => {
		const bars: DailyBar[] = [];
		for (const session of expected.toReversed()) {
			const item = byDate.get(session);
			if (!item || item.discontinuity || item.volume <= 0) break;
			const next = bars.at(-1);
			if (
				next &&
				((!allowJoin && item.adjustment !== next.adjustment) ||
					Math.abs(pct(next.close, item.close)) > 35.001)
			)
				break;
			bars.push(item);
		}
		return bars.reverse();
	};
	const byProvider = (provider: DailyBar["provider"]) =>
		new Map(
			rows
				.filter((row) => row.provider === provider && row.session <= asOf)
				.map((row) => [row.session, row]),
		);
	const idx = byProvider("idx");
	const yahoo = byProvider("yahoo");
	const series = [walk(idx), walk(yahoo)];
	const mostRecentYahoo = [...yahoo.values()].sort((a, b) =>
		b.session.localeCompare(a.session),
	)[0];
	const anchor = mostRecentYahoo && idx.get(mostRecentYahoo.session);
	if (
		anchor &&
		!anchor.discontinuity &&
		!mostRecentYahoo.discontinuity &&
		anchor.close === mostRecentYahoo.close &&
		anchor.volume > 0
	) {
		// shortcut: verify the seam against IDX close and exclude action-sized gaps until a corporate-action feed is available.
		const joined = new Map([
			...yahoo,
			...[...idx].filter(([date]) => date >= anchor.session),
		]);
		series.push(walk(joined, true));
	}
	return series.sort((a, b) => b.length - a.length)[0];
}

function contractionEvidence(bars: DailyBar[]) {
	const window = bars.slice(-121, -1);
	const contractions: {
		high: number;
		low: number;
		depth: number;
		start: number;
		end: number;
	}[] = [];
	let peak = 0;
	let trough = 0;
	for (let i = 1; i < window.length; i++) {
		if (window[i].low <= (window[trough]?.low ?? Infinity)) trough = i;
		const high = window[peak].high;
		const low = window[trough].low;
		const depth = (high - low) / high;
		if (
			trough > peak &&
			trough - peak >= 4 &&
			i > trough &&
			window[i].close >= low + (high - low) * 0.5
		) {
			contractions.push({ high, low, depth, start: peak, end: trough });
			peak = i;
			trough = i;
		} else if (window[i].high >= high && i !== trough) {
			peak = i;
			trough = i;
		}
	}
	const last = contractions.at(-1);
	const prior = contractions.at(-2);
	const today = bars.at(-1)!;
	const volume50 = mean(bars.slice(-51, -1).map((bar) => bar.volume));
	const volumeDryUp =
		mean(bars.slice(-11, -1).map((bar) => bar.volume)) / volume50;
	const breakoutVolume = today.volume / volume50;
	const valid =
		!!last &&
		!!prior &&
		prior.depth >= 0.1 &&
		last.depth > 0 &&
		last.depth <= Math.min(prior.depth * 0.7, 0.15) &&
		last.high <= prior.high &&
		window.length - last.end <= 40;
	const pivot = valid ? roundToIdxTick(last.high, "up") : null;
	const stop = valid
		? roundToIdxTick(last.low - getIdxPriceTick(last.low - 1))
		: null;
	const crossed =
		pivot != null && window.at(-1)!.close <= pivot && today.close > pivot;
	return {
		pivot,
		stop,
		crossed,
		volumeDryUp,
		breakoutVolume,
		contractions: contractions.slice(-4).map((c) => c.depth * 100),
	};
}

export function evaluateIdxResearch(
	universe: ResearchInstrument[],
	rows: BarsBySymbol,
	benchmark: Record<string, number>,
	session: string,
): ResearchSnapshot {
	const sessions = Object.keys(benchmark)
		.filter((date) => date <= session)
		.sort();
	const results: Record<string, StockResearch> = {};
	const participation = () => ({
		advancers: 0,
		decliners: 0,
		unchanged: 0,
		total: 0,
		above50: 0,
		covered50: 0,
		above200: 0,
		covered200: 0,
	});
	const breadth: ResearchSnapshot["breadth"] = {
		...participation(),
		sectors: {},
	};
	for (const stock of universe) {
		const bars = seriesThrough(
			rows[stock.symbol] ?? [],
			sessions,
			260,
			session,
		);
		const close = bars.at(-1)?.close ?? null;
		const sma = (n: number, end = bars.length) =>
			end >= n ? mean(bars.slice(end - n, end).map((b) => b.close)) : null;
		const sma50 = sma(50);
		const sma150 = sma(150);
		const sma200 = sma(200);
		const earlier200 = sma(200, bars.length - 22);
		const low52 =
			bars.length >= 252
				? Math.min(...bars.slice(-252).map((b) => b.low))
				: null;
		const high52 =
			bars.length >= 252
				? Math.max(...bars.slice(-252).map((b) => b.high))
				: null;
		const rankBase = bars.at(-64);
		const latest = bars.at(-1);
		const comparable =
			close != null &&
			Math.abs(close - stock.close) <= getIdxPriceTick(stock.close);
		const relativeStrength =
			latest && rankBase && comparable
				? pct(latest.close, rankBase.close) -
					pct(benchmark[session], benchmark[rankBase.session])
				: null;
		const sector = stock.sector;
		const groups: ReturnType<typeof participation>[] = [breadth];
		if (sector !== "Unknown" && sector !== "Unclassified") {
			breadth.sectors[sector] ??= participation();
			groups.push(breadth.sectors[sector]);
		}
		for (const group of groups) {
			group.total++;
			if (stock.change > 0) group.advancers++;
			else if (stock.change < 0) group.decliners++;
			else group.unchanged++;
			if (comparable && sma50 != null) {
				group.covered50++;
				if (close! > sma50) group.above50++;
			}
			if (comparable && sma200 != null) {
				group.covered200++;
				if (close! > sma200) group.above200++;
			}
		}
		const hasHistory =
			sessions.at(-1) === session && bars.length >= 260 && comparable;
		const slope200Pct =
			sma200 != null && earlier200 != null ? pct(sma200, earlier200) : null;
		const rangePositionPct =
			high52 != null && low52 != null && close != null && high52 > low52
				? (100 * (close - low52)) / (high52 - low52)
				: null;
		const criteria: StockResearch["criteria"] = {
			history: hasHistory ? "pass" : "unavailable",
			liquidity: stock.turnover >= 1e9 ? "pass" : "fail",
		};
		const test = (key: string, pass: boolean) => {
			criteria[key] = hasHistory ? (pass ? "pass" : "fail") : "unavailable";
		};
		test("above150And200", close! > sma150! && close! > sma200!);
		test("sma150Above200", sma150! > sma200!);
		test("sma200Rising", slope200Pct! > 0);
		test("aboveSma50", close! > sma50!);
		test("distanceFromLow", close! >= low52! * 1.25);
		test("distanceFromHigh", close! >= high52! * 0.75);
		const pattern = hasHistory ? contractionEvidence(bars) : null;
		results[stock.symbol] = {
			symbol: stock.symbol,
			sector,
			sessions: bars.length,
			provider: latest?.provider ?? null,
			adjustment: latest?.adjustment ?? null,
			retrievedAt: latest?.retrieved_at ?? null,
			verifiedOverlap: bars.some((bar) => bar.provider !== latest?.provider),
			close: comparable ? close : null,
			sma50,
			sma150,
			sma200,
			slope200Pct,
			rangePositionPct,
			relativeStrength,
			percentile: null,
			criteria,
			trendLeader: false,
			state: "unavailable",
			reason:
				!comparable && bars.length
					? "History does not match the observed IDX close."
					: "A continuous window of 260 completed sessions is required.",
			contractions: pattern?.contractions ?? [],
			pivot: pattern?.pivot ?? null,
			stop: pattern?.stop ?? null,
			volumeDryUp: pattern?.volumeDryUp ?? null,
			breakoutVolume: pattern?.breakoutVolume ?? null,
		};
		if (pattern) criteria.pivotCross = pattern.crossed ? "pass" : "fail";
	}

	const eligible = Object.values(results).filter(
		(item) =>
			item.relativeStrength != null && item.criteria.liquidity === "pass",
	);
	for (const item of Object.values(results)) {
		if (
			item.relativeStrength != null &&
			item.criteria.liquidity === "pass" &&
			eligible.length > 1
		) {
			const below = eligible.filter(
				(other) => other.relativeStrength! < item.relativeStrength!,
			).length;
			const ties = eligible.filter(
				(other) => other.relativeStrength === item.relativeStrength,
			).length;
			item.percentile =
				(100 * (below + (ties - 1) / 2)) / (eligible.length - 1);
		}
		item.criteria.relativeStrength =
			item.percentile == null
				? "unavailable"
				: item.percentile > 70
					? "pass"
					: "fail";
		if (item.criteria.history !== "pass") continue;
		const trendChecks = [
			"above150And200",
			"sma150Above200",
			"sma200Rising",
			"aboveSma50",
			"distanceFromLow",
			"distanceFromHigh",
			"relativeStrength",
		];
		item.trendLeader =
			item.criteria.liquidity === "pass" &&
			item.percentile != null &&
			trendChecks.filter((key) => item.criteria[key] === "pass").length >= 6;
		item.criteria.contraction = item.pivot == null ? "fail" : "pass";
		item.criteria.volumeDryUp =
			item.volumeDryUp != null && item.volumeDryUp <= 0.7 ? "pass" : "fail";
		item.criteria.breakoutVolume =
			item.breakoutVolume != null && item.breakoutVolume >= 1.5
				? "pass"
				: "fail";
		if (!item.trendLeader || item.pivot == null || item.stop == null) {
			item.state = "no_setup";
			item.reason = "The trend, liquidity, or contraction check did not pass.";
		} else if (item.close! <= item.stop) {
			item.state = "damaged";
			item.reason = "The close breached the contraction low.";
		} else if (item.close! > item.pivot * 1.05) {
			item.state = "extended";
			item.reason = "The close is more than 5% above the pivot.";
		} else if (
			item.criteria.pivotCross === "pass" &&
			item.criteria.breakoutVolume === "pass"
		) {
			item.state = "confirmed";
			item.reason =
				"The completed session crossed the pivot on at least 1.5 times average volume.";
		} else {
			item.state = "developing";
			item.reason =
				"The base meets the contraction check. Await a confirmed breakout.";
		}
	}
	return { session, version: IDX_RESEARCH_VERSION, results, breadth };
}

export function researchOutcome(
	signal: StockResearch,
	series: DailyBar[],
	session: string,
	followUp: string[],
) {
	const observed = series.filter(
		(bar) => bar.provider === "idx" && bar.adjustment === "observed",
	);
	const matching = observed.some(
		(bar) => bar.session === session && bar.close === signal.close,
	)
		? observed
		: series.filter(
				(bar) =>
					bar.provider === signal.provider &&
					bar.adjustment === signal.adjustment,
			);
	const origin = matching.find(
		(bar) => bar.session === session && bar.close === signal.close,
	);
	const byDate = new Map(matching.map((bar) => [bar.session, bar]));
	const after = followUp.slice(0, 20).map((date) => byDate.get(date));
	const valid = (count: number) =>
		!!origin &&
		after.length >= count &&
		after
			.slice(0, count)
			.every(
				(bar, i) =>
					bar &&
					bar.volume > 0 &&
					!bar.discontinuity &&
					Math.abs(pct(bar.close, i ? after[i - 1]!.close : origin.close)) <=
						35.001 &&
					(bar.open !== bar.high ||
						bar.open !== bar.low ||
						Math.abs(pct(bar.close, i ? after[i - 1]!.close : origin.close)) <
							19.9),
			);
	const forward5 = valid(5) ? pct(after[4]!.close, origin!.close) : null;
	const forward20 = valid(20) ? pct(after[19]!.close, origin!.close) : null;
	const entry = after[0]?.open;
	const stop = signal.stop;
	const pivot = signal.pivot;
	if (
		!valid(20) ||
		!entry ||
		!stop ||
		!pivot ||
		entry <= stop ||
		entry > pivot * 1.05
	) {
		return { forward5, forward20, replayNetR: null, replayExit: null };
	}
	const target = roundToIdxTick(entry + 3 * (entry - stop), "up");
	const cost = modeledFill(entry, "buy");
	const risk = cost - modeledFill(stop, "sell");
	for (const bar of after) {
		if (bar!.low <= stop)
			return {
				forward5,
				forward20,
				replayNetR:
					(modeledFill(Math.min(bar!.open, stop), "sell") - cost) / risk,
				replayExit: "stop",
			};
		if (bar!.high >= target)
			return {
				forward5,
				forward20,
				replayNetR: (modeledFill(target, "sell") - cost) / risk,
				replayExit: "target",
			};
	}
	return {
		forward5,
		forward20,
		replayNetR: (modeledFill(after[19]!.close, "sell") - cost) / risk,
		replayExit: "time",
	};
}
