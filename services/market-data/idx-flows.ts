import {
	redis,
	getStockData,
	getStockDataSnapshot,
	saveStockData,
	updateTickerHistoryRingBuffer,
} from "@/lib/core/redis";
import {
	completedIdxSession,
	idxEvidence,
	latestCompletedIdxSession,
	sessionDate,
	jakartaDate,
} from "./provenance";
import type { FetchPolicy, RetrievedMarketData } from "./types";
import type { IDXStock } from "@/features/utils/stock-tools/stock-explorer/types";
import { processIdxMarketData } from "@/features/utils/stock-tools/stock-explorer/hooks/useMarketData";
import type { IhsgAlphaCandidate } from "@/features/investment/types";

export interface IhsgForeignFlowSnapshot extends RetrievedMarketData {
	netBuySell1dIdr?: number | null;
	netBuySell5dIdr?: number | null;
	streakDays?: number | null;
	asOf?: string;
	advancers?: number;
	decliners?: number;
	unchanged?: number;
	liquidAdvancersPct?: number;
	topAlphaPicks?: IhsgAlphaCandidate[];
}

export const PEOEL_STOCK_SUMMARY_URL =
	process.env.PEOEL_SCREENER_SUMMARY_URL ||
	"https://peoel-screener-py.vercel.app/api/v1/stock-summary";

const FLOW_HISTORY_KEY = "idx:flow:history";
const COMPLETED_SUMMARY_KEY = "idx:stock-summary:completed:v4";
let pendingSync: Promise<{
	success: boolean;
	count: number;
	error?: string;
}> | null = null;

/**
 * Synchronizes IDX stock summary from peoel-screener-py, caching to Redis
 * and updating the 10-trading-day ring buffer.
 */
export async function syncIdxStockSummary(force = false): Promise<{
	success: boolean;
	count: number;
	error?: string;
}> {
	if (pendingSync) return pendingSync;
	pendingSync = syncSummary(force);
	try {
		return await pendingSync;
	} finally {
		pendingSync = null;
	}
}

async function syncSummary(
	force: boolean,
): Promise<{ success: boolean; count: number; error?: string }> {
	try {
		if (!force) {
			const existing = await getStockData();
			if (existing && existing.length > 0) {
				return { success: true, count: existing.length };
			}
		}

		const res = await fetch(PEOEL_STOCK_SUMMARY_URL, {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(15000),
		});

		if (!res.ok) {
			return {
				success: false,
				count: 0,
				error: `peoel-screener-py HTTP ${res.status}`,
			};
		}

		const body = (await res.json()) as any;
		if (body && Array.isArray(body.data) && body.data.length > 0) {
			const now = new Date().toISOString();
			const date = sessionDate(body.data[0]?.Date);
			if (
				!date ||
				date > jakartaDate(now) ||
				!body.data.every(
					(stock: IDXStock) =>
						sessionDate(stock.Date) === date &&
						[
							stock.Close,
							stock.ForeignBuy,
							stock.ForeignSell,
							stock.Volume,
							stock.Value,
						].every(Number.isFinite),
				)
			) {
				return {
					success: false,
					count: 0,
					error: "Invalid stock summary session or numeric fields",
				};
			}
			const [saved] = await Promise.allSettled([
				saveStockData(body.data, 43200, "live"),
				updateTickerHistoryRingBuffer(body.data),
			]);
			if (saved.status === "rejected" || !saved.value)
				return { success: false, count: 0, error: "Stock cache save failed" };
			if (completedIdxSession(date, now)) {
				const previous = await redis.get<{ data: IDXStock[] }>(
					COMPLETED_SUMMARY_KEY,
				);
				if (!previous || (sessionDate(previous.data?.[0]?.Date) ?? "") <= date)
					await redis.set(COMPLETED_SUMMARY_KEY, {
						data: body.data,
						origin: "cache",
						retrievedAt: now,
					});
			}
			return { success: true, count: body.data.length };
		}

		return { success: false, count: 0, error: "Empty or invalid stock data" };
	} catch (e: any) {
		console.warn(
			"peoel-screener-py fetch failed in idx-flows:",
			e?.message || e,
		);
		return { success: false, count: 0, error: e?.message || String(e) };
	}
}

/**
 * Calculates net foreign flow (IDR) from a raw IDXStock payload.
 */
