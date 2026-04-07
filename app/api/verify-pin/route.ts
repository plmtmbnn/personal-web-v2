import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { ENV_GLOBAL } from '@/lib/env';

/**
 * Redis & Ratelimit Configuration
 * Standardized using ENV_GLOBAL architectual pattern.
 */
const redis = (ENV_GLOBAL?.UPSTASH_REDIS_REST_URL && ENV_GLOBAL?.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: ENV_GLOBAL.UPSTASH_REDIS_REST_URL,
      token: ENV_GLOBAL.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const ratelimit = redis ? new Ratelimit({
	redis: redis,
	limiter: Ratelimit.slidingWindow(5, '10 m'),
	analytics: true,
	prefix: '@upstash/ratelimit/pinguard',
}) : null;

/**
 * PIN Verification Endpoint with Rate Limiting
 */
export async function POST(request: Request) {
	try {
    // Architectural Guard: If Redis is not configured, bypass rate limiting (or fail shut if preferred)
    if (ratelimit) {
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
    }

		// 2. PIN Validation
		const { pin } = await request.json();

		if (!pin || pin.length !== 6) {
			return NextResponse.json({ error: 'Invalid PIN format' }, { status: 400 });
		}

		const requiredPin = ENV_GLOBAL?.NEXT_PUBLIC_PAGE_PIN;

		if (pin === requiredPin) {
			return NextResponse.json({ authenticated: true });
		}

		return NextResponse.json({ authenticated: false, error: 'Incorrect PIN' }, { status: 401 });
	} catch (error) {
		console.error('PIN Verification Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
