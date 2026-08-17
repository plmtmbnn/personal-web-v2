import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import LiverpoolView from "@/features/liverpool/components/View";

export const metadata: Metadata = createMetadata({
	title: "Liverpool FC | Matchday Schedule & Fixtures",
	description:
		"Live upcoming Liverpool FC fixtures, match schedule, kickoff times in local timezone, stadiums, and broadcasters for the 2026/27 season.",
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

export default function LiverpoolPage() {
	return <LiverpoolView />;
}
