import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import HomeView from "@/features/home/components/HomeView";
import { redis } from "@/lib/core/redis";

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
		const cached = await redis.get<any>("strava:stats");
		if (cached) {
			const stats = typeof cached === "string" ? JSON.parse(cached) : cached;
			if (stats?.ytd_run_totals?.distance) {
				runningKm = Math.round(stats.ytd_run_totals.distance / 1000);
			}
		}
	} catch (err) {
		console.error("Error reading running stats for home page from Redis:", err);
	}

	return <HomeView initialRunningKm={runningKm} />;
}
