import type { Metadata } from "next";
import { Suspense } from "react";
import { createMetadata } from "@/lib/shared/metadata";
import LiverpoolView, {
	LiverpoolSkeleton,
} from "@/features/liverpool/components/View";

import { getLiverpoolFixturesStatic } from "@/features/liverpool/actions";

export const revalidate = 3600;

export const metadata: Metadata = createMetadata({
	title: "Liverpool FC | Matchday Hub",
	description:
		"Liverpool FC's next fixture, kickoff in your local time, venue, and a matchday countdown.",
	path: "/liverpool",
	keywords: [
		"Liverpool FC",
		"LFC Fixtures",
		"Liverpool Schedule",
		"Premier League",
		"Champions League",
		"Anfield",
		"Matchday",
		"YNWA",
	],
});

export default async function LiverpoolPage() {
	const initialData = await getLiverpoolFixturesStatic();
	return (
		<Suspense fallback={<LiverpoolSkeleton />}>
			<LiverpoolView initialData={initialData} />
		</Suspense>
	);
}
