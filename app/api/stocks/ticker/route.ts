import { NextResponse } from "next/server";
import { redis } from "@/lib/core/redis";

export const dynamic = "force-dynamic";

const CNBC_URL =
	"https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=.HSI%7C.NSEI%7C.NZ50%7C.KLSE%7C.TWII%7C.N225%7C.AXJO%7C.SSEC%7C.SZI%7C.KS11%7C.SETI%7C.STI%7C.IECNCGP%7CSGD%3D%7CCNY%3D%7CAUD%3D%7CINR%3D%7CNZD%3D%7CJPY%3D%7CHKD%3D%7CEURJPY%3D%7C%40LCO.1%7C%40CL.1%7C%40NG.1%7C%40HG.1&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1";

const REDIS_TICKER_KEY = "ticker:stock-quotes";

const FALLBACK_STOCKS = [
	{
		symbol: ".N225",
		shortName: "Nikkei 225",
		exchange: "Tokyo",
		change: "+285.40",
		change_pct: "+0.73%",
		last: "39,120.50",
	},
	{
		symbol: ".HSI",
		shortName: "Hang Seng",
		exchange: "Hong Kong",
		change: "-142.10",
		change_pct: "-0.81%",
		last: "17,410.20",
	},
	{
		symbol: ".JKSE",
		shortName: "IHSG",
		exchange: "Jakarta",
		change: "+45.30",
		change_pct: "+0.61%",
		last: "7,425.80",
	},
	{
		symbol: ".SSEC",
		shortName: "Shanghai Comp",
		exchange: "Shanghai",
		change: "+12.80",
		change_pct: "+0.42%",
		last: "3,050.15",
	},
	{
		symbol: "SGD=",
		shortName: "USD/SGD",
		exchange: "Forex",
		change: "-0.002",
		change_pct: "-0.15%",
		last: "1.348",
	},
];

export async function GET() {
	try {
		// 1. Try server-side fetch from CNBC using native fetch to avoid browser CORS
		const response = await fetch(CNBC_URL, {
			headers: {
				Referer: "https://www.cnbc.com/",
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
				Accept: "application/json, text/plain, */*",
			},
			signal: AbortSignal.timeout(8000),
		});

		if (response.ok) {
			const body = (await response.json()) as any;
			const quotes = body?.FormattedQuoteResult?.FormattedQuote;

			if (Array.isArray(quotes) && quotes.length > 0) {
				// Cache to Redis for 60 seconds
				try {
					await redis.set(REDIS_TICKER_KEY, JSON.stringify(quotes), {
						ex: 60,
					});
				} catch (e) {
					console.warn("Failed to set Redis ticker cache:", e);
				}

				return NextResponse.json({ stocks: quotes });
			}
		}
	} catch (err) {
		console.warn(
			"Server fetch from CNBC failed, attempting Redis cache fallback...",
			err,
		);
	}

	// 2. Try Redis cache if available
	try {
		const cached = await redis.get(REDIS_TICKER_KEY);
		if (cached) {
			const quotes = typeof cached === "string" ? JSON.parse(cached) : cached;
			if (Array.isArray(quotes) && quotes.length > 0) {
				return NextResponse.json({ stocks: quotes });
			}
		}
	} catch (e) {
		console.warn("Redis fallback error:", e);
	}

	// 3. Fallback to default stock quotes if server fetch and Redis fail
	return NextResponse.json({ stocks: FALLBACK_STOCKS });
}
