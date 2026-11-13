import type { Metadata } from "next";
import { Suspense } from "react";
import { createMetadata } from "@/lib/shared/metadata";
import { SITE, SEO } from "@/lib/shared/constants";
import HomeView from "@/features/home/components/HomeView";
import HomeSkeleton from "@/features/home/components/HomeSkeleton";
import { getCachedAthleteStats } from "@/services/strava/service";

// Edge cache with ISR: revalidate athlete stats at most once every hour
export const revalidate = 3600;

export const metadata: Metadata = createMetadata({
	title: "Polma Tambunan | Software Engineer & Distance Runner",
	description: SITE.description,
	path: "/",
	keywords: SEO.baseKeywords,
});

async function HomeDataWrapper() {
	let runningKm: number | null = null;
	try {
		const stats = await getCachedAthleteStats();
		if (stats?.ytd_run_totals?.distance) {
			runningKm = Math.round(stats.ytd_run_totals.distance / 1000);
		}
	} catch (err) {
		console.error("Error fetching running stats for home page:", err);
	}

	return <HomeView initialRunningKm={runningKm} />;
}

export default function HomePage() {
	return (
		<Suspense fallback={<HomeSkeleton />}>
			<HomeDataWrapper />
		</Suspense>
	);
}
