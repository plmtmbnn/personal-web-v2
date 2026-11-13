import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { inspectExternalRedirect } from "@/lib/server/url-security";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
	url: z.string().trim().min(1).max(2048),
});

/**
 * Server API route to safely follow HTTP redirects and unmask shortened URLs without executing client JS.
 */
export async function POST(request: NextRequest) {
	try {
		const parsed = requestSchema.safeParse(
			await request.json().catch(() => null),
		);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Missing or invalid 'url' parameter" },
				{ status: 400 },
			);
		}
		const targetUrl = parsed.data.url;

		let currentUrl = targetUrl.trim();
		if (!/^https?:\/\//i.test(currentUrl)) {
			currentUrl = `https://${currentUrl}`;
		}

		const redirectChain: string[] = [currentUrl];
		let finalUrl = currentUrl;
		let hops = 0;
		const maxHops = 6;

		while (hops < maxHops) {
			try {
				const response = await inspectExternalRedirect(currentUrl);
				const locationHeader = response.location;
				if (response.status >= 300 && response.status < 400 && locationHeader) {
					const nextUrl = new URL(locationHeader, currentUrl).toString();
					if (hops === maxHops - 1) break;
					redirectChain.push(nextUrl);
					currentUrl = nextUrl;
					finalUrl = nextUrl;
					hops++;
				} else {
					break;
				}
			} catch {
				return NextResponse.json(
					{ error: "Unable to inspect a public HTTP or HTTPS URL" },
					{ status: 400 },
				);
			}
		}

		return NextResponse.json({
			originalUrl: targetUrl,
			unmaskedUrl: finalUrl,
			redirectChain,
			hopsCount: hops,
		});
	} catch (error: unknown) {
		console.error("Failed to unmask URL redirects:", error);
		return NextResponse.json(
			{ error: "Failed to unmask URL redirects" },
			{ status: 500 },
		);
	}
}
