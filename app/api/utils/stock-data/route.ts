import { NextResponse } from "next/server";
import { getStockData } from "@/lib/core/redis";

export async function GET() {
	try {
		const data = await getStockData();

		if (!data) {
			return NextResponse.json(
				{ error: "No stock data available in Redis. Please import first." },
				{ status: 404 },
			);
		}

		return NextResponse.json({ data });
	} catch (error: any) {
		console.error("Stock Data Retrieval Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 },
		);
	}
}
