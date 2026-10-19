import type { Metadata } from "next";
import { Suspense } from "react";
import { createMetadata } from "@/lib/shared/metadata";
import RunningView, {
	RunningSkeleton,
} from "@/features/adventures/running/components/View";
import { getCachedStravaData } from "@/services/strava/service";

// Edge cache with ISR — revalidate running activity log at most once every 5 minutes
export const revalidate = 300;

export const metadata: Metadata = createMetadata({
	title: "Endurance Journey | Running",
	description:
		"Tracking physical limits and mental discipline. 1000KM+ yearly running goals and personal milestones.",
	path: "/adventures/running",
	keywords: [
		"Marathon Training",
		"Running Metrics",
		"Consistency",
		"Endurance Sports",
		"Intentional Running",
	],
});

export default async function RunningPage() {
	const stravaData = await getCachedStravaData();
	return (
		<Suspense fallback={<RunningSkeleton />}>
			<RunningView initialData={stravaData} />
		</Suspense>
	);
}
