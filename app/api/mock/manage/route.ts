import { type NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/core/redis";

const TTL = 604800; // 7 Days in seconds

export async function GET() {
  try {
    const keys = await redis.keys("mock:*");
    if (keys.length === 0) {
      return NextResponse.json([]);
    }

    const mocks = await Promise.all(
      keys.map(async (key) => {
        const data = await redis.get<any>(key);
        // Key format: mock:METHOD:PATH
        const parts = key.split(":");
        const method = parts[1];
        const path = parts.slice(2).join(":"); // Rejoin path in case it contains colons

        return {
          key,
          method,
          path,
          status: data?.status || 200,
          body: data?.body || {},
        };
      })
    );

    return NextResponse.json(mocks);
  } catch (error) {
    console.error("Manage Mock GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch mocks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { method, path, status, body } = await req.json();

    if (!method || !path || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure path starts with /
    const formattedPath = path.startsWith("/") ? path : `/${path}`;
    const redisKey = `mock:${method.toUpperCase()}:${formattedPath}`;

    await redis.set(redisKey, { status, body }, { ex: TTL });

    return NextResponse.json({ 
      success: true, 
      key: redisKey,
      url: `/api/mock${formattedPath}` 
    });
  } catch (error) {
    console.error("Manage Mock POST Error:", error);
    return NextResponse.json({ error: "Failed to save mock" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    await redis.del(key);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Manage Mock DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete mock" }, { status: 500 });
  }
}
