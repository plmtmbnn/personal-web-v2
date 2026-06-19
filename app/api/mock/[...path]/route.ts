import { type NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/core/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Dynamic Mock API Catch-all Route
 * Path: /api/mock/[...path]
 */

const ratelimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/mock",
}) : null;

export async function GET(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return handleMockRequest(req, params.path);
}

export async function POST(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return handleMockRequest(req, params.path);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return handleMockRequest(req, params.path);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return handleMockRequest(req, params.path);
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return handleMockRequest(req, params.path);
}

async function handleMockRequest(req: NextRequest, pathArray: string[]) {
  try {
    const method = req.method;
    const path = "/" + pathArray.join("/");
    const redisKey = `mock:${method}:${path}`;

    const data = await redis.get<{
      status: number;
      body: any;
      enableRateLimit?: boolean;
    }>(redisKey);

    if (!data) {
      return NextResponse.json(
        { error: "Mock endpoint not found", method, path },
        { 
          status: 404,
          headers: { "Access-Control-Allow-Origin": "*" }
        }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (data.enableRateLimit && ratelimit) {
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
      const { success, limit, reset, remaining } = await ratelimit.limit(`${redisKey}:${ip}`);

      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Rate limit exceeded." },
          {
            status: 429,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }

      headers["X-RateLimit-Limit"] = limit.toString();
      headers["X-RateLimit-Remaining"] = remaining.toString();
      headers["X-RateLimit-Reset"] = reset.toString();
    }

    return new NextResponse(
      typeof data.body === "string" ? data.body : JSON.stringify(data.body),
      {
        status: data.status || 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Mock API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { 
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      }
    );
  }
}

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
