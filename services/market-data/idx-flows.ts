import { redis } from "@/lib/core/redis";
import type { FetchPolicy } from "./types";
import { getStockData, saveStockData } from "@/lib/core/redis";
import type { IDXStock } from "@/features/utils/stock-tools/stock-explorer/types";

export interface IhsgForeignFlowSnapshot {
	netBuySell1dIdr?: number | null;
	netBuySell5dIdr?: number | null;
	streakDays?: number | null;
	asOf?: string;
}

const FLOW_HISTORY_KEY = "idx:flow:history";

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
		// 1. Get today's market summary (relies on stock-explorer background fetch or cache)
		let stocksData = await getStockData();

		// Standalone fallback: If Redis is empty, fetch directly from IDX
		if (!stocksData || stocksData.length === 0) {
			let body: any = null;
			try {
				const { gotScraping } = await import("got-scraping");
				const res = await gotScraping({
					url: "https://www.idx.co.id/primary/TradingSummary/GetStockSummary",
					headers: {
						referer: "https://www.idx.co.id/",
						accept: "application/json",
					},
					responseType: "json",
					timeout: { request: 15000 },
				});
				if (res.statusCode === 200 && res.body) body = res.body;
			} catch (scrapeError) {
				console.warn("got-scraping failed in idx-flows:", scrapeError);
			}

			if (!body) {
				const res = await fetch(
					"https://www.idx.co.id/primary/TradingSummary/GetStockSummary",
					{
						headers: {
							Referer: "https://www.idx.co.id/",
							"User-Agent":
								"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
							Accept: "application/json",
						},
						signal: AbortSignal.timeout(8000),
					},
				);
				if (res.ok) body = await res.json();
			}

			if (body && Array.isArray(body.data) && body.data.length > 0) {
				await saveStockData(body.data, 43200);
				stocksData = body.data;
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

		return {
			netBuySell1dIdr: effective1dNet,
			netBuySell5dIdr,
			streakDays,
			asOf: effectiveDateStr,
		};
	} catch (error) {
		console.warn("IHSG Foreign Flow fetch failed:", error);
		return null;
	}
}
