import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import HomeView from "./HomeView";

export const metadata: Metadata = createMetadata({
	title: "Polma Tambunan | Software Engineer & Fintech Expert",
	description:
		"Specializing in building secure, high-performance software for the global fintech landscape. Thoughtful Engineering. Intentional Running.",
	path: "/",
});

export default function HomePage() {
	return <HomeView />;
}
