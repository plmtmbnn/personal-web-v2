import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import AdventuresView from "./View";

export const metadata: Metadata = createMetadata({
	title: "Personal Adventures",
	description:
		"Exploring the intersection of endurance and aesthetics. A collection of physical journeys and visual stories.",
	path: "/adventures",
	keywords: [
		"Intentional Running",
		"Travel Stories",
		"Photography",
		"Personal Growth",
		"Endurance",
	],
});

export default function AdventuresPage() {
	return <AdventuresView />;
}
