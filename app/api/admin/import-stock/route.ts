import { NextResponse } from "next/server";
import { checkAdmin } from "@/features/auth/actions";
import { saveStockData, getStockData, redis, CACHE_KEYS } from "@/lib/core/redis";

export async function GET() {
	try {
		const isAdmin = await checkAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const data = await getStockData();
		
		return NextResponse.json({
			available: !!data && data.length > 0,
			count: data ? data.length : 0,
			lastDate: data && data.length > 0 ? data[0].Date : null,
		});
	} catch (error: any) {
		console.error("Stock Status API Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 },
		);
	}
}

export async function DELETE() {
	try {
		const isAdmin = await checkAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await redis.del(CACHE_KEYS.STOCK_SUMMARY);
		await redis.del("idx:last-fetch-attempt");

		return NextResponse.json({
			success: true,
			message: "Stock cache and fetch cooldown successfully cleared from Redis.",
		});
	} catch (error: any) {
		console.error("Stock Clear API Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 },
		);
	}
}

export async function POST(req: Request) {
	try {
		// Security: Only admins can import data
		const isAdmin = await checkAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { data } = body;

		if (!data || !Array.isArray(data)) {
			return NextResponse.json(
				{ error: "Invalid data structure. Expected { data: [] }" },
				{ status: 400 },
			);
		}

		const success = await saveStockData(data);

		if (!success) {
			throw new Error("Failed to save to Redis");
		}

		return NextResponse.json({
			success: true,
			message: `Successfully imported ${data.length} instruments to Redis.`,
		});
	} catch (error: any) {
		console.error("Stock Import API Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 },
		);
	}
}

