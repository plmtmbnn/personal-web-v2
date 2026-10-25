import { NextResponse } from "next/server";
import { z } from "zod";
import { checkAdmin } from "@/features/auth/actions";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

const bodySchema = z.object({
	baseUrl: z
		.string()
		.url()
		.refine((u) => u.startsWith("https://"), "Base URL must use https"),
	token: z.string().min(1, "Token is required"),
	symbol: z
		.string()
		.regex(/^[A-Za-z0-9]{1,10}$/, "Valid ticker symbol required"),
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

	const { baseUrl, token, symbol } = parsed.data;

	const params = new URLSearchParams({
		symbol: symbol.toUpperCase(),
		time_interval: "1m",
		period: "DATE_PICKER_PERIOD_LATEST",
	});

	const url = `${baseUrl.replace(/\/+$/, "")}/order-trade/trade-book/chart?${params.toString()}`;

	try {
		const { gotScraping } = await import("got-scraping");
		const upstream = await gotScraping({
			url,
			headers: {
				authorization: `Bearer ${token}`,
				accept: "application/json",
				"cache-control": "no-cache",
				pragma: "no-cache",
			},
			responseType: "text",
			timeout: { request: 30_000 },
			throwHttpErrors: false,
			http2: false,
		});

		let json: unknown = null;
		try {
			json = JSON.parse(upstream.body);
		} catch {
			json = null;
		}

		if (upstream.statusCode === 429) {
			const retryHeader = upstream.headers["retry-after"];
			const retryAfterSeconds = retryHeader
				? Number.parseInt(
						Array.isArray(retryHeader) ? retryHeader[0] : retryHeader,
						10,
					)
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

		if (upstream.statusCode >= 400) {
			const errMsg =
				(json as { message?: string; error?: string })?.message ??
				(json as { message?: string; error?: string })?.error ??
				`Upstream returned status ${upstream.statusCode}`;
			return NextResponse.json(
				{ error: errMsg },
				{ status: upstream.statusCode },
			);
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
