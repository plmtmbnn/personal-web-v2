import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import CaseConverterView from "./View";

export const metadata: Metadata = createMetadata({
	title: "Universal Case Converter",
	description:
		"Developer utility to convert variable names and JSON keys between camelCase, PascalCase, snake_case, and kebab-case recursively.",
	path: "/utils/case-converter",
	keywords: [
		"Case Converter",
		"JSON Key Converter",
		"camelCase",
		"snake_case",
		"PascalCase",
		"kebab-case",
		"Developer Tools",
	],
});

export default function CaseConverterPage() {
	return <CaseConverterView />;
}
