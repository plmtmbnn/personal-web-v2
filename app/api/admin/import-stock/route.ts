import { NextResponse } from "next/server";
import { checkAdmin } from "@/features/auth/actions";
import { saveStockData } from "@/lib/core/redis";

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
