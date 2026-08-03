import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import HomeView from "@/features/home/components/HomeView";
import { getAthleteStats } from "@/services/strava/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
	title: "Polma Tambunan | Software Engineer & Fintech Expert",
	description:
		"Specializing in building secure, high-performance software for the global fintech landscape. Thoughtful Engineering. Intentional Running.",
	path: "/",
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

	return <HomeView initialRunningKm={runningKm} />;
}
