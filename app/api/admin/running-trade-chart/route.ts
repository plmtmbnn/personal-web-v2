import { NextResponse } from "next/server";
import { z } from "zod";
import { checkAdmin } from "@/features/auth/actions";
import { resolveMarketCredentials } from "@/features/swing-trade/credentials/server";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

const bodySchema = z.object({
	baseUrl: z.string().optional().default(""),
	token: z.string().optional().default(""),
	symbol: z
		.string()
		.regex(/^[A-Za-z0-9]{1,10}$/, "Valid ticker symbol required"),
	period: z.string().default("RT_PERIOD_LAST_3_MONTHS"),
	investorType: z.string().default("INVESTOR_TYPE_ALL"),
	marketBoard: z.string().default("BOARD_TYPE_REGULAR"),
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

	const {
		baseUrl: reqBaseUrl,
		token: reqToken,
		symbol,
		period,
		investorType,
		marketBoard,
	} = parsed.data;

	const creds = await resolveMarketCredentials(reqBaseUrl, reqToken);
	if (!creds) {
		return NextResponse.json(
			{
				error:
					"Market API credentials (Base URL and Token) are required. Configure them in Redis.",
			},
			{ status: 400 },
		);
	}

	const symbolUpper = symbol.toUpperCase();

	const params = new URLSearchParams({
		period,
		investor_type: investorType,
		market_board: marketBoard,
	});

	const url = `${creds.baseUrl}/order-trade/running-trade/chart/${symbolUpper}?${params.toString()}`;

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
			signal: AbortSignal.timeout(30_000),
		});

		const bodyText = await upstream.text();
		let json: unknown = null;
		try {
			json = JSON.parse(bodyText);
		} catch {
			json = null;
		}

		if (upstream.status === 429) {
			const retryHeader = upstream.headers.get("retry-after");
			const retryAfterSeconds = retryHeader
				? Number.parseInt(retryHeader, 10)
				: 10;
			return NextResponse.json(
				{
					error:
						(json as { message?: string })?.message ??
						"Rate limit exceeded. Try again shortly.",
					retryAfterSeconds: Number.isFinite(retryAfterSeconds)
						? retryAfterSeconds
						: 10,
				},
				{ status: 429 },
			);
		}

		if (!upstream.ok) {
			const errMsg =
				(json as { message?: string; error?: string })?.message ??
				(json as { message?: string; error?: string })?.error ??
				`Upstream returned status ${upstream.status}`;
			return NextResponse.json({ error: errMsg }, { status: upstream.status });
		}

		if (!json) {
			return NextResponse.json(
				{ error: "Upstream returned non-JSON response" },
				{ status: 502 },
			);
		}

		return NextResponse.json(json, { status: 200 });
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Failed to connect to upstream API";
		return NextResponse.json({ error: message }, { status: 502 });
	}
}
