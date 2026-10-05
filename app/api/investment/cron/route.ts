import { NextResponse } from "next/server";
import { runRegimeAlerts } from "@/services/notifications/cron";

/**
 * API Route for triggering daily market regime alerts.
 * Secured via CRON_SECRET header if provided.
 */
export async function GET(request: Request) {
	const authHeader = request.headers.get("Authorization");
	const { searchParams } = new URL(request.url);
	const secret =
		searchParams.get("secret") || authHeader?.replace("Bearer ", "");

	const CRON_SECRET = process.env.CRON_SECRET;

	// Security check: Fail shut if CRON_SECRET is not configured or secret is invalid
	if (!CRON_SECRET || secret !== CRON_SECRET) {
		console.warn("[API Cron] Unauthorized attempt blocked.");
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		await runRegimeAlerts();
		return NextResponse.json({
			success: true,
			message: "Regime alerts dispatched.",
		});
	} catch (error: any) {
		console.error("[API Cron] Failure:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
