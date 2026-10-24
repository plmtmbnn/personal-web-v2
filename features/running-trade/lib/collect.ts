import Papa from "papaparse";
import type { RunningTrade } from "../types";

export const CSV_COLUMNS = [
	"time",
	"action",
	"price",
	"change",
	"lot",
	"trade_number",
	"buyer_type",
	"seller_type",
	"market_board",
	"buy_order_number",
	"sell_order_number",
	"group_order_number",
	"amount",
] as const;

export const MAX_PAGES = 1000;
// The API rejected requests after ~53 back-to-back pages, so cool down before that point.
export const PAUSE_EVERY_PAGES = 25;
export const PAUSE_MS = 5_000;
export const MAX_RATE_LIMIT_RETRIES = 5;
const DEFAULT_RETRY_MS = 10_000;

export type StopReason = "empty" | "cap" | "cancelled" | "error" | "stalled";

export interface CollectResult {
	trades: RunningTrade[];
	pages: number;
	stopReason: StopReason;
	error?: string;
}

export class RateLimitError extends Error {
	constructor(
		message: string,
		readonly retryAfterMs?: number,
	) {
		super(message);
		this.name = "RateLimitError";
	}
}

interface CollectOptions {
	fetchPage: (tradeNumber?: string) => Promise<RunningTrade[]>;
	onProgress?: (pages: number, rows: number) => void;
	onWait?: (ms: number, reason: "pause" | "rate-limit") => void;
	signal?: AbortSignal;
	maxPages?: number;
	pauseEvery?: number;
	pauseMs?: number;
	maxRetries?: number;
	sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
}

const abortableSleep = (ms: number, signal?: AbortSignal) =>
	new Promise<void>((resolve) => {
		if (signal?.aborted) return resolve();
		const done = () => {
			clearTimeout(timer);
			signal?.removeEventListener("abort", done);
			resolve();
		};
		const timer = setTimeout(done, ms);
		signal?.addEventListener("abort", done);
	});

/** Follows the trade_number cursor until the API returns an empty page. Keeps partial rows on failure. */
export async function collectRunningTrades({
	fetchPage,
	onProgress,
	onWait,
	signal,
	maxPages = MAX_PAGES,
	pauseEvery = PAUSE_EVERY_PAGES,
	pauseMs = PAUSE_MS,
	maxRetries = MAX_RATE_LIMIT_RETRIES,
	sleep = abortableSleep,
}: CollectOptions): Promise<CollectResult> {
	const trades: RunningTrade[] = [];
	let pages = 0;
	let cursor: string | undefined;

	while (pages < maxPages) {
		if (signal?.aborted) return { trades, pages, stopReason: "cancelled" };

		if (pages > 0 && pages % pauseEvery === 0) {
			onWait?.(pauseMs, "pause");
			await sleep(pauseMs, signal);
			if (signal?.aborted) return { trades, pages, stopReason: "cancelled" };
		}

		let batch: RunningTrade[] | undefined;
		for (let attempt = 0; batch === undefined; attempt++) {
			try {
				batch = await fetchPage(cursor);
			} catch (e) {
				if (signal?.aborted) return { trades, pages, stopReason: "cancelled" };
				if (e instanceof RateLimitError && attempt < maxRetries) {
					const wait = e.retryAfterMs ?? DEFAULT_RETRY_MS * (attempt + 1);
					onWait?.(wait, "rate-limit");
					await sleep(wait, signal);
					continue;
				}
				return {
					trades,
					pages,
					stopReason: "error",
					error: e instanceof Error ? e.message : "Request failed",
				};
			}
		}

		if (batch.length === 0) return { trades, pages, stopReason: "empty" };

		trades.push(...batch);
		pages += 1;
		onProgress?.(pages, trades.length);

		const next = batch[batch.length - 1].trade_number;
		// A repeated cursor means the API ignores trade_number; looping again would never end.
		if (next === cursor) return { trades, pages, stopReason: "stalled" };
		cursor = next;
	}

	return { trades, pages, stopReason: "cap" };
}

export function buildCsv(trades: RunningTrade[]): string {
	const rows = trades.map((t) => ({
		time: t.time,
		action: t.action,
		price: t.price,
		change: t.change,
		lot: t.lot,
		trade_number: t.trade_number,
		buyer_type: t.buyer_type,
		seller_type: t.seller_type,
		market_board: t.market_board,
		buy_order_number: t.buy_order_number,
		sell_order_number: t.sell_order_number,
		group_order_number: t.group_order_number,
		amount: t.value?.raw ?? "",
	}));
	return Papa.unparse({ fields: [...CSV_COLUMNS], data: rows });
}