export function calculateNetFlow(stocks: IDXStock[]): number {
	let totalNet = 0;
	for (const stock of stocks) {
		const vwap =
			stock.Volume > 0
				? stock.Value / stock.Volume
				: stock.Close || stock.Previous || 0;
		// IDX live API sometimes returns volume in shares, sometimes nominal value. We check the scale.
		const isForeignNominalValue = stock.ForeignBuy > stock.Volume * 5;

		const foreignNetVol = isForeignNominalValue
			? vwap > 0
				? Math.round((stock.ForeignBuy - stock.ForeignSell) / vwap)
				: 0
			: stock.ForeignBuy - stock.ForeignSell;

		const foreignNet = isForeignNominalValue
			? stock.ForeignBuy - stock.ForeignSell
			: foreignNetVol * vwap;

		totalNet += foreignNet;
	}
	return totalNet;
}

/**
 * Calculates streak days. Positive = inflow streak, Negative = outflow streak.
 */
export function calculateStreak(history: number[]): number {
	if (history.length === 0) return 0;
	let streak = 0;
	const isPositive = history[0] > 0;

	for (const flow of history) {
		if (isPositive && flow > 0) {
			streak++;
		} else if (!isPositive && flow < 0) {
			streak--;
		} else {
			break;
		}
	}
	return streak;
}

/**
 * Fetches current IHSG foreign flow and builds a historical streak using Redis.
 */
