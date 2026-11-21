import { setTimeout as pause } from "node:timers/promises";
import {
	dateOffset,
	fredDate,
	periodEnd,
	SERIES,
	SERIES_IDS,
	type Observation,
	type SeriesId,
} from "./series.ts";
import type { FredStore, ObservationPage } from "./store.ts";

const FRED_API_URL = "https://api.stlouisfed.org/fred/series/observations";
const FIRST_OBSERVATION = "2000-01-01";
const FIRST_VINTAGE = "1776-07-04";
const LAST_VINTAGE = "9999-12-31";
const PAGE_SIZE = 25_000;

function validDate(value: unknown): value is string {
	return (
		typeof value === "string" &&
		/^\d{4}-\d{2}-\d{2}$/.test(value) &&
		Number.isFinite(Date.parse(value)) &&
		new Date(value).toISOString().slice(0, 10) === value
	);
}

function parsePage(
	payload: string,
	id: SeriesId,
	start: string,
	cutoff: string,
	fetchedAt: string,
	offset: number,
) {
	const page = JSON.parse(payload) as {
		count?: number;
		offset?: number;
		observations?: unknown[];
	};
	if (
		!Number.isSafeInteger(page?.count) ||
		(page.count ?? 0) <= 0 ||
		page.offset !== offset ||
		!Array.isArray(page.observations) ||
		!page.observations.length ||
		page.observations.length > PAGE_SIZE ||
		offset + page.observations.length > (page.count ?? 0)
	) {
		throw new Error("Invalid or empty FRED page");
	}
	const rows = page.observations.map((item): Observation => {
		const row = item as {
			date?: unknown;
			realtime_start?: unknown;
			realtime_end?: unknown;
			value?: unknown;
		};
		if (
			!validDate(row?.date) ||
			row.date < FIRST_OBSERVATION ||
			!validDate(row.realtime_start) ||
			row.realtime_start < start ||
			row.realtime_start > cutoff ||
			!validDate(row.realtime_end) ||
			row.realtime_end < row.realtime_start
		) {
			throw new Error("Invalid FRED observation dates");
		}
		const frequency = SERIES[id].frequency;
		const date = new Date(row.date);
		if (
			(frequency === "Weekly"
				? date.getUTCDay() !== 5
				: date.getUTCDate() !== 1) ||
			(frequency === "Quarterly" && date.getUTCMonth() % 3 !== 0)
		)
			throw new Error("Unexpected FRED observation frequency");
		const value =
			typeof row.value === "string" &&
			row.value.trim() !== "" &&
			Number.isFinite(Number(row.value))
				? Number(row.value)
				: null;
		if (row.value !== "." && value == null)
			throw new Error("Invalid FRED observation value");
		if (value != null && periodEnd(id, row.date) > row.realtime_start)
			throw new Error("FRED vintage precedes the observation period end");
		return {
			date: row.date,
			vintageStart: row.realtime_start,
			vintageEnd: row.realtime_end,
			value,
			fetchedAt,
		};
	});
	return { count: page.count as number, rows };
}

export async function syncFred(
	store: FredStore,
	key: string,
	{
		fetchPage = fetch,
		sleep,
		now = new Date(),
		ids = SERIES_IDS as readonly SeriesId[],
		signal,
	}: {
		fetchPage?: typeof fetch;
		sleep?: (ms: number) => Promise<unknown>;
		now?: Date;
		ids?: readonly SeriesId[];
		signal?: AbortSignal;
	} = {},
) {
	if (!key.trim()) throw new Error("FRED_API_KEY is required");
	const wait = sleep ?? ((ms: number) => pause(ms, undefined, { signal }));
	const cutoff = fredDate(now);
	const attemptedAt = now.toISOString();
	const previous = new Map(
		(await store.status()).map((row) => [row.seriesId, row.cutoff]),
	);
	const results: { id: SeriesId; synced: boolean; error?: string }[] = [];
	async function request(url: URL) {
		for (let attempt = 0; attempt < 3; attempt++) {
			await wait(1000);
			let response: Response;
			try {
				response = await fetchPage(url, {
					signal: signal
						? AbortSignal.any([signal, AbortSignal.timeout(30_000)])
						: AbortSignal.timeout(30_000),
					cache: "no-store",
					redirect: "error",
				});
			} catch {
				signal?.throwIfAborted();
				if (attempt === 2) throw new Error("FRED request failed or timed out");
				await wait(1000 * 2 ** attempt);
				continue;
			}
			if (response.ok) {
				try {
					return await response.text();
				} catch {
					signal?.throwIfAborted();
					if (attempt === 2) throw new Error("FRED response timed out");
					await wait(1000 * 2 ** attempt);
					continue;
				}
			}
			if (attempt === 2 || (response.status !== 429 && response.status < 500))
				throw new Error(`FRED HTTP ${response.status}`);
			const retry = response.headers.get("Retry-After");
			const delay =
				retry && /^\d+$/.test(retry)
					? Number(retry) * 1000
					: Math.max(0, Date.parse(retry ?? "") - Date.now()) || 0;
			if (delay > 120_000)
				throw new Error(
					`FRED HTTP ${response.status}. Retry at the next scheduled sync.`,
				);
			await wait(Math.max(delay, 1000 * 2 ** attempt));
		}
		throw new Error("FRED retries exhausted");
	}

	for (const id of ids) {
		signal?.throwIfAborted();
		const checkpoint = previous.get(id);
		if (checkpoint && checkpoint > cutoff) continue;
		const start = checkpoint
			? dateOffset(checkpoint, { days: -1 })
			: FIRST_VINTAGE;
		const pages: ObservationPage[] = [];
		try {
			let count = 0;
			let offset = 0;
			do {
				const url = new URL(FRED_API_URL);
				url.search = new URLSearchParams({
					series_id: id,
					api_key: key,
					file_type: "json",
					realtime_start: start,
					realtime_end: LAST_VINTAGE,
					observation_start: FIRST_OBSERVATION,
					units: "lin",
					output_type: "1",
					sort_order: "asc",
					offset: String(offset),
					limit: String(PAGE_SIZE),
				}).toString();
				const payload = await request(url);
				const page = parsePage(
					payload,
					id,
					start,
					cutoff,
					new Date().toISOString(),
					offset,
				);
				if (offset && page.count !== count)
					throw new Error("FRED data changed during pagination");
				pages.push({ offset, payload, rows: page.rows });
				count = page.count;
				offset += page.rows.length;
			} while (offset < count);
			if (!pages.some((page) => page.rows.some((row) => row.value != null)))
				throw new Error("FRED returned no usable observations");
			signal?.throwIfAborted();
			await store.save(id, start, cutoff, attemptedAt, pages);
			results.push({ id, synced: true });
		} catch (error) {
			signal?.throwIfAborted();
			const message =
				error instanceof Error &&
				/^(FRED |Invalid |Unexpected )/.test(error.message)
					? error.message
					: "Could not validate or store FRED data";
			await store.fail(id, attemptedAt, message);
			results.push({ id, synced: false, error: message });
		}
	}
	return results;
}
