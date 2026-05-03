import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import JsonFormatterView from "./View";

export const metadata: Metadata = createMetadata({
	title: "JSON Formatter & Beautifier",
	description:
		"Developer-centric JSON tool to beautify, minify, and validate JSON strings with real-time feedback and syntax highlighting.",
	path: "/utils/json-formatter",
	keywords: [
		"JSON Formatter",
		"JSON Beautifier",
		"JSON Minifier",
		"JSON Validator",
		"Developer Tools",
		"Next.js",
	],
});

export default function JsonFormatterPage() {
	return <JsonFormatterView />;
}
