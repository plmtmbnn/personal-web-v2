import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import RunningView from "./View";

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

export default function RunningPage() {
	return <RunningView />;
}
