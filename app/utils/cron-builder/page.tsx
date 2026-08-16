import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import CronBuilderView from "@/features/utils/time-tools/cron-builder/components/View";

export const metadata: Metadata = createMetadata({
	title: "Cron Expression Builder & Humanizer - Visual Cron Generator",
	description:
		"Interactive visual cron schedule builder and plain-English translator. Generate cron expressions, simulate future execution timelines in local/UTC, and export snippets for GitHub Actions, Vercel, and Kubernetes.",
	path: "/utils/cron-builder",
	keywords: [
		"Cron Expression Builder",
		"Cron Humanizer",
		"Cron Generator",
		"Crontab Generator",
		"Cron Schedule",
		"Vercel Cron",
		"GitHub Actions Cron",
		"Kubernetes CronJob",
		"Developer Tools",
		"Schedule Generator",
	],
});

export default function CronBuilderPage() {
	return <CronBuilderView />;
}
