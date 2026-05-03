import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import CsvToJsonView from "./View";

export const metadata: Metadata = createMetadata({
	title: "Advanced CSV to JSON Converter",
	description:
		"Convert CSV data to JSON objects with support for header detection, custom separators, and nested object transformation using dot notation.",
	path: "/utils/csv-to-json",
	keywords: [
		"CSV to JSON",
		"Data Converter",
		"CSV Parser",
		"JSON Generator",
		"PapaParse",
		"Developer Tools",
	],
});

export default function CsvToJsonPage() {
	return <CsvToJsonView />;
}
