import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import UtilsView from "./View";

export const metadata: Metadata = createMetadata({
	title: "Adventure Utilities",
	description:
		"High-fidelity tools designed to optimize physical performance and operational logistics during personal missions.",
	path: "/utils",
	keywords: [
		"Running Timer",
		"Investment Calculator",
		"Operational Tools",
		"Performance Optimization",
	],
});

export default function UtilsPage() {
	return <UtilsView />;
}
