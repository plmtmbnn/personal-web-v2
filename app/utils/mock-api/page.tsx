import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import MockApiView from "./View";

export const metadata: Metadata = createMetadata({
	title: "Dynamic Mock API Engine",
	description:
		"Create and manage dynamic mock API endpoints with custom responses and status codes.",
	path: "/utils/mock-api",
	keywords: [
		"Mock API",
		"Developer Tools",
		"API Testing",
		"JSON Mock",
		"Redis",
	],
});

export default function MockApiPage() {
	return <MockApiView />;
}