export async function fetchIhsgForeignFlow(
	_policy: FetchPolicy,
): Promise<IhsgForeignFlowSnapshot | null> {
	try {
		// 1. Get today's market summary, syncing from peoel-screener-py if empty or fresh requested
		let snapshot = await getStockDataSnapshot();
		const now = new Date().toISOString();
		const expected = latestCompletedIdxSession(now);
		if (
			!snapshot ||
			_policy.fresh ||
			(sessionDate(snapshot.data[0]?.Date) ?? "") < expected
		) {
			await syncIdxStockSummary(true);
			snapshot = await getStockDataSnapshot();
		}
		if (!completedIdxSession(snapshot?.data[0]?.Date, now)) {
			const completed = await redis.get<{
				data: IDXStock[];
				retrievedAt: string;
			}>(COMPLETED_SUMMARY_KEY);
			if (completed) snapshot = { ...completed, origin: "backup" };
		}
		const sessionDateStr = completedIdxSession(snapshot?.data[0]?.Date, now);
		if (!sessionDateStr || !snapshot || snapshot.origin === "unknown")
			return null;
		const stocksData = snapshot.data.filter(
			(s) =>
				completedIdxSession(s.Date, now) === sessionDateStr &&
				Number.isFinite(s.Close) &&
				Number.isFinite(s.ForeignBuy) &&
				Number.isFinite(s.ForeignSell),
		);
		if (!stocksData.length) return null;
		const todayNetIdr = calculateNetFlow(stocksData);

		// 2. Fetch history from Redis
		let historyMap: Record<string, number> = {};
		try {
			const cachedHistory =
				await redis.get<Record<string, number>>(FLOW_HISTORY_KEY);
			if (cachedHistory) {
				historyMap =
					typeof cachedHistory === "string"
						? JSON.parse(cachedHistory)
						: cachedHistory;
			}
		} catch (e) {
			console.warn("Failed to read flow history from Redis", e);
		}

		// Prune any legacy weekend entries to preserve true trading day streak
		for (const d of Object.keys(historyMap)) {
			const dayOfWeek = new Date(`${d}T12:00:00Z`).getUTCDay();
			if (
				dayOfWeek === 0 ||
				dayOfWeek === 6 ||
				!completedIdxSession(d, now) ||
				d > sessionDateStr ||
				!Number.isFinite(historyMap[d])
			) {
				delete historyMap[d];
			}
		}

		// 3. Update history on valid trading day session
		if (!(sessionDateStr in historyMap)) {
			historyMap[sessionDateStr] = todayNetIdr;

			// Keep only last 10 trading days to prevent unbound growth
			const sortedDates = Object.keys(historyMap).sort((a, b) =>
				a > b ? -1 : 1,
			);
			if (sortedDates.length > 10) {
				const prunedMap: Record<string, number> = {};
				for (let i = 0; i < 10; i++) {
					prunedMap[sortedDates[i]] = historyMap[sortedDates[i]];
				}
				historyMap = prunedMap;
			}

			// Save updated history
			await redis.set(FLOW_HISTORY_KEY, JSON.stringify(historyMap));
		}

		// 4. Calculate metrics from trading day history
		const sortedDates = Object.keys(historyMap).sort((a, b) =>
			a > b ? -1 : 1,
		);
		const recentFlows = sortedDates.slice(0, 5).map((date) => historyMap[date]);
		const streakDays = calculateStreak(
			sortedDates.map((date) => historyMap[date]),
		);
		const netBuySell5dIdr = recentFlows.reduce((sum, val) => sum + val, 0);
		const effectiveDateStr =
			sortedDates.length > 0 ? sortedDates[0] : sessionDateStr;
		const effective1dNet =
			sortedDates.length > 0 ? historyMap[sortedDates[0]] : todayNetIdr;

		// 5. Extract live breadth & institutional alpha shortlist from stocksData
		let advancers = 0;
		let decliners = 0;
		let unchanged = 0;
		let liquidAdvancersPct: number | undefined;
		let topAlphaPicks: IhsgAlphaCandidate[] = [];

		try {
			const { processed, marketHealth } = processIdxMarketData(stocksData, {
				price: 25,
				volume: 25,
				foreign: 25,
				liquidity: 15,
				volatility: 10,
			});
			advancers = marketHealth.advancers;
			decliners = marketHealth.decliners;
			unchanged = marketHealth.unchanged;

			const liquidStocks = processed.filter(
				(s) => (s.Value || 0) >= 1_000_000_000,
			);
			if (liquidStocks.length > 0) {
				const liqUp = liquidStocks.filter((s) => s.Change > 0).length;
				liquidAdvancersPct = Math.round((liqUp / liquidStocks.length) * 100);
			}

			// Select top institutional liquid setups (Turnover >= Rp 5B, safe from ARB)
			const candidates = processed
				.filter(
					(s) =>
						(s.Value || 0) >= 5_000_000_000 &&
						s.ARARisk !== "ARB" &&
						s.ARARisk !== "Near ARB" &&
						s.CompositeScore >= 55 &&
						s.TradePlan?.netRiskRewardRatio != null,
				)
				.sort(
					(a, b) =>
						b.CompositeScore * 10 +
						(b.ForeignParticipationPct || 0) -
						(a.CompositeScore * 10 + (a.ForeignParticipationPct || 0)),
				)
				.slice(0, 8);

			topAlphaPicks = candidates.map((s) => {
				const plan = s.TradePlan;
				const entryZone =
					plan && plan.entryLow !== plan.entryHigh
						? `Rp ${plan.entryLow.toLocaleString("id-ID")} - ${plan.entryHigh.toLocaleString("id-ID")}`
						: `Rp ${(s.Close || 0).toLocaleString("id-ID")}`;

				return {
					code: s.StockCode,
					name: s.StockName,
					sector: s.Sector,
					close: s.Close,
					changePct: Number(s.ChangePct.toFixed(2)),
					valueIdr: s.Value,
					foreignNetIdr: s.ForeignNet,
					foreignParticipationPct: s.ForeignParticipationPct || 0,
					compositeScore: s.CompositeScore,
					opportunity: s.Opportunity,
					setupBucket: plan?.setupBucket || "swing",
					entryZone,
					stopLoss: plan?.stopLoss || Math.round(s.Close * 0.96),
					target1: plan?.target1 || Math.round(s.Close * 1.06),
					rrr: plan?.netRiskRewardRatio ?? 0,
				};
			});
		} catch (e) {
			console.warn("Failed to compute IDX alpha shortlist in idx-flows:", e);
		}

		return {
			netBuySell1dIdr: effective1dNet,
			netBuySell5dIdr,
			streakDays,
			asOf: effectiveDateStr,
			advancers,
			decliners,
			unchanged,
			liquidAdvancersPct,
			topAlphaPicks:
				idxEvidence(sessionDateStr, now, snapshot.origin).status === "current"
					? topAlphaPicks
					: [],
			origin: snapshot.origin,
			retrievedAt: snapshot.retrievedAt ?? undefined,
		};
	} catch (error) {
		console.warn("IHSG Foreign Flow fetch failed:", error);
		return null;
	}
}
