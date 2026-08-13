import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server API route to safely follow HTTP redirects and unmask shortened URLs without executing client JS.
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const targetUrl = body?.url;

		if (!targetUrl || typeof targetUrl !== "string") {
			return NextResponse.json(
				{ error: "Missing or invalid 'url' parameter" },
				{ status: 400 },
			);
		}

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
				const response = await fetch(currentUrl, {
					method: "HEAD",
					redirect: "manual",
					headers: {
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
					},
					signal: AbortSignal.timeout(4000),
				});

				const locationHeader = response.headers.get("location");
				if (
					(response.status >= 300 && response.status < 400) &&
					locationHeader
				) {
					// Resolve relative redirects
					const nextUrl = new URL(locationHeader, currentUrl).toString();
					redirectChain.push(nextUrl);
					currentUrl = nextUrl;
					finalUrl = nextUrl;
					hops++;
				} else {
					// Reached final destination
					break;
				}
			} catch (_e) {
				// If HEAD request fails, break loop and return current reached URL
				break;
			}
		}

		return NextResponse.json({
			originalUrl: targetUrl,
			unmaskedUrl: finalUrl,
			redirectChain,
			hopsCount: hops,
		});
	} catch (error: any) {
		return NextResponse.json(
			{ error: "Failed to unmask URL redirects", details: error?.message },
			{ status: 500 },
		);
	}
}
