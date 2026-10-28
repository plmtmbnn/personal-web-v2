import Papa from "papaparse";
import {
	CSV_COLUMNS,
	type HistoricalTradeResponse,
	type HistoricalTradeResult,
} from "../types";

export const MAX_PAGES = 200;
export const PAUSE_EVERY_PAGES = 25;
export const PAUSE_MS = 3_000;
export const MAX_RATE_LIMIT_RETRIES = 5;
const DEFAULT_RETRY_MS = 5_000;

export type StopReason =
	| "complete"
	| "empty"
	| "cap"
	| "cancelled"
	| "error"
	| "stalled";

export interface CollectHistoricalResult {
	results: HistoricalTradeResult[];
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

export interface CollectHistoricalOptions {
	fetchPage: (page: number) => Promise<HistoricalTradeResponse>;
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

export async function collectHistoricalTrades({
	fetchPage,
	onProgress,
	onWait,
	signal,
	maxPages = MAX_PAGES,
	pauseEvery = PAUSE_EVERY_PAGES,
	pauseMs = PAUSE_MS,
	maxRetries = MAX_RATE_LIMIT_RETRIES,
	sleep = abortableSleep,
}: CollectHistoricalOptions): Promise<CollectHistoricalResult> {
	const results: HistoricalTradeResult[] = [];
	let pages = 0;
	let currentPage = 1;

	while (pages < maxPages) {
		if (signal?.aborted) {
			return { results, pages, stopReason: "cancelled" };
		}

		if (pages > 0 && pages % pauseEvery === 0) {
			onWait?.(pauseMs, "pause");
			await sleep(pauseMs, signal);
			if (signal?.aborted) {
				return { results, pages, stopReason: "cancelled" };
			}
		}

		let res: HistoricalTradeResponse | undefined;
		for (let attempt = 0; res === undefined; attempt++) {
			try {
				res = await fetchPage(currentPage);
			} catch (e) {
				if (signal?.aborted) {
					return { results, pages, stopReason: "cancelled" };
				}
				if (e instanceof RateLimitError && attempt < maxRetries) {
					const wait = e.retryAfterMs ?? DEFAULT_RETRY_MS * (attempt + 1);
					onWait?.(wait, "rate-limit");
					await sleep(wait, signal);
					continue;
				}
				return {
					results,
					pages,
					stopReason: "error",
					error: e instanceof Error ? e.message : "Request failed",
				};
			}
		}

		const batch = res?.data?.result ?? [];
		if (batch.length === 0) {
			return {
				results,
				pages,
				stopReason: results.length > 0 ? "complete" : "empty",
			};
		}

		results.push(...batch);
		pages += 1;
		onProgress?.(pages, results.length);

		const nextPageRaw = res?.data?.paginate?.next_page;
		if (
			!nextPageRaw ||
			nextPageRaw.trim() === "" ||
			nextPageRaw.trim() === "0"
		) {
			return { results, pages, stopReason: "complete" };
		}

		const nextPageNum = Number(nextPageRaw.trim());
		if (!Number.isFinite(nextPageNum) || nextPageNum <= 0) {
			return { results, pages, stopReason: "complete" };
		}

		if (nextPageNum === currentPage) {
			return { results, pages, stopReason: "stalled" };
		}

		currentPage = nextPageNum;
	}

	return { results, pages, stopReason: "cap" };
}

export function buildCsv(results: HistoricalTradeResult[]): string {
	// Sort chronologically ascending by date for financial analysis and backtesting engines
	const sorted = [...results].sort((a, b) => a.date.localeCompare(b.date));

	const rows = sorted.map((r) => ({
		date: r.date,
		close: r.close,
		change: r.change,
		value: r.value,
		volume: r.volume,
		frequency: r.frequency,
		foreign_buy: r.foreign_buy,
		foreign_sell: r.foreign_sell,
		net_foreign: r.net_foreign,
		open: r.open,
		high: r.high,
		low: r.low,
		average: r.average,
		change_percentage: r.change_percentage,
	}));

	return Papa.unparse({ fields: [...CSV_COLUMNS], data: rows });
}
