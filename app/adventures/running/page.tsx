import type { Metadata } from "next";
import { Suspense } from "react";
import { createMetadata } from "@/lib/shared/metadata";
import RunningView, {
	RunningSkeleton,
} from "@/features/adventures/running/components/View";
import { getCachedStravaData } from "@/services/strava/service";

// Edge cache with ISR: revalidate running activity log at most once every 5 minutes
export const revalidate = 300;

export const metadata: Metadata = createMetadata({
	title: "Running Performance",
	description: "Recent Strava runs, running totals, and personal records.",
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
