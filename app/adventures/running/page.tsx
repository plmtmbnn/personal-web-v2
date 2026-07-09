import type { Metadata } from "next";
import { Suspense } from "react";
import { createMetadata } from "@/lib/shared/metadata";
import RunningView from "@/features/adventures/running/components/View";
import { getStravaData } from "@/services/strava/service";
import { checkAdmin } from "@/features/auth/actions";

export const dynamic = "force-dynamic";

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
	const [stravaData, isAdmin] = await Promise.all([
		getStravaData(),
		checkAdmin(),
	]);
	return (
		<Suspense>
			<RunningView initialData={stravaData} isAdmin={isAdmin} />
		</Suspense>
	);
}
