import { BROWSER_USER_AGENT, buildFetchInit } from "./http";
import type { FetchPolicy } from "./types";

interface DefiLlamaChartPoint {
	date?: number | string;
	totalCirculating?: {
		peggedUSD?: number;
	};
	totalCirculatingUSD?: {
		peggedUSD?: number;
	};
}

/**
 * Fetch historical aggregate stablecoin market cap from DefiLlama.
 * Computes the 30-day percentage change in stablecoin supply.
 */
export async function fetchStablecoinSupply30d(
	policy: FetchPolicy,
): Promise<{ totalUsd: number; change30dPct: number } | null> {
	const url = "https://stablecoins.llama.fi/stablecoincharts/all";

	try {
		const res = await fetch(
			url,
			buildFetchInit(policy, {
				"User-Agent": BROWSER_USER_AGENT,
				Accept: "application/json",
			}),
		);

		if (!res.ok) {
			console.warn(`[DefiLlama] API error: ${res.status}`);
			return null;
		}

		const data = (await res.json()) as DefiLlamaChartPoint[];
		if (!Array.isArray(data) || data.length < 35) {
			return null;
		}

		// Filter valid points with peggedUSD
		const validPoints: Array<{ date: number; usd: number }> = [];
		for (const pt of data) {
			const usd =
				pt.totalCirculating?.peggedUSD ?? pt.totalCirculatingUSD?.peggedUSD;
			if (typeof usd === "number" && Number.isFinite(usd) && usd > 0) {
				const dateNum =
					typeof pt.date === "number"
						? pt.date
						: typeof pt.date === "string"
							? Math.floor(new Date(pt.date).getTime() / 1000)
							: 0;
				validPoints.push({ date: dateNum, usd });
			}
		}

		if (validPoints.length < 31) return null;

		const latest = validPoints[validPoints.length - 1];
		// Target point ~30 days prior (approx 30 entries if daily, or find by timestamp)
		const targetSeconds = latest.date - 30 * 86400;
		let priorPoint = validPoints[validPoints.length - 31];

		// Find closest point to 30 days ago
		for (let i = validPoints.length - 1; i >= 0; i--) {
			if (validPoints[i].date <= targetSeconds) {
				priorPoint = validPoints[i];
				break;
			}
		}

		if (!priorPoint || priorPoint.usd <= 0) return null;

		const change30dPct = ((latest.usd - priorPoint.usd) / priorPoint.usd) * 100;

		return {
			totalUsd: latest.usd,
			change30dPct,
		};
	} catch (e) {
		console.warn("[DefiLlama] Failed to fetch stablecoin stats:", e);
		return null;
	}
}
