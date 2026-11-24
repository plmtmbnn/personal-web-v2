import type { IDXStock } from "../types";
import { roundToIdxTick } from "../utils";
import {
	type DailyBar,
	type ResearchSnapshot,
	seriesThrough,
	type SwingCandidate,
} from "./idx-research";
import { MIN_NET_RR, netTradeRisk } from "./paper-risk";

export const SWING_TURNOVER_SESSIONS = 20;
const MIN_MEDIAN_TURNOVER = 5_000_000_000;
const RESISTANCE_SESSIONS = 252;

export function swingTradability(row: IDXStock | undefined) {
	const remarks = row?.Remarks?.trim();
	if (!row || !remarks || !/^[A-Z0-9-]{30}$/.test(remarks)) return "unknown";
	// The IDX summary ends its special-notation flags with X for the Watchlist Board.
	if (remarks.endsWith("X")) return "blocked";
	const quantities = [
		row.Volume,
		row.Frequency,
		row.Bid,
		row.BidVolume,
		row.Offer,
		row.OfferVolume,
	];
	if (!quantities.every(Number.isFinite)) return "unknown";
	return quantities.every((quantity) => quantity > 0) ? "tradable" : "blocked";
}

export function regularTurnoverBySession(bars: DailyBar[]) {
	return new Map(
		bars.flatMap((bar) =>
			bar.provider === "idx" &&
			bar.adjustment === "observed" &&
			bar.turnover != null
				? [[bar.session, bar.turnover] as const]
				: [],
		),
	);
}

export function buildSwingScan(
	research: Pick<ResearchSnapshot, "session" | "results">,
	history: Record<string, DailyBar[]>,
	sessions: string[],
	stocks: ReadonlyMap<string, IDXStock>,
): NonNullable<ResearchSnapshot["swingScan"]> {
	const priorSessions = sessions
		.filter((date) => date < research.session)
		.slice(-SWING_TURNOVER_SESSIONS);
	const candidates: SwingCandidate[] = [];
	let missingEvidence = 0;
	for (const signal of Object.values(research.results)) {
		const { symbol, pivot, stop, close, breakoutVolume } = signal;
		if (
			signal.state !== "confirmed" ||
			!signal.trendLeader ||
			!pivot ||
			!stop ||
			!close ||
			(breakoutVolume ?? 0) < 1.5
		)
			continue;
		const row = stocks.get(symbol);
		const tradability = swingTradability(row);
		if (tradability === "blocked") continue;
		if (tradability === "unknown" || row?.Close !== close) {
			missingEvidence++;
			continue;
		}
		const bars = history[symbol] ?? [];
		const series = seriesThrough(
			bars,
			sessions,
			RESISTANCE_SESSIONS + 1,
			research.session,
		);
		const turnover = regularTurnoverBySession(bars);
		const turnoverValues = priorSessions.flatMap((day) =>
			turnover.has(day) ? [turnover.get(day)!] : [],
		);
		if (
			series.length < RESISTANCE_SESSIONS + 1 ||
			turnoverValues.length < SWING_TURNOVER_SESSIONS
		) {
			missingEvidence++;
			continue;
		}
		turnoverValues.sort((a, b) => a - b);
		const middle = SWING_TURNOVER_SESSIONS / 2;
		const medianTurnover =
			(turnoverValues[middle - 1] + turnoverValues[middle]) / 2;
		if (medianTurnover < MIN_MEDIAN_TURNOVER) continue;

		const resistance = series
			.slice(2, -2)
			.reduce<DailyBar | null>((nearest, bar, index) => {
				if (bar.high <= close || (nearest && nearest.high <= bar.high))
					return nearest;
				const neighbors = [
					series[index],
					series[index + 1],
					series[index + 3],
					series[index + 4],
				];
				return neighbors.every((other) => other.high < bar.high)
					? bar
					: nearest;
			}, null);
		if (!resistance) continue;
		const target = roundToIdxTick(Math.ceil(resistance.high) - 1);
		const entryLow = roundToIdxTick(Math.floor(pivot) + 1, "up");
		const netRAtClose = netTradeRisk(close, stop, target)?.ratio;
		if (close < entryLow || netRAtClose == null || netRAtClose < MIN_NET_RR)
			continue;

		let entryHigh = roundToIdxTick(Math.min(pivot * 1.05, target - 1));
		for (; entryHigh >= close; entryHigh = roundToIdxTick(entryHigh - 1)) {
			const netRAtCap = netTradeRisk(entryHigh, stop, target)?.ratio;
			if (netRAtCap == null || netRAtCap < MIN_NET_RR) continue;
			candidates.push({
				symbol,
				close,
				pivot,
				entryLow,
				entryHigh,
				stop,
				target,
				resistance: resistance.high,
				resistanceSession: resistance.session,
				breakoutVolume: breakoutVolume!,
				medianTurnover,
				netRAtClose,
				netRAtCap,
				chart: series
					.slice(-30)
					.map(({ session, close }) => ({ session, close })),
			});
			break;
		}
	}
	return {
		candidates: candidates
			.sort(
				(a, b) =>
					b.netRAtClose - a.netRAtClose ||
					b.medianTurnover - a.medianTurnover ||
					a.symbol.localeCompare(b.symbol),
			)
			.slice(0, 5),
		missingEvidence,
	};
}
