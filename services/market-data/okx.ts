import { BROWSER_USER_AGENT, buildFetchInit } from "./http";
import type { FetchPolicy } from "./types";

interface OkxFundingResponse {
	code: string;
	data?: Array<{
		fundingRate?: string;
		nextFundingRate?: string;
		fundingTime?: string;
	}>;
}

interface OkxOiResponse {
	code: string;
	data?: Array<{
		oi?: string;
		oiCcy?: string;
		ts?: string;
	}>;
}

/**
 * Fetch BTC Perpetual swap funding rate and open interest from OKX public endpoints.
 */
export async function fetchOkxCryptoMetrics(policy: FetchPolicy): Promise<{
	fundingRate8hPct: number | null;
	openInterestUsd: number | null;
}> {
	const fundingUrl =
		"https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USDT-SWAP";
	const oiUrl =
		"https://www.okx.com/api/v5/public/open-interest?instType=SWAP&instId=BTC-USDT-SWAP";

	const fetchOptions = buildFetchInit(policy, {
		"User-Agent": BROWSER_USER_AGENT,
		Accept: "application/json",
	});

	let fundingRate8hPct: number | null = null;
	let openInterestUsd: number | null = null;

	try {
		const [fundingRes, oiRes] = await Promise.allSettled([
			fetch(fundingUrl, { ...fetchOptions, signal: AbortSignal.timeout(6000) }),
			fetch(oiUrl, { ...fetchOptions, signal: AbortSignal.timeout(6000) }),
		]);

		if (fundingRes.status === "fulfilled" && fundingRes.value.ok) {
			const json = (await fundingRes.value.json()) as OkxFundingResponse;
			const rateStr = json?.data?.[0]?.fundingRate;
			if (rateStr) {
				const num = parseFloat(rateStr);
				if (Number.isFinite(num)) {
					fundingRate8hPct = num * 100; // e.g. 0.0001 -> 0.01%
				}
			}
		}

		if (oiRes.status === "fulfilled" && oiRes.value.ok) {
			const json = (await oiRes.value.json()) as OkxOiResponse;
			const oiStr = json?.data?.[0]?.oiCcy; // oi in coin or USD
			if (oiStr) {
				const num = parseFloat(oiStr);
				if (Number.isFinite(num) && num > 0) {
					openInterestUsd = num;
				}
			}
		}
	} catch (e) {
		console.warn("[OKX] Failed to fetch crypto metrics:", e);
	}

	// Fallback to CoinGecko public derivatives endpoint if OKX was blocked (e.g. Indonesian ISP DNS filter)
	if (fundingRate8hPct == null || openInterestUsd == null) {
		try {
			const cgRes = await fetch(
				"https://api.coingecko.com/api/v3/derivatives",
				{
					headers: {
						"User-Agent": BROWSER_USER_AGENT,
						Accept: "application/json",
					},
					cache: "no-store",
					signal: AbortSignal.timeout(6000),
				},
			);

			if (cgRes.ok) {
				const items = (await cgRes.json()) as Array<{
					market?: string;
					symbol?: string;
					index_id?: string;
					funding_rate?: number;
					open_interest?: number;
				}>;

				if (Array.isArray(items)) {
					const btcItem = items.find(
						(i) => i.index_id === "BTC" || i.symbol === "BTCUSDT",
					);
					if (btcItem) {
						if (
							fundingRate8hPct == null &&
							btcItem.funding_rate != null &&
							Number.isFinite(btcItem.funding_rate)
						) {
							fundingRate8hPct = btcItem.funding_rate;
						}
						if (
							openInterestUsd == null &&
							btcItem.open_interest != null &&
							Number.isFinite(btcItem.open_interest)
						) {
							openInterestUsd = btcItem.open_interest;
						}
					}
				}
			}
		} catch (e) {
			console.warn("[Derivatives] CoinGecko fallback fetch error:", e);
		}
	}

	return {
		fundingRate8hPct,
		openInterestUsd,
	};
}
