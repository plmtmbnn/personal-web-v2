import { NextResponse } from "next/server";
import { getActivitySplits } from "@/services/strava/service";

export const dynamic = "force-dynamic";

interface RouteContext {
	params: Promise<{
		id: string;
	}>;
}

export async function GET(
	_request: Request,
	context: RouteContext,
) {
	try {
		const { id } = await context.params;
		const activityId = Number.parseInt(id, 10);

		if (!activityId || Number.isNaN(activityId)) {
			return NextResponse.json(
				{ error: "Invalid activity ID." },
				{ status: 400 },
			);
		}

		const splits = await getActivitySplits(activityId);

		return NextResponse.json({
			success: true,
			activityId,
			splits: splits || [],
		});
	} catch (error: any) {
		console.error("[Strava Activity Splits API Error]:", error);
		return NextResponse.json(
			{ error: error?.message || "Failed to fetch activity splits." },
			{ status: 500 },
		);
	}
}