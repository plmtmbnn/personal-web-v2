import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import dynamic from "next/dynamic";

const JsonToCsvView = dynamic(
	() => import("@/features/utils/file-tools/json-to-csv/components/View"),
);

export const metadata: Metadata = createMetadata({
	title: "JSON to CSV Converter",
	description:
		"Convert complex and nested JSON objects into clean, downloadable CSV tables with automatic dot notation flattening, custom delimiters, and live tabular preview.",
	path: "/utils/json-to-csv",
	keywords: [
		"JSON to CSV",
		"Data Converter",
		"JSON Flattener",
		"CSV Generator",
		"Dot Notation",
		"Developer Tools",
	],
});

export default function JsonToCsvPage() {
	return <JsonToCsvView />;
}
