import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import InsightsView from "@/features/insights/components/View";

export const metadata: Metadata = createMetadata({
	title: "Insights Hub",
	description:
		"A curated nexus of fintech system architecture, financial sentiment intelligence, Liverpool FC matchday analytics, and developer toolkits.",
	path: "/insights",
	keywords: [
		"Insights",
		"Engineering Notes",
		"Fintech Architecture",
		"Investment Intelligence",
		"Fear and Greed Index",
		"Liverpool FC Hub",
		"Developer Utilities",
		"Knowledge Base",
	],
});

export default function InsightsPage() {
	return <InsightsView />;
}
