import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import WorkExperienceView from "./View";

export const metadata: Metadata = createMetadata({
	title: "Professional Experience",
	description:
		"8+ years architecting secure fintech ecosystems and leading high-performance engineering cultures. CTO & Head of Engineering experience.",
	path: "/work-experience",
	keywords: [
		"CTO",
		"Head of Engineering",
		"Fintech Architecture",
		"Software Engineering Manager",
		"Java",
		"TypeScript",
		"Microservices",
	],
});

export default function WorkExperiencePage() {
	return <WorkExperienceView />;
}
