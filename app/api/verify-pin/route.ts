import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { ENV_GLOBAL } from "@/lib/core/env";
import { verifySync } from "otplib";
import {
	createSession,
	getAuthSession,
	updateSessionPinAuth,
} from "@/lib/core/redis";

/**
 * Redis & Ratelimit Configuration
 * Standardized using ENV_GLOBAL architectural pattern.
 */
const redis =
	ENV_GLOBAL?.UPSTASH_REDIS_REST_URL && ENV_GLOBAL?.UPSTASH_REDIS_REST_TOKEN
		? new Redis({
				url: ENV_GLOBAL.UPSTASH_REDIS_REST_URL,
				token: ENV_GLOBAL.UPSTASH_REDIS_REST_TOKEN,
			})
		: null;

const ratelimit = redis
	? new Ratelimit({
			redis: redis,
			limiter: Ratelimit.slidingWindow(5, "10 m"),
			analytics: true,
			prefix: "@upstash/ratelimit/pinguard",
		})
	: null;

/**
 * PIN Verification Endpoint with Rate Limiting & Centralized Session Synchronization
 */
export async function POST(request: Request) {
	try {
		// 1. Sliding Window Rate Limiting (5 attempts / 10 minutes)
		if (ratelimit) {
			const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
			const { success, limit, reset, remaining } = await ratelimit.limit(ip);

			if (!success) {
				return NextResponse.json(
					{ error: "Too many attempts. Please try again in 10 minutes." },
					{
						status: 429,
						headers: {
							"X-RateLimit-Limit": limit.toString(),
							"X-RateLimit-Remaining": remaining.toString(),
							"X-RateLimit-Reset": reset.toString(),
						},
					},
				);
			}
		}

		// 2. PIN Validation
		const { pin } = await request.json();

		if (pin?.length !== 6) {
			return NextResponse.json(
				{ error: "Invalid PIN format" },
				{ status: 400 },
			);
		}

		const secret = ENV_GLOBAL?.TOTP_SECRET;

		if (!secret) {
			console.error("TOTP_SECRET is not configured");
			return NextResponse.json(
				{ error: "Server configuration error" },
				{ status: 500 },
			);
		}

		const result = verifySync({ token: pin, secret });

		if (!result.valid) {
			return NextResponse.json(
				{ authenticated: false, error: "Incorrect Authenticator Code" },
				{ status: 401 },
			);
		}

		// 3. Centralized Session Integration
		// When PIN is valid, update existing session (e.g. Serial mode Step 2)
		// or establish a new verified session (e.g. PIN-only mode).
		const cookieStore = await cookies();
		let sessionId = cookieStore.get("app_session")?.value;

		if (sessionId) {
			const existingSession = await getAuthSession(sessionId);
			if (existingSession) {
				await updateSessionPinAuth(sessionId);
			} else {
				// Re-create session if metadata was missing
				sessionId = await createSession("pin-admin", {
					isAdmin: true,
					pinAuthenticated: true,
					mode: "pin_only",
				});
				cookieStore.set("app_session", sessionId, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "lax",
					maxAge: 604800 * 30, // 30 weeks
					path: "/",
				});
			}
		} else {
			// No existing session: create a new session with PIN verified (PIN-only flow)
			sessionId = await createSession("pin-admin", {
				isAdmin: true,
				pinAuthenticated: true,
				mode: "pin_only",
			});
			cookieStore.set("app_session", sessionId, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 604800 * 30, // 30 weeks
				path: "/",
			});
		}

		return NextResponse.json({ authenticated: true });
	} catch (error) {
		console.error("PIN Verification Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
