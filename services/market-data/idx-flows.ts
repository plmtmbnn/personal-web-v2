import {
	redis,
	getStockData,
	saveStockData,
	updateTickerHistoryRingBuffer,
} from "@/lib/core/redis";
import type { FetchPolicy } from "./types";
import type { IDXStock } from "@/features/utils/stock-tools/stock-explorer/types";
import { processIdxMarketData } from "@/features/utils/stock-tools/stock-explorer/hooks/useMarketData";
import type { IhsgAlphaCandidate } from "@/features/investment/types";

export interface IhsgForeignFlowSnapshot {
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

/**
 * Synchronizes IDX stock summary from peoel-screener-py, caching to Redis
 * and updating the 10-trading-day ring buffer.
 */
export async function syncIdxStockSummary(force = false): Promise<{
	success: boolean;
	count: number;
	error?: string;
}> {
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
			await Promise.allSettled([
				saveStockData(body.data, 43200),
				updateTickerHistoryRingBuffer(body.data),
			]);
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
		let stocksData = await getStockData();

		if (!stocksData || stocksData.length === 0 || _policy?.fresh) {
			const syncResult = await syncIdxStockSummary(Boolean(_policy?.fresh));
			if (syncResult.success) {
				stocksData = await getStockData();
			}
		}

		if (!stocksData || stocksData.length === 0) return null;

		const todayNetIdr = calculateNetFlow(stocksData);

		// 1b. Determine true trading session date from payload
		let sessionDateStr = "";
		const rawPayloadDate = stocksData[0]?.Date;
		if (rawPayloadDate && typeof rawPayloadDate === "string") {
			const clean = rawPayloadDate.split("T")[0];
			if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
				sessionDateStr = clean;
			}
		}

		// Fallback to Jakarta timezone wall-clock if payload date is absent
		const now = new Date();
		const wibFormatter = new Intl.DateTimeFormat("en-US", {
			timeZone: "Asia/Jakarta",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "numeric",
			hour12: false,
		});
		const parts = wibFormatter.formatToParts(now);
		const currentYear = parts.find((p) => p.type === "year")?.value;
		const currentMonth = parts.find((p) => p.type === "month")?.value;
		const currentDay = parts.find((p) => p.type === "day")?.value;
		const currentWibDateStr = `${currentYear}-${currentMonth}-${currentDay}`;
		const wibHour = parseInt(
			parts.find((p) => p.type === "hour")?.value ?? "0",
			10,
		);

		if (!sessionDateStr) {
			sessionDateStr = currentWibDateStr;
		}

		// Enforce active trading session guard: if session date matches today's Jakarta date,
		// only record into history once market opens at 09:00 WIB
		const isToday = sessionDateStr === currentWibDateStr;
		const isSessionActiveOrClosed = !isToday || wibHour >= 9;

		// Validate that session date is not a weekend and market has opened if today
		const sessionDayOfWeek = new Date(
			`${sessionDateStr}T12:00:00Z`,
		).getUTCDay();
		const isTradingDay =
			sessionDayOfWeek !== 0 &&
			sessionDayOfWeek !== 6 &&
			isSessionActiveOrClosed;

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
			if (dayOfWeek === 0 || dayOfWeek === 6) {
				delete historyMap[d];
			}
		}

		// 3. Update history on valid trading day session
		if (isTradingDay) {
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
		let liquidAdvancersPct = 50;
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
						s.CompositeScore >= 55,
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
					rrr: plan?.riskRewardRatio || 2.0,
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
			topAlphaPicks,
		};
	} catch (error) {
		console.warn("IHSG Foreign Flow fetch failed:", error);
		return null;
	}
}
