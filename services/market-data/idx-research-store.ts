import { redis, getStockDataSnapshot } from "@/lib/core/redis";
import { createAdminClient } from "@/lib/core/supabase-server";
import { getIdxSector } from "@/features/utils/stock-tools/stock-explorer/data/mockData";
import {
	dailyBarSchema,
	evaluateIdxResearch,
	IDX_RESEARCH_VERSION,
	researchOutcome,
	researchSnapshotSchema,
	type DailyBar,
	type ResearchSnapshot,
} from "@/features/utils/stock-tools/stock-explorer/utils/idx-research";
import { getOrFetchHistory } from "./history";
import { BROWSER_USER_AGENT } from "./http";
import { completedIdxSession, idxEvidence, jakartaDate } from "./provenance";
import { calculateNetFlow } from "./idx-flows";
import { z } from "zod";

const researchKey = `idx:research:${IDX_RESEARCH_VERSION}:latest`;
const progressKey = "idx:research:backfill";
const outcomesKey = `idx:research:${IDX_RESEARCH_VERSION}:outcomes`;
export const idxResearchStatusKey = "idx:research:status";
const batchLock = "idx:research:lock";
const symbolPattern = /^[A-Z0-9]{1,10}$/;

type Client = Awaited<ReturnType<typeof createAdminClient>>;

export async function readIdxResearch(): Promise<ResearchSnapshot | null> {
	const parsed = researchSnapshotSchema.safeParse(await redis.get(researchKey));
	return parsed.success ? parsed.data : null;
}

const outcomeSchema = z.object({
	symbol: z.string().regex(symbolPattern),
	session: z.iso.date(),
	observedSessions: z.number().int().min(5).max(20),
	forward5: z.number().nullable(),
	forward20: z.number().nullable(),
	replayNetR: z.number().nullable(),
	replayExit: z.enum(["stop", "target", "time"]).nullable(),
});

export async function readIdxOutcomes() {
	return (
		z.array(outcomeSchema).safeParse(await redis.get(outcomesKey)).data ?? []
	);
}

async function yahooBars(
	symbol: string,
	retrievedAt: string,
): Promise<DailyBar[]> {
	const response = await fetch(
		`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.JK?range=3y&interval=1d&events=splits`,
		{
			cache: "no-store",
			headers: { "User-Agent": BROWSER_USER_AGENT },
			signal: AbortSignal.timeout(8000),
		},
	);
	if (!response.ok) throw new Error(`Yahoo history HTTP ${response.status}`);
	const result = (await response.json())?.chart?.result?.[0];
	const quote = result?.indicators?.quote?.[0];
	if (!Array.isArray(result?.timestamp) || !quote)
		throw new Error("Yahoo OHLCV is unavailable");
	const splits = new Set(
		Object.values(result.events?.splits ?? {}).flatMap((value) => {
			const date = (value as { date?: number } | null)?.date;
			return typeof date === "number" && Number.isFinite(date)
				? [jakartaDate(date * 1000)]
				: [];
		}),
	);
	const bars = new Map<string, DailyBar>();
	for (const [index, time] of result.timestamp.entries()) {
		if (typeof time !== "number" || !Number.isFinite(time)) continue;
		const session = completedIdxSession(jakartaDate(time * 1000), retrievedAt);
		if (!session) continue;
		const parsed = dailyBarSchema.safeParse({
			symbol,
			session,
			provider: "yahoo",
			adjustment: "split_adjusted",
			open: quote.open?.[index],
			high: quote.high?.[index],
			low: quote.low?.[index],
			close: quote.close?.[index],
			volume: quote.volume?.[index],
			turnover: null,
			foreign_net: null,
			discontinuity: splits.has(session),
			retrieved_at: retrievedAt,
		});
		if (parsed.success) bars.set(session, parsed.data);
	}
	if (!bars.size) throw new Error("No usable Yahoo bars");
	return [...bars.values()]
		.sort((a, b) => a.session.localeCompare(b.session))
		.slice(-520);
}

async function saveBars(db: Client, bars: DailyBar[]) {
	if (!bars.length) return;
	const { error } = await db
		.from("idx_daily_bars")
		.upsert(bars, { onConflict: "symbol,provider,session" });
	if (error) throw error;
}

