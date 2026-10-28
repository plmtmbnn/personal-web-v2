import { NextResponse } from "next/server";
import { z } from "zod";
import { checkAdmin } from "@/features/auth/actions";
import { resolveMarketCredentials } from "@/features/swing-trade/credentials/server";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

const bodySchema = z.object({
	baseUrl: z.string().optional().default(""),
	token: z.string().optional().default(""),
	symbol: z.string().regex(/^[A-Za-z0-9]{1,10}$/),
	period: z.string().default("HS_PERIOD_DAILY"),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	limit: z.number().int().min(1).max(500).default(50),
	page: z.number().int().min(1).default(1),
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

	const symbolUpper = b.symbol.toUpperCase();
	const params = new URLSearchParams({
		period: b.period,
		start_date: b.startDate,
		end_date: b.endDate,
		limit: String(b.limit),
		page: String(b.page),
	});

	const url = `${creds.baseUrl}/company-price-feed/historical/summary/${symbolUpper}?${params}`;

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

			console.warn(
				"Historical trade upstream rejected:",
				upstream.status,
				detail,
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

		return NextResponse.json(payload);
	} catch (e) {
		const code =
			(e as { cause?: { code?: string } }).cause?.code ??
			(e instanceof Error ? e.name : "unknown");
		console.error("Historical trade proxy failed:", code);
		return NextResponse.json(
			{ error: `Could not reach upstream API (${code})` },
			{ status: 502 },
		);
	}
}
