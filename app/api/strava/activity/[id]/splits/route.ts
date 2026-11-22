import { NextResponse } from "next/server";
import { getActivitySplits, getRecentRuns } from "@/services/strava/service";

export const dynamic = "force-dynamic";

interface RouteContext {
	params: Promise<{
		id: string;
	}>;
}

export async function GET(_request: Request, context: RouteContext) {
	try {
		const { id } = await context.params;
		const activityId = Number(id);

		if (
			!Number.isSafeInteger(activityId) ||
			activityId <= 0 ||
			String(activityId) !== id
		) {
			return NextResponse.json(
				{ error: "Invalid activity ID." },
				{ status: 400 },
			);
		}

		const recentRuns = await getRecentRuns(10);
		if (!recentRuns?.some((run) => run.id === activityId)) {
			return NextResponse.json(
				{ error: "Activity not found." },
				{ status: 404 },
			);
		}

		const splits = await getActivitySplits(activityId);

		return NextResponse.json({
			success: true,
			activityId,
			splits: splits || [],
		});
	} catch (error: unknown) {
		console.error("[Strava Activity Splits API Error]:", error);
		return NextResponse.json(
			{ error: "Failed to fetch activity splits." },
			{ status: 500 },
		);
	}
}
