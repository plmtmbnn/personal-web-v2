import { z } from "zod";
import { roundToIdxTick } from "../utils";
import type { DailyBar, StockResearch, SwingCandidate } from "./idx-research";
import { modeledFill, netTradeRisk } from "./paper-risk";

export const SWING_REPLAY_SESSIONS = 10;

export const openingReplaySchema = z.discriminatedUnion("state", [
	z.object({ state: z.literal("passed") }),
	z.object({ state: z.literal("unverified") }),
	z.object({
		state: z.literal("filled"),
		date: z.iso.date(),
		exit: z.enum(["stop", "target", "mark"]),
		netR: z.number(),
	}),
]);
type OpeningReplay = z.infer<typeof openingReplaySchema>;

export function replaySwingOpening(
	signal: StockResearch,
	pick: SwingCandidate | undefined,
	bars: DailyBar[],
	session: string,
	followUp: string[],
): OpeningReplay {
	const unverified = { state: "unverified" } as const;
	const observed = new Map(
		bars
			.filter((bar) => bar.provider === "idx" && bar.adjustment === "observed")
			.map((bar) => [bar.session, bar]),
	);
	const origin = observed.get(session);
	const days = followUp.slice(0, SWING_REPLAY_SESSIONS);
	const first = observed.get(days[0]);
	const { pivot, stop } = signal;
	if (
		!origin ||
		origin.close !== signal.close ||
		!first ||
		!pivot ||
		!stop ||
		days.length < SWING_REPLAY_SESSIONS
	)
		return unverified;
	const locked = (bar: DailyBar) => bar.volume <= 0 || bar.high === bar.low;
	const entry = first.open;
	if (
		locked(first) ||
		entry <= stop ||
		entry > (pick?.entryHigh ?? pivot * 1.05) ||
		(pick && entry < pick.entryLow)
	) {
		return { state: "passed" };
	}
	const target =
		pick?.target ?? roundToIdxTick(entry + 3 * (entry - stop), "up");
	const risk = netTradeRisk(entry, stop, target);
	if (!risk || risk.loss <= 0 || risk.reward == null) return unverified;
	const settle = (
		bar: DailyBar,
		exit: "stop" | "target" | "mark",
		price: number,
	): OpeningReplay => ({
		state: "filled",
		date: bar.session,
		exit,
		netR: (modeledFill(price, "sell") - risk.outlay) / risk.loss,
	});
	let queuedStop = false;
	let last = origin;
	for (const day of days) {
		const bar = observed.get(day);
		if (
			!bar ||
			bar.discontinuity ||
			Math.abs(bar.close / last.close - 1) > 0.35001
		)
			return unverified;
		last = bar;
		if (locked(bar)) {
			queuedStop ||= bar.low <= stop;
			continue;
		}
		if (queuedStop || bar.open <= stop) return settle(bar, "stop", bar.open);
		if (bar.open >= target) return settle(bar, "target", target);
		if (bar.low <= stop) return settle(bar, "stop", stop);
		if (bar.high >= target) return settle(bar, "target", target);
	}
	return settle(last, "mark", last.close);
}

export function summarizeOpeningReplay(results: OpeningReplay[]) {
	const fills = results.filter((result) => result.state === "filled");
	const byExit = new Map<string, number>();
	for (const { date, netR } of fills)
		byExit.set(date, (byExit.get(date) ?? 0) + netR);
	let cumulativeR = 0;
	let peakR = 0;
	let maxDrawdownR = 0;
	for (const date of [...byExit.keys()].sort()) {
		cumulativeR += byExit.get(date) ?? 0;
		peakR = Math.max(peakR, cumulativeR);
		maxDrawdownR = Math.max(maxDrawdownR, peakR - cumulativeR);
	}
	const unverified = results.filter(
		(result) => result.state === "unverified",
	).length;
	const evaluated = results.length - unverified;
	return {
		evaluated,
		unverified,
		fills: fills.length,
		fillRate: evaluated ? fills.length / evaluated : null,
		meanNetR: fills.length ? cumulativeR / fills.length : null,
		maxDrawdownR: fills.length ? maxDrawdownR : null,
	};
}
