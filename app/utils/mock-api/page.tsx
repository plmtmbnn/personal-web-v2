import type { Metadata } from "next";
import { connection } from "next/server";
import { createMetadata } from "@/lib/shared/metadata";
import MockApiView from "@/features/utils/data-tools/mock-api/components/View";
import { requireAuth } from "@/features/auth/server";

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

export default async function MockApiPage() {
	await connection();
	await requireAuth({ requireAdmin: true, redirectTo: "/utils/mock-api" });
	return <MockApiView />;
}
