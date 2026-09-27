import { type NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/core/redis";

const TTL = 2592000; // 30 Days in seconds
const MAX_ENDPOINTS = 15;
const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

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
					enableRateLimit: !!data?.enableRateLimit,
				};
			}),
		);

		return NextResponse.json(mocks, {
			headers: {
				"X-Active-Mocks": String(mocks.length),
				"X-Max-Mocks": String(MAX_ENDPOINTS),
			},
		});
	} catch (error) {
		console.error("Manage Mock GET Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch mocks" },
			{ status: 500 },
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const { method, path, status, body, enableRateLimit } = await req.json();

		if (!method || !path || status === undefined || status === null) {
			return NextResponse.json(
				{ error: "Missing required fields (method, path, status)" },
				{ status: 400 },
			);
		}

		const upperMethod = String(method).toUpperCase();
		if (!ALLOWED_METHODS.includes(upperMethod)) {
			return NextResponse.json(
				{
					error: `Invalid HTTP method "${method}". Allowed methods: ${ALLOWED_METHODS.join(", ")}`,
				},
				{ status: 400 },
			);
		}

		if (typeof path !== "string" || !path.trim()) {
			return NextResponse.json(
				{ error: "Endpoint path is required" },
				{ status: 400 },
			);
		}

		const trimmedPath = path.trim();
		const formattedPath = trimmedPath.startsWith("/")
			? trimmedPath
			: `/${trimmedPath}`;

		if (formattedPath === "/") {
			return NextResponse.json(
				{
					error:
						"Endpoint path cannot be root '/'. Please provide a descriptive subpath (e.g. /v1/users)",
				},
				{ status: 400 },
			);
		}

		if (formattedPath.length > 100) {
			return NextResponse.json(
				{ error: "Endpoint path is too long (maximum 100 characters)" },
				{ status: 400 },
			);
		}

		if (/\s/.test(formattedPath)) {
			return NextResponse.json(
				{ error: "Endpoint path cannot contain spaces" },
				{ status: 400 },
			);
		}

		if (/[?#]/.test(formattedPath)) {
			return NextResponse.json(
				{
					error:
						"Endpoint path cannot contain query parameters (?) or fragments (#)",
				},
				{ status: 400 },
			);
		}

		if (formattedPath.includes("//")) {
			return NextResponse.json(
				{
					error: "Endpoint path cannot contain consecutive slashes (//)",
				},
				{ status: 400 },
			);
		}

		const validPathRegex = /^\/[a-zA-Z0-9_\-/]+$/;
		if (!validPathRegex.test(formattedPath)) {
			return NextResponse.json(
				{
					error:
						"Endpoint path can only contain alphanumeric characters, hyphens (-), underscores (_), and slashes (/)",
				},
				{ status: 400 },
			);
		}

		const numericStatus = Number(status);
		if (
			!Number.isInteger(numericStatus) ||
			numericStatus < 100 ||
			numericStatus > 599
		) {
			return NextResponse.json(
				{ error: "HTTP status code must be an integer between 100 and 599" },
				{ status: 400 },
			);
		}

		// Body payload size validation (max 64KB)
		let serializedBody: string;
		try {
			serializedBody = typeof body === "string" ? body : JSON.stringify(body);
		} catch (_e) {
			return NextResponse.json(
				{ error: "Response body could not be serialized" },
				{ status: 400 },
			);
		}

		if (serializedBody.length > 65536) {
			return NextResponse.json(
				{ error: "Response body payload too large (maximum 64 KB)" },
				{ status: 400 },
			);
		}

		const redisKey = `mock:${upperMethod}:${formattedPath}`;

		// Active endpoints limit check: max 15
		const existsCount = await redis.exists(redisKey);
		const isExisting = existsCount > 0;

		if (!isExisting) {
			const keys = await redis.keys("mock:*");
			if (keys.length >= MAX_ENDPOINTS) {
				return NextResponse.json(
					{
						error: `Maximum limit of ${MAX_ENDPOINTS} active endpoints reached. Please delete an existing mock before deploying a new one.`,
						code: "LIMIT_REACHED",
						currentCount: keys.length,
						max: MAX_ENDPOINTS,
					},
					{ status: 400 },
				);
			}
		}

		await redis.set(
			redisKey,
			{ status: numericStatus, body, enableRateLimit: !!enableRateLimit },
			{ ex: TTL },
		);

		return NextResponse.json({
			success: true,
			key: redisKey,
			url: `/api/mock${formattedPath}`,
			isUpdate: isExisting,
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
		return NextResponse.json(
			{ error: "Failed to delete mock" },
			{ status: 500 },
		);
	}
}