async function readBars(db: Client, symbols: string[], session: string) {
	const groups = Array.from(
		{ length: Math.ceil(symbols.length / 20) },
		(_, i) => symbols.slice(i * 20, i * 20 + 20),
	);
	const grouped: Record<string, DailyBar[]> = {};
	for (let i = 0; i < groups.length; i += 4) {
		await Promise.all(
			groups.slice(i, i + 4).map(async (group) => {
				const { data, error } = await db.rpc("idx_research_bars", {
					symbols: group,
					through_session: session,
				});
				if (error) throw error;
				for (const entry of data as { symbol: string; bars: unknown[] }[]) {
					grouped[entry.symbol] = entry.bars.flatMap((bar) => {
						const parsed = dailyBarSchema.safeParse(bar);
						return parsed.success ? [parsed.data] : [];
					});
				}
			}),
		);
	}
	return grouped;
}

async function recordOutcomes(
	db: Client,
	history: Record<string, DailyBar[]>,
	sessions: string[],
	today: string,
) {
	const oldest = sessions.at(-26) ?? sessions[0];
	if (!oldest) return;
	// Pending snapshots get a second pass at the twenty-session horizon.
	const { data, error } = await db
		.from("market_research_snapshots")
		.select("session,evidence,outcomes")
		.eq("version", IDX_RESEARCH_VERSION)
		.gte("session", oldest)
		.lt("session", today);
	if (error) throw error;
	const recent: z.infer<typeof outcomeSchema>[] = [];
	for (const row of data ?? []) {
		const snapshot = researchSnapshotSchema.safeParse(row.evidence);
		if (!snapshot.success) continue;
		const next = sessions.filter((date) => date > row.session).slice(0, 20);
		if (next.length < 5) continue;
		const prior = z.array(outcomeSchema).safeParse(row.outcomes).data;
		if (prior?.length && prior[0].observedSessions === next.length) {
			recent.push(...prior);
			continue;
		}
		const outcomes = Object.entries(snapshot.data.results)
			.filter(([, item]) => item.state === "confirmed")
			.map(([symbol, item]) => ({
				symbol,
				session: row.session,
				observedSessions: next.length,
				...researchOutcome(item, history[symbol] ?? [], row.session, next),
			}));
		recent.push(...z.array(outcomeSchema).parse(outcomes));
		const write = await db
			.from("market_research_snapshots")
			.update({ outcomes })
			.eq("version", IDX_RESEARCH_VERSION)
			.eq("session", row.session);
		if (write.error) throw write.error;
	}
	await redis.set(outcomesKey, recent);
}

