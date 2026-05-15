import { type NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/core/redis";

/**
 * Dynamic Mock API Catch-all Route
 * Path: /api/mock/[...path]
 */

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

    return new NextResponse(
      typeof data.body === "string" ? data.body : JSON.stringify(data.body),
      {
        status: data.status || 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
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
