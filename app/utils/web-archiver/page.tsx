import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import WebArchiverView from "@/features/utils/web-tools/web-archiver/components/View";

export const metadata: Metadata = createMetadata({
	title: "Web Archiver",
	description:
		"Scrape articles from URLs, clean the content, convert to Markdown, and archive directly into your Second Brain.",
	path: "/utils/web-archiver",
	keywords: [
		"Web Archiver",
		"Read-It-Later",
		"Scrape Web Page",
		"HTML to Markdown",
		"Second Brain Import",
		"Developer Tools",
	],
});

export default function WebArchiverPage() {
	return <WebArchiverView />;
}
