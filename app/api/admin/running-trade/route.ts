import { NextResponse } from "next/server";
import { z } from "zod";
import { checkAdmin } from "@/features/auth/actions";
import { MARKET_BOARDS } from "@/features/running-trade/types";
import { resolveMarketCredentials } from "@/features/swing-trade/credentials/server";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

const bodySchema = z.object({
	baseUrl: z.string().optional().default(""),
	token: z.string().optional().default(""),
	symbol: z.string().regex(/^[A-Za-z0-9]{1,10}$/),
	marketBoard: z.enum(MARKET_BOARDS),
	minimumLot: z.number().int().min(0),
	valueFrom: z.number().min(0),
	limit: z.number().int().min(1).max(1000),
	tradeNumber: z.string().regex(/^\d+$/).optional(),
});

export async function POST(req: Request) {
	if (!(await checkAdmin())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const parsed = bodySchema.safeParse(await req.json().catch(() => null));
	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.issues.map((i) => i.message).join("; ") },
			{ status: 400 },
		);
	}
	const b = parsed.data;

	const creds = await resolveMarketCredentials(b.baseUrl, b.token);
	if (!creds) {
		return NextResponse.json(
			{
				error:
					"Market API credentials (Base URL and Token) are required. Configure them in Redis.",
			},
			{ status: 400 },
		);
	}

	const params = new URLSearchParams({
		symbols: b.symbol.toUpperCase(),
		action_type: "RUNNING_TRADE_ACTION_TYPE_ALL",
		market_board: b.marketBoard,
		investor_type: "RUNNING_TRADE_INVESTOR_TYPE_ALL",
		minimum_lot: String(b.minimumLot),
		value_from: String(b.valueFrom),
		sort: "ASC",
		limit: String(b.limit),
		order_by: "RUNNING_TRADE_ORDER_BY_TIME",
	});
	if (b.tradeNumber) params.set("trade_number", b.tradeNumber);

	const url = `${creds.baseUrl}/order-trade/running-trade?${params}`;

	try {
		const upstream = await fetch(url, {
			method: "GET",
			headers: {
				authorization: `Bearer ${creds.token}`,
				accept: "application/json",
				"cache-control": "no-cache",
				pragma: "no-cache",
				"user-agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
			},
			signal: AbortSignal.timeout(20_000),
		});

		const bodyText = await upstream.text();
		let payload: unknown = null;
		try {
			payload = JSON.parse(bodyText);
		} catch {}

		if (!upstream.ok) {
			const json = payload as { message?: string; error?: string } | null;
			const detail =
				json?.message ??
				json?.error ??
				upstream.statusText ??
				(bodyText ? bodyText.slice(0, 100).replace(/\s+/g, " ") : "");
			// Body snippet shows whether a CDN/WAF challenge page answered instead of the API.
			console.warn(
				"Running trade upstream rejected:",
				upstream.status,
				detail,
				bodyText.slice(0, 200).replace(/\s+/g, " "),
			);
			if (upstream.status === 429) {
				const retryAfter = Number(upstream.headers.get("retry-after"));
				return NextResponse.json(
					{
						error: "Upstream 429: Too Many Requests",
						retryAfterSeconds: Number.isFinite(retryAfter)
							? retryAfter
							: undefined,
					},
					{ status: 429 },
				);
			}
			return NextResponse.json(
				{
					error: `Upstream ${upstream.status}${detail ? `: ${detail}` : ""}`,
				},
				{ status: 502 },
			);
		}

		// Guards against a cache or upstream bug answering with another ticker's rows.
		const wanted = b.symbol.toUpperCase();
		const rows =
			(payload as { data?: { running_trade?: { code?: string }[] } } | null)
				?.data?.running_trade ?? [];
		const other = rows.find((r) => r.code && r.code.toUpperCase() !== wanted);
		if (other) {
			console.warn("Running trade ticker mismatch:", wanted, "got", other.code);
			return NextResponse.json(
				{ error: `Upstream returned ${other.code} rows for ${wanted}` },
				{ status: 502 },
			);
		}
		return NextResponse.json(payload);
	} catch (e) {
		// Only the error name and cause code are exposed; the token and URL stay out of logs and responses.
		const code =
			(e as { cause?: { code?: string } }).cause?.code ??
			(e instanceof Error ? e.name : "unknown");
		console.error("Running trade proxy failed:", code);
		return NextResponse.json(
			{ error: `Could not reach upstream API (${code})` },
			{ status: 502 },
		);
	}
}
