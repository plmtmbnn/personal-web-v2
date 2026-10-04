import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import FootballFormationView from "@/features/utils/fun-tools/football-formation/components/View";

export const metadata: Metadata = createMetadata({
	title: "Football Formation & Draft Studio",
	description:
		"Interactive tactical football board to draft players, design matchday formations (4-3-3, 4-2-3-1, 4-4-2), organize substitutes, and export high-resolution squad sheets.",
	path: "/utils/football-formation",
	keywords: [
		"Football Formation",
		"Football Tactics Board",
		"Soccer Lineup Builder",
		"Squad Draft Studio",
		"Football Lineup Generator",
		"Matchday Squad Sheet",
		"Developer Tools",
	],
});

export default function FootballFormationPage() {
	return <FootballFormationView />;
}
