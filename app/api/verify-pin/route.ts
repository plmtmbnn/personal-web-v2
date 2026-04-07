import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * Redis & Ratelimit Configuration
 * Moving logic from middleware to route handler to avoid middleware deprecation issues.
 */
const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL!,
	token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.slidingWindow(5, '10 m'), // 5 attempts per 10 minutes
	analytics: true,
	prefix: '@upstash/ratelimit/pinguard',
});

/**
 * PIN Verification Endpoint with Rate Limiting
 */
export async function POST(request: Request) {
	try {
		// 1. Rate Limiting based on IP
		// In Next.js App Router, we can get IP from headers if needed, 
		// but middleware is usually better for 'request.ip'.
		// Since we moved it here, we'll try to get IP from headers.
		const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
		const { success, limit, reset, remaining } = await ratelimit.limit(ip);

		if (!success) {
			return NextResponse.json(
				{ error: 'Too many attempts. Please try again in 10 minutes.' }, 
				{ 
					status: 429,
					headers: {
						'X-RateLimit-Limit': limit.toString(),
						'X-RateLimit-Remaining': remaining.toString(),
						'X-RateLimit-Reset': reset.toString(),
					}
				}
			);
		}

		// 2. PIN Validation
		const { pin } = await request.json();

		if (!pin || pin.length !== 6) {
			return NextResponse.json({ error: 'Invalid PIN format' }, { status: 400 });
		}

		const requiredPin = process.env.NEXT_PUBLIC_PAGE_PIN;

		if (pin === requiredPin) {
			return NextResponse.json({ authenticated: true });
		}

		return NextResponse.json({ authenticated: false, error: 'Incorrect PIN' }, { status: 401 });
	} catch (error) {
		console.error('PIN Verification Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
