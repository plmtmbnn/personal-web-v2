import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import { PERSON_SCHEMA, SITE, SEO } from "@/lib/shared/constants";
import HomeView from "@/features/home/components/HomeView";
import { getAthleteStats } from "@/services/strava/service";

// Edge cache with ISR — revalidate athlete stats at most once every hour
export const revalidate = 3600;

export const metadata: Metadata = createMetadata({
	title: "Polma Tambunan | Software Engineer & Distance Runner",
	description: SITE.description,
	path: "/",
	keywords: SEO.baseKeywords,
});

export default async function HomePage() {
	let runningKm = 1000;
	try {
		const stats = await getAthleteStats();
		if (stats?.ytd_run_totals?.distance) {
			runningKm = Math.round(stats.ytd_run_totals.distance / 1000);
		}
	} catch (err) {
		console.error("Error fetching running stats for home page:", err);
	}

	return (
		<>
			{/* Person JSON-LD — signals Google Knowledge Panel & rich results */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_SCHEMA) }}
			/>
			<HomeView initialRunningKm={runningKm} />
		</>
	);
}