export async function runIdxResearch() {
	const token = crypto.randomUUID();
	if (!(await redis.set(batchLock, token, { nx: true, ex: 240 })))
		return { state: "busy" };
	const now = new Date().toISOString();
	try {
		const snapshot = await getStockDataSnapshot();
		const session = completedIdxSession(snapshot?.data[0]?.Date, now);
		if (
			!snapshot ||
			!session ||
			snapshot.origin === "unknown" ||
			idxEvidence(session, now, snapshot.origin).status !== "current"
		) {
			return {
				state: "waiting",
				reason: "A current, verified IDX close is unavailable.",
			};
		}
		const index = await getOrFetchHistory("^JKSE", {
			range: "2y",
			interval: "1d",
		});
		const benchmark = Object.fromEntries(
			(index.series?.points ?? []).flatMap(({ t, c }) => {
				const date = completedIdxSession(jakartaDate(t * 1000), now);
				return date && date <= session && c > 0 && Number.isFinite(c)
					? [[date, c]]
					: [];
			}),
		);
		if (!(session in benchmark))
			return {
				state: "waiting",
				reason: "IHSG closing history has not reached this session.",
			};

		const db = await createAdminClient();
		const daily = new Map<string, DailyBar>();
		const universe = new Map<
			string,
			{
				symbol: string;
				sector: string;
				close: number;
				turnover: number;
				change: number;
			}
		>();
		let rejected = 0;
		for (const row of snapshot.data) {
			if (
				!symbolPattern.test(row.StockCode) ||
				completedIdxSession(row.Date, now) !== session ||
				!Number.isFinite(row.Close) ||
				row.Close <= 0 ||
				!Number.isFinite(row.Change) ||
				!Number.isFinite(row.Value) ||
				row.Value < 0 ||
				universe.has(row.StockCode)
			) {
				rejected++;
				continue;
			}
			const {
				StockCode: symbol,
				Close: close,
				Value: turnover,
				Change: change,
			} = row;
			universe.set(symbol, {
				symbol,
				close,
				turnover,
				change,
				sector: getIdxSector(symbol, row.StockName),
			});
			const parsed = dailyBarSchema.safeParse({
				symbol,
				session,
				provider: "idx",
				adjustment: "observed",
				open: row.OpenPrice,
				high: row.High,
				low: row.Low,
				close,
				volume: row.Volume,
				turnover,
				foreign_net:
					Number.isFinite(row.ForeignBuy) && Number.isFinite(row.ForeignSell)
						? calculateNetFlow([row])
						: null,
				discontinuity: false,
				retrieved_at: snapshot.retrievedAt ?? now,
			});
			if (parsed.success) daily.set(symbol, parsed.data);
			else rejected++;
		}
		if (!universe.size)
			return {
				state: "waiting",
				reason: "No valid IDX instruments were received.",
			};
		await saveBars(db, [...daily.values()]);
		const symbols = [...universe.keys()];
		const history = await readBars(db, symbols, session);
		const ordered = [...universe.values()]
			.map((stock) => {
				const last20 = (history[stock.symbol] ?? [])
					.filter((bar) => bar.provider === "idx" && bar.turnover != null)
					.slice(-20);
				return {
					...stock,
					priority:
						last20.length === 20
							? last20.reduce((sum, bar) => sum + bar.turnover!, 0) / 20
							: stock.turnover,
				};
			})
			.sort(
				(a, b) => b.priority - a.priority || a.symbol.localeCompare(b.symbol),
			);
		const attempts =
			(await redis.get<Record<string, string>>(progressKey)) ?? {};
		const retryCutoff = new Date(Date.parse(now) - 86_400_000).toISOString();
		const batch = ordered
			.filter(
				({ symbol }) =>
					(history[symbol] ?? []).filter((bar) => bar.provider === "yahoo")
						.length < 520 &&
					(!attempts[symbol] || attempts[symbol] < retryCutoff),
			)
			.sort((a, b) =>
				(attempts[a.symbol] ?? "").localeCompare(attempts[b.symbol] ?? ""),
			)
			.slice(0, 10);
		let backfillFailures = 0;
		for (let i = 0; i < batch.length; i += 5) {
			await Promise.all(
				batch.slice(i, i + 5).map(async ({ symbol }) => {
					try {
						const observed = await yahooBars(symbol, new Date().toISOString());
						await saveBars(db, observed);
						history[symbol] = [
							...(history[symbol] ?? []).filter(
								(bar) => bar.provider === "idx",
							),
							...observed,
						];
					} catch (error) {
						backfillFailures++;
						console.warn("[IDX Research] Backfill failed", symbol, error);
					} finally {
						attempts[symbol] = now;
					}
				}),
			);
			await redis.set(
				progressKey,
				Object.fromEntries(
					symbols
						.filter((symbol) => attempts[symbol])
						.map((symbol) => [symbol, attempts[symbol]]),
				),
			);
		}
		const evaluated = evaluateIdxResearch(
			[...universe.values()],
			history,
			benchmark,
			session,
		);
		const check = researchSnapshotSchema.parse(evaluated);
		const saved = await db
			.from("market_research_snapshots")
			.upsert(
				{ session, version: IDX_RESEARCH_VERSION, evidence: check },
				{ onConflict: "session,version", ignoreDuplicates: true },
			)
			.select("evidence")
			.maybeSingle();
		if (saved.error) throw saved.error;
		let original = saved.data;
		if (!original) {
			const existing = await db
				.from("market_research_snapshots")
				.select("evidence")
				.eq("session", session)
				.eq("version", IDX_RESEARCH_VERSION)
				.single();
			if (existing.error) throw existing.error;
			original = existing.data;
		}
		await redis.set(
			researchKey,
			researchSnapshotSchema.parse(original?.evidence),
		);
		await recordOutcomes(db, history, Object.keys(benchmark).sort(), session);
		const pruned = await db.rpc("prune_idx_research_bars", { symbols });
		if (pruned.error) throw pruned.error;
		return {
			state: "ready",
			session,
			retrievedAt: snapshot.retrievedAt,
			universe: symbols.length,
			rejected,
			covered: Object.values(check.results).filter(
				(item) => item.criteria.history === "pass",
			).length,
			backfillBatch: batch.length,
			backfillFailures,
			previouslyAttempted: Object.keys(attempts).length,
		};
	} finally {
		await redis
			.eval(
				"if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) end return 0",
				[batchLock],
				[token],
			)
			.catch(() => {});
	}
}

export async function syncIdxResearch() {
	const status = await runIdxResearch().catch((error: unknown) => {
		console.error("[IDX Research] Sync failed", error);
		return {
			state: "error",
			reason:
				"Research sync failed. Check the job logs and database migration.",
		};
	});
	if (status.state !== "busy")
		await redis
			.set(idxResearchStatusKey, {
				...status,
				checkedAt: new Date().toISOString(),
			})
			.catch(() => {});
	return status;
}
